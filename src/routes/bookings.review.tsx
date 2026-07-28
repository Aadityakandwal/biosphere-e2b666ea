import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { z } from "zod";
import { Shell } from "@/components/Shell";
import { useBookings } from "@/lib/stores";
import { services } from "@/lib/data";
import { ArrowLeft, Camera, Leaf, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/bookings/review")({
  validateSearch: z.object({ id: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Write a Review — Biosphere" },
      { name: "description", content: "Rate your Biosphere service and share photos of your plants." },
      { property: "og:title", content: "Write a Review — Biosphere" },
      { property: "og:description", content: "Rate your Biosphere service and share photos of your plants." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReviewPage,
});

const MAX = 500;

function ReviewPage() {
  const { id } = Route.useSearch();
  const navigate = useNavigate();
  const bookings = useBookings((s) => s.bookings);
  const rate = useBookings((s) => s.rate);

  const past = bookings.filter((b) => b.status === "past");
  const booking = (id ? bookings.find((b) => b.id === id) : past[0]) ?? past[0];
  const service = services.find((s) => s.slug === booking?.serviceSlug);

  const [rating, setRating] = useState(booking?.rating ?? 0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    files.forEach((f) => {
      const url = URL.createObjectURL(f);
      setPhotos((p) => [...p, url]);
    });
    e.target.value = "";
  };

  const submit = () => {
    if (rating === 0) {
      toast.error("Tap a leaf to rate your experience");
      return;
    }
    if (booking) rate(booking.id, rating);
    toast.success("Thanks for your review!");
    navigate({ to: "/bookings" });
  };

  const active = hover || rating;

  return (
    <Shell>
      <div className="relative pb-32">
        <button
          onClick={() => navigate({ to: "/bookings" })}
          className="press mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-primary">Write a Review</h1>

        {/* Service card */}
        <div className="mt-5 flex items-center gap-4 rounded-3xl bg-card p-4 shadow-soft">
          <img
            src={service?.image}
            alt={service?.name ?? "Service"}
            loading="lazy"
            className="h-16 w-16 shrink-0 rounded-full object-cover"
          />
          <div className="min-w-0">
            <p className="truncate font-display text-lg font-semibold">{service?.name ?? "Your service"}</p>
            <p className="text-sm text-muted-foreground">
              {booking ? `Service completed on ${booking.date}` : "Recently completed"}
            </p>
          </div>
        </div>

        {/* Rating */}
        <div className="mt-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Rate your experience</p>
          <div className="mt-4 flex items-center justify-center gap-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setRating(n)}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                aria-label={`Rate ${n} out of 5`}
                className="press transition-transform hover:scale-110"
              >
                <Leaf
                  className={`h-9 w-9 transition-colors ${
                    n <= active ? "fill-primary text-primary" : "text-muted-foreground/40"
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="mt-3 text-sm font-medium text-primary">
            {active === 0 ? "Tap a leaf to rate" : ["Poor", "Fair", "Good", "Great", "Excellent"][active - 1]}
          </p>
        </div>

        {/* Details */}
        <div className="mt-8">
          <label htmlFor="review-text" className="font-display text-lg font-semibold">
            Service Details
          </label>
          <div className="mt-3 rounded-3xl bg-card p-4 shadow-soft">
            <textarea
              id="review-text"
              value={text}
              maxLength={MAX}
              onChange={(e) => setText(e.target.value)}
              placeholder="How did your plants enjoy their session?"
              rows={5}
              className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <p className="text-right text-xs text-muted-foreground">
              {text.length}/{MAX}
            </p>
          </div>
        </div>

        {/* Photos */}
        <div className="mt-8">
          <h2 className="font-display text-lg font-semibold">Gallery Update <span className="text-sm font-normal text-muted-foreground">(optional)</span></h2>
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              onClick={() => fileRef.current?.click()}
              className="press flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-border text-muted-foreground hover:border-primary/50 hover:text-primary"
            >
              <Camera className="h-6 w-6" />
              <span className="text-xs font-medium">Add Photo</span>
            </button>
            {photos.map((p, i) => (
              <div key={p} className="relative h-24 w-24 overflow-hidden rounded-2xl">
                <img src={p} alt={`Review photo ${i + 1}`} className="h-full w-full object-cover" />
                <button
                  onClick={() => setPhotos((prev) => prev.filter((x) => x !== p))}
                  aria-label="Remove photo"
                  className="absolute right-1 top-1 rounded-full bg-background/80 p-1 text-foreground shadow-soft"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={onPick} />
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-20 z-40 mx-auto max-w-[480px] px-4">
        <button
          onClick={submit}
          className="press w-full rounded-full bg-primary py-4 text-center text-sm font-semibold text-primary-foreground shadow-glow"
        >
          Submit Review
        </button>
      </div>
    </Shell>
  );
}
