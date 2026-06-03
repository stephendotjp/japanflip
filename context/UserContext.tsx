"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Tier = "free" | "basic" | "premium";

interface UserState {
  tier: Tier;
  purchasedAt: number | null;
}

interface UserContextValue extends UserState {
  setTier: (tier: Tier) => void;
  isBasic: boolean;
  isPremium: boolean;
  canView: (opTier: string) => boolean;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<UserState>({ tier: "free", purchasedAt: null });

  useEffect(() => {
    const stored = localStorage.getItem("japanflip_user");
    if (stored) {
      try {
        setState(JSON.parse(stored));
      } catch {}
    }
  }, []);

  const setTier = (tier: Tier) => {
    const next = { tier, purchasedAt: Date.now() };
    setState(next);
    localStorage.setItem("japanflip_user", JSON.stringify(next));
  };

  const isBasic = state.tier === "basic" || state.tier === "premium";
  const isPremium = state.tier === "premium";

  const canView = (opTier: string) => {
    if (isPremium) return true;
    if (isBasic && opTier === "basic") return true;
    return false;
  };

  return (
    <UserContext.Provider value={{ ...state, setTier, isBasic, isPremium, canView }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
