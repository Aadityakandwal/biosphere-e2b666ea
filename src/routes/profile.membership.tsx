import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Shell } from "@/components/Shell";
import { Reveal } from "@/components/Reveal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { membershipPlans } from "@/lib/data";
import { useProfile, type PlanId } from "@/lib/stores";
import { useRazorpay } from "@/lib/use-razorpay";
import { useAuth } from "@/lib/use-auth";
import { ArrowLeft, Check, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/profile/membership")({
  head: () => ({ meta: [{ title: "Membership — Biosphere" }] }),
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

  function subscribe(p: { id: string; name: string; price: number }) {
    if (authLoading || flow !== "idle") return;
    if (!isAuthenticated) {
      toast.info("Please sign in to buy a membership");
      navigate({ to: "/auth", search: { redirect: "/profile/membership" } });
      return;
    }
    const amount = p.price * factor;
    setPayingId(p.id);
    setFlow("opening");
    void pay({
      amount,
      kind: "membership",
      label: `Biosphere ${p.name} membership (${cycle})`,
      receipt: `mem-${p.id}-${Date.now()}`.slice(0, 40),
      prefill: { name: profile.name, email: profile.email, contact: profile.phone },
      onSuccess: () => {
        setFlow("verifying");
        later(() => {
          setPlan(p.id as PlanId);
          setFlow("success");
          setJustActivated(p.id);
          toast.success(`${p.name} membership activated`);
          later(() => {
            setFlow("idle");
            setPayingId(null);
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
  const activePlan = membershipPlans.find((p) => p.id === payingId);

  return (
    <Shell>
      <Link
        to="/profile"
        className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" /> Back
      </Link>
      <Reveal>
        <h1 className="font-display text-2xl font-semibold">Membership Pass</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Save on visits, unlock AI scans, and priority support.
        </p>
      </Reveal>

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
              className={`relative z-10 min-w-24 rounded-full px-4 py-1.5 text-sm capitalize transition-colors duration-300 ${
                cycle === c ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </Reveal>

      <Reveal stagger className="mt-4 space-y-3">
        {membershipPlans.map((p) => {
          const isCurrent = plan === p.id;
          const isPaying = payingId === p.id && busy;
          return (
            <Card
              key={p.id}
              className={`lift p-4 transition-[box-shadow,transform,border-color] duration-500 ${
                isCurrent ? "ring-2 ring-primary" : p.popular ? "ring-2 ring-primary/40" : ""
              } ${justActivated === p.id ? "plan-pop ring-pulse" : ""} ${
                busy && !isPaying ? "opacity-60" : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-display text-xl font-semibold">{p.name}</p>
                  {p.popular && <Badge className="mt-1">Most Popular</Badge>}
                </div>
                <div className="overflow-hidden text-right">
                  <p key={`${p.id}-${cycle}`} className="price-roll text-2xl font-semibold">
                    ₹{p.price * factor}
                  </p>
                  <p className="text-xs text-muted-foreground">/{cycle === "monthly" ? "mo" : "yr"}</p>
                </div>
              </div>
              <ul className="mt-3 space-y-1.5 text-sm">
                {p.perks.map((perk) => (
                  <li key={perk} className="flex gap-2">
                    <Check className="h-4 w-4 flex-none text-primary" /> <span>{perk}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="press mt-4 w-full transition-all duration-300"
                disabled={isCurrent || loading || busy}
                onClick={() => subscribe(p)}
              >
                <span className="inline-flex items-center transition-opacity duration-300">
                  {isPaying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {flow === "verifying" ? "Verifying payment…" : "Opening payment…"}
                    </>
                  ) : isCurrent ? (
                    <>
                      <Check className="mr-2 h-4 w-4" /> Current plan
                    </>
                  ) : (
                    `Get ${p.name} · ₹${p.price * factor}`
                  )}
                </span>
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
                <p className="mt-3 font-display text-lg font-semibold">
                  {activePlan?.name} activated
                </p>
                <p className="mt-1 text-sm text-muted-foreground">Your new benefits are live.</p>
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
                <p className="mt-3 font-display text-lg font-semibold">
                  {flow === "verifying" ? "Verifying payment" : "Opening secure payment"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {flow === "verifying"
                    ? "Hang tight while we confirm with Razorpay."
                    : `Redirecting to Razorpay for ${activePlan?.name ?? "your plan"}.`}
                </p>
                <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-muted">
                  <div className="shimmer h-full w-1/2 rounded-full bg-primary/60" />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </Shell>
  );
}
