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
  // 업로드한 고인 사진 미리보기 (data URL) — 생성 중 화면 공유용
  photoPreview: string | null;
  setPersona: (persona: Persona) => void;
  setCreationStep: (step: CreationStep) => void;
  setPhotoPreview: (dataUrl: string | null) => void;
  clearPersona: () => void;
}

export const usePersonaStore = create<PersonaState>((set) => ({
  persona: null,
  creationStep: null,
  photoPreview: null,
  setPersona: (persona) => set({ persona }),
  setCreationStep: (step) => set({ creationStep: step }),
  setPhotoPreview: (dataUrl) => set({ photoPreview: dataUrl }),
  clearPersona: () =>
    set({ persona: null, creationStep: null, photoPreview: null }),
}));
