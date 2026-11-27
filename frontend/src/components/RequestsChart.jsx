/** Gráfico SVG de solicitudes (línea) y errores (barras) por hora. */
export default function RequestsChart({ requests = [], errors = [] }) {
  const W = 700, H = 240, P = 30;
  const max = Math.max(2200, Math.ceil(Math.max(...requests, 0) / 100) * 100);
  const sx = (W - P * 2) / Math.max(requests.length - 1, 1);
  const y = (v) => H - P - (v / max) * (H - P * 2);
  const line = requests.map((v, i) => `${P + i * sx},${y(v)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="240" role="img" aria-label="Gráfico de solicitudes">
      {[0, 1, 2, 3, 4].map((k) => {
        const yy = P + (k * (H - P * 2)) / 4;
        return (
          <g key={k}>
            <line x1={P} x2={W - P} y1={yy} y2={yy} stroke="currentColor" opacity=".08" />
            <text x="2" y={yy + 4} fontSize="10" fill="currentColor" opacity=".5">{Math.round(max - (k * max) / 4)}</text>
          </g>
        );
      })}
      <defs>
        <linearGradient id="gA" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#3b82f6" stopOpacity=".35" />
          <stop offset="1" stopColor="#3b82f6" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`${P},${H - P} ${line} ${P + (requests.length - 1) * sx},${H - P}`} fill="url(#gA)" />
      <polyline points={line} fill="none" stroke="#3b82f6" strokeWidth="2.5" />
      {errors.map((v, i) => (
        <rect key={i} x={P + i * sx - 4} y={H - P - v * 7} width="8" height={v * 7} rx="2" fill="#ef4444" opacity=".85">
          <title>{`${String(i).padStart(2, '0')}:00 · ${v} errores`}</title>
        </rect>
      ))}
      {requests.map((_, i) => i % 3 === 0 && (
        <text key={i} x={P + i * sx - 8} y={H - 8} fontSize="10" fill="currentColor" opacity=".5">{String(i).padStart(2, '0')}:00</text>
      ))}
    </svg>
  );
}
