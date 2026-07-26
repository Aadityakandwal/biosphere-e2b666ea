import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/Shell";
import { products } from "@/lib/data";
import { useCart } from "@/lib/stores";
import { Search, Sprout, Hammer, FlaskConical, Flower2, LayoutGrid, Plus, ChevronRight, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/shop/")({
  validateSearch: (search: Record<string, unknown>): { cat?: string } => ({
    cat: typeof search.cat === "string" ? search.cat : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Shop — Biosphere" },
      { name: "description", content: "Plants, tools, planters, and Biovelocity growth products." },
      { property: "og:title", content: "Shop — Biosphere" },
      { property: "og:description", content: "Plants, tools, planters, and Biovelocity growth products." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ShopPage,
});

const CATS = [
  { id: "all", label: "All Categories", icon: LayoutGrid },
  { id: "plants", label: "Plants", icon: Sprout },
  { id: "tools", label: "Tools", icon: Hammer },
  { id: "biovelocity", label: "Biovelocity", icon: FlaskConical },
  { id: "pots", label: "Pots", icon: Flower2 },
] as const;

const SECTIONS = [
  { id: "plants", title: "Plants", blurb: "Living greenery for every corner" },
  { id: "tools", title: "Tools", blurb: "Built to last, easy to handle" },
  { id: "biovelocity", title: "Biovelocity", blurb: "Microbial nutrition that works fast" },
  { id: "pots", title: "Pots & Planters", blurb: "Homes that suit your plants" },
] as const;

const CAT_LABEL: Record<string, string> = {
  plants: "PLANTS",
  tools: "TOOLS",
  biovelocity: "BIOVELOCITY",
  pots: "PLANTERS",
};

type Product = (typeof products)[number];

function ShopPage() {
  const { cat: catParam } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [q, setQ] = useState("");
  const cat = catParam ?? "all";
  const setCat = (next: string) =>
    navigate({ search: { cat: next === "all" ? undefined : next }, replace: true });
  const add = useCart((s) => s.add);

  const matchesQuery = (p: Product) => p.name.toLowerCase().includes(q.trim().toLowerCase());
  const filtered = products.filter((p) => (cat === "all" || p.category === cat) && matchesQuery(p));

  const rare = cat === "all" ? filtered.filter((p) => p.popular || p.category === "plants").slice(0, 4) : [];

  const addToCart = (p: Product) => {
    add({ id: p.id, name: p.name, price: p.price, image: p.image });
    toast.success("Added to cart");
  };

  const Card = ({ p }: { p: Product }) => (
    <div className="group">
      <Link
        to="/shop/$productId"
        params={{ productId: p.id }}
        className="relative block overflow-hidden rounded-3xl shadow-soft ring-1 ring-border/40 transition-shadow duration-300 group-hover:shadow-elevated"
      >
        <img
          src={p.image}
          alt={p.name}
          loading="lazy"
          className="aspect-square w-full bg-muted object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>
      <button
        onClick={() => addToCart(p)}
        aria-label={`Add ${p.name} to cart`}
        className="press relative z-10 -mt-9 ml-auto mr-3 flex h-11 w-11 items-center justify-center rounded-full bg-card shadow-elevated transition-colors hover:bg-primary hover:text-primary-foreground"
      >
        <Plus className="h-5 w-5" />
      </button>
      <p className="mt-1 text-[10px] font-semibold tracking-widest text-muted-foreground">{CAT_LABEL[p.category]}</p>
      <Link to="/shop/$productId" params={{ productId: p.id }}>
        <p className="mt-0.5 font-semibold leading-snug transition-colors group-hover:text-primary">{p.name}</p>
      </Link>
      <p className="mt-1 font-semibold text-primary">₹{p.price}</p>
    </div>
  );

  return (
    <Shell>
      {/* Search */}
      <div className="mt-3 flex items-center gap-2 rounded-full bg-muted/70 px-5 py-3.5 shadow-soft transition-shadow focus-within:shadow-glow">
        <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search for rare plants, tools…"
          className="w-full bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
        />
      </div>

      {/* Categories */}
      <div className="-mx-4 mt-4 flex gap-2.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {CATS.map((c) => {
          const Icon = c.icon;
          const active = cat === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={`press flex shrink-0 items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-all duration-300 ${
                active
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "bg-muted/70 text-foreground/80 hover:bg-muted"
              }`}
            >
              <Icon className="h-4 w-4" />
              {c.label}
            </button>
          );
        })}
      </div>

      {cat === "all" ? (
        <>
          {/* Rare Finds carousel */}
          {rare.length > 0 && (
            <>
              <div className="mt-7 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-display text-2xl font-semibold tracking-tight">Rare Finds</h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">Curated botanical treasures for your collection</p>
                </div>
                <button
                  onClick={() => setCat("plants")}
                  className="press mt-1 flex shrink-0 items-center gap-1 text-sm font-medium text-primary"
                >
                  View all <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="-mx-4 mt-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {rare.map((p) => (
                  <Link
                    key={p.id}
                    to="/shop/$productId"
                    params={{ productId: p.id }}
                    className="press group relative min-w-[78%] snap-start overflow-hidden rounded-3xl shadow-elevated"
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      className="h-80 w-full bg-muted object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/15 to-transparent" />
                    <div className="absolute inset-x-5 bottom-5">
                      <span className="rounded-full bg-primary px-3 py-1.5 text-[10px] font-bold tracking-widest text-primary-foreground">
                        {p.popular ? "BEST SELLER" : "COLLECTOR'S EDITION"}
                      </span>
                      <p className="mt-3 font-display text-2xl font-semibold leading-tight text-primary-foreground">{p.name}</p>
                      <p className="mt-1 text-sm font-medium text-primary-foreground/90">₹{p.price}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}

          {/* Every category, sectioned */}
          {SECTIONS.map((s) => {
            const items = filtered.filter((p) => p.category === s.id);
            if (items.length === 0) return null;
            return (
              <section key={s.id} className="mt-8">
                <div className="flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-display text-xl font-semibold tracking-tight">{s.title}</h2>
                    <p className="mt-0.5 text-sm text-muted-foreground">{s.blurb}</p>
                  </div>
                  <button
                    onClick={() => setCat(s.id)}
                    className="press flex shrink-0 items-center gap-1 text-sm font-medium text-primary"
                  >
                    See all <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-6">
                  {items.map((p) => (
                    <Card key={p.id} p={p} />
                  ))}
                </div>
              </section>
            );
          })}

          {filtered.length === 0 && (
            <p className="py-12 text-center text-sm text-muted-foreground">No products match “{q}”.</p>
          )}
          <div className="h-6" />
        </>
      ) : (
        <>
          <div className="mt-7 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <h2 className="font-display text-2xl font-semibold tracking-tight">
                {SECTIONS.find((s) => s.id === cat)?.title ?? "Products"}
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {SECTIONS.find((s) => s.id === cat)?.blurb}
              </p>
            </div>
            <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-leaf/15 px-3 py-1.5 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" /> {filtered.length} items
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-6 pb-6">
            {filtered.map((p) => (
              <Card key={p.id} p={p} />
            ))}
            {filtered.length === 0 && (
              <p className="col-span-2 py-12 text-center text-sm text-muted-foreground">No products found here yet.</p>
            )}
          </div>
        </>
      )}
    </Shell>
  );
}
