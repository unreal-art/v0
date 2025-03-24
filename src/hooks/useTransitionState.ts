import { useContext, useMemo, useCallback, useState, useEffect } from "react";
import { PageTransitionContext } from "@/app/providers/PageTransitionProvider";
import {
  useCreationAndProfileStore,
  NavigationType,
} from "@/stores/creationAndProfileStore";
import { useGalleryStore } from "@/stores/galleryStore";

/**
 * Custom hook for accessing all transition-related state
 * Combines PageTransitionContext and creationAndProfileStore
 * Now optimized to bypass animations for tab changes
 */
export function useTransitionState() {
  // Track whether there was a user-initiated navigation action
  const [userNavigated, setUserNavigated] = useState(false);

  // Get context values
  const { isPageTransitioning } = useContext(PageTransitionContext);

  // Get store values
  const {
    lastNavigationType,
    isTransitioning,
    setNavigationType,
    setIsTransitioning,
  } = useCreationAndProfileStore();

  // Get tab-specific state
  const { isTabTransitioning } = useGalleryStore();

  // Calculate overall transition state
  const isAnyTransitioning =
    isTransitioning || isTabTransitioning || isPageTransitioning;

  // Mark a transition as a tab change - IMMEDIATELY prevents page animations
  const markAsTabChange = useCallback(() => {
    setUserNavigated(true);
    // By setting navigation type as tab first, we prevent page animations
    setNavigationType("tab");
    // Immediately cancel any pending transitions for tabs
    setIsTransitioning(false);
  }, [setNavigationType, setIsTransitioning]);

  // Mark a transition as a page change
  const markAsPageChange = useCallback(() => {
    setUserNavigated(true);
    setNavigationType("page");
    // For page changes we DO want transitions
    setIsTransitioning(true);
  }, [setNavigationType, setIsTransitioning]);

  // Start a transition - ONLY for page changes
  const startTransition = useCallback(() => {
    if (lastNavigationType !== "tab") {
      setIsTransitioning(true);
    }
  }, [lastNavigationType, setIsTransitioning]);

  // End a transition
  const endTransition = useCallback(() => {
    setIsTransitioning(false);
    setUserNavigated(false);
  }, [setIsTransitioning]);

  // Reset after navigation is complete
  useEffect(() => {
    if (userNavigated && !isAnyTransitioning) {
      // Navigation complete, reset user navigation flag
      setUserNavigated(false);
    }
  }, [userNavigated, isAnyTransitioning]);

  // Combine and memoize all transition-related values
  const transitionState = useMemo(
    () => ({
      // Read-only values
      isPageTransitioning,
      isTabTransitioning,
      isTransitioning,
      isAnyTransitioning,
      lastNavigationType,
      userNavigated,

      // Is this a tab change? (derived value)
      isTabChange: lastNavigationType === "tab",

      // Is this a page change? (derived value)
      isPageChange: lastNavigationType === "page",

      // Is this the initial load? (derived value)
      isInitialLoad: lastNavigationType === "none",

      // Setters
      setNavigationType,
      setIsTransitioning,
      setUserNavigated,

      // Convenience methods
      markAsTabChange,
      markAsPageChange,
      startTransition,
      endTransition,

      // Force disable animations - useful for tab changes
      forceDisableAnimations: lastNavigationType === "tab",
    }),
    [
      isPageTransitioning,
      isTabTransitioning,
      isTransitioning,
      isAnyTransitioning,
      lastNavigationType,
      userNavigated,
      setNavigationType,
      setIsTransitioning,
      markAsTabChange,
      markAsPageChange,
      startTransition,
      endTransition,
    ]
  );

  return transitionState;
}
