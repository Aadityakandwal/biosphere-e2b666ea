import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, X, Leaf, ShoppingBag } from "lucide-react";
import { services, products } from "@/lib/data";

type Result = {
  kind: "service" | "product";
  id: string;
  name: string;
  sub?: string;
  price: number;
  image?: string;
  haystack: string;
};

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();

function buildIndex(): Result[] {
  const s: Result[] = services.map((x) => ({
    kind: "service" as const,
    id: x.slug,
    name: x.name,
    sub: "Service",
    price: x.price,
    image: x.image,
    haystack: norm([x.name, x.category, x.description, x.slug, "service"].join(" ")),
  }));
  const p: Result[] = products.map((x) => ({
    kind: "product" as const,
    id: x.id,
    name: x.name,
    sub: x.category.charAt(0).toUpperCase() + x.category.slice(1),
    price: x.price,
    image: x.image,
    haystack: norm(
      [x.name, x.category, (x as { short?: string }).short ?? "", (x as { description?: string }).description ?? "", "product"].join(" ")
    ),
  }));
  return [...s, ...p];
}

function score(r: Result, tokens: string[]): number {
  const name = norm(r.name);
  let total = 0;
  for (const t of tokens) {
    if (name.startsWith(t)) total += 100;
    else if (name.includes(t)) total += 60;
    else if (r.haystack.includes(t)) total += 25;
    else if (t.length >= 4 && r.haystack.split(" ").some((w) => w.startsWith(t.slice(0, Math.max(3, t.length - 1))))) total += 10;
    else return -1;
  }
  return total;
}

export function SearchBar({
  value,
  onValueChange,
  placeholder = "Search services & products...",
  scope = "all",
}: {
  value?: string;
  onValueChange?: (v: string) => void;
  placeholder?: string;
  scope?: "all" | "products" | "services";
} = {}) {
  const navigate = useNavigate();
  const [inner, setInner] = React.useState("");
  const q = value !== undefined ? value : inner;
  const setQ = React.useCallback(
    (v: string) => {
      if (value === undefined) setInner(v);
      onValueChange?.(v);
    },
    [value, onValueChange]
  );
  const [open, setOpen] = React.useState(false);
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const index = React.useMemo(
    () => buildIndex().filter((r) => (scope === "all" ? true : scope === "products" ? r.kind === "product" : r.kind === "service")),
    [scope]
  );

  React.useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const term = norm(q);
  const results = React.useMemo(() => {
    if (!term) return [];
    const tokens = term.split(" ").filter(Boolean);
    return index
      .map((r) => ({ r, s: score(r, tokens) }))
      .filter((x) => x.s >= 0)
      .sort((a, b) => b.s - a.s || a.r.name.localeCompare(b.r.name))
      .slice(0, 8)
      .map((x) => x.r);
  }, [term, index]);


  const go = (r: Result) => {
    setOpen(false);
    setQ("");
    if (r.kind === "service") navigate({ to: "/services/$slug", params: { slug: r.id } });
    else navigate({ to: "/shop/$productId", params: { productId: r.id } });
  };

  const clear = () => {
    setQ("");
    setOpen(false);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  return (
    <div ref={wrapRef} className="relative z-30 mt-2">
      <div className="flex items-center gap-3 rounded-full border border-border bg-card px-5 py-3.5 shadow-soft transition focus-within:border-primary/40 focus-within:shadow-elevated">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => {
            const next = e.target.value;
            setQ(next);
            setOpen(norm(next).length > 0);
          }}
          onFocus={() => setOpen(term.length > 0)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && results[0]) go(results[0]);
            if (e.key === "Escape") setOpen(false);
          }}
          placeholder={placeholder}
          className="w-full border-0 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
        />
        {q && (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={clear}
            aria-label="Clear search"
            className="press text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && term.length > 0 && (
        <div className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-[80] overflow-hidden rounded-3xl border border-border bg-card shadow-elevated">
          {results.length === 0 ? (
            <p className="px-5 py-6 text-center text-sm text-muted-foreground">
              No results for “{q.trim()}”
            </p>
          ) : (
            <ul className="max-h-80 overflow-y-auto py-1">
              {results.map((r) => (
                <li key={`${r.kind}-${r.id}`}>
                  <button
                    type="button"
                      onMouseDown={(e) => e.preventDefault()}
                    onClick={() => go(r)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-muted"
                  >
                    {r.image ? (
                      <img src={r.image} alt="" className="h-10 w-10 flex-none rounded-xl object-cover" />
                    ) : (
                      <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-muted text-primary">
                        {r.kind === "service" ? <Leaf className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{r.name}</span>
                      <span className="block text-xs text-muted-foreground">{r.sub}</span>
                    </span>
                    <span className="text-sm font-bold text-primary">₹{r.price}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
