import React from 'react';
import { useApp } from '../context/AppContext';
import { Mail, Phone, Briefcase } from 'lucide-react';

export const Staff: React.FC = () => {
  const { users } = useApp();
  const staffMembers = users.filter(u => u.role === 'STAFF');

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Staff Directory</h2>
        <p className="text-gray-500">View contact details and departments of teaching staff</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staffMembers.map(staff => (
          <div key={staff.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{staff.name}</h3>
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-1">
                  {staff.department || 'General'}
                </span>
              </div>
              <div className="bg-gray-100 p-2 rounded-full text-gray-500">
                <Briefcase size={20} />
              </div>
            </div>
            
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-gray-400" />
                <a href={`mailto:${staff.email}`} className="hover:text-blue-600 transition-colors">{staff.email}</a>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-gray-400" />
                <span>{staff.phone || 'No phone listed'}</span>
              </div>
            </div>
          </div>
        ))}
        {staffMembers.length === 0 && (
          <p className="text-gray-500 col-span-3 text-center py-10">No staff members found.</p>
        )}
      </div>
    </div>
  );
};