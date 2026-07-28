import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createOrder, verifySignature } from "./razorpay.server";

export const createRazorpayOrder = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        amount: z.number().int().min(100).max(100_000_000), // paise
        kind: z.enum(["shop", "service", "membership"]),
        receipt: z.string().min(1).max(40),
        label: z.string().min(1).max(120),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    return createOrder(data.amount, data.receipt, { kind: data.kind, label: data.label });
  });

export const verifyRazorpayPayment = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        razorpay_order_id: z.string().min(1).max(80),
        razorpay_payment_id: z.string().min(1).max(80),
        razorpay_signature: z.string().min(1).max(200),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const valid = await verifySignature(
      data.razorpay_order_id,
      data.razorpay_payment_id,
      data.razorpay_signature,
    );
    return { valid, paymentId: valid ? data.razorpay_payment_id : null };
  });
