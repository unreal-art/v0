import { create } from "zustand";

export type GalleryTab = "EXPLORE" | "FOLLOWING" | "TOP";

interface GalleryState {
  activeTab: GalleryTab;
  setActiveTab: (tab: GalleryTab) => void;

  // Method to initialize store from URL
  initFromUrl: (urlParam: string | null) => void;
}

export const useGalleryStore = create<GalleryState>((set) => ({
  activeTab: "EXPLORE", // Default tab

  setActiveTab: (tab: GalleryTab) => set({ activeTab: tab }),

  initFromUrl: (urlParam: string | null) => {
    if (!urlParam) return;

    // Convert to uppercase and validate it's a valid tab
    const normalizedParam = urlParam.toUpperCase() as GalleryTab;

    if (
      normalizedParam === "EXPLORE" ||
      normalizedParam === "FOLLOWING" ||
      normalizedParam === "TOP"
    ) {
      set({ activeTab: normalizedParam });
    }
  },
}));
