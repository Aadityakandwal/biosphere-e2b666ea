import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/Shell";
import { useGarden, useBookings, useProfile, useCart } from "@/lib/stores";
import { products, services } from "@/lib/data";
import {
  ArrowRight,
  ChevronRight,
  Coins,
  Camera,
  CalendarCheck,
  ShoppingBag,
  MapPin,
  Leaf,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "My Gardener — Professional Garden Care & Botanical Living" },
      {
        name: "description",
        content:
          "Professional garden checks, digital plant records, care plans, and detailed AI plant diagnostics.",
      },
      { property: "og:title", content: "My Gardener — Professional Garden Care & Botanical Living" },
      {
        property: "og:description",
        content:
          "Professional garden checks, digital plant records, care plans, and detailed AI plant diagnostics.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { freeCheckClaimed } = useGarden();
  const bookings = useBookings((s) => s.bookings);
  const greenPoints = useProfile((s) => s.greenPoints);
  const add = useCart((s) => s.add);

  const hasFreeCheckBooked = bookings.some(
    (b) => (b.serviceSlug || (b as any).service_slug) === "free-garden-check"
  );
  const isEligibleForFreeCheck = !freeCheckClaimed && !hasFreeCheckBooked;

  const handleAddToCart = (p: (typeof products)[number], e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    add({ id: p.id, name: p.name, price: p.price, image: p.image });
    toast.success(`Added ${p.name} to cart`);
  };

  return (
    <Shell>
      <div className="space-y-6 px-4 pt-3 pb-12 sm:px-6">
        {/* =========================================================================
            1. HERO SECTION (FREE GARDEN CHECK) — MATCHING REFERENCE
            ========================================================================= */}
        <section className="relative overflow-hidden rounded-[26px] border border-border/60 bg-[#E8ECE5] shadow-xs">
          {/* Background Garden Photo with warm sunlit lighting */}
          <div className="relative min-h-[280px] sm:min-h-[300px] w-full">
            <img
              src="https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=1000&auto=format&fit=crop&q=80"
              alt="Lush Garden with Plants"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            {/* Soft Warm Radial & Linear Gradient Overlay for High-Contrast Editorial Typography */}
            <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/85 to-transparent sm:via-background/70" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />

            <div className="relative z-10 flex h-full min-h-[280px] sm:min-h-[300px] flex-col justify-between p-5 sm:p-6">
              <div className="space-y-2 max-w-[260px] sm:max-w-[300px]">
                <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/75">
                  FREE GARDEN CHECK
                </span>
                <h1 className="font-display text-2xl sm:text-3xl font-normal leading-[1.18] tracking-tight text-foreground">
                  A Healthier Garden Awaits
                </h1>
                <p className="text-xs leading-relaxed text-foreground/80">
                  Get expert care, personalized advice and a healthier garden — at no cost.
                </p>
              </div>

              <div className="pt-4">
                {isEligibleForFreeCheck ? (
                  <Link
                    to="/services/$slug/book"
                    params={{ slug: "free-garden-check" }}
                    className="group press inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 active:scale-95"
                  >
                    <span>Get Free Garden Check</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </Link>
                ) : (
                  <Link
                    to="/garden"
                    className="group press inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 active:scale-95"
                  >
                    <span>View Garden</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            2. MY GARDEN SECTION — MATCHING REFERENCE ARCH COMPOSITION
            ========================================================================= */}
        <section>
          <Link
            to="/garden"
            className="group press relative block overflow-hidden rounded-[22px] border border-border/80 bg-[#ECEEE6] p-5 transition-all duration-300 hover:border-primary/40 hover:shadow-card active:scale-[0.99]"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-[58%]">
                <h2 className="font-display text-xl font-normal tracking-tight text-foreground">
                  My Garden
                </h2>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Your plants, garden records and service history.
                </p>
                <div className="pt-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                    <span>View Garden</span>
                    <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-1" />
                  </span>
                </div>
              </div>

              {/* Botanical Arch Illustration / Real Plant Image */}
              <div className="relative flex-none">
                <div className="h-28 w-28 sm:h-32 sm:w-32 overflow-hidden rounded-t-full border-2 border-primary/20 bg-background/80 shadow-inner">
                  <img
                    src="https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=400&auto=format&fit=crop&q=80"
                    alt="Botanical Foliage"
                    className="h-full w-full object-cover object-bottom transition-transform duration-500 group-hover:scale-108"
                  />
                </div>
              </div>
            </div>
          </Link>
        </section>

        {/* =========================================================================
            3. TWO-COLUMN STATS / SUMMARY CARDS — MATCHING REFERENCE
            ========================================================================= */}
        <section className="grid grid-cols-2 gap-3">
          {/* Card 1: Your Care Plan */}
          <Link
            to="/services"
            search={{ tab: "plans" }}
            className="group press flex flex-col justify-between rounded-[20px] border border-border/80 bg-card p-4 transition-all duration-200 hover:border-primary/40 hover:shadow-card active:scale-[0.98]"
          >
            <div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary/80 text-primary">
                <Leaf className="h-4 w-4 stroke-[2]" />
              </div>
              <h3 className="mt-3 font-display text-sm font-semibold tracking-tight text-foreground">
                Your Care Plan
              </h3>
              <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                Keep your garden healthy with our expert care.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-foreground group-hover:text-primary transition-colors">
                View Plan →
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>

          {/* Card 2: Green Points */}
          <Link
            to="/profile/green-points"
            className="group press flex flex-col justify-between rounded-[20px] border border-border/80 bg-card p-4 transition-all duration-200 hover:border-primary/40 hover:shadow-card active:scale-[0.98]"
          >
            <div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary/80 text-primary">
                <Coins className="h-4 w-4 stroke-[2]" />
              </div>
              <h3 className="mt-3 font-display text-sm font-semibold tracking-tight text-foreground">
                Green Points
              </h3>
              <p className="mt-0.5 font-display text-base font-normal tracking-tight text-foreground">
                {greenPoints.toLocaleString()} pts
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-foreground group-hover:text-primary transition-colors">
                Redeem Now →
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        </section>

        {/* =========================================================================
            4. QUICK ACTIONS — DIRECT UNBOXED ICON ROW MATCHING REFERENCE
            ========================================================================= */}
        <section className="pt-2">
          <h2 className="font-display text-lg font-normal tracking-tight text-foreground mb-3">
            Quick Actions
          </h2>

          <div className="grid grid-cols-4 gap-2 text-center select-none">
            {/* Action 1: AI Plant Doctor */}
            <Link
              to="/plant-doctor"
              className="group press flex flex-col items-center gap-1.5 active:scale-95"
            >
              <div className="flex h-13 w-13 sm:h-14 sm:w-14 items-center justify-center rounded-full border border-border/80 bg-card shadow-2xs transition-all duration-200 group-hover:border-primary/50 group-hover:bg-secondary/40">
                <Camera className="h-5 w-5 text-primary stroke-[1.8]" />
              </div>
              <div>
                <p className="text-[11px] font-semibold leading-tight text-foreground">
                  AI Plant Doctor
                </p>
                <p className="text-[9px] text-muted-foreground leading-tight">Check a Plant</p>
              </div>
            </Link>

            {/* Action 2: Book a Service */}
            <Link
              to="/services"
              className="group press flex flex-col items-center gap-1.5 active:scale-95"
            >
              <div className="flex h-13 w-13 sm:h-14 sm:w-14 items-center justify-center rounded-full border border-border/80 bg-card shadow-2xs transition-all duration-200 group-hover:border-primary/50 group-hover:bg-secondary/40">
                <CalendarCheck className="h-5 w-5 text-primary stroke-[1.8]" />
              </div>
              <div>
                <p className="text-[11px] font-semibold leading-tight text-foreground">
                  Book a Service
                </p>
                <p className="text-[9px] text-muted-foreground leading-tight">Expert Care</p>
              </div>
            </Link>

            {/* Action 3: Shop */}
            <Link
              to="/shop"
              className="group press flex flex-col items-center gap-1.5 active:scale-95"
            >
              <div className="flex h-13 w-13 sm:h-14 sm:w-14 items-center justify-center rounded-full border border-border/80 bg-card shadow-2xs transition-all duration-200 group-hover:border-primary/50 group-hover:bg-secondary/40">
                <ShoppingBag className="h-5 w-5 text-primary stroke-[1.8]" />
              </div>
              <div>
                <p className="text-[11px] font-semibold leading-tight text-foreground">Shop</p>
                <p className="text-[9px] text-muted-foreground leading-tight">Garden Essentials</p>
              </div>
            </Link>

            {/* Action 4: Find Nearby (Maps) */}
            <Link
              to="/bookings"
              className="group press flex flex-col items-center gap-1.5 active:scale-95"
            >
              <div className="flex h-13 w-13 sm:h-14 sm:w-14 items-center justify-center rounded-full border border-border/80 bg-card shadow-2xs transition-all duration-200 group-hover:border-primary/50 group-hover:bg-secondary/40">
                <MapPin className="h-5 w-5 text-primary stroke-[1.8]" />
              </div>
              <div>
                <p className="text-[11px] font-semibold leading-tight text-foreground">
                  Find Nearby
                </p>
                <p className="text-[9px] text-muted-foreground leading-tight">Nurseries & Stores</p>
              </div>
            </Link>
          </div>
        </section>

        {/* =========================================================================
            5. EXPLORE OUR SERVICES — HORIZONTAL CAROUSEL MATCHING REFERENCE
            ========================================================================= */}
        <section className="pt-2">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="font-display text-lg font-normal tracking-tight text-foreground">
              Explore Our Services
            </h2>
            <Link
              to="/services"
              className="group inline-flex items-center gap-1 text-xs font-semibold text-foreground hover:text-primary transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
            {/* Carousel Item 1: One-Time Services */}
            <Link
              to="/services"
              search={{ tab: "services" }}
              className="group press flex-none w-56 sm:w-64 snap-start overflow-hidden rounded-[20px] border border-border/80 bg-card transition-all duration-200 hover:border-primary/40 hover:shadow-card active:scale-[0.98]"
            >
              <div className="relative h-28 w-full overflow-hidden bg-secondary">
                <img
                  src="https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=600&auto=format&fit=crop&q=80"
                  alt="Gardener Tending Plants"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-3.5 flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                    One-Time Services
                  </h4>
                  <p className="text-[10px] text-muted-foreground">For specific garden needs</p>
                </div>
                <div className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-secondary/70 text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </Link>

            {/* Carousel Item 2: Garden Care Plans */}
            <Link
              to="/services"
              search={{ tab: "plans" }}
              className="group press flex-none w-56 sm:w-64 snap-start overflow-hidden rounded-[20px] border border-border/80 bg-card transition-all duration-200 hover:border-primary/40 hover:shadow-card active:scale-[0.98]"
            >
              <div className="relative h-28 w-full overflow-hidden bg-secondary">
                <img
                  src="https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&auto=format&fit=crop&q=80"
                  alt="Garden Care"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-3.5 flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                    Garden Care Plans
                  </h4>
                  <p className="text-[10px] text-muted-foreground">Ongoing care & maintenance</p>
                </div>
                <div className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-secondary/70 text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </Link>

            {/* Carousel Item 3: Space & Balcony Transformation */}
            <Link
              to="/services/$slug"
              params={{ slug: "balcony-garden" }}
              className="group press flex-none w-56 sm:w-64 snap-start overflow-hidden rounded-[20px] border border-border/80 bg-card transition-all duration-200 hover:border-primary/40 hover:shadow-card active:scale-[0.98]"
            >
              <div className="relative h-28 w-full overflow-hidden bg-secondary">
                <img
                  src="https://images.unsplash.com/photo-1600411833196-7c1f6b1a8b90?w=600&auto=format&fit=crop&q=80"
                  alt="Balcony Plants Setup"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-3.5 flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                    Balcony Transformation
                  </h4>
                  <p className="text-[10px] text-muted-foreground">Space setup & planters</p>
                </div>
                <div className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-secondary/70 text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* =========================================================================
            6. CURATED ESSENTIALS / SHOP SPOTLIGHT
            ========================================================================= */}
        <section className="pt-2">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="font-display text-lg font-normal tracking-tight text-foreground">
              Botanical Essentials
            </h2>
            <Link
              to="/shop"
              className="group inline-flex items-center gap-1 text-xs font-semibold text-foreground hover:text-primary transition-colors"
            >
              <span>Shop All</span>
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
            {products.slice(0, 5).map((p) => (
              <Link
                key={p.id}
                to="/shop/$productId"
                params={{ productId: p.id }}
                className="group press flex-none w-40 sm:w-44 snap-start overflow-hidden rounded-[18px] border border-border/80 bg-card p-2.5 transition-all duration-200 hover:border-primary/40 hover:shadow-card active:scale-[0.98]"
              >
                <div className="relative h-28 w-full overflow-hidden rounded-xl bg-secondary/40">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <button
                    onClick={(e) => handleAddToCart(p, e)}
                    aria-label={`Add ${p.name} to cart`}
                    className="absolute right-2 bottom-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs transition-transform duration-150 hover:scale-110 active:scale-95"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="pt-2.5 space-y-0.5">
                  <h4 className="text-xs font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                    {p.name}
                  </h4>
                  <p className="text-[10px] text-muted-foreground line-clamp-1">{p.short}</p>
                  <p className="pt-1 font-display text-xs font-semibold text-foreground">
                    ₹{p.price}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </Shell>
  );
}

