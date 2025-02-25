"use client";

import { useSearchPostsInfinite } from "@/hooks/useSearchPostsInfinite";
import { useState, useRef, useCallback } from "react";
import { useDebounce } from "use-debounce";
import { Post } from "$/types/data.types";

export const SearchResults = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useSearchPostsInfinite(debouncedSearch, 10);

  const lastPostRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isFetchingNextPage || !hasNextPage) return;

      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            fetchNextPage();
          }
        },
        { threshold: 1 },
      );

      if (node) observerRef.current.observe(node);
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  );

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* 🔍 Search Input */}
      <input
        type="text"
        placeholder="Search posts..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 border rounded-lg shadow-sm focus:ring focus:border-blue-500"
      />

      {/* 🔄 Loading State */}
      {isLoading && (
        <div className="text-center py-4">
          <div className="animate-spin mx-auto h-6 w-6 text-gray-500">
            {" "}
            loading
          </div>
        </div>
      )}

      {/* ⚠️ Error State */}
      {isError && (
        <p className="text-red-500 text-center py-2">Error: {error.message}</p>
      )}

      {/* 📌 Search Results */}
      <div className="mt-4 space-y-4">
        {data?.pages.flatMap((page, pageIndex) =>
          page.data.map((post: Post, postIndex) => {
            const isLastPost =
              pageIndex === data.pages.length - 1 &&
              postIndex === page.data.length - 1;

            return (
              <div
                key={post.id}
                ref={isLastPost ? lastPostRef : null}
                className="p-4 border rounded-lg shadow-md hover:shadow-lg transition"
              >
                <h3 className="text-lg font-semibold">{post.id}</h3>
                <p className="text-gray-600 text-sm">{post.prompt}</p>
              </div>
            );
          }),
        )}
      </div>

      {/* 🔄 Loading More Indicator */}
      {isFetchingNextPage && (
        <div className="text-center py-4">
          <div className="animate-spin mx-auto h-6 w-6 text-gray-500">
            {" "}
            loading more
          </div>
        </div>
      )}
    </div>
  );
};
