import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/Shell";
import { useHydrated } from "@/lib/motion";
import { BookingsSkeleton } from "@/components/Skeletons";
import { services, categories } from "@/lib/data";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Booking } from "@/lib/stores";
import { CalendarDays, Clock, Star, CheckCircle2, RotateCw, Plus, Leaf } from "lucide-react";

export const Route = createFileRoute("/bookings/")({
  head: () => ({
    meta: [
      { title: "My Bookings — Biosphere" },
      { name: "description", content: "Track upcoming and past gardening bookings." },
      { property: "og:title", content: "My Bookings — Biosphere" },
      { property: "og:description", content: "Track upcoming and past gardening bookings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BookingsPage,
});
function BookingsPage() {
  console.log("BOOKINGS PAGE COMPONENT");
  alert("BOOKINGS PAGE LOADED");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const upcoming = bookings.filter((b) => b.status === "upcoming");
  const past = bookings.filter((b) => b.status === "past");
  const hydrated = useHydrated();
 useEffect(() => {
  console.log("BOOKINGS PAGE MOUNTED");

  async function loadBookings() {
    console.log("LOAD BOOKINGS STARTED");

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    console.log("AUTH ERROR:", authError);
    console.log("AUTH USER:", user);

    if (!user) return;

    const result = await supabase
      .from("bookings")
      .select("*")
      .eq("user_id", user.id);

    console.log("SUPABASE RESULT:", result);

    if (result.error) {
      console.error(result.error);
      return;
    }

    setBookings(
      (result.data ?? []).map((b: any) => ({
        id: b.id,
        serviceSlug: b.service_slug,
        date: b.booking_date,
        time: b.booking_time,
        gardener: b.gardener,
        address: b.address,
        status: b.status,
        price: b.price,
        note: b.note,
        paymentId: b.payment_id,
      }))
    );
  }

  loadBookings();
}, []);
  if (!hydrated) {
    return (
      <Shell>
        <BookingsSkeleton />
      </Shell>
    );
  }

  return (
    <Shell>
      <h1 className="sr-only">My gardening bookings</h1>
      {/* Segmented tabs */}
      <div className="mt-3 grid grid-cols-2 gap-1 rounded-full bg-muted/70 p-1">
        {(["upcoming", "past"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`press rounded-full py-3 text-sm font-semibold capitalize transition-all ${
              tab === t ? "bg-primary text-primary-foreground shadow-glow" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "upcoming" ? (
        <section className="pb-6">
          <h2 className="mt-6 font-display text-2xl font-semibold tracking-tight">Active Appointments</h2>

          {upcoming.length === 0 && (
            <p className="surface mt-4 rounded-3xl p-8 text-center text-sm text-muted-foreground">No upcoming bookings</p>
          )}

          <div className="mt-4 space-y-4">
            {upcoming.map((b) => {
              const s = services.find((x) => x.slug === b.serviceSlug);
              const cat = categories.find((c) => c.id === s?.category);
              return (
                <div key={b.id} className="overflow-hidden rounded-3xl bg-card shadow-elevated">
                  <div className="relative">
                    <img src={s?.image} alt={s?.name ?? "Booking"} className="h-48 w-full object-cover" />
                    <span className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-soft">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground/80" /> Confirmed
                    </span>
                  </div>
                  <div className="p-5">
                    <p className="text-[11px] font-bold tracking-widest text-primary">{cat?.name.toUpperCase()}</p>
                    <h3 className="mt-1 font-display text-2xl font-semibold leading-tight">{s?.name}</h3>

                    <div className="mt-4 space-y-3">
                      <Row icon={CalendarDays} label="Date" value={b.date} />
                      <Row icon={Clock} label="Time" value={`${b.time} · ${s?.duration ?? ""}`} />
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <Link
                        to="/bookings/$id"
                        params={{ id: b.id }}
                        className="press rounded-full bg-primary py-3 text-center text-sm font-semibold text-primary-foreground shadow-soft hover:shadow-glow"
                      >
                        Manage Details
                      </Link>
                      <Link
                        to="/bookings/$id"
                        params={{ id: b.id }}
                        search={{ reschedule: 1 }}
                        className="press rounded-full border border-border bg-card py-3 text-center text-sm font-semibold hover:border-primary/40"
                      >
                        Reschedule
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Upsell */}
          <div className="mt-5 flex items-center gap-4 rounded-3xl bg-secondary/70 p-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/15">
              <Leaf className="h-5 w-5 text-primary" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-primary">Add Soil Nutrient Boost?</p>
              <p className="text-xs text-muted-foreground">Only ₹149 when added to your next visit.</p>
            </div>
            <Link to="/shop/$productId" params={{ productId: "neerva" }} className="shrink-0 text-sm font-semibold text-primary underline underline-offset-4">
              Add
            </Link>
          </div>

          <Link
            to="/services"
            className="press fixed bottom-20 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow"
            aria-label="Book new service"
          >
            <Plus className="h-5 w-5" />
          </Link>
        </section>
      ) : (
        <section className="pb-6">
          {past.length === 0 && (
            <p className="surface mt-6 rounded-3xl p-8 text-center text-sm text-muted-foreground">No past bookings</p>
          )}

          <div className="mt-6 space-y-4">
            {past.map((b) => {
              const s = services.find((x) => x.slug === b.serviceSlug);
              return (
                <div key={b.id} className="surface rounded-3xl p-4">
                  <div className="flex items-start gap-3">
                    <img src={s?.image} alt={s?.name ?? "Booking"} className="h-16 w-16 shrink-0 rounded-2xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold leading-snug">{s?.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{b.date} · {b.time}</p>
                      {b.rating ? (
                        <div className="mt-1 flex items-center gap-0.5 text-yellow-500">
                          {Array.from({ length: b.rating }).map((_, i) => (
                            <Star key={i} className="h-3.5 w-3.5 fill-current" />
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-primary">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Completed
                      </span>
                      <p className="mt-2 font-display text-xl font-bold">₹{b.price}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <Link
                      to="/services/$slug"
                      params={{ slug: b.serviceSlug }}
                      className="press flex items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:shadow-glow"
                    >
                      <RotateCw className="h-4 w-4" /> Rebook
                    </Link>
                    <Link
                      to="/bookings/$id"
                      params={{ id: b.id }}
                      className="press rounded-full border border-border bg-card py-3 text-center text-sm font-semibold hover:border-primary/40"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 rounded-3xl bg-secondary/70 p-6">
            <h3 className="font-display text-2xl font-semibold tracking-tight text-primary">How's your garden?</h3>
            <p className="mt-2 text-sm leading-relaxed text-foreground/70">
              Your feedback helps our botanists maintain the highest standards of floral excellence.
            </p>
            <Link
              to="/bookings/review"

              className="press mt-5 block rounded-full bg-primary py-3.5 text-center text-sm font-semibold text-primary-foreground shadow-soft hover:shadow-glow"
            >
              Share Review
            </Link>
          </div>
        </section>
      )}
    </Shell>
  );
}

function Row({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
        <Icon className="h-4 w-4 text-foreground/70" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
