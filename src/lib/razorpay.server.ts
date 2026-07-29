/** Server-only Razorpay helpers (test mode). */

// Test-mode keys are safe to hardcode as fallback — they cannot move real money.
const TEST_KEY_ID = "rzp_test_TIsC5QDvvG8v2V";
const TEST_KEY_SECRET = "dTNidnmhtqSt8OmnQEt6lc6u";

function creds() {
  const keyId = process.env.RAZORPAY_KEY_ID || TEST_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET || TEST_KEY_SECRET;
  return { keyId, keySecret };
}

export async function createOrder(amountPaise: number, receipt: string, notes: Record<string, string>) {
  const { keyId, keySecret } = creds();
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}`,
    },
    body: JSON.stringify({ amount: amountPaise, currency: "INR", receipt, notes, payment_capture: 1 }),
  });
  const body = (await res.json()) as { id?: string; error?: { description?: string } };
  if (!res.ok || !body.id) {
    throw new Error(body?.error?.description || "Could not start the payment. Please try again.");
  }
  return { orderId: body.id, keyId, amount: amountPaise };
}

export async function verifySignature(orderId: string, paymentId: string, signature: string) {
  const { keySecret } = creds();
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(keySecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${orderId}|${paymentId}`));
  const expected = Array.from(new Uint8Array(mac))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  return diff === 0;
}
