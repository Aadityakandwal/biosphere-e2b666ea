import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useProfile, useOrders, useBookings, resetUserData, type PlanId } from "@/lib/stores";

const LAST_USER_KEY = "bio-last-user";

/**
 * Keeps the local profile store in sync with the signed-in user's row
 * in the database. Mounted once from the root route.
 */
export function AuthSync() {
  useEffect(() => {
    let cancelled = false;

    const load = async (userId: string, fallbackEmail?: string | null) => {
      // A different user (or a first-ever sign-in) starts from a blank slate.
      const last = localStorage.getItem(LAST_USER_KEY);
      if (last !== userId) {
        resetUserData();
        localStorage.setItem(LAST_USER_KEY, userId);
      }

      const { data } = await supabase
        .from("profiles")
        .select("full_name, email, phone, address, avatar_url, plan, green_points")
        .eq("id", userId)
        .maybeSingle();
      if (cancelled) return;
      if (data) {
        const s = useProfile.getState();
        s.update({
          name: data.full_name || s.name,
          email: data.email || fallbackEmail || s.email,
          phone: data.phone || s.phone,
          address: data.address || s.address,
          avatar: data.avatar_url || s.avatar,
        });
        s.setPoints(data.green_points ?? 0);
        if (data.plan) s.setPlan(data.plan as PlanId);
      }

      // Restore saved orders and bookings from the account.
      const [orders, bookings] = await Promise.all([
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase.from("bookings").select("*").order("created_at", { ascending: false }),
      ]);
      if (cancelled) return;

      if (orders.data?.length) {
        const local = useOrders.getState();
        const seen = new Set(local.orders.map((o) => o.id));
        orders.data
          .filter((o) => !seen.has(o.ref))
          .forEach((o) =>
            local.add({
              id: o.ref,
              date: String(o.created_at).slice(0, 10),
              total: Number(o.total),
              items: (o.items as string[]) ?? [],
              images: (o.images as string[]) ?? [],
              status: o.status,
              address: o.address ?? undefined,
              paymentId: o.razorpay_payment_id ?? undefined,
            }),
          );
      }

      if (bookings.data?.length) {
        const local = useBookings.getState();
        const seen = new Set(local.bookings.map((b) => b.id));
        bookings.data
          .filter((b) => !seen.has(b.ref))
          .forEach((b) =>
            local.add({
              id: b.ref,
              serviceSlug: b.service_slug,
              date: b.scheduled_date ?? "",
              time: b.slot ?? "",
              gardener: b.gardener ?? "Auto-assigned",
              address: b.address ?? "",
              status: b.status === "past" ? "past" : "upcoming",
              price: Number(b.price),
              note: b.note ?? undefined,
              rating: b.rating ?? undefined,
              paymentId: b.razorpay_payment_id ?? undefined,
            }),
          );
      }
    };


    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        // defer: no async work directly inside the callback
        setTimeout(() => void load(session.user.id, session.user.email), 0);
      }
      if (event === "SIGNED_OUT") {
        setTimeout(() => {
          localStorage.removeItem(LAST_USER_KEY);
          resetUserData();
        }, 0);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) void load(data.session.user.id, data.session.user.email);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  return null;
}

