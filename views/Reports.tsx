import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DEPARTMENTS, SECTIONS, YEARS } from '../types';
import { FileSpreadsheet, Download } from 'lucide-react';

export const Reports: React.FC = () => {
  const { students, attendance } = useApp();
  const [selectedDept, setSelectedDept] = useState(DEPARTMENTS[0]); // Department Filter
  const [selectedYear, setSelectedYear] = useState('III');
  const [selectedSection, setSelectedSection] = useState('A');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

  // Generate days for selected month
  const [yearStr, monthStr] = selectedMonth.split('-');
  const year = parseInt(yearStr);
  const month = parseInt(monthStr);
  const daysInMonth = new Date(year, month, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Filter students
  const classStudents = students.filter(s => 
    s.department === selectedDept && 
    s.year === selectedYear && 
    (s.section ? s.section === selectedSection : true)
  ).sort((a, b) => a.registerNumber.localeCompare(b.registerNumber));

  const getStatus = (studentId: string, day: number) => {
    const dateStr = `${selectedMonth}-${day.toString().padStart(2, '0')}`;
    const record = attendance.find(a => a.studentId === studentId && a.date === dateStr);
    return record ? record.status : '-';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'bg-green-100 text-green-700';
      case 'ABSENT': return 'bg-red-100 text-red-700';
      case 'LATE': return 'bg-yellow-100 text-yellow-700';
      default: return 'text-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'P';
      case 'ABSENT': return 'A';
      case 'LATE': return 'L';
      default: return '-';
    }
  };

  const handleExport = () => {
    let csv = `Register No,Name,${daysArray.join(',')},Total Present,Total Absent,Total Late\n`;
    
    classStudents.forEach(s => {
      let present = 0;
      let absent = 0;
      let late = 0;
      const row = [s.registerNumber, s.name];
      
      daysArray.forEach(day => {
        const status = getStatus(s.id, day);
        if (status === 'PRESENT') present++;
        if (status === 'ABSENT') absent++;
        if (status === 'LATE') late++;
        row.push(getStatusText(status));
      });
      
      row.push(present.toString(), absent.toString(), late.toString());
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Attendance_${selectedDept}_${selectedYear}_${selectedSection}_${selectedMonth}.csv`;
    a.click();
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Attendance Reports</h2>
          <p className="text-gray-500">Daily attendance tracking sheet department-wise</p>
        </div>
        <button onClick={handleExport} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
           <Download size={18} /> Export Sheet
        </button>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-wrap gap-4 items-center">
         <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Month</label>
            <input 
              type="month" 
              value={selectedMonth} 
              onChange={e => setSelectedMonth(e.target.value)}
              className="border p-2 rounded"
            />
         </div>
         
         <div className="h-8 w-px bg-gray-300 mx-2 hidden md:block"></div>

         <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Department</label>
            <select value={selectedDept} onChange={e => setSelectedDept(e.target.value)} className="border p-2 rounded min-w-[120px]">
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
         </div>

         <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Year</label>
            <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="border p-2 rounded min-w-[100px]">
              {YEARS.map(y => <option key={y} value={y}>Year {y}</option>)}
            </select>
         </div>

         <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Section</label>
            <select value={selectedSection} onChange={e => setSelectedSection(e.target.value)} className="border p-2 rounded min-w-[100px]">
              {SECTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
            </select>
         </div>
      </div>

      {/* Sheet View */}
      <div className="bg-white rounded-lg shadow overflow-x-auto border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase sticky left-0 bg-gray-50 z-10 w-24 border-r">Reg No</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase sticky left-24 bg-gray-50 z-10 w-48 border-r">Student Name</th>
              {daysArray.map(day => (
                <th key={day} className="px-1 py-3 text-center text-xs font-medium text-gray-500 w-8 min-w-[32px]">
                  {day}
                </th>
              ))}
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase border-l" title="Present">P</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase" title="Absent">A</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase" title="Late">L</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {classStudents.length > 0 ? classStudents.map(student => {
              const stats = { P: 0, A: 0, L: 0 };
              return (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-xs font-mono text-gray-600 sticky left-0 bg-white z-10 border-r">{student.registerNumber}</td>
                  <td className="px-4 py-2 text-sm font-medium text-gray-900 sticky left-24 bg-white z-10 border-r">{student.name}</td>
                  {daysArray.map(day => {
                    const status = getStatus(student.id, day);
                    if (status === 'PRESENT') stats.P++;
                    if (status === 'ABSENT') stats.A++;
                    if (status === 'LATE') stats.L++;
                    return (
                      <td key={day} className="px-1 py-2 text-center">
                        <span className={`inline-block w-6 h-6 leading-6 rounded text-xs font-bold ${getStatusColor(status)}`}>
                          {getStatusText(status)}
                        </span>
                      </td>
                    );
                  })}
                  <td className="px-4 py-2 text-sm text-green-600 text-center font-bold border-l">{stats.P}</td>
                  <td className="px-4 py-2 text-sm text-red-600 text-center font-bold">{stats.A}</td>
                  <td className="px-4 py-2 text-sm text-yellow-600 text-center font-bold">{stats.L}</td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={daysInMonth + 5} className="px-6 py-12 text-center text-gray-500">
                   <div className="flex flex-col items-center justify-center">
                     <FileSpreadsheet size={48} className="text-gray-300 mb-2" />
                     <p>No students found for {selectedDept} - {selectedYear} (Section {selectedSection})</p>
                   </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};