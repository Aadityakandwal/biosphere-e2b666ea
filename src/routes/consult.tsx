import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/Shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Video } from "lucide-react";
import { useBookings } from "@/lib/stores";
import { toast } from "sonner";

export const Route = createFileRoute("/consult")({
  head: () => ({ meta: [{ title: "Virtual Botanist — Biosphere" }, { name: "description", content: "Book a video consultation with a certified botanist." }] }),
  component: ConsultPage,
});

const SLOTS = ["10:00 AM","12:00 PM","3:00 PM","5:30 PM","7:00 PM"];

function ConsultPage() {
  const [date, setDate] = useState<Date | undefined>(new Date(Date.now() + 86400000));
  const [slot, setSlot] = useState(SLOTS[0]);
  const [note, setNote] = useState("");
  const add = useBookings(s => s.add);
  const navigate = useNavigate();

  const book = () => {
    add({
      id: "b" + Date.now(), serviceSlug: "video-consult",
      date: date?.toISOString().slice(0,10) ?? "", time: slot,
      gardener: "Dr. Anita R.", address: "Video call", status: "upcoming", price: 299, note,
    });
    toast.success("Consultation booked!");
    navigate({ to: "/bookings" });
  };

  return (
    <Shell>
      <Link to="/" className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4" /> Back</Link>
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground"><Video className="h-6 w-6" /></div>
        <div>
          <h1 className="font-display text-2xl font-semibold">Virtual Botanist</h1>
          <p className="text-sm text-muted-foreground">30-min video consultation · ₹299</p>
        </div>
      </div>

      <Card className="mt-4 p-3">
        <p className="mb-2 text-sm font-medium">Pick a date</p>
        <Calendar mode="single" selected={date} onSelect={setDate} disabled={(d) => d < new Date(Date.now() - 86400000)} className="pointer-events-auto" />
      </Card>
      <Card className="mt-3 p-3">
        <p className="mb-2 text-sm font-medium">Slots</p>
        <div className="grid grid-cols-3 gap-2">
          {SLOTS.map(x => (
            <button key={x} onClick={() => setSlot(x)} className={`rounded-lg border p-2 text-sm ${slot === x ? "border-primary bg-primary/10 text-primary" : "border-border"}`}>{x}</button>
          ))}
        </div>
      </Card>
      <Card className="mt-3 p-3">
        <p className="mb-2 text-sm font-medium">What would you like help with?</p>
        <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. yellow leaves on my monstera…" />
      </Card>

      <Button className="mt-4 w-full" size="lg" onClick={book}>Book consultation · ₹299</Button>
    </Shell>
  );
}
