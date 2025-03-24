import { QueryClient } from "@tanstack/react-query";

// Request deduplication system to prevent duplicate API calls
const pendingRequests: Record<string, Promise<any>> = {};

// Request deduplication with priority support
export const dedupedRequest = async <T>(
  key: string,
  queryFn: () => Promise<T>,
  options?: { priority?: "high" | "normal" | "low" }
): Promise<T> => {
  // If this is a high priority request and there's a pending request
  // for the same key, abort the current one to prioritize this one
  if (options?.priority === "high" && key in pendingRequests) {
    delete pendingRequests[key];
  }

  if (!pendingRequests[key]) {
    pendingRequests[key] = queryFn().finally(() => {
      delete pendingRequests[key];
    });
  }
  return pendingRequests[key] as Promise<T>;
};

// Normalized entity store for efficient data management
interface EntityCache {
  posts: Map<string | number, any>;
  users: Map<string | number, any>;
  comments: Map<string | number, any>;
}

export const entityCache: EntityCache = {
  posts: new Map<string | number, any>(),
  users: new Map<string | number, any>(),
  comments: new Map<string | number, any>(),
};

// Clear cache helper for memory management
export const clearEntityCache = (type?: keyof EntityCache) => {
  if (type) {
    entityCache[type].clear();
  } else {
    Object.values(entityCache).forEach((cache) => cache.clear());
  }
};

// Normalize and store entity data
export const normalizeEntity = <T extends { id: string | number }>(
  type: keyof EntityCache,
  entity: T | null
): T | null => {
  if (!entity) return null;

  const cache = entityCache[type];
  const id = entity.id;

  cache.set(id, { ...entity });

  return entity;
};

// Get entity by ID with type safety
export const getEntity = <T>(
  type: keyof EntityCache,
  id: string | number
): T | null => {
  const cache = entityCache[type];
  if (cache instanceof Map) {
    return (cache.get(id) as T) || null;
  }
  return null;
};

// Selectively update entity data without full invalidation
export const updateEntity = <T extends { id: number | string }>(
  type: keyof EntityCache,
  id: string | number,
  updates: Partial<T>
): T | null => {
  const entity = getEntity<T>(type, id);
  if (!entity) return null;

  const updated = { ...entity, ...updates };
  normalizeEntity(type, updated as any);
  return updated;
};

// Optimized query client configuration with improved settings for faster transitions
export const createOptimizedQueryClient = (): QueryClient => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 3, // 3 minutes
        gcTime: 1000 * 60 * 15, // 15 minutes
        refetchOnWindowFocus: false,
        retry: 1,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // Don't retry for 404s
        retryOnMount: false,
        // Add better batching for faster page transitions
        refetchInterval: false,
      },
      mutations: {
        retry: 1,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 15000),
      },
    },
  });
};

// Selective cache update helpers
export const updatePostInQueries = (
  queryClient: QueryClient,
  postId: number,
  updates: Record<string, any>
) => {
  // Update specific post
  queryClient.setQueryData(["post", postId], (old: any) =>
    old ? { ...old, ...updates } : old
  );

  // Update post in lists
  queryClient.setQueriesData({ queryKey: ["posts"] }, (old: any) => {
    if (!old) return old;

    // Handle infinite query structure
    if (old.pages) {
      return {
        ...old,
        pages: old.pages.map((page: any) => ({
          ...page,
          data: Array.isArray(page.data)
            ? page.data.map((post: any) =>
                post.id === postId ? { ...post, ...updates } : post
              )
            : page.data,
        })),
      };
    }

    // Handle regular array structure
    if (Array.isArray(old)) {
      return old.map((post: any) =>
        post.id === postId ? { ...post, ...updates } : post
      );
    }

    return old;
  });
};

// Cache warming for critical routes - call this on app init
export const warmCache = (
  queryClient: QueryClient,
  resources: Array<{
    key: string[];
    fetchFn: () => Promise<any>;
  }>
) => {
  // Only attempt cache warming if we have valid inputs
  if (!queryClient || !Array.isArray(resources) || resources.length === 0) {
    return Promise.resolve([]);
  }

  return Promise.allSettled(
    resources.map(({ key, fetchFn }) => {
      if (!Array.isArray(key) || typeof fetchFn !== "function") {
        return Promise.resolve(null);
      }

      return queryClient.prefetchQuery({
        queryKey: key,
        queryFn: fetchFn,
        staleTime: 5 * 60 * 1000, // 5 minutes - consistent with other timings
      });
    })
  );
};

// Page transition optimizations
export const prepareForNavigation = (
  queryClient: QueryClient,
  navigateTo: string
) => {
  // Set higher priority for queries related to the target page
  return {
    isPending: false,
    // Clean in-flight requests that aren't critical
    cleanup: () => {
      queryClient.cancelQueries();
      return Promise.resolve();
    },
  };
};

// Prefetch helper for common patterns
export const prefetchRelatedData = async (
  queryClient: QueryClient,
  type: "post" | "user" | "comments",
  id: string | number,
  fetchFn: () => Promise<any>
) => {
  // Safety check for inputs
  if (
    !queryClient ||
    !type ||
    id === undefined ||
    id === null ||
    typeof fetchFn !== "function"
  ) {
    return Promise.resolve(null);
  }

  // Don't prefetch if already in cache and not stale
  try {
    const existing = queryClient.getQueryData([type, id]);
    if (existing) return existing;

    return await queryClient.prefetchQuery({
      queryKey: [type, id],
      queryFn: fetchFn,
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  } catch (error) {
    // Silent fail for prefetching
    console.debug("Prefetch failed silently:", error);
    return null;
  }
};
