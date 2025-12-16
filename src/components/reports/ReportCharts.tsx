import React from 'react';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

interface ReportChartsProps {
  deptStats: { dept: string; totalStudents: number; attendancePct: number }[];
  trendData: { date: string; pct: number; label: string }[];
  dailyDistribution: { present: number; absent: number; late: number; total: number };
}

export const ReportCharts: React.FC<ReportChartsProps> = ({ deptStats, trendData, dailyDistribution }) => {
  // Calculate percentages for daily distribution
  const totalMarked = dailyDistribution.present + dailyDistribution.absent + dailyDistribution.late;
  const presentPct = totalMarked > 0 ? Math.round((dailyDistribution.present / totalMarked) * 100) : 0;
  const absentPct = totalMarked > 0 ? Math.round((dailyDistribution.absent / totalMarked) * 100) : 0;
  const latePct = totalMarked > 0 ? Math.round((dailyDistribution.late / totalMarked) * 100) : 0;

  // Chart Dimensions for SVG
  const vbWidth = 500;
  const vbHeight = 150;

  // Calculate points for the line chart
  const points = trendData.map((d, i) => {
    const x = (i / (trendData.length - 1)) * vbWidth;
    const y = vbHeight - (d.pct / 100) * vbHeight; // Invert y because SVG y=0 is top
    return `${x},${y}`;
  }).join(' ');

  const dots = trendData.map((d, i) => ({
    x: (i / (trendData.length - 1)) * vbWidth,
    y: vbHeight - (d.pct / 100) * vbHeight,
    val: d.pct,
    label: d.label
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
      {/* Daily Attendance Distribution */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-6">Daily Attendance Status</h3>
        
        <div className="flex flex-col gap-6">
          {/* Visual Bar */}
          <div className="w-full h-8 flex rounded-lg overflow-hidden">
            <div className="bg-green-500 h-full transition-all duration-500" style={{ width: `${presentPct}%` }}></div>
            <div className="bg-red-500 h-full transition-all duration-500" style={{ width: `${absentPct}%` }}></div>
            <div className="bg-yellow-500 h-full transition-all duration-500" style={{ width: `${latePct}%` }}></div>
            {totalMarked === 0 && <div className="bg-gray-100 h-full w-full"></div>}
          </div>

          {/* Legend / Stats */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-green-500" />
                <span className="text-sm font-medium text-gray-600">Present</span>
              </div>
              <span className="text-sm font-bold text-gray-800">{dailyDistribution.present} ({presentPct}%)</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle size={18} className="text-red-500" />
                <span className="text-sm font-medium text-gray-600">Absent</span>
              </div>
              <span className="text-sm font-bold text-gray-800">{dailyDistribution.absent} ({absentPct}%)</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-yellow-500" />
                <span className="text-sm font-medium text-gray-600">Late</span>
              </div>
              <span className="text-sm font-bold text-gray-800">{dailyDistribution.late} ({latePct}%)</span>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
             <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Total Marked</span>
                <span className="text-sm font-bold text-gray-700">{totalMarked} Students</span>
             </div>
          </div>
        </div>
      </div>

      {/* Department & Trend Charts */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
        <h3 className="text-lg font-bold text-gray-800 mb-6">Analytics Overview</h3>
        
        <div className="mb-8">
          <h4 className="text-sm font-semibold text-gray-500 mb-4">Department Performance</h4>
          <div className="space-y-3">
             {deptStats.map(d => (
               <div key={d.dept} className="flex items-center gap-2">
                 <span className="text-xs font-bold w-12 text-gray-700">{d.dept}</span>
                 <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                   <div className="bg-blue-500 h-full rounded-full" style={{ width: `${d.attendancePct}%` }}></div>
                 </div>
                 <span className="text-xs text-gray-600 w-8 text-right font-medium">{d.attendancePct}%</span>
               </div>
             ))}
             {deptStats.length === 0 && <p className="text-xs text-gray-400">No department data available.</p>}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-500 mb-4">7-Day Trend (P%)</h4>
          <div className="w-full h-48">
            {trendData.length > 1 ? (
              <svg viewBox={`0 0 ${vbWidth} ${vbHeight + 30}`} className="w-full h-full overflow-visible">
                <defs>
                   <linearGradient id="lineGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                   </linearGradient>
                </defs>
                
                {/* Horizontal Grid Lines */}
                <line x1="0" y1="0" x2={vbWidth} y2="0" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1={vbHeight * 0.5} x2={vbWidth} y2={vbHeight * 0.5} stroke="#f3f4f6" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1={vbHeight} x2={vbWidth} y2={vbHeight} stroke="#e5e7eb" strokeWidth="1" />

                {/* Filled Area Under Line */}
                <polygon points={`0,${vbHeight} ${points} ${vbWidth},${vbHeight}`} fill="url(#lineGradient)" />

                {/* The Line */}
                <polyline fill="none" stroke="#3b82f6" strokeWidth="3" points={points} strokeLinecap="round" strokeLinejoin="round" />

                {/* Dots & Labels */}
                {dots.map((dot, i) => (
                  <g key={i}>
                     <circle cx={dot.x} cy={dot.y} r="4" fill="white" stroke="#2563eb" strokeWidth="2" />
                     <text x={dot.x} y={dot.y - 10} textAnchor="middle" fontSize="12" fill="#1f2937" fontWeight="bold">{dot.val}%</text>
                     <text x={dot.x} y={vbHeight + 20} textAnchor="middle" fontSize="11" fill="#6b7280">{dot.label}</text>
                  </g>
                ))}
              </svg>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400 text-sm">Not enough data to display trend</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};