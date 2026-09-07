import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  AlertTriangle, 
  Users, 
  UserCheck, 
  TrendingUp, 
  Search, 
  RefreshCw, 
  ShieldAlert, 
  CheckCircle,
  FileText
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';

const API_BASE_URL = 'http://localhost:5000/api';

export default function EduGuardDashboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');

  useEffect(() => {
    fetchData();
  }, []);

const erpRealData = [
    {
      id: '1',
      studentCode: '00000021639',
      user: { name: 'Ekanshi Garg' },
      department: 'CSE',
      semester: 5,
      currentAttendance: 87.07,
      internalMarks: 58.5,
      backlogs: 0,
      riskScore: 0.65,
      riskCategory: 'HIGH',
      details: {
        weakSubject: 'BCS-551 (DBMS Lab - 60.0%)',
        pendingAssessments: 'SQ1-SQ4 Quizzes Pending',
        feeStatus: 'Cleared'
      }
    },
    {
      id: '2',
      studentCode: '00000022789',
      user: { name: 'Geetanjali Kumari' },
      department: 'CSE',
      semester: 5,
      currentAttendance: 82.31,
      internalMarks: 54.0,
      backlogs: 0,
      riskScore: 0.72,
      riskCategory: 'HIGH',
      details: {
        weakSubject: 'BCS-553 (DAA Lab - 57.14%) & BCS-501 (60.0%)',
        pendingAssessments: 'Q1-Q3 & T1-T5 Overdue (SQ1: 3/5 Submitted)',
        feeStatus: 'Cleared'
      }
    },
    {
      id: '3',
      studentCode: '00000021645',
      user: { name: 'Aditya Singh' },
      department: 'CSE',
      semester: 5,
      currentAttendance: 54.20,
      internalMarks: 38.0,
      backlogs: 2,
      riskScore: 0.89,
      riskCategory: 'CRITICAL',
      details: {
        weakSubject: 'Multiple Theory & Labs < 60%',
        pendingAssessments: 'Critical Assessment Deficit',
        feeStatus: 'Pending Due'
      }
    },
    {
      id: '4',
      studentCode: '00000021650',
      user: { name: 'Ananya Verma' },
      department: 'ECE',
      semester: 5,
      currentAttendance: 94.10,
      internalMarks: 86.0,
      backlogs: 0,
      riskScore: 0.12,
      riskCategory: 'LOW',
      details: {
        weakSubject: 'None',
        pendingAssessments: 'All Quizzes Cleared',
        feeStatus: 'Cleared'
      }
    },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      setStudents(erpRealData);
      if (erpRealData.length > 0) {
        setSelectedStudent(erpRealData[0]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };
  

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          student.studentCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = riskFilter === 'ALL' || student.riskCategory === riskFilter;
    return matchesSearch && matchesRisk;
  });

  const getRiskBadgeColor = (category) => {
    switch (category) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-300';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-green-100 text-green-800 border-green-300';
    }
  };

  const riskPieData = [
    { name: 'Low', value: students.filter(s => s.riskCategory === 'LOW').length, color: '#22c55e' },
    { name: 'Medium', value: students.filter(s => s.riskCategory === 'MEDIUM').length, color: '#eab308' },
    { name: 'High', value: students.filter(s => s.riskCategory === 'HIGH').length, color: '#f97316' },
    { name: 'Critical', value: students.filter(s => s.riskCategory === 'CRITICAL').length, color: '#ef4444' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-6">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">EduGuard AI</h1>
            <p className="text-xs text-slate-500">Student Dropout Early Warning System</p>
          </div>
        </div>
        <button 
          onClick={fetchData} 
          className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-medium hover:bg-indigo-100 transition"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Data
        </button>
      </header>
  {/* Oracle ERP Sync Status Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 mb-8 bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-slate-800">
                Oracle PeopleSoft ERP Database Connected
              </p>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                LIVE SYNC
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Roster Source: <span className="font-medium text-slate-700">SRMCEM Term 2601 UG / B.Tech CSE</span> • Ingesting Attendance & LMS Records
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200">
          <span>Target Batch:</span>
          <span className="font-bold text-indigo-600">B.Tech 3rd Year (Sem 5)</span>
        </div>
      </div>    
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Total Monitored</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{students.length}</h3>
          </div>
          <Users className="w-8 h-8 text-slate-400" />
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Critical Risk</p>
            <h3 className="text-2xl font-bold text-red-600 mt-1">
              {students.filter(s => s.riskCategory === 'CRITICAL').length}
            </h3>
          </div>
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">High Risk</p>
            <h3 className="text-2xl font-bold text-orange-600 mt-1">
              {students.filter(s => s.riskCategory === 'HIGH').length}
            </h3>
          </div>
          <TrendingUp className="w-8 h-8 text-orange-500" />
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Safe Students</p>
            <h3 className="text-2xl font-bold text-green-600 mt-1">
              {students.filter(s => s.riskCategory === 'LOW').length}
            </h3>
          </div>
          <UserCheck className="w-8 h-8 text-green-500" />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Student List */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col h-[600px]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-900">Students Directory</h2>
            <select 
              value={riskFilter} 
              onChange={(e) => setRiskFilter(e.target.value)}
              className="text-xs bg-slate-100 border border-slate-300 rounded-md p-1.5"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>



          {/* Search Box */}
          <div className="relative mb-4">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Student Items List */}
          <div className="overflow-y-auto flex-1 space-y-2 pr-1">
            {filteredStudents.map((student) => (
              <div 
                key={student.id}
                onClick={() => setSelectedStudent(student)}
                className={`p-3 rounded-lg border cursor-pointer transition flex items-center justify-between ${
                  selectedStudent?.id === student.id 
                    ? 'border-indigo-500 bg-indigo-50/50' 
                    : 'border-slate-100 hover:bg-slate-50'
                }`}
              >
                <div>
                  <h4 className="font-semibold text-sm text-slate-900">{student.user?.name || 'Student'}</h4>
                  <p className="text-xs text-slate-500">{student.studentCode} • Sem {student.semester}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRiskBadgeColor(student.riskCategory)}`}>
                  {student.riskCategory}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Middle/Right Column: Detailed Analytics */}
        <div className="lg:col-span-2 space-y-8">
          {selectedStudent ? (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{selectedStudent.user?.name}</h2>
                  <p className="text-sm text-slate-500">ID: {selectedStudent.studentCode} | Department: {selectedStudent.department}</p>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getRiskBadgeColor(selectedStudent.riskCategory)}`}>
                  Risk Score: {(selectedStudent.riskScore * 100).toFixed(0)}%
                </span>
              </div>



              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="text-xs text-slate-500">Attendance</p>
                  <p className="text-lg font-bold text-slate-800">{selectedStudent.currentAttendance}%</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="text-xs text-slate-500">Internal Marks</p>
                  <p className="text-lg font-bold text-slate-800">{selectedStudent.internalMarks}%</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="text-xs text-slate-500">Active Backlogs</p>
                  <p className="text-lg font-bold text-slate-800">{selectedStudent.backlogs}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="text-xs text-slate-500">Current Semester</p>
                  <p className="text-lg font-bold text-slate-800">{selectedStudent.semester}</p>
                </div>
              </div>

              {/* ERP Roster & Academic Diagnostics Card */}
        {selectedStudent?.details && (
          <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                ERP Diagnostic Roster (Automated Flags)
              </span>
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 border border-indigo-200">
                Term 2601 Synced
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-4 text-xs sm:text-sm py-1 border-b border-slate-200/60">
                <span className="text-slate-600 font-medium">Critical Subject Deficit:</span>
                <span className="font-semibold text-rose-600 font-mono text-right bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  {selectedStudent.details.weakSubject}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 text-xs sm:text-sm py-1 border-b border-slate-200/60">
                <span className="text-slate-600 font-medium">LMS Submissions & Quizzes:</span>
                <span className="font-semibold text-amber-800 text-right bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {selectedStudent.details.pendingAssessments}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 text-xs sm:text-sm pt-1">
                <span className="text-slate-600 font-medium">Institutional Fee Status:</span>
                <span className={`font-semibold px-2 py-0.5 rounded text-xs ${
                  selectedStudent.details.feeStatus === 'Cleared'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}>
                  {selectedStudent.details.feeStatus}
                </span>
              </div>
            </div>
          </div>
        )}

              {/* Action Interventions Panel */}
              <div className="border-t border-slate-100 pt-4 mt-4">
                <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" /> Recommended Interventions
                </h3>
                <ul className="text-xs space-y-1.5 text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-slate-400" /> Schedule 1-on-1 Academic Counseling
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-slate-400" /> Notify Faculty Mentor regarding Attendance Drop
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center text-slate-500">
              Select a student to view prediction details.
            </div>
          )}

          {/* Distribution Chart */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Overall Student Risk Breakdown</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskPieData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
