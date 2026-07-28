import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Shell } from "@/components/Shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/stores";
import { Minus, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Cart — Biosphere" }, { name: "description", content: "Review and checkout your items." }] }),
  component: CartPage,
});

function CartPage() {
  const { items, setQty, remove } = useCart();

  const navigate = useNavigate();
  const subtotal = items.reduce((n, i) => n + i.price * i.qty, 0);
  const shipping = items.length ? 49 : 0;
  const total = subtotal + shipping;

  const checkout = () => navigate({ to: "/checkout" });


  return (
    <Shell title="Your cart">
      {items.length === 0 ? (
        <Card className="mt-6 p-8 text-center">
          <p className="text-sm text-muted-foreground">Cart is empty.</p>
          <Link to="/shop"><Button className="mt-4">Browse shop</Button></Link>
        </Card>
      ) : (
        <>
          <div className="mt-3 space-y-3">
            {items.map(i => (
              <Card key={i.id} className="flex gap-3 overflow-hidden p-0">
                {i.image && <img src={i.image} alt="" className="h-24 w-24 flex-none object-cover" />}
                <div className="flex flex-1 flex-col p-3">
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-medium">{i.name}</p>
                    <button onClick={() => remove(i.id)}><Trash2 className="h-4 w-4 text-muted-foreground" /></button>
                  </div>
                  <p className="text-sm font-semibold">₹{i.price}</p>
                  <div className="mt-auto flex items-center gap-2">
                    <button onClick={() => setQty(i.id, i.qty - 1)} className="rounded border border-border p-1"><Minus className="h-3 w-3" /></button>
                    <span className="w-8 text-center text-sm">{i.qty}</span>
                    <button onClick={() => setQty(i.id, i.qty + 1)} className="rounded border border-border p-1"><Plus className="h-3 w-3" /></button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="mt-4 p-4 text-sm">
            <Row k="Subtotal" v={`₹${subtotal}`} />
            <Row k="Shipping" v={`₹${shipping}`} />
            <div className="my-2 border-t border-border" />
            <Row k={<strong>Total</strong>} v={<strong>₹{total}</strong>} />
          </Card>

          <div className="fixed inset-x-0 bottom-14 z-30">
            <div className="mx-auto flex max-w-md items-center border-t border-border bg-background/95 px-4 py-3 backdrop-blur">
              <Button className="w-full" onClick={checkout}>Checkout · ₹{total}</Button>
            </div>
          </div>
          <div className="h-20" />
        </>
      )}
    </Shell>
  );
}

function Row({ k, v }: { k: React.ReactNode; v: React.ReactNode }) {
  return <div className="flex justify-between py-1"><span>{k}</span><span>{v}</span></div>;
}
