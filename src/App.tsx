import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { type ClassItem, PALETTE } from './types';
import { exportClasses, loadClasses, parseImport, saveClasses } from './storage';
import ClassForm from './components/ClassForm';
import ClassDetail from './components/ClassDetail';
import Gantt from './components/Gantt';
import './styles.css';
function App() {
  const [initial] = useState(loadClasses);
  const [items, setItems] = useState(initial.items);
  const [error, setError] = useState(initial.error);
  const [selectedId, setSelectedId] = useState<string>();
  const [editing, setEditing] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [pending, setPending] = useState<ClassItem[] | null>(null);
  const [notice, setNotice] = useState('');
  const dirty = useRef(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const selected = items.find(c => c.id === selectedId);
  useEffect(() => {
    if (!dirty.current) return;
    try { saveClasses(items); setError(''); }
    catch { setError('Không lưu được vào trình duyệt. Hãy xuất JSON để giữ dữ liệu trước khi tải lại trang.'); }
  }, [items]);
  function update(next: ClassItem[]) { dirty.current = true; setItems(next); }
  function reset() { setSelectedId(undefined); setEditing(false); setFormKey(k => k + 1); }
  function importItems(mode: 'replace' | 'merge') {
    if (!pending) return;
    update(mode === 'replace' ? pending : [...new Map([...items, ...pending].map(c => [c.id, c])).values()]);
    setNotice(`Đã nhập ${pending.length} lớp học.`); setPending(null); reset();
  }
  return <>
    <header><div className="brand"><span className="brand-icon">▥</span><div><h1>Class Gantt</h1><p>Lịch học rõ ràng, quản lý nhẹ nhàng.</p></div></div><div className="header-actions"><span className="local-status">● Lưu trên trình duyệt</span><button onClick={() => exportClasses(items)}>↓ Xuất JSON</button><button onClick={() => fileInput.current?.click()}>↑ Nhập JSON</button><input ref={fileInput} hidden type="file" accept=".json,application/json" onChange={async e => {
      const file = e.target.files?.[0]; e.target.value = ''; if (!file) return;
      try { setPending(parseImport(await file.text())); setNotice(''); }
      catch (err) { setNotice(err instanceof SyntaxError ? 'File JSON không đúng định dạng.' : err instanceof Error ? err.message : 'Không đọc được JSON.'); }
    }}/></div></header>
    {error && <div className="banner warning" role="alert">{error}</div>}
    {notice && <div className="banner" role="status">{notice}<button aria-label="Đóng thông báo" onClick={() => setNotice('')}>×</button></div>}
    <main><aside className="panel">
      {selected && !editing ? <ClassDetail item={selected} onEdit={() => setEditing(true)} onClose={reset} onDelete={() => { update(items.filter(c => c.id !== selected.id)); reset(); }}/>
      : <ClassForm key={selected?.id ?? formKey} item={editing ? selected : undefined} defaultColor={PALETTE[items.length % PALETTE.length]} existingItems={items} onCancel={editing ? () => setEditing(false) : undefined} onSave={draft => {
        if (editing && selected) update(items.map(c => c.id === selected.id ? { ...c, ...draft } : c));
        else update([...items, { ...draft, id: crypto.randomUUID() }]);
        reset();
      }}/>}
      {selected && <button className="new-class" onClick={reset}>+ Thêm lớp mới</button>}
    </aside><div className="workspace"><div className="workspace-heading"><div className="eyebrow">TỔNG QUAN LỊCH HỌC</div><p>Mỗi lớp một hàng. Mọi lịch học trong tầm mắt.</p></div><Gantt items={items} selectedId={selectedId} onSelect={id => { setSelectedId(id); setEditing(false); }}/><p className="workspace-note">Dữ liệu được lưu cục bộ trong trình duyệt này. Xuất JSON để sao lưu hoặc chuyển máy.</p></div></main>
    {pending !== null && <div className="modal-backdrop" onKeyDown={e => { if (e.key === 'Escape') setPending(null); }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="import-title"><h2 id="import-title">Nhập {pending.length} lớp học</h2><p>Ghi đè sẽ thay toàn bộ dữ liệu hiện tại. Gộp sẽ thêm lớp mới và cập nhật lớp có cùng ID bằng dữ liệu trong file.</p><div className="actions"><button autoFocus onClick={() => setPending(null)}>Hủy</button><button onClick={() => importItems('replace')}>Ghi đè</button><button className="primary" onClick={() => importItems('merge')}>Gộp dữ liệu</button></div></section></div>}
  </>;
}
createRoot(document.getElementById('root')!).render(<App/>);
