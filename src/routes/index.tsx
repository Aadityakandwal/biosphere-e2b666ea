import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
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
  ChevronRight,
  Coins,
  MapPin,
  Calendar,
  Leaf,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "My Gardener — Plant Care & Botanical Services" },
      {
        name: "description",
        content:
          "Professional on-site garden checks, digital plant records, and detailed AI plant health diagnostics.",
      },
      { property: "og:title", content: "My Gardener — Plant Care & Botanical Services" },
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
  const points = useProfile((s) => s.points);
  const add = useCart((s) => s.add);
  const [activeOfferIndex, setActiveOfferIndex] = useState(0);

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

  const offers = [
    {
      badge: "FREE GARDEN CHECK",
      title: "A Healthier\nGarden Awaits",
      desc: "Get expert care, personalized advice and a healthier garden — at no cost.",
      cta: isEligibleForFreeCheck ? "Get Free Garden Check" : "View Garden",
      to: isEligibleForFreeCheck ? "/services/$slug/book" : "/garden",
      params: isEligibleForFreeCheck ? { slug: "free-garden-check" } : undefined,
      tag: "₹0",
    },
    {
      badge: "SPECIAL WELCOME",
      title: "20% Off First\nCare Booking",
      desc: "Use promo code BIO20 at checkout for any setup or maintenance service.",
      cta: "Explore Services",
      to: "/services",
      tag: "BIO20",
    },
    {
      badge: "TONIC BUNDLE",
      title: "Buy 2 Tonics,\nGet 1 Free",
      desc: "Stock up on Neerva & BioBloom microbial formulas for thriving plants.",
      cta: "Shop Tonics",
      to: "/shop",
      tag: "BIO3",
    },
  ];

  return (
    <Shell>
      <div className="pb-12 space-y-5 sm:space-y-6">
        {/* =========================================================================
            0. GREETING SECTION — EDITORIAL BOTANICAL GREETING
            ========================================================================= */}
        <section className="px-5 pt-1">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#556B5C]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#18392B] animate-pulse" />
                Botanical Care
              </span>
              <h1 className="font-display text-2xl font-bold tracking-tight text-[#162A1F]">
                Hello{firstName ? ` ${firstName}` : ""}, {timeGreeting.toLowerCase()} 🌿
              </h1>
            </div>
            <Link
              to="/garden"
              className="text-xs font-semibold text-[#18392B] hover:underline"
            >
              My Garden →
            </Link>
          </div>
        </section>

        {/* =========================================================================
            1. HERO BANNER — EDITORIAL PHOTO COMPOSITION MATCHING REFERENCE
            ========================================================================= */}
        <section className="px-5">
          <div className="relative overflow-hidden rounded-[26px] bg-[#EDE8DE] border border-[#E2DDD2] shadow-soft">
            {/* Background botanical imagery with natural gradient fade */}
            <div className="absolute right-0 top-0 bottom-0 w-3/5 sm:w-1/2 overflow-hidden pointer-events-none">
              <img
                src="https://images.unsplash.com/photo-1545241047-6083a3684587?w=800&auto=format&fit=crop&q=80"
                alt="Lush botanical plants and terracotta pot"
                className="h-full w-full object-cover object-center mix-blend-multiply opacity-90 scale-105 transition-transform duration-700 hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#EDE8DE] via-[#EDE8DE]/60 to-transparent" />
            </div>

            <div className="relative z-10 p-5 sm:p-6 max-w-[65%] sm:max-w-[60%] space-y-3">
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.16em] text-[#55695B]">
                {offers[activeOfferIndex].badge}
              </span>

              <h2 className="font-display text-[22px] sm:text-[26px] font-bold leading-[1.15] tracking-tight text-[#183626] whitespace-pre-line">
                {offers[activeOfferIndex].title}
              </h2>

              <p className="text-[11px] sm:text-xs leading-relaxed text-[#526357]">
                {offers[activeOfferIndex].desc}
              </p>

              <div className="pt-1.5 flex items-center gap-2">
                <Link
                  to={offers[activeOfferIndex].to as any}
                  params={offers[activeOfferIndex].params as any}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#18392B] px-4 py-2 text-xs font-semibold text-white shadow-soft transition-all duration-200 hover:bg-[#122D22] active:scale-95"
                >
                  <span>{offers[activeOfferIndex].cta}</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              {/* Offer Pagination Dots */}
              <div className="pt-1 flex items-center gap-1.5">
                {offers.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveOfferIndex(idx)}
                    aria-label={`Show offer ${idx + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      activeOfferIndex === idx ? "w-5 bg-[#18392B]" : "w-1.5 bg-[#C5CEBF]"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            2. MY GARDEN SECTION — BOTANICAL SUMMARY CARD MATCHING REFERENCE
            ========================================================================= */}
        <section className="px-5">
          <Link
            to="/garden"
            className="group block relative overflow-hidden rounded-[24px] bg-[#EBF0E8] border border-[#DCE5DA] p-5 shadow-soft transition-all duration-200 hover:border-[#C0D1BD]"
          >
            {/* Circular foliage cutout on right */}
            <div className="absolute -right-6 -bottom-6 h-36 w-36 overflow-hidden rounded-full bg-[#DEE8DB] pointer-events-none">
              <img
                src="https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=400&auto=format&fit=crop&q=80"
                alt=""
                className="h-full w-full object-cover mix-blend-multiply opacity-85 scale-110 group-hover:scale-125 transition-transform duration-500"
              />
            </div>

            <div className="relative z-10 max-w-[65%] space-y-1">
              <h3 className="font-display text-lg font-bold text-[#183626]">
                My Garden
              </h3>
              <p className="text-xs text-[#526357] leading-relaxed">
                {plants.length > 0
                  ? `${plants.length} plant${plants.length === 1 ? "" : "s"} logged, health records and care history.`
                  : "Your plants, garden records and service history."}
              </p>
              <div className="pt-2 flex items-center gap-1.5 text-xs font-semibold text-[#183626] group-hover:underline">
                <span>View Garden</span>
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
          </Link>
        </section>

        {/* =========================================================================
            3. DUAL STATUS TILES (YOUR CARE PLAN & GREEN POINTS)
            ========================================================================= */}
        <section className="px-5">
          <div className="grid grid-cols-2 gap-3">
            {/* Tile 1: Your Care Plan */}
            <Link
              to="/services"
              search={{ tab: "plans" }}
              className="group flex flex-col justify-between rounded-[22px] bg-[#F2EFE8] border border-[#E5E0D4] p-4 shadow-2xs transition-all duration-200 hover:border-[#CAD4C5]"
            >
              <div className="flex items-start gap-2.5">
                <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-[#DEE7DB] text-[#18392B]">
                  <Leaf className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-display text-xs font-bold text-[#183626] truncate">
                    Your Care Plan
                  </h4>
                  <p className="text-[10px] text-[#55695B] line-clamp-2 mt-0.5 leading-tight">
                    Keep your garden healthy with our expert care.
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-[#183626]">
                <span>View Plan</span>
                <ChevronRight className="h-3.5 w-3.5 text-[#55695B] group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>

            {/* Tile 2: Green Points */}
            <Link
              to="/profile"
              className="group flex flex-col justify-between rounded-[22px] bg-[#F2EFE8] border border-[#E5E0D4] p-4 shadow-2xs transition-all duration-200 hover:border-[#CAD4C5]"
            >
              <div className="flex items-start gap-2.5">
                <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-[#DEE7DB] text-[#18392B]">
                  <Coins className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-display text-xs font-bold text-[#183626] truncate">
                    Green Points
                  </h4>
                  <p className="font-display text-sm font-bold text-[#183626] mt-0.5">
                    {points > 0 ? `${points.toLocaleString()} pts` : "1,250 pts"}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-[#183626]">
                <span>Redeem Now</span>
                <ChevronRight className="h-3.5 w-3.5 text-[#55695B] group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          </div>
        </section>

        {/* =========================================================================
            4. QUICK ACTIONS — 4 CIRCULAR BOTANICAL PODS MATCHING REFERENCE
            ========================================================================= */}
        <section className="px-5 space-y-3">
          <h3 className="font-display text-base font-bold text-[#183626]">
            Quick Actions
          </h3>

          <div className="grid grid-cols-4 gap-2 text-center">
            {/* Pod 1: AI Plant Doctor */}
            <Link
              to="/plant-doctor"
              className="group flex flex-col items-center gap-1.5 press"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#E5ECE5] text-[#18392B] shadow-2xs transition-transform duration-200 group-hover:scale-105 group-hover:bg-[#DBE6DB]">
                <Camera className="h-5 w-5 stroke-[1.8]" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[11px] font-semibold text-[#183626] leading-tight">
                  AI Plant Doctor
                </p>
                <p className="text-[9px] text-[#65796C] leading-none">
                  Check a Plant
                </p>
              </div>
            </Link>

            {/* Pod 2: Book a Service */}
            <Link
              to="/services"
              className="group flex flex-col items-center gap-1.5 press"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#E5ECE5] text-[#18392B] shadow-2xs transition-transform duration-200 group-hover:scale-105 group-hover:bg-[#DBE6DB]">
                <Calendar className="h-5 w-5 stroke-[1.8]" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[11px] font-semibold text-[#183626] leading-tight">
                  Book a Service
                </p>
                <p className="text-[9px] text-[#65796C] leading-none">
                  Expert Care
                </p>
              </div>
            </Link>

            {/* Pod 3: Shop */}
            <Link
              to="/shop"
              className="group flex flex-col items-center gap-1.5 press"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#E5ECE5] text-[#18392B] shadow-2xs transition-transform duration-200 group-hover:scale-105 group-hover:bg-[#DBE6DB]">
                <ShoppingBag className="h-5 w-5 stroke-[1.8]" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[11px] font-semibold text-[#183626] leading-tight">
                  Shop
                </p>
                <p className="text-[9px] text-[#65796C] leading-none">
                  Garden Essentials
                </p>
              </div>
            </Link>

            {/* Pod 4: Find Nearby / Maps */}
            <Link
              to="/bookings"
              className="group flex flex-col items-center gap-1.5 press"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#E5ECE5] text-[#18392B] shadow-2xs transition-transform duration-200 group-hover:scale-105 group-hover:bg-[#DBE6DB]">
                <MapPin className="h-5 w-5 stroke-[1.8]" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[11px] font-semibold text-[#183626] leading-tight">
                  Find Nearby
                </p>
                <p className="text-[9px] text-[#65796C] leading-none">
                  Nurseries &amp; Stores
                </p>
              </div>
            </Link>
          </div>
        </section>

        {/* =========================================================================
            5. EXPLORE OUR SERVICES — EDITORIAL HORIZONTAL LANDSCAPE CARDS
            ========================================================================= */}
        <section className="space-y-3">
          <div className="px-5 flex items-baseline justify-between">
            <h3 className="font-display text-base font-bold text-[#183626]">
              Explore Our Services
            </h3>
            <Link
              to="/services"
              className="text-xs font-semibold text-[#18392B] hover:underline inline-flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="flex gap-3.5 overflow-x-auto px-5 pb-2 scrollbar-none snap-x snap-mandatory">
            {/* Service Card 1: One-Time Services */}
            <Link
              to="/services"
              search={{ tab: "services" }}
              className="group press flex-none w-56 snap-start overflow-hidden rounded-[22px] bg-[#FAF8F3] border border-[#E6E0D4] p-2.5 shadow-2xs transition-all duration-200 hover:border-[#CAD4C5]"
            >
              <div className="h-28 w-full overflow-hidden rounded-2xl bg-[#E5ECE5]">
                <img
                  src="https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=600&auto=format&fit=crop&q=80"
                  alt="Gardener tending to plants"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="pt-3 pb-1 px-1 flex items-center justify-between gap-2">
                <div>
                  <h4 className="font-display text-xs font-bold text-[#183626]">
                    One-Time Services
                  </h4>
                  <p className="text-[10px] text-[#65796C] mt-0.5 line-clamp-1">
                    For specific garden needs
                  </p>
                </div>
                <div className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-[#E5ECE5] text-[#18392B] group-hover:bg-[#18392B] group-hover:text-white transition-colors">
                  <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </Link>

            {/* Service Card 2: Garden Care Plans */}
            <Link
              to="/services"
              search={{ tab: "plans" }}
              className="group press flex-none w-56 snap-start overflow-hidden rounded-[22px] bg-[#FAF8F3] border border-[#E6E0D4] p-2.5 shadow-2xs transition-all duration-200 hover:border-[#CAD4C5]"
            >
              <div className="h-28 w-full overflow-hidden rounded-2xl bg-[#E5ECE5]">
                <img
                  src="https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&auto=format&fit=crop&q=80"
                  alt="Potted plant care in sunlight"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="pt-3 pb-1 px-1 flex items-center justify-between gap-2">
                <div>
                  <h4 className="font-display text-xs font-bold text-[#183626]">
                    Garden Care Plans
                  </h4>
                  <p className="text-[10px] text-[#65796C] mt-0.5 line-clamp-1">
                    Ongoing care &amp; maintenance
                  </p>
                </div>
                <div className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-[#E5ECE5] text-[#18392B] group-hover:bg-[#18392B] group-hover:text-white transition-colors">
                  <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </Link>

            {/* Service Card 3: Setup & Balcony */}
            <Link
              to="/services/$slug"
              params={{ slug: "balcony-garden" }}
              className="group press flex-none w-56 snap-start overflow-hidden rounded-[22px] bg-[#FAF8F3] border border-[#E6E0D4] p-2.5 shadow-2xs transition-all duration-200 hover:border-[#CAD4C5]"
            >
              <div className="h-28 w-full overflow-hidden rounded-2xl bg-[#E5ECE5]">
                <img
                  src="https://images.unsplash.com/photo-1600411833196-7c1f6b1a8b90?w=600&auto=format&fit=crop&q=80"
                  alt="Balcony planter setup"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="pt-3 pb-1 px-1 flex items-center justify-between gap-2">
                <div>
                  <h4 className="font-display text-xs font-bold text-[#183626]">
                    Balcony Transformation
                  </h4>
                  <p className="text-[10px] text-[#65796C] mt-0.5 line-clamp-1">
                    Custom planter setups
                  </p>
                </div>
                <div className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-[#E5ECE5] text-[#18392B] group-hover:bg-[#18392B] group-hover:text-white transition-colors">
                  <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* =========================================================================
            6. CATEGORY DISCOVERY TILES
            ========================================================================= */}
        <section className="space-y-3">
          <div className="px-5">
            <h3 className="font-display text-base font-bold text-[#183626]">
              Explore Categories
            </h3>
          </div>

          <div className="flex gap-3 overflow-x-auto px-5 pb-2 scrollbar-none snap-x snap-mandatory">
            {categoryCollections.map((cat) => (
              <Link
                key={cat.id}
                to={cat.to as any}
                search={cat.search as any}
                className="group press flex-none w-32 sm:w-36 snap-start overflow-hidden rounded-[20px] bg-[#FAF8F3] border border-[#E6E0D4] p-2 text-left transition hover:border-[#CAD4C5]"
              >
                <div className="relative h-20 sm:h-24 w-full overflow-hidden rounded-xl bg-[#E5ECE5]">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="pt-2 pb-0.5 px-1">
                  <p className="font-display text-xs font-bold tracking-tight text-[#183626] group-hover:text-[#18392B]">
                    {cat.name}
                  </p>
                  <p className="text-[9px] text-[#65796C] line-clamp-1 mt-0.5">
                    {cat.tagline}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* =========================================================================
            7. GARDEN ESSENTIALS (SHOP CAROUSEL)
            ========================================================================= */}
        <section className="space-y-3">
          <div className="px-5 flex items-baseline justify-between">
            <div>
              <h3 className="font-display text-base font-bold text-[#183626]">
                Garden Essentials
              </h3>
              <p className="text-[11px] text-[#65796C]">
                BioVelocity tonics, potting blends &amp; tools
              </p>
            </div>
            <Link
              to="/shop"
              className="text-xs font-semibold text-[#18392B] hover:underline inline-flex items-center gap-1"
            >
              <span>Shop All</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="flex gap-3.5 overflow-x-auto px-5 pb-2 scrollbar-none snap-x snap-mandatory">
            {products.slice(0, 6).map((product) => (
              <Link
                key={product.id}
                to="/shop/$productId"
                params={{ productId: product.id }}
                className="group press flex-none w-40 sm:w-44 snap-start overflow-hidden rounded-[22px] bg-[#FAF8F3] border border-[#E6E0D4] p-2.5 text-left transition hover:border-[#CAD4C5]"
              >
                <div className="relative h-32 w-full overflow-hidden rounded-xl bg-[#E5ECE5]">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                  {product.popular && (
                    <span className="absolute top-2 left-2 rounded-full bg-[#18392B] px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white">
                      Popular
                    </span>
                  )}
                  <button
                    onClick={(e) => handleAddToCart(product, e)}
                    aria-label={`Add ${product.name} to cart`}
                    className="absolute right-2 bottom-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#18392B] text-white shadow-soft transition-transform duration-150 hover:scale-110 active:scale-95"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="pt-2.5 px-0.5 space-y-0.5">
                  <h4 className="font-display text-xs font-bold text-[#183626] line-clamp-1 group-hover:text-[#18392B]">
                    {product.name}
                  </h4>
                  <p className="text-[10px] text-[#65796C] line-clamp-1">
                    {product.short}
                  </p>
                  <div className="pt-1 flex items-baseline gap-1.5">
                    <span className="font-display text-xs font-bold text-[#183626]">
                      ₹{product.price}
                    </span>
                    {product.mrp && product.mrp > product.price && (
                      <span className="text-[9px] text-[#8A9C90] line-through">
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
            8. WHAT GARDENERS SAY (REVIEWS & RATINGS)
            ========================================================================= */}
        <section className="space-y-3">
          <div className="px-5">
            <h3 className="font-display text-base font-bold text-[#183626]">
              What Gardeners Say
            </h3>
            <p className="text-[11px] text-[#65796C]">
              Authentic feedback from verified customers
            </p>
          </div>

          <div className="flex gap-3 overflow-x-auto px-5 pb-2 scrollbar-none snap-x snap-mandatory">
            {reviews.map((r, idx) => (
              <div
                key={idx}
                className="flex-none w-64 snap-start rounded-[22px] bg-[#FAF8F3] border border-[#E6E0D4] p-4 space-y-2 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                  <span className="text-[9px] font-semibold text-[#18392B] bg-[#E5ECE5] px-2 py-0.5 rounded-full">
                    {r.service}
                  </span>
                </div>

                <p className="text-xs leading-relaxed text-[#2C4234] italic font-serif">
                  "{r.text}"
                </p>

                <div className="pt-1 flex items-center gap-1.5 text-[10px] font-bold text-[#183626]">
                  <span>{r.name}</span>
                  <span className="text-[#8A9C90]">·</span>
                  <span className="text-[#65796C] font-normal">Verified Customer</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================================
            9. FINAL BOTANICAL CTA
            ========================================================================= */}
        <section className="px-5">
          <div className="rounded-[26px] bg-[#EDE8DE] border border-[#E2DDD2] p-6 text-center space-y-3 shadow-soft">
            <span className="inline-block text-[9px] font-bold uppercase tracking-[0.2em] text-[#55695B]">
              MY GARDENER
            </span>
            <h3 className="font-display text-xl font-bold tracking-tight text-[#183626]">
              Ready to take better care of your garden?
            </h3>
            <p className="text-xs text-[#526357] max-w-xs mx-auto">
              Book your complimentary on-site garden check or speak with a My Gardener professional today.
            </p>
            <div className="pt-1">
              <Link
                to="/services/$slug/book"
                params={{ slug: "free-garden-check" }}
                className="inline-flex items-center gap-2 rounded-full bg-[#18392B] px-5 py-2.5 text-xs font-semibold text-white shadow-soft transition-all duration-200 hover:bg-[#122D22]"
              >
                <span>Get Free Garden Check</span>
                <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[9px] font-bold">
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


