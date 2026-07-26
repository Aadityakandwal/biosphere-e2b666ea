import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/Shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBookings, useOrders } from "@/lib/stores";
import { useHydrated } from "@/lib/motion";
import { BookingsSkeleton, OrdersSkeleton } from "@/components/Skeletons";
import { services } from "@/lib/data";
import {
  ArrowLeft, Download, Truck, PackageCheck, Package, MapPin, Repeat2, Star,
  ChevronRight, CalendarDays, Clock, User2, CalendarCheck,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/profile/activity")({
  head: () => ({
    meta: [
      { title: "My Bookings & Orders — Biosphere" },
      { name: "description", content: "All your Biosphere service bookings and product orders in one place — track deliveries, rebook services and download invoices." },
      { property: "og:title", content: "My Bookings & Orders — Biosphere" },
      { property: "og:description", content: "Track bookings and deliveries, rebook services and download invoices." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ActivityPage,
});

const STEPS = ["Ordered", "Packed", "Shipped", "Out for delivery", "Delivered"];

function ActivityPage() {
  const bookings = useBookings((s) => s.bookings);
  const orders = useOrders((s) => s.orders);
  const [tab, setTab] = useState<"bookings" | "orders">("bookings");
  const hydrated = useHydrated();

  return (
    <Shell>
      <Link to="/profile" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <h1 className="font-display text-2xl font-semibold tracking-tight">My Bookings &amp; Orders</h1>
      <p className="mt-1 text-sm text-muted-foreground">Services you've booked and products on their way.</p>

      {/* Primary segmented control */}
      <div className="mt-4 flex gap-1.5 rounded-full bg-muted/70 p-1.5">
        {([
          { id: "bookings", label: "Bookings", count: bookings.length },
          { id: "orders", label: "Orders", count: orders.length },
        ] as const).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`press flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
              tab === t.id ? "bg-card text-foreground shadow-soft" : "text-muted-foreground"
            }`}
          >
            {t.label}
            <span className={`ml-1.5 text-xs ${tab === t.id ? "text-primary" : "opacity-70"}`}>{t.count}</span>
          </button>
        ))}
      </div>

      {!hydrated ? (
        tab === "bookings" ? <BookingsSkeleton /> : <OrdersSkeleton />
      ) : tab === "bookings" ? (
        <BookingsPanel />
      ) : (
        <OrdersPanel />
      )}

    </Shell>
  );
}

function SubTabs<T extends string>({ value, onChange, tabs }: { value: T; onChange: (v: T) => void; tabs: { id: T; label: string }[] }) {
  return (
    <div className="mt-4 flex gap-2">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`press rounded-full border px-4 py-1.5 text-xs font-semibold transition-all duration-300 ${
            value === t.id
              ? "border-primary bg-primary/10 text-primary"
              : "border-border/60 text-muted-foreground hover:border-border"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <Card className="rounded-3xl border-border/50 p-10 text-center text-sm text-muted-foreground">{children}</Card>;
}

function BookingsPanel() {
  const bookings = useBookings((s) => s.bookings);
  const [sub, setSub] = useState<"upcoming" | "past">("upcoming");
  const upcoming = bookings.filter((b) => b.status === "upcoming");
  const past = bookings.filter((b) => b.status !== "upcoming");
  const list = sub === "upcoming" ? upcoming : past;

  return (
    <>
      <SubTabs
        value={sub}
        onChange={setSub}
        tabs={[
          { id: "upcoming", label: `Upcoming (${upcoming.length})` },
          { id: "past", label: `Completed (${past.length})` },
        ]}
      />

      <div className="mt-4 space-y-4 pb-8">
        {list.length === 0 && <Empty>{sub === "upcoming" ? "No upcoming visits scheduled." : "No completed services yet."}</Empty>}

        {list.map((b) => {
          const s = services.find((x) => x.slug === b.serviceSlug);
          const upcomingCard = b.status === "upcoming";
          return (
            <Card key={b.id} className="overflow-hidden rounded-3xl border-border/50 p-0 shadow-soft transition-shadow hover:shadow-elevated">
              <div className="flex items-center justify-between gap-2 border-b border-border/50 bg-muted/40 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-display text-base font-semibold leading-tight">{s?.name ?? "Service"}</p>
                  <p className="text-[11px] text-muted-foreground">#{b.id.toUpperCase()}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold ${
                    upcomingCard ? "bg-primary text-primary-foreground" : "bg-leaf/15 text-primary"
                  }`}
                >
                  {upcomingCard ? "Confirmed" : "Completed"}
                </span>
              </div>

              <div className="flex gap-3 px-4 py-4">
                {s?.image && (
                  <img src={s.image} alt="" loading="lazy" className="h-16 w-16 shrink-0 rounded-2xl bg-muted object-cover" />
                )}
                <div className="min-w-0 flex-1 space-y-1.5 text-xs text-muted-foreground">
                  <p className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 shrink-0 text-primary" /> {b.date}</p>
                  <p className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 shrink-0 text-primary" /> {b.time}</p>
                  <p className="flex items-center gap-1.5"><User2 className="h-3.5 w-3.5 shrink-0 text-primary" /> {b.gardener}</p>
                  <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 shrink-0 text-primary" /> <span className="truncate">{b.address}</span></p>
                </div>
                <p className="shrink-0 text-sm font-semibold text-primary">₹{b.price}</p>
              </div>

              <div className="flex items-center gap-2 border-t border-border/50 px-4 py-3">
                <Button size="sm" variant="outline" className="press flex-1 rounded-full" asChild>
                  <Link to="/bookings/$id" params={{ id: b.id }}>Details</Link>
                </Button>
                <Button size="sm" className="press flex-1 rounded-full" asChild>
                  <Link to="/services/$slug" params={{ slug: b.serviceSlug }}>
                    {upcomingCard ? "Manage" : "Rebook"}
                  </Link>
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}

function OrdersPanel() {
  const orders = useOrders((s) => s.orders);
  const [sub, setSub] = useState<"incoming" | "completed">("incoming");

  const isDelivered = (status: string) => status.toLowerCase() === "delivered";
  const incoming = orders.filter((o) => !isDelivered(o.status));
  const completed = orders.filter((o) => isDelivered(o.status));
  const list = sub === "incoming" ? incoming : completed;

  return (
    <>
      <SubTabs
        value={sub}
        onChange={setSub}
        tabs={[
          { id: "incoming", label: `On the way (${incoming.length})` },
          { id: "completed", label: `Delivered (${completed.length})` },
        ]}
      />

      <div className="mt-4 space-y-4 pb-8">
        {list.length === 0 && <Empty>{sub === "incoming" ? "Nothing on the way right now." : "No completed orders yet."}</Empty>}

        {list.map((o) => {
          const stage = o.stage ?? (isDelivered(o.status) ? 4 : 1);
          const delivered = isDelivered(o.status);
          return (
            <Card key={o.id} className="overflow-hidden rounded-3xl border-border/50 p-0 shadow-soft transition-shadow hover:shadow-elevated">
              <div className="flex items-center justify-between gap-2 border-b border-border/50 bg-muted/40 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold tracking-wide text-muted-foreground">#{o.id.toUpperCase()}</p>
                  <p className="text-[11px] text-muted-foreground">Placed on {o.date}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold ${
                    delivered ? "bg-leaf/15 text-primary" : "bg-primary text-primary-foreground"
                  }`}
                >
                  {o.status}
                </span>
              </div>

              <div className="flex gap-3 px-4 py-4">
                <div className="flex shrink-0 -space-x-3">
                  {(o.images ?? []).slice(0, 2).map((src, i) => (
                    <img key={i} src={src} alt="" loading="lazy" className="h-16 w-16 rounded-2xl border-2 border-card bg-muted object-cover" />
                  ))}
                  {!o.images?.length && (
                    <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                      <Package className="h-6 w-6" />
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-medium leading-snug">{o.items.join(", ")}</p>
                  <p className="mt-1 text-sm font-semibold text-primary">₹{o.total}</p>
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{o.address ?? "Saved address"}</span>
                  </p>
                </div>
              </div>

              {delivered ? (
                <>
                  <div className="flex items-center gap-2 border-t border-border/50 px-4 py-3 text-sm">
                    <PackageCheck className="h-4 w-4 shrink-0 text-primary" />
                    <span className="text-muted-foreground">{o.deliveredOn ?? "Delivered"}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 border-t border-border/50 px-4 py-3">
                    <Button size="sm" variant="outline" className="press rounded-full" onClick={() => toast.success(`Invoice for ${o.id} downloaded`)}>
                      <Download className="mr-1.5 h-3.5 w-3.5" /> Invoice
                    </Button>
                    <Button size="sm" variant="outline" className="press rounded-full" asChild>
                      <Link to="/shop"><Repeat2 className="mr-1.5 h-3.5 w-3.5" /> Buy again</Link>
                    </Button>
                    <Button size="sm" variant="ghost" className="press ml-auto rounded-full text-muted-foreground" onClick={() => toast.success("Thanks for rating this order")}>
                      <Star className="mr-1.5 h-3.5 w-3.5" /> Rate
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="border-t border-border/50 px-4 pb-4 pt-4">
                    <div className="flex items-center">
                      {STEPS.map((s, i) => {
                        const done = i <= stage;
                        return (
                          <div key={s} className="flex flex-1 items-center last:flex-none">
                            <span className={`h-2.5 w-2.5 shrink-0 rounded-full transition-colors ${done ? "bg-primary" : "bg-border"} ${i === stage ? "ring-4 ring-primary/20" : ""}`} />
                            {i < STEPS.length - 1 && <span className={`h-0.5 flex-1 ${i < stage ? "bg-primary" : "bg-border"}`} />}
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-2 flex justify-between text-[10px] font-medium text-muted-foreground">
                      <span>Ordered</span>
                      <span>Shipped</span>
                      <span>Delivered</span>
                    </div>
                    <p className="mt-3 flex items-center gap-2 text-sm font-medium text-primary">
                      <Truck className="h-4 w-4" /> {o.eta ?? STEPS[stage]}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 border-t border-border/50 px-4 py-3">
                    <Button size="sm" className="press rounded-full" onClick={() => toast.info(`${o.status} · ${o.eta ?? "Updates on the way"}`)}>
                      Track order <ChevronRight className="ml-1 h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" className="press rounded-full text-muted-foreground" onClick={() => toast.success("Our team will call you shortly")}>
                      Need help?
                    </Button>
                  </div>
                </>
              )}
            </Card>
          );
        })}
      </div>
    </>
  );
}
