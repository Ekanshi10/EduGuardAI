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

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/students`);
      setStudents(response.data);
      if (response.data.length > 0) {
        setSelectedStudent(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
      // Fallback mock data for demo if backend is empty
      setStudents([
        { id: '1', studentCode: 'STU101', user: { name: 'Rahul Sharma' }, department: 'CSE', semester: 4, currentAttendance: 62, internalMarks: 45, backlogs: 2, riskScore: 0.78, riskCategory: 'HIGH' },
        { id: '2', studentCode: 'STU102', user: { name: 'Priya Verma' }, department: 'ECE', semester: 4, currentAttendance: 85, internalMarks: 78, backlogs: 0, riskScore: 0.12, riskCategory: 'LOW' },
        { id: '3', studentCode: 'STU103', user: { name: 'Amit Kumar' }, department: 'ME', semester: 6, currentAttendance: 50, internalMarks: 38, backlogs: 4, riskScore: 0.91, riskCategory: 'CRITICAL' },
      ]);
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