import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Shell } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { diagnosePlant, normalizeDiagnosis, type Diagnosis, type PlantCondition } from "@/lib/plant-doctor.functions";
import { products, services } from "@/lib/data";
import { useCart, useProfile, SCAN_LIMITS, PLAN_LABELS } from "@/lib/stores";
import { useHydrated } from "@/lib/motion";
import { GardenApprovalModal } from "@/components/GardenApprovalModal";

import {
  Camera,
  Upload,
  Leaf,
  AlertCircle,
  CheckCircle2,
  Zap,
  ZapOff,
  RotateCcw,
  Droplets,
  Sun,
  FlaskConical,
  ShieldCheck,
  Sprout,
  Clock,
  Lightbulb,
  Info,
  ArrowRight,
  PlusCircle,
  HelpCircle,
  Check,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/plant-doctor")({
  head: () => ({
    meta: [
      { title: "AI Plant Doctor — My Gardener" },
      { name: "description", content: "Detailed AI plant health analysis with step-by-step care and My Gardener recommendations." },
      { property: "og:title", content: "AI Plant Doctor — My Gardener" },
      { property: "og:description", content: "Detailed AI plant health analysis with tailored care guidance." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: PlantDoctor,
});

function conditionBadgeClass(c: PlantCondition): string {
  switch (c) {
    case "Requires Immediate Attention":
      return "bg-destructive/15 text-destructive border border-destructive/20";
    case "Needs Attention":
      return "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20";
    case "Healthy":
    default:
      return "bg-primary/15 text-primary border border-primary/20";
  }
}

function AnalysisSectionCard({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: typeof Leaf;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <h3 className="font-display text-base font-bold text-foreground">{title}</h3>
          {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      <div className="mt-3 text-xs leading-relaxed text-foreground/80">{children}</div>
    </div>
  );
}

function PlantDoctor() {
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [image, setImage] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [flash, setFlash] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Diagnosis | null>(null);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [savedToGarden, setSavedToGarden] = useState(false);

  const plan = useProfile((s) => s.plan);
  const scanDate = useProfile((s) => s.scanDate);
  const scanCount = useProfile((s) => s.scanCount);
  const useScan = useProfile((s) => s.useScan);
  const hydrated = useHydrated();
  const diagnosis = result ? normalizeDiagnosis(result) : null;

  useEffect(() => {
    if (!diagnosis) return;
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [diagnosis]);

  const limit = SCAN_LIMITS[plan];
  const usedToday = scanDate === new Date().toISOString().slice(0, 10) ? scanCount : 0;
  const left = limit === null ? Infinity : Math.max(0, limit - usedToday);
  const exhausted = hydrated && left <= 0;

  const onPick = async (file?: File | null) => {
    if (!file) return;
    if (exhausted) {
      toast.error("Daily scan limit reached — upgrade your plan for more daily scans");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Please select an image under 8MB");
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
    setSavedToGarden(false);
    run(dataUrl, description);
  };

  const run = async (dataUrl: string, desc?: string) => {
    if (!useScan()) {
      toast.error("Daily scan limit reached — upgrade your plan for more daily scans");
      setImage(null);
      return;
    }
    setLoading(true);
    try {
      const res = await diagnosePlant({
        data: {
          image: dataUrl,
          description: desc?.trim() || undefined,
        },
      });
      const data = normalizeDiagnosis(res);
      toast.success("Analysis complete");
      setResult(data);
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      console.error("Plant analysis error:", errorMsg);
      toast.error("Could not complete live analysis. Please try again.");
      setImage(null);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setDescription("");
    setSavedToGarden(false);
  };

  return (
    <Shell>
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onPick(e.target.files?.[0])} />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => onPick(e.target.files?.[0])} />

      {!image && (
        <div className="mt-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary">
                <Sparkles className="h-3 w-3 text-primary animate-pulse" />
                Botanical AI Engine
              </span>
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">AI Plant Doctor</h1>
            </div>
            <Link to="/garden" className="text-xs font-semibold text-primary hover:underline">
              My Garden
            </Link>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Take a clear photo of your plant's foliage or stem to generate a Detailed AI Plant Health Analysis.
          </p>

          {/* Daily scan allowance */}
          <div
            className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 ${
              exhausted ? "border-destructive/30 bg-destructive/10" : "border-border/80 bg-card"
            } shadow-2xs`}
          >
            <div>
              <p className="text-xs font-semibold text-foreground">
                {limit === null
                  ? "Unlimited Scans Active"
                  : hydrated
                  ? `${left} of ${limit} scans available today`
                  : `${limit} scans/day`}
              </p>
              <p className="text-[11px] text-muted-foreground">{PLAN_LABELS[plan]} Care Plan · Resets at midnight</p>
            </div>
            {limit !== null && (
              <Link
                to="/services"
                search={{ tab: "plans" }}
                className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground press"
              >
                Upgrade
              </Link>
            )}
          </div>

          {/* Optional description */}
          <div>
            <label className="text-xs font-semibold text-foreground">Describe what you observe (Optional)</label>
            <Textarea
              placeholder="e.g. Yellow leaves on the lower stem, dry brown tips, recent repotting…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="mt-1.5 resize-none rounded-2xl text-xs border-border/80"
              maxLength={300}
            />
          </div>

          {/* Viewfinder Frame */}
          <div className="relative mt-2 aspect-[3/4] overflow-hidden rounded-[2rem] bg-[oklch(0.18_0.03_155)] shadow-elevated">
            <img
              src="https://images.unsplash.com/photo-1545241047-6083a3684587?w=800"
              alt=""
              className="h-full w-full object-cover opacity-35"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/75" />

            {/* framing corners */}
            <div className="pointer-events-none absolute inset-8">
              {[
                "left-0 top-0 border-l-2 border-t-2 rounded-tl-2xl",
                "right-0 top-0 border-r-2 border-t-2 rounded-tr-2xl",
                "left-0 bottom-0 border-l-2 border-b-2 rounded-bl-2xl",
                "right-0 bottom-0 border-r-2 border-b-2 rounded-br-2xl",
              ].map((c) => (
                <span key={c} className={`absolute h-8 w-8 border-primary/90 transition-all duration-300 ${c}`} />
              ))}
            </div>

            <button
              onClick={() => setFlash((v) => !v)}
              className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md press"
            >
              {flash ? <Zap className="h-3.5 w-3.5 fill-current text-amber-300" /> : <ZapOff className="h-3.5 w-3.5" />}
              Flash {flash ? "On" : "Off"}
            </button>

            <p className="absolute inset-x-0 bottom-24 text-center text-xs font-medium text-white/90">
              Center the affected leaf or plant inside the frame
            </p>

            <div className="absolute inset-x-0 bottom-5 flex items-center justify-center gap-6">
              <button
                disabled={exhausted}
                onClick={() => fileRef.current?.click()}
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-md press disabled:opacity-40"
                aria-label="Upload photo"
              >
                <Upload className="h-5 w-5" />
              </button>
              <button
                disabled={exhausted}
                onClick={() => cameraRef.current?.click()}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-white p-1 shadow-glow press disabled:opacity-40"
                aria-label="Take photo"
              >
                <span className="flex h-full w-full items-center justify-center rounded-full bg-primary text-primary-foreground ring-4 ring-white transition-transform active:scale-95">
                  <Camera className="h-7 w-7" />
                </span>
              </button>
              <span className="h-12 w-12" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <Button
              variant="outline"
              disabled={exhausted}
              className="h-12 rounded-2xl text-xs font-semibold"
              onClick={() => cameraRef.current?.click()}
            >
              <Camera className="mr-2 h-4 w-4 text-primary" /> Camera Snap
            </Button>
            <Button
              disabled={exhausted}
              className="h-12 rounded-2xl bg-primary text-xs font-semibold text-primary-foreground"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="mr-2 h-4 w-4" /> Gallery Upload
            </Button>
          </div>
        </div>
      )}

      {image && (
        <div ref={resultsRef} className="mt-2 space-y-4">
          {/* Photo banner with botanical scanning beam */}
          <div className="relative overflow-hidden rounded-3xl shadow-elevated bg-card">
            <img src={image} alt="Plant specimen" className="h-56 w-full object-cover" />
            
            {/* Real Botanical Laser Scan Beam when analyzing */}
            {loading && (
              <>
                <div className="botanical-scan-beam" />
                <div className="absolute inset-0 bg-primary/10 backdrop-blur-[0.5px] pointer-events-none" />
                <div className="pointer-events-none absolute inset-6">
                  {[
                    "left-0 top-0 border-l-2 border-t-2 rounded-tl-xl",
                    "right-0 top-0 border-r-2 border-t-2 rounded-tr-xl",
                    "left-0 bottom-0 border-l-2 border-b-2 rounded-bl-xl",
                    "right-0 bottom-0 border-r-2 border-b-2 rounded-br-xl",
                  ].map((c) => (
                    <span key={c} className={`absolute h-6 w-6 border-emerald-400/80 animate-pulse ${c}`} />
                  ))}
                </div>
              </>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />
            
            {diagnosis && (
              <span
                className={`absolute right-4 top-4 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold backdrop-blur-md shadow-xs ${
                  diagnosis.condition === "Healthy" ? "bg-white/95 text-primary" : "bg-white/95 text-destructive"
                }`}
              >
                {diagnosis.condition === "Healthy" ? (
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                )}
                {diagnosis.condition}
              </span>
            )}

            <div className="absolute inset-x-0 bottom-0 p-5 text-white">
              <p className="font-display text-2xl font-bold leading-tight">
                {loading ? "Analyzing Foliage..." : diagnosis?.plant_name ?? "Your Plant"}
              </p>
              <p className="text-xs text-white/80">
                {loading ? "Examining visual pathology & leaf structure" : diagnosis?.botanical_name || "Visual Botanical Record"}
              </p>
            </div>

            <button
              onClick={reset}
              className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md press"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Retake
            </button>
          </div>

          {/* Premium Scientific Botanical Loading Experience */}
          {loading && (
            <div className="rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/[0.06] via-card to-card p-5 space-y-4 shadow-soft">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary diagnostic-pulse">
                  <Leaf className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-sm font-semibold text-foreground">
                    Botanical AI Pathology Engine
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Analyzing leaf structure, cellular patterns &amp; stress markers
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary animate-pulse" style={{ width: "75%" }} />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Diagnostic scan in progress</span>
                  <span className="font-mono font-semibold text-primary">Running AI Model</span>
                </div>
              </div>

              {/* Staged Checklist Indicators */}
              <div className="space-y-2 border-t border-border/50 pt-3 text-xs text-foreground/80">
                <div className="flex items-center gap-2">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Check className="h-2.5 w-2.5" />
                  </span>
                  <span>Foliar venation &amp; surface integrity</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Check className="h-2.5 w-2.5" />
                  </span>
                  <span>Pathogen, pest &amp; fungal screening</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/10 text-primary animate-pulse">
                    <Sparkles className="h-2.5 w-2.5" />
                  </span>
                  <span>Organic treatment protocol synthesis</span>
                </div>
              </div>
            </div>
          )}

          {diagnosis && (
            <>
              {/* Report Header Card */}
              <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
                <div className="flex items-start justify-between gap-2 border-b border-border/60 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                      Detailed AI Plant Health Analysis
                    </span>
                    <h2 className="font-display text-xl font-bold text-foreground">
                      {diagnosis.plant_name}
                    </h2>
                    {diagnosis.botanical_name && (
                      <p className="text-xs italic text-muted-foreground">{diagnosis.botanical_name}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${conditionBadgeClass(diagnosis.condition)}`}>
                      {diagnosis.condition}
                    </span>
                    <p className="mt-1 text-[10px] text-muted-foreground">{diagnosis.confidence}% Match</p>
                  </div>
                </div>

                {/* Possible Issue Callout (clearly labeled as suspected) */}
                <div className="mt-3 rounded-2xl bg-muted/40 p-3.5">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {diagnosis.is_issue_uncertain ? "Suspected Condition / Stress" : "Identified Status"}
                  </p>
                  <p className="mt-0.5 font-display text-base font-bold text-foreground">
                    {diagnosis.possible_issue}
                  </p>
                </div>

                {/* Save to Garden Dashboard CTA */}
                <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-3">
                  <div>
                    <p className="text-xs font-semibold text-foreground">Save to your Garden Dashboard?</p>
                    <p className="text-[11px] text-muted-foreground">
                      {savedToGarden ? "Saved to your digital plant record" : "Store this diagnosis & care history in your garden record"}
                    </p>
                  </div>
                  {savedToGarden ? (
                    <Badge className="bg-primary text-primary-foreground">
                      <CheckCircle2 className="mr-1 h-3 w-3" /> Saved
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => setApprovalModalOpen(true)}
                      className="rounded-full bg-primary px-3 text-xs font-semibold text-primary-foreground press"
                    >
                      <PlusCircle className="mr-1.5 h-3.5 w-3.5" /> Save Record
                    </Button>
                  )}
                </div>
              </div>

              {/* 1. Visible Symptoms (Observations) */}
              <AnalysisSectionCard
                icon={AlertCircle}
                title="What We Observed"
                subtitle="Visual cues identified on the foliage"
              >
                <ul className="space-y-1.5">
                  {diagnosis.visible_symptoms.map((symptom, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-primary" />
                      <span>{symptom}</span>
                    </li>
                  ))}
                </ul>
              </AnalysisSectionCard>

              {/* 2. Likely Cause */}
              <AnalysisSectionCard
                icon={Info}
                title="Likely Underlying Cause"
                subtitle="Biological or environmental factors"
              >
                <p className="leading-relaxed">{diagnosis.likely_cause}</p>
              </AnalysisSectionCard>

              {/* 3. Recommended Treatment Protocol */}
              <AnalysisSectionCard
                icon={Leaf}
                title="Recommended Treatment Steps"
                subtitle="Actionable steps to restore plant health"
              >
                <ol className="space-y-2">
                  {diagnosis.recommended_treatment.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>

                <div className="mt-4 grid grid-cols-1 gap-2 pt-3 border-t border-border/60 sm:grid-cols-2">
                  <div className="rounded-2xl bg-muted/40 p-3">
                    <p className="text-[11px] font-bold text-foreground">Organic Treatment:</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{diagnosis.organic_treatment}</p>
                  </div>
                  <div className="rounded-2xl bg-muted/40 p-3">
                    <p className="text-[11px] font-bold text-foreground">Conventional / Chemical:</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{diagnosis.chemical_treatment}</p>
                  </div>
                </div>
              </AnalysisSectionCard>

              {/* 4. Prevention */}
              <AnalysisSectionCard
                icon={ShieldCheck}
                title="Prevention & Long-Term Health"
                subtitle="How to reduce recurrence of this issue"
              >
                <ul className="space-y-1.5">
                  {diagnosis.prevention.map((prev, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-primary" />
                      <span>{prev}</span>
                    </li>
                  ))}
                </ul>
              </AnalysisSectionCard>

              {/* 5. Care Guidance (Watering, Sunlight, Nutrition) */}
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-2xl border border-border bg-card p-3 shadow-soft text-center">
                  <Droplets className="mx-auto h-4 w-4 text-primary" />
                  <p className="mt-1 text-[10px] font-bold text-foreground">Watering</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground line-clamp-3">
                    {diagnosis.care_recommendations.watering}
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-3 shadow-soft text-center">
                  <Sun className="mx-auto h-4 w-4 text-amber-500" />
                  <p className="mt-1 text-[10px] font-bold text-foreground">Light</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground line-clamp-3">
                    {diagnosis.care_recommendations.sunlight}
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-3 shadow-soft text-center">
                  <Sprout className="mx-auto h-4 w-4 text-primary" />
                  <p className="mt-1 text-[10px] font-bold text-foreground">Nutrition</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground line-clamp-3">
                    {diagnosis.care_recommendations.nutrition}
                  </p>
                </div>
              </div>

              {/* 6. My Gardener Genuine Recommendation */}
              {diagnosis.my_gardener_recommendation && (
                <div className="rounded-3xl border border-primary/30 bg-primary/5 p-5 shadow-soft">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                        My Gardener Recommendation
                      </span>
                      <h3 className="font-display text-base font-bold text-foreground">
                        {diagnosis.my_gardener_recommendation.title}
                      </h3>
                      <p className="mt-1 text-xs text-foreground/80">
                        {diagnosis.my_gardener_recommendation.description}
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/services/$slug/book"
                    params={{ slug: diagnosis.my_gardener_recommendation.action_slug || "garden-care" }}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-soft press"
                  >
                    Book On-Site Care Visit <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}

              {/* Disclaimer */}
              <div className="flex items-start gap-2.5 rounded-2xl bg-muted/50 p-4 text-[11px] leading-relaxed text-muted-foreground">
                <HelpCircle className="mt-0.5 h-4 w-4 flex-none text-muted-foreground" />
                <p>{diagnosis.disclaimer}</p>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button variant="outline" className="rounded-full" onClick={reset}>
                  Scan Another Plant
                </Button>
                <Link
                  to="/garden"
                  className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-soft press"
                >
                  View in Garden <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </div>
            </>
          )}

          {/* Approval Confirmation Modal */}
          {diagnosis && (
            <GardenApprovalModal
              open={approvalModalOpen}
              onOpenChange={setApprovalModalOpen}
              analysis={diagnosis}
              imageUrl={image}
              onApproved={() => setSavedToGarden(true)}
            />
          )}
        </div>
      )}
    </Shell>
  );
}
