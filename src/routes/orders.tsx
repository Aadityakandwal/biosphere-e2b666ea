import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/Shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useOrders } from "@/lib/stores";
import { Download, Truck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "Order History — Biosphere" },
      {
        name: "description",
        content:
          "View your Biosphere order history to track current deliveries and review past purchases of plant care products and services.",
      },
      { property: "og:title", content: "Order History — Biosphere" },
      {
        property: "og:description",
        content: "Track current deliveries and review past Biosphere plant care purchases in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OrdersPage,
});

function OrdersPage() {
  const orders = useOrders(s => s.orders);
  return (
    <Shell title="Order history">
      <div className="mt-3 space-y-3">
        {orders.length === 0 && <Card className="p-8 text-center text-sm text-muted-foreground">No orders yet.</Card>}
        {orders.map(o => (
          <Card key={o.id} className="p-4">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium">{o.id}</p>
                <p className="text-xs text-muted-foreground">{o.date}</p>
              </div>
              <p className="text-sm font-semibold">₹{o.total}</p>
            </div>
            <p className="mt-2 text-sm">{o.items.join(", ")}</p>
            <p className="mt-1 text-xs text-primary">{o.status}</p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="outline" onClick={() => toast.success("Invoice downloaded")}><Download className="mr-1 h-3 w-3" /> Invoice</Button>
              <Button size="sm" variant="outline" onClick={() => toast.info("Out for delivery")}><Truck className="mr-1 h-3 w-3" /> Track</Button>
            </div>
          </Card>
        ))}
      </div>
    </Shell>
  );
}
