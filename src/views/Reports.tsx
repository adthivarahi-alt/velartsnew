import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { PieChart, Calendar, Download } from 'lucide-react';
import { ReportStats } from '../components/reports/ReportStats';
import { ReportCharts } from '../components/reports/ReportCharts';
import { SubmissionTable, ClassStatusItem, FacultyPendingItem } from '../components/reports/SubmissionTable';
import { DepartmentSummary, DepartmentMetric } from '../components/reports/DepartmentSummary';
import { HOURS_PER_DAY } from '../types';

export const Reports: React.FC = () => {
  const { students, attendance, timetable, users, departments, years, sections } = useApp();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'CLASS' | 'FACULTY'>('CLASS');

  // New states for export sheet
  const [selectedDept, setSelectedDept] = useState(departments[0] || 'CSE');
  const [selectedYear, setSelectedYear] = useState(years[0] || 'III');
  const [selectedSection, setSelectedSection] = useState(sections[0] || 'A');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedHour, setSelectedHour] = useState<number>(1);

  // --- Data Processing for Analytics Dashboard ---

  // 1. Group Students into Classes (Dept-Year-Section)
  const classes = useMemo(() => {
    const map: Record<string, { dept: string, year: string, section: string, studentIds: string[] }> = {};
    students.forEach(s => {
      const key = `${s.department}-${s.year}-${s.section || 'A'}`;
      if (!map[key]) {
        map[key] = { dept: s.department, year: s.year, section: s.section || 'A', studentIds: [] };
      }
      map[key].studentIds.push(s.id);
    });
    return Object.values(map).sort((a, b) => a.dept.localeCompare(b.dept) || a.year.localeCompare(b.year));
  }, [students]);

  // 2. Calculate Daily Stats & Class Status
  const { dailyStats, pendingClasses } = useMemo(() => {
    // Filter records by date and hour.
    const records = attendance.filter(a => a.date === selectedDate && a.hour === selectedHour);
    
    const totalStudents = students.length;
    const totalMarked = records.length;
    const present = records.filter(a => a.status === 'PRESENT').length;
    const absent = records.filter(a => a.status === 'ABSENT').length;
    const late = records.filter(a => a.status === 'LATE').length;
    
    let classesUpdated = 0;
    const pendingList: typeof classes = [];

    const classStatus: ClassStatusItem[] = classes.map(cls => {
      const isMarked = cls.studentIds.some(sid => records.find(r => r.studentId === sid));
      if (isMarked) {
        classesUpdated++;
      } else {
        pendingList.push(cls);
      }
      
      let classPresent = 0;
      let classTotalMarked = 0;
      if (isMarked) {
        cls.studentIds.forEach(sid => {
          const rec = records.find(r => r.studentId === sid);
          if (rec) {
            classTotalMarked++;
            if (rec.status === 'PRESENT') classPresent++;
          }
        });
      }

      // Find Associated Faculty from Timetable for this specific HOUR
      const classId = `${cls.dept}-${cls.year}-${cls.section}`;
      // Use selectedHour to find who was supposed to be there
      const staffIds = Array.from(new Set(timetable.filter(t => t.classId === classId && t.hour === selectedHour).map(t => t.staffId)));
      const facultyNames = staffIds.map(sid => users.find(u => u.id === sid)?.name).filter(Boolean) as string[];

      return {
        ...cls,
        classId,
        status: isMarked ? 'UPDATED' : 'PENDING',
        percentage: classTotalMarked > 0 ? Math.round((classPresent / classTotalMarked) * 100) : 0,
        faculty: facultyNames
      };
    });

    return {
      dailyStats: {
        totalStudents,
        totalMarked,
        present,
        absent,
        late,
        attendancePercentage: totalMarked > 0 ? Math.round((present / totalMarked) * 100) : 0,
        classesTotal: classes.length,
        classesUpdated,
        classStatus
      },
      pendingClasses: pendingList
    };
  }, [attendance, selectedDate, selectedHour, students, classes, timetable, users]);

  // 3. Faculty Wise Pending List
  const facultyPendingList = useMemo(() => {
    const map: Record<string, FacultyPendingItem> = {};
    dailyStats.classStatus.filter(c => c.status === 'PENDING').forEach(cls => {
       if (cls.faculty.length > 0) {
         cls.faculty.forEach(staffName => {
            if (!map[staffName]) {
              const staffUser = users.find(u => u.name === staffName);
              map[staffName] = { 
                staffName, 
                dept: staffUser?.department || cls.dept, 
                pendingClasses: [] 
              };
            }
            map[staffName].pendingClasses.push(`${cls.dept}-${cls.year}-${cls.section}`);
         });
       } else {
         const unassignedKey = "Unassigned / No Timetable";
         if (!map[unassignedKey]) {
           map[unassignedKey] = { staffName: unassignedKey, dept: '-', pendingClasses: [] };
         }
         map[unassignedKey].pendingClasses.push(`${cls.dept}-${cls.year}-${cls.section}`);
       }
    });
    return Object.values(map).sort((a,b) => b.pendingClasses.length - a.pendingClasses.length);
  }, [dailyStats, users]);

  // 4. Department-wise Stats
  const deptStats = useMemo(() => {
    const stats: Record<string, { total: number, present: number, marked: number }> = {};
    students.forEach(s => {
      if (!stats[s.department]) stats[s.department] = { total: 0, present: 0, marked: 0 };
      stats[s.department].total++;
    });
    // Filter by Hour
    attendance.filter(a => a.date === selectedDate && a.hour === selectedHour).forEach(a => {
      const student = students.find(s => s.id === a.studentId);
      if (student && stats[student.department]) {
        stats[student.department].marked++;
        if (a.status === 'PRESENT') stats[student.department].present++;
      }
    });
    return Object.entries(stats).map(([dept, data]) => ({
      dept,
      totalStudents: data.total,
      attendancePct: data.marked > 0 ? Math.round((data.present / data.marked) * 100) : 0
    })).sort((a, b) => b.totalStudents - a.totalStudents);
  }, [students, attendance, selectedDate, selectedHour]);

  // 5. Detailed Department Metrics for Summary Table
  const deptMetrics: DepartmentMetric[] = useMemo(() => {
    const metrics: Record<string, DepartmentMetric> = {};
    departments.forEach(d => {
      metrics[d] = { name: d, totalStudents: 0, marked: 0, present: 0, absent: 0, late: 0, pendingClasses: [] };
    });
    students.forEach(s => {
      if (!metrics[s.department]) metrics[s.department] = { name: s.department, totalStudents: 0, marked: 0, present: 0, absent: 0, late: 0, pendingClasses: [] };
      metrics[s.department].totalStudents++;
    });
    attendance.filter(a => a.date === selectedDate && a.hour === selectedHour).forEach(a => {
       const s = students.find(stu => stu.id === a.studentId);
       if (s && metrics[s.department]) {
         metrics[s.department].marked++;
         if (a.status === 'PRESENT') metrics[s.department].present++;
         else if (a.status === 'ABSENT') metrics[s.department].absent++;
         else if (a.status === 'LATE') metrics[s.department].late++;
       }
    });
    dailyStats.classStatus.forEach(cls => {
      if (cls.status === 'PENDING' && metrics[cls.dept]) {
        metrics[cls.dept].pendingClasses.push(`${cls.year}-${cls.section}`);
      }
    });
    return Object.values(metrics).sort((a,b) => b.totalStudents - a.totalStudents);
  }, [students, attendance, selectedDate, selectedHour, dailyStats, departments]);

  // 6. Last 7 Days Trend (Average of selected hour?)
  const trendData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(selectedDate);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      // Trend for the selected hour across days
      const recs = attendance.filter(a => a.date === dateStr && a.hour === selectedHour);
      const pres = recs.filter(a => a.status === 'PRESENT').length;
      const pct = recs.length > 0 ? Math.round((pres / recs.length) * 100) : 0;
      days.push({ date: dateStr, pct, label: dateStr.slice(5) });
    }
    return days;
  }, [attendance, selectedDate, selectedHour]);

  // --- Export Logic ---

  const handleExport = () => {
    const [yearStr, monthStr] = selectedMonth.split('-');
    const year = parseInt(yearStr);
    const month = parseInt(monthStr);
    const daysInMonth = new Date(year, month, 0).getDate();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const classStudents = students.filter(s => 
      s.department === selectedDept && 
      s.year === selectedYear && 
      (s.section ? s.section === selectedSection : true)
    ).sort((a, b) => a.registerNumber.localeCompare(b.registerNumber));

    // Export with Hour
    let csv = `Register No,Name,Hour,${daysArray.join(',')},Total Present,Total Absent,Total Late\n`;
    
    classStudents.forEach(s => {
      let present = 0;
      let absent = 0;
      let late = 0;
      const row = [s.registerNumber, s.name, selectedHour.toString()];
      
      daysArray.forEach(day => {
        const dateStr = `${selectedMonth}-${day.toString().padStart(2, '0')}`;
        // Fetch record for this Student, Date AND selected Hour
        const record = attendance.find(a => a.studentId === s.id && a.date === dateStr && a.hour === selectedHour);
        const status = record ? record.status : '-';
        if (status === 'PRESENT') present++;
        if (status === 'ABSENT') absent++;
        if (status === 'LATE') late++;
        row.push(status === 'PRESENT' ? 'P' : status === 'ABSENT' ? 'A' : status === 'LATE' ? 'L' : '-');
      });
      
      row.push(present.toString(), absent.toString(), late.toString());
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Attendance_${selectedDept}_${selectedYear}_${selectedSection}_Hour${selectedHour}_${selectedMonth}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <PieChart className="text-blue-600" /> Analytics Dashboard
          </h2>
          <p className="text-gray-500 mt-1">Real-time attendance insights and submission tracking</p>
        </div>
        <div className="flex gap-4">
           {/* Date Picker */}
           <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm border border-gray-200">
             <Calendar size={18} className="text-gray-500" />
             <input 
               type="date" 
               value={selectedDate}
               onChange={(e) => setSelectedDate(e.target.value)}
               className="outline-none text-gray-700 font-medium"
             />
           </div>
           {/* Hour Selector */}
           <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm border border-gray-200">
             <span className="text-xs font-bold text-gray-500 uppercase">View:</span>
             <select 
               value={selectedHour}
               onChange={(e) => setSelectedHour(parseInt(e.target.value))}
               className="outline-none text-blue-600 font-bold bg-transparent"
             >
               {HOURS_PER_DAY.map(h => <option key={h} value={h}>Hour {h}</option>)}
             </select>
           </div>
        </div>
      </div>

      {/* Top Cards */}
      <ReportStats stats={dailyStats} />
      
      {/* Charts Area */}
      <ReportCharts 
        deptStats={deptStats} 
        trendData={trendData} 
        dailyDistribution={{
          present: dailyStats.present,
          absent: dailyStats.absent,
          late: dailyStats.late,
          total: dailyStats.totalStudents
        }}
      />

      {/* New: Detailed Department Summary */}
      <DepartmentSummary metrics={deptMetrics} />

      {/* Existing: Granular Submission Table */}
      <SubmissionTable 
        viewMode={viewMode}
        setViewMode={setViewMode}
        classStatus={dailyStats.classStatus}
        facultyPendingList={facultyPendingList}
      />

      {/* Monthly Report Export Section */}
      <div className="mt-12 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Export Monthly Report</h3>
        <p className="text-xs text-gray-500 mb-4">Generates CSV report for the selected <strong>Hour {selectedHour}</strong>.</p>
        <div className="flex flex-wrap gap-4 items-end">
           <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">Month</label>
              <input 
                type="month" 
                value={selectedMonth} 
                onChange={e => setSelectedMonth(e.target.value)}
                className="border p-2 rounded"
              />
           </div>
           <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">Department</label>
              <select value={selectedDept} onChange={e => setSelectedDept(e.target.value)} className="border p-2 rounded min-w-[120px]">
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
           </div>
           <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">Year</label>
              <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="border p-2 rounded min-w-[100px]">
                {years.map(y => <option key={y} value={y}>Year {y}</option>)}
              </select>
           </div>
           <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">Section</label>
              <select value={selectedSection} onChange={e => setSelectedSection(e.target.value)} className="border p-2 rounded min-w-[100px]">
                {sections.map(s => <option key={s} value={s}>Section {s}</option>)}
              </select>
           </div>
           <button onClick={handleExport} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 h-[42px]">
             <Download size={18} /> Export Sheet
           </button>
        </div>
      </div>
    </div>
  );
};
