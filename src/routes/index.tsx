import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Shell, SectionHeader } from "@/components/Shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { services, products, offers, reviews, seasonalTips, categories } from "@/lib/data";
import { Search, Camera, Upload, Sparkles, Video, Star, Sun } from "lucide-react";
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

function Home() {
  const [scan, setScan] = useState<null | { plant: string; issue: string; solution: string }>(null);
  const [scanning, setScanning] = useState(false);
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

  const popular = [services.find(s => s.slug === "balcony-garden")!, services.find(s => s.slug === "basic-maintenance")!, services.find(s => s.slug === "video-consult")!];
  const catTiles = [
    { name: "Plants", to: "/shop", tint: "bg-leaf/15", emoji: "🪴" },
    { name: "Tools", to: "/shop", tint: "bg-accent/40", emoji: "🛠️" },
    { name: "Biovelocity", to: "/shop", tint: "bg-secondary", emoji: "🧪" },
    { name: "Pots", to: "/shop", tint: "bg-sand", emoji: "🏺" },
  ];

  return (
    <Shell>
      {/* Search */}
      <div className="mt-2 flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2 shadow-sm">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search services or products…" className="border-0 bg-transparent p-0 focus-visible:ring-0" />
      </div>

      {/* Offers */}
      <SectionHeader title="Offers for you" />
      <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2">
        {offers.map((o) => (
          <div
            key={o.id}
            className={`group relative min-w-[82%] snap-start overflow-hidden rounded-3xl bg-gradient-to-br ${o.gradient} p-5 text-white shadow-elevated transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-glow`}
          >
            <div className="absolute -right-4 -top-4 text-7xl opacity-20 transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110">
              {o.emoji}
            </div>
            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium backdrop-blur-sm">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                Limited time
              </span>
              <p className={`mt-3 font-display text-xl font-bold leading-tight ${o.text}`}>{o.title}</p>
              <p className={`mt-1 text-sm opacity-90 ${o.text}`}>{o.subtitle}</p>
              <div className="mt-4 flex items-center gap-1 text-sm font-semibold">
                Claim now
                <svg className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Plant Doctor */}
      <SectionHeader title="AI Plant Doctor" />
      <Card className="overflow-hidden p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-medium">Diagnose in seconds</p>
            <p className="text-sm text-muted-foreground">Upload a leaf photo — get a diagnosis and a Biovelocity solution.</p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={runScan} disabled={scanning}><Camera className="mr-1 h-4 w-4" /> Take photo</Button>
          <Button onClick={runScan} disabled={scanning}><Upload className="mr-1 h-4 w-4" /> Upload</Button>
        </div>
        {scanning && <p className="mt-3 animate-pulse text-center text-sm text-muted-foreground">Analyzing your plant…</p>}
        {scan && (
          <div className="mt-4 space-y-3">
            <div className="rounded-xl bg-muted p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Diagnosis</p>
              <p className="mt-1 text-sm font-medium">{scan.plant}</p>
              <p className="mt-1 text-sm">{scan.issue}</p>
            </div>
            <div className="rounded-xl bg-leaf/10 p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Recommended treatment</p>
              <p className="mt-1 text-sm">{scan.solution}</p>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border p-3">
              <img src={products[0].image} alt="Neerva" className="h-14 w-14 rounded-lg object-cover" />
              <div className="flex-1">
                <p className="text-sm font-medium">{products[0].name}</p>
                <p className="text-xs text-muted-foreground">Recommended for your plant</p>
                <p className="text-sm font-semibold">₹{products[0].price}</p>
              </div>
              <Button size="sm" onClick={() => { add({ id: products[0].id, name: products[0].name, price: products[0].price, image: products[0].image }); toast.success("Added to cart"); }}>Add</Button>
            </div>
          </div>
        )}
      </Card>

      {/* Virtual botanist */}
      <SectionHeader title="Virtual Botanist" />
      <Link to="/consult">
        <Card className="flex items-center gap-3 p-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <Video className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-medium">Book a video consultation</p>
            <p className="text-sm text-muted-foreground">30-min session with a certified expert</p>
          </div>
          <Badge variant="secondary">from ₹299</Badge>
        </Card>
      </Link>

      {/* Shop categories */}
      <SectionHeader title="Shop by category" actionHref="/shop" />
      <div className="grid grid-cols-4 gap-2">
        {catTiles.map((c) => (
          <Link key={c.name} to={c.to} className={`flex flex-col items-center gap-1 rounded-2xl ${c.tint} p-3 text-center`}>
            <span className="text-2xl">{c.emoji}</span>
            <span className="text-xs font-medium">{c.name}</span>
          </Link>
        ))}
      </div>

      {/* Popular services */}
      <SectionHeader title="Popular services" actionHref="/services" />
      <div className="space-y-3">
        {popular.map((s) => (
          <Link key={s.slug} to="/services/$slug" params={{ slug: s.slug }}>
            <Card className="flex gap-3 overflow-hidden p-0">
              <img src={s.image} alt="" className="h-24 w-24 flex-none object-cover" />
              <div className="flex flex-1 flex-col justify-center p-3">
                <p className="font-medium">{s.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Star className="h-3 w-3 fill-current text-yellow-500" /> {s.rating} ({s.reviews}) · {s.duration}
                </div>
                <p className="mt-1 text-sm font-semibold">₹{s.price}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Seasonal tips */}
      <SectionHeader title="Seasonal tip" />
      <Card className="flex items-start gap-3 p-4">
        <Sun className="mt-0.5 h-5 w-5 text-yellow-500" />
        <p className="text-sm">{tip}</p>
      </Card>

      {/* Reviews */}
      <SectionHeader title="What people say" />
      <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2">
        {reviews.map((r) => (
          <Card key={r.name} className="min-w-[80%] snap-start p-4">
            <div className="flex items-center gap-1 text-yellow-500">
              {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}
            </div>
            <p className="mt-2 text-sm leading-relaxed">{r.text}</p>
            <p className="mt-3 text-xs text-muted-foreground">— {r.name} · {r.service}</p>
          </Card>
        ))}
      </div>
    </Shell>
  );
}
