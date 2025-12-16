import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  GraduationCap, 
  ClipboardCheck, 
  LogOut, 
  Settings,
  Palmtree,
  FileSpreadsheet,
  Database
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  setView: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const { currentUser, logout, syncStatus } = useApp();
  const isAdmin = currentUser?.role === 'ADMIN';

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'timetable', label: 'Timetable', icon: <CalendarDays size={20} /> },
    { id: 'attendance', label: 'Attendance', icon: <ClipboardCheck size={20} /> },
    { id: 'reports', label: 'Reports', icon: <FileSpreadsheet size={20} /> },
    { id: 'students', label: 'Students', icon: <GraduationCap size={20} /> },
    ...(isAdmin ? [
      { id: 'staff', label: 'Staff Directory', icon: <Users size={20} /> },
      { id: 'master', label: 'Department Master', icon: <Database size={20} /> },
      { id: 'holidays', label: 'Holidays', icon: <Palmtree size={20} /> },
      { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
    ] : [
      { id: 'staff', label: 'Staff Directory', icon: <Users size={20} /> }
    ])
  ];

  return (
    <div className="h-screen w-64 bg-slate-900 text-white flex flex-col fixed left-0 top-0 overflow-y-auto z-50">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">EduManager</h1>
        <p className="text-xs text-slate-400 mt-1">School Management System</p>
      </div>

      <div className="flex-1 py-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center gap-3 px-6 py-3 transition-colors ${
              currentView === item.id 
                ? 'bg-blue-600 text-white' 
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-slate-800">
         {syncStatus && (
           <div className="mb-4 px-2 py-1 bg-slate-800 rounded text-xs text-green-400 text-center border border-slate-700">
             {syncStatus}
           </div>
         )}
        <div className="mb-4 px-2">
          <p className="text-sm font-medium text-white">{currentUser?.name}</p>
          <p className="text-xs text-slate-400">{currentUser?.role}</p>
        </div>
        <button 
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-red-600/20 hover:text-red-400 text-slate-300 py-2 rounded-md transition-all"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );
};
