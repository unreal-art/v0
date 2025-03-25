// This file configures the initialization of Sentry for Edge API routes.
// The config you add here will be used whenever an Edge API route handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://52a47ad954fe8d72ef8330abd1980242@o4509038822031360.ingest.us.sentry.io/4509038936064000",

  // Reduced sampling rate for edge functions
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.05 : 0.2,

  // Better performance for edge functions
  debug: false,
  maxBreadcrumbs: 30, // Even lower for edge functions

  // Filter out non-critical errors in production
  beforeSend(event) {
    if (event.level === "info" && process.env.NODE_ENV === "production") {
      return null;
    }
    return event;
  },
});
