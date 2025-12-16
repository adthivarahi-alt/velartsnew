import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Trash2, Plus, Calendar } from 'lucide-react';

export const Holidays: React.FC = () => {
  const { holidays, addHoliday, removeHoliday } = useApp();
  const [newDate, setNewDate] = useState('');
  const [newName, setNewName] = useState('');

  const handleAdd = () => {
    if(newDate && newName) {
      addHoliday({
        id: Date.now().toString(),
        date: newDate,
        name: newName
      });
      setNewDate('');
      setNewName('');
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Holiday Manager</h2>
        <p className="text-gray-500">Configure holidays to block attendance marking</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
           <h3 className="text-lg font-semibold mb-4 text-gray-700">Add New Holiday</h3>
           <div className="flex flex-col gap-4">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
               <input 
                 type="date" 
                 className="w-full border p-2 rounded" 
                 value={newDate}
                 onChange={(e) => setNewDate(e.target.value)}
               />
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Holiday Name</label>
               <input 
                 type="text" 
                 placeholder="e.g. Independence Day"
                 className="w-full border p-2 rounded" 
                 value={newName}
                 onChange={(e) => setNewName(e.target.value)}
               />
             </div>
             <button 
               onClick={handleAdd}
               disabled={!newDate || !newName}
               className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center gap-2"
             >
               <Plus size={18} /> Add Holiday
             </button>
           </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Upcoming Holidays</h3>
          <div className="space-y-3">
            {holidays.length > 0 ? holidays.sort((a,b) => a.date.localeCompare(b.date)).map(h => (
              <div key={h.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-100">
                <div className="flex items-center gap-3">
                   <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
                     <Calendar size={18} />
                   </div>
                   <div>
                     <p className="font-semibold text-gray-800">{h.name}</p>
                     <p className="text-xs text-gray-500">{h.date}</p>
                   </div>
                </div>
                <button 
                  onClick={() => removeHoliday(h.id)}
                  className="text-red-400 hover:text-red-600 p-1"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            )) : (
              <p className="text-gray-500 italic">No holidays configured.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};