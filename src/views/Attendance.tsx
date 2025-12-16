import React, { useState } from 'react';
    import { useApp } from '../context/AppContext';
    import { CheckCircle, XCircle, Clock, CalendarOff } from 'lucide-react';

    export const Attendance: React.FC = () => {
      const { students, attendance, markAttendance, holidays, currentUser, departments, years, sections } = useApp();
      const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
      const [selectedDept, setSelectedDept] = useState(departments[0] || 'CSE');
      const [selectedYear, setSelectedYear] = useState(years[0] || 'III');
      const [selectedSection, setSelectedSection] = useState(sections[0] || 'A');

      // Check if holiday
      const isHoliday = holidays.find(h => h.date === selectedDate);

      const filteredStudents = students.filter(s => 
        s.department === selectedDept && 
        s.year === selectedYear &&
        (s.section ? s.section === selectedSection : true) // If student has no section, show in all (or handle as 'A')
      );

      const getStatus = (studentId: string) => {
        return attendance.find(a => a.studentId === studentId && a.date === selectedDate)?.status;
      };

      const handleMark = (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE') => {
        if (isHoliday) return;
        markAttendance({
          id: Date.now().toString(),
          date: selectedDate,
          studentId,
          status,
          markedBy: currentUser?.id || 'Unknown'
        });
      };

      // Stats for the day
      const presentCount = filteredStudents.filter(s => getStatus(s.id) === 'PRESENT').length;
      const absentCount = filteredStudents.filter(s => getStatus(s.id) === 'ABSENT').length;

      return (
        <div className="p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Attendance Tracker</h2>
            <p className="text-gray-500">Mark daily attendance for classes</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md mb-6 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input 
                type="date" 
                className="w-full border-gray-300 border rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select 
                className="w-full border-gray-300 border rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
              >
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
               <select 
                className="w-full border-gray-300 border rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                {years.map(y => <option key={y} value={y}>Year {y}</option>)}
              </select>
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
               <select 
                className="w-full border-gray-300 border rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
              >
                {sections.map(s => <option key={s} value={s}>Section {s}</option>)}
              </select>
            </div>
            
            <div className="flex gap-4 text-sm font-medium pb-2">
               <div className="text-green-600">Present: {presentCount}</div>
               <div className="text-red-600">Absent: {absentCount}</div>
            </div>
          </div>

          {isHoliday ? (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-12 flex flex-col items-center justify-center text-orange-600">
              <CalendarOff size={48} className="mb-4" />
              <h3 className="text-xl font-bold">Holiday: {isHoliday.name}</h3>
              <p>Attendance cannot be marked for this date.</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reg No</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.length > 0 ? filteredStudents.map(student => {
                    const status = getStatus(student.id);
                    return (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.registerNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                           <span className="px-2 bg-gray-100 rounded text-xs text-gray-600">{student.section || 'A'}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap flex justify-center gap-2">
                           <button 
                             onClick={() => handleMark(student.id, 'PRESENT')}
                             className={`p-2 rounded-full transition-all ${status === 'PRESENT' ? 'bg-green-100 text-green-600 ring-2 ring-green-500' : 'text-gray-300 hover:bg-green-50 hover:text-green-400'}`}
                             title="Present"
                           >
                             <CheckCircle size={24} />
                           </button>
                           <button 
                             onClick={() => handleMark(student.id, 'ABSENT')}
                             className={`p-2 rounded-full transition-all ${status === 'ABSENT' ? 'bg-red-100 text-red-600 ring-2 ring-red-500' : 'text-gray-300 hover:bg-red-50 hover:text-red-400'}`}
                             title="Absent"
                           >
                             <XCircle size={24} />
                           </button>
                           <button 
                             onClick={() => handleMark(student.id, 'LATE')}
                             className={`p-2 rounded-full transition-all ${status === 'LATE' ? 'bg-yellow-100 text-yellow-600 ring-2 ring-yellow-500' : 'text-gray-300 hover:bg-yellow-50 hover:text-yellow-400'}`}
                             title="Late"
                           >
                             <Clock size={24} />
                           </button>
                        </td>
                      </tr>
                    );
                  }) : (
                     <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                           No students found for this Department/Year/Section.
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
