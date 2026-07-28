import { useCallback, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { createRazorpayOrder, verifyRazorpayPayment } from "@/lib/razorpay.functions";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void; on: (e: string, cb: (r: unknown) => void) => void };
  }
}

const SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

function loadScript() {
  return new Promise<boolean>((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT}"]`);
    const el = existing ?? document.createElement("script");
    el.src = SCRIPT;
    el.async = true;
    el.addEventListener("load", () => resolve(true));
    el.addEventListener("error", () => resolve(false));
    if (!existing) document.body.appendChild(el);
  });
}

export type PayArgs = {
  amount: number; // rupees
  kind: "shop" | "service" | "membership";
  label: string;
  receipt: string;
  prefill?: { name?: string; email?: string; contact?: string };
  onSuccess: (paymentId: string, orderId: string) => void;
  onFailure?: (message: string) => void;
  onDismiss?: () => void;
};

export function useRazorpay() {
  const [loading, setLoading] = useState(false);
  const busy = useRef(false);
  const createOrder = useServerFn(createRazorpayOrder);
  const verify = useServerFn(verifyRazorpayPayment);

  const pay = useCallback(
    async (args: PayArgs) => {
      if (busy.current) return;
      busy.current = true;
      setLoading(true);
      try {
        const ok = await loadScript();
        if (!ok || !window.Razorpay) throw new Error("Could not load the payment window. Check your connection.");

        const order = await createOrder({
          data: {
            amount: Math.round(args.amount * 100),
            kind: args.kind,
            receipt: args.receipt.slice(0, 40),
            label: args.label.slice(0, 120),
          },
        });

        await new Promise<void>((resolve) => {
          const rzp = new window.Razorpay!({
            key: order.keyId,
            amount: order.amount,
            currency: "INR",
            name: "Biosphere",
            description: args.label,
            order_id: order.orderId,
            prefill: args.prefill ?? {},
            theme: { color: "#1f6b3b" },
            modal: {
              ondismiss: () => {
                args.onDismiss?.();
                resolve();
              },
            },
            handler: async (response: {
              razorpay_order_id: string;
              razorpay_payment_id: string;
              razorpay_signature: string;
            }) => {
              try {
                const res = await verify({ data: response });
                if (res.valid && res.paymentId) args.onSuccess(res.paymentId, response.razorpay_order_id);
                else args.onFailure?.("Payment could not be verified. You have not been charged.");
              } catch {
                args.onFailure?.("Payment verification failed. Please try again.");
              } finally {
                resolve();
              }
            },
          } as Record<string, unknown>);

          rzp.on("payment.failed", (resp: unknown) => {
            const desc =
              (resp as { error?: { description?: string } })?.error?.description ?? "Payment failed. Please try again.";
            args.onFailure?.(desc);
            resolve();
          });

          rzp.open();
        });
      } catch (e) {
        args.onFailure?.(e instanceof Error ? e.message : "Something went wrong starting the payment.");
      } finally {
        busy.current = false;
        setLoading(false);
      }
    },
    [createOrder, verify],
  );

  return { pay, loading };
}
