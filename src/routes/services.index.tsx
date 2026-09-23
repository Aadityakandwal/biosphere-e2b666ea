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
  ChevronRight,
  Clock,
  CheckCircle2,
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
  const navigate = useNavigate({ from: "/services/" });

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
      <div className="px-5 pt-2 pb-12 space-y-5 sm:space-y-6">
        {/* =========================================================================
            1. SERVICES PAGE HERO — EDITORIAL BOTANICAL HEADER
            ========================================================================= */}
        <section className="space-y-1">
          <span className="inline-block text-[10px] font-bold uppercase tracking-[0.18em] text-[#556B5C]">
            BOTANICAL SERVICES
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#162A1F]">
            Garden Care &amp; Services
          </h1>
          <p className="text-xs text-[#526357] leading-relaxed">
            Choose between ongoing garden stewardship plans or one-time professional visits.
          </p>
        </section>

        {/* =========================================================================
            2. PLAN / SERVICE TOGGLE SWITCHER
            ========================================================================= */}
        <div className="grid grid-cols-2 gap-1 rounded-full bg-[#E8ECE5] p-1 border border-[#DCE3D8] shadow-2xs select-none">
          <button
            onClick={() => {
              setMainTab("services");
              navigate({ search: { tab: "services", cat: selectedCat }, replace: true });
            }}
            className={`press flex items-center justify-center gap-1.5 rounded-full py-2 text-xs font-semibold transition-all duration-200 ${
              mainTab === "services"
                ? "bg-[#18392B] text-white shadow-soft"
                : "text-[#556B5C] hover:text-[#183626]"
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
            className={`press flex items-center justify-center gap-1.5 rounded-full py-2 text-xs font-semibold transition-all duration-200 ${
              mainTab === "plans"
                ? "bg-[#18392B] text-white shadow-soft"
                : "text-[#556B5C] hover:text-[#183626]"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Care Plans</span>
          </button>
        </div>

        {/* =========================================================================
            3. SECTION A: GARDEN CARE PLANS
            ========================================================================= */}
        {mainTab === "plans" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Active Plan Card (if subscribed) */}
            {hasActivePlan && (
              <div className="rounded-[24px] border border-[#CAD8C7] bg-[#EBF0E8] p-5 sm:p-6 shadow-soft space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="rounded-full bg-[#18392B] px-2.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                      Active Plan
                    </span>
                    <h3 className="mt-1.5 font-display text-xl font-bold tracking-tight text-[#183626]">
                      {currentPlan.name}
                    </h3>
                    <p className="text-xs text-[#526357]">Monthly Botanical Stewardship</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-2xl font-bold text-[#18392B]">₹{currentPlan.price}</p>
                    <p className="text-[10px] text-[#65796C]">/ month</p>
                  </div>
                </div>

                {/* Usage & Visit Counters */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-2xl border border-[#D5DFD2] bg-white/70 p-2.5">
                    <p className="font-display text-base font-bold text-[#183626]">{currentPlan.visits}</p>
                    <p className="text-[10px] text-[#65796C]">Total Visits</p>
                  </div>
                  <div className="rounded-2xl border border-[#D5DFD2] bg-white/70 p-2.5">
                    <p className="font-display text-base font-bold text-[#183626]">{completedVisits}</p>
                    <p className="text-[10px] text-[#65796C]">Completed</p>
                  </div>
                  <div className="rounded-2xl border border-[#D5DFD2] bg-white/70 p-2.5">
                    <p className="font-display text-base font-bold text-[#18392B]">
                      {Math.max(0, currentPlan.visits - completedVisits)}
                    </p>
                    <p className="text-[10px] text-[#65796C]">Remaining</p>
                  </div>
                </div>

                {/* Included Benefits Summary */}
                <div className="space-y-1.5 border-t border-[#D5DFD2] pt-3 text-xs text-[#2A4032]">
                  <p className="font-bold text-[#183626]">Included in your plan:</p>
                  {currentPlan.perks.map((perk, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-[#18392B]" />
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Catalog of Care Plans */}
            <div className="space-y-3.5">
              <div>
                <h2 className="font-display text-lg font-bold tracking-tight text-[#183626]">
                  Available Garden Care Plans
                </h2>
                <p className="text-xs text-[#65796C]">
                  All plans include dedicated visits by My Gardener professionals
                </p>
              </div>

              <div className="space-y-3.5">
                {gardenCarePlans.map((p) => {
                  const isCurrent = plan === p.id;
                  return (
                    <div
                      key={p.id}
                      className={`relative rounded-[24px] border p-5 sm:p-6 transition-all duration-200 ${
                        isCurrent
                          ? "border-[#18392B] bg-[#EBF0E8] ring-1 ring-[#18392B]"
                          : p.popular
                          ? "border-[#CAD8C7] bg-[#FAF8F3] shadow-soft"
                          : "border-[#E5E0D4] bg-[#FAF8F3]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          {p.badge && (
                            <span className="rounded-full bg-[#E5ECE5] px-2.5 py-0.5 text-[9px] font-bold text-[#18392B] uppercase tracking-wider">
                              {p.badge}
                            </span>
                          )}
                          <h3 className="mt-1 font-display text-xl font-bold tracking-tight text-[#183626]">
                            {p.name}
                          </h3>
                          <p className="text-xs text-[#65796C]">
                            {p.visits} on-site professional visit{p.visits > 1 ? "s" : ""} / month
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-display text-2xl font-bold text-[#183626]">₹{p.price}</p>
                          <p className="text-[10px] text-[#65796C]">/ month</p>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2 border-t border-[#EBE6DC] pt-3.5">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#65796C]">
                          Included Care:
                        </p>
                        <ul className="space-y-1.5 text-xs text-[#2A4032]">
                          {p.includedServices.map((inc, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <Check className="mt-0.5 h-3.5 w-3.5 flex-none text-[#18392B]" />
                              <span>{inc}</span>
                            </li>
                          ))}
                        </ul>

                        <p className="pt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#65796C]">
                          Plan Benefits:
                        </p>
                        <ul className="space-y-1.5 text-xs text-[#2A4032]">
                          {p.perks.map((perk, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <Sparkles className="mt-0.5 h-3.5 w-3.5 flex-none text-[#18392B]" />
                              <span>{perk}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-5 border-t border-[#EBE6DC] pt-4">
                        {isCurrent ? (
                          <div className="flex items-center justify-center rounded-full bg-[#E5ECE5] py-2.5 text-xs font-semibold text-[#18392B]">
                            <Check className="mr-1.5 h-4 w-4 text-[#18392B]" /> Current Active Plan
                          </div>
                        ) : (
                          <Link
                            to="/profile/membership"
                            className="press flex w-full items-center justify-center rounded-full bg-[#18392B] py-3 text-xs font-semibold text-white shadow-soft transition hover:bg-[#122D22]"
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
                      ? "bg-[#18392B] text-white font-semibold shadow-soft"
                      : "border border-[#E2DDD2] bg-[#FAF8F3] text-[#556B5C] font-medium hover:border-[#CAD4C5]"
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
                  className="group rounded-[24px] border border-[#E6E0D4] bg-[#FAF8F3] p-4 sm:p-5 shadow-2xs transition-all duration-200 hover:border-[#CAD4C5]"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="h-22 w-22 flex-none overflow-hidden rounded-2xl bg-[#E5ECE5]">
                      <img
                        src={service.image}
                        alt={service.name}
                        className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-display text-base font-bold tracking-tight text-[#183626] group-hover:text-[#18392B] transition-colors">
                            {service.name}
                          </h3>
                          <p className="text-[10px] text-[#65796C]">{service.duration}</p>
                        </div>
                        <span className="font-display text-base font-bold text-[#18392B]">
                          {service.price === 0 ? "FREE" : `₹${service.price}`}
                        </span>
                      </div>

                      <p className="line-clamp-2 text-xs leading-relaxed text-[#526357]">
                        {service.description}
                      </p>

                      <div className="pt-2.5 flex items-center justify-between gap-2 border-t border-[#EBE6DC]">
                        <Link
                          to="/services/$slug"
                          params={{ slug: service.slug }}
                          className="text-xs font-semibold text-[#18392B] hover:underline"
                        >
                          Details
                        </Link>

                        <Link
                          to="/services/$slug/book"
                          params={{ slug: service.slug }}
                          className="press inline-flex items-center gap-1 rounded-full bg-[#18392B] px-4 py-1.5 text-xs font-semibold text-white shadow-soft transition-all duration-200 hover:bg-[#122D22] active:scale-95"
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


