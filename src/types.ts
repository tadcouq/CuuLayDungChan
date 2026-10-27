export interface ClassItem {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  studentCount: number;
  students: string[];
  color: string;
  textColor: string;
  notes: string;
}
export const validColor = (value: string) => /^#[0-9a-f]{6}$/i.test(value);
export const PALETTE = ['#5368d6', '#16877d', '#b56528', '#9252b5', '#c14e70', '#357ca6'];
export const DAY = 86400000;
export const day = (iso: string) => Date.parse(`${iso}T00:00:00Z`) / DAY;
export const isoDate = (n: number) => new Date(n * DAY).toISOString().slice(0, 10);
export const displayDate = (iso: string) => iso.split('-').reverse().join('/');
export const validDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && Number.isFinite(day(s)) && isoDate(day(s)) === s;
export const parseStudents = (text: string) => [...new Set(text.replace(/^\uFEFF/, '').split(/\r?\n/).map(s => s.trim()).filter(Boolean))];
