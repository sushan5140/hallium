"use client";

import { useCallback, useEffect, useState } from "react";
import HalliumCore from "./hallium-core";
import LandingPage from "./landing/LandingPage";
import { getHallimSupabase } from "../lib/supabase/client";

const learnerProfileKey = "hallim:learner-profile:v1";
const guestIdentityKey = "hallim:guest-review:v1";

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

  const startGuest = useCallback(async () => {
    setStatus("starting");
    setError("");
    const identity = getGuestIdentity();
    seedFullReviewProfile(identity);

    const supabase = getHallimSupabase();
    const { data, error: guestError } = await supabase.auth.signInAnonymously({
      options: {
        data: {
          name: identity.name,
          full_name: identity.name,
          display_name: identity.name,
          hallium_guest: true,
        },
      },
    });

    if (guestError || !data?.user) {
      localStorage.removeItem(learnerProfileKey);
      setError(guestError?.message || "Guest Mode could not be opened.");
      setStatus("gate");
      return;
    }

    setStatus("app");
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
        if (user.is_anonymous) {
          seedFullReviewProfile(getGuestIdentity());
        } else {
          try {
            const profile = JSON.parse(localStorage.getItem(learnerProfileKey) || "null");
            if (profile?.isGuest) localStorage.removeItem(learnerProfileKey);
          } catch {}
        }
        setStatus("app");
        return;
      }

      if (new URLSearchParams(window.location.search).get("guest") === "1") {
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

  return <HalliumCore />;
}
