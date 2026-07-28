import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Wrench, CalendarDays, ShoppingBag, User, ShoppingCart, MapPin } from "lucide-react";
import type { ReactNode } from "react";
import { useCart } from "@/lib/stores";
import { Badge } from "@/components/ui/badge";
import logoAsset from "@/assets/biosphere-logo.png.asset.json";
import { useLocationPrompt, requestLocation } from "@/lib/use-location";

export function Shell({ children, title }: { children: ReactNode; title?: string }) {
  const items = useCart((s) => s.items);
  const count = items.reduce((n, i) => n + i.qty, 0);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { label: locationLabel, status: locationStatus } = useLocationPrompt();
  const locationText =
    locationStatus === "asking"
      ? "Locating…"
      : locationLabel ?? (locationStatus === "denied" || locationStatus === "unavailable" ? "Set location" : "Locating…");


  const navItems = [
    { to: "/", label: "Home", icon: Home },
    { to: "/services", label: "Services", icon: Wrench },
    { to: "/bookings", label: "Bookings", icon: CalendarDays },
    { to: "/shop", label: "Shop", icon: ShoppingBag },
    { to: "/profile", label: "Profile", icon: User },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md pb-24">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border/60 bg-background/70 px-4 py-3 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-2">
            <Link to="/" className="group press flex items-center gap-2">
              <img src={logoAsset.url} alt="Biosphere" className="h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-105" />
              <span className="block font-display text-xl font-semibold tracking-tight text-foreground">Biosphere</span>
            </Link>
          </div>


          <div className="flex items-center gap-1">
            <Link to="/cart" aria-label="Cart" className="relative rounded-full p-2 text-foreground/70 hover:bg-muted hover:text-foreground press">
              <ShoppingCart className="h-5 w-5" />
              {count > 0 && (
                <Badge className="absolute -right-0.5 -top-0.5 h-5 min-w-5 rounded-full px-1 text-[10px] shadow-md ring-2 ring-background animate-in zoom-in">{count}</Badge>
              )}
            </Link>
            <Link to="/profile" aria-label="Profile" className="ml-1 h-9 w-9 overflow-hidden rounded-full bg-secondary ring-1 ring-border shadow-sm transition hover:ring-primary/40 hover:shadow-md press">
              <img alt="You" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80" className="h-full w-full object-cover" />
            </Link>
          </div>
        </header>

        {title && (
          <h1 className="px-4 pt-5 font-display text-2xl font-semibold tracking-tight animate-fade-in">{title}</h1>
        )}

        <main className="page-enter space-y-6 px-4 pt-3">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto grid max-w-md grid-cols-5">
          {navItems.map((n) => {
            const active = n.to === "/" ? pathname === "/" : pathname === n.to || pathname.startsWith(n.to + "/");
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`group relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${active ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                {active && (
                  <span className="absolute inset-x-6 top-0 h-0.5 rounded-full bg-primary" />
                )}
                <span className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 ${active ? "bg-primary/10 scale-110" : "group-hover:bg-muted"}`}>
                  <Icon className={`h-[18px] w-[18px] ${active ? "stroke-[2.5]" : ""}`} />
                </span>
                {n.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export function SectionHeader({ title, actionHref, actionLabel = "View all" }: { title: string; actionHref?: string; actionLabel?: string }) {
  return (
    <div className="mb-3 mt-6 flex items-center justify-between">
      <h2 className="font-display text-lg font-semibold tracking-tight">{title}</h2>
      {actionHref && (
        <Link to={actionHref} className="text-sm font-medium text-primary hover:underline">{actionLabel}</Link>
      )}
    </div>
  );
}
