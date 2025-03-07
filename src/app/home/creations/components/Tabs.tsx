import { useCallback, useMemo } from "react";
import TabIcon from "./TabIcon";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type TabText =
  | "Public"
  | "Private"
  | "Liked"
  | "Pinned"
  | "Draft"
  | "User"
  | "Image";

export interface ITabs {
  hideDraft?: boolean;
  currentIndex: number;
  setCurrentIndex: (value: number) => void;
}

// Memoize tab configuration
const TAB_CONFIG = [
  { text: "Public", index: 0 },
  { text: "Private", index: 1 },
  { text: "Liked", index: 2 },
  { text: "Pinned", index: 3 },
  { text: "Draft", index: 4 },
] as const;

export default function Tabs({
  hideDraft,
  currentIndex,
  setCurrentIndex,
}: ITabs) {
  // Memoize the filtered tabs
  const tabs = useMemo(
    () => TAB_CONFIG.filter((tab) => !(hideDraft && tab.text === "Draft")),
    [hideDraft]
  );

  return (
    <div className="flex gap-x-8 border-b-[1px] border-primary-11 overflow-x-auto">
      {tabs.map(({ text, index }) => (
        <TabBtn
          key={text}
          currentIndex={currentIndex}
          index={index}
          text={text as TabText}
          setCurrentIndex={setCurrentIndex}
        />
      ))}
    </div>
  );
}

export interface ITabBtn {
  currentIndex: number;
  index: number;
  text: TabText;
  setCurrentIndex: (value: number) => void;
}

export function TabBtn({
  index,
  currentIndex,
  text,
  setCurrentIndex,
}: ITabBtn) {
  const pathname = usePathname();

  // Memoize color calculation
  const color = useMemo(
    () => (currentIndex === index ? "#DADADA" : "#5D5D5D"),
    [currentIndex, index]
  );

  const handleClick = useCallback(() => {
    setCurrentIndex(index);
  }, [index, setCurrentIndex]);

  return (
    <Link href={`${pathname}?s=${text}`}>
      <button
        className={`flex justify-center items-center gap-x-2 py-2 px-4 border-primary-1 ${
          currentIndex === index ? "border-b-2" : ""
        }`}
        onClick={handleClick}
      >
        <p style={{ color }}>{text}</p>
        <div>
          <TabIcon text={text} width="24px" height="24px" color={color} />
        </div>
      </button>
    </Link>
  );
}
