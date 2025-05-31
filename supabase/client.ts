import { createBrowserClient } from "@supabase/ssr";
import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "$/types/database.types";
import appConfig from "@/config";

export function createClient() {
  return createBrowserClient(
    appConfig.services.supabase.url,
    appConfig.services.supabase.anonKey,
  );
}

export type Client = SupabaseClient<Database>;
export const supabase: Client = createClient();
