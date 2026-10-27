import { useState, type CSSProperties } from 'react';
import { type ClassItem, DAY, day, isoDate, displayDate } from '../types';
import { timelineRows } from '../timeline';
type Zoom = 'Ngày' | 'Tuần' | 'Tháng';
export default function Gantt({ items, selectedId, onSelect }: { items: ClassItem[]; selectedId?: string; onSelect: (id: string) => void }) {
  const [zoom, setZoom] = useState<Zoom>('Tuần');
  const [tooltip, setTooltip] = useState<{ item: ClassItem; x: number; y: number } | null>(null);
  const now = new Date();
  const today = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / DAY);
  const rows = timelineRows(items);
  const min = items.length ? Math.min(...items.map(c => day(c.startDate))) - 7 : today - 7;
  const max = items.length ? Math.max(...items.map(c => day(c.endDate))) + 7 : today + 7;
  const total = max - min + 1;
  const scale = { Ngày: 42, Tuần: 17, Tháng: 5 }[zoom];
  const ticks: { start: number; end: number; label: string }[] = [];
  for (let start = min; start <= max;) {
    const date = new Date(start * DAY);
    let end = start + 1;
    if (zoom === 'Tuần') end = start + (7 - ((date.getUTCDay() + 6) % 7));
    if (zoom === 'Tháng') { date.setUTCMonth(date.getUTCMonth() + 1, 1); end = date.getTime() / DAY; }
    end = Math.min(end, max + 1);
    const iso = isoDate(start);
    ticks.push({ start, end, label: zoom === 'Tháng' ? `Tháng ${Number(iso.slice(5, 7))}/${iso.slice(0, 4)}` : displayDate(iso).slice(0, 5) });
    start = end;
  }
  const pos = (n: number) => `${(n - min) / total * 100}%`;
  return <section className="gantt-card">
    <div className="gantt-toolbar"><div><h2>Lịch lớp học <span className="badge">{items.length}</span></h2><p className="muted">{items.length ? `${displayDate(isoDate(min))} — ${displayDate(isoDate(max))}` : 'Tất cả lớp học trên một bảng thời gian'}</p></div><div className="zoom" aria-label="Độ thu phóng">{(['Ngày', 'Tuần', 'Tháng'] as Zoom[]).map(z => <button key={z} aria-pressed={zoom === z} className={zoom === z ? 'active' : ''} onClick={() => { setZoom(z); setTooltip(null); }}>{z}</button>)}</div></div>
    {!items.length ? <div className="empty"><div className="empty-icon">▤</div><h3>Bắt đầu với lớp học đầu tiên</h3><p>Thêm lớp ở biểu mẫu bên trái.<br/>Lịch học của các lớp sẽ cùng xuất hiện tại đây.</p></div> : <>
      <div className="gantt-scroll" onScroll={() => setTooltip(null)}>
        <div className="gantt-grid" style={{ '--timeline-width': `${total * scale}px` } as CSSProperties}>
          <div className="row-label axis-label">LỚP HỌC / SĨ SỐ</div>
          <div className="timeline axis">{ticks.map(t => <div key={t.start} className="tick" style={{ left: pos(t.start), width: `${(t.end - t.start) / total * 100}%` }}>{t.label}</div>)}</div>
          {rows.map(({ root, nodes, height }) => <div className="gantt-row" key={root.id}>
            <button className={`row-label class-label ${nodes.some(n => n.item.id === selectedId) ? 'selected' : ''}`} style={{ height }} onClick={() => onSelect(root.id)}><span className="dot" style={{ background: root.color }}/><span><strong>{root.name}</strong><small title={root.courseName}>{nodes.length > 1 ? `${nodes.length} đợt học · ` : ''}{root.courseName || `${root.studentCount} học viên`}</small></span></button>
            <div className={`timeline lane ${nodes.some(n => n.item.id === selectedId) ? 'selected' : ''}`} style={{ height }}>
              {ticks.map(t => <span key={t.start} className="grid-line" style={{ left: pos(t.start) }}/>) }
              {nodes.map(({ item, track }) => <button key={item.id} className={`bar ${selectedId === item.id ? 'bar-selected' : ''}`} aria-pressed={selectedId === item.id} style={{ top: 13 + track * 50, left: pos(day(item.startDate)), width: `${(day(item.endDate) - day(item.startDate) + 1) / total * 100}%`, background: item.color, color: item.textColor }} onClick={() => onSelect(item.id)}
                title={`${item.courseName || 'Chưa đặt tên khóa học'} — ${item.name}`} aria-label={`${item.courseName || 'Chưa đặt tên khóa học'}, ${item.name}, ${displayDate(item.startDate)} đến ${displayDate(item.endDate)}, ${item.studentCount} học viên`}
                onMouseEnter={e => { const r = e.currentTarget.getBoundingClientRect(); setTooltip({ item, x: Math.max(8, Math.min(e.clientX, window.innerWidth - 296)), y: Math.max(8, Math.min(r.bottom + 8, window.innerHeight - 150)) }); }}
                onMouseLeave={() => setTooltip(null)} onFocus={e => { const r = e.currentTarget.getBoundingClientRect(); setTooltip({ item, x: Math.max(8, Math.min(r.left, window.innerWidth - 296)), y: Math.max(8, Math.min(r.bottom + 8, window.innerHeight - 150)) }); }} onBlur={() => setTooltip(null)}><span className="node-course">{item.courseName || 'Chưa đặt tên khóa học'}</span><small className="node-class">{item.name}</small></button>)}
            </div>
          </div>)}
          {today >= min && today <= max && <div className="today-overlay"><div className="today-line" style={{ left: pos(today + 0.5) }}><span>Hôm nay</span></div></div>}
        </div>
      </div>
      <div className="gantt-footer"><span><i/> Hôm nay · {displayDate(isoDate(today))}</span><span>Chọn lớp để xem chi tiết · Cuộn ngang để xem thêm</span></div>
    </>}
    {tooltip && <div role="tooltip" className="tooltip" style={{ left: tooltip.x, top: tooltip.y }}><strong>{tooltip.item.name}</strong>{tooltip.item.courseName && <span>Khóa học: {tooltip.item.courseName}</span>}<span>{displayDate(tooltip.item.startDate)} — {displayDate(tooltip.item.endDate)}</span><span>{day(tooltip.item.endDate) - day(tooltip.item.startDate) + 1} ngày · {tooltip.item.studentCount} học viên</span></div>}
  </section>;
}
