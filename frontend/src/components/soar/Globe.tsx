import { useEffect, useRef, useState } from "react";
import { ORIGINS, STATIONS, type FlowEvent, type Vector } from "@/lib/sim/store";

const rad = (d: number) => (d * Math.PI) / 180;
function toVec(lat: number, lon: number) {
  const la = rad(lat), lo = rad(lon);
  return [Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo)] as const;
}
function slerp(a: readonly number[], b: readonly number[], t: number) {
  const dot = Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]);
  const om = Math.acos(dot);
  if (om < 1e-4) return a;
  const s1 = Math.sin((1 - t) * om) / Math.sin(om), s2 = Math.sin(t * om) / Math.sin(om);
  return [a[0] * s1 + b[0] * s2, a[1] * s1 + b[1] * s2, a[2] * s1 + b[2] * s2];
}

function cssVar(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "#f5b325";
}

export interface GlobeProps {
  events?: FlowEvent[];
  filter?: Vector | "All";
  autoSpin?: boolean;
  interactive?: boolean;
  className?: string;
}

/** Lightweight canvas orthographic globe: dot sphere, ground stations, attack arcs. */
export function Globe({ events = [], filter = "All", autoSpin = true, interactive = true, className }: GlobeProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const state = useRef({ rotY: rad(-78), rotX: rad(-14), zoom: 1, drag: null as null | { x: number; y: number }, mouse: null as null | { x: number; y: number } });
  const [tip, setTip] = useState<{ x: number; y: number; text: string } | null>(null);
  const propsRef = useRef({ events, filter, autoSpin });
  propsRef.current = { events, filter, autoSpin };

  useEffect(() => {
    const cv = ref.current!;
    const ctx = cv.getContext("2d")!;
    const colors = { signal: cssVar("--signal"), grove: cssVar("--grove"), alert: cssVar("--alert"), fg: cssVar("--foreground") };
    const dots: (readonly number[])[] = [];
    for (let lat = -80; lat <= 80; lat += 4) {
      const n = Math.max(6, Math.round(90 * Math.cos(rad(lat))));
      for (let i = 0; i < n; i++) dots.push(toVec(lat, (i / n) * 360 - 180));
    }
    let raf = 0, t0 = performance.now();
    const ro = new ResizeObserver(() => {
      const r = cv.getBoundingClientRect();
      cv.width = r.width * devicePixelRatio;
      cv.height = r.height * devicePixelRatio;
    });
    ro.observe(cv);

    const draw = (t: number) => {
      const s = state.current;
      const dt = t - t0; t0 = t;
      if (propsRef.current.autoSpin && !s.drag) s.rotY += dt * 0.00008;
      const W = cv.width, H = cv.height, dpr = devicePixelRatio;
      const R = Math.min(W, H) * 0.42 * s.zoom;
      const cx = W / 2, cy = H / 2;
      const cyR = Math.cos(s.rotY), syR = Math.sin(s.rotY), cxR = Math.cos(s.rotX), sxR = Math.sin(s.rotX);
      const proj = (v: readonly number[], lift = 1) => {
        const x1 = v[0] * cyR - v[2] * syR, z1 = v[0] * syR + v[2] * cyR;
        const y2 = v[1] * cxR - z1 * sxR, z2 = v[1] * sxR + z1 * cxR;
        return { x: cx + x1 * R * lift, y: cy - y2 * R * lift, z: z2 };
      };
      ctx.clearRect(0, 0, W, H);
      // atmosphere
      const g = ctx.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * 1.25);
      g.addColorStop(0, "rgba(245,179,37,0.18)"); g.addColorStop(1, "rgba(245,179,37,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R * 1.25, 0, Math.PI * 2); ctx.fill();
      const body = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.4, R * 0.1, cx, cy, R);
      body.addColorStop(0, "rgba(60,52,40,0.55)"); body.addColorStop(1, "rgba(14,13,12,0.85)");
      ctx.fillStyle = body; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
      // dots
      ctx.fillStyle = colors.fg;
      for (const d of dots) {
        const p = proj(d);
        if (p.z < 0) continue;
        ctx.globalAlpha = 0.08 + p.z * 0.35;
        ctx.fillRect(p.x, p.y, 1.3 * dpr, 1.3 * dpr);
      }
      ctx.globalAlpha = 1;
      // arcs
      const { events: evs, filter: f } = propsRef.current;
      const shown = evs.filter((e) => e.vector !== "Nominal" && (f === "All" || e.vector === f)).slice(0, 18);
      shown.forEach((e, i) => {
        const o = ORIGINS.find((x) => x.name === e.origin) ?? ORIGINS[i % ORIGINS.length];
        const st = STATIONS.find((x) => x.id === e.station) ?? STATIONS[0];
        const a = toVec(o.lat, o.lon), b = toVec(st.lat, st.lon);
        const col = e.severity === "CRITICAL" ? colors.alert : colors.signal;
        const N = 40;
        const phase = ((t / 2200 + i * 0.13) % 1);
        ctx.lineWidth = 1.2 * dpr;
        for (let k = 0; k < N; k++) {
          const t1 = k / N, t2 = (k + 1) / N;
          const p1 = proj(slerp(a, b, t1), 1 + Math.sin(t1 * Math.PI) * 0.22);
          const p2 = proj(slerp(a, b, t2), 1 + Math.sin(t2 * Math.PI) * 0.22);
          if (p1.z < -0.15) continue;
          const head = Math.abs(t1 - phase) < 0.08;
          ctx.strokeStyle = col;
          ctx.globalAlpha = head ? 1 : 0.18;
          ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
        }
      });
      ctx.globalAlpha = 1;
      // stations
      let hover: typeof tip = null;
      STATIONS.forEach((st, i) => {
        const p = proj(toVec(st.lat, st.lon));
        if (p.z < 0) return;
        const pulse = ((t / 1600 + i * 0.2) % 1);
        ctx.strokeStyle = colors.grove; ctx.globalAlpha = 1 - pulse; ctx.lineWidth = 1 * dpr;
        ctx.beginPath(); ctx.arc(p.x, p.y, (3 + pulse * 12) * dpr, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = 1; ctx.fillStyle = colors.grove;
        ctx.beginPath(); ctx.arc(p.x, p.y, 2.6 * dpr, 0, Math.PI * 2); ctx.fill();
        const m = s.mouse;
        if (m && Math.hypot(m.x * dpr - p.x, m.y * dpr - p.y) < 10 * dpr) hover = { x: p.x / dpr, y: p.y / dpr, text: `${st.name} · ${st.latency}ms` };
      });
      ORIGINS.forEach((o) => {
        const p = proj(toVec(o.lat, o.lon));
        if (p.z < 0) return;
        ctx.fillStyle = colors.alert; ctx.globalAlpha = 0.8;
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.8 * dpr, 0, Math.PI * 2); ctx.fill();
        const m = s.mouse;
        if (m && Math.hypot(m.x * dpr - p.x, m.y * dpr - p.y) < 8 * dpr) hover = { x: p.x / dpr, y: p.y / dpr, text: `Attack origin · ${o.name}` };
      });
      ctx.globalAlpha = 1;
      setTip((prev) => (prev?.text === (hover as typeof tip)?.text && prev?.x === (hover as typeof tip)?.x ? prev : hover));
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <div className={"relative " + (className ?? "")}>
      <canvas
        ref={ref}
        className={"h-full w-full " + (interactive ? "cursor-grab active:cursor-grabbing" : "")}
        style={{ touchAction: interactive ? "none" : "auto" }}
        onPointerDown={(e) => { if (!interactive) return; state.current.drag = { x: e.clientX, y: e.clientY }; (e.target as HTMLElement).setPointerCapture(e.pointerId); }}
        onPointerUp={() => (state.current.drag = null)}
        onPointerLeave={() => (state.current.mouse = null)}
        onPointerMove={(e) => {
          const r = (e.target as HTMLElement).getBoundingClientRect();
          state.current.mouse = { x: e.clientX - r.left, y: e.clientY - r.top };
          const d = state.current.drag;
          if (d) {
            state.current.rotY += (e.clientX - d.x) * 0.005;
            state.current.rotX = Math.max(-1.2, Math.min(1.2, state.current.rotX - (e.clientY - d.y) * 0.005));
            state.current.drag = { x: e.clientX, y: e.clientY };
          }
        }}
        onWheel={(e) => { if (!interactive) return; state.current.zoom = Math.max(0.6, Math.min(2, state.current.zoom - e.deltaY * 0.001)); }}
        data-lenis-prevent={interactive ? "" : undefined}
        aria-label="Interactive globe of ISRO ground stations and incoming attack arcs"
        role="img"
      />
      {tip && (
        <div className="glass-strong pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[140%] whitespace-nowrap rounded-xl px-3 py-1.5 font-mono text-[11px]" style={{ left: tip.x, top: tip.y }}>
          {tip.text}
        </div>
      )}
    </div>
  );
}
