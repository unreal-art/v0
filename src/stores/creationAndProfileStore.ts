import { create } from "zustand"

// Use the existing TabText type from the Tabs component
export type TabText =
  | "Public"
  | "Private"
  | "Liked"
  | "Pinned"
  | "Minted"
  | "Draft"
  | "User"
  | "Image"

// Add type for navigation type
export type NavigationType = "page" | "tab" | "none"

interface CreationAndProfileState {
  // Tab states
  creationTab: TabText
  profileTab: TabText

  // Navigation state
  lastNavigationType: NavigationType
  isTransitioning: boolean

  // Setters
  setCreationTab: (tab: TabText) => void
  setProfileTab: (tab: TabText) => void
  setNavigationType: (type: NavigationType) => void
  setIsTransitioning: (isTransitioning: boolean) => void

  // Initializers from URL
  initFromUrl: (
    section: "creation" | "profile",
    urlParam: string | null
  ) => void
}

// Create the store with default values
export const useCreationAndProfileStore = create<CreationAndProfileState>(
  (set) => ({
    // Default tabs
    creationTab: "Public",
    profileTab: "Public",

    // Default navigation state
    lastNavigationType: "none",
    isTransitioning: false,

    // Set the creation tab
    setCreationTab: (tab: TabText) =>
      set((state) => ({
        creationTab: tab,
        lastNavigationType:
          state.creationTab !== tab ? "tab" : state.lastNavigationType,
      })),

    // Set the profile tab
    setProfileTab: (tab: TabText) =>
      set((state) => ({
        profileTab: tab,
        lastNavigationType:
          state.profileTab !== tab ? "tab" : state.lastNavigationType,
      })),

    // Set navigation type
    setNavigationType: (type: NavigationType) =>
      set({ lastNavigationType: type }),

    // Set transitioning state
    setIsTransitioning: (isTransitioning: boolean) => set({ isTransitioning }),

    // Initialize from URL parameter
    initFromUrl: (section, urlParam) => {
      if (!urlParam) return

      // Format the parameter to match the TabText type (capital first letter)
      const formattedTab = (urlParam.charAt(0).toUpperCase() +
        urlParam.slice(1).toLowerCase()) as TabText

      // Make sure it's a valid tab
      const validTabs: TabText[] = [
        "Public",
        "Private",
        "Liked",
        "Pinned",
        "Draft",
      ]
      if (!validTabs.includes(formattedTab)) return

      // Update the correct section and set navigation type to "tab"
      if (section === "creation") {
        set((state) => ({
          creationTab: formattedTab,
          lastNavigationType:
            state.creationTab !== formattedTab
              ? "tab"
              : state.lastNavigationType,
        }))
      } else if (section === "profile") {
        set((state) => ({
          profileTab: formattedTab,
          lastNavigationType:
            state.profileTab !== formattedTab
              ? "tab"
              : state.lastNavigationType,
        }))
      }
    },
  })
)
