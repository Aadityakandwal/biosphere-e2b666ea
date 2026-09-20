import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sprout, CheckCircle2, AlertTriangle, ShieldCheck, Leaf } from "lucide-react";
import type { PlantHealthAnalysis } from "@/lib/plant-doctor.functions";
import { useGarden } from "@/lib/stores";
import { toast } from "sonner";

interface GardenApprovalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analysis: PlantHealthAnalysis;
  imageUrl?: string | null;
  onApproved?: () => void;
}

export function GardenApprovalModal({
  open,
  onOpenChange,
  analysis,
  imageUrl,
  onApproved,
}: GardenApprovalModalProps) {
  const addPlant = useGarden((s) => s.addPlant);
  const saveApprovedDiagnosis = useGarden((s) => s.saveApprovedDiagnosis);
  const addIssue = useGarden((s) => s.addIssue);

  const handleConfirm = () => {
    // 1. Add/update plant in Garden Roster
    addPlant({
      name: analysis.plant_name || "Garden Specimen",
      species: analysis.botanical_name,
      condition: analysis.condition,
      image: imageUrl || undefined,
      notes: `Diagnosed: ${analysis.possible_issue}. ${analysis.care_recommendations.watering}`,
      lastDiagnosis: analysis.possible_issue,
    });

    // 2. If an issue was detected, log in Issues Log
    if (analysis.condition !== "Healthy") {
      addIssue({
        title: analysis.possible_issue,
        plantName: analysis.plant_name,
        severity: analysis.condition === "Requires Immediate Attention" ? "High" : "Moderate",
        symptoms: analysis.visible_symptoms.join(". "),
        status: "active",
      });
    }

    // 3. Save to approved diagnoses archive
    saveApprovedDiagnosis({
      plantName: analysis.plant_name,
      condition: analysis.condition,
      diseaseName: analysis.possible_issue,
      symptoms: analysis.visible_symptoms.join(". "),
      treatment: analysis.recommended_treatment.join(". "),
      image: imageUrl || undefined,
    });

    toast.success("Garden Dashboard updated with plant health record!");
    onOpenChange(false);
    onApproved?.();
  };

  const isHealthy = analysis.condition === "Healthy";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl border-border bg-card p-6 shadow-elevated">
        <DialogHeader className="text-left">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Sprout className="h-6 w-6" />
            </span>
            <div>
              <DialogTitle className="font-display text-xl font-bold tracking-tight text-foreground">
                Update Garden Dashboard?
              </DialogTitle>
              <p className="text-xs text-muted-foreground">
                Confirm which details to save to your digital garden record.
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4 space-y-3 rounded-2xl border border-border/80 bg-background/60 p-4 text-sm">
          <div className="flex items-start justify-between gap-2 border-b border-border/60 pb-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Plant Record</p>
              <p className="font-display text-base font-bold text-foreground">{analysis.plant_name}</p>
              {analysis.botanical_name && (
                <p className="text-xs italic text-muted-foreground">{analysis.botanical_name}</p>
              )}
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                isHealthy
                  ? "bg-primary/15 text-primary"
                  : analysis.condition === "Requires Immediate Attention"
                  ? "bg-destructive/15 text-destructive"
                  : "bg-amber-500/15 text-amber-700 dark:text-amber-400"
              }`}
            >
              {analysis.condition}
            </span>
          </div>

          <div className="space-y-2 pt-1 text-xs">
            <div className="flex items-start gap-2">
              <Leaf className="mt-0.5 h-3.5 w-3.5 flex-none text-primary" />
              <div>
                <span className="font-semibold text-foreground">Analysis: </span>
                <span className="text-muted-foreground">{analysis.possible_issue}</span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 flex-none text-primary" />
              <div>
                <span className="font-semibold text-foreground">Care Protocol: </span>
                <span className="text-muted-foreground">
                  {analysis.recommended_treatment[0] || "Custom watering and light schedule logged"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-2 text-xs text-muted-foreground">
          You stay in complete control of your garden records. You can update or remove this entry anytime in your Garden Dashboard.
        </p>

        <DialogFooter className="mt-5 flex gap-2 sm:justify-end">
          <Button
            variant="outline"
            className="flex-1 rounded-full border-border hover:bg-muted"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 rounded-full bg-primary font-semibold text-primary-foreground shadow-soft hover:bg-primary/90 press"
            onClick={handleConfirm}
          >
            Update Dashboard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
