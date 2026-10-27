import { type ClassItem, day, displayDate } from '../types';
export default function ClassDetail({ item, onEdit, onDelete, onClose }: { item: ClassItem; onEdit: () => void; onDelete: () => void; onClose: () => void }) {
  return <section>
    <div className="detail-top"><div className="eyebrow">CHI TIẾT LỚP HỌC</div><button onClick={onClose} aria-label="Đóng chi tiết">×</button></div>
    <h2 className="class-title"><span className="dot" style={{ background: item.color }}/>{item.name}</h2>
    <dl><dt>Thời gian</dt><dd>{displayDate(item.startDate)} — {displayDate(item.endDate)}</dd><dt>Thời lượng</dt><dd>{day(item.endDate) - day(item.startDate) + 1} ngày</dd><dt>Sĩ số</dt><dd>{item.studentCount} học viên</dd></dl>
    <h3>Ghi chú</h3>
    {item.notes ? <p className="class-notes">{item.notes}</p> : <p className="muted">Chưa có ghi chú.</p>}
    <h3>Danh sách học viên <span className="badge">{item.students.length}</span></h3>
    {item.students.length ? <ol className="students">{item.students.map(name => <li key={name}>{name}</li>)}</ol> : <p className="muted">Chưa có danh sách học viên.</p>}
    {item.studentCount !== item.students.length && <p className="warning">Sĩ số khác số tên trong danh sách.</p>}
    <div className="actions"><button className="primary" onClick={onEdit}>Sửa lớp</button><button className="danger" onClick={() => { if (window.confirm(`Xóa lớp “${item.name}”?`)) onDelete(); }}>Xóa lớp</button></div>
  </section>;
}
