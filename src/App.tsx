import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './views/Dashboard';
import { Timetable } from './views/Timetable';
import { Students } from './views/Students';
import { Attendance } from './views/Attendance';
import { Staff } from './views/Staff';
import { AdminUsers } from './views/AdminUsers';
import { Holidays } from './views/Holidays';
import { Settings } from './views/Settings';
import { Reports } from './views/Reports';
import { DepartmentMaster } from './views/DepartmentMaster';
import { Lock, Eye, EyeOff } from 'lucide-react';

const LoginForm: React.FC = () => {
  const { login } = useApp();
  const [email, setEmail] = useState('admin@edu.com');
  const [password, setPassword] = useState('123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(email, password);
    if (!success) {
      setError('Invalid email or password');
    }
  };

  const setDemoCreds = (type: 'ADMIN' | 'STAFF') => {
    if (type === 'ADMIN') {
      setEmail('admin@edu.com');
      setPassword('123');
    } else {
      setEmail('john@edu.com');
      setPassword('123');
    }
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-100 p-3 rounded-full text-blue-600">
            <Lock size={32} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">EduManager Login</h2>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm text-center border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <input 
              type="email" 
              className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 outline-none pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button 
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 mt-1"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">Quick Login (Demo)</label>
             <div className="flex gap-4">
               <button 
                 type="button"
                 onClick={() => setDemoCreds('ADMIN')}
                 className="flex-1 py-2 rounded border bg-white text-gray-700 border-gray-300 hover:bg-gray-50 transition-colors"
               >
                 Admin
               </button>
               <button 
                 type="button"
                 onClick={() => setDemoCreds('STAFF')}
                 className="flex-1 py-2 rounded border bg-white text-gray-700 border-gray-300 hover:bg-gray-50 transition-colors"
               >
                 Staff
               </button>
             </div>
          </div>

          <button 
            type="submit" 
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Sign In
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-gray-400">
          Default password for demo accounts is <strong>123</strong>
        </p>
      </div>
    </div>
  );
};

const MainLayout: React.FC = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const { currentUser } = useApp();

  const renderView = () => {
    switch(currentView) {
      case 'dashboard': return <Dashboard />;
      case 'timetable': return <Timetable />;
      case 'students': return <Students />;
      case 'attendance': return <Attendance />;
      case 'staff': return <Staff />;
      case 'reports': return <Reports />;
      case 'users': return currentUser?.role === 'ADMIN' ? <AdminUsers /> : <Dashboard />;
      case 'holidays': return currentUser?.role === 'ADMIN' ? <Holidays /> : <Dashboard />;
      case 'settings': return currentUser?.role === 'ADMIN' ? <Settings /> : <Dashboard />;
      case 'master': return currentUser?.role === 'ADMIN' ? <DepartmentMaster /> : <Dashboard />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar currentView={currentView} setView={setCurrentView} />
      <div className="flex-1 ml-64">
        {renderView()}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const { currentUser } = useApp();
  return currentUser ? <MainLayout /> : <LoginForm />;
};

export default App;
