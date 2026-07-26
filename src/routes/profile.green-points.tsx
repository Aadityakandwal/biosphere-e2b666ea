import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/Shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/lib/stores";
import { products } from "@/lib/data";
import { ArrowLeft, Leaf, Sparkles, Gift, Check } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/profile/green-points")({
  head: () => ({
    meta: [
      { title: "Green Points — Biosphere" },
      { name: "description", content: "Track your Biosphere Green Points balance and redeem them for plant care products and service perks." },
      { property: "og:title", content: "Green Points — Biosphere" },
      { property: "og:description", content: "Track your Green Points and redeem rewards on Biosphere." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GreenPointsPage,
});

type Reward = { id: string; name: string; sub: string; cost: number; image: string };

const rewards: Reward[] = [
  { id: "neerva", name: "Neerva — Bio Growth Tonic (1L)", sub: "Biovelocity", cost: 2500, image: products.find((x) => x.id === "neerva")!.image },
  { id: "biorooter", name: "BioRooter Starter", sub: "Biovelocity", cost: 1800, image: products.find((x) => x.id === "biorooter")!.image },
  { id: "terracotta", name: "Terracotta Pot (Medium)", sub: "Pots", cost: 1500, image: products.find((x) => x.id === "terracotta")!.image },
  { id: "video-consult", name: "Free Video Consultation", sub: "30 min with a botanist", cost: 1200, image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400" },
];

function GreenPointsPage() {
  const p = useProfile();
  const next = rewards.filter((r) => r.cost > p.greenPoints).sort((a, b) => a.cost - b.cost)[0];
  const pct = next ? Math.min(100, Math.round((p.greenPoints / next.cost) * 100)) : 100;

  const redeem = (r: Reward) => {
    if (p.greenPoints < r.cost) return toast.error("Not enough Green Points yet");
    p.update({ greenPoints: p.greenPoints - r.cost } as any);
    toast.success(`${r.name} redeemed — we'll take it from here.`);
  };

  return (
    <Shell>
      <Link to="/profile" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      {/* Balance */}
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary to-leaf p-6 text-primary-foreground shadow-[var(--shadow-soft)]">
        <Leaf className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 opacity-15" />
        <p className="text-xs font-medium uppercase tracking-[0.18em] opacity-80">Green Points</p>
        <p className="mt-1 font-display text-5xl font-semibold leading-none">{p.greenPoints.toLocaleString()}</p>
        {next && (
          <div className="mt-5">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-primary-foreground/25">
              <div className="h-full rounded-full bg-primary-foreground transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-2 text-xs opacity-85">
              {(next.cost - p.greenPoints).toLocaleString()} more to unlock {next.name}
            </p>
          </div>
        )}
      </Card>

      {/* Rewards */}
      <div className="mt-7 flex items-center gap-2">
        <Gift className="h-4 w-4 text-primary" />
        <h1 className="font-display text-lg font-semibold">Redeem rewards</h1>
      </div>

      <div className="mt-3 space-y-3">
        {rewards.map((r) => {
          const ok = p.greenPoints >= r.cost;
          return (
            <Card
              key={r.id}
              className="flex items-center gap-3 rounded-2xl border-border/60 p-3 transition-shadow hover:shadow-[var(--shadow-soft)]"
            >
              <img src={r.image} alt={r.name} loading="lazy" className="h-16 w-16 shrink-0 rounded-xl bg-muted object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{r.name}</p>
                <p className="truncate text-xs text-muted-foreground">{r.sub}</p>
                <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-leaf/15 px-2 py-0.5 text-xs font-semibold text-primary">
                  <Leaf className="h-3 w-3" /> {r.cost.toLocaleString()} pts
                </span>
              </div>
              <Button size="sm" className="press rounded-full" onClick={() => redeem(r)} disabled={!ok}>
                {ok ? <Check className="mr-1 h-3.5 w-3.5" /> : null}
                Redeem
              </Button>
            </Card>
          );
        })}
      </div>

      <Card className="mt-6 flex items-start gap-3 rounded-2xl bg-muted/40 p-4">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p className="text-xs leading-relaxed text-muted-foreground">
          Points are added automatically after every completed service and order. Redeemed rewards ship with your next visit.
        </p>
      </Card>
    </Shell>
  );
}
