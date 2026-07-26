import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { services, products, reviews, seasonalTips } from "@/lib/data";
import { Search, Camera, Upload, Sparkles, Star, ArrowRight, Clock, Leaf, Sprout, Hammer, Droplets, Flower2 } from "lucide-react";
import { useCart } from "@/lib/stores";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Biosphere — Plant care, delivered" },
      { name: "description", content: "AI plant doctor, gardening services, and biovelocity products in one app." },
      { property: "og:title", content: "Biosphere — Plant care, delivered" },
      { property: "og:description", content: "AI plant doctor, gardening services, and biovelocity products in one app." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function SectionRow({ title, href }: { title: string; href?: string }) {
  return (
    <div className="mb-3 mt-7 flex items-center justify-between">
      <h2 className="font-display text-xl font-semibold tracking-tight">{title}</h2>
      {href && (
        <Link to={href} className="text-sm font-semibold text-primary hover:underline">View All</Link>
      )}
    </div>
  );
}

function Home() {
  const [scan, setScan] = useState<null | { plant: string; issue: string; solution: string }>(null);
  const [scanning, setScanning] = useState(false);
  const [showDoctor, setShowDoctor] = useState(false);
  const add = useCart((s) => s.add);
  const tip = seasonalTips[new Date().getDate() % seasonalTips.length];

  const runScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScan({
        plant: "Money Plant (Epipremnum aureum)",
        issue: "Mild nitrogen deficiency & early root stress. Leaves show yellowing between veins.",
        solution: "Foliar spray with a microbial bio-tonic, improve drainage, and reduce watering frequency to every 5–6 days.",
      });
      setScanning(false);
    }, 1200);
  };

  const hero = services.find((s) => s.slug === "balcony-garden")!;
  const featured = services.find((s) => s.slug === "garden-care")!;
  const secondary = [services.find((s) => s.slug === "lawn-garden")!, services.find((s) => s.slug === "basic-maintenance")!];

  const catTiles = [
    { name: "Plants", to: "/shop", Icon: Sprout },
    { name: "Tools", to: "/shop", Icon: Hammer },
    { name: "Soil", to: "/shop", Icon: Droplets },
    { name: "Seeds", to: "/shop", Icon: Flower2 },
  ];

  return (
    <Shell>
      {/* Search */}
      <label className="mt-2 flex items-center gap-3 rounded-full border border-border bg-card px-5 py-3.5 shadow-soft transition focus-within:border-primary/40 focus-within:shadow-elevated">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          placeholder="Find services..."
          className="w-full border-0 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
        />
      </label>

      {/* Seasonal promo hero */}
      <div className="group relative mt-5 overflow-hidden rounded-3xl shadow-elevated">
        <img src={hero.image} alt="" className="h-52 w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.24_0.05_155)] via-[oklch(0.24_0.05_155)]/80 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center gap-2 p-5 text-primary-foreground">
          <p className="text-xs font-bold uppercase tracking-[0.18em]">Seasonal Promo</p>
          <p className="font-display text-3xl font-bold leading-tight">Spring Garden Refresh</p>
          <div className="mt-2 flex items-center gap-3">
            <span className="rounded-full bg-leaf/30 px-3 py-1 text-xs font-bold backdrop-blur-sm">20% OFF</span>
            <Link to="/services" className="inline-flex items-center gap-1.5 text-sm font-semibold">
              Book Now <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* AI Plant Doctor banner */}
      <Link
        to="/plant-doctor"
        className="mt-4 flex w-full items-center gap-4 rounded-3xl bg-[oklch(0.26_0.05_155)] p-4 text-left text-primary-foreground shadow-elevated press hover:shadow-glow"
      >
        <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-leaf text-leaf-foreground">
          <Leaf className="h-6 w-6" />
        </span>
        <span className="flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-display text-lg font-semibold">AI Plant Doctor</span>
            <span className="rounded-full bg-leaf/25 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">Analyze Plant</span>
          </span>
          <span className="mt-0.5 block text-sm opacity-75">Instant health diagnosis & care plans</span>
        </span>
        <ArrowRight className="h-5 w-5 opacity-70" />
      </Link>


      {/* Shop categories */}
      <SectionRow title="Shop Categories" href="/shop" />
      <div className="grid grid-cols-4 gap-3">
        {catTiles.map(({ name, to, Icon }) => (
          <Link
            key={name}
            to={to}
            className="flex flex-col items-center gap-2 rounded-3xl border border-border bg-card py-4 shadow-soft transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-elevated press"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-primary">
              <Icon className="h-5 w-5" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/80">{name}</span>
          </Link>
        ))}
      </div>

      {/* Popular services */}
      <SectionRow title="Popular Services" href="/services" />
      <Card className="flex gap-0 overflow-hidden p-0 shadow-soft transition hover:shadow-elevated">
        <img src={featured.image} alt="" className="h-auto w-28 flex-none object-cover" />
        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-start justify-between gap-2">
            <p className="font-display text-lg font-semibold leading-snug">{featured.name}</p>
            <p className="whitespace-nowrap text-sm font-bold text-primary">₹{featured.price}</p>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{featured.description}</p>
          <Link
            to="/services/$slug"
            params={{ slug: featured.slug }}
            className="mt-3 inline-flex w-fit items-center rounded-full border border-border px-4 py-1.5 text-sm font-semibold transition hover:border-primary hover:bg-primary hover:text-primary-foreground press"
          >
            Book Now
          </Link>
        </div>
      </Card>

      <div className="mt-3 grid grid-cols-2 gap-3">
        {secondary.map((s) => (
          <Link key={s.slug} to="/services/$slug" params={{ slug: s.slug }}>
            <Card className="h-full p-4 shadow-soft transition hover:-translate-y-1 hover:shadow-elevated">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-primary">
                <Sprout className="h-4 w-4" />
              </span>
              <p className="mt-3 font-display text-base font-semibold leading-tight">{s.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">From ₹{s.price}</p>
            </Card>
          </Link>
        ))}
      </div>

      {/* Seasonal tips */}
      <SectionRow title="Seasonal Tips" />
      <div className="flex items-center gap-4 rounded-3xl bg-muted p-4">
        <div className="flex-1">
          <span className="rounded-full bg-leaf/25 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">Season Care</span>
          <p className="mt-2 font-display text-base font-semibold leading-snug">{tip}</p>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" /> 4 min read
          </p>
        </div>
        <img
          src="https://images.unsplash.com/photo-1483794344563-d27a8d18014e?w=400"
          alt=""
          className="h-24 w-24 flex-none rounded-2xl object-cover"
        />
      </div>

      {/* Reviews */}
      <SectionRow title="Recent Reviews" />
      <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2">
        {reviews.map((r) => (
          <Card key={r.name} className="min-w-[72%] snap-start p-4 shadow-soft">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold text-primary">
                {r.name.charAt(0)}
              </span>
              <p className="font-semibold">{r.name}</p>
            </div>
            <div className="mt-2 flex items-center gap-0.5 text-primary">
              {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">"{r.text}"</p>
            <p className="mt-3 text-xs text-muted-foreground/80">{r.service}</p>
          </Card>
        ))}
      </div>
    </Shell>
  );
}
