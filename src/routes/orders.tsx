import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/Shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useOrders } from "@/lib/stores";
import { Download, Truck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/orders")({
  head: () => ({ meta: [{ title: "Order history — Biosphere" }, { name: "description", content: "Your past and current orders." }] }),
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
