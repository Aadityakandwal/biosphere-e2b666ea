import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/Shell";
import { Card } from "@/components/ui/card";
import { useProfile, useBookings, useOrders } from "@/lib/stores";
import { ChevronRight, User, CalendarDays, Leaf, Crown, Settings, HelpCircle } from "lucide-react";

export const Route = createFileRoute("/profile")({
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

  const sections = [
    { to: "/profile/edit", icon: User, label: "My Profile", hint: "Edit personal info" },
    { to: "/profile/bookings", icon: CalendarDays, label: "My Bookings", hint: `${bookings.length} total` },
    { to: "/profile/green-points", icon: Leaf, label: "Redeem Green Points", hint: `${p.greenPoints} pts available` },
    { to: "/profile/membership", icon: Crown, label: "Membership Pass", hint: "Basic · Pro · Elite" },
    { to: "/profile/settings", icon: Settings, label: "Settings", hint: "Notifications, privacy" },
    { to: "/profile/support", icon: HelpCircle, label: "Help & Support", hint: "WhatsApp · Email · Phone" },
  ] as const;

  return (
    <Shell>
      <div className="mt-3 flex items-center gap-4">
        <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120" alt="" className="h-16 w-16 rounded-full object-cover ring-2 ring-primary/20" />
        <div>
          <p className="font-display text-xl font-semibold">{p.name}</p>
          <p className="text-sm text-muted-foreground">{p.email}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Stat label="Green Points" value={p.greenPoints} />
        <Stat label="Bookings" value={bookings.length} />
        <Stat label="Orders" value={orders.length} />
      </div>

      <div className="mt-6 space-y-2">
        {sections.map(s => (
          <Link key={s.to} to={s.to}>
            <Card className="flex items-center gap-3 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary"><s.icon className="h-5 w-5" /></div>
              <div className="flex-1">
                <p className="text-sm font-medium">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.hint}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Card>
          </Link>
        ))}
      </div>
    </Shell>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-3 text-center">
      <p className="font-display text-xl font-semibold">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </Card>
  );
}
