import { type ClassItem, PALETTE, validDate, validColor } from './types';
const KEY = 'class-gantt-v1';
export function parseImport(text: string): ClassItem[] {
  const data: unknown = JSON.parse(text);
  if (!Array.isArray(data)) throw new Error('JSON phải là một danh sách lớp học.');
  const ids = new Set<string>();
  return data.map((item, i) => {
    if (!item || typeof item !== 'object') throw new Error(`Lớp ${i + 1} không hợp lệ.`);
    const c = item as ClassItem;
    if (typeof c.id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(c.id) || ids.has(c.id) ||
      typeof c.name !== 'string' || !c.name.trim() || typeof c.startDate !== 'string' || !validDate(c.startDate) ||
      typeof c.endDate !== 'string' || !validDate(c.endDate) || c.endDate < c.startDate ||
      !Number.isSafeInteger(c.studentCount) || c.studentCount < 0 ||
      (c.students !== undefined && (!Array.isArray(c.students) || !c.students.every(s => typeof s === 'string')))) {
      throw new Error(`Lớp ${i + 1}: dữ liệu không hợp lệ hoặc ID bị trùng.`);
    }
    ids.add(c.id);
    return { id: c.id, name: c.name.trim(), startDate: c.startDate, endDate: c.endDate, studentCount: c.studentCount,
      students: [...new Set((c.students ?? []).map(s => s.trim()).filter(Boolean))],
      notes: typeof c.notes === 'string' ? c.notes : '',
      courseName: typeof c.courseName === 'string' ? c.courseName.trim() : '',
      previousClassId: typeof c.previousClassId === 'string' && c.previousClassId !== c.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(c.previousClassId) ? c.previousClassId : undefined,
      textColor: typeof c.textColor === 'string' && validColor(c.textColor) ? c.textColor : '#ffffff',
      color: typeof c.color === 'string' && validColor(c.color) ? c.color : PALETTE[i % PALETTE.length] };
  });
}
export function loadClasses(): { items: ClassItem[]; error: string } {
  try { return { items: parseImport(localStorage.getItem(KEY) ?? '[]'), error: '' }; }
  catch { return { items: [], error: 'Không đọc được dữ liệu đã lưu. Dữ liệu cũ chưa bị ghi đè; hãy kiểm tra quyền lưu trữ hoặc nhập JSON hợp lệ.' }; }
}
export function saveClasses(items: ClassItem[]) { localStorage.setItem(KEY, JSON.stringify(items)); }
export function exportClasses(items: ClassItem[]) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url; link.download = 'class-gantt.json'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
