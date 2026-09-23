import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Shell } from "@/components/Shell";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
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
  let healthScore: number | null = null;

  if (totalPlants > 0 || pastVisits.length > 0) {
    if (activeIssues.length === 0 && (totalPlants === 0 || healthyPlantsCount === totalPlants)) {
      healthStatusLabel = "Healthy & Thriving";
      healthScore = 92;
    } else if (activeIssues.some((i) => i.severity === "High")) {
      healthStatusLabel = "Requires Immediate Attention";
      healthScore = 64;
    } else {
      healthStatusLabel = "Needs Attention";
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
      <div className="pb-12 space-y-5 sm:space-y-6">
        {/* Personalized Garden Header */}
        <section className="px-5 pt-1">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.18em] text-[#556B5C]">
                DIGITAL GARDEN RECORD
              </span>
              <h1 className="font-display text-2xl font-bold tracking-tight text-[#162A1F]">
                {profileName ? `${profileName}'s Garden` : "My Garden"}
              </h1>
            </div>
            <Link
              to="/plant-doctor"
              className="flex items-center gap-1.5 rounded-full bg-[#18392B] px-3.5 py-1.5 text-xs font-semibold text-white shadow-soft transition hover:bg-[#122D22] press"
            >
              <Camera className="h-3.5 w-3.5" />
              <span>AI Doctor</span>
            </Link>
          </div>
        </section>

        {/* Main Health Summary Card */}
        <section className="px-5">
          <div className="overflow-hidden rounded-[24px] border border-[#DCE5DA] bg-[#EBF0E8] p-5 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-[#DEE7DB] text-[#18392B]">
                  <Sprout className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#55695B]">Garden Condition</p>
                  <p className="font-display text-lg font-bold leading-tight text-[#183626]">{healthStatusLabel}</p>
                </div>
              </div>
              {healthScore !== null ? (
                <div className="text-right">
                  <span className="font-display text-2xl font-bold text-[#18392B]">{healthScore}</span>
                  <span className="text-xs text-[#65796C]">/100</span>
                  <p className="text-[9px] text-[#65796C]">Health Index</p>
                </div>
              ) : (
                <span className="rounded-full bg-white/70 border border-[#D5DFD2] px-2.5 py-0.5 text-[10px] font-semibold text-[#65796C]">
                  New Garden
                </span>
              )}
            </div>

            {/* Quick Stats Strip */}
            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[#D5DFD2] pt-4 text-center">
              <div className="rounded-2xl bg-white/70 border border-[#D5DFD2] p-2.5">
                <p className="font-display text-base font-bold text-[#183626]">{totalPlants}</p>
                <p className="text-[10px] text-[#65796C]">Plants</p>
              </div>
              <div className="rounded-2xl bg-white/70 border border-[#D5DFD2] p-2.5">
                <p className="font-display text-base font-bold text-[#183626]">{activeIssues.length}</p>
                <p className="text-[10px] text-[#65796C]">Active Issues</p>
              </div>
              <div className="rounded-2xl bg-white/70 border border-[#D5DFD2] p-2.5">
                <p className="font-display text-base font-bold text-[#183626]">{pastVisits.length}</p>
                <p className="text-[10px] text-[#65796C]">Visits Logged</p>
              </div>
            </div>

            {totalPlants === 0 && pastVisits.length === 0 && (
              <div className="mt-4 rounded-2xl border border-[#CAD8C7] bg-white/80 p-3.5 text-xs text-[#526357]">
                <p className="font-bold text-[#183626]">Your garden has not been inspected yet.</p>
                <p className="mt-0.5">Book your Free Garden Check to have a My Gardener professional record your baseline soil and plant health.</p>
                <Link
                  to="/services/$slug/book"
                  params={{ slug: "free-garden-check" }}
                  className="mt-2.5 inline-flex items-center gap-1 font-semibold text-[#18392B] hover:underline"
                >
                  <span>Book Free Garden Check</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Clean Hierarchical Segment Tabs */}
        <div className="px-5">
          <div className="grid grid-cols-3 gap-1 rounded-full bg-[#E8ECE5] p-1 border border-[#DCE3D8] shadow-2xs select-none">
            <button
              onClick={() => setActiveTab("plants")}
              className={`press flex items-center justify-center gap-1.5 rounded-full py-2 text-xs font-semibold transition-all duration-200 ${
                activeTab === "plants"
                  ? "bg-[#18392B] text-white shadow-soft"
                  : "text-[#556B5C] hover:text-[#183626]"
              }`}
            >
              <Leaf className="h-3.5 w-3.5" />
              <span>Plants ({totalPlants})</span>
            </button>

            <button
              onClick={() => setActiveTab("visits")}
              className={`press flex items-center justify-center gap-1.5 rounded-full py-2 text-xs font-semibold transition-all duration-200 ${
                activeTab === "visits"
                  ? "bg-[#18392B] text-white shadow-soft"
                  : "text-[#556B5C] hover:text-[#183626]"
              }`}
            >
              <CalendarDays className="h-3.5 w-3.5" />
              <span>Visits ({allBookings.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("care")}
              className={`press flex items-center justify-center gap-1.5 rounded-full py-2 text-xs font-semibold transition-all duration-200 ${
                activeTab === "care"
                  ? "bg-[#18392B] text-white shadow-soft"
                  : "text-[#556B5C] hover:text-[#183626]"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Plan &amp; AI</span>
            </button>
          </div>
        </div>

        {/* TAB 1: PLANTS & ACTIVE ISSUES */}
        {activeTab === "plants" && (
          <div className="px-5 space-y-4">
            {/* Active Issues Section */}
            {activeIssues.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-base font-bold text-[#183626]">Active Health Alerts</h2>
                  <span className="rounded-full bg-destructive/10 text-destructive border border-destructive/20 px-2.5 py-0.5 text-[10px] font-bold">
                    {activeIssues.length} Needs Attention
                  </span>
                </div>

                {activeIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="flex items-start justify-between gap-3 rounded-[22px] border border-amber-500/30 bg-amber-500/5 p-4 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                        <p className="font-bold text-[#183626]">{issue.title}</p>
                      </div>
                      {issue.plantName && <p className="text-[11px] text-[#65796C]">Affecting: {issue.plantName}</p>}
                      <p className="text-xs text-[#526357]">{issue.symptoms}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 shrink-0 rounded-full border-[#D5DFD2] text-xs"
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
                <h2 className="font-display text-base font-bold tracking-tight text-[#183626]">Plants in Your Garden</h2>
                <p className="text-[11px] text-[#65796C]">Track health conditions and specific care notes</p>
              </div>
              <Button
                size="sm"
                onClick={() => setAddModalOpen(true)}
                className="rounded-full bg-[#18392B] px-3 py-1.5 text-xs font-semibold text-white shadow-soft press hover:bg-[#122D22]"
              >
                <Plus className="mr-1 h-3.5 w-3.5" /> Add Plant
              </Button>
            </div>

            {/* Plants List / Empty State */}
            {plants.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-[#D5DFD2] bg-[#FAF8F3] p-8 text-center space-y-2">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#DEE7DB] text-[#18392B]">
                  <Sprout className="h-6 w-6" />
                </div>
                <h3 className="font-display text-base font-bold text-[#183626]">No plants recorded yet</h3>
                <p className="text-xs text-[#65796C] max-w-xs mx-auto">
                  Add plants manually or scan them with the AI Plant Doctor to build your digital garden roster.
                </p>
                <div className="pt-2 flex flex-wrap justify-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => setAddModalOpen(true)}
                    className="rounded-full bg-[#18392B] text-xs font-semibold text-white press hover:bg-[#122D22]"
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" /> Add First Plant
                  </Button>
                  <Link
                    to="/plant-doctor"
                    className="inline-flex items-center rounded-full border border-[#D5DFD2] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#183626] hover:bg-[#FAF8F3]"
                  >
                    <Camera className="mr-1.5 h-3.5 w-3.5 text-[#18392B]" /> Scan with AI
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {plants.map((plant) => (
                  <div
                    key={plant.id}
                    className="flex items-start gap-3.5 rounded-[22px] border border-[#E6E0D4] bg-[#FAF8F3] p-3.5 shadow-2xs transition-all hover:border-[#CAD4C5]"
                  >
                    {plant.image ? (
                      <img src={plant.image} alt={plant.name} className="h-16 w-16 flex-none rounded-2xl object-cover" />
                    ) : (
                      <div className="flex h-16 w-16 flex-none items-center justify-center rounded-2xl bg-[#DEE7DB] text-[#18392B]">
                        <Leaf className="h-7 w-7" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-display text-sm font-bold text-[#183626]">{plant.name}</h4>
                          {plant.species && <p className="text-[11px] italic text-[#65796C]">{plant.species}</p>}
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-0.5 text-[9px] font-bold ${
                            plant.condition === "Healthy"
                              ? "bg-[#DEE7DB] text-[#18392B]"
                              : plant.condition === "Requires Immediate Attention"
                              ? "bg-destructive/15 text-destructive"
                              : "bg-amber-500/15 text-amber-800"
                          }`}
                        >
                          {plant.condition}
                        </span>
                      </div>

                      {plant.notes && <p className="mt-1 text-xs text-[#526357] line-clamp-2">{plant.notes}</p>}

                      <div className="mt-2 flex items-center justify-between border-t border-[#EBE6DC] pt-2 text-[10px] text-[#65796C]">
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
          <div className="px-5 space-y-4">
            {/* Upcoming scheduled visit */}
            {upcomingVisits.length > 0 && (
              <div className="space-y-2">
                <h2 className="font-display text-base font-bold text-[#183626]">Upcoming Professional Visits</h2>
                {upcomingVisits.map((b: any) => {
                  const s = services.find((x) => x.slug === (b.service_slug || b.serviceSlug));
                  return (
                    <div key={b.id} className="rounded-[22px] border border-[#CAD8C7] bg-[#EBF0E8] p-4 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-[#18392B]" />
                          <span className="font-bold text-[#183626] text-xs">{s?.name || "Gardener Visit"}</span>
                        </div>
                        <Badge className="bg-[#18392B] text-[10px] text-white">Scheduled</Badge>
                      </div>
                      <p className="text-[11px] text-[#55695B]">
                        {b.booking_date || b.date} at {b.booking_time || b.time} · {b.gardener || "My Gardener Professional"}
                      </p>
                      <p className="text-[11px] text-[#2A4032]">Address: {b.address}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Past visit history */}
            <div>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-base font-bold text-[#183626]">Completed Visit Records</h2>
                <span className="text-[11px] text-[#65796C]">{pastVisits.length} visits on file</span>
              </div>

              {pastVisits.length === 0 ? (
                <div className="mt-3 rounded-[24px] border border-dashed border-[#D5DFD2] bg-[#FAF8F3] p-8 text-center space-y-2">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#DEE7DB] text-[#18392B]">
                    <CalendarDays className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-bold text-[#183626]">No past visits recorded</p>
                  <p className="text-xs text-[#65796C] max-w-xs mx-auto">
                    Every visit completed by a My Gardener professional creates an authentic record with work logs and observations.
                  </p>
                  <div className="pt-2">
                    <Link
                      to="/services"
                      className="inline-flex items-center rounded-full bg-[#18392B] px-4 py-2 text-xs font-semibold text-white shadow-soft"
                    >
                      Browse Care Services
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="mt-3 space-y-3">
                  {pastVisits.map((b: any) => {
                    const s = services.find((x) => x.slug === (b.service_slug || b.serviceSlug));
                    return (
                      <div key={b.id} className="rounded-[22px] border border-[#E6E0D4] bg-[#FAF8F3] p-4 space-y-1.5">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-display text-sm font-bold text-[#183626]">{s?.name || "On-site Visit"}</p>
                            <p className="text-[11px] text-[#65796C]">
                              {b.booking_date || b.date} · Attended by {b.gardener || "My Gardener Professional"}
                            </p>
                          </div>
                          <span className="rounded-full bg-[#DEE7DB] px-2.5 py-0.5 text-[9px] font-bold text-[#18392B]">
                            Completed
                          </span>
                        </div>
                        {b.note && (
                          <div className="rounded-xl bg-[#EBF0E8] p-2.5 text-xs text-[#2A4032]">
                            <span className="font-bold text-[#183626]">Visit Notes: </span>
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
          <div className="px-5 space-y-5">
            {/* Active Care Plan Card */}
            <div>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-base font-bold text-[#183626]">Garden Care Plan</h2>
                <Link to="/services" search={{ tab: "plans" }} className="text-xs font-semibold text-[#18392B] hover:underline">
                  View All Plans
                </Link>
              </div>

              <div className="mt-2.5 rounded-[24px] border border-[#E6E0D4] bg-[#FAF8F3] p-5 shadow-2xs">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#65796C]">Current Status</span>
                    <p className="font-display text-lg font-bold capitalize text-[#183626]">
                      {plan === "free" ? "Free Garden Account" : `${plan} Care Plan`}
                    </p>
                  </div>
                  <Badge className="bg-[#DEE7DB] text-[#18392B]">{plan === "free" ? "Standard" : "Active Member"}</Badge>
                </div>

                {plan === "free" ? (
                  <div className="mt-3.5 rounded-2xl bg-[#EBF0E8] p-4 text-xs text-[#526357]">
                    <p className="font-bold text-[#183626]">Upgrade to a Garden Care Plan</p>
                    <p className="mt-1">
                      Get regular on-site maintenance visits, professional plant health management, and discounts on garden setups.
                    </p>
                    <Link
                      to="/services"
                      search={{ tab: "plans" }}
                      className="mt-3 inline-flex items-center gap-1 rounded-full bg-[#18392B] px-4 py-2 font-semibold text-white shadow-soft press"
                    >
                      <span>Explore Care Plans</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-center text-xs">
                      <div className="rounded-2xl bg-[#EBF0E8] p-2.5">
                        <p className="font-display text-base font-bold text-[#183626]">
                          {pastVisits.length}
                        </p>
                        <p className="text-[10px] text-[#65796C]">Completed Visits</p>
                      </div>
                      <div className="rounded-2xl bg-[#EBF0E8] p-2.5">
                        <p className="font-display text-base font-bold text-[#18392B]">
                          {upcomingVisits.length}
                        </p>
                        <p className="text-[10px] text-[#65796C]">Scheduled Visits</p>
                      </div>
                    </div>
                    <p className="text-xs text-[#526357]">
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
                  <h2 className="font-display text-base font-bold text-[#183626]">Approved AI Health Records</h2>
                  <p className="text-[11px] text-[#65796C]">Diagnoses you confirmed and saved</p>
                </div>
                <Link to="/plant-doctor" className="text-xs font-semibold text-[#18392B] hover:underline">
                  New Scan
                </Link>
              </div>

              {approvedDiagnoses.length === 0 ? (
                <div className="mt-2.5 rounded-[22px] border border-dashed border-[#D5DFD2] bg-[#FAF8F3] p-6 text-center text-xs text-[#65796C]">
                  <p>No AI diagnoses saved yet.</p>
                  <p className="mt-1">When you analyze a plant with the AI Doctor, you can approve saving it here.</p>
                </div>
              ) : (
                <div className="mt-2.5 space-y-3">
                  {approvedDiagnoses.map((diag) => (
                    <div key={diag.id} className="rounded-[22px] border border-[#E6E0D4] bg-[#FAF8F3] p-4 text-xs space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-display font-bold text-[#183626]">{diag.plantName}</p>
                          <p className="text-[#65796C]">{diag.diseaseName}</p>
                        </div>
                        <span className="rounded-full bg-[#DEE7DB] px-2.5 py-0.5 text-[9px] font-bold text-[#18392B]">
                          {diag.date}
                        </span>
                      </div>
                      <p className="mt-1.5 text-[#2A4032]"><strong className="font-bold text-[#183626]">Treatment: </strong>{diag.treatment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Manual Add Plant Modal */}
        <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
          <DialogContent className="max-w-md rounded-[26px] border-[#E2DDD2] bg-[#FAF8F3] p-6 shadow-soft">
            <DialogHeader>
              <DialogTitle className="font-display text-xl font-bold text-[#183626]">Add Plant to Garden</DialogTitle>
            </DialogHeader>

            <div className="mt-3 space-y-3">
              <div>
                <label className="text-xs font-bold text-[#183626]">Plant Name *</label>
                <Input
                  placeholder="e.g. Monstera, Tulsi, Hibiscus"
                  value={newPlantName}
                  onChange={(e) => setNewPlantName(e.target.value)}
                  className="mt-1 rounded-xl bg-white border-[#D5DFD2]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#183626]">Species / Botanical Name (Optional)</label>
                <Input
                  placeholder="e.g. Ocimum tenuiflorum"
                  value={newPlantSpecies}
                  onChange={(e) => setNewPlantSpecies(e.target.value)}
                  className="mt-1 rounded-xl bg-white border-[#D5DFD2]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#183626]">Current Condition</label>
                <div className="mt-1 grid grid-cols-3 gap-2">
                  {(["Healthy", "Needs Attention", "Requires Immediate Attention"] as const).map((cond) => (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => setNewPlantCondition(cond)}
                      className={`rounded-xl border p-2 text-center text-xs font-medium transition ${
                        newPlantCondition === cond
                          ? "border-[#18392B] bg-[#DEE7DB] text-[#18392B] font-bold"
                          : "border-[#D5DFD2] bg-white text-[#65796C]"
                      }`}
                    >
                      {cond === "Requires Immediate Attention" ? "Critical" : cond}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#183626]">Care Notes (Optional)</label>
                <Textarea
                  placeholder="e.g. In south balcony, repotted last month"
                  value={newPlantNotes}
                  onChange={(e) => setNewPlantNotes(e.target.value)}
                  rows={2}
                  className="mt-1 rounded-xl bg-white border-[#D5DFD2] resize-none"
                />
              </div>
            </div>

            <DialogFooter className="mt-4 flex gap-2 sm:justify-end">
              <Button variant="outline" className="rounded-full border-[#D5DFD2]" onClick={() => setAddModalOpen(false)}>
                Cancel
              </Button>
              <Button className="rounded-full bg-[#18392B] font-semibold text-white hover:bg-[#122D22]" onClick={handleCreatePlant}>
                Save Plant
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Shell>
  );
}

