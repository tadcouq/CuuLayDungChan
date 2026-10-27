import { type ClassItem } from './types';

// Connected components keep branches and descendants together, even if a parent
// is missing from an imported file. A visited set also tolerates cyclic imports.
export function timelineRows(items: ClassItem[]) {
  const byId = new Map(items.map(item => [item.id, item]));
  const links = new Map<string, Set<string>>();
  const connect = (a: string, b: string) => {
    if (!links.has(a)) links.set(a, new Set());
    links.get(a)!.add(b);
  };
  for (const item of items) {
    connect(item.id, item.id);
    if (item.previousClassId) {
      connect(item.id, item.previousClassId);
      connect(item.previousClassId, item.id);
    }
  }
  const visited = new Set<string>();
  const compare = (a: ClassItem, b: ClassItem) => a.startDate.localeCompare(b.startDate) || a.name.localeCompare(b.name) || a.id.localeCompare(b.id);
  const rows = [];
  for (const item of [...items].sort(compare)) {
    if (visited.has(item.id)) continue;
    const pending = [item.id];
    const members: ClassItem[] = [];
    while (pending.length) {
      const id = pending.pop()!;
      if (visited.has(id)) continue;
      visited.add(id);
      const member = byId.get(id);
      if (member) members.push(member);
      pending.push(...(links.get(id) ?? []));
    }
    members.sort(compare);
    const root = members.find(c => !c.previousClassId || !byId.has(c.previousClassId)) ?? members[0];
    // Overlapping dates get separate tracks inside the same row, so every node
    // remains visible and clickable without changing its actual dates.
    const ends: string[] = [];
    const nodes = members.map(member => {
      let track = ends.findIndex(end => end < member.startDate);
      if (track < 0) track = ends.length;
      ends[track] = member.endDate;
      return { item: member, track };
    });
    rows.push({ root, nodes, height: 70 + (ends.length - 1) * 50 });
  }
  return rows;
}
