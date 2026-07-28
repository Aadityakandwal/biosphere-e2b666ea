import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/Shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart, useOrders } from "@/lib/stores";
import { ArrowLeft, CheckCircle2, CreditCard, Loader2, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Test checkout — Biosphere" },
      { name: "description", content: "Simulated sandbox checkout for testing the Biosphere payment flow. No real money is charged." },
      { property: "og:title", content: "Test checkout — Biosphere" },
      { property: "og:description", content: "Simulated sandbox checkout for testing the Biosphere payment flow." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CheckoutPage,
});

const TEST_CARD = "4242 4242 4242 4242";

const digits = (s: string) => s.replace(/\D/g, "");
const formatCard = (s: string) => digits(s).slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
const formatExpiry = (s: string) => {
  const d = digits(s).slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

function validate(f: { name: string; card: string; expiry: string; cvc: string }) {
  const e: Record<string, string> = {};
  if (!f.name.trim()) e.name = "Name on card is required";
  else if (f.name.trim().length > 60) e.name = "Name is too long";
  if (digits(f.card).length !== 16) e.card = "Enter the 16-digit test card number";
  const [mm, yy] = f.expiry.split("/");
  const month = Number(mm);
  if (digits(f.expiry).length !== 4 || !month || month < 1 || month > 12 || Number(yy) < 25) {
    e.expiry = "Use a valid future date (MM/YY)";
  }
  if (digits(f.cvc).length !== 3) e.cvc = "CVC must be 3 digits";
  return e;
}

function CheckoutPage() {
  const navigate = useNavigate();
  const { items, clear } = useCart();
  const addOrder = useOrders((s) => s.add);

  const subtotal = items.reduce((n, i) => n + i.price * i.qty, 0);
  const shipping = items.length ? 49 : 0;
  const total = subtotal + shipping;

  const [f, setF] = useState({ name: "", card: "", expiry: "", cvc: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [stage, setStage] = useState<"form" | "processing" | "done">("form");
  const [orderId, setOrderId] = useState("");

  const set = (k: keyof typeof f, v: string) => {
    setF((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: "" }));
  };

  const pay = () => {
    const e = validate(f);
    setErrors(e);
    if (Object.keys(e).length) {
      toast.error("Please fix the highlighted fields");
      return;
    }
    setStage("processing");
    window.setTimeout(() => {
      const id = "ord-" + Date.now();
      addOrder({
        id,
        date: new Date().toISOString().slice(0, 10),
        total,
        items: items.map((i) => `${i.name} x${i.qty}`),
        status: "Placed",
        images: items.map((i) => i.image).filter(Boolean) as string[],
      });
      clear();
      setOrderId(id);
      setStage("done");
    }, 1800);
  };

  if (items.length === 0 && stage !== "done") {
    return (
      <Shell title="Test checkout">
        <Card className="mt-6 p-8 text-center">
          <p className="text-sm text-muted-foreground">Your cart is empty.</p>
          <Link to="/shop"><Button className="mt-4">Browse shop</Button></Link>
        </Card>
      </Shell>
    );
  }

  if (stage === "done") {
    return (
      <Shell title="Payment successful">
        <div className="mt-10 flex flex-col items-center text-center rise-in">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CheckCircle2 className="h-10 w-10" />
          </span>
          <h1 className="mt-5 font-display text-2xl font-bold tracking-tight">Test payment successful</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            ₹{total} charged in sandbox mode. No real money moved.
          </p>
          <Card className="mt-6 w-full p-4 text-left text-sm">
            <Row k="Order ID" v={orderId} />
            <Row k="Amount" v={`₹${total}`} />
            <Row k="Card" v={`•••• ${digits(f.card).slice(-4)}`} />
            <Row k="Mode" v="Sandbox / test" />
          </Card>
          <Button className="mt-6 w-full" onClick={() => navigate({ to: "/orders" })}>View order</Button>
          <Link to="/shop" className="mt-3 text-sm font-semibold text-primary hover:underline">Continue shopping</Link>
        </div>
      </Shell>
    );
  }

  return (
    <Shell title="Test checkout">
      <Link to="/cart" className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to cart
      </Link>

      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-foreground/80">
        <p className="font-semibold">Sandbox mode — no real payment</p>
        <p className="mt-0.5">
          Use test card <button type="button" onClick={() => set("card", formatCard(TEST_CARD))} className="font-mono font-semibold text-primary underline">{TEST_CARD}</button>, any future expiry and any 3-digit CVC.
        </p>
      </div>

      <Card className="mt-4 p-4 text-sm">
        <Row k="Subtotal" v={`₹${subtotal}`} />
        <Row k="Shipping" v={`₹${shipping}`} />
        <div className="my-2 border-t border-border" />
        <Row k={<strong>Total</strong>} v={<strong>₹{total}</strong>} />
      </Card>

      <Card className="mt-4 space-y-3 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <CreditCard className="h-4 w-4 text-primary" /> Card details
        </div>

        <Field label="Name on card" error={errors.name}>
          <Input value={f.name} maxLength={60} onChange={(e) => set("name", e.target.value)} placeholder="Arjun Kapoor" />
        </Field>

        <Field label="Card number" error={errors.card}>
          <Input value={f.card} inputMode="numeric" onChange={(e) => set("card", formatCard(e.target.value))} placeholder="4242 4242 4242 4242" className="font-mono" />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Expiry" error={errors.expiry}>
            <Input value={f.expiry} inputMode="numeric" onChange={(e) => set("expiry", formatExpiry(e.target.value))} placeholder="MM/YY" className="font-mono" />
          </Field>
          <Field label="CVC" error={errors.cvc}>
            <Input value={f.cvc} inputMode="numeric" onChange={(e) => set("cvc", digits(e.target.value).slice(0, 3))} placeholder="123" className="font-mono" />
          </Field>
        </div>

        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5" /> Details are never sent anywhere — this is a local test flow.
        </p>
      </Card>

      <div className="fixed inset-x-0 bottom-14 z-30">
        <div className="mx-auto flex max-w-md items-center border-t border-border bg-background/95 px-4 py-3 backdrop-blur">
          <Button className="w-full" onClick={pay} disabled={stage === "processing"}>
            {stage === "processing" ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing…</>
            ) : (
              <><Lock className="mr-2 h-4 w-4" /> Pay ₹{total} (test)</>
            )}
          </Button>
        </div>
      </div>
      <div className="h-20" />
    </Shell>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <div className="mt-1">{children}</div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function Row({ k, v }: { k: React.ReactNode; v: React.ReactNode }) {
  return <div className="flex justify-between py-1"><span>{k}</span><span>{v}</span></div>;
}
