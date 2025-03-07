import { QueryClient } from "@tanstack/react-query";

// Request deduplication system to prevent duplicate API calls
const pendingRequests: Record<string, Promise<any>> = {};

export const dedupedRequest = async <T>(
  key: string,
  queryFn: () => Promise<T>
): Promise<T> => {
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

// Optimized query client configuration
export const createOptimizedQueryClient = (): QueryClient => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 3, // 3 minutes
        gcTime: 1000 * 60 * 15, // 15 minutes
        refetchOnWindowFocus: false,
        retry: 1,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        retry: 2,
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

// Prefetch helper for common patterns
export const prefetchRelatedData = async (
  queryClient: QueryClient,
  type: "post" | "user" | "comments",
  id: string | number,
  fetcher: () => Promise<any>
) => {
  // Don't prefetch if already in cache and not stale
  const existing = queryClient.getQueryData([type, id]);
  if (existing) return;

  try {
    await queryClient.prefetchQuery({
      queryKey: [type, id],
      queryFn: fetcher,
      staleTime: 1000 * 60 * 5, // 5 minute stale time for prefetched data
    });
  } catch (error) {
    console.error(`Error prefetching ${type} ${id}:`, error);
    // Silently fail - prefetching should not interrupt user experience
  }
};
