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
import { Clock, Star, ArrowLeft, Quote } from "lucide-react";

export const Route = createFileRoute("/services/$slug/")({
  loader: ({ params }) => {
    const s = services.find((x) => x.slug === params.slug);
    if (!s) throw notFound();
    return { service: s };
  },
  head: ({ params, loaderData }) => ({
    meta: [
      { title: `${loaderData?.service.name ?? "Service"} — Biosphere` },
      { name: "description", content: (loaderData?.service.description ?? "Biosphere service").slice(0, 155) },
      { property: "og:title", content: `${loaderData?.service.name ?? "Service"} — Biosphere` },
      { property: "og:description", content: (loaderData?.service.description ?? "").slice(0, 155) },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `https://biosphere.lovable.app/services/${params.slug}` },
      { name: "twitter:card", content: "summary_large_image" },
      ...(loaderData?.service.image ? [
        { property: "og:image", content: loaderData.service.image },
        { name: "twitter:image", content: loaderData.service.image },
      ] : []),
    ],
    links: [{ rel: "canonical", href: `https://biosphere.lovable.app/services/${params.slug}` }],
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
              provider: { "@type": "Organization", name: "Biosphere" },
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
      <Link to="/services" className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4" /> Back</Link>
      <img src={service.image} alt="" className="h-56 w-full rounded-2xl object-cover" />
      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">{service.name}</h1>
          <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-current text-yellow-500" /> {service.rating} ({service.reviews})</span>
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {service.duration}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold">₹{base.toLocaleString("en-IN")}</p>
          <p className="text-xs text-muted-foreground">{pkg ? "starting price" : "base price"}</p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{service.description}</p>

      {(service.packages || unitFields) && (
        <>
          <h2 className="mt-6 font-display text-lg font-semibold">Choose your space</h2>
          <p className="mt-1 text-xs text-muted-foreground">Pick a ready package or build your own — final price is confirmed after the site survey.</p>
          <div className="mt-3 space-y-3">
            {(service.packages ?? []).map((p) => {
              const active = p.id === pkgId;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPkgId(active ? undefined : p.id)}
                  className={`w-full rounded-2xl border p-4 text-left transition-all ${active ? "border-primary bg-primary/5 shadow-md" : "border-border bg-card hover:border-primary/40"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">{p.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{p.includes.join(" · ")}</p>
                    </div>
                    <div className="flex-none text-right">
                      <p className="text-sm font-semibold">₹{p.price.toLocaleString("en-IN")}</p>
                      <p className="text-[11px] text-muted-foreground">to ₹{p.priceMax.toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {p.includes.map((inc) => (
                      <Badge key={inc} variant="secondary" className="text-[11px]">{inc}</Badge>
                    ))}
                  </div>
                  {active && <p className="mt-3 text-xs font-medium text-primary">Selected</p>}
                </button>
              );
            })}

            {unitFields && (
              <button
                type="button"
                onClick={() => setPkgId(isCustom ? undefined : "custom")}
                className={`w-full rounded-2xl border p-4 text-left transition-all ${isCustom ? "border-primary bg-primary/5 shadow-md" : "border-dashed border-border bg-card hover:border-primary/40"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">Customized setup</p>
                    <p className="mt-1 text-xs text-muted-foreground">Pick your own quantities — priced per unit.</p>
                  </div>
                  <Badge variant="secondary" className="flex-none text-[11px]">Pay per unit</Badge>
                </div>
                {isCustom && <p className="mt-3 text-xs font-medium text-primary">Selected</p>}
              </button>
            )}

            {isCustom && unitFields && (
              <Card className="space-y-3 p-4">
                <p className="text-sm font-semibold">Build your setup</p>
                {unitFields.map((f) => (
                  <div key={f.id} className="flex items-center justify-between gap-3">
                    <div>
                      <label htmlFor={`c-${f.id}`} className="text-sm">{f.label}</label>
                      <p className="text-[11px] text-muted-foreground">{f.price === 0 ? "Free" : `₹${f.price.toLocaleString("en-IN")} each`}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        id={`c-${f.id}`}
                        inputMode="numeric"
                        placeholder="0"
                        value={custom[f.id] ?? ""}
                        onChange={(e) => setCustom((c) => ({ ...c, [f.id]: e.target.value.replace(/\D/g, "") }))}
                        className="h-9 w-20 text-right"
                      />
                      <span className="w-16 text-right text-xs font-medium">
                        {qty(f.id) > 0 ? `₹${(qty(f.id) * f.price).toLocaleString("en-IN")}` : ""}
                      </span>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between border-t border-border pt-3 text-sm font-semibold">
                  <span>Custom subtotal</span>
                  <span>₹{customTotal.toLocaleString("en-IN")}</span>
                </div>
                <div>
                  <label htmlFor="c-remarks" className="text-sm text-muted-foreground">Remarks</label>
                  <Textarea
                    id="c-remarks"
                    placeholder="Anything else we should know?"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </Card>
            )}
          </div>
        </>
      )}

      {service.subs && (

        <>
          <h2 className="mt-6 font-display text-lg font-semibold">Add sub-services</h2>
          <div className="mt-2 space-y-2">
            {service.subs.map((sub) => (
              <label key={sub.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-card p-3">
                <Checkbox
                  checked={picked.includes(sub.id)}
                  onCheckedChange={(v) => setPicked((p) => v ? [...p, sub.id] : p.filter((x) => x !== sub.id))}
                />
                <span className="flex-1 text-sm">{sub.name}</span>
                <Badge variant="secondary">+ ₹{sub.price}</Badge>
              </label>
            ))}
          </div>
        </>
      )}

      <h2 className="mt-6 font-display text-lg font-semibold">Reviews</h2>
      <div className="relative -mx-4 mt-2">
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide">
          {reviews.map((r, idx) => (
            <Card
              key={r.name}
              className="relative w-[280px] flex-none snap-start overflow-hidden border-0 bg-gradient-to-br from-card to-muted p-5 shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-elevated"
            >
              <Quote className="absolute right-4 top-4 h-8 w-8 text-primary/10" />
              <div className="flex items-center gap-3">
                <span
                  className="flex h-11 w-11 flex-none items-center justify-center rounded-full text-sm font-bold"
                  style={{
                    background: `oklch(0.88 0.06 ${130 + (idx * 25) % 90})`,
                    color: `oklch(0.28 0.07 ${130 + (idx * 25) % 90})`,
                  }}
                >
                  {r.name.charAt(0)}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-display font-semibold">{r.name}</p>
                  <div className="flex items-center gap-0.5 text-primary">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < r.rating ? "fill-current" : "text-muted-foreground/30"}`} />
                    ))}
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">“{r.text}”</p>
              <div className="mt-5 flex items-center gap-2">
                <span className="rounded-full bg-leaf/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                  {r.service}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-14 z-30">
        <div className="mx-auto flex max-w-md items-center justify-between border-t border-border bg-background/95 px-4 py-3 backdrop-blur">
          <div>
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-lg font-semibold">₹{total.toLocaleString("en-IN")}</p>
          </div>
          {service.packages && !pkgId ? (
            <Button size="lg" disabled>Select a package</Button>
          ) : isCustom && customTotal === 0 ? (
            <Button size="lg" disabled>Add quantities</Button>
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
            >
              <Button size="lg">Book service</Button>
            </Link>
          )}
        </div>
      </div>

      <div className="h-20" />
    </Shell>
  );
}
