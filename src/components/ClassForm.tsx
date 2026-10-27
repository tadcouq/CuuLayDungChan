import { useState, type FormEvent } from 'react';
import { type ClassItem, PALETTE, parseStudents, validDate, validColor } from '../types';
type Draft = Omit<ClassItem, 'id'>;
export default function ClassForm({ item, source, defaultColor = PALETTE[0], existingItems = [], onSave, onCancel }: { item?: ClassItem; source?: ClassItem; defaultColor?: string; existingItems?: ClassItem[]; onSave: (draft: Draft) => void; onCancel?: () => void }) {
  const inherited = item ?? source;
  const [name, setName] = useState(item?.name ?? (source ? `${source.name} — học tiếp` : ''));
  const [courseName, setCourseName] = useState(inherited?.courseName ?? '');
  const previousClassId = item?.previousClassId ?? source?.id;
  const previousClass = existingItems.find(c => c.id === previousClassId);
  const [startDate, setStart] = useState(item?.startDate ?? '');
  const [endDate, setEnd] = useState(item?.endDate ?? '');
  const [count, setCount] = useState(String(inherited?.studentCount ?? 0));
  const [text, setText] = useState(inherited?.students.join('\n') ?? '');
  const [notes, setNotes] = useState(inherited?.notes ?? '');
  const [color, setColor] = useState(inherited?.color ?? defaultColor);
  const [textColor, setTextColor] = useState(inherited?.textColor ?? '#ffffff');
  const usedColors = [...new Map(existingItems.map(c => [`${c.color.toLowerCase()}/${c.textColor.toLowerCase()}`, c])).values()];
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
    if (!validColor(color)) next.color = 'Nhập mã hex 6 ký tự, ví dụ #5368D6.';
    if (!validColor(textColor)) next.textColor = 'Nhập mã hex 6 ký tự, ví dụ #FFFFFF.';
    setErrors(next);
    if (!Object.keys(next).length) onSave({ name: name.trim(), courseName: courseName.trim(), previousClassId, startDate, endDate, studentCount: Number(count), students, notes: notes.trim(), color: color.toLowerCase(), textColor: textColor.toLowerCase() });
  }
  const error = (key: string) => errors[key] && <span className="field-error" id={`${key}-error`} role="alert">{errors[key]}</span>;
  return <form onSubmit={submit} noValidate>
    <div className="eyebrow">QUẢN LÝ LỚP HỌC</div><h2>{item ? 'Chỉnh sửa lớp' : source ? 'Tạo lớp học tiếp' : 'Thêm lớp mới'}</h2>
    <p className="muted">Điền thông tin để tạo lịch học trên bảng.</p>
    {source && <p className="hint">Kế thừa học viên, sĩ số, ghi chú và màu từ lớp “{source.name}”. Bạn có thể chỉnh lại tất cả thông tin và chọn thời gian mới. Lớp trước vẫn được giữ nguyên.</p>}
    {previousClass && <p className="hint">Lớp trước: <strong>{previousClass.name}</strong></p>}
    <label>Tên lớp <span className="required">*</span><input autoFocus value={name} onChange={e => setName(e.target.value)} aria-invalid={!!errors.name} aria-describedby="name-error"/>{error('name')}</label>
    <label>Tên khóa học <span className="optional">Tùy chọn</span><input value={courseName} onChange={e => setCourseName(e.target.value)} placeholder="Ví dụ: Tiếng Anh B1, Excel nâng cao" list="course-names"/><datalist id="course-names">{[...new Set(existingItems.map(c => c.courseName).filter(Boolean))].map(course => <option key={course} value={course}/>)}</datalist></label>
    <label>Ngày bắt đầu <span className="required">*</span><input type="date" value={startDate} onChange={e => setStart(e.target.value)} aria-invalid={!!errors.startDate} aria-describedby="startDate-error"/>{error('startDate')}</label>
    <label>Ngày kết thúc <span className="required">*</span><input type="date" value={endDate} onChange={e => setEnd(e.target.value)} aria-invalid={!!errors.endDate} aria-describedby="endDate-error"/>{error('endDate')}</label>
    {previousClass && validDate(startDate) && startDate <= previousClass.endDate && <p className="warning">Lớp học tiếp bắt đầu trước khi lớp trước kết thúc. Bạn vẫn có thể lưu nếu lịch học có chồng lấn.</p>}
    <label>Sĩ số<input type="number" min="0" step="1" value={count} onChange={e => setCount(e.target.value)} aria-invalid={!!errors.count} aria-describedby="count-error"/>{error('count')}</label>
    <label>Ghi chú <span className="optional">Tùy chọn</span><textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Khóa học, đặc điểm chung, lưu ý của lớp…"/></label>
    <fieldset className="node-colors"><legend>Màu node trên sơ đồ</legend>
      <p className="hint">Chọn nhanh một bộ màu hoặc nhập mã hex cho nền và chữ.</p>
      <div className="color-presets" aria-label="Bảng màu chọn nhanh">{PALETTE.map(value => <button type="button" key={value} style={{ background: value, color: '#ffffff' }} aria-label={`Nền ${value}, chữ trắng`} aria-pressed={color.toLowerCase() === value && textColor.toLowerCase() === '#ffffff'} onClick={() => { setColor(value); setTextColor('#ffffff'); }}>Aa</button>)}</div>
      {usedColors.length > 0 && <><p className="hint">Dùng lại màu của lớp đã tạo</p><div className="color-presets used-colors">{usedColors.map(c => <button type="button" key={`${c.color}/${c.textColor}`} title={`${c.name}: ${c.color} / ${c.textColor}`} aria-label={`Dùng màu của ${c.name}: nền ${c.color}, chữ ${c.textColor}`} style={{ background: c.color, color: c.textColor }} onClick={() => { setColor(c.color); setTextColor(c.textColor); }}>Aa</button>)}</div></>}
      {([{ key: 'color', label: 'Màu nền', value: color, set: setColor, fallback: defaultColor }, { key: 'textColor', label: 'Màu chữ', value: textColor, set: setTextColor, fallback: '#ffffff' }]).map(field => <div className="color-field" key={field.key}>
        <label htmlFor={`${field.key}-hex`}>{field.label}</label><div className="color-inputs">
          <input type="color" aria-label={`Chọn ${field.label.toLowerCase()}`} value={validColor(field.value) ? field.value : field.fallback} onChange={e => field.set(e.target.value)}/>
          <input id={`${field.key}-hex`} type="text" value={field.value} spellCheck={false} maxLength={7} placeholder="#FFFFFF" onChange={e => field.set(e.target.value)} aria-invalid={!!errors[field.key]} aria-describedby={`${field.key}-error`}/>
        </div>{error(field.key)}
      </div>)}
      <div className="node-preview" style={{ background: validColor(color) ? color : defaultColor, color: validColor(textColor) ? textColor : '#ffffff' }}><span className="node-course">{courseName.trim() || 'Chưa đặt tên khóa học'}</span><small className="node-class">{name.trim() || 'Xem trước tên lớp'}</small></div>
    </fieldset>
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
