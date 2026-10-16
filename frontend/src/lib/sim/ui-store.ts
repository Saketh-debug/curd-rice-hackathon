import { create } from "zustand";

export const useUI = create<{ simOpen: boolean; setSimOpen: (v: boolean) => void; aegisOpen: boolean; setAegisOpen: (v: boolean) => void }>((set) => ({
  simOpen: false,
  setSimOpen: (simOpen) => set({ simOpen }),
  aegisOpen: false,
  setAegisOpen: (aegisOpen) => set({ aegisOpen }),
}));
