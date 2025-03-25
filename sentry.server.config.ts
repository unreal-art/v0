// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://52a47ad954fe8d72ef8330abd1980242@o4509038822031360.ingest.us.sentry.io/4509038936064000",

  // Reduce sampling rate for better performance - only sample 10% of server transactions
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0.3,

  // Disable debug mode in all environments
  debug: false,

  // Optimize performance
  maxBreadcrumbs: 50, // Reduce from default 100
  initialScope: {
    tags: {
      environment: process.env.NODE_ENV || "development",
    },
  },

  // Filter out non-critical errors in production
  beforeSend(event) {
    if (event.level === "info" && process.env.NODE_ENV === "production") {
      return null;
    }
    return event;
  },
});
