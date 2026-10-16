import { useId } from "react";

function path(values: number[], w: number, h: number, max?: number) {
  const m = max ?? Math.max(...values, 1);
  return values.map((v, i) => `${i === 0 ? "M" : "L"}${((i / (values.length - 1)) * w).toFixed(1)},${(h - (v / m) * h * 0.9).toFixed(1)}`).join(" ");
}

export function AreaLine({ values, second, height = 180, color = "var(--signal)", secondColor = "var(--alert)" }: { values: number[]; second?: number[]; height?: number; color?: string; secondColor?: string }) {
  const id = useId().replace(/:/g, "");
  const w = 600;
  const max = Math.max(...values, ...(second ?? []), 1);
  const d = path(values, w, height, max);
  return (
    <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" className="h-full w-full" style={{ height }}>
      <defs>
        <linearGradient id={`g${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.35" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((y) => (
        <line key={y} x1="0" x2={w} y1={height * y} y2={height * y} stroke="var(--border)" strokeDasharray="2 6" />
      ))}
      <path d={`${d} L${w},${height} L0,${height} Z`} fill={`url(#g${id})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
      {second && <path d={path(second, w, height, max)} fill="none" stroke={secondColor} strokeWidth="1.5" strokeDasharray="4 3" vectorEffect="non-scaling-stroke" />}
    </svg>
  );
}

export function Bars({ values, height = 160, labels }: { values: number[]; height?: number; labels?: string[] }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-1" style={{ height }}>
      {values.map((v, i) => (
        <div key={i} className="group relative flex h-full min-w-0 flex-1 flex-col justify-end">
          <div className="rounded-t-md bg-signal/70 transition-colors group-hover:bg-signal" style={{ height: `${(v / max) * 100}%` }} />
          {labels && <span className="mt-1 truncate text-center font-mono text-[9px] text-muted-foreground">{labels[i]}</span>}
          <span className="glass-strong pointer-events-none absolute -top-7 left-1/2 z-10 hidden -translate-x-1/2 rounded-md px-1.5 py-0.5 font-mono text-[10px] group-hover:block">{v}</span>
        </div>
      ))}
    </div>
  );
}

export function Donut({ parts, size = 180 }: { parts: { label: string; value: number; color: string }[]; size?: number }) {
  const total = parts.reduce((a, p) => a + p.value, 0);
  const r = 70, c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <svg viewBox="0 0 180 180" width={size} height={size} className="shrink-0 -rotate-90">
      <circle cx="90" cy="90" r={r} fill="none" stroke="var(--muted)" strokeWidth="16" />
      {parts.map((p) => {
        const len = Math.max((p.value / total) * c, 2);
        const el = <circle key={p.label} cx="90" cy="90" r={r} fill="none" stroke={p.color} strokeWidth="16" strokeDasharray={`${len} ${c}`} strokeDashoffset={-acc} strokeLinecap="round" />;
        acc += (p.value / total) * c;
        return el;
      })}
    </svg>
  );
}

export function HBar({ label, value, max = 1, color = "var(--signal)", suffix }: { label: string; value: number; max?: number; color?: string; suffix?: string }) {
  return (
    <div className="grid grid-cols-[minmax(0,10rem)_1fr_3.5rem] items-center gap-3 text-sm">
      <span className="truncate text-muted-foreground">{label}</span>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, (Math.abs(value) / max) * 100)}%`, background: color }} />
      </div>
      <span className="text-right font-mono text-xs tabular">{suffix ?? value}</span>
    </div>
  );
}
