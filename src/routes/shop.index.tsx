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
    tab: typeof search.cat === "string" ? search.cat : undefined,
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
      <div className="pb-12 space-y-5 sm:space-y-6">
        {/* =========================================================================
            1. REFINED EDITORIAL SHOP HERO
            ========================================================================= */}
        <section className="px-5 pt-1">
          <div className="space-y-1">
            <span className="inline-block text-[10px] font-bold uppercase tracking-[0.18em] text-[#556B5C]">
              GARDEN ESSENTIALS
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#162A1F]">
              Everything Your Garden Needs
            </h1>
            <p className="text-xs text-[#526357] leading-relaxed">
              Thoughtfully selected plants, tools and organic products for everyday growing.
            </p>
          </div>
        </section>

        {/* =========================================================================
            2. SEARCH BAR & DISCOVERY CATEGORIES
            ========================================================================= */}
        <section className="px-5 space-y-2.5">
          <SearchBar
            value={searchQuery}
            onValueChange={setSearchQuery}
            scope="products"
            placeholder="Search plants, tools, bio tonics, planters…"
          />

          {/* Horizontal Category Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((c) => {
              const active = activeCategory === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={`press flex flex-none items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200 ${
                    active
                      ? "bg-[#18392B] text-white shadow-soft font-semibold"
                      : "border border-[#E2DDD2] bg-[#FAF8F3] text-[#556B5C] hover:border-[#CAD4C5]"
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
        <section className="px-5">
          <div className="flex items-center justify-between rounded-[20px] border border-[#DCE5DA] bg-[#EBF0E8] p-3 text-xs shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#DEE7DB] text-[#18392B]">
                <Coins className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="font-bold text-[#183626] text-xs leading-none">Earn Green Points</p>
                <p className="text-[10px] text-[#55695B] mt-0.5">
                  Get 5% back in points on every botanical purchase
                </p>
              </div>
            </div>
            <Link
              to="/profile"
              className="rounded-full bg-[#18392B] px-3 py-1 text-[10px] font-semibold text-white hover:bg-[#122D22] press shrink-0 shadow-2xs"
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
            <div className="px-5 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#556B5C]">
                  FEATURED
                </span>
                <h2 className="font-display text-base font-bold tracking-tight text-[#183626]">
                  Curated for Your Garden
                </h2>
              </div>
            </div>

            {/* Horizontal Curated Scroll Track */}
            <div className="flex gap-3.5 overflow-x-auto px-5 pb-2 scrollbar-none snap-x snap-mandatory">
              {featuredProducts.map((product) => (
                <div
                  key={product.id}
                  className="w-60 flex-none snap-start group rounded-[24px] border border-[#E6E0D4] bg-[#FAF8F3] p-3 shadow-2xs transition-all hover:border-[#CAD4C5] flex flex-col justify-between"
                >
                  <Link
                    to="/shop/$productId"
                    params={{ productId: product.id }}
                    className="block space-y-2.5"
                  >
                    <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl bg-[#E5ECE5]">
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {product.popular && (
                        <span className="absolute left-2.5 top-2.5 rounded-full bg-[#18392B] px-2 py-0.5 text-[8px] font-bold tracking-wider text-white">
                          POPULAR
                        </span>
                      )}
                    </div>

                    <div className="space-y-0.5 px-0.5">
                      <span className="text-[8.5px] font-bold uppercase tracking-[0.14em] text-[#556B5C]">
                        {SECTION_META[product.category]?.categoryLabel || "ESSENTIAL"}
                      </span>
                      <h3 className="font-display text-xs sm:text-sm font-bold tracking-tight text-[#183626] line-clamp-1 group-hover:text-[#18392B] transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-[10px] text-[#65796C] line-clamp-1 leading-snug">
                        {product.short}
                      </p>
                    </div>
                  </Link>

                  <div className="mt-3 pt-2.5 border-t border-[#EBE6DC] flex items-center justify-between">
                    <div>
                      <span className="font-display text-xs sm:text-sm font-bold text-[#183626]">
                        ₹{product.price}
                      </span>
                      {product.mrp && product.mrp > product.price && (
                        <span className="ml-1 text-[9px] text-[#8A9C90] line-through">
                          ₹{product.mrp}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleAddToCart(product, e)}
                      className="press inline-flex items-center gap-1 rounded-full bg-[#18392B] px-3 py-1 text-[10px] font-semibold text-white shadow-soft hover:bg-[#122D22]"
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
          ["plants", "biovelocity", "tools", "pots"].map((catKey) => {
            const items = products.filter((p) => p.category === catKey);
            const meta = SECTION_META[catKey];
            if (items.length === 0 || !meta) return null;

            return (
              <section key={catKey} className="px-5 space-y-3">
                <div className="flex items-center justify-between border-b border-[#E6E0D4] pb-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs">{meta.emoji}</span>
                      <h2 className="font-display text-base font-bold tracking-tight text-[#183626]">
                        {meta.title}
                      </h2>
                    </div>
                    <p className="text-[10px] text-[#65796C] mt-0.5 line-clamp-1">
                      {meta.subtitle}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCategory(catKey)}
                    className="press flex items-center gap-0.5 text-[11px] font-semibold text-[#18392B] hover:underline shrink-0 ml-2"
                  >
                    <span>View all</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* 2-Column Clean Editorial Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {items.map((p) => (
                    <ProductCard key={p.id} product={p} onAdd={handleAddToCart} />
                  ))}
                </div>
              </section>
            );
          })
        ) : (
          <section className="px-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-base font-bold tracking-tight text-[#183626]">
                  {searchQuery.trim()
                    ? `Search Results for "${searchQuery}"`
                    : SECTION_META[activeCategory]?.title || "Products"}
                </h2>
                <p className="text-[11px] text-[#65796C]">
                  {filteredProducts.length} items available
                </p>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="rounded-[24px] border border-[#E6E0D4] bg-[#FAF8F3] p-8 text-center space-y-2">
                <p className="font-display text-base font-bold text-[#183626]">
                  No products found
                </p>
                <p className="text-xs text-[#65796C]">
                  Try clearing your search or selecting another category.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setCategory("all");
                  }}
                  className="mt-2 rounded-full bg-[#18392B] px-4 py-2 text-xs font-semibold text-white shadow-soft"
                >
                  View All Products
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
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
    <div className="group rounded-[22px] border border-[#E6E0D4] bg-[#FAF8F3] p-2.5 sm:p-3 shadow-2xs transition-all duration-200 hover:border-[#CAD4C5] flex flex-col justify-between">
      <Link
        to="/shop/$productId"
        params={{ productId: product.id }}
        className="block space-y-2"
      >
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-[#E5ECE5]">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
          {product.popular && (
            <span className="absolute left-2 top-2 rounded-full bg-[#18392B] px-2 py-0.5 text-[8px] font-bold tracking-wider text-white">
              POPULAR
            </span>
          )}
        </div>

        <div className="space-y-0.5 px-0.5">
          <span className="text-[8px] font-bold uppercase tracking-[0.14em] text-[#556B5C]">
            {SECTION_META[product.category]?.categoryLabel || "PRODUCT"}
          </span>
          <h3 className="font-display text-xs sm:text-sm font-bold tracking-tight text-[#183626] line-clamp-1 group-hover:text-[#18392B] transition-colors">
            {product.name}
          </h3>
          <p className="text-[10px] text-[#65796C] line-clamp-1 leading-snug">
            {product.short}
          </p>
        </div>
      </Link>

      <div className="mt-2.5 pt-2 border-t border-[#EBE6DC] flex items-center justify-between gap-1">
        <div className="min-w-0">
          <span className="font-display text-xs sm:text-sm font-bold text-[#183626]">
            ₹{product.price}
          </span>
          {product.mrp && product.mrp > product.price && (
            <span className="ml-1 text-[9px] text-[#8A9C90] line-through">
              ₹{product.mrp}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleAddClick}
          className={`press flex h-7 w-7 items-center justify-center rounded-full transition-all duration-200 shrink-0 shadow-2xs ${
            added
              ? "bg-[#18392B] text-white scale-105"
              : "bg-[#E5ECE5] text-[#18392B] hover:bg-[#18392B] hover:text-white"
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

