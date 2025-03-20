// utils/app-router-highlight.config.ts:
import { AppRouterHighlight } from "@highlight-run/next/server";

export const withAppRouterHighlight = AppRouterHighlight({
  projectID: process.env.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID as string,
});
