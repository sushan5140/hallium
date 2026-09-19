import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { HALLIM_SUPABASE_PUBLISHABLE_KEY, HALLIM_SUPABASE_URL } from "./config";

export async function createHallimServerSupabase() {
  const cookieStore = await cookies();

  return createServerClient(
    HALLIM_SUPABASE_URL,
    HALLIM_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Route handlers can set cookies. Ignore only if invoked from a
            // context where Next.js does not permit cookie mutation.
          }
        },
      },
    }
  );
}
