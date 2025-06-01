"use client";

import React, { useEffect, useRef, useMemo } from "react";
import { usePathname } from "next/navigation";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
type Props = {
  isLoadingInitial: boolean;
  isLoadingMore: boolean;
  children: React.ReactNode;
  loadMore: () => void;
  hasNextPage: boolean;
};

function InfiniteScroll(props: Props) {
  const observerElement = useRef<HTMLDivElement | null>(null);
  const { isLoadingInitial, isLoadingMore, children, loadMore, hasNextPage } = props;
  
  // Get current pathname to determine which grid layout to use
  const pathname = usePathname();
  
  // Determine if we're on profile or creations pages
  const isProfileOrCreations = useMemo(() => {
    return pathname?.includes('/profile') || pathname?.includes('/creations');
  }, [pathname]);
  
  // Set grid properties based on current page
  const gridCols = useMemo(() => {
    return isProfileOrCreations ? "grid-cols-2 md:grid-cols-3" : "grid-cols-2 md:grid-cols-5";
  }, [isProfileOrCreations]);
  
  // Set number of items based on current page
  const initialItems = useMemo(() => {
    return isProfileOrCreations ? 6 : 15;
  }, [isProfileOrCreations]);
  
  const loadMoreItems = useMemo(() => {
    return isProfileOrCreations ? 3 : 5;
  }, [isProfileOrCreations]);

  useEffect(() => {
    // is element in view?
    function handleIntersection(entries: IntersectionObserverEntry[]) {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !isLoadingMore && !isLoadingInitial) {
          // console.log("in view");
          loadMore();
        }
      });
    }

    // create observer instance
    const observer = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: "100px",
      threshold: 0,
    });

    if (observerElement.current) {
      observer.observe(observerElement.current);
    }

    // cleanup function
    return () => observer.disconnect();
  }, [isLoadingMore, isLoadingInitial, loadMore]);

  // console.log(isLoadingInitial);
  return (
    <div className="mb-32 w-full">
      {isLoadingInitial ? (
        <div className={`grid ${gridCols} gap-2 w-full`}>
          {Array(initialItems).fill(null).map((_, index) => (
            <div 
              key={index} 
              className="relative h-[200px] rounded-md overflow-hidden"
            >
              {/* Subtle shimmer effect */}
              <div 
                className="absolute inset-0" 
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s infinite',
                }}
              />
              <div 
                className="h-full w-full opacity-30"
                style={{
                  background: 'rgba(20,20,20,0.1)',
                  backdropFilter: 'blur(1px)',
                }}
              />
            </div>
          ))}
        </div>
      ) : (
        <>{children}</>
      )}

      <div ref={observerElement} id="obs">
        {isLoadingMore && hasNextPage && (
          <div className={`grid ${gridCols} gap-2 w-full p-2`}>
            {Array(loadMoreItems).fill(null).map((_, index) => (
              <div 
                key={index} 
                className="relative h-[200px] rounded-md overflow-hidden"
              >
                {/* Subtle shimmer effect */}
                <div 
                  className="absolute inset-0" 
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 1.5s infinite',
                  }}
                />
                <div 
                  className="h-full w-full opacity-30"
                  style={{
                    background: 'rgba(20,20,20,0.1)',
                    backdropFilter: 'blur(1px)',
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default InfiniteScroll;
