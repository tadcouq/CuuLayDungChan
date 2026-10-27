import { type ClassItem, day, displayDate } from '../types';
export default function ClassDetail({ item, items, onSelect, onContinue, onEdit, onDelete, onClose }: { item: ClassItem; items: ClassItem[]; onSelect: (id: string) => void; onContinue: () => void; onEdit: () => void; onDelete: () => void; onClose: () => void }) {
  const previous = items.find(c => c.id === item.previousClassId);
  const next = items.filter(c => c.previousClassId === item.id).sort((a, b) => a.startDate.localeCompare(b.startDate));
  return <section>
    <div className="detail-top"><div className="eyebrow">CHI TIẾT LỚP HỌC</div><button onClick={onClose} aria-label="Đóng chi tiết">×</button></div>
    <h2 className="class-title"><span className="dot" style={{ background: item.color }}/>{item.name}</h2>
    <dl><dt>Khóa học</dt><dd>{item.courseName || 'Chưa đặt tên khóa học'}</dd></dl>
    <div className="class-path"><h3>Lộ trình học</h3>
      {previous ? <button onClick={() => onSelect(previous.id)}>← Lớp trước: {previous.name}</button> : item.previousClassId ? <p className="hint">Lớp trước đã bị xóa hoặc chưa được nhập.</p> : <p className="hint">Lớp đầu trong lộ trình.</p>}
      {next.map(c => <button key={c.id} onClick={() => onSelect(c.id)}>→ {c.name}<small>{c.courseName && `${c.courseName} · `}{displayDate(c.startDate)} — {displayDate(c.endDate)}</small></button>)}
      <button className="new-class" onClick={onContinue}>+ Tạo lớp học tiếp</button>
    </div>
    <dl><dt>Thời gian</dt><dd>{displayDate(item.startDate)} — {displayDate(item.endDate)}</dd><dt>Thời lượng</dt><dd>{day(item.endDate) - day(item.startDate) + 1} ngày</dd><dt>Sĩ số</dt><dd>{item.studentCount} học viên</dd></dl>
    <h3>Ghi chú</h3>
    {item.notes ? <p className="class-notes">{item.notes}</p> : <p className="muted">Chưa có ghi chú.</p>}
    <h3>Danh sách học viên <span className="badge">{item.students.length}</span></h3>
    {item.students.length ? <ol className="students">{item.students.map(name => <li key={name}>{name}</li>)}</ol> : <p className="muted">Chưa có danh sách học viên.</p>}
    {item.studentCount !== item.students.length && <p className="warning">Sĩ số khác số tên trong danh sách.</p>}
    <div className="actions"><button className="primary" onClick={onEdit}>Sửa lớp</button><button className="danger" onClick={() => { if (window.confirm(`Xóa lớp “${item.name}”?`)) onDelete(); }}>Xóa lớp</button></div>
  </section>;
}
