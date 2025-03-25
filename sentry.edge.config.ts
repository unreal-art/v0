// This file configures the initialization of Sentry on the edge runtime.
// The config you add here will be used for the edge runtime.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://52a47ad954fe8d72ef8330abd1980242@o4509038822031360.ingest.us.sentry.io/4509038936064000",

  // Enable error tracking but disable UI components
  enabled: true, // Keep Sentry itself enabled

  // Empty integrations array to ensure no UI components are added
  integrations: [],

  // Minimal configuration for edge runtime
  debug: false,

  // Performance settings
  tracesSampleRate: 0.1,

  // Disable feedback features
  sendClientReports: false,
});
