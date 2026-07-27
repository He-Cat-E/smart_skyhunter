/*
  Lightweight, dependency-free chart components (server-rendered SVG).
  Categorical palette validated for light mode with the dataviz skill's
  validator (CVD-safe, chroma & contrast pass). Single-series charts use the
  brand violet; text uses theme ink tokens, never the series color.
*/

export const CHART = {
  brand: "#7c3aed",
  categorical: ["#7c3aed", "#0d9488", "#d97706", "#2563eb", "#db2777"],
};

type Row = { label: string; count: number };

// ---- horizontal magnitude bars ------------------------------------------
export function BarRows({ rows }: { rows: Row[] }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  if (rows.length === 0)
    return <p className="py-6 text-center text-sm text-fog">No data yet.</p>;
  return (
    <div className="space-y-3.5">
      {rows.slice(0, 7).map((r) => (
        <div key={r.label}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate text-mist">{r.label}</span>
            <span className="shrink-0 font-semibold tabular-nums text-chrome">
              {r.count}
            </span>
          </div>
          <div
            className="mt-1.5 h-2 overflow-hidden rounded-full bg-abyss"
            title={`${r.label}: ${r.count}`}
          >
            <div
              className="h-full rounded-full"
              style={{ width: `${(r.count / max) * 100}%`, background: CHART.brand }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ---- donut (composition) -------------------------------------------------
export function DonutChart({
  data,
  centerLabel,
}: {
  data: (Row & { color: string })[];
  centerLabel?: string;
}) {
  const total = data.reduce((s, d) => s + d.count, 0);
  const size = 168;
  const stroke = 24;
  const r = (size - stroke) / 2;
  const c = size / 2;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="flex flex-wrap items-center gap-6">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
        >
          <circle
            cx={c}
            cy={c}
            r={r}
            fill="none"
            stroke="var(--color-abyss)"
            strokeWidth={stroke}
          />
          {total > 0 &&
            data.map((d, i) => {
              const len = (d.count / total) * circumference;
              const gap = data.length > 1 ? 2 : 0;
              const seg = (
                <circle
                  key={i}
                  cx={c}
                  cy={c}
                  r={r}
                  fill="none"
                  stroke={d.color}
                  strokeWidth={stroke}
                  strokeDasharray={`${Math.max(0, len - gap)} ${circumference - len + gap}`}
                  strokeDashoffset={-offset}
                >
                  <title>{`${d.label}: ${d.count}`}</title>
                </circle>
              );
              offset += len;
              return seg;
            })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-2xl font-semibold text-chrome">
            {total}
          </span>
          <span className="text-[0.65rem] uppercase tracking-wider text-fog">
            {centerLabel ?? "total"}
          </span>
        </div>
      </div>

      <ul className="min-w-[9rem] flex-1 space-y-2">
        {data.map((d) => (
          <li key={d.label} className="flex items-center gap-2 text-sm">
            <span
              className="h-3 w-3 shrink-0 rounded-[3px]"
              style={{ background: d.color }}
            />
            <span className="truncate text-mist">{d.label}</span>
            <span className="ml-auto font-semibold tabular-nums text-chrome">
              {d.count}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---- area / line (change over time) -------------------------------------
export function AreaChart({ points }: { points: Row[] }) {
  const w = 640;
  const h = 220;
  const pad = { l: 30, r: 14, t: 16, b: 30 };
  const iw = w - pad.l - pad.r;
  const ih = h - pad.t - pad.b;
  const maxV = Math.max(1, ...points.map((p) => p.count));
  const n = points.length;
  const x = (i: number) => pad.l + (n <= 1 ? iw / 2 : (i / (n - 1)) * iw);
  const y = (v: number) => pad.t + ih - (v / maxV) * ih;

  const line = points.map((p, i) => `${i ? "L" : "M"}${x(i)},${y(p.count)}`).join(" ");
  const area = `${line} L${x(n - 1)},${pad.t + ih} L${x(0)},${pad.t + ih} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img">
      <defs>
        <linearGradient id="sk-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={CHART.brand} stopOpacity="0.26" />
          <stop offset="100%" stopColor={CHART.brand} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.5, 1].map((t) => (
        <line
          key={t}
          x1={pad.l}
          x2={w - pad.r}
          y1={pad.t + ih - t * ih}
          y2={pad.t + ih - t * ih}
          className="stroke-steel-line"
          strokeWidth="1"
          strokeDasharray={t === 0 ? "0" : "3 4"}
        />
      ))}
      <text x={pad.l - 6} y={pad.t + 4} textAnchor="end" className="fill-fog" fontSize="10">
        {maxV}
      </text>
      <path d={area} fill="url(#sk-area)" />
      <path
        d={line}
        fill="none"
        stroke={CHART.brand}
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {points.map((p, i) => (
        <g key={i}>
          <circle
            cx={x(i)}
            cy={y(p.count)}
            r="4"
            fill={CHART.brand}
            className="stroke-void"
            strokeWidth="2"
          >
            <title>{`${p.label}: ${p.count}`}</title>
          </circle>
          <text x={x(i)} y={h - 10} textAnchor="middle" className="fill-fog" fontSize="10">
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ---- card wrapper --------------------------------------------------------
export function ChartCard({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-steel-line bg-navy p-5 ${className}`}>
      <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-fog">
        {title}
      </h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}
