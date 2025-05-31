import { EdgeHighlight } from "@highlight-run/next/server";
import appConfig from "@/config";

export const withEdgeHighlight = EdgeHighlight({
  projectID: appConfig.app.highlightProjectId,
});
