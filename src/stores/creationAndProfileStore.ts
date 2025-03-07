import { create } from "zustand";

// Use the existing TabText type from the Tabs component
export type TabText = "Public" | "Private" | "Liked" | "Pinned" | "Draft";

interface CreationAndProfileState {
  // Tab states
  creationTab: TabText;
  profileTab: TabText;

  // Setters
  setCreationTab: (tab: TabText) => void;
  setProfileTab: (tab: TabText) => void;

  // Initializers from URL
  initFromUrl: (
    section: "creation" | "profile",
    urlParam: string | null
  ) => void;
}

// Create the store with default values
export const useCreationAndProfileStore = create<CreationAndProfileState>(
  (set) => ({
    // Default tabs
    creationTab: "Public",
    profileTab: "Public",

    // Set the creation tab
    setCreationTab: (tab: TabText) => set({ creationTab: tab }),

    // Set the profile tab
    setProfileTab: (tab: TabText) => set({ profileTab: tab }),

    // Initialize from URL parameter
    initFromUrl: (section, urlParam) => {
      if (!urlParam) return;

      // Format the parameter to match the TabText type (capital first letter)
      const formattedTab = (urlParam.charAt(0).toUpperCase() +
        urlParam.slice(1).toLowerCase()) as TabText;

      // Make sure it's a valid tab
      const validTabs: TabText[] = [
        "Public",
        "Private",
        "Liked",
        "Pinned",
        "Draft",
      ];
      if (!validTabs.includes(formattedTab)) return;

      // Update the correct section
      if (section === "creation") {
        set({ creationTab: formattedTab });
      } else if (section === "profile") {
        set({ profileTab: formattedTab });
      }
    },
  })
);
