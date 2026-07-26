import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/Shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProfile } from "@/lib/stores";
import { products } from "@/lib/data";
import { ArrowLeft, Leaf } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/profile/green-points")({
  head: () => ({ meta: [{ title: "Green Points — Biosphere" }] }),
  component: GreenPointsPage,
});

function GreenPointsPage() {
  const p = useProfile();
  const neerva = products.find(x => x.id === "neerva")!;
  const cost = 2500;
  const redeem = () => {
    if (p.greenPoints < cost) return toast.error("Not enough Green Points");
    p.update({ greenPoints: p.greenPoints - cost } as any);
    toast.success("Neerva redeemed! We'll ship it out.");
  };

  return (
    <Shell>
      <Link to="/profile" className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4" /> Back</Link>
      <h1 className="font-display text-2xl font-semibold">Green Points</h1>

      <Card className="mt-4 bg-leaf/10 p-6 text-center">
        <Leaf className="mx-auto h-8 w-8 text-primary" />
        <p className="mt-2 font-display text-4xl font-semibold">{p.greenPoints}</p>
        
      </Card>

      <Card className="mt-4 p-4 text-sm">
        <p className="font-medium">How you earn</p>
        <ul className="mt-2 space-y-1 text-muted-foreground">
          <li>• Earn 50 Green Points for every ₹100 spent on services</li>
          <li>• 1 Green Point = ₹0.10</li>
          <li>• Redeem for Biovelocity products and more</li>
        </ul>
      </Card>

      <h2 className="mt-6 font-display text-lg font-semibold">Redeem</h2>
      <Card className="mt-2 flex items-center gap-3 p-3">
        <img src={neerva.image} alt="" className="h-16 w-16 rounded-lg object-cover" />
        <div className="flex-1">
          <p className="text-sm font-medium">{neerva.name}</p>
          <Badge className="mt-1" variant="secondary">2500 pts</Badge>
        </div>
        <Button size="sm" onClick={redeem} disabled={p.greenPoints < cost}>Redeem</Button>
      </Card>
    </Shell>
  );
}
