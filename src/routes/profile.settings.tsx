import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/Shell";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/profile/settings")({
  head: () => ({ meta: [{ title: "Settings — Biosphere" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [s, setS] = useState({
    notifications: true, marketing: false, location: true, dark: false, biometric: false,
  });
  const toggle = (k: keyof typeof s) => setS({ ...s, [k]: !s[k] });

  const rows: { k: keyof typeof s; label: string; hint: string }[] = [
    { k: "notifications", label: "Push notifications", hint: "Booking updates and reminders" },
    { k: "marketing", label: "Marketing emails", hint: "Offers and seasonal tips" },
    { k: "location", label: "Location access", hint: "For nearby gardener assignment" },
    { k: "dark", label: "Dark mode", hint: "Use device theme" },
    { k: "biometric", label: "Biometric login", hint: "Face ID / fingerprint" },
  ];

  return (
    <Shell>
      <Link to="/profile" className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4" /> Back</Link>
      <h1 className="font-display text-2xl font-semibold">Settings</h1>

      <div className="mt-4 space-y-2">
        {rows.map(r => (
          <Card key={r.k} className="flex items-center justify-between p-3">
            <div>
              <p className="text-sm font-medium">{r.label}</p>
              <p className="text-xs text-muted-foreground">{r.hint}</p>
            </div>
            <Switch checked={s[r.k]} onCheckedChange={() => toggle(r.k)} />
          </Card>
        ))}
      </div>

      <div className="mt-6 space-y-2">
        <Button variant="outline" className="w-full" onClick={() => toast.info("Data exported to your email")}>Export my data</Button>
        <Button variant="outline" className="w-full" onClick={() => toast.success("Signed out")}>Sign out</Button>
        <Button variant="destructive" className="w-full" onClick={() => toast.error("Contact support to delete account")}>Delete account</Button>
      </div>
    </Shell>
  );
}
