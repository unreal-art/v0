// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

// Completely disable the feedback integration before initializing
// @ts-ignore - Accessing internal API
if (Sentry.FeedbackIntegration) {
  // @ts-ignore - Override the integration's prototype
  const originalSetup = Sentry.FeedbackIntegration.prototype.setupOnce;
  // @ts-ignore - Override with noop function
  Sentry.FeedbackIntegration.prototype.setupOnce = function () {
    // Do nothing
  };
}

Sentry.init({
  dsn: "https://52a47ad954fe8d72ef8330abd1980242@o4509038822031360.ingest.us.sentry.io/4509038936064000",

  // Add optional integrations for additional features but disable feedback
  integrations: [
    Sentry.replayIntegration({
      // Optimize replay configuration
      blockAllMedia: true, // Block recording all media (images, videos)
      maskAllText: true, // Mask all text inputs by default
    }),
    // No feedback integration
  ],

  // Disable browser side feedback by setting scope
  initialScope: {
    user: { username: "anonymous" },
    tags: {
      environment: process.env.NODE_ENV || "development",
    },
  },

  // Reduce sampling rate for better performance
  // 10% of transactions will be captured instead of 100%
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0.3,

  // Optimize replay sampling rates
  // Only capture 1% of sessions in production, 10% in development
  replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.01 : 0.1,

  // Capture less error sessions in production (30% instead of 100%)
  replaysOnErrorSampleRate: process.env.NODE_ENV === "production" ? 0.3 : 1.0,

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
