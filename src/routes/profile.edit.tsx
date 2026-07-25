import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/Shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfile } from "@/lib/stores";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/profile/edit")({
  head: () => ({ meta: [{ title: "Edit profile — Biosphere" }] }),
  component: EditProfile,
});

function EditProfile() {
  const p = useProfile();
  const [f, setF] = useState({ name: p.name, email: p.email, phone: p.phone, address: p.address });

  const save = () => { p.update(f); toast.success("Profile updated"); };

  return (
    <Shell>
      <Link to="/profile" className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4" /> Back</Link>
      <h1 className="font-display text-2xl font-semibold">Edit profile</h1>
      <Card className="mt-4 space-y-3 p-4">
        {(["name","email","phone","address"] as const).map(k => (
          <div key={k}>
            <Label className="capitalize">{k}</Label>
            <Input value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} className="mt-1" />
          </div>
        ))}
        <Button className="w-full" onClick={save}>Save changes</Button>
      </Card>
    </Shell>
  );
}
