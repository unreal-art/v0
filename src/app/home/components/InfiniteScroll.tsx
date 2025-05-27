"use client";

import React, { useEffect, useRef } from "react";
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
  const { isLoadingInitial, isLoadingMore, children, loadMore, hasNextPage } =
    props;

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
      {isLoadingInitial && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-5  w-full ">
          {Array(15)
            .fill(null)
            .map((_, index) => (
              <Skeleton
                key={index}
                height={200}
                baseColor="#1a1a1a" // Dark background
                highlightColor="#333" // Slightly lighter shimmer effect
              />
            ))}
        </div>
      )}

      {!isLoadingInitial && <>{children}</>}

      <div ref={observerElement} id="obs">
        {isLoadingMore && hasNextPage && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2  w-full p-2 ">
            {Array(5)
              .fill(null)
              .map((_, index) => (
                <Skeleton
                  key={index}
                  height={200}
                  baseColor="#1a1a1a" // Dark background
                  highlightColor="#333" // Slightly lighter shimmer effect
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default InfiniteScroll;
