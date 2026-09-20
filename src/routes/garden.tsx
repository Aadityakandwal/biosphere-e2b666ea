import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Shell } from "@/components/Shell";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useGarden, useBookings, useProfile, type PlantCondition } from "@/lib/stores";
import { supabase } from "@/integrations/supabase/client";
import { services } from "@/lib/data";
import {
  Sprout,
  CalendarDays,
  ShieldCheck,
  AlertCircle,
  Plus,
  Leaf,
  CheckCircle2,
  Clock,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Camera,
  Layers,
  FileText,
  Trash2,
  Check,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/garden")({
  head: () => ({
    meta: [
      { title: "Garden Dashboard — My Gardener" },
      { name: "description", content: "Your digital garden record: plants, health assessments, visit logs, and care plans." },
      { property: "og:title", content: "Garden Dashboard — My Gardener" },
      { property: "og:description", content: "Your digital garden record: plants, health assessments, visit logs, and care plans." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: GardenDashboardPage,
});

type TabKey = "plants" | "visits" | "care";

export function GardenDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("plants");
  const { plants, issues, approvedDiagnoses, addPlant, removePlant, resolveIssue } = useGarden();
  const localBookings = useBookings((s) => s.bookings);
  const [dbBookings, setDbBookings] = useState<any[]>([]);
  const plan = useProfile((s) => s.plan);
  const profileName = useProfile((s) => s.name);

  // Add Plant Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newPlantName, setNewPlantName] = useState("");
  const [newPlantSpecies, setNewPlantSpecies] = useState("");
  const [newPlantCondition, setNewPlantCondition] = useState<PlantCondition>("Healthy");
  const [newPlantNotes, setNewPlantNotes] = useState("");

  // Load real visits from Supabase
  useEffect(() => {
    async function loadVisits() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (!error && data) {
        setDbBookings(data);
      }
    }
    void loadVisits();
  }, []);

  // Combine bookings (DB preferred, fallback to local)
  const allBookings = dbBookings.length > 0 ? dbBookings : localBookings;
  const pastVisits = allBookings.filter((b: any) => b.status === "past" || b.status === "completed");
  const upcomingVisits = allBookings.filter((b: any) => b.status === "upcoming" || b.status === "confirmed");

  // Calculate authentic garden status strictly based on real data
  const totalPlants = plants.length;
  const activeIssues = issues.filter((i) => i.status === "active");
  const healthyPlantsCount = plants.filter((p) => p.condition === "Healthy").length;

  let healthStatusLabel = "Unassessed";
  let healthStatusColor = "text-muted-foreground bg-muted";
  let healthScore: number | null = null;

  if (totalPlants > 0 || pastVisits.length > 0) {
    if (activeIssues.length === 0 && (totalPlants === 0 || healthyPlantsCount === totalPlants)) {
      healthStatusLabel = "Healthy & Thriving";
      healthStatusColor = "text-primary bg-primary/10 border-primary/30";
      healthScore = 92;
    } else if (activeIssues.some((i) => i.severity === "High")) {
      healthStatusLabel = "Requires Immediate Attention";
      healthStatusColor = "text-destructive bg-destructive/10 border-destructive/30";
      healthScore = 64;
    } else {
      healthStatusLabel = "Needs Attention";
      healthStatusColor = "text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/30";
      healthScore = 78;
    }
  }

  const handleCreatePlant = () => {
    if (!newPlantName.trim()) {
      toast.error("Please enter the plant name");
      return;
    }
    addPlant({
      name: newPlantName.trim(),
      species: newPlantSpecies.trim() || undefined,
      condition: newPlantCondition,
      notes: newPlantNotes.trim() || undefined,
    });
    setNewPlantName("");
    setNewPlantSpecies("");
    setNewPlantNotes("");
    setNewPlantCondition("Healthy");
    setAddModalOpen(false);
    toast.success("Plant added to your garden record");
  };

  return (
    <Shell>
      {/* Personalized Garden Header */}
      <div className="mt-2 flex items-start justify-between gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Digital Garden Record</span>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            {profileName ? `${profileName}'s Garden` : "My Garden"}
          </h1>
        </div>
        <Link
          to="/plant-doctor"
          className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground press"
        >
          <Camera className="h-3.5 w-3.5" />
          <span>AI Doctor</span>
        </Link>
      </div>

      {/* Main Health Summary Card */}
      <Reveal className="mt-4 overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Sprout className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Garden Condition</p>
              <p className="font-display text-lg font-bold leading-tight text-foreground">{healthStatusLabel}</p>
            </div>
          </div>
          {healthScore !== null ? (
            <div className="text-right">
              <span className="font-display text-2xl font-bold text-primary">{healthScore}</span>
              <span className="text-xs text-muted-foreground">/100</span>
              <p className="text-[10px] text-muted-foreground">Health Index</p>
            </div>
          ) : (
            <Badge variant="outline" className="border-border text-muted-foreground">
              New Garden
            </Badge>
          )}
        </div>

        {/* Quick Stats Strip */}
        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border/60 pt-4 text-center">
          <div className="rounded-2xl bg-muted/40 p-2">
            <p className="font-display text-lg font-bold text-foreground">{totalPlants}</p>
            <p className="text-[11px] text-muted-foreground">Plants</p>
          </div>
          <div className="rounded-2xl bg-muted/40 p-2">
            <p className="font-display text-lg font-bold text-foreground">{activeIssues.length}</p>
            <p className="text-[11px] text-muted-foreground">Active Issues</p>
          </div>
          <div className="rounded-2xl bg-muted/40 p-2">
            <p className="font-display text-lg font-bold text-foreground">{pastVisits.length}</p>
            <p className="text-[11px] text-muted-foreground">Visits Logged</p>
          </div>
        </div>

        {totalPlants === 0 && pastVisits.length === 0 && (
          <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">Your garden has not been inspected yet.</p>
            <p className="mt-0.5">Book your Free Garden Check to have a My Gardener professional record your baseline soil and plant health.</p>
            <Link
              to="/services/$slug/book"
              params={{ slug: "free-garden-check" }}
              className="mt-2 inline-flex items-center gap-1 font-semibold text-primary hover:underline"
            >
              Book Free Garden Check <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        )}
      </Reveal>

      {/* Clean Hierarchical Segment Tabs */}
      <div className="mt-6 grid grid-cols-3 gap-1 rounded-full border border-border/80 bg-muted/50 p-1">
        <button
          onClick={() => setActiveTab("plants")}
          className={`press flex items-center justify-center gap-1.5 rounded-full py-2.5 text-xs font-semibold transition-all ${
            activeTab === "plants"
              ? "bg-primary text-primary-foreground shadow-soft"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Leaf className="h-3.5 w-3.5" />
          <span>Plants ({totalPlants})</span>
        </button>

        <button
          onClick={() => setActiveTab("visits")}
          className={`press flex items-center justify-center gap-1.5 rounded-full py-2.5 text-xs font-semibold transition-all ${
            activeTab === "visits"
              ? "bg-primary text-primary-foreground shadow-soft"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <CalendarDays className="h-3.5 w-3.5" />
          <span>Visits ({allBookings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("care")}
          className={`press flex items-center justify-center gap-1.5 rounded-full py-2.5 text-xs font-semibold transition-all ${
            activeTab === "care"
              ? "bg-primary text-primary-foreground shadow-soft"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Plan &amp; AI</span>
        </button>
      </div>

      {/* TAB 1: PLANTS & ACTIVE ISSUES */}
      {activeTab === "plants" && (
        <div className="mt-5 space-y-5">
          {/* Active Issues Section (only shown if real issues exist) */}
          {activeIssues.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-base font-bold text-foreground">Active Health Alerts</h2>
                <Badge variant="destructive" className="text-[10px]">
                  {activeIssues.length} Needs Attention
                </Badge>
              </div>

              {activeIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="flex items-start justify-between gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <p className="font-semibold text-foreground">{issue.title}</p>
                    </div>
                    {issue.plantName && <p className="text-xs text-muted-foreground">Affecting: {issue.plantName}</p>}
                    <p className="text-xs text-foreground/80">{issue.symptoms}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 shrink-0 rounded-full border-border text-xs"
                    onClick={() => {
                      resolveIssue(issue.id);
                      toast.success("Issue marked as resolved");
                    }}
                  >
                    <Check className="mr-1 h-3 w-3" /> Resolve
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Plant Roster Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold tracking-tight text-foreground">Plants in Your Garden</h2>
              <p className="text-xs text-muted-foreground">Track health conditions and specific care notes</p>
            </div>
            <Button
              size="sm"
              onClick={() => setAddModalOpen(true)}
              className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-soft press"
            >
              <Plus className="mr-1 h-3.5 w-3.5" /> Add Plant
            </Button>
          </div>

          {/* Plants List / Empty State */}
          {plants.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted text-primary">
                <Sprout className="h-7 w-7" />
              </div>
              <h3 className="mt-3 font-display text-base font-semibold">No plants recorded yet</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Add plants manually or scan them with the AI Plant Doctor to build your digital garden roster.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Button
                  size="sm"
                  onClick={() => setAddModalOpen(true)}
                  className="rounded-full bg-primary text-xs font-semibold text-primary-foreground press"
                >
                  <Plus className="mr-1 h-3.5 w-3.5" /> Add First Plant
                </Button>
                <Link
                  to="/plant-doctor"
                  className="inline-flex items-center rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold transition hover:bg-muted"
                >
                  <Camera className="mr-1.5 h-3.5 w-3.5 text-primary" /> Scan with AI
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {plants.map((plant) => (
                <div
                  key={plant.id}
                  className="surface surface-hover flex items-start gap-4 rounded-3xl p-4 transition-all"
                >
                  {plant.image ? (
                    <img src={plant.image} alt={plant.name} className="h-16 w-16 flex-none rounded-2xl object-cover" />
                  ) : (
                    <div className="flex h-16 w-16 flex-none items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Leaf className="h-8 w-8" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-display font-semibold text-foreground">{plant.name}</h4>
                        {plant.species && <p className="text-xs italic text-muted-foreground">{plant.species}</p>}
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          plant.condition === "Healthy"
                            ? "bg-primary/15 text-primary"
                            : plant.condition === "Requires Immediate Attention"
                            ? "bg-destructive/15 text-destructive"
                            : "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                        }`}
                      >
                        {plant.condition}
                      </span>
                    </div>

                    {plant.notes && <p className="mt-1.5 text-xs leading-relaxed text-foreground/75">{plant.notes}</p>}

                    <div className="mt-2 flex items-center justify-between border-t border-border/40 pt-2 text-[11px] text-muted-foreground">
                      <span>Logged on {plant.addedAt}</span>
                      <button
                        onClick={() => {
                          removePlant(plant.id);
                          toast.info("Plant removed from garden record");
                        }}
                        className="text-destructive/80 hover:text-destructive"
                        title="Remove plant"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: VISITS & SERVICE HISTORY */}
      {activeTab === "visits" && (
        <div className="mt-5 space-y-5">
          {/* Upcoming scheduled visit */}
          {upcomingVisits.length > 0 && (
            <div className="space-y-2">
              <h2 className="font-display text-base font-bold text-foreground">Upcoming Professional Visits</h2>
              {upcomingVisits.map((b: any) => {
                const s = services.find((x) => x.slug === (b.service_slug || b.serviceSlug));
                return (
                  <div key={b.id} className="rounded-3xl border border-primary/30 bg-primary/5 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-foreground">{s?.name || "Gardener Visit"}</span>
                      </div>
                      <Badge className="bg-primary text-[10px] text-primary-foreground">Scheduled</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {b.booking_date || b.date} at {b.booking_time || b.time} · {b.gardener || "My Gardener Professional"}
                    </p>
                    <p className="mt-1 text-xs text-foreground/80">Address: {b.address}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Past visit history */}
          <div>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-bold text-foreground">Completed Visit Records</h2>
              <span className="text-xs text-muted-foreground">{pastVisits.length} visits on file</span>
            </div>

            {pastVisits.length === 0 ? (
              <div className="mt-3 rounded-3xl border border-dashed border-border p-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <CalendarDays className="h-6 w-6" />
                </div>
                <p className="mt-3 text-sm font-semibold">No past visits recorded</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Every visit completed by a My Gardener professional creates an authentic record with work logs and observations.
                </p>
                <Link
                  to="/services"
                  className="mt-4 inline-flex items-center rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground press"
                >
                  Browse Care Services
                </Link>
              </div>
            ) : (
              <div className="mt-3 space-y-3">
                {pastVisits.map((b: any) => {
                  const s = services.find((x) => x.slug === (b.service_slug || b.serviceSlug));
                  return (
                    <div key={b.id} className="surface rounded-3xl p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-display font-semibold text-foreground">{s?.name || "On-site Visit"}</p>
                          <p className="text-xs text-muted-foreground">
                            {b.booking_date || b.date} · Attended by {b.gardener || "My Gardener Professional"}
                          </p>
                        </div>
                        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                          Completed
                        </span>
                      </div>
                      {b.note && (
                        <div className="mt-2 rounded-2xl bg-muted/40 p-2.5 text-xs text-foreground/80">
                          <span className="font-semibold text-foreground">Visit Notes: </span>
                          {b.note}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: CARE PLAN & APPROVED AI RECORDS */}
      {activeTab === "care" && (
        <div className="mt-5 space-y-6">
          {/* Active Care Plan Card */}
          <div>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-bold text-foreground">Garden Care Plan</h2>
              <Link to="/services" search={{ tab: "plans" }} className="text-xs font-semibold text-primary hover:underline">
                View All Plans
              </Link>
            </div>

            <div className="mt-3 rounded-3xl border border-border bg-card p-5 shadow-soft">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Current Status</span>
                  <p className="font-display text-xl font-bold capitalize text-foreground">
                    {plan === "free" ? "Free Garden Account" : `${plan} Care Plan`}
                  </p>
                </div>
                <Badge className="bg-primary/15 text-primary">{plan === "free" ? "Standard" : "Active Member"}</Badge>
              </div>

              {plan === "free" ? (
                <div className="mt-4 rounded-2xl bg-muted/40 p-4 text-xs text-muted-foreground">
                  <p className="font-semibold text-foreground">Upgrade to a Garden Care Plan</p>
                  <p className="mt-1">
                    Get regular on-site maintenance visits, professional plant health management, and discounts on garden setups.
                  </p>
                  <Link
                    to="/services"
                    search={{ tab: "plans" }}
                    className="mt-3 inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 font-semibold text-primary-foreground shadow-soft press"
                  >
                    Explore Care Plans <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="rounded-2xl bg-muted/50 p-2.5">
                      <p className="font-display text-lg font-bold text-foreground">
                        {pastVisits.length}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Completed Visits</p>
                    </div>
                    <div className="rounded-2xl bg-muted/50 p-2.5">
                      <p className="font-display text-lg font-bold text-primary">
                        {upcomingVisits.length}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Scheduled Visits</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Plan benefits include dedicated My Gardener professional visits, prioritized booking, and full digital visit logs.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Approved AI Analyses Archive */}
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-base font-bold text-foreground">Approved AI Health Records</h2>
                <p className="text-xs text-muted-foreground">Diagnoses you confirmed and saved</p>
              </div>
              <Link to="/plant-doctor" className="text-xs font-semibold text-primary hover:underline">
                New Scan
              </Link>
            </div>

            {approvedDiagnoses.length === 0 ? (
              <div className="mt-3 rounded-3xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                <p>No AI diagnoses saved yet.</p>
                <p className="mt-1">When you analyze a plant with the AI Doctor, you can approve saving it here.</p>
              </div>
            ) : (
              <div className="mt-3 space-y-3">
                {approvedDiagnoses.map((diag) => (
                  <div key={diag.id} className="surface rounded-3xl p-4 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-display font-semibold text-foreground">{diag.plantName}</p>
                        <p className="text-muted-foreground">{diag.diseaseName}</p>
                      </div>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                        {diag.date}
                      </span>
                    </div>
                    <p className="mt-2 text-foreground/80"><strong className="font-semibold">Treatment: </strong>{diag.treatment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manual Add Plant Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-md rounded-3xl border-border bg-card p-6 shadow-elevated">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold">Add Plant to Garden</DialogTitle>
          </DialogHeader>

          <div className="mt-3 space-y-3">
            <div>
              <label className="text-xs font-semibold text-foreground">Plant Name *</label>
              <Input
                placeholder="e.g. Monstera, Tulsi, Hibiscus"
                value={newPlantName}
                onChange={(e) => setNewPlantName(e.target.value)}
                className="mt-1 rounded-xl"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">Species / Botanical Name (Optional)</label>
              <Input
                placeholder="e.g. Ocimum tenuiflorum"
                value={newPlantSpecies}
                onChange={(e) => setNewPlantSpecies(e.target.value)}
                className="mt-1 rounded-xl"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">Current Condition</label>
              <div className="mt-1 grid grid-cols-3 gap-2">
                {(["Healthy", "Needs Attention", "Requires Immediate Attention"] as const).map((cond) => (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => setNewPlantCondition(cond)}
                    className={`rounded-xl border p-2 text-center text-xs font-medium transition ${
                      newPlantCondition === cond
                        ? "border-primary bg-primary/10 text-primary font-bold"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    {cond === "Requires Immediate Attention" ? "Critical" : cond}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">Care Notes (Optional)</label>
              <Textarea
                placeholder="e.g. In south balcony, repotted last month"
                value={newPlantNotes}
                onChange={(e) => setNewPlantNotes(e.target.value)}
                rows={2}
                className="mt-1 rounded-xl resize-none"
              />
            </div>
          </div>

          <DialogFooter className="mt-4 flex gap-2 sm:justify-end">
            <Button variant="outline" className="rounded-full" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button className="rounded-full bg-primary font-semibold text-primary-foreground" onClick={handleCreatePlant}>
              Save Plant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Shell>
  );
}
