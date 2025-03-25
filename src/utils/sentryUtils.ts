import * as Sentry from "@sentry/nextjs";

/**
 * Log an error to Sentry with additional context
 */
export const captureException = (
  error: Error | unknown,
  context?: Record<string, any>
): void => {
  if (error instanceof Error) {
    Sentry.captureException(error, {
      extra: context,
    });
  } else {
    Sentry.captureException(new Error(String(error)), {
      extra: context,
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
  Sentry.captureMessage(message, {
    level,
    extra: context,
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
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
  });
};

/**
 * Set context information for current scope
 */
export const setContext = (
  name: string,
  context: Record<string, any>
): void => {
  Sentry.setContext(name, context);
};

/**
 * Replace console.log in production
 * In development, it will both log to console and send to Sentry as info-level message
 * In production, it will only send to Sentry
 */
export const log = (message: string, data?: any): void => {
  const isDev = process.env.NODE_ENV === "development";

  if (isDev) {
    console.log(message, data);
  }

  captureMessage(`${message} ${data ? JSON.stringify(data) : ""}`, "info");
};

/**
 * Replace console.error in production
 * Always captures as error in Sentry, only logs to console in development
 */
export const logError = (message: string, error?: Error | unknown): void => {
  const isDev = process.env.NODE_ENV === "development";

  if (isDev) {
    console.error(message, error);
  }

  if (error) {
    captureException(error, { message });
  } else {
    captureMessage(message, "error");
  }
};

/**
 * Replace console.warn in production
 * Always captures as warning in Sentry, only logs to console in development
 */
export const logWarning = (message: string, data?: any): void => {
  const isDev = process.env.NODE_ENV === "development";

  if (isDev) {
    console.warn(message, data);
  }

  captureMessage(`${message} ${data ? JSON.stringify(data) : ""}`, "warning");
};

/**
 * Start span for performance monitoring (simpler version of transactions)
 */
export const startSpan = (name: string, op: string): void => {
  // Use getCurrentHub and startSpan functionality if needed
  // For now, just add a breadcrumb for the operation start
  addBreadcrumb(`Started ${op}: ${name}`, "performance", "info");
};

/**
 * Set extra data on the current scope
 */
export const setExtra = (key: string, value: any): void => {
  Sentry.setExtra(key, value);
};
