import * as Sentry from "@sentry/nextjs";

// Track throttled messages to avoid duplicates
interface ThrottleCache {
  [key: string]: {
    timestamp: number;
    count: number;
  };
}

// Cache for throttling
const messageCache: ThrottleCache = {};
const MIN_THROTTLE_MS = 5000; // 5 seconds between identical messages
const MAX_CACHE_SIZE = 100;
const MAX_OBJECT_SIZE = 5000; // Characters limit for stringified objects

/**
 * Safely stringify data, with size limits to prevent performance issues
 */
const safeStringify = (data: any): string => {
  if (data === undefined || data === null) return "";
  if (typeof data === "string") return data.substring(0, MAX_OBJECT_SIZE);

  try {
    const str = JSON.stringify(data);
    return str.length > MAX_OBJECT_SIZE
      ? str.substring(0, MAX_OBJECT_SIZE) + "...[truncated]"
      : str;
  } catch (e) {
    return "[Object cannot be serialized]";
  }
};

/**
 * Clean the throttle cache periodically
 */
const cleanThrottleCache = (): void => {
  const now = Date.now();
  const keys = Object.keys(messageCache);

  if (keys.length > MAX_CACHE_SIZE) {
    // Remove oldest entries if cache is too large
    const oldestKeys = keys
      .map((key) => ({ key, time: messageCache[key].timestamp }))
      .sort((a, b) => a.time - b.time)
      .slice(0, keys.length - MAX_CACHE_SIZE / 2)
      .map((item) => item.key);

    oldestKeys.forEach((key) => delete messageCache[key]);
  }

  // Remove expired entries
  keys.forEach((key) => {
    if (now - messageCache[key].timestamp > MIN_THROTTLE_MS * 10) {
      delete messageCache[key];
    }
  });
};

// Clean cache every minute
if (typeof window !== "undefined") {
  setInterval(cleanThrottleCache, 60000);
}

/**
 * Check if a message is throttled
 * Returns true if the message should be skipped
 */
const isThrottled = (cacheKey: string): boolean => {
  const now = Date.now();

  if (messageCache[cacheKey]) {
    const { timestamp, count } = messageCache[cacheKey];
    const elapsed = now - timestamp;

    if (elapsed < MIN_THROTTLE_MS) {
      // Update count but don't send
      messageCache[cacheKey].count++;
      return true;
    }

    // Update timestamp and count
    messageCache[cacheKey].timestamp = now;
    messageCache[cacheKey].count++;
  } else {
    // First occurrence
    messageCache[cacheKey] = { timestamp: now, count: 1 };

    // Clean cache if it gets too large
    if (Object.keys(messageCache).length > MAX_CACHE_SIZE) {
      cleanThrottleCache();
    }
  }

  return false;
};

/**
 * Log an error to Sentry with additional context
 */
export const captureException = (
  error: Error | unknown,
  context?: Record<string, any>
): void => {
  // Skip in development for better performance, just log to console
  if (process.env.NODE_ENV === "development") {
    console.error(error, context);
    return;
  }

  // Create a throttle key based on error message
  const errorMessage = error instanceof Error ? error.message : String(error);
  const throttleKey = `error:${errorMessage.substring(0, 100)}`;

  if (isThrottled(throttleKey)) return;

  // Limit context size to prevent performance issues
  const safeContext = context
    ? Object.fromEntries(
        Object.entries(context).map(([key, value]) => [
          key,
          safeStringify(value),
        ])
      )
    : undefined;

  if (error instanceof Error) {
    Sentry.captureException(error, {
      extra: safeContext,
    });
  } else {
    Sentry.captureException(new Error(String(error)), {
      extra: safeContext,
    });
  }
};

/**
 * Log a message to Sentry at the specified level
 */
export const captureMessage = (
  message: string,
  level: Sentry.SeverityLevel = "info",
  context?: Record<string, any>
): void => {
  // Skip low-priority messages in production
  if (process.env.NODE_ENV === "production" && level === "info") {
    return;
  }

  // Limit message size
  const safeMessage = message.substring(0, 200);

  // Create throttle key based on message
  const throttleKey = `${level}:${safeMessage}`;

  if (isThrottled(throttleKey)) return;

  // Limit context size
  const safeContext = context
    ? Object.fromEntries(
        Object.entries(context).map(([key, value]) => [
          key,
          safeStringify(value),
        ])
      )
    : undefined;

  Sentry.captureMessage(safeMessage, {
    level,
    extra: safeContext,
  });
};

/**
 * Set the current user for Sentry tracking
 */
export const setUser = (
  id: string | null,
  email?: string,
  username?: string,
  additionalData?: Record<string, any>
): void => {
  if (id) {
    Sentry.setUser({
      id,
      email,
      username,
      ...additionalData,
    });
  } else {
    // Clear user data when id is null
    Sentry.setUser(null);
  }
};

/**
 * Add breadcrumb to track user or system actions
 */
export const addBreadcrumb = (
  message: string,
  category?: string,
  level: Sentry.SeverityLevel = "info",
  data?: Record<string, any>
): void => {
  // Skip breadcrumbs in production for better performance
  if (process.env.NODE_ENV === "production" && level === "info") {
    return;
  }

  // Limit data size
  const safeData = data
    ? Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, safeStringify(value)])
      )
    : undefined;

  Sentry.addBreadcrumb({
    message: message.substring(0, 100),
    category,
    level,
    data: safeData,
  });
};

/**
 * Set context information for current scope
 */
export const setContext = (
  name: string,
  context: Record<string, any>
): void => {
  // Limit context size
  const safeContext = Object.fromEntries(
    Object.entries(context).map(([key, value]) => [key, safeStringify(value)])
  );

  Sentry.setContext(name, safeContext);
};

/**
 * Replace console.log in production
 * In development, it will only log to console
 * In production, it will send to Sentry as warning-level message only if important
 */
export const log = (message: string, data?: any): void => {
  const isDev = process.env.NODE_ENV === "development";

  if (isDev) {
    console.log(message, data);
    return;
  }

  // In production, only log critical info
  // Most info logs can be skipped entirely
  if (
    message.includes("error") ||
    message.includes("fail") ||
    message.includes("critical")
  ) {
    captureMessage(`${message}`, "warning");
  }
};

/**
 * Replace console.error in production
 * Always captures as error in Sentry, only logs to console in development
 */
export const logError = (message: string, error?: Error | unknown): void => {
  const isDev = process.env.NODE_ENV === "development";

  if (isDev) {
    console.error(message, error);
    return;
  }

  // Create throttle key for this error
  const errorMessage = error instanceof Error ? error.message : String(error);
  const throttleKey = `error:${message}:${errorMessage.substring(0, 50)}`;

  if (isThrottled(throttleKey)) return;

  if (error) {
    captureException(error, { message });
  } else {
    captureMessage(message, "error");
  }
};

/**
 * Replace console.warn in production
 * Captures as warning in Sentry, only logs to console in development
 */
export const logWarning = (message: string, data?: any): void => {
  const isDev = process.env.NODE_ENV === "development";

  if (isDev) {
    console.warn(message, data);
    return;
  }

  // Create throttle key for this warning
  const throttleKey = `warning:${message}`;

  if (isThrottled(throttleKey)) return;

  captureMessage(message, "warning");
};

/**
 * Start performance monitoring span
 * Returns a function to call when the operation is complete
 */
export const startSpan = (
  name: string,
  op: string,
  data?: Record<string, any>
): (() => void) => {
  // Skip in production environments where we've disabled performance monitoring for speed
  if (process.env.NODE_ENV === "production") {
    // Return empty function as noop
    return () => {};
  }

  // Create unique ID for this operation
  const spanId = `${op}-${name}-${Date.now()}`;
  const startTime = performance.now();

  // Add breadcrumb for operation start
  const safeData = data
    ? Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, safeStringify(value)])
      )
    : undefined;

  addBreadcrumb(`Started ${op}: ${name}`, "performance", "info", {
    ...safeData,
    spanId,
  });

  // Return a function to finish the span
  return () => {
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);

    // Only track operations that took significant time (> 50ms)
    if (duration > 50) {
      addBreadcrumb(
        `Finished ${op}: ${name} (${duration}ms)`,
        "performance",
        duration > 500 ? "warning" : "info", // Mark slow operations as warnings
        {
          ...safeData,
          duration,
          spanId,
        }
      );

      // For very slow operations (>1s), send a performance issue
      if (duration > 1000) {
        captureMessage(
          `Slow operation: ${op} - ${name} took ${duration}ms`,
          "warning",
          {
            performance: true,
            duration,
            operation: op,
            ...safeData,
          }
        );
      }
    }
  };
};

/**
 * Set extra data on the current scope
 */
export const setExtra = (key: string, value: any): void => {
  Sentry.setExtra(key, safeStringify(value));
};
