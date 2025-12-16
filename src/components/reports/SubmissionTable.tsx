import React from 'react';
import { AlertCircle, CheckCircle2, UserX, Bell } from 'lucide-react';

export interface ClassStatusItem {
  dept: string;
  year: string;
  section: string;
  studentIds: string[];
  classId: string;
  status: 'UPDATED' | 'PENDING';
  percentage: number;
  faculty: string[];
}

export interface FacultyPendingItem {
  staffName: string;
  dept: string;
  pendingClasses: string[];
}

interface SubmissionTableProps {
  viewMode: 'CLASS' | 'FACULTY';
  setViewMode: (mode: 'CLASS' | 'FACULTY') => void;
  classStatus: ClassStatusItem[];
  facultyPendingList: FacultyPendingItem[];
}

export const SubmissionTable: React.FC<SubmissionTableProps> = ({ viewMode, setViewMode, classStatus, facultyPendingList }) => {
  
  const handleNotify = (staffName: string, count: number) => {
    // In a real app, this would trigger an email or SMS API
    alert(`Notification sent to ${staffName} regarding ${count} pending classes.`);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Submission Status Reports</h3>
          <p className="text-xs text-gray-500">Track pending and updated attendance records</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button 
            onClick={() => setViewMode('CLASS')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${viewMode === 'CLASS' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Class Wise
          </button>
          <button 
            onClick={() => setViewMode('FACULTY')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${viewMode === 'FACULTY' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Faculty Wise (Pending)
          </button>
        </div>
      </div>

      {viewMode === 'CLASS' ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Class</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Students</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Attendance</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Associated Faculty</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {classStatus.map((cls, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                        <div className="bg-blue-50 text-blue-600 p-2 rounded mr-3 font-bold text-xs">{cls.dept}</div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{cls.year} Year - Sec {cls.section}</p>
                          <p className="text-xs text-gray-400">ID: {cls.classId}</p>
                        </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{cls.studentIds.length}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {cls.status === 'UPDATED' ? (
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-green-500 h-full" style={{ width: `${cls.percentage}%` }}></div>
                        </div>
                        <span className="text-xs font-medium text-gray-600">{cls.percentage}%</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-300">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {cls.faculty.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {cls.faculty.slice(0, 2).map((f: string, i: number) => (
                            <span key={i} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">{f}</span>
                          ))}
                          {cls.faculty.length > 2 && <span className="text-xs text-gray-400">+{cls.faculty.length - 2} more</span>}
                        </div>
                      ) : <span className="text-xs text-gray-300 italic">No mapping</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {cls.status === 'UPDATED' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-100">
                        <CheckCircle2 size={12} /> Updated
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-100">
                        <AlertCircle size={12} /> Pending
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Faculty Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending Classes Count</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Classes List</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
                {facultyPendingList.length > 0 ? facultyPendingList.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="bg-orange-100 text-orange-600 p-2 rounded-full">
                          <UserX size={16} />
                        </div>
                        <span className="font-medium text-gray-900">{item.staffName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="bg-gray-100 px-2 py-1 rounded text-xs font-semibold text-gray-600">{item.dept}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-orange-600">
                      {item.pendingClasses.length} Classes
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {item.pendingClasses.map((cls: string, i: number) => (
                          <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                            {cls}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleNotify(item.staffName, item.pendingClasses.length)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium border border-blue-200 px-3 py-1 rounded hover:bg-blue-50 transition flex items-center gap-1 ml-auto"
                      >
                        <Bell size={12} /> Notify
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <CheckCircle2 size={48} className="text-green-300 mb-2" />
                        <p>All clear! No pending submissions found for associated faculty.</p>
                      </div>
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};