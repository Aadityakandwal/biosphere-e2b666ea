import { useEffect } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type LocationState = {
  /** Human readable place, e.g. "Indiranagar, Bengaluru". */
  label: string | null;
  status: "idle" | "asking" | "granted" | "denied" | "unavailable";
  askedAt: number | null;
  set: (p: Partial<Pick<LocationState, "label" | "status" | "askedAt">>) => void;
};

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      label: null,
      status: "idle",
      askedAt: null,
      set: (p) => set(p),
    }),
    { name: "bio-location" }
  )
);

async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
    );
    if (!res.ok) return null;
    const d = (await res.json()) as {
      locality?: string;
      city?: string;
      principalSubdivision?: string;
      countryName?: string;
    };
    const parts = [d.locality || d.city, d.principalSubdivision || d.countryName].filter(
      (p, i, a) => p && a.indexOf(p) === i
    );
    return parts.length ? parts.join(", ") : null;
  } catch {
    return null;
  }
}

/** Requests browser geolocation and stores a readable label. */
export async function requestLocation() {
  const s = useLocationStore.getState();
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    s.set({ status: "unavailable" });
    return;
  }
  s.set({ status: "asking", askedAt: Date.now() });
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const label = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
      useLocationStore.getState().set({
        status: "granted",
        label: label ?? "Current location",
      });
    },
    () => useLocationStore.getState().set({ status: "denied" }),
    { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 }
  );
}

/** Asks for location once per session on first app use. */
export function useLocationPrompt() {
  const status = useLocationStore((s) => s.status);
  const label = useLocationStore((s) => s.label);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (status === "idle" || (status === "granted" && !label)) {
      const t = setTimeout(() => void requestLocation(), 600);
      return () => clearTimeout(t);
    }
  }, [status, label]);

  return { label, status };
}
