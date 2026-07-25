import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/Shell";
import { useBookings } from "@/lib/stores";
import { services } from "@/lib/data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/profile/bookings")({
  head: () => ({ meta: [{ title: "My bookings — Biosphere" }] }),
  component: () => {
    const bookings = useBookings(s => s.bookings);
    return (
      <Shell>
        <Link to="/profile" className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4" /> Back</Link>
        <h1 className="font-display text-2xl font-semibold">My bookings</h1>
        <div className="mt-4 space-y-3">
          {bookings.map(b => {
            const s = services.find(x => x.slug === b.serviceSlug);
            return (
              <Card key={b.id} className="p-4">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">{s?.name}</p>
                    <p className="text-xs text-muted-foreground">{b.date} · {b.time} · {b.gardener}</p>
                  </div>
                  <span className="text-xs uppercase text-muted-foreground">{b.status}</span>
                </div>
                <div className="mt-3 flex gap-2">
                  <Link to="/bookings/$id" params={{ id: b.id }} className="flex-1"><Button variant="outline" className="w-full">Details</Button></Link>
                  <Link to="/services/$slug" params={{ slug: b.serviceSlug }} className="flex-1"><Button className="w-full">Rebook</Button></Link>
                </div>
              </Card>
            );
          })}
        </div>
      </Shell>
    );
  },
});
