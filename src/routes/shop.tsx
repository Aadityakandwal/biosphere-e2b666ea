import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/Shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { products } from "@/lib/data";
import { useCart, useOrders } from "@/lib/stores";
import { Search, SlidersHorizontal, Package, Download, Truck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop — Biosphere" },
      { name: "description", content: "Plants, tools, and Biovelocity growth products." },
      { property: "og:title", content: "Shop — Biosphere" },
      { property: "og:description", content: "Plants, tools, and Biovelocity growth products." },
    ],
  }),
  component: ShopPage,
});

const CATS = [
  { id: "all", label: "All" },
  { id: "plants", label: "Plants" },
  { id: "tools", label: "Tools" },
  { id: "biovelocity", label: "Biovelocity" },
  { id: "pots", label: "Pots" },
] as const;

function ShopPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const orders = useOrders((s) => s.orders);
  const add = useCart((s) => s.add);

  const filtered = products.filter(p =>
    (cat === "all" || p.category === cat) &&
    p.name.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <Shell title="Shop">
      <div className="mt-3 flex items-center gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search products…" className="border-0 bg-transparent p-0 focus-visible:ring-0" />
        </div>
        <Sheet>
          <SheetTrigger asChild><Button variant="outline" size="icon"><Package className="h-4 w-4" /></Button></SheetTrigger>
          <SheetContent side="right">
            <SheetHeader><SheetTitle>Your orders</SheetTitle></SheetHeader>
            <div className="mt-4 space-y-3">
              {orders.map(o => (
                <Card key={o.id} className="p-3">
                  <p className="text-sm font-medium">{o.id}</p>
                  <p className="text-xs text-muted-foreground">{o.date} · {o.items.join(", ")}</p>
                  <p className="mt-1 text-sm font-semibold">₹{o.total} · {o.status}</p>
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => toast.success("Invoice downloaded")}><Download className="mr-1 h-3 w-3" /> Invoice</Button>
                    <Button size="sm" variant="outline" onClick={() => toast.info("Package delivered on " + o.date)}><Truck className="mr-1 h-3 w-3" /> Track</Button>
                  </div>
                </Card>
              ))}
            </div>
          </SheetContent>
        </Sheet>
        <Button variant="outline" size="icon"><SlidersHorizontal className="h-4 w-4" /></Button>
      </div>

      <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {CATS.map(c => (
          <button key={c.id} onClick={() => setCat(c.id)} className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-sm ${cat === c.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}>{c.label}</button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 pb-6">
        {filtered.map(p => (
          <div key={p.id} className="overflow-hidden rounded-2xl border border-border bg-card">
            <Link to="/shop/$productId" params={{ productId: p.id }}>
              <img src={p.image} alt={p.name} className="aspect-square w-full object-cover" />
            </Link>
            <div className="p-3">
              <Link to="/shop/$productId" params={{ productId: p.id }}>
                <p className="line-clamp-2 text-sm font-medium">{p.name}</p>
              </Link>
              <p className="mt-1 text-sm font-semibold">₹{p.price}</p>
              <Button size="sm" className="mt-2 w-full" onClick={() => { add({ id: p.id, name: p.name, price: p.price, image: p.image }); toast.success("Added to cart"); }}>Add</Button>
            </div>
          </div>
        ))}
      </div>
    </Shell>
  );
}
