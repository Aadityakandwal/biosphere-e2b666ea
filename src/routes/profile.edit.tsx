import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Shell } from "@/components/Shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfile } from "@/lib/stores";
import { ArrowLeft, Camera, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/profile/edit")({
  head: () => ({ meta: [{ title: "Edit profile — Biosphere" }] }),
  component: EditProfile,
});

const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=240";

function EditProfile() {
  const p = useProfile();
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState(p.avatar || DEFAULT_AVATAR);
  const [f, setF] = useState({ name: p.name, email: p.email, phone: p.phone, address: p.address });

  const pick = async (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Image must be under 4MB");
      return;
    }
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = () => reject(new Error("Could not read file"));
      r.readAsDataURL(file);
    });
    setAvatar(dataUrl);
  };

  const save = () => {
    p.update({ ...f, avatar });
    toast.success("Profile updated");
  };

  return (
    <Shell>
      <Link to="/profile" className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4" /> Back</Link>
      <h1 className="font-display text-2xl font-semibold">Edit profile</h1>

      <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ""; }} />

      <Card className="mt-4 flex flex-col items-center gap-3 p-5">
        <div className="relative">
          <img src={avatar} alt="Profile photo" className="h-24 w-24 rounded-full object-cover ring-4 ring-primary/80 ring-offset-2 ring-offset-background" />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            aria-label="Change profile photo"
            className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-elevated)] press"
          >
            <Camera className="h-4 w-4" />
          </button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="rounded-full" onClick={() => fileRef.current?.click()}>Upload photo</Button>
          {avatar !== DEFAULT_AVATAR && (
            <Button variant="ghost" size="sm" className="rounded-full text-destructive" onClick={() => setAvatar(DEFAULT_AVATAR)}>
              <Trash2 className="mr-1 h-4 w-4" /> Remove
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">JPG or PNG, up to 4MB</p>
      </Card>

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
