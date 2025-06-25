"use client";

import { useCallback, useEffect, useMemo, useTransition } from "react";
import TabIcon from "./TabIcon";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  useCreationAndProfileStore,
  TabText,
} from "@/stores/creationAndProfileStore";
import { motion } from "framer-motion";

export interface ITabs {
  hideDraft?: boolean;
  currentIndex: number;
  setCurrentIndex: (value: number) => void;
  section: "creation" | "profile"; // Added section prop to identify the context
}

// Memoize tab configuration
const TAB_CONFIG = [
  { text: "Public", index: 0 },
  { text: "Private", index: 1 },
  { text: "Liked", index: 2 },
  { text: "Pinned", index: 3 },
  { text: "Minted", index: 4 },
  { text: "Draft", index: 5 },
] as const;

export default function Tabs({
  hideDraft,
  currentIndex,
  setCurrentIndex,
  section,
}: ITabs) {
  // Access the store and URL parameters
  const { creationTab, profileTab, initFromUrl } = useCreationAndProfileStore();
  const searchParams = useSearchParams();

  // Memoize the filtered tabs
  const tabs = useMemo(
    () => TAB_CONFIG.filter((tab) => !(hideDraft && tab.text === "Draft")),
    [hideDraft]
  );

  // Sync with URL on initial load
  useEffect(() => {
    const urlParam = searchParams.get("s");
    if (urlParam) {
      initFromUrl(section, urlParam);

      // Also update the currentIndex to match the URL
      const tabIndex = tabs.findIndex(
        (tab) => tab.text.toLowerCase() === urlParam.toLowerCase()
      );
      if (tabIndex >= 0) {
        setCurrentIndex(tabIndex);
      }
    }
  }, [searchParams, initFromUrl, section, tabs, setCurrentIndex]);

  return (
    <motion.div
      className="flex gap-x-8 border-b-[1px] border-primary-11 overflow-x-auto"
      initial={{ opacity: 0.95 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {tabs.map(({ text, index }) => (
        <TabBtn
          key={text}
          currentIndex={currentIndex}
          index={index}
          text={text}
          setCurrentIndex={setCurrentIndex}
          section={section}
        />
      ))}
    </motion.div>
  );
}

export interface ITabBtn {
  currentIndex: number;
  index: number;
  text: TabText;
  setCurrentIndex: (value: number) => void;
  section: "creation" | "profile"; // Added section prop
}

export function TabBtn({
  index,
  currentIndex,
  text,
  setCurrentIndex,
  section,
}: ITabBtn) {
  const pathname = usePathname();
  const router = useRouter(); // router
  const searchParams = useSearchParams(); // Get searchParams here
  // Add isPending state to show loading state and improve perceived performance
  const [isPending, startTransition] = useTransition();

  // Get the correct setter based on the section
  const { setCreationTab, setProfileTab } = useCreationAndProfileStore();

  // Determine the active state
  const isActive = currentIndex === index;

  // Memoize color calculation
  const color = useMemo(() => (isActive ? "#DADADA" : "#5D5D5D"), [isActive]);

  // Create URL object for smoother navigation
  const createTabUrl = useCallback(
    (tabName: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("s", tabName.toLowerCase());
      return `${pathname}?${params.toString()}`;
    },
    [pathname, searchParams]
  );

  const handleClick = useCallback(() => {
    if (isActive) return; // Skip if already active

    // Update the local component state
    setCurrentIndex(index);

    // Update the store based on the section
    if (section === "creation") {
      setCreationTab(text);
    } else if (section === "profile") {
      setProfileTab(text);
    }

    // Update URL without page reload - use startTransition for smoother UI
    startTransition(() => {
      router.replace(createTabUrl(text), { scroll: false });
    });
  }, [
    index,
    setCurrentIndex,
    text,
    section,
    setCreationTab,
    setProfileTab,
    pathname,
    router,
    isActive,
    createTabUrl,
  ]);

  return (
    <motion.button
      className={`flex justify-center items-center gap-x-2 py-2 px-4 border-primary-1 ${
        currentIndex === index ? "border-b-2" : ""
      }`}
      onClick={handleClick}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.1 }}
      disabled={isPending}
    >
      <p style={{ color }}>{text}</p>
      <div>
        <TabIcon text={text} width="24px" height="24px" color={color} />
      </div>
    </motion.button>
  );
}
