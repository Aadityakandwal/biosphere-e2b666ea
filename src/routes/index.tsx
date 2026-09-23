import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Shell } from "@/components/Shell";
import { useGarden, useBookings, useProfile, useCart } from "@/lib/stores";
import { products, reviews, gardenCarePlans } from "@/lib/data";
import {
  ArrowRight,
  Sparkles,
  Sprout,
  ArrowUpRight,
  Camera,
  Star,
  ShieldCheck,
  CalendarCheck,
  ShoppingBag,
  Wrench,
  Check,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "My Gardener — Premium Garden Management & Botanical Care" },
      {
        name: "description",
        content:
          "Professional on-site garden checks, digital plant records, and detailed AI plant health diagnostics.",
      },
      { property: "og:title", content: "My Gardener — Premium Garden Management & Botanical Care" },
      {
        property: "og:description",
        content:
          "Professional on-site garden checks, digital plant records, and detailed AI plant health diagnostics.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: HomePage,
});

const categoryCollections = [
  {
    id: "plans",
    name: "Care Plans",
    tagline: "Monthly scheduled care",
    image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&auto=format&fit=crop&q=80",
    to: "/services",
    search: { tab: "plans" },
  },
  {
    id: "setup",
    name: "Plant Setup",
    tagline: "Balconies & indoor spaces",
    image: "https://images.unsplash.com/photo-1600411833196-7c1f6b1a8b90?w=600&auto=format&fit=crop&q=80",
    to: "/services",
    search: { tab: "services" },
  },
  {
    id: "doctor",
    name: "Plant Health",
    tagline: "AI health analysis",
    image: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=600&auto=format&fit=crop&q=80",
    to: "/plant-doctor",
  },
  {
    id: "consult",
    name: "Consultation",
    tagline: "1-on-1 expert guidance",
    image: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=600&auto=format&fit=crop&q=80",
    to: "/services",
    search: { tab: "services" },
  },
  {
    id: "shop",
    name: "Essentials",
    tagline: "Soil, tonics & tools",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&auto=format&fit=crop&q=80",
    to: "/shop",
  },
];

function HomePage() {
  const { plants, freeCheckClaimed } = useGarden();
  const bookings = useBookings((s) => s.bookings);
  const profileName = useProfile((s) => s.name);
  const add = useCart((s) => s.add);

  const firstName = profileName?.trim().split(/\s+/)[0] || "";

  const timeGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

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
      <div className="pb-12 space-y-7 sm:space-y-9">
        {/* =========================================================================
            0. GREETING SECTION — EDITORIAL BOTANICAL GREETING
            ========================================================================= */}
        <section className="px-5 sm:px-6 pt-1">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Botanical Sanctuary
            </span>
            <h1 className="font-display text-2xl font-normal tracking-tight text-foreground sm:text-3xl">
              Hello{firstName ? ` ${firstName}` : ""}, {timeGreeting.toLowerCase()} 🌿
            </h1>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Let's care for your plants and botanical spaces today.
            </p>
          </div>
        </section>

        {/* =========================================================================
            1. OFFERS & COMPLIMENTARY CHECKS — REFINED HORIZONTAL SCROLL TRACK
            ========================================================================= */}
        <section className="px-5 sm:px-6">
          <div className="relative rounded-3xl border border-border/70 bg-card p-4 sm:p-5 shadow-2xs overflow-hidden transition-all duration-300 hover:border-primary/40 hover:shadow-card">
            {/* Scrollable Offers Track */}
            <div className="flex gap-4 overflow-x-auto scrollbar-none snap-x snap-mandatory">
              {/* Slide 1: Free Garden Check */}
              <div className="w-full flex-none snap-center space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                    First Visit Free
                  </span>
                  <span className="rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                    ₹0
                  </span>
                </div>

                <div className="space-y-0.5">
                  <h2 className="font-display text-lg sm:text-xl font-normal tracking-tight text-foreground leading-snug">
                    Free Garden Check
                  </h2>
                  <p className="text-xs text-foreground/75 leading-relaxed">
                    Professional on-site garden assessment and baseline plant health check.
                  </p>
                </div>

                <div className="pt-1 flex items-center justify-between">
                  {isEligibleForFreeCheck ? (
                    <Link
                      to="/services/$slug/book"
                      params={{ slug: "free-garden-check" }}
                      className="group press inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary/90 shadow-2xs active:scale-95"
                    >
                      <span>Claim Free Check</span>
                      <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </Link>
                  ) : (
                    <Link
                      to="/garden"
                      className="group press inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary/90 shadow-2xs active:scale-95"
                    >
                      <span>View Garden</span>
                      <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </Link>
                  )}
                  <span className="text-[10px] text-muted-foreground font-medium tracking-wide">
                    Swipe for offers →
                  </span>
                </div>
              </div>

              {/* Slide 2: First Booking 20% OFF */}
              <div className="w-full flex-none snap-center space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
                    🌿 Special Welcome
                  </span>
                  <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-bold text-primary">
                    BIO20
                  </span>
                </div>

                <div className="space-y-0.5">
                  <h2 className="font-display text-lg sm:text-xl font-normal tracking-tight text-foreground leading-snug">
                    20% Off First Booking
                  </h2>
                  <p className="text-xs text-foreground/75 leading-relaxed">
                    Use promo code BIO20 at checkout for any setup or maintenance service.
                  </p>
                </div>

                <div className="pt-1 flex items-center justify-between">
                  <Link
                    to="/services"
                    className="group press inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-background px-4 py-1.5 text-xs font-semibold text-primary transition-all duration-200 hover:bg-primary hover:text-primary-foreground active:scale-95"
                  >
                    <span>Explore Services</span>
                    <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </Link>
                  <span className="text-[10px] text-muted-foreground font-medium tracking-wide">
                    Swipe for more →
                  </span>
                </div>
              </div>

              {/* Slide 3: Buy 2 Biovelocity Get 1 Free */}
              <div className="w-full flex-none snap-center space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
                    🧪 Tonic Bundle
                  </span>
                  <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-bold text-primary">
                    BIO3
                  </span>
                </div>

                <div className="space-y-0.5">
                  <h2 className="font-display text-lg sm:text-xl font-normal tracking-tight text-foreground leading-snug">
                    Buy 2 Tonics, Get 1 Free
                  </h2>
                  <p className="text-xs text-foreground/75 leading-relaxed">
                    Stock up on Neerva &amp; BioBloom microbial formulas for thriving plants.
                  </p>
                </div>

                <div className="pt-1 flex items-center justify-between">
                  <Link
                    to="/shop"
                    className="group press inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-background px-4 py-1.5 text-xs font-semibold text-primary transition-all duration-200 hover:bg-primary hover:text-primary-foreground active:scale-95"
                  >
                    <span>Shop Tonics</span>
                    <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </Link>
                  <span className="text-[10px] text-muted-foreground font-medium tracking-wide">
                    1 of 3
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            2. AI PLANT DOCTOR — DISTINCTIVE BOTANICAL ANALYSIS
            ========================================================================= */}
        <section className="px-5 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-card p-6 sm:p-7 space-y-4 shadow-2xs transition-all duration-300 hover:border-primary/40 hover:shadow-card">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
                <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
                Botanical Diagnostics
              </span>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary">
                Instant AI
              </span>
            </div>

            <div className="space-y-1.5">
              <h3 className="font-display text-2xl font-normal tracking-tight text-foreground">
                AI Plant Doctor
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed text-foreground/75">
                Upload a plant photo for a detailed AI Plant Health Analysis, likely causes, and organic care steps.
              </p>
            </div>

            <div className="pt-2">
              <Link
                to="/plant-doctor"
                className="group press inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-xs transition-all duration-200 hover:bg-primary/90 active:scale-95"
              >
                <Camera className="h-3.5 w-3.5" />
                <span>Check a Plant</span>
                <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* =========================================================================
            3. CATEGORY DISCOVERY — HORIZONTALLY SCROLLABLE BOTANICAL TILES
            ========================================================================= */}
        <section className="space-y-3.5">
          <div className="px-5 sm:px-6 flex items-baseline justify-between">
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-normal tracking-tight text-foreground">
                Explore My Gardener
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Curated care, plant setup and essentials
              </p>
            </div>
          </div>

          <div className="flex gap-3 overflow-x-auto px-5 sm:px-6 pb-2 scrollbar-none snap-x snap-mandatory">
            {categoryCollections.map((cat) => (
              <Link
                key={cat.id}
                to={cat.to as any}
                search={cat.search as any}
                className="group press flex-none w-36 sm:w-40 snap-start overflow-hidden rounded-2xl border border-border/70 bg-card p-2 text-left transition hover:border-primary/40 hover:shadow-card"
              >
                <div className="relative h-24 sm:h-28 w-full overflow-hidden rounded-xl bg-secondary">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="pt-2.5 pb-1 px-1">
                  <p className="text-xs font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
                    {cat.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground line-clamp-1">
                    {cat.tagline}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* =========================================================================
            4. MY GARDEN — INVITATION & BOTANICAL RECORD
            ========================================================================= */}
        <section className="px-5 sm:px-6">
          <div className="rounded-3xl border border-border/70 bg-card p-6 space-y-4 shadow-2xs">
            <div className="flex items-baseline justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
                My Garden
              </span>
              <Link
                to="/garden"
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                <span>View Garden</span>
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-1">
              <h2 className="font-display text-xl sm:text-2xl font-normal tracking-tight text-foreground">
                Your garden record, in one place.
              </h2>
              <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                {plants.length > 0
                  ? "Track logged plants, inspection records, and upcoming professional visits."
                  : "Your garden story starts here. Complete your Free Garden Check to begin your digital garden record."}
              </p>
            </div>

            {plants.length > 0 ? (
              <div className="pt-1 flex items-center gap-2 text-xs font-medium text-primary">
                <Sprout className="h-4 w-4" />
                <span>
                  {plants.length} {plants.length === 1 ? "plant" : "plants"} documented in your collection
                </span>
              </div>
            ) : (
              <div className="pt-2">
                <Link
                  to="/garden"
                  className="press inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-background px-4 py-2 text-xs font-semibold text-primary shadow-2xs transition hover:bg-primary hover:text-primary-foreground"
                >
                  <span>Open Garden Dashboard</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* =========================================================================
            5. CARE FOR YOUR GARDEN — SERVICES DISCOVERY
            ========================================================================= */}
        <section className="space-y-3.5">
          <div className="px-5 sm:px-6 flex items-baseline justify-between">
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-normal tracking-tight text-foreground">
                Care for Your Garden
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                From regular care to one-time services by My Gardener professionals
              </p>
            </div>
            <Link
              to="/services"
              className="text-xs font-semibold text-primary hover:underline flex-none pl-2"
            >
              All Services →
            </Link>
          </div>

          <div className="px-5 sm:px-6 grid gap-3.5">
            {/* Service 1: Garden Care Plans */}
            <Link
              to="/services"
              search={{ tab: "plans" }}
              className="group press flex items-center justify-between rounded-2xl border border-border/70 bg-card p-4 transition hover:border-primary/40 hover:shadow-card"
            >
              <div className="space-y-1 max-w-[75%]">
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
                  Ongoing Stewardship
                </span>
                <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  Garden Care Plans
                </h4>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  Monthly scheduled visits, soil health &amp; priority care
                </p>
              </div>
              <div className="text-right">
                <span className="font-display text-xs font-bold text-foreground">From ₹1,499</span>
                <span className="block text-[10px] text-muted-foreground">/ month</span>
              </div>
            </Link>

            {/* Service 2: Balcony & Setup */}
            <Link
              to="/services/$slug"
              params={{ slug: "balcony-garden" }}
              className="group press flex items-center justify-between rounded-2xl border border-border/70 bg-card p-4 transition hover:border-primary/40 hover:shadow-card"
            >
              <div className="space-y-1 max-w-[75%]">
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
                  Custom Setup
                </span>
                <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  Balcony &amp; Space Transformation
                </h4>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  Space-friendly arrangements, planter setup &amp; healthy soil
                </p>
              </div>
              <div className="text-right">
                <span className="font-display text-xs font-bold text-foreground">₹1,299</span>
                <span className="block text-[10px] text-muted-foreground">per visit</span>
              </div>
            </Link>

            {/* Service 3: Garden Care */}
            <Link
              to="/services/$slug"
              params={{ slug: "garden-care" }}
              className="group press flex items-center justify-between rounded-2xl border border-border/70 bg-card p-4 transition hover:border-primary/40 hover:shadow-card"
            >
              <div className="space-y-1 max-w-[75%]">
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
                  Maintenance
                </span>
                <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  Garden Maintenance &amp; Nutrition
                </h4>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  Pruning, organic nutrition, pest checks &amp; soil aeration
                </p>
              </div>
              <div className="text-right">
                <span className="font-display text-xs font-bold text-foreground">₹799</span>
                <span className="block text-[10px] text-muted-foreground">per visit</span>
              </div>
            </Link>
          </div>
        </section>

        {/* =========================================================================
            6. SHOP / GARDEN ESSENTIALS — HORIZONTAL REAL PRODUCT CAROUSEL
            ========================================================================= */}
        <section className="space-y-3.5">
          <div className="px-5 sm:px-6 flex items-baseline justify-between">
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-normal tracking-tight text-foreground">
                Garden Essentials
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Plants, tools and organic tonics for your garden
              </p>
            </div>
            <Link
              to="/shop"
              className="text-xs font-semibold text-primary hover:underline flex-none pl-2"
            >
              Shop All →
            </Link>
          </div>

          <div className="flex gap-3 overflow-x-auto px-5 sm:px-6 pb-2 scrollbar-none snap-x snap-mandatory">
            {products.slice(0, 6).map((product) => (
              <Link
                key={product.id}
                to="/shop/$productId"
                params={{ productId: product.id }}
                className="group press flex-none w-44 sm:w-48 snap-start overflow-hidden rounded-2xl border border-border/70 bg-card p-3 text-left transition hover:border-primary/40 hover:shadow-card"
              >
                <div className="relative h-32 w-full overflow-hidden rounded-xl bg-secondary/50">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                  {product.popular && (
                    <span className="absolute top-2 left-2 rounded-full bg-primary/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary-foreground backdrop-blur-xs">
                      Popular
                    </span>
                  )}
                  <button
                    onClick={(e) => handleAddToCart(product, e)}
                    aria-label={`Add ${product.name} to cart`}
                    className="absolute right-2 bottom-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs transition-transform duration-150 hover:scale-110 active:scale-95"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="pt-3 space-y-1">
                  <h4 className="text-xs font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                    {product.name}
                  </h4>
                  <p className="text-[10px] text-muted-foreground line-clamp-1">
                    {product.short}
                  </p>
                  <div className="pt-1 flex items-baseline gap-2">
                    <span className="font-display text-xs font-bold text-foreground">₹{product.price}</span>
                    {product.mrp && product.mrp > product.price && (
                      <span className="text-[10px] text-muted-foreground line-through">
                        ₹{product.mrp}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* =========================================================================
            7. REVIEWS & SOCIAL PROOF — AUTHENTIC CUSTOMER EXPERIENCES
            ========================================================================= */}
        <section className="space-y-3.5">
          <div className="px-5 sm:px-6">
            <h2 className="font-display text-xl sm:text-2xl font-normal tracking-tight text-foreground">
              What Gardeners Say
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Real feedback from My Gardener customers
            </p>
          </div>

          <div className="flex gap-3.5 overflow-x-auto px-5 sm:px-6 pb-2 scrollbar-none snap-x snap-mandatory">
            {reviews.map((r, idx) => (
              <div
                key={idx}
                className="flex-none w-64 sm:w-72 snap-start rounded-2xl border border-border/70 bg-card p-4 space-y-2.5 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] font-semibold text-primary/80 bg-primary/10 px-2 py-0.5 rounded-full">
                    {r.service}
                  </span>
                </div>

                <p className="text-xs leading-relaxed text-foreground/80 italic">
                  "{r.text}"
                </p>

                <div className="pt-1 flex items-center gap-1.5 text-[11px] font-semibold text-foreground">
                  <span>{r.name}</span>
                  <span className="text-muted-foreground/50">·</span>
                  <span className="text-[10px] text-muted-foreground font-normal">
                    Verified Customer
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================================
            8. FINAL INTENTIONAL CTA — BOTANICAL CLOSING
            ========================================================================= */}
        <section className="px-5 sm:px-6">
          <div className="rounded-3xl border border-border/70 bg-card p-6 sm:p-7 text-center space-y-3.5 shadow-2xs">
            <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              MY GARDENER
            </span>
            <h3 className="font-display text-xl sm:text-2xl font-normal tracking-tight text-foreground">
              Ready to take better care of your garden?
            </h3>
            <p className="text-xs sm:text-sm text-foreground/75 max-w-xs mx-auto">
              Book your complimentary on-site garden check or speak with a My Gardener professional today.
            </p>
            <div className="pt-2">
              <Link
                to="/services/$slug/book"
                params={{ slug: "free-garden-check" }}
                className="press inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-xs font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
              >
                <span>Get Free Garden Check</span>
                <span className="rounded-full bg-primary-foreground/15 px-2 py-0.5 text-[10px] font-medium tracking-wide">
                  ₹0
                </span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </Shell>
  );
}

