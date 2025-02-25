"use client";

import { type ReactNode, createContext, useRef, useContext } from "react";
import { useStore } from "zustand";

import {
  createGenerationStore,
  initGenerationStore,
  type GenerationStore,
} from "@/stores/generationStore";

export type GenerationStoreApi = ReturnType<typeof createGenerationStore>;

export const GenerationStoreContext = createContext<
  GenerationStoreApi | undefined
>(undefined);

export interface GenerationStoreProviderProps {
  children: ReactNode;
}

export const GenerationStoreProvider = ({
  children,
}: GenerationStoreProviderProps) => {
  const storeRef = useRef<GenerationStoreApi>(null);
  if (!storeRef.current) {
    storeRef.current = createGenerationStore(initGenerationStore());
  }

  return (
    <GenerationStoreContext.Provider value={storeRef.current}>
      {children}
    </GenerationStoreContext.Provider>
  );
};

export const useGenerationStore = <T,>(
  selector: (store: GenerationStore) => T,
): T => {
  const counterStoreContext = useContext(GenerationStoreContext);

  if (!counterStoreContext) {
    throw new Error(
      `useGenerationStore must be used within GenerationStoreProvider`,
    );
  }

  return useStore(counterStoreContext, selector);
};
