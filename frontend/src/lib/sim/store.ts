import { create } from "zustand";

export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type StationStatus = "ONLINE" | "DEGRADED" | "STANDBY";
export type Vector =
  | "DDoS Saturation"
  | "DoS Flood"
  | "TC Auth Bypass"
  | "SLE Recon"
  | "RTU Bots"
  | "Web Exploits"
  | "Nominal";

export interface Station {
  id: string;
  name: string;
  role: string;
  lat: number;
  lon: number;
  latency: number;
  status: StationStatus;
}

export interface FlowEvent {
  id: string;
  ts: number;
  srcIp: string;
  origin: string;
  station: string;
  port: number;
  proto: string;
  vector: Vector;
  severity: Severity;
  confidence: number;
  action: "AUTO_BLOCK" | "ESCALATED" | "MONITOR";
  features: Record<string, number>;
  flags: { SYN: number; ACK: number; FIN: number; RST: number };
}

export type IncidentStatus = "PENDING" | "BLOCKED" | "FALSE_POSITIVE" | "ESCALATED" | "AUTO_BLOCKED";
export interface Incident {
  id: string;
  ts: number;
  station: string;
  vector: Vector;
  ip: string;
  origin: string;
  confidence: number;
  status: IncidentStatus;
  eventId: string;
}

export type AuditAction = "AUTO_BLOCK" | "MANUAL_BLOCK" | "FALSE_POSITIVE" | "MONITOR" | "ESCALATE";
export interface AuditEntry {
  id: string;
  ts: number;
  action: AuditAction;
  operator: string;
  ip: string;
  station: string;
  vector: Vector;
  latency: number;
  reward: number;
}

export interface Rule {
  id: string;
  name: string;
  kind: "Heuristic" | "Model";
  coverage: string;
  enabled: boolean;
}

export interface Policy {
  autoBlock: number;
  escalation: number;
  monitor: number;
  classOverrides: Record<string, number>;
  epsilon: number;
  discount: number;
  weight: number;
  stationAuto: Record<string, boolean>;
}

export const STATIONS: Station[] = [
  { id: "ISTRAC-BLR", name: "ISTRAC Bangalore (MOX)", role: "Master Operations Complex & Telemetry", lat: 13.03, lon: 77.51, latency: 3.1, status: "ONLINE" },
  { id: "IDSN-32M", name: "IDSN Byalalu (32m & 18m)", role: "Deep Space Network — Chandrayaan / Aditya", lat: 12.9, lon: 77.37, latency: 4.4, status: "ONLINE" },
  { id: "SDSC-SHAR", name: "SDSC Sriharikota (SHAR)", role: "Launch Range Tracking & Range Safety", lat: 13.72, lon: 80.23, latency: 5.2, status: "ONLINE" },
  { id: "NRSC-HYD", name: "NRSC Hyderabad (Shadnagar)", role: "Earth Observation Data Reception", lat: 17.07, lon: 78.2, latency: 3.8, status: "DEGRADED" },
  { id: "SAC-AHM", name: "SAC Ahmedabad", role: "Payload Data Processing & Ground Comms", lat: 23.03, lon: 72.53, latency: 6.0, status: "ONLINE" },
  { id: "MCF-HAS", name: "MCF Hassan", role: "Geo-Stationary Satellite Stationkeeping", lat: 13.0, lon: 76.1, latency: 4.9, status: "ONLINE" },
  { id: "VSSC-TVM", name: "VSSC Thiruvananthapuram", role: "Launch Vehicle Telemetry Link", lat: 8.52, lon: 76.94, latency: 5.6, status: "STANDBY" },
];

export const ORIGINS = [
  { name: "Moscow", lat: 55.75, lon: 37.62 },
  { name: "Beijing", lat: 39.9, lon: 116.4 },
  { name: "Bucharest", lat: 44.43, lon: 26.1 },
  { name: "Frankfurt", lat: 50.11, lon: 8.68 },
  { name: "São Paulo", lat: -23.55, lon: -46.63 },
  { name: "Lagos", lat: 6.52, lon: 3.38 },
  { name: "Pyongyang", lat: 39.03, lon: 125.75 },
];

export const VECTORS: Exclude<Vector, "Nominal">[] = [
  "DDoS Saturation", "DoS Flood", "TC Auth Bypass", "SLE Recon", "RTU Bots", "Web Exploits",
];

export const ATTACK_PRESETS = [
  { id: "multi", label: "Simultaneous Multi-Vector Space Assault", sub: "Randomised across all vectors", vector: null },
  { id: "ddos", label: "TT&C Uplink Saturation", sub: "DDoS", vector: "DDoS Saturation" as Vector },
  { id: "brute", label: "Telecommand (TC) Auth Bypass", sub: "Brute force", vector: "TC Auth Bypass" as Vector },
  { id: "scan", label: "SLE Ground Gateway Reconnaissance", sub: "Port scan", vector: "SLE Recon" as Vector },
  { id: "bots", label: "Ground RTU Sensor Hijack", sub: "Bots", vector: "RTU Bots" as Vector },
];

const PORTS: Record<Vector, [number, string]> = {
  "DDoS Saturation": [2098, "UDP"],
  "DoS Flood": [5555, "TCP"],
  "TC Auth Bypass": [4443, "TCP"],
  "SLE Recon": [5100, "TCP"],
  "RTU Bots": [502, "Modbus"],
  "Web Exploits": [443, "HTTPS"],
  Nominal: [2098, "CCSDS"],
};

// Deterministic RNG for the initial seed (keeps server and browser render identical)
function mulberry(a: number) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
let rnd = mulberry(42);
const pick = <T,>(arr: T[]) => arr[Math.floor(rnd() * arr.length)];
let seq = 1000;
const uid = (p: string) => `${p}-${(seq++).toString(36).toUpperCase()}`;
const ip = () => `${pick([45, 91, 103, 185, 198, 203])}.${Math.floor(rnd() * 255)}.${Math.floor(rnd() * 255)}.${Math.floor(rnd() * 254) + 1}`;

export const BASE_TIME = Date.UTC(2026, 9, 16, 13, 0, 0);

function makeEvent(ts: number, opts: Partial<{ vector: Vector; station: string; severity: Severity }> = {}): FlowEvent {
  const nominal = !opts.vector && rnd() < 0.55;
  const vector: Vector = opts.vector ?? (nominal ? "Nominal" : pick(VECTORS));
  const severity: Severity = opts.severity ?? (vector === "Nominal" ? "LOW" : pick<Severity>(["CRITICAL", "HIGH", "HIGH", "MEDIUM"]));
  const confidence = vector === "Nominal" ? 0.2 + rnd() * 0.3 : severity === "CRITICAL" ? 0.93 + rnd() * 0.06 : severity === "HIGH" ? 0.72 + rnd() * 0.2 : 0.55 + rnd() * 0.2;
  const [port, proto] = PORTS[vector];
  const origin = vector === "Nominal" ? "Internal" : pick(ORIGINS).name;
  const burst = vector === "Nominal" ? rnd() * 0.2 : 0.5 + rnd() * 0.5;
  return {
    id: uid("EVT"),
    ts,
    srcIp: vector === "Nominal" ? `10.20.${Math.floor(rnd() * 30)}.${Math.floor(rnd() * 250)}` : ip(),
    origin,
    station: opts.station ?? pick(STATIONS).id,
    port,
    proto,
    vector,
    severity,
    confidence,
    action: vector === "Nominal" ? "MONITOR" : confidence >= 0.92 ? "AUTO_BLOCK" : "ESCALATED",
    features: {
      "Flow Packets/s": Math.round(vector === "Nominal" ? 120 + rnd() * 300 : 8000 + rnd() * 90000),
      "Flow Duration (ms)": Math.round(rnd() * 4000),
      "Packet Arrival Δ (ms)": +(vector === "Nominal" ? 1 + rnd() * 4 : rnd() * 0.05).toFixed(3),
      "Burst Score": +burst.toFixed(2),
      "Failed Auth Attempts": vector === "TC Auth Bypass" ? Math.round(20 + rnd() * 400) : 0,
      "Destination Port": port,
      "Avg Packet Size (B)": Math.round(64 + rnd() * 1200),
      "Fwd/Bwd Ratio": +(rnd() * 12).toFixed(2),
    },
    flags: {
      SYN: Math.round(vector === "Nominal" ? rnd() * 3 : rnd() * 400),
      ACK: Math.round(rnd() * 120),
      FIN: Math.round(rnd() * 8),
      RST: Math.round(rnd() * 30),
    },
  };
}

function seed() {
  const events: FlowEvent[] = [];
  for (let i = 0; i < 60; i++) events.push(makeEvent(BASE_TIME - i * 47000));
  const incidents: Incident[] = events
    .filter((e) => e.action === "ESCALATED")
    .slice(0, 7)
    .map((e) => ({ id: uid("INC"), ts: e.ts, station: e.station, vector: e.vector, ip: e.srcIp, origin: e.origin, confidence: e.confidence, status: "PENDING" as IncidentStatus, eventId: e.id }));
  const audit: AuditEntry[] = events
    .filter((e) => e.vector !== "Nominal")
    .slice(0, 24)
    .map((e, i) => ({
      id: uid("AUD"),
      ts: e.ts - 1500,
      action: (e.action === "AUTO_BLOCK" ? "AUTO_BLOCK" : i % 3 === 0 ? "MANUAL_BLOCK" : i % 5 === 0 ? "FALSE_POSITIVE" : "MONITOR") as AuditAction,
      operator: e.action === "AUTO_BLOCK" ? "Policy: AutoBlock-v4" : i % 2 ? "Analyst R. Iyer" : "Analyst K. Menon",
      ip: e.srcIp,
      station: e.station,
      vector: e.vector,
      latency: +(1 + rnd() * 6).toFixed(1),
      reward: +((rnd() - 0.2) * 2).toFixed(2),
    }));
  const series = Array.from({ length: 48 }, (_, i) => Math.round(42000 + Math.sin(i / 5) * 9000 + rnd() * 6000));
  const attackSeries = Array.from({ length: 48 }, () => Math.round(rnd() * 2600));
  return { events, incidents, audit, series, attackSeries };
}

const initial = seed();
rnd = Math.random; // live data is truly random

export interface SimState {
  stations: Station[];
  events: FlowEvent[];
  incidents: Incident[];
  audit: AuditEntry[];
  series: number[];
  attackSeries: number[];
  decisionSeries: number[];
  packets: number;
  threats: number;
  autoRate: number;
  latency: number;
  hoursSaved: number;
  falseAlarm: number;
  reward: number;
  paused: boolean;
  radioSilence: boolean;
  shield: boolean;
  rules: Rule[];
  policy: Policy;
  policyDeployedAt: number | null;
  tick: () => void;
  injectAttack: (o: { presetId: string; station: string; count: number; severity: "HIGH" | "CRITICAL" }) => void;
  resolve: (id: string, kind: "BLOCK" | "IGNORE" | "ESCALATE") => void;
  resolveHighConfidence: () => number;
  setPaused: (p: boolean) => void;
  setRadioSilence: (v: boolean) => void;
  resync: () => void;
  toggleRule: (id: string) => void;
  setPolicy: (p: Partial<Policy>) => void;
  resetBandit: () => void;
  deployPolicy: () => void;
}

const DEFAULT_POLICY: Policy = {
  autoBlock: 0.92,
  escalation: 0.7,
  monitor: 0.45,
  classOverrides: { "TT&C Uplink Saturation": 0.9, "TC Auth Bypass": 0.88, "SLE Reconnaissance": 0.94, "Ground RTU Hijack": 0.86 },
  epsilon: 0.08,
  discount: 0.95,
  weight: 1.0,
  stationAuto: Object.fromEntries(STATIONS.map((s) => [s.id, s.id !== "IDSN-32M"])),
};

export const useSim = create<SimState>((set, get) => ({
  stations: STATIONS,
  ...initial,
  decisionSeries: Array.from({ length: 24 }, (_, i) => Math.round(1800 + Math.sin(i / 3) * 600 + (i * 37) % 400)),
  packets: 18_402_336,
  threats: 37,
  autoRate: 99.4,
  latency: 4.2,
  hoursSaved: 142.5,
  falseAlarm: 0.08,
  reward: 812.4,
  paused: false,
  radioSilence: false,
  shield: true,
  rules: [
    { id: "r1", name: "Uplink burst ceiling (2098 MHz carrier)", kind: "Heuristic", coverage: "DDoS / DoS", enabled: true },
    { id: "r2", name: "TC auth failure velocity", kind: "Heuristic", coverage: "TC Auth Bypass", enabled: true },
    { id: "r3", name: "SLE port sweep fingerprint", kind: "Heuristic", coverage: "SLE Recon", enabled: true },
    { id: "r4", name: "7-class ground flow XGBoost", kind: "Model", coverage: "All vectors", enabled: true },
    { id: "r5", name: "OPS-SAT spacecraft anomaly model", kind: "Model", coverage: "Telemetry", enabled: true },
    { id: "r6", name: "Modbus RTU command whitelist", kind: "Heuristic", coverage: "RTU Bots", enabled: false },
    { id: "r7", name: "RL contextual bandit threshold tuner", kind: "Model", coverage: "Thresholds", enabled: true },
  ],
  policy: DEFAULT_POLICY,
  policyDeployedAt: null,

  tick: () => {
    const s = get();
    const now = Date.now();
    const fresh = s.paused || s.radioSilence ? [] : Array.from({ length: 1 + Math.floor(Math.random() * 2) }, () => makeEvent(now));
    const newThreats = fresh.filter((e) => e.vector !== "Nominal");
    const newInc: Incident[] = fresh
      .filter((e) => e.action === "ESCALATED" && Math.random() < 0.35)
      .map((e) => ({ id: uid("INC"), ts: e.ts, station: e.station, vector: e.vector, ip: e.srcIp, origin: e.origin, confidence: e.confidence, status: "PENDING", eventId: e.id }));
    set({
      events: [...fresh, ...s.events].slice(0, 250),
      incidents: [...newInc, ...s.incidents].slice(0, 200),
      series: [...s.series.slice(1), Math.round(40000 + Math.random() * 16000) * (s.radioSilence ? 0.02 : 1)],
      attackSeries: [...s.attackSeries.slice(1), Math.round(Math.random() * 2400 + newThreats.length * 600)],
      packets: s.packets + Math.round(Math.random() * 9000),
      threats: s.threats + newThreats.length,
      latency: +(3.6 + Math.random() * 1.2).toFixed(1),
      stations: s.stations.map((st) => ({ ...st, latency: +Math.max(1.2, st.latency + (Math.random() - 0.5) * 0.6).toFixed(1) })),
    });
  },

  injectAttack: ({ presetId, station, count, severity }) => {
    const preset = ATTACK_PRESETS.find((p) => p.id === presetId)!;
    const now = Date.now();
    const evs = Array.from({ length: count }, (_, i) =>
      makeEvent(now - i * 120, {
        vector: preset.vector ?? pick(VECTORS),
        station: station === "ALL" ? pick(STATIONS).id : station,
        severity,
      }),
    ).map((e) => ({ ...e, confidence: severity === "CRITICAL" ? 0.95 + Math.random() * 0.045 : 0.74 + Math.random() * 0.15, action: (severity === "CRITICAL" ? "AUTO_BLOCK" : "ESCALATED") as FlowEvent["action"] }));
    const inc: Incident[] = evs.map((e) => ({
      id: uid("INC"), ts: e.ts, station: e.station, vector: e.vector, ip: e.srcIp, origin: e.origin, confidence: e.confidence,
      status: severity === "CRITICAL" ? "AUTO_BLOCKED" : "PENDING", eventId: e.id,
    }));
    const aud: AuditEntry[] = severity === "CRITICAL"
      ? evs.map((e) => ({ id: uid("AUD"), ts: e.ts, action: "AUTO_BLOCK", operator: "Policy: AutoBlock-v4", ip: e.srcIp, station: e.station, vector: e.vector, latency: +(0.8 + Math.random() * 3).toFixed(1), reward: 1 }))
      : [];
    const s = get();
    set({
      events: [...evs, ...s.events].slice(0, 250),
      incidents: [...inc, ...s.incidents],
      audit: [...aud, ...s.audit],
      threats: s.threats + count,
      shield: true,
      attackSeries: [...s.attackSeries.slice(1), 6000 + count * 900],
    });
  },

  resolve: (id, kind) => {
    const s = get();
    const inc = s.incidents.find((i) => i.id === id);
    if (!inc) return;
    const status: IncidentStatus = kind === "BLOCK" ? "BLOCKED" : kind === "IGNORE" ? "FALSE_POSITIVE" : "ESCALATED";
    const reward = kind === "BLOCK" ? 1 * s.policy.weight : kind === "IGNORE" ? -0.5 : 0.2;
    set({
      incidents: s.incidents.map((i) => (i.id === id ? { ...i, status } : i)),
      reward: +(s.reward + reward).toFixed(1),
      audit: [
        { id: uid("AUD"), ts: Date.now(), action: kind === "BLOCK" ? "MANUAL_BLOCK" : kind === "IGNORE" ? "FALSE_POSITIVE" : "ESCALATE", operator: "Analyst (you)", ip: inc.ip, station: inc.station, vector: inc.vector, latency: +(20 + Math.random() * 40).toFixed(1), reward },
        ...s.audit,
      ],
      policy: kind === "IGNORE" ? { ...s.policy, autoBlock: Math.min(0.99, +(s.policy.autoBlock + 0.002).toFixed(3)) } : kind === "BLOCK" ? { ...s.policy, autoBlock: Math.max(0.85, +(s.policy.autoBlock - 0.001).toFixed(3)) } : s.policy,
    });
  },

  resolveHighConfidence: () => {
    const ids = get().incidents.filter((i) => i.status === "PENDING" && i.confidence >= 0.85).map((i) => i.id);
    ids.forEach((id) => get().resolve(id, "BLOCK"));
    return ids.length;
  },

  setPaused: (paused) => set({ paused }),
  setRadioSilence: (radioSilence) => set({ radioSilence, shield: radioSilence ? true : get().shield }),
  resync: () => set({ stations: get().stations.map((s) => ({ ...s, status: s.status === "DEGRADED" ? "ONLINE" : s.status, latency: +(2.5 + Math.random() * 2).toFixed(1) })) }),
  toggleRule: (id) => set({ rules: get().rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)) }),
  setPolicy: (p) => set({ policy: { ...get().policy, ...p } }),
  resetBandit: () => set({ policy: { ...get().policy, epsilon: DEFAULT_POLICY.epsilon, discount: DEFAULT_POLICY.discount, weight: DEFAULT_POLICY.weight } }),
  deployPolicy: () => set({ policyDeployedAt: Date.now() }),
}));

export const fmtTime = (ts: number) => new Date(ts).toISOString().slice(11, 19);
export const fmtDate = (ts: number) => new Date(ts).toISOString().slice(0, 10);
export const pct = (n: number, d = 1) => `${(n * 100).toFixed(d)}%`;

export function download(filename: string, content: string, type = "text/plain") {
  const blob = new Blob([content], { type });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
export function toCSV(rows: Record<string, unknown>[]) {
  if (!rows.length) return "";
  const keys = Object.keys(rows[0]);
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [keys.join(","), ...rows.map((r) => keys.map((k) => esc(r[k])).join(","))].join("\n");
}
