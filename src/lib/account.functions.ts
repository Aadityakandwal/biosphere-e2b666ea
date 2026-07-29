import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const payment = z.object({
  kind: z.enum(["shop", "service", "membership"]),
  label: z.string().min(1).max(160),
  amount: z.number().nonnegative(),
  razorpay_order_id: z.string().max(80).optional(),
  razorpay_payment_id: z.string().max(80).optional(),
  receipt: z.string().max(60).optional(),
});

/** Stores a completed Razorpay payment against the signed-in user. */
export const recordPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => payment.parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("payments")
      .insert({ ...data, user_id: context.userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id as string };
  });

/** Saves a shop order (and optionally the payment that paid for it). */
export const saveOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        ref: z.string().min(1).max(60),
        total: z.number().nonnegative(),
        items: z.array(z.string().max(200)).max(100),
        images: z.array(z.string().max(500)).max(100).default([]),
        status: z.string().max(40).default("Placed"),
        address: z.string().max(300).optional(),
        payment_id: z.string().uuid().optional(),
        razorpay_payment_id: z.string().max(80).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("orders")
      .upsert({ ...data, user_id: context.userId }, { onConflict: "user_id,ref" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Saves a service booking. */
export const saveBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        ref: z.string().min(1).max(60),
        service_slug: z.string().min(1).max(80),
        scheduled_date: z.string().max(20).nullable().optional(),
        slot: z.string().max(40).optional(),
        gardener: z.string().max(80).optional(),
        address: z.string().max(300).optional(),
        price: z.number().nonnegative().default(0),
        status: z.string().max(20).default("upcoming"),
        note: z.string().max(2000).optional(),
        payment_id: z.string().uuid().optional(),
        razorpay_payment_id: z.string().max(80).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const payload = {
      ...data,
      scheduled_date: data.scheduled_date || null,
      user_id: context.userId,
    };
    const { error } = await context.supabase
      .from("bookings")
      .upsert(payload, { onConflict: "user_id,ref" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Persists plan / green points changes onto the user's profile row. */
export const saveProfileState = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        plan: z.enum(["free", "basic", "pro", "elite"]).optional(),
        green_points: z.number().int().min(0).max(1_000_000).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    if (Object.keys(data).length === 0) return { ok: true };
    const { error } = await context.supabase
      .from("profiles")
      .update(data)
      .eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Reads the signed-in user's saved orders and bookings. */
export const listActivity = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [orders, bookings] = await Promise.all([
      context.supabase.from("orders").select("*").order("created_at", { ascending: false }),
      context.supabase.from("bookings").select("*").order("created_at", { ascending: false }),
    ]);
    return { orders: orders.data ?? [], bookings: bookings.data ?? [] };
  });
