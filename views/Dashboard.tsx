import React from 'react';
import { useApp } from '../context/AppContext';
import { Users, GraduationCap, CalendarDays, AlertCircle } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { students, users, attendance, holidays } = useApp();
  
  const staffCount = users.filter(u => u.role === 'STAFF').length;
  const studentCount = students.length;
  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.filter(a => a.date === today);
  const presentToday = todayAttendance.filter(a => a.status === 'PRESENT').length;
  
  const nextHoliday = holidays
    .filter(h => h.date >= today)
    .sort((a,b) => a.date.localeCompare(b.date))[0];

  const StatCard = ({ title, value, icon, color }: any) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between border-l-4" style={{borderColor: color}}>
      <div>
        <p className="text-gray-500 text-sm font-medium uppercase">{title}</p>
        <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-full opacity-20`} style={{backgroundColor: color, color: color}}>
        {icon}
      </div>
    </div>
  );

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-2">Dashboard Overview</h2>
      <p className="text-gray-500 mb-8">Welcome to EduManager Administration</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Students" 
          value={studentCount} 
          icon={<GraduationCap size={32} color="#2563EB" />} 
          color="#2563EB" 
        />
        <StatCard 
          title="Teaching Staff" 
          value={staffCount} 
          icon={<Users size={32} color="#7C3AED" />} 
          color="#7C3AED" 
        />
        <StatCard 
          title="Present Today" 
          value={presentToday} 
          icon={<CalendarDays size={32} color="#059669" />} 
          color="#059669" 
        />
        <StatCard 
          title="Upcoming Holiday" 
          value={nextHoliday ? nextHoliday.name : "None"} 
          icon={<AlertCircle size={32} color="#EA580C" />} 
          color="#EA580C" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-blue-50 p-4 rounded text-center cursor-pointer hover:bg-blue-100 transition">
               <span className="font-semibold text-blue-700 block">Upload Students</span>
               <span className="text-xs text-blue-500">CSV Bulk Import</span>
             </div>
             <div className="bg-green-50 p-4 rounded text-center cursor-pointer hover:bg-green-100 transition">
               <span className="font-semibold text-green-700 block">Mark Attendance</span>
               <span className="text-xs text-green-500">Daily Tracker</span>
             </div>
             <div className="bg-purple-50 p-4 rounded text-center cursor-pointer hover:bg-purple-100 transition">
               <span className="font-semibold text-purple-700 block">Update Timetable</span>
               <span className="text-xs text-purple-500">Manage Schedule</span>
             </div>
             <div className="bg-orange-50 p-4 rounded text-center cursor-pointer hover:bg-orange-100 transition">
               <span className="font-semibold text-orange-700 block">Add Holiday</span>
               <span className="text-xs text-orange-500">Calendar Config</span>
             </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Recent Attendance Activity</h3>
          <div className="overflow-y-auto max-h-60">
            {todayAttendance.length > 0 ? (
              <table className="min-w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-3">Student ID</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {todayAttendance.slice(0, 5).map(record => (
                    <tr key={record.id} className="bg-white border-b">
                       <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                         {students.find(s => s.id === record.studentId)?.name || 'Unknown'}
                       </td>
                       <td className={`px-6 py-4 font-semibold ${record.status === 'PRESENT' ? 'text-green-600' : 'text-red-600'}`}>
                         {record.status}
                       </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-400 text-center py-8">No attendance marked for today yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};