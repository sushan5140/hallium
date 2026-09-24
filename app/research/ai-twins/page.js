import { redirect } from "next/navigation";

// Retire the scripted V0 route so older bookmarks open the actual two-account pilot.
export default function OldTwinverseLink() {
  redirect("/ai-twins");
}
