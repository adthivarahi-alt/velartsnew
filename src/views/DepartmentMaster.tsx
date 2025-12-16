import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Trash2, Plus, Database, Layers, Calendar, Hash, Edit2, Check, X, Users, AlertCircle } from 'lucide-react';

export const DepartmentMaster: React.FC = () => {
  const { departments, years, sections, batches, updateMasterData, students, users } = useApp();
  
  // Local state for inputs
  const [newDept, setNewDept] = useState('');
  const [newYear, setNewYear] = useState('');
  const [newSec, setNewSec] = useState('');
  const [newBatch, setNewBatch] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Editing state
  const [editingItem, setEditingItem] = useState<{type: string, value: string} | null>(null);
  const [editValue, setEditValue] = useState('');

  // Helper to count usage
  const getUsageCount = (type: 'DEPT' | 'YEAR' | 'SEC' | 'BATCH', value: string) => {
    if (type === 'DEPT') {
      const studentCount = students.filter(s => s.department === value).length;
      const staffCount = users.filter(u => u.department === value).length;
      return { count: studentCount + staffCount, label: 'members' };
    }
    if (type === 'YEAR') return { count: students.filter(s => s.year === value).length, label: 'students' };
    if (type === 'SEC') return { count: students.filter(s => s.section === value).length, label: 'students' };
    if (type === 'BATCH') return { count: students.filter(s => s.batch === value).length, label: 'students' };
    return { count: 0, label: '' };
  };

  const validateAndAdd = (type: 'DEPT' | 'YEAR' | 'SEC' | 'BATCH', value: string, setter: (v: string) => void, list: string[]) => {
    if (!value.trim()) return;
    // Case insensitive duplicate check
    if (list.some(item => item.toLowerCase() === value.trim().toLowerCase())) {
      setError(`${value} already exists in ${type} list.`);
      setTimeout(() => setError(null), 3000);
      return;
    }
    updateMasterData(type, 'ADD', value.trim());
    setter('');
    setError(null);
  };

  const handleAdd = (type: 'DEPT' | 'YEAR' | 'SEC' | 'BATCH') => {
    if (type === 'DEPT') validateAndAdd('DEPT', newDept, setNewDept, departments);
    else if (type === 'YEAR') validateAndAdd('YEAR', newYear, setNewYear, years);
    else if (type === 'SEC') validateAndAdd('SEC', newSec, setNewSec, sections);
    else if (type === 'BATCH') validateAndAdd('BATCH', newBatch, setNewBatch, batches);
  };

  const handleRemove = (type: 'DEPT' | 'YEAR' | 'SEC' | 'BATCH', value: string) => {
    const { count, label } = getUsageCount(type, value);
    if (count > 0) {
      if (!window.confirm(`Warning: ${value} is currently assigned to ${count} ${label}. Deleting it may leave records with missing data. Continue?`)) {
        return;
      }
    } else {
      if (!window.confirm(`Are you sure you want to delete ${value}?`)) return;
    }
    updateMasterData(type, 'REMOVE', value);
  };

  const startEdit = (type: string, value: string) => {
    setEditingItem({type, value});
    setEditValue(value);
    setError(null);
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditValue('');
    setError(null);
  };

  const saveEdit = (list: string[]) => {
    if (editingItem && editValue && editValue !== editingItem.value) {
        // Case insensitive duplicate check for edit (excluding itself)
        if (list.some(item => item !== editingItem.value && item.toLowerCase() === editValue.trim().toLowerCase())) {
            setError(`"${editValue}" already exists.`);
            setTimeout(() => setError(null), 3000);
            return;
        }
        updateMasterData(editingItem.type as any, 'UPDATE', editingItem.value, editValue.trim());
    }
    cancelEdit();
  };

  const SectionCard = ({ title, icon, list, value, setValue, type, placeholder, subtitle }: any) => (
    <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-500 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-2 bg-blue-50 rounded-full text-blue-600">
           {icon}
        </div>
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        <span className="ml-auto text-xs font-semibold bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
            {list.length}
        </span>
      </div>
      {subtitle && <p className="text-xs text-gray-400 mb-4">{subtitle}</p>}
      
      <div className="flex gap-2 mb-4">
        <input 
          type="text" 
          value={value} 
          onChange={(e) => setValue(e.target.value)} 
          className="border rounded p-2 flex-1 text-sm outline-blue-500 focus:ring-2 focus:ring-blue-200"
          placeholder={placeholder || `Add ${title}...`}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd(type)}
        />
        <button 
          onClick={() => handleAdd(type)}
          disabled={!value}
          className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50 font-medium text-sm whitespace-nowrap"
        >
          Add New
        </button>
      </div>

      <div className="space-y-2 flex-1 overflow-y-auto max-h-[300px] pr-1">
        {list.length > 0 ? [...list].sort().map((item: string) => {
            const usage = getUsageCount(type, item);
            return (
          <div key={item} className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100 hover:border-blue-300 hover:shadow-sm transition">
             {editingItem?.type === type && editingItem?.value === item ? (
                 <div className="flex items-center gap-2 flex-1 animate-in fade-in duration-200">
                     <input 
                       autoFocus
                       className="border p-1 text-sm rounded flex-1 outline-blue-500"
                       value={editValue}
                       onChange={(e) => setEditValue(e.target.value)}
                       onKeyDown={(e) => e.key === 'Enter' && saveEdit(list)}
                     />
                     <button onClick={() => saveEdit(list)} className="bg-green-100 text-green-600 p-1 rounded hover:bg-green-200" title="Save Update"><Check size={16} /></button>
                     <button onClick={cancelEdit} className="bg-red-100 text-red-500 p-1 rounded hover:bg-red-200" title="Cancel"><X size={16} /></button>
                 </div>
             ) : (
                 <>
                    <div className="flex flex-col">
                        <span className="text-gray-800 font-medium text-sm">{item}</span>
                        {usage.count > 0 && (
                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                <Users size={10} /> {usage.count} {usage.label}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                        onClick={() => startEdit(type, item)}
                        className="text-blue-500 hover:text-blue-700 p-1.5 hover:bg-blue-50 rounded"
                        title="Edit Department Name"
                        >
                        <Edit2 size={16} />
                        </button>
                        <button 
                        onClick={() => handleRemove(type, item)}
                        className="text-gray-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded"
                        title="Delete Department"
                        >
                        <Trash2 size={16} />
                        </button>
                    </div>
                 </>
             )}
          </div>
        )}) : <div className="text-center py-8 text-gray-400 text-xs italic">No entries yet</div>}
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Master Data Management</h2>
        <p className="text-gray-500">Manage institution constants. <span className="text-blue-600 font-medium">Add, Update or Remove Departments.</span></p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 animate-bounce-short">
           <AlertCircle size={20} />
           {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SectionCard 
           title="Departments" 
           subtitle="Add or Update Name"
           icon={<Database size={20} />} 
           list={departments} 
           value={newDept} 
           setValue={setNewDept} 
           type="DEPT"
           placeholder="e.g. CSE"
        />
        <SectionCard 
           title="Years" 
           icon={<Layers size={20} />} 
           list={years} 
           value={newYear} 
           setValue={setNewYear} 
           type="YEAR"
           placeholder="e.g. IV"
        />
        <SectionCard 
           title="Sections" 
           icon={<Hash size={20} />} 
           list={sections} 
           value={newSec} 
           setValue={setNewSec} 
           type="SEC"
           placeholder="e.g. A"
        />
        <SectionCard 
           title="Batches" 
           icon={<Calendar size={20} />} 
           list={batches} 
           value={newBatch} 
           setValue={setNewBatch} 
           type="BATCH"
           placeholder="e.g. 2024-2028"
        />
      </div>
    </div>
  );
};
