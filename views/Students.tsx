import React, { useRef, useState } from 'react';
    import { useApp } from '../context/AppContext';
    import { Upload, Search, FileText, Download, Trash2 } from 'lucide-react';
    import { Student } from '../types';

    export const Students: React.FC = () => {
      const { students, addStudents } = useApp();
      const [searchTerm, setSearchTerm] = useState('');
      const fileInputRef = useRef<HTMLInputElement>(null);
      const [uploadStats, setUploadStats] = useState<string | null>(null);

      const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const text = await file.text();
        const lines = text.split('\n');
        const newStudents: Student[] = [];

        // Skip header if present, handle basic CSV parsing
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          // Format: Vano, Register Number, Name, Department, Year, Batch
          const parts = line.split(',').map(p => p.trim());
          if (parts.length >= 6) {
            newStudents.push({
              id: Date.now().toString() + Math.random().toString(),
              vano: parts[0],
              registerNumber: parts[1],
              name: parts[2],
              department: parts[3],
              year: parts[4],
              batch: parts[5],
              section: 'A' // Default section for bulk upload
            });
          }
        }

        addStudents(newStudents);
        setUploadStats(`Successfully uploaded ${newStudents.length} students (Default Section: A).`);
        if(fileInputRef.current) fileInputRef.current.value = '';
        setTimeout(() => setUploadStats(null), 3000);
      };

      const filteredStudents = students.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.registerNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.department.toLowerCase().includes(searchTerm.toLowerCase())
      );

      const handleExport = () => {
        let csvContent = "data:text/csv;charset=utf-8,Vano,Register Number,Name,Department,Year,Batch,Section\n";
        students.forEach(s => {
          csvContent += `${s.vano},${s.registerNumber},${s.name},${s.department},${s.year},${s.batch},${s.section || 'A'}\n`;
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "students.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };

      return (
        <div className="p-8">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Student Directory</h2>
              <p className="text-gray-500">Manage student records and admissions</p>
            </div>
            
            <div className="flex gap-2">
              <button 
                 onClick={() => fileInputRef.current?.click()}
                 className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition-colors"
              >
                <Upload size={18} />
                Upload CSV
              </button>
              <button 
                 onClick={handleExport}
                 className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded shadow transition-colors"
              >
                <Download size={18} />
                Export
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".csv" 
                onChange={handleFileUpload}
              />
            </div>
          </div>

          {uploadStats && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{uploadStats}</span>
            </div>
          )}

          <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex items-center gap-4">
            <Search className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by Name, Reg No, or Department..." 
              className="flex-1 outline-none text-gray-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reg No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vano</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dept</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year/Batch</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.registerNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.vano}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {student.department}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.year} ({student.batch})</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.section || 'A'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <FileText size={48} className="mb-2 text-gray-300" />
                        <p>No students found. Upload a CSV list to get started.</p>
                        <p className="text-xs mt-2 text-gray-400">Format: Vano, RegNo, Name, Dept, Year, Batch</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      );
    };