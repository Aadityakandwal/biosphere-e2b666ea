import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Shell } from "@/components/Shell";
import { Reveal } from "@/components/Reveal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { gardenCarePlans, type GardenCarePlan } from "@/lib/data";
import { useProfile, type PlanId } from "@/lib/stores";
import { useRazorpay } from "@/lib/use-razorpay";
import { useAuth } from "@/lib/use-auth";
import { ArrowLeft, Check, Loader2, ShieldCheck, Sparkles, Sprout } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/profile/membership")({
  head: () => ({ meta: [{ title: "Garden Care Plans — My Gardener" }] }),
  component: MembershipPage,
});

type FlowState = "idle" | "opening" | "verifying" | "success";

function MembershipPage() {
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");
  const plan = useProfile((s) => s.plan);
  const setPlan = useProfile((s) => s.setPlan);
  const profile = useProfile();
  const navigate = useNavigate();
  const { pay, loading } = useRazorpay();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [payingId, setPayingId] = useState<string | null>(null);
  const [flow, setFlow] = useState<FlowState>("idle");
  const [justActivated, setJustActivated] = useState<string | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const factor = cycle === "monthly" ? 1 : 10;

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  };

  function subscribe(p: GardenCarePlan) {
    if (authLoading || flow !== "idle") return;
    if (!isAuthenticated) {
      toast.info("Please sign in to subscribe to a Garden Care Plan");
      navigate({ to: "/auth", search: { redirect: "/profile/membership" } });
      return;
    }
    const amount = p.price * factor;
    setPayingId(p.id);
    setFlow("opening");
    void pay({
      amount,
      kind: "membership",
      label: `My Gardener ${p.name} (${cycle})`,
      receipt: `mem-${p.id}-${Date.now()}`.slice(0, 40),
      prefill: { name: profile.name, email: profile.email, contact: profile.phone },
      onSuccess: () => {
        setFlow("verifying");
        later(() => {
          setPlan(p.id as PlanId);
          setFlow("success");
          setJustActivated(p.id);
          toast.success(`${p.name} activated`);
          later(() => {
            setFlow("idle");
            setPayingId(null);
            navigate({ to: "/garden" });
          }, 1400);
          later(() => setJustActivated(null), 2600);
        }, 650);
      },
      onFailure: (m) => {
        setFlow("idle");
        setPayingId(null);
        toast.error(m);
      },
      onDismiss: () => {
        setFlow("idle");
        setPayingId(null);
      },
    });
  }

  const busy = flow !== "idle";
  const activePlan = gardenCarePlans.find((p) => p.id === payingId);

  return (
    <Shell>
      <Link
        to="/profile"
        className="mb-2 inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Profile
      </Link>
      <Reveal>
        <span className="text-xs font-bold uppercase tracking-widest text-primary">Botanical Stewardship</span>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">Garden Care Plans</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Dedicated on-site visits by My Gardener professionals, priority scheduling, and unlimited AI support.
        </p>
      </Reveal>

      {/* Billing Cycle Switcher */}
      <Reveal delay={80}>
        <div className="relative mt-4 inline-flex rounded-full border border-border bg-card p-1">
          <span
            aria-hidden
            className="absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-primary shadow-sm transition-transform duration-500 [transition-timing-function:var(--ease-out-soft)]"
            style={{ transform: cycle === "monthly" ? "translateX(0%)" : "translateX(100%)" }}
          />
          {(["monthly", "yearly"] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCycle(c)}
              className={`relative z-10 min-w-24 rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition-colors duration-300 ${
                cycle === c ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {c} {c === "yearly" && "(Save 17%)"}
            </button>
          ))}
        </div>
      </Reveal>

      <Reveal stagger className="mt-4 space-y-3">
        {gardenCarePlans.map((p) => {
          const isCurrent = plan === p.id;
          const isPaying = payingId === p.id && busy;
          return (
            <Card
              key={p.id}
              className={`surface p-5 transition-all duration-300 ${
                isCurrent ? "ring-2 ring-primary" : p.popular ? "ring-2 ring-primary/40 shadow-elevated" : ""
              } ${justActivated === p.id ? "plan-pop ring-pulse" : ""} ${
                busy && !isPaying ? "opacity-60" : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  {p.badge && (
                    <Badge className="bg-primary/10 text-[10px] font-bold text-primary">
                      {p.badge}
                    </Badge>
                  )}
                  <p className="mt-1 font-display text-lg font-bold text-foreground">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.visits} on-site visit{p.visits > 1 ? "s" : ""} / month
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-2xl font-bold text-foreground">
                    ₹{p.price * factor}
                  </p>
                  <p className="text-[10px] text-muted-foreground">/{cycle === "monthly" ? "mo" : "yr"}</p>
                </div>
              </div>

              <div className="mt-3 space-y-1.5 border-t border-border/60 pt-3 text-xs text-foreground/85">
                <p className="font-semibold text-foreground">Included in this plan:</p>
                {p.includedServices.map((inc) => (
                  <div key={inc} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-3.5 w-3.5 flex-none text-primary" />
                    <span>{inc}</span>
                  </div>
                ))}
              </div>

              <div className="mt-3 space-y-1.5 border-t border-border/40 pt-2 text-xs text-foreground/80">
                <p className="font-semibold text-foreground">Member Benefits:</p>
                {p.perks.map((perk) => (
                  <div key={perk} className="flex items-start gap-2">
                    <Sparkles className="mt-0.5 h-3.5 w-3.5 flex-none text-primary" />
                    <span>{perk}</span>
                  </div>
                ))}
              </div>

              <Button
                className="press mt-4 w-full rounded-full bg-primary font-semibold text-primary-foreground shadow-soft transition-all"
                disabled={isCurrent || loading || busy}
                onClick={() => subscribe(p)}
              >
                {isPaying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {flow === "verifying" ? "Verifying payment…" : "Opening payment…"}
                  </>
                ) : isCurrent ? (
                  <>
                    <Check className="mr-2 h-4 w-4" /> Current Active Plan
                  </>
                ) : (
                  `Subscribe to ${p.name} · ₹${p.price * factor}/${cycle === "monthly" ? "mo" : "yr"}`
                )}
              </Button>
            </Card>
          );
        })}
      </Reveal>

      {busy && (
        <div className="overlay-in fixed inset-0 z-50 flex items-end justify-center bg-background/60 p-4 sm:items-center">
          <div className="sheet-rise w-full max-w-sm rounded-3xl border border-border bg-card p-6 text-center shadow-xl">
            {flow === "success" ? (
              <>
                <div className="check-pop mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Sparkles className="h-7 w-7" />
                </div>
                <p className="mt-3 font-display text-lg font-bold text-foreground">
                  {activePlan?.name} Activated
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Your plan visits and benefits are live in your Garden Dashboard.</p>
              </>
            ) : (
              <>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {flow === "verifying" ? (
                    <ShieldCheck className="breathe h-7 w-7" />
                  ) : (
                    <Loader2 className="h-7 w-7 animate-spin" />
                  )}
                </div>
                <p className="mt-3 font-display text-lg font-bold text-foreground">
                  {flow === "verifying" ? "Verifying Payment" : "Opening Secure Checkout"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {flow === "verifying"
                    ? "Confirming transaction with Razorpay..."
                    : `Redirecting to Razorpay for ${activePlan?.name ?? "your plan"}.`}
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </Shell>
  );
}
