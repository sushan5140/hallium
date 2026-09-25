import { notFound } from "next/navigation";
import { createHallimServerSupabase } from "../../lib/supabase/server";
import { ownerCourse } from "../../lib/owner-korean/course";
import { ownerBatch03 } from "../../lib/owner-korean/batch03";
import OwnerStudyClient from "./studio-client";
import "./studio.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "My Korean Studio · Hallium",
  robots: { index: false, follow: false, nocache: true },
};

// Never allow a direct URL, crawler, prefetch, or unauthenticated API
// consumer to render private course data. Server-side auth is mandatory,
// even though the navigation entry is also hidden for everyone else.
export default async function OwnerKoreanStudio() {
  const supabase = await createHallimServerSupabase();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user || user.email?.trim().toLowerCase() !== "sushan5140s@gmail.com") notFound();

  const { data: admin, error: adminError } = await supabase.from("admin_users")
    .select("user_id").eq("user_id", user.id).maybeSingle();
  if (adminError || admin?.user_id !== user.id) notFound();

  // The owner_korean_study table has an independent RLS owner+admin policy.
  // Only these non-sensitive notes, saves and results are user-editable.
  const { data: saved, error: stateError } = await supabase.from("owner_korean_study")
    .select("saved_items,personal_notes,lesson_results")
    .eq("user_id",user.id).maybeSingle();

  return (
    <OwnerStudyClient
      course={[...ownerCourse,...ownerBatch03]}
      initialState={stateError ? null : saved}
      stateError={stateError ? "Your private notes could not load. Saving is paused; try refreshing." : ""}
      userId={user.id}
    />
  );
}
