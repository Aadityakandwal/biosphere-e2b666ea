import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Shell } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/stores";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — My Gardener" },
      {
        name: "description",
        content:
          "Review your selected plants, tools, planters, and BioVelocity products before completing your My Gardener purchase.",
      },
      { property: "og:title", content: "Your Cart — My Gardener" },
      {
        property: "og:description",
        content: "Review your selected plants, tools, and plant care products before checkout on My Gardener.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, setQty, remove } = useCart();

  const navigate = useNavigate();
  const subtotal = items.reduce((n, i) => n + i.price * i.qty, 0);
  const shipping = items.length ? 49 : 0;
  const total = subtotal + shipping;

  const checkout = () => navigate({ to: "/checkout" });

  return (
    <Shell title="Your Basket">
      {items.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-[#E6E0D4] bg-[#FAF8F3] p-10 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EBF0E8] text-[#18392B]">
            <ShoppingBag className="h-6 w-6 stroke-[1.75]" />
          </div>
          <h3 className="mt-4 font-serif text-xl font-bold text-[#18392B]">Your basket is empty</h3>
          <p className="mt-1 text-sm text-[#556B5C]">Explore our curated plants, bio-care, and gardening gear.</p>
          <Link to="/shop" className="mt-5 inline-block">
            <Button className="rounded-full bg-[#18392B] px-6 py-2.5 text-sm font-semibold text-[#F4F1EA] hover:bg-[#12281E]">
              Browse Botanical Shop <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-3 space-y-3">
            {items.map((i) => (
              <div
                key={i.id}
                className="flex gap-3 overflow-hidden rounded-2xl border border-[#E6E0D4] bg-[#FAF8F3] p-3 shadow-sm transition-all"
              >
                {i.image && (
                  <img
                    src={i.image}
                    alt={i.name}
                    className="h-20 w-20 flex-none rounded-xl object-cover"
                  />
                )}
                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-serif text-sm font-semibold text-[#18392B]">{i.name}</p>
                      <p className="text-xs text-[#556B5C]">Botanical selection</p>
                    </div>
                    <button
                      onClick={() => remove(i.id)}
                      className="rounded-lg p-1 text-[#8A9B8F] hover:bg-[#EBF0E8] hover:text-[#B91C1C]"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <p className="font-serif text-base font-bold text-[#18392B]">₹{i.price}</p>
                    <div className="flex items-center gap-2 rounded-full border border-[#D5DDD2] bg-[#EBF0E8] px-2 py-0.5">
                      <button
                        onClick={() => setQty(i.id, i.qty - 1)}
                        className="rounded-full p-1 text-[#18392B] transition-transform active:scale-90"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-[#18392B]">{i.qty}</span>
                      <button
                        onClick={() => setQty(i.id, i.qty + 1)}
                        className="rounded-full p-1 text-[#18392B] transition-transform active:scale-90"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-[#E6E0D4] bg-[#FAF8F3] p-4 text-sm shadow-sm">
            <Row k={<span className="text-[#556B5C]">Subtotal</span>} v={<span className="font-semibold text-[#18392B]">₹{subtotal}</span>} />
            <Row k={<span className="text-[#556B5C]">Eco Express Delivery</span>} v={<span className="font-semibold text-[#18392B]">₹{shipping}</span>} />
            <div className="my-2.5 border-t border-[#E6E0D4]" />
            <Row
              k={<span className="font-serif text-base font-bold text-[#18392B]">Order Total</span>}
              v={<span className="font-serif text-lg font-bold text-[#18392B]">₹{total}</span>}
            />
          </div>

          <div className="fixed inset-x-0 bottom-16 z-30">
            <div className="mx-auto flex max-w-md items-center border-t border-[#E6E0D4] bg-[#F4F1EA]/95 px-4 py-3 shadow-lg backdrop-blur">
              <Button
                className="w-full rounded-full bg-[#18392B] py-3 text-sm font-semibold text-[#F4F1EA] shadow-md hover:bg-[#12281E]"
                onClick={checkout}
              >
                Proceed to Checkout · ₹{total}
              </Button>
            </div>
          </div>
          <div className="h-20" />
        </>
      )}
    </Shell>
  );
}

function Row({ k, v }: { k: React.ReactNode; v: React.ReactNode }) {
  return <div className="flex justify-between py-1 text-sm">{k}<span>{v}</span></div>;
}

