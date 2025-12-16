import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Student, TimetableEntry, AttendanceRecord, Holiday, Role, GoogleSheetsConfig } from '../types';
import { initGapiClient, initGisClient, signIn, signOut, fetchSheetData, updateSheetData, clearSheetData } from '../utils/sheets';

interface AppContextType {
  currentUser: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  users: User[];
  addUser: (user: User) => void;
  removeUser: (id: string) => void;
  students: Student[];
  addStudents: (newStudents: Student[]) => void;
  timetable: TimetableEntry[];
  updateTimetable: (entry: TimetableEntry) => void;
  attendance: AttendanceRecord[];
  markAttendance: (record: AttendanceRecord) => void;
  holidays: Holiday[];
  addHoliday: (holiday: Holiday) => void;
  removeHoliday: (id: string) => void;
  
  // Google Sheets
  googleConfig: GoogleSheetsConfig | null;
  setGoogleConfig: (config: GoogleSheetsConfig | null) => void;
  isGapiReady: boolean;
  handleGoogleLogin: () => void;
  handleGoogleLogout: () => void;
  syncToSheets: () => Promise<void>;
  loadFromSheets: () => Promise<void>;
  syncStatus: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Mock Data (Fallback)
const MOCK_USERS: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@edu.com', password: '123', role: 'ADMIN' },
  { id: '2', name: 'John Doe', email: 'john@edu.com', password: '123', role: 'STAFF', department: 'CSE', phone: '123-456-7890' },
  { id: '3', name: 'Jane Smith', email: 'jane@edu.com', password: '123', role: 'STAFF', department: 'ECE', phone: '987-654-3210' },
];

const MOCK_STUDENTS: Student[] = [
  { id: '1', vano: 'V001', registerNumber: 'REG101', name: 'Alice Johnson', department: 'CSE', year: 'III', batch: '2022-2026', section: 'A' },
  { id: '2', vano: 'V002', registerNumber: 'REG102', name: 'Bob Wilson', department: 'CSE', year: 'III', batch: '2022-2026', section: 'A' },
  { id: '3', vano: 'V003', registerNumber: 'REG103', name: 'Charlie Brown', department: 'CSE', year: 'III', batch: '2022-2026', section: 'B' },
];

const MOCK_TIMETABLE: TimetableEntry[] = [
  { id: '1', day: 'I', hour: 1, classId: 'CSE-III-A', subject: 'Data Structures', staffId: '2' },
  { id: '2', day: 'I', hour: 2, classId: 'CSE-III-A', subject: 'Algorithms', staffId: '3' },
  { id: '3', day: 'I', hour: 1, classId: 'CSE-III-B', subject: 'Database Systems', staffId: '3' },
];

const MOCK_HOLIDAYS: Holiday[] = [
  { id: '1', date: '2024-01-01', name: 'New Year' },
  { id: '2', date: '2024-12-25', name: 'Christmas' },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);
  const [timetable, setTimetable] = useState<TimetableEntry[]>(MOCK_TIMETABLE);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>(MOCK_HOLIDAYS);
  
  // Google Sheets State
  const [googleConfig, setGoogleConfigState] = useState<GoogleSheetsConfig | null>(() => {
    const saved = localStorage.getItem('edu_google_config');
    return saved ? JSON.parse(saved) : null;
  });
  const [isGapiReady, setIsGapiReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');

  const setGoogleConfig = (config: GoogleSheetsConfig | null) => {
    if (config) {
      localStorage.setItem('edu_google_config', JSON.stringify(config));
    } else {
      localStorage.removeItem('edu_google_config');
    }
    setGoogleConfigState(config);
  };

  useEffect(() => {
    if (googleConfig) {
      const init = async () => {
        try {
          await initGapiClient(googleConfig);
          initGisClient(googleConfig, () => {
            setIsGapiReady(true);
            setSyncStatus('Connected to Google');
          });
        } catch (error) {
          console.error("Failed to init GAPI", error);
          setSyncStatus('Failed to connect to Google');
        }
      };
      init();
    }
  }, [googleConfig]);

  const handleGoogleLogin = () => {
    if (googleConfig) signIn();
  };

  const handleGoogleLogout = () => {
    signOut();
    setIsGapiReady(false);
    setSyncStatus('');
  };

  const syncToSheets = async () => {
    if (!isGapiReady || !googleConfig) return;
    setSyncStatus('Syncing to Sheets...');
    try {
      const sid = googleConfig.spreadsheetId;
      
      // Users
      const userRows = [['ID', 'Name', 'Email', 'Password', 'Role', 'Dept', 'Phone'], 
        ...users.map(u => [u.id, u.name, u.email, u.password || '', u.role, u.department || '', u.phone || ''])];
      await clearSheetData(sid, 'Users!A:G');
      await updateSheetData(sid, 'Users!A1', userRows);

      // Students
      const studRows = [['ID', 'Vano', 'RegNo', 'Name', 'Dept', 'Year', 'Batch', 'Section'], 
        ...students.map(s => [s.id, s.vano, s.registerNumber, s.name, s.department, s.year, s.batch, s.section || 'A'])];
      await clearSheetData(sid, 'Students!A:H');
      await updateSheetData(sid, 'Students!A1', studRows);

      // Attendance
      const attRows = [['ID', 'Date', 'StudentID', 'Status', 'MarkedBy'], 
        ...attendance.map(a => [a.id, a.date, a.studentId, a.status, a.markedBy])];
      await clearSheetData(sid, 'Attendance!A:E');
      await updateSheetData(sid, 'Attendance!A1', attRows);

      // Timetable
      const timeRows = [['ID', 'Day', 'Hour', 'ClassID', 'Subject', 'StaffID'], 
        ...timetable.map(t => [t.id, t.day, t.hour, t.classId, t.subject, t.staffId])];
      await clearSheetData(sid, 'Timetable!A:F');
      await updateSheetData(sid, 'Timetable!A1', timeRows);
      
      // Holidays
      const holRows = [['ID', 'Date', 'Name'], ...holidays.map(h => [h.id, h.date, h.name])];
      await clearSheetData(sid, 'Holidays!A:C');
      await updateSheetData(sid, 'Holidays!A1', holRows);

      setSyncStatus('Sync Complete!');
      setTimeout(() => setSyncStatus('Connected'), 3000);
    } catch (e) {
      console.error(e);
      setSyncStatus('Sync Failed');
    }
  };

  const loadFromSheets = async () => {
    if (!isGapiReady || !googleConfig) return;
    setSyncStatus('Loading from Sheets...');
    try {
      const sid = googleConfig.spreadsheetId;

      // Users
      const userRows = await fetchSheetData(sid, 'Users!A2:G');
      if (userRows.length) {
        setUsers(userRows.map(r => ({
          id: r[0], name: r[1], email: r[2], password: r[3], role: r[4] as Role, department: r[5], phone: r[6]
        })));
      }

      // Students
      const studRows = await fetchSheetData(sid, 'Students!A2:H');
      if (studRows.length) {
        setStudents(studRows.map(r => ({
          id: r[0], vano: r[1], registerNumber: r[2], name: r[3], department: r[4], year: r[5], batch: r[6], section: r[7]
        })));
      }

      // Attendance
      const attRows = await fetchSheetData(sid, 'Attendance!A2:E');
      if (attRows.length) {
        setAttendance(attRows.map(r => ({
          id: r[0], date: r[1], studentId: r[2], status: r[3] as any, markedBy: r[4]
        })));
      }

       // Timetable
       const timeRows = await fetchSheetData(sid, 'Timetable!A2:F');
       if (timeRows.length) {
         setTimetable(timeRows.map(r => ({
           id: r[0], day: r[1], hour: parseInt(r[2]), classId: r[3], subject: r[4], staffId: r[5]
         })));
       }

       // Holidays
       const holRows = await fetchSheetData(sid, 'Holidays!A2:C');
       if (holRows.length) {
         setHolidays(holRows.map(r => ({ id: r[0], date: r[1], name: r[2] })));
       }

      setSyncStatus('Data Loaded!');
      setTimeout(() => setSyncStatus('Connected'), 3000);
    } catch (e) {
      console.error(e);
      setSyncStatus('Load Failed');
    }
  };

  const login = (email: string, password: string) => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => setCurrentUser(null);

  const addUser = (user: User) => setUsers([...users, user]);
  const removeUser = (id: string) => setUsers(users.filter(u => u.id !== id));

  const addStudents = (newStudents: Student[]) => {
    setStudents(prev => [...prev, ...newStudents]);
  };

  const updateTimetable = (entry: TimetableEntry) => {
    setTimetable(prev => {
      const filtered = prev.filter(t => !(t.day === entry.day && t.hour === entry.hour && t.classId === entry.classId));
      return [...filtered, entry];
    });
  };

  const markAttendance = (record: AttendanceRecord) => {
    setAttendance(prev => {
      const filtered = prev.filter(a => !(a.date === record.date && a.studentId === record.studentId));
      return [...filtered, record];
    });
  };

  const addHoliday = (holiday: Holiday) => setHolidays([...holidays, holiday]);
  const removeHoliday = (id: string) => setHolidays(holidays.filter(h => h.id !== id));

  return (
    <AppContext.Provider value={{
      currentUser, login, logout,
      users, addUser, removeUser,
      students, addStudents,
      timetable, updateTimetable,
      attendance, markAttendance,
      holidays, addHoliday, removeHoliday,
      googleConfig, setGoogleConfig, isGapiReady, handleGoogleLogin, handleGoogleLogout, syncToSheets, loadFromSheets, syncStatus
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};