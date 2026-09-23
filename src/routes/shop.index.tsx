import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Shell } from "@/components/Shell";
import { products } from "@/lib/data";
import { useCart } from "@/lib/stores";
import {
  Sprout,
  Hammer,
  FlaskConical,
  Flower2,
  LayoutGrid,
  Plus,
  ArrowRight,
  Sparkles,
  Coins,
  ChevronRight,
  ShieldCheck,
  Check,
} from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { toast } from "sonner";

export const Route = createFileRoute("/shop/")({
  validateSearch: (search: Record<string, unknown>): { cat?: string } => ({
    cat: typeof search.cat === "string" ? search.cat : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Garden Essentials & Plants — My Gardener" },
      {
        name: "description",
        content:
          "Thoughtfully selected indoor and outdoor plants, precision gardening tools, terracotta planters, and organic bio-fertilizers.",
      },
      { property: "og:title", content: "Garden Essentials & Plants — My Gardener" },
      {
        property: "og:description",
        content:
          "Thoughtfully selected indoor and outdoor plants, precision gardening tools, terracotta planters, and organic bio-fertilizers.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: ShopPage,
});

const CATEGORIES = [
  { id: "all", label: "All Essentials", emoji: "🌿", icon: LayoutGrid },
  { id: "biovelocity", label: "Growth Tonics", emoji: "🧪", icon: FlaskConical },
  { id: "plants", label: "Living Plants", emoji: "🌱", icon: Sprout },
  { id: "tools", label: "Precision Tools", emoji: "✂️", icon: Hammer },
  { id: "pots", label: "Planters", emoji: "🪴", icon: Flower2 },
] as const;

const SECTION_META: Record<
  string,
  { title: string; subtitle: string; categoryLabel: string; emoji: string }
> = {
  biovelocity: {
    title: "Bio Growth Tonics",
    subtitle: "Organic live microbial formulas to activate soil biology and accelerate root vitality.",
    categoryLabel: "GROWTH TONICS",
    emoji: "🧪",
  },
  plants: {
    title: "Living Plants",
    subtitle: "Nursery-hardened foliage grown to thrive in Indian homes, balconies, and gardens.",
    categoryLabel: "LIVING PLANTS",
    emoji: "🌱",
  },
  tools: {
    title: "Precision Tools",
    subtitle: "Forged carbon-steel hand tools and bypass pruners built for clean cuts and longevity.",
    categoryLabel: "PRECISION TOOLS",
    emoji: "✂️",
  },
  pots: {
    title: "Planters & Pots",
    subtitle: "Breathable terracotta clay and matte ceramic vessels designed for optimal root respiration.",
    categoryLabel: "PLANTERS",
    emoji: "🪴",
  },
};

type Product = (typeof products)[number];

function ShopPage() {
  const { cat: catParam } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const activeCategory = catParam ?? "all";

  const setCategory = (next: string) => {
    navigate({
      search: { cat: next === "all" ? undefined : next },
      replace: true,
    });
  };

  const add = useCart((s) => s.add);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((p) => {
      const matchesCat = activeCategory === "all" || p.category === activeCategory;
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.short.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  // Curated spotlight items
  const featuredProducts = useMemo(() => {
    return products.filter((p) => p.popular || p.id === "monstera" || p.id === "pruner");
  }, []);

  const handleAddToCart = (p: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    add({ id: p.id, name: p.name, price: p.price, image: p.image });
    toast.success(`Added ${p.name} to cart`);
  };

  return (
    <Shell>
      <div className="pb-10 space-y-7 sm:space-y-9">
        {/* =========================================================================
            1. REFINED EDITORIAL SHOP HERO
            ========================================================================= */}
        <section className="px-5 sm:px-6 pt-1">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-primary/80">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Garden Essentials
            </span>
            <h1 className="font-display text-2xl font-normal tracking-tight text-foreground sm:text-3xl leading-tight">
              Everything Your Garden Needs
            </h1>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
              Thoughtfully selected plants, tools and organic products for everyday growing.
            </p>
          </div>
        </section>

        {/* =========================================================================
            2. SEARCH BAR & DISCOVERY CATEGORIES
            ========================================================================= */}
        <section className="px-5 sm:px-6 space-y-3">
          {/* Search */}
          <SearchBar
            value={searchQuery}
            onValueChange={setSearchQuery}
            scope="products"
            placeholder="Search plants, tools, bio tonics, planters…"
          />

          {/* Horizontal Category Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {CATEGORIES.map((c) => {
              const active = activeCategory === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={`press flex flex-none items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200 ${
                    active
                      ? "bg-[#1A3D2F] text-white shadow-xs ring-1 ring-emerald-900"
                      : "border border-border/60 bg-card text-foreground/80 hover:bg-muted/70"
                  }`}
                >
                  <span className="text-xs">{c.emoji}</span>
                  <span>{c.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* =========================================================================
            3. GREEN POINTS REWARD BADGE
            ========================================================================= */}
        <section className="px-5 sm:px-6">
          <div className="flex items-center justify-between rounded-2xl border border-primary/15 bg-primary/[0.03] p-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Coins className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-xs leading-none">Earn Green Points</p>
                <p className="text-[10.5px] text-muted-foreground mt-0.5">
                  Get 5% back in points on every botanical purchase
                </p>
              </div>
            </div>
            <Link
              to="/profile"
              className="rounded-full border border-primary/20 bg-background px-2.5 py-1 text-[10px] font-semibold text-primary hover:bg-primary/5 press shrink-0"
            >
              Learn More
            </Link>
          </div>
        </section>

        {/* =========================================================================
            4. CURATED SPOTLIGHT (When viewing 'all' and no search filter)
            ========================================================================= */}
        {activeCategory === "all" && !searchQuery.trim() && (
          <section className="space-y-3">
            <div className="px-5 sm:px-6 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-primary/80">
                  Featured
                </span>
                <h2 className="font-display text-lg font-normal tracking-tight text-foreground sm:text-xl">
                  Curated for Your Garden
                </h2>
              </div>
            </div>

            {/* Horizontal Curated Scroll Track */}
            <div className="flex gap-3.5 overflow-x-auto px-5 sm:px-6 pb-2 no-scrollbar snap-x snap-mandatory">
              {featuredProducts.map((product) => (
                <div
                  key={product.id}
                  className="w-64 sm:w-72 flex-none snap-start group rounded-3xl border border-border/70 bg-card p-3 shadow-2xs transition-all hover:border-primary/40 flex flex-col justify-between"
                >
                  <Link
                    to="/shop/$productId"
                    params={{ productId: product.id }}
                    className="block space-y-2.5"
                  >
                    <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl bg-muted/30">
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {product.popular && (
                        <span className="absolute left-2.5 top-2.5 rounded-full bg-[#1A3D2F]/90 px-2 py-0.5 text-[8px] font-bold tracking-wider text-white backdrop-blur-xs">
                          POPULAR
                        </span>
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-primary">
                        {SECTION_META[product.category]?.categoryLabel || "ESSENTIAL"}
                      </span>
                      <h3 className="font-display text-sm font-medium tracking-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-[11px] text-muted-foreground line-clamp-1 leading-snug">
                        {product.short}
                      </p>
                    </div>
                  </Link>

                  <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between">
                    <div>
                      <span className="font-display text-sm sm:text-base font-semibold text-foreground">
                        ₹{product.price}
                      </span>
                      {product.mrp && product.mrp > product.price && (
                        <span className="ml-1 text-[10px] text-muted-foreground line-through">
                          ₹{product.mrp}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleAddToCart(product, e)}
                      className="press inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold text-primary-foreground shadow-2xs hover:bg-primary/90"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* =========================================================================
            5. CATEGORY SECTIONS / SEARCH RESULTS
            ========================================================================= */}
        {activeCategory === "all" && !searchQuery.trim() ? (
          // Grouped Sections: Living Plants, Growth Tonics, Tools, Planters
          ["plants", "biovelocity", "tools", "pots"].map((catKey) => {
            const items = products.filter((p) => p.category === catKey);
            const meta = SECTION_META[catKey];
            if (items.length === 0 || !meta) return null;

            return (
              <section key={catKey} className="px-5 sm:px-6 space-y-3">
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs">{meta.emoji}</span>
                      <h2 className="font-display text-base font-normal tracking-tight text-foreground sm:text-lg">
                        {meta.title}
                      </h2>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                      {meta.subtitle}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCategory(catKey)}
                    className="press flex items-center gap-0.5 text-[11px] font-semibold text-primary hover:underline shrink-0 ml-2"
                  >
                    <span>View all</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* 2-Column Clean Editorial Grid */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {items.map((p) => (
                    <ProductCard key={p.id} product={p} onAdd={handleAddToCart} />
                  ))}
                </div>
              </section>
            );
          })
        ) : (
          // Filtered View by Category or Search
          <section className="px-5 sm:px-6 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-normal tracking-tight text-foreground">
                  {searchQuery.trim()
                    ? `Search Results for "${searchQuery}"`
                    : SECTION_META[activeCategory]?.title || "Products"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {filteredProducts.length} items available
                </p>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="rounded-3xl border border-border/80 bg-card p-8 text-center space-y-2">
                <p className="font-display text-base font-normal text-foreground">
                  No products found
                </p>
                <p className="text-xs text-muted-foreground">
                  Try clearing your search or selecting another category.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setCategory("all");
                  }}
                  className="mt-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
                >
                  View All Products
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {filteredProducts.map((p) => (
                  <ProductCard key={p.id} product={p} onAdd={handleAddToCart} />
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </Shell>
  );
}

// Clean Editorial Product Card with tactile confirmation
function ProductCard({
  product,
  onAdd,
}: {
  product: Product;
  onAdd: (p: Product, e?: React.MouseEvent) => void;
}) {
  const [added, setAdded] = useState(false);

  const handleAddClick = (e: React.MouseEvent) => {
    onAdd(product, e);
    setAdded(true);
    setTimeout(() => setAdded(false), 900);
  };

  return (
    <div className="group rounded-3xl border border-border/70 bg-card p-2.5 sm:p-3 shadow-2xs transition-all duration-200 hover:border-primary/40 hover:shadow-soft flex flex-col justify-between">
      <Link
        to="/shop/$productId"
        params={{ productId: product.id }}
        className="block space-y-2"
      >
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-muted/30">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
          {product.popular && (
            <span className="absolute left-2 top-2 rounded-full bg-[#1A3D2F]/90 px-2 py-0.5 text-[8px] font-bold tracking-wider text-white backdrop-blur-xs">
              POPULAR
            </span>
          )}
        </div>

        <div className="space-y-0.5">
          <span className="text-[8.5px] font-bold uppercase tracking-[0.14em] text-primary">
            {SECTION_META[product.category]?.categoryLabel || "PRODUCT"}
          </span>
          <h3 className="font-display text-xs sm:text-sm font-medium tracking-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="text-[10px] text-muted-foreground line-clamp-1 leading-snug">
            {product.short}
          </p>
        </div>
      </Link>

      <div className="mt-2.5 pt-2 border-t border-border/40 flex items-center justify-between gap-1">
        <div className="min-w-0">
          <span className="font-display text-xs sm:text-sm font-semibold text-foreground">
            ₹{product.price}
          </span>
          {product.mrp && product.mrp > product.price && (
            <span className="ml-1 text-[9px] text-muted-foreground line-through">
              ₹{product.mrp}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleAddClick}
          className={`press flex h-7 w-7 items-center justify-center rounded-full transition-all duration-200 shrink-0 shadow-2xs ${
            added
              ? "bg-emerald-600 text-white scale-105"
              : "bg-primary/10 text-primary hover:bg-primary hover:text-white"
          }`}
          aria-label={`Add ${product.name} to cart`}
        >
          {added ? (
            <Check className="h-3.5 w-3.5 animate-in zoom-in duration-150" />
          ) : (
            <Plus className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}
