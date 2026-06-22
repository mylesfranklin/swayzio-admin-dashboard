import { formatNumber } from "@/lib/utils";

/**
 * Schema "gravity" hub — the most-referenced tables (FK in-degree). The top table
 * (tracks) sits at the center; the next most-referenced orbit it, sized by ref count.
 * Pure SVG (no chart lib does network graphs well).
 */
export function SchemaHub({ nodes }: { nodes: Array<{ table: string; refs: number }> }) {
  if (!nodes.length) return null;
  const center = nodes[0];
  const orbit = nodes.slice(1, 7);
  const W = 480, H = 320, cx = 240, cy = 160, R = 116;
  const maxRefs = center.refs || 1;
  const rOf = (refs: number) => 15 + (refs / maxRefs) * 15;
  const pts = orbit.map((nd, i) => {
    const a = (-90 + i * (360 / orbit.length)) * (Math.PI / 180);
    return { ...nd, x: cx + R * Math.cos(a), y: cy + R * Math.sin(a), r: rOf(nd.refs) };
  });
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 330 }} role="img" aria-label="Schema reference hub">
      {pts.map((p) => (
        <line key={`l-${p.table}`} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(123,147,240,0.28)" strokeWidth={1.5} />
      ))}
      {pts.map((p) => (
        <g key={p.table}>
          <circle cx={p.x} cy={p.y} r={p.r} fill="#17181a" stroke="#3b5bdb" strokeWidth={1.5} />
          <text x={p.x} y={p.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="#ffffff" fontWeight="600">{p.refs}</text>
          <text x={p.x} y={p.y + p.r + 11} textAnchor="middle" fontSize="9.5" fill="#9aa0a6">{p.table.slice(0, 18)}</text>
        </g>
      ))}
      <circle cx={cx} cy={cy} r={44} fill="#3b5bdb" opacity={0.18} />
      <circle cx={cx} cy={cy} r={35} fill="#3b5bdb" />
      <text x={cx} y={cy - 2} textAnchor="middle" fontSize="13" fill="#ffffff" fontWeight="700">{center.table}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize="9" fill="#dbe0ff">{formatNumber(center.refs)} refs</text>
    </svg>
  );
}
