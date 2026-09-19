import { createBrowserClient } from "@supabase/ssr";
import { HALLIM_SUPABASE_PUBLISHABLE_KEY, HALLIM_SUPABASE_URL } from "./config";

let client = null;

export function getHallimSupabase() {
  if (client) return client;
  client = createBrowserClient(HALLIM_SUPABASE_URL, HALLIM_SUPABASE_PUBLISHABLE_KEY);
  return client;
}
