import React from 'react';
import { Users, AlertCircle, CheckCircle2 } from 'lucide-react';

export interface DepartmentMetric {
  name: string;
  totalStudents: number;
  marked: number;
  present: number;
  absent: number;
  late: number;
  pendingClasses: string[]; // e.g. ["III-A", "II-B"]
}

interface DepartmentSummaryProps {
  metrics: DepartmentMetric[];
}

export const DepartmentSummary: React.FC<DepartmentSummaryProps> = ({ metrics }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-800">Department Performance Summary</h3>
        <p className="text-xs text-gray-500">Detailed breakdown of students, attendance updates, and pending sections</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Students</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Attendance Updated</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending Sections</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {metrics.map((dept, idx) => {
              const percentage = dept.totalStudents > 0 ? Math.round((dept.marked / dept.totalStudents) * 100) : 0;
              const isComplete = percentage === 100;
              
              return (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-10 rounded-full ${isComplete ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                      <div>
                        <span className="font-bold text-gray-800 block">{dept.name}</span>
                        <span className="text-xs text-gray-400 font-medium">
                          {isComplete ? 'All Clear' : `${dept.pendingClasses.length} Classes Pending`}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="inline-flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                      <Users size={14} className="text-gray-400" />
                      <span className="text-sm font-bold text-gray-700">{dept.totalStudents}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-full max-w-[200px]">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-gray-600">{dept.marked} / {dept.totalStudents}</span>
                        <span className={`font-bold ${isComplete ? 'text-green-600' : 'text-blue-600'}`}>{percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-green-500' : 'bg-blue-500'}`} 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {dept.pendingClasses.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {dept.pendingClasses.map((cls, i) => (
                          <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                            <AlertCircle size={10} />
                            {cls}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                        <CheckCircle2 size={10} />
                        All Updated
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
            {metrics.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                  No department data found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};