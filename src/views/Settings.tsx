import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Save, Database, LogIn, LogOut, RefreshCw, Upload, Download } from 'lucide-react';

export const Settings: React.FC = () => {
  const { googleConfig, setGoogleConfig, isGapiReady, handleGoogleLogin, handleGoogleLogout, syncToSheets, loadFromSheets, syncStatus } = useApp();
  
  const [formData, setFormData] = useState({ apiKey: '', clientId: '', spreadsheetId: '' });

  useEffect(() => {
    if (googleConfig) {
      setFormData(googleConfig);
    }
  }, [googleConfig]);

  const handleSave = () => {
    if (formData.apiKey && formData.clientId && formData.spreadsheetId) {
      setGoogleConfig(formData);
    }
  };

  const handleDisconnect = () => {
    handleGoogleLogout();
    setGoogleConfig(null);
    setFormData({ apiKey: '', clientId: '', spreadsheetId: '' });
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">System Settings</h2>
        <p className="text-gray-500">Configure database connections and external services</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Google Sheets Config */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-green-100 p-2 rounded-full text-green-600">
               <Database size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Google Sheets Database</h3>
              <p className="text-xs text-gray-500">Connect to a Google Sheet to store your data</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
              <input 
                type="text" 
                className="w-full border p-2 rounded outline-blue-500 font-mono text-sm"
                value={formData.apiKey}
                onChange={e => setFormData({...formData, apiKey: e.target.value})}
                placeholder="AIza..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client ID</label>
              <input 
                type="text" 
                className="w-full border p-2 rounded outline-blue-500 font-mono text-sm"
                value={formData.clientId}
                onChange={e => setFormData({...formData, clientId: e.target.value})}
                placeholder="...apps.googleusercontent.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Spreadsheet ID</label>
              <input 
                type="text" 
                className="w-full border p-2 rounded outline-blue-500 font-mono text-sm"
                value={formData.spreadsheetId}
                onChange={e => setFormData({...formData, spreadsheetId: e.target.value})}
                placeholder="1BxiM..."
              />
              <p className="text-xs text-gray-400 mt-1">Ensure the sheet has tabs: Users, Students, Attendance, Timetable, Holidays</p>
            </div>
            
            <div className="pt-4 flex gap-2">
              <button 
                onClick={handleSave}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
              >
                <Save size={16} /> Save Config
              </button>
              {googleConfig && (
                <button 
                  onClick={handleDisconnect}
                  className="bg-red-100 text-red-600 px-4 py-2 rounded hover:bg-red-200 border border-red-200"
                >
                  Disconnect
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sync Controls */}
        <div className="bg-white p-6 rounded-lg shadow-md">
           <h3 className="text-lg font-bold text-gray-800 mb-4">Sync Status</h3>
           <div className={`p-4 rounded-lg mb-6 flex items-center justify-between ${isGapiReady ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-500 border border-gray-200'}`}>
             <div className="flex items-center gap-3">
               <div className={`w-3 h-3 rounded-full ${isGapiReady ? 'bg-green-500' : 'bg-gray-400'}`}></div>
               <span className="font-medium">{syncStatus || (googleConfig ? 'Waiting for Auth...' : 'Not Configured')}</span>
             </div>
             {googleConfig && !isGapiReady && (
               <button onClick={handleGoogleLogin} className="text-sm bg-white border px-3 py-1 rounded shadow-sm hover:bg-gray-50 flex items-center gap-2">
                 <LogIn size={14} /> Login
               </button>
             )}
             {isGapiReady && (
               <button onClick={handleGoogleLogout} className="text-sm bg-white border px-3 py-1 rounded shadow-sm hover:bg-gray-50 flex items-center gap-2">
                 <LogOut size={14} /> Logout
               </button>
             )}
           </div>

           {isGapiReady && (
             <div className="grid grid-cols-1 gap-4">
               <button onClick={loadFromSheets} className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white p-3 rounded hover:bg-indigo-700 transition">
                 <Download size={20} /> Load Data from Sheets
               </button>
               <button onClick={syncToSheets} className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white p-3 rounded hover:bg-emerald-700 transition">
                 <Upload size={20} /> Sync Local Data to Sheets
               </button>
               <p className="text-xs text-center text-gray-400 mt-2">
                 Warning: Loading will overwrite local changes. Syncing will overwrite Sheet data.
               </p>
             </div>
           )}
           
           {!googleConfig && (
             <div className="text-center py-10 text-gray-400">
               Configure API settings to enable sync.
             </div>
           )}
        </div>
      </div>
    </div>
  );
};