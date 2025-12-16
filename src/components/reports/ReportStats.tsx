import React from 'react';
import { TrendingUp, CheckCircle2, BarChart, AlertCircle, Users } from 'lucide-react';

interface ReportStatsProps {
  stats: {
    totalStudents: number;
    totalMarked: number;
    attendancePercentage: number;
    classesTotal: number;
    classesUpdated: number;
  };
}

export const ReportStats: React.FC<ReportStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden group">
        <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
          <Users size={64} className="text-blue-600" />
        </div>
        <p className="text-gray-500 text-sm font-medium">Total Students</p>
        <h3 className="text-3xl font-bold text-gray-800 mt-1">{stats.totalStudents}</h3>
        <div className="mt-4 flex items-center gap-2 text-xs text-green-600 bg-green-50 w-fit px-2 py-1 rounded-full">
          <TrendingUp size={12} /> Active Records
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden group">
        <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
          <CheckCircle2 size={64} className="text-emerald-600" />
        </div>
        <p className="text-gray-500 text-sm font-medium">Attendance Marked</p>
        <h3 className="text-3xl font-bold text-gray-800 mt-1">
          {stats.totalMarked} <span className="text-lg text-gray-400 font-normal">/ {stats.totalStudents}</span>
        </h3>
        <div className="w-full bg-gray-100 h-1.5 mt-4 rounded-full overflow-hidden">
          <div 
            className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
            style={{ width: `${stats.totalStudents > 0 ? (stats.totalMarked / stats.totalStudents) * 100 : 0}%` }}
          ></div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden group">
        <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
          <BarChart size={64} className="text-purple-600" />
        </div>
        <p className="text-gray-500 text-sm font-medium">Average Presence</p>
        <h3 className="text-3xl font-bold text-gray-800 mt-1">{stats.attendancePercentage}%</h3>
        <p className="text-xs text-gray-400 mt-4">Based on marked records</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden group">
        <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
          <AlertCircle size={64} className="text-orange-600" />
        </div>
        <p className="text-gray-500 text-sm font-medium">Pending Classes</p>
        <h3 className="text-3xl font-bold text-gray-800 mt-1">
          {stats.classesTotal - stats.classesUpdated} <span className="text-lg text-gray-400 font-normal">/ {stats.classesTotal}</span>
        </h3>
        <p className="text-xs text-orange-500 mt-4 font-medium">
          {stats.classesUpdated === stats.classesTotal ? 'All classes updated!' : 'Submission required'}
        </p>
      </div>
    </div>
  );
};