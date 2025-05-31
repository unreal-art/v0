// utils/app-router-highlight.config.ts:
import { AppRouterHighlight } from "@highlight-run/next/server";
import appConfig from "@/config";

export const withAppRouterHighlight = AppRouterHighlight({
  projectID: appConfig.app.highlightProjectId,
});
