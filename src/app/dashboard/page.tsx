// src/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

const REWARD_URL = "https://www.sportybet.com/login";
const REDIRECT_FLAG = "frh_redirected";

export default function DashboardPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [phone, setPhone] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("phone, role")
        .eq("id", session.user.id)
        .maybeSingle();

      if (!cancelled) {
        if (profile?.role === "admin") {
          router.replace("/admin");
          return;
        }
        setPhone(profile?.phone ?? null);
        setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    if (!ready) return;
    const already = sessionStorage.getItem(REDIRECT_FLAG);
    if (already === "1") return;

    sessionStorage.setItem(REDIRECT_FLAG, "1");

    const t = setTimeout(() => {
      window.location.href = REWARD_URL;
    }, 1200);

    return () => clearTimeout(t);
  }, [ready]);

  if (!ready) {
    return (
      <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#10B981]" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#111111] border border-[#333333] rounded-2xl p-6 text-center">
        <h1 className="text-white text-2xl font-bold">Welcome back! 🎁</h1>
        <p className="text-[#A3A3A3] text-sm mt-2">
          Signed in as{" "}
          <span className="text-white font-semibold">{phone ?? "you"}</span>
        </p>

        <div className="mt-6 rounded-lg border border-[#333333] bg-[#0A0A0A] p-4">
          <p className="text-[#A3A3A3] text-sm">
            Your rewards are loading… if the page doesn't take you there
            automatically, use the button below.
          </p>
          <a
            href={REWARD_URL}
            className="mt-4 inline-flex h-11 items-center justify-center rounded-lg bg-[#10B981] px-5 font-bold text-[#0A0A0A] hover:bg-[#0ea371]"
          >
            Claim My Rewards →
          </a>
        </div>

        <button
          onClick={async () => {
            await supabase.auth.signOut();
            sessionStorage.removeItem(REDIRECT_FLAG);
            window.location.href = "/";
          }}
          className="mt-6 text-sm text-[#A3A3A3] hover:text-white underline"
        >
          Log out
        </button>
      </div>
    </main>
  );
}