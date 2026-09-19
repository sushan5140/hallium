import { NextResponse } from "next/server";
import { createHallimServerSupabase } from "../../../lib/supabase/server";
import { sanitizeNext } from "../../../lib/auth/safe-next";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = sanitizeNext(searchParams.get("next"));

  if (code) {
    const supabase = await createHallimServerSupabase();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const separator = next.includes("?") ? "&" : "?";
      const response = NextResponse.redirect(`${origin}${next}${separator}auth=google`);
      response.headers.set("Cache-Control", "private, no-store");
      return response;
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error?reason=exchange_failed`);
}
