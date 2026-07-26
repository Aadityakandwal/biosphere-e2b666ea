import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, X, Leaf, ShoppingBag } from "lucide-react";
import { services, products } from "@/lib/data";

type Result =
  | { kind: "service"; id: string; name: string; sub?: string; price: number; image?: string }
  | { kind: "product"; id: string; name: string; sub?: string; price: number; image?: string };

function buildIndex(): Result[] {
  const s: Result[] = services.map((x) => ({
    kind: "service",
    id: x.slug,
    name: x.name,
    sub: "Service",
    price: x.price,
    image: x.image,
  }));
  const p: Result[] = products.map((x) => ({
    kind: "product",
    id: x.id,
    name: x.name,
    sub: x.category.charAt(0).toUpperCase() + x.category.slice(1),
    price: x.price,
    image: x.image,
  }));
  return [...s, ...p];
}

export function SearchBar() {
  const navigate = useNavigate();
  const [q, setQ] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const index = React.useMemo(buildIndex, []);

  React.useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const term = q.trim().toLowerCase();
  const results = React.useMemo(() => {
    if (!term) return [];
    return index
      .filter((r) => r.name.toLowerCase().includes(term) || (r.sub ?? "").toLowerCase().includes(term))
      .slice(0, 8);
  }, [term, index]);

  const go = (r: Result) => {
    setOpen(false);
    setQ("");
    if (r.kind === "service") navigate({ to: "/services/$slug", params: { slug: r.id } });
    else navigate({ to: "/shop/$productId", params: { productId: r.id } });
  };

  return (
    <div ref={wrapRef} className="relative mt-2">
      <label className="flex items-center gap-3 rounded-full border border-border bg-card px-5 py-3.5 shadow-soft transition focus-within:border-primary/40 focus-within:shadow-elevated">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && results[0]) go(results[0]);
            if (e.key === "Escape") setOpen(false);
          }}
          placeholder="Search services & products..."
          className="w-full border-0 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
        />
        {q && (
          <button type="button" onClick={() => setQ("")} aria-label="Clear search" className="press text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        )}
      </label>

      {open && term.length > 0 && (
        <div className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-3xl border border-border bg-card shadow-elevated">
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
