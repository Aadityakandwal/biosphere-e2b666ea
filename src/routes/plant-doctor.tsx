import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Shell } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { products } from "@/lib/data";
import { useCart, useProfile, SCAN_LIMITS, PLAN_LABELS } from "@/lib/stores";
import { useHydrated } from "@/lib/motion";

import { diagnosePlant, type Diagnosis } from "@/lib/plant-doctor.functions";
import { Camera, Upload, Leaf, AlertCircle, CheckCircle2, Zap, ZapOff, Video, RotateCcw, Droplets, Sun } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/plant-doctor")({
  head: () => ({
    meta: [
      { title: "AI Plant Doctor — Biosphere" },
      { name: "description", content: "Snap or upload a leaf photo and get an instant AI diagnosis with a care plan and BioVelocity solutions." },
      { property: "og:title", content: "AI Plant Doctor — Biosphere" },
      { property: "og:description", content: "Instant AI plant health diagnosis with tailored treatment recommendations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PlantDoctor,
});

function PlantDoctor() {
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<string | null>(null);
  const [flash, setFlash] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Diagnosis | null>(null);
  const add = useCart((s) => s.add);
  const plan = useProfile((s) => s.plan);
  const scanDate = useProfile((s) => s.scanDate);
  const scanCount = useProfile((s) => s.scanCount);
  const useScan = useProfile((s) => s.useScan);
  const hydrated = useHydrated();
  const solutions = products.filter((p) => p.category === "biovelocity");

  const limit = SCAN_LIMITS[plan];
  const usedToday = scanDate === new Date().toISOString().slice(0, 10) ? scanCount : 0;
  const left = limit === null ? Infinity : Math.max(0, limit - usedToday);
  const exhausted = hydrated && left <= 0;

  const onPick = async (file?: File | null) => {
    if (!file) return;
    if (exhausted) {
      toast.error("Daily scan limit reached — upgrade your plan for more");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Please pick an image under 8MB");
      return;
    }
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = () => reject(new Error("Could not read file"));
      r.readAsDataURL(file);
    });
    setImage(dataUrl);
    setResult(null);
    run(dataUrl);
  };

  const run = async (dataUrl: string) => {
    if (!useScan()) {
      toast.error("Daily scan limit reached — upgrade your plan for more");
      setImage(null);
      return;
    }
    setLoading(true);
    try {
      const res = await diagnosePlant({ data: { image: dataUrl } });
      setResult(res);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Diagnosis failed");
    } finally {
      setLoading(false);
    }
  };


  const reset = () => {
    setImage(null);
    setResult(null);
  };

  return (
    <Shell>
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onPick(e.target.files?.[0])} />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => onPick(e.target.files?.[0])} />

      {!image && (
        <div className="mt-2">
          <h1 className="font-display text-2xl font-bold tracking-tight">AI Plant Doctor</h1>
          <p className="mt-1 text-sm text-muted-foreground">Take a clear photo of the affected leaf or upload one from your gallery.</p>

          {/* Daily scan allowance */}
          <div className={`mt-4 flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 ${exhausted ? "border-destructive/30 bg-destructive/10" : "border-border bg-card"} shadow-soft`}>
            <div>
              <p className="text-sm font-semibold">
                {limit === null
                  ? "Unlimited scans"
                  : hydrated
                    ? `${left} of ${limit} scans left today`
                    : `${limit} scans/day`}
              </p>
              <p className="text-xs text-muted-foreground">{PLAN_LABELS[plan]} plan · resets at midnight</p>
            </div>
            {limit !== null && (
              <Link to="/profile/membership" className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground press">
                Upgrade
              </Link>
            )}
          </div>

          {exhausted && (
            <p className="mt-2 text-xs text-destructive">
              You've used all your scans for today. Upgrade your membership for more daily scans.
            </p>
          )}



          {/* Viewfinder */}
          <div className="relative mt-5 aspect-[3/4] overflow-hidden rounded-[2rem] bg-[oklch(0.22_0.04_155)] shadow-elevated">
            <img
              src="https://images.unsplash.com/photo-1545241047-6083a3684587?w=800"
              alt=""
              className="h-full w-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />

            {/* framing corners */}
            <div className="pointer-events-none absolute inset-8">
              {["left-0 top-0 border-l-2 border-t-2 rounded-tl-3xl", "right-0 top-0 border-r-2 border-t-2 rounded-tr-3xl", "left-0 bottom-0 border-l-2 border-b-2 rounded-bl-3xl", "right-0 bottom-0 border-r-2 border-b-2 rounded-br-3xl"].map((c) => (
                <span key={c} className={`absolute h-12 w-12 border-leaf/80 ${c}`} />
              ))}
            </div>

            <button
              onClick={() => setFlash((v) => !v)}
              className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-2 text-xs font-semibold text-white backdrop-blur-md press"
            >
              {flash ? <Zap className="h-4 w-4 fill-current" /> : <ZapOff className="h-4 w-4" />}
              Flash {flash ? "On" : "Off"}
            </button>

            <p className="absolute inset-x-0 bottom-28 text-center text-sm font-medium text-white/85">
              Center the leaf inside the frame
            </p>

            <div className="absolute inset-x-0 bottom-6 flex items-center justify-center gap-8">
              <button onClick={() => fileRef.current?.click()} className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur-md press" aria-label="Upload photo">
                <Upload className="h-5 w-5" />
              </button>
              <button onClick={() => cameraRef.current?.click()} className="flex h-18 w-18 items-center justify-center rounded-full bg-white p-1 shadow-glow press" aria-label="Take photo">
                <span className="flex h-full w-full items-center justify-center rounded-full bg-leaf text-leaf-foreground ring-4 ring-white">
                  <Camera className="h-7 w-7" />
                </span>
              </button>
              <span className="h-12 w-12" />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-12 rounded-2xl" onClick={() => cameraRef.current?.click()}>
              <Camera className="mr-2 h-4 w-4" /> Click photo
            </Button>
            <Button className="h-12 rounded-2xl" onClick={() => fileRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" /> Upload
            </Button>
          </div>
        </div>
      )}

      {image && (
        <div className="mt-2 space-y-4">
          {/* Photo header */}
          <div className="relative overflow-hidden rounded-3xl shadow-elevated">
            <img src={image} alt="Your plant" className="h-56 w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            {result && (
              <span className={`absolute right-4 top-4 flex items-center gap-1.5 rounded-full px-3 py-2 text-[11px] font-bold uppercase tracking-wide backdrop-blur-md ${result.healthy ? "bg-white/90 text-primary" : "bg-white/90 text-destructive"}`}>
                {result.healthy ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                {result.healthy ? "Looks healthy" : "Issues detected"}
              </span>
            )}
            <div className="absolute inset-x-0 bottom-0 p-5 text-white">
              <p className="font-display text-2xl font-bold leading-tight">{loading ? "Analyzing…" : result?.plant ?? "Your plant"}</p>
              <p className="text-sm opacity-80">{loading ? "Our AI is reading the leaves" : "Analyzed just now"}</p>
            </div>
            <button onClick={reset} className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-2 text-xs font-semibold text-white backdrop-blur-md press">
              <RotateCcw className="h-3.5 w-3.5" /> Retake
            </button>
          </div>

          {loading && (
            <div className="space-y-3">
              <div className="h-32 animate-pulse rounded-3xl bg-muted" />
              <div className="h-20 animate-pulse rounded-3xl bg-muted" />
            </div>
          )}

          {result && (
            <>
              {/* Diagnosis card */}
              <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-display text-2xl font-bold tracking-tight">Diagnosis</h2>
                  <span className="rounded-full bg-leaf/25 px-3 py-1.5 text-center text-[11px] font-bold leading-tight text-primary">
                    {result.match}%<br />Match
                  </span>
                </div>
                <p className="mt-1 font-display text-lg font-semibold text-primary">{result.issue}</p>
                <p className="mt-2 text-[15px] leading-relaxed text-foreground/80">{result.summary}</p>

                {result.chips.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
                    {result.chips.map((c, i) => (
                      <span key={c} className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
                        {i % 2 === 0 ? <Droplets className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
                        {c}
                      </span>
                    ))}
                  </div>
                )}

                {result.actions.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {result.actions.map((a) => (
                      <li key={a} className="flex gap-2 text-sm text-foreground/80">
                        <Leaf className="mt-0.5 h-4 w-4 flex-none text-primary" />
                        {a}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* BioVelocity solutions */}
              <div className="flex items-end justify-between">
                <h2 className="font-display text-xl font-bold tracking-tight">BioVelocity Solutions</h2>
                <Link to="/shop" className="text-sm font-semibold text-primary hover:underline">View All</Link>
              </div>
              <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2">
                {solutions.map((p) => (
                  <div key={p.id} className="w-60 flex-none snap-start rounded-3xl border border-border bg-card p-3 shadow-soft">
                    <img src={p.image} alt={p.name} className="h-32 w-full rounded-2xl object-cover" />
                    <p className="mt-3 font-display text-base font-semibold leading-tight">{p.name}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.short}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="font-display text-lg font-bold">₹{p.price}</span>
                      <Button
                        size="sm"
                        className="rounded-full"
                        onClick={() => { add({ id: p.id, name: p.name, price: p.price, image: p.image }); toast.success("Added to cart"); }}
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Consultation upsell */}
              <div className="rounded-3xl bg-[oklch(0.24_0.05_155)] p-6 text-primary-foreground shadow-elevated">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-leaf">Premium Service</p>
                <p className="mt-2 font-display text-2xl font-bold leading-tight">Virtual Botanist Consultation</p>
                <p className="mt-2 text-sm opacity-75">
                  Get a detailed 1-on-1 analysis and custom care plan from our certified horticulturalists.
                </p>
                <Link to="/consult" className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-leaf font-semibold text-leaf-foreground press hover:opacity-90">
                  <Video className="h-4 w-4" /> Book Session
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </Shell>
  );
}
