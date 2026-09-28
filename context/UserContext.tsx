"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Tier, SavedLookup, TripItem, ScoutItem } from "@/lib/types";
import {
  saveScoutItem,
  getScoutItems,
  updateScoutItem as utilUpdateScoutItem,
  deleteScoutItem,
} from "@/lib/scout";

interface UserState {
  tier: Tier;
  email: string | null;
  lookupCount: number;
  lookupDate: string;
  savedLookups: SavedLookup[];
  homeCountry: string;
  tripItems: TripItem[];
  tripDate: string;
  scoutItems: ScoutItem[];
}

interface UserContextValue extends UserState {
  setTier: (tier: Tier, email?: string) => void;
  incrementLookup: () => void;
  saveLookup: (lookup: SavedLookup) => void;
  setHomeCountry: (country: string) => void;
  addToTrip: (item: TripItem) => void;
  clearTrip: () => void;
  addScoutItem: (item: ScoutItem) => void;
  updateScoutItem: (id: string, patch: Partial<ScoutItem>) => void;
  removeScoutItem: (id: string) => void;
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
  scoutItems: [],
};

const UserContext = createContext<UserContextValue | null>(null);

// Local calendar date (not UTC) so the daily reset happens at the user's midnight — in Japan, UTC rolls over at 9am.
function localDate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

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

  useEffect(() => {
    if (hydrated) localStorage.setItem("japanflip_user", JSON.stringify(state));
  }, [state, hydrated]);

  const setTier = useCallback((tier: Tier, email?: string) => {
    setState((s) => ({ ...s, tier, email: email ?? s.email }));
  }, []);

  const incrementLookup = useCallback(() => {
    const today = localDate();
    setState((s) => ({
      ...s,
      lookupCount: s.lookupDate === today ? s.lookupCount + 1 : 1,
      lookupDate: today,
    }));
  }, []);

  const saveLookup = useCallback((lookup: SavedLookup) => {
    setState((s) => ({
      ...s,
      savedLookups: [lookup, ...s.savedLookups].slice(0, s.tier === "premium" ? 50 : 20),
    }));
  }, []);

  const setHomeCountry = useCallback((country: string) => {
    setState((s) => ({ ...s, homeCountry: country }));
  }, []);

  const addToTrip = useCallback((item: TripItem) => {
    const today = localDate();
    setState((s) => ({
      ...s,
      tripItems: [...(s.tripDate === today ? s.tripItems : []), item],
      tripDate: today,
    }));
  }, []);

  const clearTrip = useCallback(() => {
    setState((s) => ({ ...s, tripItems: [], tripDate: "" }));
  }, []);

  const addScoutItem = useCallback((item: ScoutItem) => {
    saveScoutItem(item);
    setState((s) => ({ ...s, scoutItems: getScoutItems() }));
  }, []);

  const updateScoutItem = useCallback((id: string, patch: Partial<ScoutItem>) => {
    utilUpdateScoutItem(id, patch);
    setState((s) => ({ ...s, scoutItems: getScoutItems() }));
  }, []);

  const removeScoutItem = useCallback((id: string) => {
    deleteScoutItem(id);
    setState((s) => ({ ...s, scoutItems: getScoutItems() }));
  }, []);

  const today = localDate();
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
        addScoutItem,
        updateScoutItem,
        removeScoutItem,
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
