import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/Shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { services, reviews } from "@/lib/data";
import { Clock, Star, ArrowLeft, ArrowRight, Quote } from "lucide-react";

export const Route = createFileRoute("/services/$slug/")({
  loader: ({ params }) => {
    const s = services.find((x) => x.slug === params.slug);
    if (!s) throw notFound();
    return { service: s };
  },
  head: ({ params, loaderData }) => ({
    meta: [
      { title: `${loaderData?.service.name ?? "Service"} — My Gardener` },
      { name: "description", content: (loaderData?.service.description ?? "My Gardener service").slice(0, 155) },
      { property: "og:title", content: `${loaderData?.service.name ?? "Service"} — My Gardener` },
      { property: "og:description", content: (loaderData?.service.description ?? "").slice(0, 155) },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `https://biosphere.app/services/${params.slug}` },
      { name: "twitter:card", content: "summary_large_image" },
      ...(loaderData?.service.image ? [
        { property: "og:image", content: loaderData.service.image },
        { name: "twitter:image", content: loaderData.service.image },
      ] : []),
    ],
    links: [{ rel: "canonical", href: `https://biosphere.app/services/${params.slug}` }],
    scripts: loaderData?.service
      ? [
          {
            type: "application/ld+json",
            children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Service",
              name: loaderData.service.name,
              description: loaderData.service.description,
              image: loaderData.service.image,
              provider: { "@type": "Organization", name: "My Garden" },
              offers: {
                "@type": "Offer",
                price: loaderData.service.price,
                priceCurrency: "INR",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: loaderData.service.rating,
                reviewCount: loaderData.service.reviews,
              },
            }),
          },
        ]
      : [],
  }),
  component: ServiceDetail,
});

type UnitField = { id: string; label: string; price: number };

const UNIT_PRICES: Record<string, UnitField[]> = {
  "indoor-setup": [
    { id: "plants", label: "Indoor plants", price: 200 },
    { id: "pots", label: "Pots", price: 200 },
    { id: "grill", label: "Grill / plant stand", price: 1500 },
    { id: "lights", label: "Grow lights", price: 600 },
    { id: "soil", label: "Healthy soil (bags)", price: 200 },
  ],
  "outdoor-setup": [
    { id: "plants", label: "Outdoor plants", price: 150 },
    { id: "pots", label: "Pots", price: 200 },
    { id: "grill", label: "Grill / plant stand", price: 1500 },
    { id: "lights", label: "Grow lights", price: 0 },
    { id: "soil", label: "Healthy soil (bags)", price: 200 },
  ],
  "kitchen-garden": [
    { id: "plants", label: "Vegetable / herb plants", price: 70 },
    { id: "pots", label: "Grow bags / pots", price: 100 },
    { id: "grill", label: "Stand", price: 800 },
    { id: "soil", label: "Healthy soil (bags)", price: 200 },
  ],
};

function ServiceDetail() {
  const { service } = Route.useLoaderData() as { service: import("@/lib/data").Service };
  const [picked, setPicked] = useState<string[]>([]);
  const [pkgId, setPkgId] = useState<string | undefined>(service.packages?.[0]?.id);
  const [custom, setCustom] = useState<Record<string, string>>({});
  const [remarks, setRemarks] = useState("");
  const unitFields = UNIT_PRICES[service.slug];
  const isCustom = pkgId === "custom";
  const pkg = service.packages?.find((p) => p.id === pkgId);
  const extra = service.subs?.filter((s) => picked.includes(s.id)).reduce((n: number, s) => n + s.price, 0) ?? 0;
  const qty = (id: string) => Math.max(0, parseInt(custom[id] ?? "", 10) || 0);
  const customTotal = (unitFields ?? []).reduce((n, f) => n + qty(f.id) * f.price, 0);
  const base = isCustom ? customTotal : pkg ? pkg.price : service.price;
  const total = base + extra;
  const customSummary = isCustom
    ? [
        ...(unitFields ?? []).filter((f) => qty(f.id) > 0).map((f) => `${f.label} x${qty(f.id)}`),
        remarks.trim() && `Remarks: ${remarks.trim()}`,
      ].filter(Boolean).join(" · ")
    : "";


  return (
    <Shell>
      <div className="px-5 sm:px-6 pt-2 pb-16 space-y-6">
        <div>
          <Link
            to="/services"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Services</span>
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border/70 bg-secondary">
          <img
            src={service.image}
            alt={service.name}
            className="h-56 w-full object-cover object-center"
          />
        </div>

        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <span className="inline-block text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
              {service.category === "setup" ? "Plant Setup" : service.category === "care" ? "Plant Care" : "Consultation"}
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-normal leading-tight tracking-tight text-foreground">
              {service.name}
            </h1>
            <div className="flex items-center gap-3 text-xs text-muted-foreground pt-0.5">
              <span className="flex items-center gap-1 font-medium text-foreground">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                {service.rating} ({service.reviews} reviews)
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {service.duration}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="font-display text-2xl font-normal text-primary">
              {service.price === 0 ? "FREE" : `₹${base.toLocaleString("en-IN")}`}
            </p>
            <p className="text-[10px] text-muted-foreground">{pkg ? "starting price" : "base price"}</p>
          </div>
        </div>

        <p className="text-xs sm:text-sm leading-relaxed text-foreground/75 font-normal">
          {service.description}
        </p>

        {(service.packages || unitFields) && (
          <div className="space-y-3 pt-2">
            <div>
              <h2 className="font-display text-xl font-normal tracking-tight text-foreground">
                Choose your space
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Pick a ready package or build your own — final price is confirmed after the site survey.
              </p>
            </div>

            <div className="space-y-3">
              {(service.packages ?? []).map((p) => {
                const active = p.id === pkgId;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPkgId(active ? undefined : p.id)}
                    className={`press w-full rounded-2xl border p-4 text-left transition-all ${
                      active
                        ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/20"
                        : "border-border/70 bg-card hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold text-foreground">{p.name}</p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">{p.includes.join(" · ")}</p>
                      </div>
                      <div className="flex-none text-right">
                        <p className="text-xs font-bold text-foreground">
                          ₹{p.price.toLocaleString("en-IN")}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          to ₹{p.priceMax.toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {p.includes.map((inc) => (
                        <span
                          key={inc}
                          className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-foreground/80"
                        >
                          {inc}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}

              {unitFields && (
                <button
                  type="button"
                  onClick={() => setPkgId(isCustom ? undefined : "custom")}
                  className={`press w-full rounded-2xl border p-4 text-left transition-all ${
                    isCustom
                      ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/20"
                      : "border-dashed border-border/80 bg-card hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-foreground">Customized setup</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        Pick your own quantities — priced per unit.
                      </p>
                    </div>
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-foreground/80">
                      Pay per unit
                    </span>
                  </div>
                </button>
              )}

              {isCustom && unitFields && (
                <div className="rounded-2xl border border-border/70 bg-card p-4 space-y-3">
                  <p className="text-xs font-semibold text-foreground">Build your setup</p>
                  {unitFields.map((f) => (
                    <div key={f.id} className="flex items-center justify-between gap-3">
                      <div>
                        <label htmlFor={`c-${f.id}`} className="text-xs font-medium text-foreground">
                          {f.label}
                        </label>
                        <p className="text-[10px] text-muted-foreground">
                          {f.price === 0 ? "Free" : `₹${f.price.toLocaleString("en-IN")} each`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          id={`c-${f.id}`}
                          inputMode="numeric"
                          placeholder="0"
                          value={custom[f.id] ?? ""}
                          onChange={(e) =>
                            setCustom((c) => ({ ...c, [f.id]: e.target.value.replace(/\D/g, "") }))
                          }
                          className="h-8 w-16 text-right text-xs"
                        />
                        <span className="w-16 text-right text-xs font-semibold">
                          {qty(f.id) > 0 ? `₹${(qty(f.id) * f.price).toLocaleString("en-IN")}` : ""}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between border-t border-border/50 pt-2.5 text-xs font-bold text-foreground">
                    <span>Custom subtotal</span>
                    <span>₹{customTotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="pt-1">
                    <label htmlFor="c-remarks" className="text-xs text-muted-foreground">
                      Remarks
                    </label>
                    <Textarea
                      id="c-remarks"
                      placeholder="Anything else we should know?"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      className="mt-1 text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {service.subs && (
          <div className="space-y-3 pt-2">
            <h2 className="font-display text-xl font-normal tracking-tight text-foreground">
              Add sub-services
            </h2>
            <div className="space-y-2">
              {service.subs.map((sub) => (
                <label
                  key={sub.id}
                  className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border/70 bg-card p-3.5 transition hover:border-primary/40"
                >
                  <Checkbox
                    checked={picked.includes(sub.id)}
                    onCheckedChange={(v) =>
                      setPicked((p) => (v ? [...p, sub.id] : p.filter((x) => x !== sub.id)))
                    }
                  />
                  <span className="flex-1 text-xs font-medium text-foreground">{sub.name}</span>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-primary">
                    + ₹{sub.price}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3 pt-2">
          <h2 className="font-display text-xl font-normal tracking-tight text-foreground">
            Customer Reviews
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
            {reviews.map((r, idx) => (
              <div
                key={idx}
                className="flex-none w-64 snap-start rounded-2xl border border-border/70 bg-card p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-semibold text-primary">
                    {r.service}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-foreground/80 italic">"{r.text}"</p>
                <p className="text-[11px] font-semibold text-foreground pt-1">{r.name}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="fixed inset-x-0 bottom-14 z-30 border-t border-border/60 bg-background/95 px-5 py-3.5 backdrop-blur-md">
          <div className="mx-auto flex max-w-md items-center justify-between gap-4">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Total Price</p>
              <p className="font-display text-xl font-normal text-foreground">
                {service.price === 0 ? "FREE" : `₹${total.toLocaleString("en-IN")}`}
              </p>
            </div>
            {service.packages && !pkgId ? (
              <Button disabled className="rounded-full px-5 py-2.5 text-xs font-semibold">
                Select a package
              </Button>
            ) : isCustom && customTotal === 0 ? (
              <Button disabled className="rounded-full px-5 py-2.5 text-xs font-semibold">
                Add quantities
              </Button>
            ) : (
              <Link
                to="/services/$slug/book"
                params={{ slug: service.slug }}
                search={{
                  subs: picked.length ? picked.join(",") : undefined,
                  pkg: pkgId,
                  custom: isCustom ? customSummary : undefined,
                  customAmt: isCustom ? customTotal : undefined,
                }}
                className="press inline-flex items-center gap-1.5 rounded-full bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground shadow-md transition hover:bg-primary/90"
              >
                <span>{service.price === 0 ? "Book Free Check" : "Book Service"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </Shell>
  );
}
