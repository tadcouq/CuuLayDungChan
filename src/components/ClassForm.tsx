import { useState, type FormEvent } from 'react';
import { type ClassItem, parseStudents, validDate } from '../types';
type Draft = Omit<ClassItem, 'id' | 'color'>;
export default function ClassForm({ item, onSave, onCancel }: { item?: ClassItem; onSave: (draft: Draft) => void; onCancel?: () => void }) {
  const [name, setName] = useState(item?.name ?? '');
  const [startDate, setStart] = useState(item?.startDate ?? '');
  const [endDate, setEnd] = useState(item?.endDate ?? '');
  const [count, setCount] = useState(String(item?.studentCount ?? 0));
  const [text, setText] = useState(item?.students.join('\n') ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fileError, setFileError] = useState('');
  const students = parseStudents(text);
  function updateStudents(value: string) { setText(value); setCount(String(parseStudents(value).length)); }
  function submit(e: FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'Vui lòng nhập tên lớp.';
    if (!validDate(startDate)) next.startDate = 'Vui lòng chọn ngày bắt đầu hợp lệ.';
    if (!validDate(endDate)) next.endDate = 'Vui lòng chọn ngày kết thúc hợp lệ.';
    else if (endDate < startDate) next.endDate = 'Ngày kết thúc phải từ ngày bắt đầu trở đi.';
    if (!count.trim() || !Number.isSafeInteger(Number(count)) || Number(count) < 0) next.count = 'Sĩ số phải là số nguyên từ 0 trở lên.';
    setErrors(next);
    if (!Object.keys(next).length) onSave({ name: name.trim(), startDate, endDate, studentCount: Number(count), students });
  }
  const error = (key: string) => errors[key] && <span className="field-error" id={`${key}-error`} role="alert">{errors[key]}</span>;
  return <form onSubmit={submit} noValidate>
    <div className="eyebrow">QUẢN LÝ LỚP HỌC</div><h2>{item ? 'Chỉnh sửa lớp' : 'Thêm lớp mới'}</h2>
    <p className="muted">Điền thông tin để tạo lịch học trên bảng.</p>
    <label>Tên lớp <span className="required">*</span><input autoFocus value={name} onChange={e => setName(e.target.value)} aria-invalid={!!errors.name} aria-describedby="name-error"/>{error('name')}</label>
    <label>Ngày bắt đầu <span className="required">*</span><input type="date" value={startDate} onChange={e => setStart(e.target.value)} aria-invalid={!!errors.startDate} aria-describedby="startDate-error"/>{error('startDate')}</label>
    <label>Ngày kết thúc <span className="required">*</span><input type="date" value={endDate} onChange={e => setEnd(e.target.value)} aria-invalid={!!errors.endDate} aria-describedby="endDate-error"/>{error('endDate')}</label>
    <label>Sĩ số<input type="number" min="0" step="1" value={count} onChange={e => setCount(e.target.value)} aria-invalid={!!errors.count} aria-describedby="count-error"/>{error('count')}</label>
    <label>Danh sách học viên <span className="optional">Tùy chọn</span><textarea rows={5} value={text} onChange={e => updateStudents(e.target.value)} placeholder={'Nguyễn An\nTrần Bình\nMỗi dòng một tên…'}/></label>
    <div className="file-row"><label className="upload">↑ Tải .txt / .csv<input type="file" accept=".txt,.csv,text/plain,text/csv" onChange={async e => {
      const file = e.target.files?.[0]; e.target.value = ''; if (!file) return;
      try { if (!/\.(txt|csv)$/i.test(file.name)) throw new Error(); updateStudents(await file.text()); setFileError(''); }
      catch { setFileError('Không đọc được file. Hãy chọn file .txt hoặc .csv.'); }
    }}/></label><span className="muted">{students.length} tên hợp lệ</span></div>
    <p className="hint">Một tên mỗi dòng; tự bỏ dòng trống và tên trùng. CSV dùng một cột, không tiêu đề.</p>
    {fileError && <p className="field-error" role="alert">{fileError}</p>}
    {Number(count) !== students.length && <p className="warning">Sĩ số ({count || '0'}) khác số tên trong danh sách ({students.length}). Bạn vẫn có thể lưu.</p>}
    <div className="actions"><button className="primary" type="submit">{item ? 'Lưu thay đổi' : '+ Thêm lớp học'}</button>{onCancel && <button type="button" onClick={onCancel}>Hủy</button>}</div>
  </form>;
}
