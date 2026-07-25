import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Shell } from "@/components/Shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useBookings } from "@/lib/stores";
import { services } from "@/lib/data";
import { ArrowLeft, Star } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/bookings/$id")({
  validateSearch: z.object({ reschedule: z.number().optional() }),
  component: BookingDetail,
});

const SLOTS = ["9:00 AM", "10:30 AM", "12:00 PM", "2:00 PM", "4:00 PM", "6:00 PM"];

function BookingDetail() {
  const { id } = Route.useParams();
  const { reschedule: reschedFlag } = Route.useSearch();
  const navigate = useNavigate();
  const bookings = useBookings((s) => s.bookings);
  const reschedule = useBookings((s) => s.reschedule);
  const rate = useBookings((s) => s.rate);
  const b = bookings.find(x => x.id === id);
  const [mode, setMode] = useState<"view" | "reschedule">(reschedFlag ? "reschedule" : "view");
  const [date, setDate] = useState<Date | undefined>(new Date(Date.now() + 2 * 86400000));
  const [slot, setSlot] = useState(SLOTS[1]);
  const [rating, setRating] = useState(b?.rating ?? 0);

  if (!b) { throw notFound(); }
  const s = services.find(x => x.slug === b.serviceSlug);
  const fee = Math.round(b.price * 0.1);

  const doReschedule = () => {
    reschedule(b.id, date?.toISOString().slice(0,10) ?? "", slot);
    toast.success(`Rescheduled. ₹${fee} fee charged.`);
    navigate({ to: "/bookings" });
  };

  return (
    <Shell>
      <Link to="/bookings" className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4" /> Back</Link>
      <h1 className="font-display text-2xl font-semibold">{s?.name}</h1>
      <p className="text-sm text-muted-foreground">Booking ID {b.id}</p>

      {mode === "view" && (
        <div className="mt-4 space-y-3">
          <Card className="p-4 text-sm">
            <Row k="Date" v={b.date} /><Row k="Time" v={b.time} /><Row k="Gardener" v={b.gardener} />
            <Row k="Address" v={b.address} /><Row k="Amount paid" v={`₹${b.price}`} />
            {b.note && <Row k="Note" v={b.note} />}
          </Card>

          {b.photos && b.photos.length > 0 && (
            <Card className="p-4">
              <p className="mb-2 text-sm font-medium">Photos from your gardener</p>
              <div className="grid grid-cols-2 gap-2">
                {b.photos.map((p, i) => <img key={i} src={p} alt="" className="aspect-square rounded-lg object-cover" />)}
              </div>
            </Card>
          )}

          {b.status === "past" && (
            <Card className="p-4">
              <p className="mb-2 text-sm font-medium">Rate this service</p>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => { setRating(n); rate(b.id, n); toast.success("Thanks for rating!"); }}>
                    <Star className={`h-7 w-7 ${n <= rating ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"}`} />
                  </button>
                ))}
              </div>
            </Card>
          )}

          {b.status === "upcoming" && (
            <Button className="w-full" onClick={() => setMode("reschedule")}>Reschedule (₹{fee} fee)</Button>
          )}
        </div>
      )}

      {mode === "reschedule" && (
        <div className="mt-4 space-y-4">
          <Card className="p-3 text-xs">
            Rescheduling fee is 10% of the service cost (₹{fee}). New slot must be at least 24 hours from your original booking time.
          </Card>
          <Card className="p-3">
            <p className="mb-2 text-sm font-medium">Pick a new date</p>
            <Calendar mode="single" selected={date} onSelect={setDate} disabled={(d) => d < new Date(Date.now() + 86400000)} className="pointer-events-auto" />
          </Card>
          <Card className="p-3">
            <p className="mb-2 text-sm font-medium">Available slots</p>
            <div className="grid grid-cols-3 gap-2">
              {SLOTS.map(x => (
                <button key={x} onClick={() => setSlot(x)} className={`rounded-lg border p-2 text-sm ${slot === x ? "border-primary bg-primary/10 text-primary" : "border-border"}`}>{x}</button>
              ))}
            </div>
          </Card>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setMode("view")}>Cancel</Button>
            <Button className="flex-1" onClick={doReschedule}>Pay ₹{fee} & confirm</Button>
          </div>
        </div>
      )}
    </Shell>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between border-b border-border py-2 last:border-0"><span className="text-muted-foreground">{k}</span><span className="font-medium text-right">{v}</span></div>;
}
