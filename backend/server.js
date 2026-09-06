const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

app.use(cors());
app.use(express.json());

// 1. Analyze and sync a student's risk profile via ML Service
app.post('/api/students/:id/analyze', async (req, res) => {
  try {
    const { id } = req.params;
    const student = await prisma.studentProfile.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const mlPayload = {
      current_attendance: student.currentAttendance,
      attendance_trend: student.attendanceTrend,
      internal_marks: student.internalMarks,
      backlogs: student.backlogs,
      assignment_completion_rate: student.assignmentCompletionRate,
      lms_activity_score: student.lmsActivityScore
    };

    const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict`, mlPayload);
    const { risk_score, risk_category, reasons, recommended_interventions } = mlResponse.data;

    // Update Student Record & Create Risk Audit Log
    const updatedStudent = await prisma.studentProfile.update({
      where: { id },
      data: {
        riskScore: risk_score,
        riskCategory: risk_category
      }
    });

    const riskLog = await prisma.riskLog.create({
      data: {
        studentId: id,
        riskScore: risk_score,
        riskCategory: risk_category,
        reasons: reasons
      }
    });

    return res.json({
      student: updatedStudent,
      riskLog,
      recommendedInterventions: recommended_interventions
    });
  } catch (error) {
    console.error('ML Analysis error:', error.message);
    return res.status(500).json({ error: 'Failed to complete risk analysis' });
  }
});

// 2. Fetch Admin Dashboard Overview Data
app.get('/api/dashboard/admin', async (req, res) => {
  try {
    const totalStudents = await prisma.studentProfile.count();
    const lowRisk = await prisma.studentProfile.count({ where: { riskCategory: 'LOW' } });
    const mediumRisk = await prisma.studentProfile.count({ where: { riskCategory: 'MEDIUM' } });
    const highRisk = await prisma.studentProfile.count({ where: { riskCategory: 'HIGH' } });
    const criticalRisk = await prisma.studentProfile.count({ where: { riskCategory: 'CRITICAL' } });

    const highRiskStudents = await prisma.studentProfile.findMany({
      where: { riskCategory: { in: ['HIGH', 'CRITICAL'] } },
      include: {
        user: { select: { name: true, email: true } },
        riskLogs: { orderBy: { createdAt: 'desc' }, take: 1 }
      },
      orderBy: { riskScore: 'desc' }
    });

    return res.json({
      metrics: { totalStudents, lowRisk, mediumRisk, highRisk, criticalRisk },
      highRiskStudents
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// 3. Log a Mentor Intervention
app.post('/api/interventions', async (req, res) => {
  try {
    const { studentId, actionTaken, category, notes } = req.body;
    
    const student = await prisma.studentProfile.findUnique({ where: { id: studentId } });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const intervention = await prisma.intervention.create({
      data: {
        studentId,
        actionTaken,
        category,
        notes,
        riskBefore: student.riskScore,
        status: 'SCHEDULED'
      }
    });

    return res.status(201).json(intervention);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// 4. Resolve Intervention and recalculate risk
app.patch('/api/interventions/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;
    const { newAttendance, newMarks } = req.body;

    const intervention = await prisma.intervention.findUnique({ where: { id } });
    if (!intervention) return res.status(404).json({ error: 'Intervention not found' });

    // Update student metrics post-intervention
    const updatedStudent = await prisma.studentProfile.update({
      where: { id: intervention.studentId },
      data: {
        currentAttendance: newAttendance !== undefined ? newAttendance : undefined,
        internalMarks: newMarks !== undefined ? newMarks : undefined
      }
    });

    // Re-evaluate risk using ML Service
    const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict`, {
      current_attendance: updatedStudent.currentAttendance,
      attendance_trend: updatedStudent.attendanceTrend,
      internal_marks: updatedStudent.internalMarks,
      backlogs: updatedStudent.backlogs,
      assignment_completion_rate: updatedStudent.assignmentCompletionRate,
      lms_activity_score: updatedStudent.lmsActivityScore
    });

    const { risk_score, risk_category } = mlResponse.data;

    // Persist new risk state
    await prisma.studentProfile.update({
      where: { id: updatedStudent.id },
      data: { riskScore: risk_score, riskCategory: risk_category }
    });

    const updatedIntervention = await prisma.intervention.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        riskAfter: risk_score
      }
    });

    return res.json({
      intervention: updatedIntervention,
      student: updatedStudent,
      riskReducedBy: Number((intervention.riskBefore - risk_score).toFixed(2))
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`EduGuard Node API server running on port ${PORT}`);
});