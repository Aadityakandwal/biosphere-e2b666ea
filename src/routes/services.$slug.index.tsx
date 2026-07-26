import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/Shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { services, reviews } from "@/lib/data";
import { Clock, Star, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/services/$slug/")({
  loader: ({ params }) => {
    const s = services.find((x) => x.slug === params.slug);
    if (!s) throw notFound();
    return { service: s };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.service.name ?? "Service"} — Biosphere` },
      { name: "description", content: loaderData?.service.description ?? "Biosphere service" },
      { property: "og:title", content: `${loaderData?.service.name ?? "Service"} — Biosphere` },
      { property: "og:description", content: loaderData?.service.description ?? "" },
      ...(loaderData?.service.image ? [
        { property: "og:image", content: loaderData.service.image },
        { name: "twitter:image", content: loaderData.service.image },
      ] : []),
    ],
  }),
  component: ServiceDetail,
});

function ServiceDetail() {
  const { service } = Route.useLoaderData() as { service: import("@/lib/data").Service };
  const [picked, setPicked] = useState<string[]>([]);
  const extra = service.subs?.filter((s) => picked.includes(s.id)).reduce((n: number, s) => n + s.price, 0) ?? 0;
  const total = service.price + extra;

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
          <p className="text-2xl font-semibold">₹{service.price}</p>
          <p className="text-xs text-muted-foreground">base price</p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{service.description}</p>

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
      <div className="mt-2 space-y-2">
        {reviews.slice(0, 3).map((r) => (
          <Card key={r.name} className="p-3">
            <div className="flex items-center gap-1 text-yellow-500">
              {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="h-3 w-3 fill-current" />)}
            </div>
            <p className="mt-1 text-sm">{r.text}</p>
            <p className="mt-1 text-xs text-muted-foreground">— {r.name}</p>
          </Card>
        ))}
      </div>

      <div className="fixed inset-x-0 bottom-14 z-30">
        <div className="mx-auto flex max-w-md items-center justify-between border-t border-border bg-background/95 px-4 py-3 backdrop-blur">
          <div>
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-lg font-semibold">₹{total}</p>
          </div>
          <Link to="/services/$slug/book" params={{ slug: service.slug }} search={{ subs: picked.length ? picked.join(",") : undefined }}>
            <Button size="lg">Book service</Button>
          </Link>
        </div>
      </div>
      <div className="h-20" />
    </Shell>
  );
}
