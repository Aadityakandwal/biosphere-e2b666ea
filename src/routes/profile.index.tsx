import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Shell } from "@/components/Shell";
import { useProfile, useBookings, useOrders, PLAN_LABELS, SCAN_LIMITS } from "@/lib/stores";
import { useHydrated } from "@/lib/motion";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { ProfileSkeleton } from "@/components/Skeletons";
import { ChevronRight, User, CalendarDays, Leaf, Award, Settings, HelpCircle, LogOut, LogIn } from "lucide-react";

export const Route = createFileRoute("/profile/")({
  head: () => ({
    meta: [
      { title: "Profile — Biosphere" },
      { name: "description", content: "Manage your account, bookings, green points, and membership." },
      { property: "og:title", content: "Profile — Biosphere" },
      { property: "og:description", content: "Manage your account, bookings, green points, and membership." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const p = useProfile();
  const bookings = useBookings(s => s.bookings);
  const orders = useOrders(s => s.orders);
  const hydrated = useHydrated();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };



  const sections = [
    { to: "/profile/edit", icon: User, label: "My Profile", hint: "Edit personal info" },
    { to: "/profile/activity", icon: CalendarDays, label: "My Bookings & Orders", hint: `${bookings.length} bookings · ${orders.length} orders` },
    { to: "/profile/green-points", icon: Leaf, label: "Redeem Green Points", hint: `${p.greenPoints} pts available` },
    { to: "/profile/membership", icon: Award, label: "Membership Pass", hint: `${PLAN_LABELS[p.plan]} plan · ${SCAN_LIMITS[p.plan] === null ? "unlimited" : SCAN_LIMITS[p.plan]} AI scans/day` },
    { to: "/profile/settings", icon: Settings, label: "Settings", hint: "Notifications, privacy" },
    { to: "/profile/support", icon: HelpCircle, label: "Help & Support", hint: "WhatsApp · Email · Phone" },
  ] as const;

  if (!hydrated) {
    return (
      <Shell>
        <ProfileSkeleton />
      </Shell>
    );
  }

  return (
    <Shell>
      {/* Avatar + badge */}
      <div className="mt-6 flex flex-col items-center">
        <div className="relative">
          <img
            src={p.avatar}
            alt={p.name}
            className="h-28 w-28 rounded-full object-cover ring-4 ring-primary/90 ring-offset-2 ring-offset-background"
          />
          <span className="absolute -bottom-3 left-1/2 w-max -translate-x-1/2 rounded-full bg-primary px-4 py-1.5 text-center text-[11px] font-semibold leading-tight text-primary-foreground shadow-[var(--shadow-elevated)]">
            Elite<br />Caretaker
          </span>
        </div>
        <h1 className="mt-7 font-display text-3xl font-bold tracking-tight">{p.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Gardening enthusiast since 2021</p>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        <Stat value={`${p.greenPoints}`} label="Green Points" />
        <StatLink to="/profile/membership" icon={Award} label="Membership" />
        <StatLink to="/profile/support" icon={HelpCircle} label="Help & Support" />
      </div>

      <h2 className="mt-8 font-display text-2xl font-bold tracking-tight">Settings &amp; Tools</h2>

      <div className="mt-4 space-y-3">
        {sections.map(s => (
          <Link
            key={s.to}
            to={s.to}
            className="flex items-center gap-4 rounded-[28px] border border-border/40 bg-card px-4 py-4 shadow-[var(--shadow-soft)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)] active:scale-[0.99]"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <s.icon className="h-5 w-5" />
            </span>
            <span className="flex-1">
              <span className="block font-display text-base font-semibold leading-tight">{s.label}</span>
              <span className="block text-xs text-muted-foreground">{s.hint}</span>
            </span>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Link>
        ))}
      </div>

      {isAuthenticated ? (
        <button
          type="button"
          onClick={signOut}
          className="mx-auto mt-8 flex items-center gap-2 rounded-full px-4 py-2 text-base font-medium text-destructive transition-colors hover:bg-destructive/10"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      ) : (
        <Link
          to="/auth"
          className="mx-auto mt-8 flex w-max items-center gap-2 rounded-full bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-[var(--shadow-elevated)] transition-transform active:scale-[0.98]"
        >
          <LogIn className="h-5 w-5" />
          Sign in or create account
        </Link>
      )}
    </Shell>
  );
}

function StatLink({ to, icon: Icon, label, sub }: { to: string; icon: typeof Award; label: string; sub?: string }) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center justify-center rounded-3xl border border-border/40 bg-card px-2 py-4 text-center shadow-[var(--shadow-soft)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)] active:scale-[0.99]"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <p className="mt-1 text-xs font-semibold leading-tight text-foreground">{label}</p>
      {sub && (
        <span className="mt-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
          {sub}
        </span>
      )}
    </Link>
  );
}

function Stat({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <div className="rounded-3xl border border-border/40 bg-card px-2 py-4 text-center shadow-[var(--shadow-soft)]">
      <p className={`font-display text-2xl font-bold ${accent ? "text-primary" : ""}`}>{value}</p>
      <p className="mt-1 text-xs leading-tight text-muted-foreground">{label}</p>
    </div>
  );
}
