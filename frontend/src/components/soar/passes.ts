import { useNow } from "./ui";

export interface Pass {
  sat: string;
  orbit: "LEO" | "GEO" | "Deep Space";
  station: string;
  offsetMin: number; // AOS minutes from the top of the current hour cycle
  durationMin: number;
  band: "S" | "X" | "Ku";
  risk: "LOW" | "MEDIUM" | "HIGH";
}

export const PASSES: Pass[] = [
  { sat: "EOS-09", orbit: "LEO", station: "ISTRAC-BLR", offsetMin: 0, durationMin: 14, band: "S", risk: "MEDIUM" },
  { sat: "Cartosat-3", orbit: "LEO", station: "NRSC-HYD", offsetMin: 22, durationMin: 11, band: "X", risk: "LOW" },
  { sat: "GSAT-31", orbit: "GEO", station: "MCF-HAS", offsetMin: 35, durationMin: 60, band: "Ku", risk: "LOW" },
  { sat: "Chandrayaan-3 OM", orbit: "Deep Space", station: "IDSN-32M", offsetMin: 70, durationMin: 95, band: "S", risk: "HIGH" },
  { sat: "Aditya-L1", orbit: "Deep Space", station: "IDSN-32M", offsetMin: 180, durationMin: 120, band: "X", risk: "MEDIUM" },
  { sat: "Oceansat-3", orbit: "LEO", station: "SDSC-SHAR", offsetMin: 210, durationMin: 12, band: "S", risk: "LOW" },
  { sat: "RISAT-2BR1", orbit: "LEO", station: "ISTRAC-BLR", offsetMin: 260, durationMin: 10, band: "X", risk: "HIGH" },
  { sat: "GSAT-24", orbit: "GEO", station: "SAC-AHM", offsetMin: 300, durationMin: 60, band: "Ku", risk: "LOW" },
];

const CYCLE = 14 * 60 * 1000;
/** Current pass countdown — cycles every 14 min so a pass is always live. */
export function usePassCountdown() {
  const now = useNow();
  if (now == null) return null;
  const left = CYCLE - (now % CYCLE);
  const m = Math.floor(left / 60000), s = Math.floor((left % 60000) / 1000);
  const elapsed = 1 - left / CYCLE;
  return {
    sat: "EOS-09",
    remaining: `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`,
    elapsed,
    elevation: +(10 + Math.sin(elapsed * Math.PI) * 68).toFixed(1),
    azimuth: +(40 + elapsed * 220).toFixed(1),
    aos: new Date(now - (CYCLE - left)).toISOString().slice(11, 19),
    los: new Date(now + left).toISOString().slice(11, 19),
    dbm: +(-92 + Math.sin(elapsed * Math.PI) * 18 + Math.sin(now / 900) * 0.6).toFixed(1),
    ber: (1e-7 * (1.5 - Math.sin(elapsed * Math.PI))).toExponential(1),
    now,
  };
}
