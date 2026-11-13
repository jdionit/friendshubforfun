// src/store/userStore.ts
import { create } from "zustand";
import type { Session } from "@supabase/supabase-js";

export type AppUser = {
  id: string;
  phone: string | null;
  role: "admin" | "user";
};

type UserState = {
  session: Session | null;
  user: AppUser | null;
  setSession: (session: Session | null) => void;
  setUser: (user: AppUser | null) => void;
  clear: () => void;
};

export const useUserStore = create<UserState>((set) => ({
  session: null,
  user: null,
  setSession: (session) => set({ session }),
  setUser: (user) => set({ user }),
  clear: () => set({ session: null, user: null }),
}));