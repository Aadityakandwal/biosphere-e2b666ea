import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Shell } from "@/components/Shell";
import { services, gardenCarePlans } from "@/lib/data";
import { useProfile, useBookings } from "@/lib/stores";
import { supabase } from "@/integrations/supabase/client";
import {
  ShieldCheck,
  Wrench,
  Check,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/services/")({
  validateSearch: (search: Record<string, unknown>): { tab?: string; cat?: string } => ({
    tab: typeof search.tab === "string" ? search.tab : undefined,
    cat: typeof search.cat === "string" ? search.cat : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Garden Care & Services — My Gardener" },
      {
        name: "description",
        content:
          "Garden Care Plans and specialized one-time gardening services by My Gardener professionals.",
      },
      { property: "og:title", content: "Garden Care & Services — My Gardener" },
      {
        property: "og:description",
        content: "Garden Care Plans and specialized one-time gardening services.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: ServicesPage,
});

const serviceCategoryChips = [
  { id: "all", label: "All Services" },
  { id: "setup", label: "Plant Setup" },
  { id: "care", label: "Care & Maintenance" },
  { id: "consult", label: "Consultation" },
];

function ServicesPage() {
  const { tab: tabParam, cat: catParam } = Route.useSearch();
  const navigate = useNavigate();

  const [mainTab, setMainTab] = useState<"plans" | "services">(
    tabParam === "plans" ? "plans" : "services"
  );
  const [selectedCat, setSelectedCat] = useState<string>(catParam ?? "all");

  const plan = useProfile((s) => s.plan);
  const localBookings = useBookings((s) => s.bookings);
  const [dbBookings, setDbBookings] = useState<any[]>([]);

  useEffect(() => {
    async function loadBookings() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", user.id);
      if (data) setDbBookings(data);
    }
    void loadBookings();
  }, []);

  const allBookings = dbBookings.length > 0 ? dbBookings : localBookings;
  const completedVisits = allBookings.filter(
    (b: any) => b.status === "past" || b.status === "completed"
  ).length;

  const currentPlan = gardenCarePlans.find((p) => p.id === plan);
  const hasActivePlan = plan !== "free" && currentPlan;

  const filteredServices = services.filter((s) => {
    if (selectedCat === "all") return true;
    return s.category === selectedCat;
  });

  return (
    <Shell>
      <div className="px-5 sm:px-6 pt-2 pb-10 space-y-6 sm:space-y-8">
        {/* =========================================================================
            1. SERVICES PAGE HERO — EDITORIAL BOTANICAL HEADER
            ========================================================================= */}
        <section className="space-y-1.5">
          <span className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
            BOTANICAL SERVICES
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-normal leading-[1.2] tracking-tight text-foreground">
            Garden Care &amp; Services
          </h1>
          <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
            Choose between ongoing garden stewardship plans or one-time professional visits.
          </p>
        </section>

        {/* =========================================================================
            2. PLAN / SERVICE TOGGLE SWITCHER
            ========================================================================= */}
        <div className="grid grid-cols-2 gap-1 rounded-full border border-border/80 bg-secondary/30 p-1 shadow-2xs">
          <button
            onClick={() => {
              setMainTab("services");
              navigate({ search: { tab: "services", cat: selectedCat }, replace: true });
            }}
            className={`press flex items-center justify-center gap-2 rounded-full py-2.5 text-xs font-semibold transition-all ${
              mainTab === "services"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Wrench className="h-3.5 w-3.5" />
            <span>One-Time Services</span>
          </button>

          <button
            onClick={() => {
              setMainTab("plans");
              navigate({ search: { tab: "plans", cat: undefined }, replace: true });
            }}
            className={`press flex items-center justify-center gap-2 rounded-full py-2.5 text-xs font-semibold transition-all ${
              mainTab === "plans"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Garden Care Plans</span>
          </button>
        </div>

        {/* =========================================================================
            3. SECTION A: GARDEN CARE PLANS
            ========================================================================= */}
        {mainTab === "plans" && (
          <div className="space-y-6">
            {/* Active Plan Card (if subscribed) */}
            {hasActivePlan && (
              <div className="rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/10 via-card to-card p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                      My Active Plan
                    </span>
                    <h3 className="mt-1.5 font-display text-xl font-normal tracking-tight text-foreground">
                      {currentPlan.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">Active Monthly Botanical Stewardship</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-2xl font-normal text-primary">₹{currentPlan.price}</p>
                    <p className="text-[10px] text-muted-foreground">/ month</p>
                  </div>
                </div>

                {/* Usage & Visit Counters */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-2xl border border-border/70 bg-background/80 p-2.5">
                    <p className="font-display text-base font-normal text-foreground">{currentPlan.visits}</p>
                    <p className="text-[10px] text-muted-foreground">Total Visits/mo</p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-background/80 p-2.5">
                    <p className="font-display text-base font-normal text-foreground">{completedVisits}</p>
                    <p className="text-[10px] text-muted-foreground">Completed</p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-background/80 p-2.5">
                    <p className="font-display text-base font-normal text-primary">
                      {Math.max(0, currentPlan.visits - completedVisits)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Remaining</p>
                  </div>
                </div>

                {/* Included Benefits Summary */}
                <div className="space-y-1.5 border-t border-border/50 pt-3 text-xs text-foreground/85">
                  <p className="font-semibold text-foreground">Included in your plan:</p>
                  {currentPlan.perks.map((perk, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-primary" />
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Catalog of Care Plans */}
            <div className="space-y-4">
              <div>
                <h2 className="font-display text-xl font-normal tracking-tight text-foreground">
                  Available Garden Care Plans
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  All plans include dedicated visits by My Gardener professionals
                </p>
              </div>

              <div className="space-y-4">
                {gardenCarePlans.map((p) => {
                  const isCurrent = plan === p.id;
                  return (
                    <div
                      key={p.id}
                      className={`relative rounded-3xl border p-5 sm:p-6 transition hover:border-primary/40 hover:shadow-soft ${
                        isCurrent
                          ? "border-primary bg-primary/[0.04] ring-1 ring-primary/20"
                          : p.popular
                          ? "border-primary/40 bg-card shadow-soft"
                          : "border-border/70 bg-card"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          {p.badge && (
                            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                              {p.badge}
                            </span>
                          )}
                          <h3 className="mt-1 font-display text-xl font-normal tracking-tight text-foreground">
                            {p.name}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {p.visits} on-site professional visit{p.visits > 1 ? "s" : ""} / month
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-display text-2xl font-normal text-foreground">₹{p.price}</p>
                          <p className="text-[10px] text-muted-foreground">/ month</p>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2 border-t border-border/50 pt-3.5">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                          Included Care:
                        </p>
                        <ul className="space-y-1.5 text-xs text-foreground/80">
                          {p.includedServices.map((inc, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <Check className="mt-0.5 h-3.5 w-3.5 flex-none text-primary" />
                              <span>{inc}</span>
                            </li>
                          ))}
                        </ul>

                        <p className="pt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                          Plan Benefits:
                        </p>
                        <ul className="space-y-1.5 text-xs text-foreground/80">
                          {p.perks.map((perk, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <Sparkles className="mt-0.5 h-3.5 w-3.5 flex-none text-primary" />
                              <span>{perk}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-5 border-t border-border/50 pt-4">
                        {isCurrent ? (
                          <div className="flex items-center justify-center rounded-full bg-secondary py-2.5 text-xs font-semibold text-muted-foreground">
                            <Check className="mr-1.5 h-4 w-4 text-primary" /> Current Active Plan
                          </div>
                        ) : (
                          <Link
                            to="/profile/membership"
                            className="press flex w-full items-center justify-center rounded-full bg-primary py-3 text-xs font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
                          >
                            <span>Subscribe to {p.name} · ₹{p.price}/mo</span>
                            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            4. SECTION B: ONE-TIME SERVICES
            ========================================================================= */}
        {mainTab === "services" && (
          <div className="space-y-4">
            {/* Category Chips */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {serviceCategoryChips.map((chip) => (
                <button
                  key={chip.id}
                  onClick={() => {
                    setSelectedCat(chip.id);
                    navigate({ search: { tab: "services", cat: chip.id }, replace: true });
                  }}
                  className={`press shrink-0 rounded-full px-4 py-1.5 text-xs transition-all ${
                    selectedCat === chip.id
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "border border-border/70 bg-card text-foreground/80 font-medium hover:border-primary/40"
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Services Roster */}
            <div className="space-y-3.5">
              {filteredServices.map((service) => (
                <div
                  key={service.slug}
                  className="rounded-2xl border border-border/70 bg-card p-4 sm:p-5 transition hover:border-primary/40 hover:shadow-soft"
                >
                  <div className="flex items-start gap-3.5">
                    <img
                      src={service.image}
                      alt={service.name}
                      className="h-20 w-20 flex-none rounded-xl object-cover object-center bg-secondary"
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-display text-base font-normal tracking-tight text-foreground">
                            {service.name}
                          </h3>
                          <p className="text-[11px] text-muted-foreground">{service.duration}</p>
                        </div>
                        <span className="font-display text-base font-semibold text-primary">
                          {service.price === 0 ? "FREE" : `₹${service.price}`}
                        </span>
                      </div>

                      <p className="line-clamp-2 text-xs leading-relaxed text-foreground/75 font-normal">
                        {service.description}
                      </p>

                      <div className="pt-2.5 flex items-center justify-between gap-2 border-t border-border/40">
                        <Link
                          to="/services/$slug/index"
                          params={{ slug: service.slug }}
                          className="text-xs font-semibold text-primary hover:underline"
                        >
                          View Details
                        </Link>

                        <Link
                          to="/services/$slug/book"
                          params={{ slug: service.slug }}
                          className="press inline-flex items-center gap-1 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-xs transition hover:bg-primary/90"
                        >
                          <span>{service.price === 0 ? "Book Free Check" : "Book Service"}</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}

