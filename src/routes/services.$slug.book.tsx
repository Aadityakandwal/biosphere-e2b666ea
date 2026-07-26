import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { services, products, initialBookings } from "@/lib/data";
import { useAddresses, useBookings, useCart, useProfile } from "@/lib/stores";
import { ArrowLeft, MapPin, Plus, Check } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/services/$slug/book")({
  validateSearch: (search: Record<string, unknown>) => ({
    subs: typeof search.subs === "string" ? search.subs : undefined,
  }),
  loader: ({ params }) => {
    const s = services.find((x) => x.slug === params.slug);
    if (!s) throw notFound();
    return { service: s };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `Book ${loaderData?.service.name ?? "service"} — Biosphere` }],
  }),
  component: BookPage,
});

const SLOTS = ["9:00 AM", "10:30 AM", "12:00 PM", "2:00 PM", "4:00 PM", "6:00 PM"];

// Deterministic per-date availability so slots feel real.
function slotAvailability(date?: Date) {
  const seed = date ? date.getDate() + date.getMonth() * 31 : 0;
  return SLOTS.map((s, i) => ({ slot: s, available: (seed + i * 3) % 5 !== 0 }));
}


function BookPage() {
  const { service } = Route.useLoaderData();
  const { subs: subsParam } = Route.useSearch();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [date, setDate] = useState<Date | undefined>(new Date(Date.now() + 86400000));
  const slots = slotAvailability(date);
  const [slot, setSlot] = useState<string>(SLOTS[1]);
  const { addresses, add: addAddr } = useAddresses();
  const [addrId, setAddrId] = useState(addresses[0]?.id);
  const [newAddr, setNewAddr] = useState("");
  const [note, setNote] = useState("");
  const [extend, setExtend] = useState<string | null>(null);
  const [extras, setExtras] = useState<string[]>([]);
  const bio = products.filter(p => p.category === "biovelocity").slice(0, 3);
  const cart = useCart();
  const addBook = useBookings((s) => s.add);
  const profile = useProfile();

  const pickedSubs = (service.subs ?? []).filter(s => (subsParam?.split(",") ?? []).includes(s.id));
  const subsTotal = pickedSubs.reduce((n, s) => n + s.price, 0);
  const extrasTotal = bio.filter(p => extras.includes(p.id)).reduce((n, p) => n + p.price, 0);
  const taxes = Math.round((service.price + subsTotal) * 0.05);
  const total = service.price + subsTotal + extrasTotal + taxes;


  const past = initialBookings.filter(b => b.status === "past").slice(0, 5);

  const handlePay = () => {
    const id = "b" + Date.now();
    extras.forEach(pid => {
      const p = bio.find(x => x.id === pid)!;
      cart.add({ id: p.id, name: p.name, price: p.price, image: p.image });
    });
    addBook({
      id, serviceSlug: service.slug, date: date?.toISOString().slice(0,10) ?? "",
      time: slot, gardener: extend ? past.find(p => p.id === extend)!.gardener : "Auto-assigned",
      address: addresses.find(a => a.id === addrId)?.line ?? newAddr, status: "upcoming", price: total, note,
    });
    profile.addPoints(Math.floor(total / 100) * 50);
    toast.success("Booking confirmed! Green points added.");
    navigate({ to: "/bookings" });
  };

  return (
    <Shell>
      <Link to="/services/$slug" params={{ slug: service.slug }} className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4" /> Back</Link>
      <h1 className="font-display text-2xl font-semibold">Book · {service.name}</h1>

      <div className="mt-4 flex items-center justify-between">
        {[1,2,3].map(n => (
          <div key={n} className="flex flex-1 items-center">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm ${step >= n ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{n}</div>
            {n < 3 && <div className={`h-0.5 flex-1 ${step > n ? "bg-primary" : "bg-muted"}`} />}
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Step {step} of 3 · {["Date & Address", "Notes & Extras", "Payment"][step-1]}</p>

      {step === 1 && (
        <div className="mt-4 space-y-4">
          <Card className="p-3">
            <p className="mb-2 text-sm font-medium">Select date</p>
            <Calendar mode="single" selected={date} onSelect={setDate} disabled={(d) => d < new Date(Date.now() - 86400000)} className="pointer-events-auto" />
          </Card>
          <Card className="p-3">
            <p className="mb-2 text-sm font-medium">Available slots</p>
            <div className="grid grid-cols-3 gap-2">
              {SLOTS.map(s => (
                <button key={s} onClick={() => setSlot(s)} className={`rounded-lg border p-2 text-sm ${slot === s ? "border-primary bg-primary/10 text-primary" : "border-border"}`}>{s}</button>
              ))}
            </div>
          </Card>
          <Card className="p-3">
            <p className="mb-2 text-sm font-medium">Service address</p>
            <div className="space-y-2">
              {addresses.map(a => (
                <label key={a.id} className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3">
                  <input type="radio" name="addr" checked={addrId === a.id} onChange={() => setAddrId(a.id)} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{a.label}</p>
                    <p className="text-xs text-muted-foreground">{a.line}</p>
                  </div>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </label>
              ))}
              <div className="flex gap-2">
                <Input placeholder="Add new address…" value={newAddr} onChange={(e) => setNewAddr(e.target.value)} />
                <Button variant="outline" size="icon" onClick={() => {
                  if (!newAddr.trim()) return;
                  const id = "a" + Date.now();
                  addAddr({ id, label: "New", line: newAddr });
                  setAddrId(id); setNewAddr("");
                }}><Plus className="h-4 w-4" /></Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {step === 2 && (
        <div className="mt-4 space-y-4">
          <Card className="p-3">
            <p className="mb-2 text-sm font-medium">Add a note</p>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Gate code, pet on premises, plant details…" />
          </Card>
          <Card className="p-3">
            <p className="mb-2 text-sm font-medium">Extend a previous service?</p>
            <p className="mb-3 text-xs text-muted-foreground">Pick a gardener you've worked with. Availability confirmed on booking.</p>
            <div className="space-y-2">
              {past.length === 0 && <p className="text-xs text-muted-foreground">No past services yet.</p>}
              {past.map(p => {
                const available = p.gardener !== "Suresh P.";
                return (
                  <label key={p.id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3">
                    <input type="radio" name="ext" checked={extend === p.id} onChange={() => available && setExtend(p.id)} disabled={!available} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{p.gardener}</p>
                      <p className="text-xs text-muted-foreground">{services.find(s => s.slug === p.serviceSlug)?.name} · {p.date}</p>
                    </div>
                    {available ? <Badge variant="secondary">Available</Badge> : <Badge variant="outline">Not available</Badge>}
                  </label>
                );
              })}
            </div>
          </Card>
          <Card className="p-3">
            <p className="mb-2 text-sm font-medium">Add Biovelocity products</p>
            <div className="space-y-2">
              {bio.map(p => (
                <label key={p.id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-2">
                  <Checkbox checked={extras.includes(p.id)} onCheckedChange={(v) => setExtras(x => v ? [...x, p.id] : x.filter(i => i !== p.id))} />
                  <img src={p.image} alt="" className="h-12 w-12 rounded object-cover" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">₹{p.price}</p>
                  </div>
                </label>
              ))}
            </div>
          </Card>
        </div>
      )}

      {step === 3 && (
        <div className="mt-4 space-y-4">
          <Card className="p-4">
            <p className="text-sm font-medium">Order summary</p>
            <div className="mt-3 space-y-2 text-sm">
              <Row label={service.name} value={`₹${service.price}`} />
              {extras.map(id => {
                const p = bio.find(x => x.id === id)!;
                return <Row key={id} label={p.name} value={`₹${p.price}`} />;
              })}
              <Row label="Taxes & fees" value={`₹${taxes}`} />
              <div className="my-2 border-t border-border" />
              <Row label={<span className="font-semibold">Total</span>} value={<span className="font-semibold">₹{total}</span>} />
            </div>
            <div className="mt-4 rounded-lg bg-muted p-3 text-xs">
              <p>📅 {date?.toDateString()} · {slot}</p>
              <p className="mt-1">📍 {addresses.find(a => a.id === addrId)?.line ?? newAddr}</p>
              <p className="mt-1">🌱 Earn {Math.floor(total / 100) * 50} Green Points</p>
            </div>
          </Card>
        </div>
      )}

      <div className="fixed inset-x-0 bottom-14 z-30">
        <div className="mx-auto flex max-w-md items-center gap-2 border-t border-border bg-background/95 px-4 py-3 backdrop-blur">
          {step > 1 && <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">Back</Button>}
          {step < 3 && <Button className="flex-1" onClick={() => setStep(step + 1)}>Continue</Button>}
          {step === 3 && <Button className="flex-1" onClick={handlePay}><Check className="mr-1 h-4 w-4" /> Pay ₹{total}</Button>}
        </div>
      </div>
      <div className="h-20" />
    </Shell>
  );
}

function Row({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return <div className="flex items-center justify-between"><span>{label}</span><span>{value}</span></div>;
}
