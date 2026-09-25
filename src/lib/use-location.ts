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

import { getDeviceLocation } from "@/lib/location-bridge";

/** Requests device geolocation and stores a readable label. */
export async function requestLocation() {
  const s = useLocationStore.getState();
  s.set({ status: "asking", askedAt: Date.now() });

  const result = await getDeviceLocation();

  if (result.status === "granted" && result.coords) {
    const label = await reverseGeocode(result.coords.lat, result.coords.lon);
    useLocationStore.getState().set({
      status: "granted",
      label: label ?? "Current location",
    });
  } else if (result.status === "denied") {
    useLocationStore.getState().set({ status: "denied" });
  } else {
    useLocationStore.getState().set({ status: "unavailable" });
  }
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
