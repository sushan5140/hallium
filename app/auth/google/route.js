import { NextResponse } from "next/server";
import { createHallimServerSupabase } from "../../../lib/supabase/server";
import { sanitizeNext } from "../../../lib/auth/safe-next";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const next = sanitizeNext(searchParams.get("next"));

  const supabase = await createHallimServerSupabase();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error || !data?.url) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error?reason=google_start_failed`);
  }

  const response = NextResponse.redirect(data.url);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
