import { create } from "zustand";
import { persist } from "zustand/middleware";


export type CartItem = { id: string; name: string; price: number; qty: number; image?: string };

type CartState = {
  items: CartItem[];
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (item, qty = 1) =>
        set((s) => {
          const existing = s.items.find((i) => i.id === item.id);
          if (existing) return { items: s.items.map((i) => (i.id === item.id ? { ...i, qty: i.qty + qty } : i)) };
          return { items: [...s.items, { ...item, qty }] };
        }),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      setQty: (id, qty) => set((s) => ({ items: s.items.map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i)) })),
      clear: () => set({ items: [] }),
    }),
    { name: "bio-cart" }
  )
);

export type Booking = {
  id: string; serviceSlug: string; date: string; time: string; gardener: string; address: string;
  status: "upcoming" | "past"; price: number; photos?: string[]; rating?: number; note?: string; paymentId?: string;
};

type BookingState = {
  bookings: Booking[];
  add: (b: Booking) => void;
  reschedule: (id: string, date: string, time: string) => void;
  rate: (id: string, r: number) => void;
  clear: () => void;
};

export const useBookings = create<BookingState>()(
  persist(
    (set) => ({
      bookings: [],
      add: (b) => set((s) => ({ bookings: [b, ...s.bookings] })),
      reschedule: (id, date, time) => set((s) => ({ bookings: s.bookings.map((b) => (b.id === id ? { ...b, date, time } : b)) })),
      rate: (id, r) => set((s) => ({ bookings: s.bookings.map((b) => (b.id === id ? { ...b, rating: r } : b)) })),
      clear: () => set({ bookings: [] }),
    }),
    { name: "bio-bookings-v2" }
  )
);

type Order = {
  id: string;
  date: string;
  total: number;
  items: string[];
  status: string;
  eta?: string;
  deliveredOn?: string;
  stage?: number;
  address?: string;
  images?: string[];
  paymentId?: string;
};
type OrderState = {
  orders: Order[];
  add: (o: Order) => void;
  setStatus: (id: string, status: string, paymentId?: string) => void;
};

export const useOrders = create<OrderState>()(
  persist(
    (set) => ({
      orders: [],
      add: (o) => set((s) => ({ orders: [o, ...s.orders] })),
      setStatus: (id, status, paymentId) =>
        set((s) => ({
          orders: s.orders.map((o) => (o.id === id ? { ...o, status, ...(paymentId ? { paymentId } : {}) } : o)),
        })),
    }),
    { name: "bio-orders-v2" }
  )
);


export type PlanId = "free" | "basic" | "pro" | "elite";

/** Daily AI Plant Doctor scan allowance per plan. null = unlimited. */
export const SCAN_LIMITS: Record<PlanId, number | null> = {
  free: 2,
  basic: 6,
  pro: 15,
  elite: null,
};

export const PLAN_LABELS: Record<PlanId, string> = {
  free: "Free",
  basic: "Basic",
  pro: "Pro",
  elite: "Elite",
};

const today = () => new Date().toISOString().slice(0, 10);

type ProfileState = {
  name: string; email: string; phone: string; address: string; greenPoints: number;
  avatar: string;
  plan: PlanId;
  scanDate: string;
  scanCount: number;
  update: (p: Partial<Pick<ProfileState, "name" | "email" | "phone" | "address" | "avatar" | "greenPoints">>) => void;
  addPoints: (n: number) => void;
  setPoints: (n: number) => void;
  setPlan: (p: PlanId) => void;
  /** Wipes local profile data back to a blank new-user state. */
  reset: () => void;
  /** Scans left today (Infinity when unlimited). */
  scansLeft: () => number;
  /** Consumes one scan; returns false when the daily limit is reached. */
  useScan: () => boolean;
};

const BLANK_PROFILE = {
  name: "",
  email: "",
  phone: "",
  address: "",
  greenPoints: 0,
  avatar: "",
  plan: "free" as PlanId,
  scanDate: today(),
  scanCount: 0,
};

export const useProfile = create<ProfileState>()(
  persist(
    (set, get) => ({
      ...BLANK_PROFILE,
      update: (p) => set(p),
      addPoints: (n) => set((s) => ({ greenPoints: s.greenPoints + n })),
      setPoints: (n) => set({ greenPoints: n }),
      setPlan: (plan) => set({ plan }),
      reset: () => set({ ...BLANK_PROFILE, scanDate: today() }),
      scansLeft: () => {
        const s = get();
        const limit = SCAN_LIMITS[s.plan];
        if (limit === null) return Infinity;
        const used = s.scanDate === today() ? s.scanCount : 0;
        return Math.max(0, limit - used);
      },
      useScan: () => {
        const s = get();
        const limit = SCAN_LIMITS[s.plan];
        const used = s.scanDate === today() ? s.scanCount : 0;
        if (limit !== null && used >= limit) return false;
        set({ scanDate: today(), scanCount: used + 1 });
        return true;
      },
    }),
    { name: "bio-profile" }
  )
);


type AddrState = {
  addresses: { id: string; label: string; line: string }[];
  add: (a: { id: string; label: string; line: string }) => void;
};

export const useAddresses = create<AddrState>()(
  persist(
    (set) => ({
      addresses: [
        { id: "a1", label: "Home", line: "Flat 402, Green Meadows, Bengaluru" },
        { id: "a2", label: "Office", line: "8th floor, Prestige Tower, MG Road" },
      ],
      add: (a) => set((s) => ({ addresses: [...s.addresses, a] })),
    }),
    { name: "bio-addresses" }
  )
);

/* ---------- UI preferences (reduced motion) ---------- */
type PrefsState = {
  /** "system" follows prefers-reduced-motion; "on"/"off" override it. */
  reducedMotion: "system" | "on" | "off";
  setReducedMotion: (v: "system" | "on" | "off") => void;
};

export const usePrefs = create<PrefsState>()(
  persist(
    (set) => ({
      reducedMotion: "system",
      setReducedMotion: (v) => set({ reducedMotion: v }),
    }),
    { name: "bio-prefs" }
  )
);
