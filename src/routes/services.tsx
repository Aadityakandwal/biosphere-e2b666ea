import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/Shell";
import { services } from "@/lib/data";
import { ChevronRight, Video, ClipboardCheck, FlaskConical } from "lucide-react";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Biosphere" },
      { name: "description", content: "Browse plant setup, care, and consultation services." },
      { property: "og:title", content: "Services — Biosphere" },
      { property: "og:description", content: "Browse plant setup, care, and consultation services." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ServicesPage,
});

const taglines: Record<string, string> = {
  "indoor-setup": "Homes & offices",
  "outdoor-setup": "Backyards & entries",
  "balcony-garden": "Small space design",
  "terrace-garden": "Rooftop transformation",
  "kitchen-garden": "Herbs & vegetables",
  "basic-maintenance": "Watering, pruning, and repotting services.",
  "garden-care": "Fertilizer, pest control, and health check-ups.",
  "lawn-garden": "Mowing, hedge trimming, and weed removal.",
  "video-consult": "Live 1-on-1",
  "garden-inspection": "In-person visit",
  "soil-testing": "Expert nutrient analysis",
};

const chips = [
  { id: "all", label: "Explore All" },
  { id: "setup", label: "Setups" },
  { id: "care", label: "Care" },
  { id: "consult", label: "Consultation" },
];

function SectionTitle({ title, count }: { title: string; count: number }) {
  return (
    <div className="mb-4 mt-9 border-b border-border pb-2">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-2xl font-semibold tracking-tight">{title}</h2>
        <span className="shrink-0 text-[11px] font-semibold tracking-widest text-muted-foreground">
          {String(count).padStart(2, "0")} SERVICES
        </span>
      </div>
    </div>
  );
}

function ServicesPage() {
  const [tab, setTab] = useState("all");
  const show = (cat: string) => tab === "all" || tab === cat;

  const setup = services.filter((s) => s.category === "setup");
  const care = services.filter((s) => s.category === "care");
  const consult = services.filter((s) => s.category === "consult");

  const featured = setup[0];
  const restSetup = setup.slice(1);
  const soil = consult.find((s) => s.slug === "soil-testing");
  const consultTiles = consult.filter((s) => s.slug !== "soil-testing");
  const consultIcons = [Video, ClipboardCheck];

  return (
    <Shell>
      {/* Promo hero */}
      <div className="relative mt-3 overflow-hidden rounded-3xl shadow-elevated">
        <img
          src="https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=900"
          alt="Lush greenhouse full of plants"
          className="h-52 w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/75 to-primary/10" />
        <div className="absolute inset-0 flex flex-col justify-center p-5">
          <span className="w-fit rounded-full bg-primary-foreground/15 px-3 py-1 text-[10px] font-bold tracking-widest text-primary-foreground backdrop-blur-sm">
            SPECIAL OFFER
          </span>
          <p className="mt-3 max-w-[70%] font-display text-3xl font-bold leading-tight text-primary-foreground">
            20% Off Maintenance
          </p>
          <p className="mt-1 max-w-[65%] text-sm text-primary-foreground/85">
            Premium care for your urban jungle.
          </p>
        </div>
      </div>

      {/* Category chips */}
      <div className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {chips.map((c) => (
          <button
            key={c.id}
            onClick={() => setTab(c.id)}
            className={`press shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
              tab === c.id
                ? "bg-primary text-primary-foreground shadow-glow"
                : "border border-border bg-card text-foreground/80 shadow-soft hover:border-primary/30"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Plant Setup */}
      {show("setup") && (
        <section>
          <SectionTitle title="Plant Setup" count={setup.length} />
          <Link
            to="/services/$slug"
            params={{ slug: featured.slug }}
            className="press group relative block overflow-hidden rounded-3xl shadow-elevated"
          >
            <img src={featured.image} alt={featured.name} className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-x-4 bottom-4 flex items-center gap-3 rounded-full bg-card/90 px-5 py-3 shadow-soft backdrop-blur-md">
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{featured.name}</p>
                <p className="truncate text-xs text-muted-foreground">{taglines[featured.slug]}</p>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-foreground/70" />
            </div>
          </Link>

          <div className="mt-3 grid grid-cols-2 gap-3">
            {restSetup.map((s) => (
              <Link
                key={s.slug}
                to="/services/$slug"
                params={{ slug: s.slug }}
                className="surface surface-hover press flex flex-col rounded-3xl p-4"
              >
                <p className="text-sm font-semibold leading-snug">{s.name.replace(" Setup", "")}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{taglines[s.slug]}</p>
                <span className="mt-3 text-[11px] font-bold tracking-widest text-foreground">VIEW DETAILS</span>
              </Link>
            ))}
          </div>
          <p className="mt-3 text-center text-xs italic text-muted-foreground">more setup services coming soon…</p>
        </section>
      )}

      {/* Care & Maintenance */}
      {show("care") && (
        <section>
          <SectionTitle title="Care & Maintenance" count={care.length} />
          <div className="space-y-3">
            {care.map((s) => (
              <div key={s.slug} className="surface surface-hover flex items-center gap-4 rounded-3xl p-4">
                <img src={s.image} alt={s.name} className="h-16 w-16 shrink-0 rounded-full object-cover" />
                <div className="min-w-0 flex-1">
                  <Link to="/services/$slug" params={{ slug: s.slug }} className="block">
                    <p className="font-semibold leading-snug">{s.name}</p>
                    <p className="mt-0.5 text-sm leading-snug text-muted-foreground">{taglines[s.slug]}</p>
                  </Link>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <p className="font-display text-xl font-bold">₹{s.price}</p>
                    <Link
                      to="/services/$slug/book"
                      params={{ slug: s.slug }}
                      className="press rounded-full bg-primary px-5 py-2 text-[11px] font-bold tracking-widest text-primary-foreground shadow-soft hover:shadow-glow"
                    >
                      BOOK
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Consultation */}
      {show("consult") && (
        <section className="pb-6">
          <SectionTitle title="Consultation" count={consult.length} />
          <div className="grid grid-cols-2 gap-3">
            {consultTiles.map((s, i) => {
              const Icon = consultIcons[i] ?? Video;
              return (
                <Link
                  key={s.slug}
                  to="/services/$slug"
                  params={{ slug: s.slug }}
                  className="surface surface-hover press rounded-3xl p-4"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary">
                    <Icon className="h-5 w-5 text-primary" />
                  </span>
                  <p className="mt-4 font-semibold leading-snug">{s.name.replace(" Consultation", " Call").replace("Garden Inspection", "Inspection")}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{taglines[s.slug]}</p>
                  <p className="mt-2 font-semibold">₹{s.price}</p>
                </Link>
              );
            })}
          </div>

          {soil && (
            <Link
              to="/services/$slug"
              params={{ slug: soil.slug }}
              className="press mt-3 flex items-center gap-3 rounded-3xl bg-secondary/70 p-4 shadow-soft transition hover:shadow-elevated"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-card">
                <FlaskConical className="h-5 w-5 text-primary" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-primary">{soil.name}</p>
                <p className="truncate text-xs text-muted-foreground">{taglines[soil.slug]}</p>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-primary" />
            </Link>
          )}
        </section>
      )}
    </Shell>
  );
}
