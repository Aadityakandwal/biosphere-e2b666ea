import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Shell } from "@/components/Shell";
import { useProfile, useBookings, useOrders, useGarden, PLAN_LABELS, SCAN_LIMITS } from "@/lib/stores";
import { useHydrated } from "@/lib/motion";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase-env";
import { ProfileSkeleton } from "@/components/Skeletons";
import {
  ChevronRight,
  User,
  CalendarDays,
  Leaf,
  ShieldCheck,
  Settings,
  HelpCircle,
  LogOut,
  LogIn,
  Sprout,
  ArrowRight,
  Sparkles,
  Coins,
  Edit3,
  FileText,
  Clock,
} from "lucide-react";

export const Route = createFileRoute("/profile/")({
  head: () => ({
    meta: [
      { title: "My Garden Hub — My Gardener" },
      {
        name: "description",
        content: "Manage your personal garden records, care plan, green points rewards, and account settings.",
      },
      { property: "og:title", content: "My Garden Hub — My Gardener" },
      {
        property: "og:description",
        content: "Manage your personal garden records, care plan, green points rewards, and account settings.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const p = useProfile();
  const bookings = useBookings((s) => s.bookings);
  const orders = useOrders((s) => s.orders);
  const { plants, freeCheckClaimed } = useGarden();
  const hydrated = useHydrated();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const hasFreeCheckBooked = bookings.some(
    (b) => (b.serviceSlug || (b as any).service_slug) === "free-garden-check"
  );
  const isEligibleForFreeCheck = !freeCheckClaimed && !hasFreeCheckBooked;

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    if (isSupabaseConfigured()) await supabase.auth.signOut();
    navigate({ to: "/auth", search: { redirect: undefined }, replace: true });
  };

  if (!hydrated) {
    return (
      <Shell>
        <ProfileSkeleton />
      </Shell>
    );
  }

  const menuGroups = [
    {
      groupTitle: "MY GARDEN",
      items: [
        {
          to: "/garden",
          icon: Sprout,
          label: "Garden Dashboard",
          description:
            plants.length > 0
              ? `${plants.length} plant${plants.length === 1 ? "" : "s"} · Health assessments & logs`
              : "Digital plant records & service logs",
        },
      ],
    },
    {
      groupTitle: "MY CARE & ACTIVITY",
      items: [
        {
          to: "/profile/membership",
          icon: ShieldCheck,
          label: "Care Plan Membership",
          description: `${PLAN_LABELS[p.plan]} Plan · ${
            SCAN_LIMITS[p.plan] === null ? "Unlimited" : SCAN_LIMITS[p.plan]
          } AI scans/day`,
        },
        {
          to: "/profile/activity",
          icon: CalendarDays,
          label: "Visits & Orders History",
          description: `${bookings.length} visit${bookings.length === 1 ? "" : "s"} · ${orders.length} order${
            orders.length === 1 ? "" : "s"
          }`,
        },
      ],
    },
    {
      groupTitle: "REWARDS & PERKS",
      items: [
        {
          to: "/profile/green-points",
          icon: Leaf,
          label: "Green Points Rewards",
          description: `${p.greenPoints} available point${p.greenPoints === 1 ? "" : "s"} to redeem`,
        },
      ],
    },
    {
      groupTitle: "ACCOUNT & SUPPORT",
      items: [
        {
          to: "/profile/edit",
          icon: User,
          label: "Personal Information",
          description: "Name, contact number & garden address",
        },
        {
          to: "/profile/settings",
          icon: Settings,
          label: "Account Settings",
          description: "Preferences, notifications & privacy",
        },
        {
          to: "/profile/support",
          icon: HelpCircle,
          label: "Help & Botanist Desk",
          description: "WhatsApp, email & garden support",
        },
      ],
    },
  ];

  return (
    <Shell>
      <div className="pb-12 space-y-6 sm:space-y-8">
        {/* =========================================================================
            1. PERSONAL PROFILE HERO
            ========================================================================= */}
        <section className="px-5 sm:px-6 pt-1">
          <div className="flex items-center justify-between gap-4 rounded-3xl border border-border/70 bg-card p-4 sm:p-5 shadow-2xs">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="relative flex-none">
                {p.avatar ? (
                  <img
                    src={p.avatar}
                    alt={p.name || "Profile"}
                    className="h-14 w-14 rounded-full object-cover ring-2 ring-primary/20"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary ring-2 ring-primary/20">
                    <User className="h-6 w-6" />
                  </div>
                )}
                <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#1A3D2F] text-[10px] text-white shadow-xs">
                  🌿
                </span>
              </div>

              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-display text-lg sm:text-xl font-normal tracking-tight text-foreground truncate">
                    {p.name || (isAuthenticated ? "My Gardener Member" : "Guest Gardener")}
                  </h1>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {p.email || p.phone || "Personal Garden Headquarters"}
                </p>
                <div className="pt-0.5 flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-semibold text-primary">
                    {PLAN_LABELS[p.plan]} Care Plan
                  </span>
                </div>
              </div>
            </div>

            <Link
              to="/profile/edit"
              aria-label="Edit Profile"
              className="press flex h-8 w-8 flex-none items-center justify-center rounded-full border border-border/70 bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Edit3 className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* =========================================================================
            2. MY GARDEN — PRIMARY FEATURE ENTRY
            ========================================================================= */}
        <section className="px-5 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/[0.08] via-card to-card p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
                    Digital Garden Record
                  </span>
                </div>
                <h2 className="font-display text-xl sm:text-2xl font-normal tracking-tight text-foreground">
                  My Garden
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
                  {plants.length > 0
                    ? "Track your individual plants, scheduled maintenance, and on-site inspection history."
                    : "Your garden story starts here. Complete your Free Garden Check to begin your digital record."}
                </p>
              </div>

              <div className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Sprout className="h-6 w-6" />
              </div>
            </div>

            {/* Plants summary or Free check prompt */}
            {plants.length > 0 ? (
              <div className="flex items-center justify-between border-t border-primary/15 pt-3.5">
                <div className="flex items-center gap-2 text-xs text-foreground/90 font-medium">
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                    {plants.length} plant{plants.length === 1 ? "" : "s"} logged
                  </span>
                </div>
                <Link
                  to="/garden"
                  className="press inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  <span>Open Dashboard</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              <div className="flex items-center justify-between border-t border-primary/15 pt-3.5">
                {isEligibleForFreeCheck ? (
                  <>
                    <span className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                      First Visit Free (₹0)
                    </span>
                    <Link
                      to="/services/$slug/book"
                      params={{ slug: "free-garden-check" }}
                      className="press inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 shadow-2xs"
                    >
                      <span>Claim Free Check</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </>
                ) : (
                  <>
                    <span className="text-xs text-muted-foreground">Ready to log plants</span>
                    <Link
                      to="/garden"
                      className="press inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      <span>Explore Garden</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </section>

        {/* =========================================================================
            3. ACTIVE CARE PLAN + GREEN POINTS — COMPACT INFORMATION AREA
            ========================================================================= */}
        <section className="px-5 sm:px-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {/* Care Plan Card */}
            <Link
              to="/profile/membership"
              className="group press rounded-3xl border border-border/70 bg-card p-3.5 sm:p-4 shadow-2xs transition-all hover:border-primary/40 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-primary">
                    CARE PLAN
                  </span>
                  <ShieldCheck className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-base font-medium text-foreground leading-tight">
                    {PLAN_LABELS[p.plan]}
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {SCAN_LIMITS[p.plan] === null ? "Unlimited AI Scans" : `${SCAN_LIMITS[p.plan]} AI scans/day`}
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-border/40 flex items-center justify-between text-[11px] font-semibold text-primary">
                <span>View Plan</span>
                <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>

            {/* Green Points Card */}
            <Link
              to="/profile/green-points"
              className="group press rounded-3xl border border-border/70 bg-card p-3.5 sm:p-4 shadow-2xs transition-all hover:border-primary/40 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-primary">
                    REWARDS
                  </span>
                  <Leaf className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-display text-base font-medium text-foreground leading-tight">
                    {p.greenPoints} <span className="text-xs font-normal text-muted-foreground">pts</span>
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Redeem on visits & products
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-border/40 flex items-center justify-between text-[11px] font-semibold text-primary">
                <span>Redeem</span>
                <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          </div>
        </section>

        {/* =========================================================================
            4. ORGANIZED ACCOUNT & ACTIVITY MENU
            ========================================================================= */}
        <section className="px-5 sm:px-6 space-y-5">
          {menuGroups.map((group) => (
            <div key={group.groupTitle} className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/80 px-1">
                {group.groupTitle}
              </span>
              <div className="rounded-3xl border border-border/60 bg-card overflow-hidden divide-y divide-border/40 shadow-2xs">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="press group flex items-center justify-between p-3.5 transition-colors hover:bg-muted/40"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-8 w-8 flex-none items-center justify-center rounded-xl bg-secondary text-primary">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-display text-xs sm:text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                            {item.label}
                          </p>
                          <p className="text-[10.5px] text-muted-foreground truncate">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 flex-none ml-2" />
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </section>

        {/* =========================================================================
            5. AUTH / SIGN OUT ACTION
            ========================================================================= */}
        <section className="px-5 sm:px-6 pt-2 text-center">
          {isAuthenticated ? (
            <button
              type="button"
              onClick={signOut}
              className="press inline-flex items-center gap-1.5 rounded-full border border-destructive/20 bg-destructive/5 px-4 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out of My Gardener</span>
            </button>
          ) : (
            <Link
              to="/auth"
              search={{ redirect: undefined }}
              className="press inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Sign In or Create Account</span>
            </Link>
          )}
        </section>
      </div>
    </Shell>
  );
}
