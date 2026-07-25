import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Shell, SectionHeader } from "@/components/Shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { services, categories, offers } from "@/lib/data";
import { Search, SlidersHorizontal, Star } from "lucide-react";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Biosphere" },
      { name: "description", content: "Browse plant setup, care, and consultation services." },
      { property: "og:title", content: "Services — Biosphere" },
      { property: "og:description", content: "Browse plant setup, care, and consultation services." },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const [q, setQ] = useState("");
  const [maxPrice, setMaxPrice] = useState(3000);
  const [minRating, setMinRating] = useState(0);

  const filtered = services.filter(s =>
    s.name.toLowerCase().includes(q.toLowerCase()) &&
    s.price <= maxPrice &&
    s.rating >= minRating
  );

  return (
    <Shell title="Services">
      <div className="mt-3 flex items-center gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search services…" className="border-0 bg-transparent p-0 focus-visible:ring-0" />
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon"><SlidersHorizontal className="h-4 w-4" /></Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[70vh]">
            <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
            <div className="mt-4 space-y-6">
              <div>
                <p className="mb-2 text-sm font-medium">Max price: ₹{maxPrice}</p>
                <Slider value={[maxPrice]} min={200} max={3500} step={100} onValueChange={(v) => setMaxPrice(v[0])} />
              </div>
              <div>
                <p className="mb-2 text-sm font-medium">Min rating: {minRating}</p>
                <Slider value={[minRating]} min={0} max={5} step={0.5} onValueChange={(v) => setMinRating(v[0])} />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <SectionHeader title="Service offers" />
      <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1">
        {offers.slice(0, 2).map((o) => (
          <div key={o.id} className={`min-w-[75%] snap-start rounded-2xl ${o.tint} p-4`}>
            <p className="font-display text-lg font-semibold">{o.title}</p>
            <p className="mt-1 text-xs">Code <span className="font-mono font-semibold">{o.code}</span></p>
          </div>
        ))}
      </div>

      {categories.map((c) => {
        const list = filtered.filter((s) => s.category === c.id);
        if (!list.length) return null;
        return (
          <div key={c.id}>
            <SectionHeader title={`${c.emoji} ${c.name}`} />
            <div className="space-y-3">
              {list.map((s) => (
                <Link key={s.slug} to="/services/$slug" params={{ slug: s.slug }}>
                  <Card className="flex gap-3 overflow-hidden p-0">
                    <img src={s.image} alt="" className="h-24 w-24 flex-none object-cover" />
                    <div className="flex flex-1 flex-col justify-center p-3">
                      <p className="font-medium">{s.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Star className="h-3 w-3 fill-current text-yellow-500" /> {s.rating} · {s.duration}
                      </div>
                      <p className="mt-1 text-sm font-semibold">from ₹{s.price}</p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
            {c.id === "setup" && (
              <p className="mt-3 text-center text-xs italic text-muted-foreground">more setup services coming soon…</p>
            )}
          </div>
        );
      })}

      <SectionHeader title="All services" />
      <div className="space-y-3 pb-6">
        {filtered.map((s) => (
          <Link key={s.slug} to="/services/$slug" params={{ slug: s.slug }} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
            <span className="text-2xl">{s.emoji}</span>
            <div className="flex-1">
              <p className="font-medium">{s.name}</p>
              <p className="text-xs text-muted-foreground">₹{s.price} · {s.duration}</p>
            </div>
          </Link>
        ))}
      </div>
    </Shell>
  );
}
