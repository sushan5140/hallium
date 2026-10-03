"use client";

import { useCallback, useEffect, useState } from "react";
import HalliumCore from "./hallium-core";
import LandingPage from "./landing/LandingPage";
import { getHallimSupabase } from "../lib/supabase/client";

const learnerProfileKey = "hallim:learner-profile:v1";
const guestIdentityKey = "hallim:guest-review:v1";
const guestSessionKey = "hallim:guest-session-id:v1";
const guestEntryLoggedKey = "hallim:guest-entry-logged:v1";

function makeGuestIdentity() {
  const first = ["Haneul","Nuri","Bomi","Haru","Miso","Duri","Jadu","Seoul"];
  const second = ["Learner","Explorer","Reader","Buddy","Rookie","Traveler","Dreamer","Guest"];
  const pick = (values) => values[Math.floor(Math.random() * values.length)];
  const name = pick(first) + pick(second) + Math.floor(100 + Math.random() * 900);
  return { name, createdAt: new Date().toISOString() };
}

function getGuestIdentity() {
  if (typeof window === "undefined") return { name: "HallimGuest", createdAt: new Date().toISOString() };
  try {
    const saved = JSON.parse(sessionStorage.getItem(guestIdentityKey) || "null");
    if (saved?.name) return saved;
  } catch {}
  const identity = makeGuestIdentity();
  sessionStorage.setItem(guestIdentityKey, JSON.stringify(identity));
  return identity;
}

function getGuestSessionId() {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem(guestSessionKey) || "";
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    id = crypto.randomUUID();
    sessionStorage.setItem(guestSessionKey, id);
  }
  return id;
}

async function logGuestEntry(identity) {
  if (typeof window === "undefined" || sessionStorage.getItem(guestEntryLoggedKey) === "1") return;
  const guestSessionId = getGuestSessionId();
  if (!guestSessionId) return;
  try {
    const supabase = getHallimSupabase();
    const { error } = await supabase.from("hallium_guest_entries").insert({
      guest_session_id: guestSessionId,
      guest_name: String(identity?.name || "HallimGuest").slice(0, 64),
      landing_path: window.location.pathname || "/",
      entry_mode: "guest",
    });
    if (!error) sessionStorage.setItem(guestEntryLoggedKey, "1");
  } catch {
    // Analytics must never block reviewer access.
  }
}

function seedFullReviewProfile(identity) {
  const now = new Date().toISOString();
  localStorage.setItem(learnerProfileKey, JSON.stringify({
    currentLevel: "new",
    targetLevel: "advanced",
    displayName: identity.name,
    isGuest: true,
    createdAt: identity.createdAt || now,
    updatedAt: now,
  }));
}

function googleHref(destination = "/") {
  return "/auth/google?next=" + encodeURIComponent(destination);
}

export default function HalliumEntry() {
  const [status, setStatus] = useState("checking");
  const [error, setError] = useState("");
  const [guestName, setGuestName] = useState("");

  const startGuest = useCallback(async () => {
    setStatus("starting");
    setError("");
    const identity = getGuestIdentity();
    seedFullReviewProfile(identity);
    sessionStorage.setItem("hallim:guest-active:v1", "1");
    void logGuestEntry(identity);
    setGuestName(identity.name);
    setStatus("guest");
    const params = new URLSearchParams(window.location.search);
    if (params.get("guest") === "1") {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const boot = async () => {
      const supabase = getHallimSupabase();
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (!active) return;

      if (sessionError) {
        setError(sessionError.message);
        setStatus("gate");
        return;
      }

      const user = data?.session?.user || null;
      if (user) {
        try {
          const profile = JSON.parse(localStorage.getItem(learnerProfileKey) || "null");
          if (profile?.isGuest) localStorage.removeItem(learnerProfileKey);
        } catch {}
        sessionStorage.removeItem("hallim:guest-active:v1");
        setStatus("app");
        return;
      }

      const params = new URLSearchParams(window.location.search);
      if (params.get("guest") === "1" || sessionStorage.getItem("hallim:guest-active:v1") === "1") {
        await startGuest();
        return;
      }

      setStatus("gate");
    };

    boot();
    return () => { active = false; };
  }, [startGuest]);

  if (status === "checking" || status === "starting") {
    return (
      <main className="staticHallimGate staticGateLoading">
        <div className="staticLoadingMark">ㅎ</div>
        <span>{status === "starting" ? "Opening Guest Mode…" : "Checking Hallim access…"}</span>
      </main>
    );
  }

  if (status === "gate") {
    return (
      <LandingPage
        authHref={googleHref}
        guestHref="/?guest=1"
        authError={error}
      />
    );
  }

  if (status === "guest") {
    return <HalliumCore guestMode guestName={guestName || getGuestIdentity().name} />;
  }

  return <HalliumCore />;
}
