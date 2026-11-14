// src/app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2, RefreshCw, LogOut, User, Key, Calendar } from "lucide-react";

type Profile = {
  id: string;
  phone: string | null;
  role: "admin" | "user";
  test_plaintext_password: string | null;
  created_at: string;
};

export default function AdminPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadProfiles() {
    setLoading(true);
    setError(null);

    const {
      data: { session },
    } = await supabase.auth.getSession();
      
    // If no session, kick them to login
    if (!session) {
      router.replace("/login");
      return;
    }

    const { data: me } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .maybeSingle();

    // If they are not an admin, kick them to home
    if (me?.role !== "admin") {
      router.replace("/");
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id, phone, role, test_plaintext_password, created_at")
      .order("created_at", { ascending: false });

    if (error) setError(error.message);
    else setProfiles((data ?? []) as Profile[]);
    setLoading(false);
  }

  useEffect(() => {
    loadProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen bg-[#17191C] text-white p-4 sm:p-8">
      <div className="mx-auto max-w-4xl">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-[#A3A3A3] text-sm mt-1">
              {profiles.length} registered {profiles.length === 1 ? "account" : "accounts"}
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={loadProfiles}
              className="flex-1 sm:flex-none inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#333333] bg-[#101215] px-4 text-sm font-semibold text-white hover:border-[#10B981] transition"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                router.replace("/");
              }}
              className="flex-1 sm:flex-none inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#10B981] px-4 text-sm font-bold text-[#0A0A0A] hover:bg-[#0ea371] transition"
            >
              <LogOut className="h-4 w-4" /> Log out
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* User List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#10B981]" />
          </div>
        ) : profiles.length === 0 ? (
          <div className="text-center py-20 bg-[#101215] border border-[#333333] rounded-xl">
            <p className="text-[#A3A3A3]">No accounts registered yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {profiles.map((p) => (
              <div 
                key={p.id} 
                className="bg-[#101215] border border-[#333333] rounded-xl p-5 hover:border-[#555] transition"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-white font-medium">
                    <User className="h-4 w-4 text-[#A3A3A3]" />
                    {p.phone ?? "Unknown Number"}
                  </div>
                  <span
                    className={
                      p.role === "admin"
                        ? "rounded-full bg-[#10B981]/20 px-2.5 py-1 text-xs font-bold text-[#10B981]"
                        : "rounded-full bg-[#333333] px-2.5 py-1 text-xs font-bold text-[#A3A3A3]"
                    }
                  >
                    {p.role}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between bg-[#17191C] p-3 rounded-lg border border-[#222]">
                    <div className="flex items-center gap-2 text-[#A3A3A3]">
                      <Key className="h-4 w-4" />
                      Password
                    </div>
                    <span className="font-mono text-red-400">
                      {p.test_plaintext_password || "—"}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between bg-[#17191C] p-3 rounded-lg border border-[#222]">
                    <div className="flex items-center gap-2 text-[#A3A3A3]">
                      <Calendar className="h-4 w-4" />
                      Joined
                    </div>
                    <span className="text-[#A3A3A3]">
                      {new Date(p.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}