import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/Shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { membershipPlans } from "@/lib/data";
import { useProfile, type PlanId } from "@/lib/stores";
import { useRazorpay } from "@/lib/use-razorpay";
import { useAuth } from "@/lib/use-auth";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/profile/membership")({
  head: () => ({ meta: [{ title: "Membership — Biosphere" }] }),
  component: MembershipPage,
});

function MembershipPage() {
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");
  const plan = useProfile((s) => s.plan);
  const setPlan = useProfile((s) => s.setPlan);
  const profile = useProfile();
  const navigate = useNavigate();
  const { pay, loading } = useRazorpay();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [payingId, setPayingId] = useState<string | null>(null);
  const factor = cycle === "monthly" ? 1 : 10;

  function subscribe(p: { id: string; name: string; price: number }) {
    if (authLoading) return;
    if (!isAuthenticated) {
      toast.info("Please sign in to buy a membership");
      navigate({ to: "/auth", search: { redirect: "/profile/membership" } });
      return;
    }
    const amount = p.price * factor;
    setPayingId(p.id);
    void pay({
      amount,
      kind: "membership",
      label: `Biosphere ${p.name} membership (${cycle})`,
      receipt: `mem-${p.id}-${Date.now()}`.slice(0, 40),
      prefill: { name: profile.name, email: profile.email, contact: profile.phone },
      onSuccess: () => {
        setPlan(p.id as PlanId);
        setPayingId(null);
        toast.success(`${p.name} membership activated`);
      },
      onFailure: (m) => { setPayingId(null); toast.error(m); },
      onDismiss: () => setPayingId(null),
    });
  }

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
            <Button
              className="mt-4 w-full"
              disabled={plan === p.id || loading}
              onClick={() => subscribe(p)}
            >
              {payingId === p.id && loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Opening payment…</>
              ) : plan === p.id ? "Current plan" : `Get ${p.name} · ₹${p.price * factor}`}
            </Button>
          </Card>
        ))}
      </div>
    </Shell>
  );
}
