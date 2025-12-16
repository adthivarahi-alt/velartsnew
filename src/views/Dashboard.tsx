import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Users, CalendarDays, AlertCircle, PieChart, Database, UserPlus, FileText } from 'lucide-react';
import { ReportStats } from '../components/reports/ReportStats';
import { ReportCharts } from '../components/reports/ReportCharts';
import { DepartmentSummary, DepartmentMetric } from '../components/reports/DepartmentSummary';

interface DashboardProps {
  setView: (view: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setView }) => {
  const { students, attendance, currentUser, departments } = useApp();
  const isAdmin = currentUser?.role === 'ADMIN';
  
  const today = new Date().toISOString().split('T')[0];

  // --- Analytics Logic (Reused for Dashboard) ---

  // 1. Group Students into Classes
  const classes = useMemo(() => {
    const map: Record<string, { dept: string, year: string, section: string, studentIds: string[] }> = {};
    students.forEach(s => {
      const key = `${s.department}-${s.year}-${s.section || 'A'}`;
      if (!map[key]) {
        map[key] = { dept: s.department, year: s.year, section: s.section || 'A', studentIds: [] };
      }
      map[key].studentIds.push(s.id);
    });
    return Object.values(map);
  }, [students]);

  // 2. Calculate Daily Stats
  const dailyStats = useMemo(() => {
    const records = attendance.filter(a => a.date === today);
    const totalStudents = students.length;
    const totalMarked = records.length;
    const present = records.filter(a => a.status === 'PRESENT').length;
    const absent = records.filter(a => a.status === 'ABSENT').length;
    const late = records.filter(a => a.status === 'LATE').length;
    
    let classesUpdated = 0;
    classes.forEach(cls => {
      if (cls.studentIds.some(sid => records.find(r => r.studentId === sid))) {
        classesUpdated++;
      }
    });

    return {
      totalStudents,
      totalMarked,
      present,
      absent,
      late,
      attendancePercentage: totalMarked > 0 ? Math.round((present / totalMarked) * 100) : 0,
      classesTotal: classes.length,
      classesUpdated
    };
  }, [attendance, today, students, classes]);

  // 3. Department Metrics
  const deptMetrics: DepartmentMetric[] = useMemo(() => {
    const metrics: Record<string, DepartmentMetric> = {};
    departments.forEach(d => {
      metrics[d] = { name: d, totalStudents: 0, marked: 0, present: 0, absent: 0, late: 0, pendingClasses: [] };
    });

    students.forEach(s => {
      if (!metrics[s.department]) metrics[s.department] = { name: s.department, totalStudents: 0, marked: 0, present: 0, absent: 0, late: 0, pendingClasses: [] };
      metrics[s.department].totalStudents++;
    });

    const records = attendance.filter(a => a.date === today);
    records.forEach(a => {
       const s = students.find(stu => stu.id === a.studentId);
       if (s && metrics[s.department]) {
         metrics[s.department].marked++;
         if (a.status === 'PRESENT') metrics[s.department].present++;
         else if (a.status === 'ABSENT') metrics[s.department].absent++;
         else if (a.status === 'LATE') metrics[s.department].late++;
       }
    });

    // Check pending classes
    classes.forEach(cls => {
      const isMarked = cls.studentIds.some(sid => records.find(r => r.studentId === sid));
      if (!isMarked && metrics[cls.dept]) {
        metrics[cls.dept].pendingClasses.push(`${cls.year}-${cls.section}`);
      }
    });

    return Object.values(metrics).sort((a,b) => b.totalStudents - a.totalStudents);
  }, [students, attendance, today, classes, departments]);

  // 4. Department Charts Data
  const deptStatsForChart = useMemo(() => {
    return deptMetrics.map(d => ({
      dept: d.name,
      totalStudents: d.totalStudents,
      attendancePct: d.totalStudents > 0 ? Math.round((d.marked / d.totalStudents) * 100) : 0
    }));
  }, [deptMetrics]);

  // 5. Trend Data
  const trendData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const recs = attendance.filter(a => a.date === dateStr);
      const pres = recs.filter(a => a.status === 'PRESENT').length;
      const pct = recs.length > 0 ? Math.round((pres / recs.length) * 100) : 0;
      days.push({ date: dateStr, pct, label: dateStr.slice(5) });
    }
    return days;
  }, [attendance, today]);

  // --- End Analytics Logic ---

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
          <p className="text-gray-500">
            {isAdmin ? 'Overview of institution performance for today' : 'Welcome to your daily dashboard'}
          </p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-medium border border-blue-100 flex items-center gap-2">
           <CalendarDays size={18} /> {today}
        </div>
      </div>

      {/* Admin View with Advanced Charts */}
      {isAdmin ? (
        <>
          <ReportStats stats={dailyStats} />
          
          <ReportCharts 
            deptStats={deptStatsForChart} 
            trendData={trendData} 
            dailyDistribution={{
              present: dailyStats.present,
              absent: dailyStats.absent,
              late: dailyStats.late,
              total: dailyStats.totalStudents
            }}
          />

          <DepartmentSummary metrics={deptMetrics} />

          {/* Quick Actions for Admin */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Management</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div 
                onClick={() => setView('master')}
                className="p-4 bg-purple-50 rounded-lg border border-purple-100 hover:bg-purple-100 transition cursor-pointer text-center group"
              >
                 <div className="flex justify-center mb-2"><Database className="text-purple-600" size={24} /></div>
                 <span className="text-purple-700 font-bold block mb-1">Master Data</span>
                 <span className="text-xs text-purple-500">Departments & Sections</span>
              </div>

              <div 
                onClick={() => setView('users')}
                className="p-4 bg-indigo-50 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition cursor-pointer text-center group"
              >
                 <div className="flex justify-center mb-2"><UserPlus className="text-indigo-600" size={24} /></div>
                 <span className="text-indigo-700 font-bold block mb-1">Add Staff</span>
                 <span className="text-xs text-indigo-500">Manage directory</span>
              </div>
              <div 
                onClick={() => setView('attendance')}
                className="p-4 bg-emerald-50 rounded-lg border border-emerald-100 hover:bg-emerald-100 transition cursor-pointer text-center"
              >
                 <div className="flex justify-center mb-2"><CalendarDays className="text-emerald-600" size={24} /></div>
                 <span className="text-emerald-700 font-bold block mb-1">Attendance</span>
                 <span className="text-xs text-emerald-500">Update records</span>
              </div>
              <div 
                onClick={() => setView('holidays')}
                className="p-4 bg-orange-50 rounded-lg border border-orange-100 hover:bg-orange-100 transition cursor-pointer text-center"
              >
                 <div className="flex justify-center mb-2"><AlertCircle className="text-orange-600" size={24} /></div>
                 <span className="text-orange-700 font-bold block mb-1">Holidays</span>
                 <span className="text-xs text-orange-500">Configure calendar</span>
              </div>
              <div 
                onClick={() => setView('students')}
                className="p-4 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition cursor-pointer text-center"
              >
                 <div className="flex justify-center mb-2"><FileText className="text-blue-600" size={24} /></div>
                 <span className="text-blue-700 font-bold block mb-1">Students</span>
                 <span className="text-xs text-blue-500">Bulk upload</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Staff View - Simplified */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-sm font-medium uppercase mb-2">Total Students</h3>
            <p className="text-3xl font-bold text-gray-800">{students.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <h3 className="text-gray-500 text-sm font-medium uppercase mb-2">My Department</h3>
             <p className="text-3xl font-bold text-blue-600">{currentUser?.department || 'N/A'}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <h3 className="text-gray-500 text-sm font-medium uppercase mb-2">Today's Status</h3>
             <p className="text-xl font-bold text-gray-800 flex items-center gap-2">
               {dailyStats.present} <span className="text-sm font-normal text-gray-500">Present</span>
             </p>
          </div>
        </div>
      )}
    </div>
  );
};