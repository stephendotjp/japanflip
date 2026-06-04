"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Tier, SavedLookup, TripItem } from "@/lib/types";

interface UserState {
  tier: Tier;
  email: string | null;
  lookupCount: number;
  lookupDate: string;
  savedLookups: SavedLookup[];
  homeCountry: string;
  tripItems: TripItem[];
  tripDate: string;
}

interface UserContextValue extends UserState {
  setTier: (tier: Tier, email?: string) => void;
  incrementLookup: () => void;
  saveLookup: (lookup: SavedLookup) => void;
  setHomeCountry: (country: string) => void;
  addToTrip: (item: TripItem) => void;
  clearTrip: () => void;
  isBasic: boolean;
  isPremium: boolean;
  todayCount: number;
  currentTripItems: TripItem[];
}

const defaultState: UserState = {
  tier: "free",
  email: null,
  lookupCount: 0,
  lookupDate: "",
  savedLookups: [],
  homeCountry: "US",
  tripItems: [],
  tripDate: "",
};

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<UserState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("japanflip_user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setState({ ...defaultState, ...parsed });
      } catch {}
    }
    setHydrated(true);
  }, []);

  const persist = (next: UserState) => {
    setState(next);
    localStorage.setItem("japanflip_user", JSON.stringify(next));
  };

  const setTier = (tier: Tier, email?: string) => {
    persist({ ...state, tier, email: email ?? state.email });
  };

  const incrementLookup = () => {
    const today = new Date().toISOString().split("T")[0];
    const count = state.lookupDate === today ? state.lookupCount + 1 : 1;
    persist({ ...state, lookupCount: count, lookupDate: today });
  };

  const saveLookup = (lookup: SavedLookup) => {
    const cap = state.tier === "premium" ? 50 : 20;
    const updated = [lookup, ...state.savedLookups].slice(0, cap);
    persist({ ...state, savedLookups: updated });
  };

  const setHomeCountry = (country: string) => {
    persist({ ...state, homeCountry: country });
  };

  const addToTrip = (item: TripItem) => {
    const today = new Date().toISOString().split("T")[0];
    const existingItems = state.tripDate === today ? state.tripItems : [];
    persist({ ...state, tripItems: [...existingItems, item], tripDate: today });
  };

  const clearTrip = () => {
    persist({ ...state, tripItems: [], tripDate: "" });
  };

  const today = new Date().toISOString().split("T")[0];
  const todayCount = hydrated && state.lookupDate === today ? state.lookupCount : 0;
  const currentTripItems = hydrated && state.tripDate === today ? state.tripItems : [];

  const isBasic = state.tier === "basic" || state.tier === "premium";
  const isPremium = state.tier === "premium";

  return (
    <UserContext.Provider
      value={{
        ...state,
        setTier,
        incrementLookup,
        saveLookup,
        setHomeCountry,
        addToTrip,
        clearTrip,
        isBasic,
        isPremium,
        todayCount,
        currentTripItems,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
