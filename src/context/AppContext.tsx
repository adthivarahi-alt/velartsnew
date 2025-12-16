
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { User, Student, TimetableEntry, AttendanceRecord, Holiday, Role, GoogleSheetsConfig, DEFAULT_DEPARTMENTS, DEFAULT_YEARS, DEFAULT_SECTIONS, DEFAULT_BATCHES } from '../types';
import { initGapiClient, initGisClient, signIn, signOut, fetchSheetData, updateSheetData, clearSheetData } from '../utils/sheets';

interface AppContextType {
  currentUser: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  users: User[];
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
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
  
  // Master Data
  departments: string[];
  years: string[];
  sections: string[];
  batches: string[];
  updateMasterData: (type: 'DEPT' | 'YEAR' | 'SEC' | 'BATCH', operation: 'ADD' | 'REMOVE' | 'UPDATE', value: string, newValue?: string) => void;

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
  
  // Master Data State
  const [departments, setDepartments] = useState<string[]>(DEFAULT_DEPARTMENTS);
  const [years, setYears] = useState<string[]>(DEFAULT_YEARS);
  const [sections, setSections] = useState<string[]>(DEFAULT_SECTIONS);
  const [batches, setBatches] = useState<string[]>(DEFAULT_BATCHES);
  
  // Google Sheets State
  const [googleConfig, setGoogleConfigState] = useState<GoogleSheetsConfig | null>(() => {
    const saved = localStorage.getItem('edu_google_config');
    return saved ? JSON.parse(saved) : null;
  });
  const [isGapiReady, setIsGapiReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');

  // Refs for Auto-Sync logic
  const saveTimeoutRef = useRef<number | null>(null);
  const isLoadingFromSheets = useRef(false);

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

  // Generic Sync function used for both manual and auto-save
  const syncToSheets = async (isAuto = false) => {
    if (!isGapiReady || !googleConfig) return;
    
    setSyncStatus(isAuto ? 'Auto-saving changes...' : 'Syncing to Sheets...');
    
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

      // Attendance - Added Hour column
      const attRows = [['ID', 'Date', 'Hour', 'StudentID', 'Status', 'MarkedBy'], 
        ...attendance.map(a => [a.id, a.date, a.hour, a.studentId, a.status, a.markedBy])];
      await clearSheetData(sid, 'Attendance!A:F');
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

      // Master Data (Stored as Type, Value pairs in a new/used sheet)
      // We will use a sheet named 'Master'. If it doesn't exist, user needs to create it.
      const masterRows = [['Type', 'Value']];
      departments.forEach(d => masterRows.push(['DEPT', d]));
      years.forEach(y => masterRows.push(['YEAR', y]));
      sections.forEach(s => masterRows.push(['SEC', s]));
      batches.forEach(b => masterRows.push(['BATCH', b]));
      
      try {
        await clearSheetData(sid, 'Master!A:B');
        await updateSheetData(sid, 'Master!A1', masterRows);
      } catch (e) {
        console.warn("Master sheet might not exist", e);
      }

      setSyncStatus('All changes saved to Drive');
      if (isAuto) {
         setTimeout(() => setSyncStatus('Connected'), 2000);
      }
    } catch (e) {
      console.error(e);
      setSyncStatus('Sync Failed');
    }
  };

  const loadFromSheets = async () => {
    if (!isGapiReady || !googleConfig) return;
    
    isLoadingFromSheets.current = true; // Prevent auto-save while loading
    setSyncStatus('Loading data from Sheets...');
    
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

      // Attendance - Added Hour reading
      const attRows = await fetchSheetData(sid, 'Attendance!A2:F');
      if (attRows.length) {
        setAttendance(attRows.map(r => ({
          id: r[0], date: r[1], hour: parseInt(r[2] || '1'), studentId: r[3], status: r[4] as any, markedBy: r[5]
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
       
       // Master Data
       try {
         const masterRows = await fetchSheetData(sid, 'Master!A2:B');
         if (masterRows.length) {
            const newDepts: string[] = [];
            const newYears: string[] = [];
            const newSecs: string[] = [];
            const newBatches: string[] = [];
            
            masterRows.forEach(row => {
              const type = row[0];
              const val = row[1];
              if (type === 'DEPT') newDepts.push(val);
              else if (type === 'YEAR') newYears.push(val);
              else if (type === 'SEC') newSecs.push(val);
              else if (type === 'BATCH') newBatches.push(val);
            });
            
            if (newDepts.length) setDepartments(newDepts);
            if (newYears.length) setYears(newYears);
            if (newSecs.length) setSections(newSecs);
            if (newBatches.length) setBatches(newBatches);
         }
       } catch (e) {
         console.warn("Failed to load Master sheet (might not exist yet)");
       }

      setSyncStatus('Data loaded from Sheets');
      setTimeout(() => setSyncStatus('Connected'), 2000);
    } catch (e) {
      console.error(e);
      setSyncStatus('Load Failed');
    } finally {
      // Small delay to let React processing settle before enabling auto-save
      setTimeout(() => {
        isLoadingFromSheets.current = false;
      }, 1000);
    }
  };

  // Automatic Load on Startup/Connect
  useEffect(() => {
    if (isGapiReady && googleConfig) {
      loadFromSheets();
    }
  }, [isGapiReady]); // Only run once when connection is ready

  // Automatic Save on Data Change (Debounced)
  useEffect(() => {
    if (!isGapiReady || !googleConfig || isLoadingFromSheets.current) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    setSyncStatus('Waiting for changes to settle...');
    saveTimeoutRef.current = window.setTimeout(() => {
      syncToSheets(true);
    }, 2000); // 2 second debounce
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [users, students, timetable, attendance, holidays, departments, years, sections, batches]);

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
  
  const updateUser = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

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
      // Check for Date, Student AND Hour uniqueness
      const filtered = prev.filter(a => !(a.date === record.date && a.studentId === record.studentId && a.hour === record.hour));
      return [...filtered, record];
    });
  };

  const addHoliday = (holiday: Holiday) => setHolidays([...holidays, holiday]);
  const removeHoliday = (id: string) => setHolidays(holidays.filter(h => h.id !== id));

  const updateMasterData = (type: 'DEPT' | 'YEAR' | 'SEC' | 'BATCH', operation: 'ADD' | 'REMOVE' | 'UPDATE', value: string, newValue?: string) => {
    const updater = (prev: string[]) => {
      if (operation === 'ADD') {
        if (prev.includes(value)) return prev;
        return [...prev, value];
      } else if (operation === 'REMOVE') {
        return prev.filter(v => v !== value);
      } else if (operation === 'UPDATE' && newValue) {
        return prev.map(v => v === value ? newValue : v);
      }
      return prev;
    };

    if (type === 'DEPT') {
        setDepartments(updater);
        if (operation === 'UPDATE' && newValue) {
            setStudents(prev => prev.map(s => s.department === value ? { ...s, department: newValue } : s));
            setUsers(prev => prev.map(u => u.department === value ? { ...u, department: newValue } : u));
            setTimetable(prev => prev.map(t => {
                const parts = t.classId.split('-');
                // classId format: DEPT-YEAR-SEC
                if (parts.length === 3 && parts[0] === value) return { ...t, classId: `${newValue}-${parts[1]}-${parts[2]}` };
                return t;
            }));
        }
    }
    else if (type === 'YEAR') {
        setYears(updater);
        if (operation === 'UPDATE' && newValue) {
            setStudents(prev => prev.map(s => s.year === value ? { ...s, year: newValue } : s));
            setTimetable(prev => prev.map(t => {
                const parts = t.classId.split('-');
                if (parts.length === 3 && parts[1] === value) return { ...t, classId: `${parts[0]}-${newValue}-${parts[2]}` };
                return t;
            }));
        }
    }
    else if (type === 'SEC') {
        setSections(updater);
        if (operation === 'UPDATE' && newValue) {
            setStudents(prev => prev.map(s => s.section === value ? { ...s, section: newValue } : s));
            setTimetable(prev => prev.map(t => {
                const parts = t.classId.split('-');
                if (parts.length === 3 && parts[2] === value) return { ...t, classId: `${parts[0]}-${parts[1]}-${newValue}` };
                return t;
            }));
        }
    }
    else if (type === 'BATCH') {
        setBatches(updater);
        if (operation === 'UPDATE' && newValue) {
            setStudents(prev => prev.map(s => s.batch === value ? { ...s, batch: newValue } : s));
        }
    }
  };

  return (
    <AppContext.Provider value={{
      currentUser, login, logout,
      users, addUser, updateUser, removeUser,
      students, addStudents,
      timetable, updateTimetable,
      attendance, markAttendance,
      holidays, addHoliday, removeHoliday,
      departments, years, sections, batches, updateMasterData,
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
