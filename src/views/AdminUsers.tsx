import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';
import { Trash2, Shield, User as UserIcon, Edit2, X } from 'lucide-react';

export const AdminUsers: React.FC = () => {
  const { users, addUser, updateUser, removeUser, departments } = useApp();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'STAFF' as Role, department: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email) {
      // Default to first department if not selected and role is STAFF
      const dept = formData.role === 'STAFF' && !formData.department && departments.length > 0 
        ? departments[0] 
        : formData.department;

      if (editingId) {
        // Update Existing
        const existingUser = users.find(u => u.id === editingId);
        if (existingUser) {
          updateUser({
            ...existingUser,
            name: formData.name,
            email: formData.email,
            password: formData.password || existingUser.password, // Keep old password if not changed
            role: formData.role,
            department: formData.role === 'STAFF' ? dept : undefined
          });
        }
        setEditingId(null);
      } else {
        // Create New
        if (!formData.password) {
            alert("Password is required for new users.");
            return;
        }
        addUser({
          id: Date.now().toString(),
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          department: formData.role === 'STAFF' ? dept : undefined
        });
      }
      
      setFormData({ name: '', email: '', password: '', role: 'STAFF', department: '' });
    }
  };

  const handleEdit = (user: any) => {
    setEditingId(user.id);
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Don't show password, allow overwrite
      role: user.role,
      department: user.department || ''
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', email: '', password: '', role: 'STAFF', department: '' });
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">User Management</h2>
        <p className="text-gray-500">Create and manage admin and staff accounts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create/Edit User Form */}
        <div className="bg-white p-6 rounded-lg shadow-md h-fit border-t-4 border-blue-500">
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-lg font-bold">{editingId ? 'Edit User' : 'Add New User'}</h3>
             {editingId && (
               <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
             )}
          </div>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Full Name</label>
              <input 
                className="w-full border p-2 rounded outline-blue-500"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Email Address</label>
              <input 
                type="email"
                className="w-full border p-2 rounded outline-blue-500"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Password {editingId && <span className="text-gray-400 font-normal">(Leave blank to keep current)</span>}</label>
              <input 
                type="password"
                className="w-full border p-2 rounded outline-blue-500"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                placeholder={editingId ? "********" : "Set initial password"}
                required={!editingId}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Role</label>
              <select 
                className="w-full border p-2 rounded outline-blue-500"
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value as Role})}
              >
                <option value="STAFF">Staff</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            {formData.role === 'STAFF' && (
              <div>
                <label className="block text-sm text-gray-600 mb-1">Department</label>
                <select 
                  className="w-full border p-2 rounded outline-blue-500"
                  value={formData.department}
                  onChange={e => setFormData({...formData, department: e.target.value})}
                  required
                >
                  <option value="" disabled>Select Department</option>
                  {departments.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            )}
            <button className={`py-2 rounded text-white font-medium transition ${editingId ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
               {editingId ? 'Update User' : 'Create User'}
            </button>
          </form>
        </div>

        {/* User List */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
           <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user.id} className={`hover:bg-gray-50 ${editingId === user.id ? 'bg-blue-50' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                        {user.role === 'ADMIN' ? <Shield size={20} /> : <UserIcon size={20} />}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.department || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                        <button 
                        onClick={() => handleEdit(user)}
                        className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                        title="Edit User"
                        >
                        <Edit2 size={18} />
                        </button>
                        <button 
                        onClick={() => removeUser(user.id)}
                        className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                        title="Remove User"
                        >
                        <Trash2 size={18} />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
