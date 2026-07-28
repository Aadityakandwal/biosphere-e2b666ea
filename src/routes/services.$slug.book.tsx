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
import { useRazorpay } from "@/lib/use-razorpay";
import { useAuth } from "@/lib/use-auth";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, MapPin, Plus, Check, CalendarDays, Clock, Home, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/services/$slug/book")({
  validateSearch: (search: Record<string, unknown>): { subs?: string; pkg?: string; custom?: string; customAmt?: number } => ({
    subs: typeof search.subs === "string" ? search.subs : undefined,
    pkg: typeof search.pkg === "string" ? search.pkg : undefined,
    custom: typeof search.custom === "string" ? search.custom : undefined,
    customAmt: typeof search.customAmt === "number" ? search.customAmt : undefined,
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
function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

const EMPTY_FORM = { label: "Home", name: "", phone: "", house: "", area: "", locality: "", landmark: "", city: "", state: "", pincode: "" };

function slotAvailability(date?: Date) {
  const seed = date ? date.getDate() + date.getMonth() * 31 : 0;
  return SLOTS.map((s, i) => ({ slot: s, available: (seed + i * 3) % 5 !== 0 }));
}


function BookPage() {
  const { service } = Route.useLoaderData();
  const { subs: subsParam, pkg: pkgParam, custom: customParam, customAmt } = Route.useSearch();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [date, setDate] = useState<Date | undefined>(new Date(Date.now() + 86400000));
  const slots = slotAvailability(date);
  const [slot, setSlot] = useState<string>(SLOTS[1]);
  const { addresses, add: addAddr } = useAddresses();
  const [addrId, setAddrId] = useState(addresses[0]?.id);
  const [newAddr] = useState("");
  const [addrOpen, setAddrOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const quickDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + i);
    return { label: i === 0 ? "Today" : i === 1 ? "Tmrw" : d.toLocaleDateString(undefined, { weekday: "short" }), date: d };
  });

  const saveAddress = () => {
    if (!form.house.trim() || !form.area.trim() || !form.city.trim() || form.pincode.length !== 6) {
      toast.error("Add house, area, city and a 6-digit pincode.");
      return;
    }
    const line = [form.house, form.area, form.locality, form.landmark && `near ${form.landmark}`, form.city, form.state, form.pincode]
      .filter(Boolean).join(", ");
    const id = "a" + Date.now();
    addAddr({ id, label: form.label, line });
    setAddrId(id);
    setForm(EMPTY_FORM);
    setAddrOpen(false);
    toast.success("Address added");
  };
  const [note, setNote] = useState("");
  const [extend, setExtend] = useState<string | null>(null);
  const [extras, setExtras] = useState<string[]>([]);
  const bio = products.filter(p => p.category === "biovelocity").slice(0, 3);
  const cart = useCart();
  const addBook = useBookings((s) => s.add);
  const profile = useProfile();
  const { pay, loading: paying } = useRazorpay();
  const { isAuthenticated, loading: authLoading } = useAuth();


  const selectedPkg = (service.packages as import("@/lib/data").Pkg[] | undefined)?.find((p) => p.id === pkgParam);
  const isCustomReq = pkgParam === "custom";
  const basePrice = isCustomReq ? (customAmt ?? 0) : selectedPkg ? selectedPkg.price : service.price;

  const pickedSubs = ((service.subs ?? []) as { id: string; name: string; price: number }[]).filter((s) => (subsParam?.split(",") ?? []).includes(s.id));
  const subsTotal = pickedSubs.reduce((n: number, s) => n + s.price, 0);

  const extrasTotal = bio.filter(p => extras.includes(p.id)).reduce((n, p) => n + p.price, 0);
  const taxes = Math.round((basePrice + subsTotal) * 0.05);
  const total = basePrice + subsTotal + extrasTotal + taxes;
  // Green Points are earned on service value only (not products/taxes): 50 pts per ₹100
  const pointsEarned = Math.floor((basePrice + subsTotal) / 100) * 50;



  const isRemote = service.slug === "video-consult";

  const past = bookings.filter(b => b.status === "past").slice(0, 5);

  const handlePay = () => {
    if (!authLoading && !isAuthenticated) {
      toast.error("Please sign in to complete your booking");
      navigate({ to: "/auth", search: { redirect: window.location.pathname + window.location.search } });
      return;
    }
    const id = "b" + Date.now();
    const fullNote = [customParam && `Custom setup — ${customParam}`, note].filter(Boolean).join(" | ");
    void pay({
      amount: total,
      kind: "service",
      label: `${service.name} · ${date?.toDateString() ?? ""} ${slot}`,
      receipt: id,
      prefill: { name: profile.name, email: profile.email, contact: profile.phone },
      onSuccess: (paymentId) => {
        extras.forEach(pid => {
          const p = bio.find(x => x.id === pid)!;
          cart.add({ id: p.id, name: p.name, price: p.price, image: p.image });
        });
        addBook({
          id, serviceSlug: service.slug, date: date?.toISOString().slice(0,10) ?? "",
          time: slot, gardener: extend ? past.find(p => p.id === extend)!.gardener : "Auto-assigned",
          address: isRemote ? "Video call" : (addresses.find(a => a.id === addrId)?.line ?? newAddr), status: "upcoming", price: total, note: fullNote,
          paymentId,
        });
        profile.addPoints(pointsEarned);
        toast.success("Payment successful — booking confirmed! Green points added.");
        navigate({ to: "/bookings" });
      },
      onFailure: (msg) => toast.error(msg),
      onDismiss: () => toast.info("Payment cancelled — your booking wasn't placed"),
    });
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
        <div key="step1" className="page-enter mt-4 space-y-4">
          <Card className="overflow-hidden p-0">
            <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-primary/10 to-transparent px-4 py-3">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold">Select date</p>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {date ? date.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" }) : "Pick a day"}
              </span>
            </div>

            <div className="scrollbar-hide flex gap-2 overflow-x-auto px-4 pt-3">
              {quickDates.map((q) => {
                const active = date && sameDay(date, q.date);
                return (
                  <button
                    key={q.label}
                    onClick={() => setDate(q.date)}
                    className={`press flex min-w-[76px] flex-col items-center rounded-2xl border px-3 py-2 transition-all duration-300 ${
                      active ? "border-primary bg-primary text-primary-foreground shadow-glow" : "border-border bg-card hover:border-primary/40"
                    }`}
                  >
                    <span className="text-[10px] uppercase tracking-wide opacity-80">{q.label}</span>
                    <span className="text-base font-semibold leading-tight">{q.date.getDate()}</span>
                    <span className="text-[10px] opacity-80">{q.date.toLocaleDateString(undefined, { month: "short" })}</span>
                  </button>
                );
              })}
            </div>

            <div className="px-2 pb-3">
              <Calendar mode="single" selected={date} onSelect={setDate} disabled={(d) => d < new Date(Date.now() - 86400000)} className="pointer-events-auto mx-auto" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold">Available slots</p>
              </div>
              <span className="text-xs text-muted-foreground">{slots.filter((s) => s.available).length} open</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {slots.map(({ slot: s, available }, i) => (
                <button
                  key={s}
                  disabled={!available}
                  onClick={() => setSlot(s)}
                  style={{ animationDelay: `${i * 45}ms` }}
                  className={`rise press rounded-xl border px-2 py-2.5 text-sm font-medium transition-all duration-300 ${
                    !available
                      ? "cursor-not-allowed border-dashed border-border text-muted-foreground/50 line-through"
                      : slot === s
                        ? "border-primary bg-primary text-primary-foreground shadow-glow"
                        : "border-border bg-card hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft"
                  }`}
                >{s}</button>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Struck-out slots are fully booked for this date.</p>
          </Card>

          {!isRemote && <Card className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold">Service address</p>
              </div>
              <button
                onClick={() => setAddrOpen(true)}
                className="press inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground"
              >
                <Plus className="h-3.5 w-3.5" /> Add address
              </button>
            </div>
            <div className="space-y-2.5">
              {addresses.map((a, i) => {
                const active = addrId === a.id;
                return (
                  <button
                    key={a.id}
                    onClick={() => setAddrId(a.id)}
                    style={{ animationDelay: `${i * 60}ms` }}
                    className={`rise press flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition-all duration-300 ${
                      active ? "border-primary bg-primary/5 shadow-soft" : "border-border bg-card hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-soft"
                    }`}
                  >
                    <span className={`mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full border transition-all duration-300 ${active ? "border-primary bg-primary" : "border-border"}`}>
                      {active && <Check className="h-3 w-3 text-primary-foreground" />}
                    </span>
                    <span className="flex-1">
                      <span className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{a.label}</span>
                        {i === 0 && <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">Default</span>}
                      </span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{a.line}</span>
                    </span>
                    <Home className="h-4 w-4 flex-none text-muted-foreground" />
                  </button>
                );
              })}
            </div>
          </Card>}
        </div>
      )}

      <Dialog open={addrOpen} onOpenChange={setAddrOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-display">Add a new address</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex gap-2">
              {(["Home", "Office", "Other"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setForm((f) => ({ ...f, label: l }))}
                  className={`press flex-1 rounded-full border px-3 py-2 text-xs font-semibold transition ${
                    form.label === l ? "border-primary bg-primary text-primary-foreground" : "border-border"
                  }`}
                >{l}</button>
              ))}
            </div>
            <Input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input placeholder="Phone number" inputMode="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Input placeholder="House / Flat / Building no." value={form.house} onChange={(e) => setForm({ ...form, house: e.target.value })} />
            <Input placeholder="Area / Street / Sector" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} />
            <Input placeholder="Locality / Colony" value={form.locality} onChange={(e) => setForm({ ...form, locality: e.target.value })} />
            <Input placeholder="Landmark (optional)" value={form.landmark} onChange={(e) => setForm({ ...form, landmark: e.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              <Input placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
            </div>
            <Input placeholder="Pincode" inputMode="numeric" maxLength={6} value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, "") })} />
          </div>
          <DialogFooter>
            <Button className="w-full" onClick={saveAddress}>Save address</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {step === 2 && (
        <div className="mt-4 space-y-4">
          <Card className="p-3">
            <p className="mb-2 text-sm font-medium">Add a note</p>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Gate code, pet on premises, plant details…" />
          </Card>
          {!isRemote && service.slug !== "garden-inspection" && <Card className="p-3">
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
          </Card>}
          {!isRemote && <Card className="p-3">
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
          </Card>}
        </div>
      )}

      {step === 3 && (
        <div className="mt-4 space-y-4">
          <Card className="p-4">
            <p className="text-sm font-medium">Order summary</p>
            <div className="mt-3 space-y-2 text-sm">
              <Row label={isCustomReq ? `${service.name} · Customized setup` : selectedPkg ? `${service.name} · ${selectedPkg.name}` : service.name} value={`₹${basePrice.toLocaleString("en-IN")}`} />
              {isCustomReq && customParam && (
                <p className="rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground">Your request: {customParam}</p>
              )}
              {pickedSubs.map((s) => (
                <Row key={s.id} label={<span className="text-muted-foreground">+ {s.name}</span>} value={`₹${s.price}`} />
              ))}

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
              <p className="mt-1">🌱 Earn {pointsEarned} Green Points on service value (1 pt = ₹0.10)</p>
            </div>
          </Card>
        </div>
      )}

      <div className="fixed inset-x-0 bottom-14 z-30">
        <div className="mx-auto flex max-w-md items-center gap-2 border-t border-border bg-background/95 px-4 py-3 backdrop-blur">
          {step > 1 && <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">Back</Button>}
          {step < 3 && <Button className="flex-1" onClick={() => setStep(step + 1)}>Continue</Button>}
          {step === 3 && <Button className="flex-1" onClick={handlePay} disabled={paying}>{paying ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Opening Razorpay…</> : <><Check className="mr-1 h-4 w-4" /> {`Pay ₹${total}`}</>}</Button>}
        </div>
      </div>
      <div className="h-20" />
    </Shell>
  );
}

function Row({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return <div className="flex items-center justify-between"><span>{label}</span><span>{value}</span></div>;
}
