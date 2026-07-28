import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/Shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { membershipPlans } from "@/lib/data";
import { useProfile, type PlanId } from "@/lib/stores";
import { ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/profile/membership")({
  head: () => ({ meta: [{ title: "Membership — Biosphere" }] }),
  component: MembershipPage,
});

function MembershipPage() {
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");
  const plan = useProfile((s) => s.plan);
  const setPlan = useProfile((s) => s.setPlan);
  const factor = cycle === "monthly" ? 1 : 10;

  return (
    <Shell>
      <Link to="/profile" className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4" /> Back</Link>
      <h1 className="font-display text-2xl font-semibold">Membership Pass</h1>
      <p className="mt-1 text-sm text-muted-foreground">Save on visits, unlock AI scans, and priority support.</p>

      <div className="mt-4 inline-flex rounded-full border border-border bg-card p-1">
        {(["monthly","yearly"] as const).map(c => (
          <button key={c} onClick={() => setCycle(c)} className={`rounded-full px-4 py-1.5 text-sm capitalize ${cycle === c ? "bg-primary text-primary-foreground" : ""}`}>{c}</button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {membershipPlans.map(p => (
          <Card key={p.id} className={`p-4 ${plan === p.id ? "ring-2 ring-primary" : p.popular ? "ring-2 ring-primary/40" : ""}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-display text-xl font-semibold">{p.name}</p>
                {p.popular && <Badge className="mt-1">Most Popular</Badge>}
              </div>
              <div className="text-right">
                <p className="text-2xl font-semibold">₹{p.price * factor}</p>
                <p className="text-xs text-muted-foreground">/{cycle === "monthly" ? "mo" : "yr"}</p>
              </div>
            </div>
            <ul className="mt-3 space-y-1.5 text-sm">
              {p.perks.map(perk => (
                <li key={perk} className="flex gap-2"><Check className="h-4 w-4 flex-none text-primary" /> <span>{perk}</span></li>
              ))}
            </ul>
            <Button className="mt-4 w-full" onClick={() => { setPlan(p.id as PlanId); toast.success(`${p.name} plan activated`); }}>{plan === p.id ? "Current plan" : `Choose ${p.name}`}</Button>
          </Card>
        ))}
      </div>
    </Shell>
  );
}
