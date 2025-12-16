export type Role = 'ADMIN' | 'STAFF';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  department?: string; // For staff
  phone?: string;
}

export interface Student {
  id: string;
  vano: string;
  registerNumber: string;
  name: string;
  department: string;
  year: string;
  batch: string;
  section?: string; // Added section
}

export interface TimetableEntry {
  id: string;
  day: string; // "I", "II", etc.
  hour: number; // 1-6
  classId: string; // e.g., "CSE-III-A"
  subject: string;
  staffId: string;
}

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  studentId: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  markedBy: string;
}

export interface Holiday {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
}

export interface GoogleSheetsConfig {
  apiKey: string;
  clientId: string;
  spreadsheetId: string;
}

export const DAYS_OF_WEEK = ['I', 'II', 'III', 'IV', 'V', 'VI'];
export const HOURS_PER_DAY = [1, 2, 3, 4, 5, 6];

// Defaults for initialization
export const DEFAULT_DEPARTMENTS = ['CSE', 'ECE', 'MECH', 'CIVIL', 'EEE'];
export const DEFAULT_YEARS = ['I', 'II', 'III', 'IV'];
export const DEFAULT_SECTIONS = ['A', 'B', 'C'];
export const DEFAULT_BATCHES = ['2022-2026', '2023-2027', '2024-2028', '2025-2029'];

// Backward compatibility (deprecated, use context instead)
export const DEPARTMENTS = DEFAULT_DEPARTMENTS;
export const YEARS = DEFAULT_YEARS;
export const SECTIONS = DEFAULT_SECTIONS;
