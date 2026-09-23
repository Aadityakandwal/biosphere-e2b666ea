import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Wrench, MapPin, ShoppingBag, User, ShoppingCart } from "lucide-react";
import type { ReactNode } from "react";
import { useCart, useProfile } from "@/lib/stores";
import { Badge } from "@/components/ui/badge";
import logoUrl from "@/assets/my-garden-logo.png";

export function Shell({ children, title }: { children: ReactNode; title?: string }) {
  const items = useCart((s) => s.items);
  const avatar = useProfile((s) => s.avatar);
  const name = useProfile((s) => s.name);
  const count = items.reduce((n, i) => n + i.qty, 0);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const navItems = [
    { to: "/", label: "Home", icon: Home },
    { to: "/services", label: "Services", icon: Wrench },
    { to: "/bookings", label: "Maps", icon: MapPin },
    { to: "/shop", label: "Shop", icon: ShoppingBag },
    { to: "/profile", label: "Profile", icon: User },
  ] as const;

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <div className="mx-auto max-w-md pb-24">
        {/* Top Branded Bar matching reference */}
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border/50 bg-background/90 px-5 py-3.5 backdrop-blur-md">
          <Link to="/" className="group press flex items-center gap-2.5">
            <img
              src={logoUrl}
              alt="My Gardener Logo"
              className="h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
            <span className="font-display text-xl font-bold tracking-tight text-primary">
              My Gardener
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              to="/cart"
              aria-label="Cart"
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-foreground/80 transition-all duration-200 hover:bg-secondary/60 hover:text-primary press active:scale-95"
            >
              <ShoppingCart className="h-5 w-5 stroke-[1.8]" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground shadow-xs ring-2 ring-background">
                  {count}
                </span>
              )}
            </Link>
            <Link
              to="/profile"
              aria-label="Profile"
              className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-border/80 bg-secondary/40 text-foreground/80 shadow-2xs transition-all duration-200 hover:border-primary/50 hover:bg-secondary/80 press active:scale-95"
            >
              {avatar ? (
                <img alt={name || "Profile"} src={avatar} className="h-full w-full object-cover" />
              ) : (
                <User className="h-4 w-4 stroke-[1.8] text-foreground/80" />
              )}
            </Link>
          </div>
        </header>

        {title && (
          <div className="px-5 pt-5 pb-1">
            <h1 className="font-display text-2xl font-normal tracking-tight text-foreground">{title}</h1>
          </div>
        )}

        <main className="page-enter">{children}</main>
      </div>

      {/* Bottom Navigation matching reference */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur-md select-none">
        <div className="mx-auto grid max-w-md grid-cols-5 py-1.5">
          {navItems.map((n) => {
            const active =
              n.to === "/"
                ? pathname === "/"
                : pathname === n.to || pathname.startsWith(n.to + "/");
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`group relative flex flex-col items-center justify-center gap-1 py-1 text-[10px] transition-all duration-200 active:scale-95 ${
                  active ? "font-semibold text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full transition-all duration-200 ${
                    active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 transition-all duration-200 ${
                      active ? "fill-primary/15 stroke-primary stroke-[2.2]" : "stroke-[1.6]"
                    }`}
                  />
                </span>
                <span className="tracking-tight leading-none text-[11px]">{n.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export function SectionHeader({
  title,
  actionHref,
  actionLabel = "View all",
}: {
  title: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="mb-3 mt-6 flex items-center justify-between">
      <h2 className="font-display text-lg font-semibold tracking-tight">{title}</h2>
      {actionHref && (
        <Link to={actionHref} className="text-sm font-medium text-primary hover:underline">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
