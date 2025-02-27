// src/stores/counter-store.ts
import { createStore } from "zustand/vanilla";

export type GenerationState = {
  isActive: boolean;
};

export type GenerationActions = {
  startGeneration: () => void;
  stopGeneration: () => void;
};

export type GenerationStore = GenerationState & GenerationActions;

//initialize
export const initGenerationStore = (): GenerationState => {
  return { isActive: true };
};

export const defaultInitState: GenerationState = {
  isActive: true,
};

export const createGenerationStore = (
  initState: GenerationState = defaultInitState
) => {
  return createStore<GenerationStore>()((set) => ({
    ...initState,
    // startGeneration: () => set((state) => ({ count: state.count - 1 })),
    // incrementCount: () => set((state) => ({ count: state.count + 1 })),
    startGeneration: () => set(() => ({ isActive: true })),
    stopGeneration: () => set(() => ({ isActive: false })),
  }));
};
