// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://52a47ad954fe8d72ef8330abd1980242@o4509038822031360.ingest.us.sentry.io/4509038936064000",

  // Disable all opt-in features including feedback button and session replay
  replaysSessionSampleRate: 0, // Disable session replay completely
  replaysOnErrorSampleRate: 0, // Disable error replay completely

  // Explicitly disable the feedback widget
  integrations: [
    Sentry.feedbackIntegration({
      autoInject: false, // This prevents the button from being automatically injected
    }),
  ],

  // Reduce sampling rate for better performance
  // 10% of transactions will be captured instead of 100%
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0.3,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Add performance optimizations
  // Don't block page load while sending events
  beforeSend(event) {
    // Ignore non-critical errors automatically
    if (event.level === "info" && process.env.NODE_ENV === "production") {
      return null;
    }
    return event;
  },

  // Optimize transport with batching
  maxBreadcrumbs: 50, // Reduce from default 100
  sendClientReports: false, // Disable client reports
});
