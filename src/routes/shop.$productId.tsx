import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Shell } from "@/components/Shell";
import { products } from "@/lib/data";
import { useCart } from "@/lib/stores";
import {
  ArrowLeft,
  Check,
  Plus,
  ShoppingCart,
  Sparkles,
  ShieldCheck,
  Coins,
  Droplets,
  Sprout,
  Info,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/shop/$productId")({
  loader: ({ params }) => {
    const p = products.find((x) => x.id === params.productId);
    if (!p) throw notFound();
    return { product: p };
  },
  head: ({ params, loaderData }) => ({
    meta: [
      { title: `${loaderData?.product.name ?? "Product"} — My Gardener Shop` },
      {
        name: "description",
        content: (loaderData?.product.description ?? loaderData?.product.short ?? "").slice(0, 155),
      },
      { property: "og:title", content: `${loaderData?.product.name ?? "Product"} — My Gardener Shop` },
      {
        property: "og:description",
        content: (loaderData?.product.description ?? loaderData?.product.short ?? "").slice(0, 155),
      },
      { property: "og:type", content: "product" },
      { property: "og:url", content: `https://biosphere.app/shop/${params.productId}` },
      { name: "twitter:card", content: "summary_large_image" },
      ...(loaderData?.product.image
        ? [
            { property: "og:image", content: loaderData.product.image },
            { name: "twitter:image", content: loaderData.product.image },
          ]
        : []),
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
              brand: { "@type": "Brand", name: "My Gardener" },
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

const CATEGORY_NAMES: Record<string, string> = {
  biovelocity: "Growth Tonic",
  plants: "Living Plant",
  tools: "Precision Tool",
  pots: "Planter & Pot",
};

function ProductPage() {
  const { product } = Route.useLoaderData();
  const add = useCart((s) => s.add);
  const isNeerva = product.id === "neerva";

  const handleAddToCart = () => {
    add({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
    toast.success(`Added ${product.name} to cart`);
  };

  return (
    <Shell>
      <div className="px-5 sm:px-6 pb-28 space-y-6">
        {/* Back navigation */}
        <Link
          to="/shop"
          className="press inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to essentials</span>
        </Link>

        {/* Hero Product Image */}
        <div className="relative aspect-square sm:aspect-4/3 w-full overflow-hidden rounded-3xl border border-border/60 bg-card p-4 shadow-xs">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-contain transition-transform duration-700 hover:scale-105"
          />
          {product.popular && (
            <span className="absolute left-4 top-4 rounded-full bg-[#1A3D2F] px-3 py-1 text-[9px] font-bold tracking-wider text-white shadow-xs">
              BESTSELLER
            </span>
          )}
        </div>

        {/* Title & Price Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
              {CATEGORY_NAMES[product.category] || "BOTANICAL ESSENTIAL"}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              Verified Authentic
            </span>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-normal tracking-tight text-foreground">
            {product.name}
          </h1>

          <p className="text-xs text-muted-foreground leading-relaxed">
            {product.short}
          </p>

          <div className="pt-2 flex items-baseline gap-2">
            <span className="font-display text-2xl sm:text-3xl font-semibold text-foreground">
              ₹{product.price}
            </span>
            {product.mrp && product.mrp > product.price && (
              <span className="text-sm text-muted-foreground line-through">
                ₹{product.mrp}
              </span>
            )}
            {product.mrp && product.mrp > product.price && (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF
              </span>
            )}
          </div>
        </div>

        {/* Green Points Perks Banner */}
        <div className="flex items-center gap-2.5 rounded-2xl border border-primary/15 bg-primary/[0.04] p-3 text-xs">
          <Coins className="h-4 w-4 text-primary shrink-0" />
          <span className="text-muted-foreground text-[11px]">
            Earn <strong className="text-foreground font-semibold">{Math.round(product.price * 0.05)} Green Points</strong> with this purchase.
          </span>
        </div>

        {/* Product Details & Highlights */}
        <ProductDetails product={product} />

        {/* Neerva Specific Guide */}
        {isNeerva && <NeervaGuide />}
      </div>

      {/* Floating Sticky Bottom Action Bar */}
      <div className="fixed inset-x-0 bottom-16 z-30 pointer-events-none">
        <div className="mx-auto max-w-md px-4 pointer-events-auto">
          <div className="flex items-center gap-2.5 rounded-full border border-border/80 bg-card/95 p-2 backdrop-blur-xl shadow-xl">
            <button
              type="button"
              onClick={handleAddToCart}
              className="press flex-1 rounded-full border border-border bg-background py-3 text-xs font-semibold text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-1.5"
            >
              <ShoppingCart className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Add to Cart</span>
            </button>
            <Link
              to="/cart"
              onClick={handleAddToCart}
              className="press flex-1 rounded-full bg-primary py-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-md text-center"
            >
              Buy Now
            </Link>
          </div>
        </div>
      </div>
    </Shell>
  );
}

function ProductDetails({ product }: { product: (typeof products)[number] }) {
  return (
    <div className="space-y-4 pt-2">
      {/* About Section */}
      <div className="rounded-3xl border border-border/70 bg-card p-4 sm:p-5 shadow-2xs space-y-2">
        <h2 className="font-display text-base font-normal tracking-tight text-foreground">
          About this botanical item
        </h2>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {product.description}
        </p>
      </div>

      {/* Highlights Spec List */}
      {product.highlights && product.highlights.length > 0 && (
        <div className="rounded-3xl border border-border/70 bg-card p-4 sm:p-5 shadow-2xs space-y-3">
          <h3 className="font-display text-base font-normal tracking-tight text-foreground">
            Key Specifications & Highlights
          </h3>
          <ul className="space-y-2.5 text-xs">
            {product.highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" />
                <span className="text-foreground/90">{h}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Care & Application Guidance */}
      {product.care && (
        <div className="rounded-3xl border border-border/70 bg-card p-4 sm:p-5 shadow-2xs space-y-2">
          <div className="flex items-center gap-1.5">
            <Droplets className="h-4 w-4 text-primary" />
            <h3 className="font-display text-base font-normal tracking-tight text-foreground">
              Care &amp; Application Guide
            </h3>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {product.care}
          </p>
        </div>
      )}
    </div>
  );
}

function NeervaGuide() {
  return (
    <div className="space-y-4 pt-2">
      {/* Step by Step Protocol */}
      <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/[0.06] via-card to-card p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-1.5">
          <Sprout className="h-4 w-4 text-primary" />
          <h2 className="font-display text-base font-normal tracking-tight text-foreground">
            Application Protocol — Neerva
          </h2>
        </div>
        <ol className="space-y-2.5 text-xs text-foreground/90 leading-relaxed list-decimal pl-4">
          <li>
            <strong>Shake Well:</strong> Shake the bottle thoroughly before opening to evenly disperse the live microbial cultures.
          </li>
          <li>
            <strong>Dilute with Fresh Water:</strong> Mix with clean, non-chlorinated water according to application method.
          </li>
          <li>
            <strong>Apply at Cooler Hours:</strong> Spray both leaf surfaces or drench root zone early morning or post-sunset.
          </li>
          <li>
            <strong>Repeat Cycle:</strong> Feed every 7–15 days during active vegetative & monsoon growing seasons.
          </li>
        </ol>
      </div>

      {/* Dilution Table */}
      <div className="rounded-3xl border border-border/70 bg-card p-4 sm:p-5 shadow-2xs space-y-2.5">
        <h3 className="font-display text-sm font-semibold text-foreground">
          Recommended Dilution Rates
        </h3>
        <div className="divide-y divide-border/60 text-xs">
          <div className="flex justify-between py-2">
            <span className="font-medium text-foreground">🌿 Foliar Spray</span>
            <span className="text-muted-foreground font-mono">70–80 ml / 1 L water</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="font-medium text-foreground">🌱 Soil Drench</span>
            <span className="text-muted-foreground font-mono">150–170 ml / 1 L water</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="font-medium text-foreground">💧 Drip Irrigation</span>
            <span className="text-muted-foreground font-mono">As per system flow rate</span>
          </div>
        </div>
      </div>
    </div>
  );
}
