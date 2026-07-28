import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/Shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart, useOrders, useProfile } from "@/lib/stores";
import { useRazorpay } from "@/lib/use-razorpay";
import { ArrowLeft, CheckCircle2, Loader2, Lock, ShieldCheck, XCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Secure checkout — Biosphere" },
      { name: "description", content: "Pay for your Biosphere plant care order securely with Razorpay test mode. No real money is charged." },
      { property: "og:title", content: "Secure checkout — Biosphere" },
      { property: "og:description", content: "Pay for your Biosphere order securely with Razorpay test mode." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const navigate = useNavigate();
  const { items, clear } = useCart();
  const addOrder = useOrders((s) => s.add);
  const setStatus = useOrders((s) => s.setStatus);
  const profile = useProfile();
  const { pay, loading } = useRazorpay();

  const subtotal = items.reduce((n, i) => n + i.price * i.qty, 0);
  const shipping = items.length ? 49 : 0;
  const total = subtotal + shipping;

  const [stage, setStage] = useState<"form" | "done">("form");
  const [orderId, setOrderId] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [failure, setFailure] = useState("");

  const startPayment = () => {
    setFailure("");
    const id = "ord-" + Date.now();
    void pay({
      amount: total,
      kind: "shop",
      label: `Biosphere order (${items.length} item${items.length > 1 ? "s" : ""})`,
      receipt: id,
      prefill: { name: profile.name, email: profile.email, contact: profile.phone },
      onSuccess: (pid) => {
        addOrder({
          id,
          date: new Date().toISOString().slice(0, 10),
          total,
          items: items.map((i) => `${i.name} x${i.qty}`),
          status: "Placed",
          images: items.map((i) => i.image).filter(Boolean) as string[],
          paymentId: pid,
        });
        setStatus(id, "Placed", pid);
        clear();
        setOrderId(id);
        setPaymentId(pid);
        setStage("done");
        toast.success("Payment successful — order confirmed");
      },
      onFailure: (msg) => {
        setFailure(msg);
        toast.error(msg);
      },
      onDismiss: () => toast.info("Payment cancelled — your cart is safe"),
    });
  };

  if (items.length === 0 && stage !== "done") {
    return (
      <Shell title="Checkout">
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
          <h1 className="mt-5 font-display text-2xl font-bold tracking-tight">Payment successful</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            ₹{total} paid via Razorpay test mode. No real money moved.
          </p>
          <Card className="mt-6 w-full p-4 text-left text-sm">
            <Row k="Order ID" v={orderId} />
            <Row k="Payment ID" v={<span className="font-mono text-xs">{paymentId}</span>} />
            <Row k="Amount" v={`₹${total}`} />
            <Row k="Status" v={<span className="font-semibold text-primary">Paid · Placed</span>} />
          </Card>
          <Button className="mt-6 w-full" onClick={() => navigate({ to: "/orders" })}>View order</Button>
          <Link to="/shop" className="mt-3 text-sm font-semibold text-primary hover:underline">Continue shopping</Link>
        </div>
      </Shell>
    );
  }

  return (
    <Shell title="Checkout">
      <Link to="/cart" className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to cart
      </Link>

      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-foreground/80">
        <p className="font-semibold">Razorpay test mode — no real payment</p>
        <p className="mt-0.5">Use test card <span className="font-mono font-semibold">4111 1111 1111 1111</span>, any future expiry, any CVV, and OTP <span className="font-mono font-semibold">1111</span>. UPI test id: <span className="font-mono font-semibold">success@razorpay</span>.</p>
      </div>

      <Card className="mt-4 p-4 text-sm">
        {items.map((i) => (
          <Row key={i.id} k={<span className="text-muted-foreground">{i.name} × {i.qty}</span>} v={`₹${i.price * i.qty}`} />
        ))}
        <div className="my-2 border-t border-border" />
        <Row k="Subtotal" v={`₹${subtotal}`} />
        <Row k="Shipping" v={`₹${shipping}`} />
        <div className="my-2 border-t border-border" />
        <Row k={<strong>Total</strong>} v={<strong>₹{total}</strong>} />
      </Card>

      {failure && (
        <Card className="mt-4 flex items-start gap-3 border-destructive/40 bg-destructive/5 p-4">
          <XCircle className="mt-0.5 h-5 w-5 flex-none text-destructive" />
          <div>
            <p className="text-sm font-semibold text-destructive">Payment failed</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{failure} You have not been charged — try again below.</p>
          </div>
        </Card>
      )}

      <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5" /> Card details are entered on Razorpay's secure checkout, never on this app.
      </p>

      <div className="fixed inset-x-0 bottom-14 z-30">
        <div className="mx-auto flex max-w-md items-center border-t border-border bg-background/95 px-4 py-3 backdrop-blur">
          <Button className="w-full" onClick={startPayment} disabled={loading}>
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Opening Razorpay…</>
            ) : (
              <><Lock className="mr-2 h-4 w-4" /> Pay ₹{total}</>
            )}
          </Button>
        </div>
      </div>
      <div className="h-20" />
    </Shell>
  );
}

function Row({ k, v }: { k: React.ReactNode; v: React.ReactNode }) {
  return <div className="flex justify-between py-1"><span>{k}</span><span>{v}</span></div>;
}
