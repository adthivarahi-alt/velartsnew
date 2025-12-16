import React, { useState } from 'react';
    import { useApp } from '../context/AppContext';
    import { DAYS_OF_WEEK, HOURS_PER_DAY, TimetableEntry } from '../types';
    import { Download, Save, X, Lock } from 'lucide-react';

    export const Timetable: React.FC = () => {
      const { timetable, users, updateTimetable, currentUser, departments, years, sections } = useApp();
      const [selectedDept, setSelectedDept] = useState(departments[0] || 'CSE');
      const [selectedYear, setSelectedYear] = useState(years[0] || 'III');
      const [selectedSection, setSelectedSection] = useState(sections[0] || 'A');
      const [editingCell, setEditingCell] = useState<{day: string, hour: number} | null>(null);
      const [editForm, setEditForm] = useState<{subject: string, staffId: string}>({ subject: '', staffId: '' });

      const isAdmin = currentUser?.role === 'ADMIN';
      const currentClassId = `${selectedDept}-${selectedYear}-${selectedSection}`;

      const getEntry = (day: string, hour: number) => {
        return timetable.find(t => t.day === day && t.hour === hour && t.classId === currentClassId);
      };

      const handleEditClick = (day: string, hour: number, entry?: TimetableEntry) => {
        if (!isAdmin) return; // Prevent non-admins from editing
        setEditingCell({ day, hour });
        if (entry) {
          setEditForm({ subject: entry.subject, staffId: entry.staffId });
        } else {
          setEditForm({ subject: '', staffId: '' });
        }
      };

      const handleSave = () => {
        if (!editingCell) return;
        
        const newEntry: TimetableEntry = {
          id: Date.now().toString(),
          day: editingCell.day,
          hour: editingCell.hour,
          classId: currentClassId,
          subject: editForm.subject,
          staffId: editForm.staffId
        };

        updateTimetable(newEntry);
        setEditingCell(null);
      };

      const handleExport = () => {
        let csvContent = "data:text/csv;charset=utf-8,Day Order,Hour,Class,Section,Subject,Staff\n";
        
        const filteredEntries = timetable.filter(t => t.classId === currentClassId);
        
        filteredEntries.forEach(row => {
          const staff = users.find(u => u.id === row.staffId)?.name || 'Unknown';
          csvContent += `${row.day},${row.hour},${row.classId},${selectedSection},${row.subject},${staff}\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `timetable_${currentClassId}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };

      const staffList = users.filter(u => u.role === 'STAFF');

      return (
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-bold text-gray-800">Timetable Management</h2>
                {!isAdmin && (
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <Lock size={12} /> View Only
                  </span>
                )}
              </div>
              <p className="text-gray-500">
                {isAdmin ? 'Manage daily schedules for departments and sections' : 'View schedules for departments and sections'}
              </p>
            </div>
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow transition-colors"
            >
              <Download size={18} />
              Export to CSV
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md mb-6 flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select 
                className="w-full border-gray-300 border rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
              >
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Year/Batch</label>
              <select 
                className="w-full border-gray-300 border rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                {years.map(y => <option key={y} value={y}>Year {y}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
              <select 
                className="w-full border-gray-300 border rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
              >
                {sections.map(s => <option key={s} value={s}>Section {s}</option>)}
              </select>
            </div>
            <div className="pb-2 text-gray-500 font-medium w-full md:w-auto">
              Viewing: <span className="text-blue-600 font-bold">{currentClassId}</span>
            </div>
          </div>

          <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Day Order</th>
                  {HOURS_PER_DAY.map(hour => (
                    <th key={hour} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hour {hour}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {DAYS_OF_WEEK.map(day => (
                  <tr key={day}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-700 bg-gray-50">
                      {day}
                    </td>
                    {HOURS_PER_DAY.map(hour => {
                      const entry = getEntry(day, hour);
                      const isEditing = editingCell?.day === day && editingCell?.hour === hour;
                      
                      return (
                        <td 
                          key={hour} 
                          className={`px-6 py-4 whitespace-nowrap text-sm border-l border-gray-100 relative min-h-[80px] h-[80px] transition-colors ${!isEditing && isAdmin ? 'hover:bg-blue-50 cursor-pointer' : ''}`}
                          onClick={() => isAdmin && !isEditing && handleEditClick(day, hour, entry)}
                        >
                          {isEditing ? (
                            <div className="absolute inset-0 z-10 bg-white p-2 shadow-lg border-2 border-blue-500 flex flex-col gap-2 rounded">
                              <input 
                                autoFocus
                                placeholder="Subject"
                                className="text-xs border p-1 rounded w-full"
                                value={editForm.subject}
                                onChange={(e) => setEditForm({...editForm, subject: e.target.value})}
                              />
                              <select 
                                className="text-xs border p-1 rounded w-full"
                                value={editForm.staffId}
                                onChange={(e) => setEditForm({...editForm, staffId: e.target.value})}
                              >
                                <option value="">Select Staff</option>
                                {staffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                              </select>
                              <div className="flex gap-1 mt-auto">
                                 <button onClick={(e) => { e.stopPropagation(); handleSave(); }} className="bg-blue-600 text-white p-1 rounded flex-1 flex justify-center"><Save size={12} /></button>
                                 <button onClick={(e) => { e.stopPropagation(); setEditingCell(null); }} className="bg-gray-300 text-gray-700 p-1 rounded flex-1 flex justify-center"><X size={12} /></button>
                              </div>
                            </div>
                          ) : (
                            entry ? (
                              <div className="flex flex-col h-full justify-center">
                                <span className="font-semibold text-gray-800">{entry.subject}</span>
                                <span className="text-xs text-gray-500">
                                  {users.find(u => u.id === entry.staffId)?.name || 'Unknown'}
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-300 text-xs italic">Empty</span>
                            )
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    };