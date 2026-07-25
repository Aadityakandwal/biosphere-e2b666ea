import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Wrench, CalendarDays, ShoppingBag, User, ShoppingCart, ClipboardList, Leaf } from "lucide-react";
import type { ReactNode } from "react";
import { useCart } from "@/lib/stores";
import { Badge } from "@/components/ui/badge";

export function Shell({ children, title }: { children: ReactNode; title?: string }) {
  const items = useCart((s) => s.items);
  const count = items.reduce((n, i) => n + i.qty, 0);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

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
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Leaf className="h-5 w-5" />
            </div>
            <span className="font-display text-xl font-semibold tracking-tight">Biosphere</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/orders" aria-label="Order history" className="rounded-full p-2 hover:bg-muted">
              <ClipboardList className="h-5 w-5" />
            </Link>
            <Link to="/cart" aria-label="Cart" className="relative rounded-full p-2 hover:bg-muted">
              <ShoppingCart className="h-5 w-5" />
              {count > 0 && (
                <Badge className="absolute -right-1 -top-1 h-5 min-w-5 rounded-full px-1 text-[10px]">{count}</Badge>
              )}
            </Link>
            <Link to="/profile" aria-label="Profile" className="ml-1 h-9 w-9 overflow-hidden rounded-full bg-secondary ring-1 ring-border">
              <img alt="You" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80" className="h-full w-full object-cover" />
            </Link>
          </div>
        </header>

        {title && (
          <h1 className="px-4 pt-4 font-display text-2xl font-semibold tracking-tight">{title}</h1>
        )}

        <main className="px-4 pt-3">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur">
        <div className="mx-auto grid max-w-md grid-cols-5">
          {navItems.map((n) => {
            const active = n.to === "/" ? pathname === "/" : pathname === n.to || pathname.startsWith(n.to + "/");
            const Icon = n.icon;
            return (
              <Link key={n.to} to={n.to} className={`flex flex-col items-center gap-1 py-2 text-[11px] ${active ? "text-primary" : "text-muted-foreground"}`}>
                <Icon className={`h-5 w-5 ${active ? "stroke-[2.5]" : ""}`} />
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
