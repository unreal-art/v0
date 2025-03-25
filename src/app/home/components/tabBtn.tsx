"use client";

import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  useEffect,
  useState,
  useTransition,
  useCallback,
  useRef,
  memo,
} from "react";
import { useGalleryStore, GalleryTab } from "@/stores/galleryStore";
import { motion, AnimatePresence } from "framer-motion";
import { useTransitionState } from "@/hooks/useTransitionState";
import {
  GlobeIcon,
  UserIcon,
  FlashIcon,
  SearchIcon,
} from "@/app/components/icons";

interface NavBtnProps {
  text: "Explore" | "Following" | "Top" | "Search";
}

function TabBtn({ text }: NavBtnProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Use Zustand store
  const { activeTab, setActiveTab } = useGalleryStore();

  // Convert UI text to param value - compute this once
  const paramValue = text.toLowerCase();

  // Compute isActive outside of render loop for better performance
  const isActive = activeTab.toLowerCase() === paramValue;

  // Memoize the click handler to prevent unnecessary re-renders
  const handleClick = useCallback(() => {
    // Skip if already active
    if (isActive) return;

    setActiveTab(text.toUpperCase() as GalleryTab);

    startTransition(() => {
      router.push(`${pathname}?s=${paramValue}`);
    });
  }, [router, pathname, paramValue, isActive, setActiveTab, text]);

  // Get the appropriate icon based on tab text
  const getIcon = () => {
    const iconColor = isActive ? "#F0F0F0" : "#5D5D5D";
    switch (text) {
      case "Explore":
        return <GlobeIcon color={iconColor} width={16} height={16} />;
      case "Following":
        return <UserIcon color={iconColor} width={16} height={16} />;
      case "Top":
        return <FlashIcon color={iconColor} width={16} height={16} />;
      case "Search":
        return <SearchIcon color={iconColor} width={16} height={16} />;
      default:
        return null;
    }
  };

  return (
    <div className="relative rounded-full cursor-pointer overflow-hidden">
      <button
        onClick={handleClick}
        className={`rounded-full px-4 py-2 text-sm md:text-base font-medium ${
          isActive ? "bg-primary-10" : "text-primary-6 bg-opacity-0"
        } flex items-center gap-2`}
      >
        {getIcon()}
        {text}
      </button>

      {isActive && (
        <div className="hidden md:flex  absolute w-[90px] h-[2px] -bottom-[1px] left-0 right-0 mx-auto" />
      )}
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
export default memo(TabBtn);
