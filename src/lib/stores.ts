import { create } from "zustand";
import { persist } from "zustand/middleware";
import { initialBookings, initialOrders } from "./data";

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
  status: "upcoming" | "past"; price: number; photos?: string[]; rating?: number; note?: string;
};

type BookingState = {
  bookings: Booking[];
  add: (b: Booking) => void;
  reschedule: (id: string, date: string, time: string) => void;
  rate: (id: string, r: number) => void;
};

export const useBookings = create<BookingState>()(
  persist(
    (set) => ({
      bookings: initialBookings,
      add: (b) => set((s) => ({ bookings: [b, ...s.bookings] })),
      reschedule: (id, date, time) => set((s) => ({ bookings: s.bookings.map((b) => (b.id === id ? { ...b, date, time } : b)) })),
      rate: (id, r) => set((s) => ({ bookings: s.bookings.map((b) => (b.id === id ? { ...b, rating: r } : b)) })),
    }),
    { name: "bio-bookings" }
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
};
type OrderState = { orders: Order[]; add: (o: Order) => void };

export const useOrders = create<OrderState>()(
  persist(
    (set) => ({
      orders: initialOrders,
      add: (o) => set((s) => ({ orders: [o, ...s.orders] })),
    }),
    { name: "bio-orders-v2" }
  )
);

type ProfileState = {
  name: string; email: string; phone: string; address: string; greenPoints: number;
  update: (p: Partial<Omit<ProfileState, "update" | "addPoints">>) => void;
  addPoints: (n: number) => void;
};

export const useProfile = create<ProfileState>()(
  persist(
    (set) => ({
      name: "Arjun Kapoor",
      email: "arjun@biosphere.app",
      phone: "+91 98765 43210",
      address: "Flat 402, Green Meadows, Bengaluru",
      greenPoints: 1240,
      update: (p) => set(p),
      addPoints: (n) => set((s) => ({ greenPoints: s.greenPoints + n })),
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
