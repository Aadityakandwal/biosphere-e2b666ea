import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Shell } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { products } from "@/lib/data";
import { useCart } from "@/lib/stores";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/shop/$productId")({
  loader: ({ params }) => {
    const p = products.find(x => x.id === params.productId);
    if (!p) throw notFound();
    return { product: p };
  },
  head: ({ params, loaderData }) => ({
    meta: [
      { title: `${loaderData?.product.name ?? "Product"} — Biosphere Shop` },
      { name: "description", content: (loaderData?.product.description ?? loaderData?.product.short ?? "").slice(0, 155) },
      { property: "og:title", content: `${loaderData?.product.name ?? "Product"} — Biosphere Shop` },
      { property: "og:description", content: (loaderData?.product.description ?? loaderData?.product.short ?? "").slice(0, 155) },
      { property: "og:type", content: "product" },
      { property: "og:url", content: `https://biosphere.app/shop/${params.productId}` },
      { name: "twitter:card", content: "summary_large_image" },
      ...(loaderData?.product.image ? [
        { property: "og:image", content: loaderData.product.image },
        { name: "twitter:image", content: loaderData.product.image },
      ] : []),
    ],
    links: [{ rel: "canonical", href: `https://biosphere.app/shop/${params.productId}` }],
    scripts: loaderData?.product
      ? [
          {
            type: "application/ld+json",
            children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              name: loaderData.product.name,
              description: loaderData.product.description ?? loaderData.product.short,
              image: loaderData.product.image,
              brand: { "@type": "Brand", name: "Biosphere" },
              offers: {
                "@type": "Offer",
                price: loaderData.product.price,
                priceCurrency: "INR",
                availability: "https://schema.org/InStock",
                url: `https://biosphere.app/shop/${params.productId}`,
              },
            }),
          },
        ]
      : [],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const add = useCart((s) => s.add);
  const isNeerva = product.id === "neerva";

  return (
    <Shell>
      <Link to="/shop" className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4" /> Back to shop</Link>
      <div className="flex h-80 w-full items-center justify-center overflow-hidden rounded-2xl bg-muted/40">
        <img src={product.image} alt={product.name} className="h-full w-full object-contain" />
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">{product.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{product.short}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold">₹{product.price}</p>
          {product.mrp && product.mrp > product.price && (
            <p className="mt-0.5 flex items-center justify-end gap-2 text-sm">
              <span className="text-muted-foreground line-through">₹{product.mrp}</span>
              <span className="font-semibold text-primary">
                {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF
              </span>
            </p>
          )}
          {product.popular && <Badge className="mt-1">⭐ Most Popular</Badge>}
        </div>
      </div>

      <ProductDetails product={product} />

      {isNeerva && <NeervaGuide />}

      <div className="fixed inset-x-0 bottom-14 z-30">
        <div className="mx-auto flex max-w-md items-center gap-2 border-t border-border bg-background/95 px-4 py-3 backdrop-blur">
          <Button variant="outline" className="flex-1" onClick={() => { add({ id: product.id, name: product.name, price: product.price, image: product.image }); toast.success("Added to cart"); }}>Add to cart</Button>
          <Link to="/cart" className="flex-1"><Button className="w-full" onClick={() => add({ id: product.id, name: product.name, price: product.price, image: product.image })}>Buy now</Button></Link>
        </div>
      </div>
      <div className="h-20" />
    </Shell>
  );
}

function ProductDetails({ product }: { product: (typeof products)[number] }) {
  return (
    <div className="mt-6 space-y-4">
      <Card className="p-4">
        <h2 className="font-display text-lg font-semibold">About this product</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{product.description}</p>
      </Card>

      <Card className="p-4">
        <h3 className="font-medium">Highlights</h3>
        <ul className="mt-3 space-y-2 text-sm">
          {product.highlights.map((h) => (
            <li key={h} className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span className="text-muted-foreground">{h}</span>
            </li>
          ))}
        </ul>
      </Card>

      {product.care && (
        <Card className="p-4">
          <h3 className="font-medium">Care &amp; usage</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{product.care}</p>
        </Card>
      )}
    </div>
  );
}

function NeervaGuide() {
  return (
    <div className="mt-6 space-y-4">
      <Card className="p-4">
        <h2 className="font-display text-lg font-semibold">How to use Neerva</h2>
        <ol className="mt-3 space-y-3 text-sm">
          <li><strong>Step 1 — Shake Well.</strong> Shake the bottle thoroughly before use to evenly distribute the microbial content.</li>
          <li><strong>Step 2 — Dilute.</strong> Mix Neerva with clean, non-chlorinated water using the table below.</li>
          <li><strong>Step 3 — Apply.</strong> Spray both sides of the leaves for foliar; pour around the root zone for soil. Apply early morning or late evening.</li>
          <li><strong>Step 4 — Repeat.</strong> Every 7–15 days during the growing season.</li>
        </ol>
      </Card>

      <Card className="p-4">
        <h3 className="font-medium">Dilution guide</h3>
        <div className="mt-2 divide-y divide-border text-sm">
          <Row a="🌿 Foliar Spray" b="70–80 ml / 1 L water" />
          <Row a="🌱 Soil Drench" b="150–170 ml / 1 L water" />
          <Row a="💧 Drip Irrigation" b="As per system & field size" />
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-medium">Best practices</h3>
        <ul className="mt-2 space-y-1 text-sm">
          <li>✅ Shake well before every use</li>
          <li>✅ Store cool, dry, out of direct sunlight</li>
          <li>✅ Keep tightly closed after use</li>
          <li>✅ Use diluted solution on the same day</li>
          <li>✅ Keep out of reach of children and pets</li>
          <li>❌ Do not mix with strong chemical pesticides or alkaline solutions</li>
          <li>❌ Do not exceed recommended dosage</li>
        </ul>
      </Card>

      <Card className="flex items-center justify-between p-4">
        <div><p className="font-medium">1 L bottle</p><p className="text-xs text-muted-foreground">Best value</p></div>
        <div className="text-right">
          <p className="text-xl font-semibold">₹249 <span className="text-sm font-normal text-muted-foreground line-through">₹300</span></p>
          <p className="text-xs font-semibold text-primary">17% OFF</p>
          <Badge className="mt-1">⭐ Most Popular</Badge>
        </div>
      </Card>
    </div>
  );
}

function Row({ a, b }: { a: string; b: string }) {
  return <div className="flex justify-between py-2"><span>{a}</span><span className="text-muted-foreground">{b}</span></div>;
}
