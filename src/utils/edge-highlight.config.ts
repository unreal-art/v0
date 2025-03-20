import { EdgeHighlight } from "@highlight-run/next/server";

export const withEdgeHighlight = EdgeHighlight({
  projectID: process.env.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID as string,
});
