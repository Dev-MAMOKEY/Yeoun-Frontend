import { create } from "zustand";

export type PersonaStatus = "draft" | "ready";
export type CreationStep = "basic" | "voice" | "interview" | "waiting" | null;

interface Persona {
  personaId: string;
  name: string;
  nickname: string;
  status: PersonaStatus;
}

interface PersonaState {
  persona: Persona | null;
  creationStep: CreationStep;
  setPersona: (persona: Persona) => void;
  setCreationStep: (step: CreationStep) => void;
  clearPersona: () => void;
}

export const usePersonaStore = create<PersonaState>((set) => ({
  persona: null,
  creationStep: null,
  setPersona: (persona) => set({ persona }),
  setCreationStep: (step) => set({ creationStep: step }),
  clearPersona: () => set({ persona: null, creationStep: null }),
}));
