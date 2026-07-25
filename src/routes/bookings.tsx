import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/Shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useBookings } from "@/lib/stores";
import { services } from "@/lib/data";
import { CalendarDays, MapPin, User, Star } from "lucide-react";

export const Route = createFileRoute("/bookings")({
  head: () => ({
    meta: [
      { title: "My Bookings — Biosphere" },
      { name: "description", content: "Track upcoming and past gardening bookings." },
      { property: "og:title", content: "My Bookings — Biosphere" },
      { property: "og:description", content: "Track upcoming and past gardening bookings." },
    ],
  }),
  component: BookingsPage,
});

function BookingsPage() {
  const bookings = useBookings((s) => s.bookings);
  const upcoming = bookings.filter(b => b.status === "upcoming");
  const past = bookings.filter(b => b.status === "past");

  return (
    <Shell title="Bookings">
      <Tabs defaultValue="upcoming" className="mt-3">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="mt-4 space-y-3">
          {upcoming.length === 0 && <Empty text="No upcoming bookings" />}
          {upcoming.map(b => {
            const s = services.find(x => x.slug === b.serviceSlug);
            return (
              <Card key={b.id} className="p-4">
                <p className="font-medium">{s?.name}</p>
                <Meta icon={CalendarDays}>{b.date} · {b.time}</Meta>
                <Meta icon={User}>{b.gardener}</Meta>
                <Meta icon={MapPin}>{b.address}</Meta>
                <div className="mt-3 flex gap-2">
                  <Link to="/bookings/$id" params={{ id: b.id }} className="flex-1"><Button variant="outline" className="w-full">Manage details</Button></Link>
                  <Link to="/bookings/$id" params={{ id: b.id }} search={{ reschedule: 1 }} className="flex-1"><Button className="w-full">Reschedule</Button></Link>
                </div>
              </Card>
            );
          })}
        </TabsContent>
        <TabsContent value="past" className="mt-4 space-y-3">
          {past.length === 0 && <Empty text="No past bookings" />}
          {past.map(b => {
            const s = services.find(x => x.slug === b.serviceSlug);
            return (
              <Card key={b.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{s?.name}</p>
                    <Meta icon={CalendarDays}>{b.date}</Meta>
                    <Meta icon={User}>{b.gardener}</Meta>
                  </div>
                  {b.rating && <div className="flex items-center gap-0.5 text-yellow-500">{Array.from({length:b.rating}).map((_,i)=><Star key={i} className="h-3 w-3 fill-current"/>)}</div>}
                </div>
                <div className="mt-3 flex gap-2">
                  <Link to="/bookings/$id" params={{ id: b.id }} className="flex-1"><Button variant="outline" className="w-full">Details</Button></Link>
                  <Link to="/services/$slug" params={{ slug: b.serviceSlug }} className="flex-1"><Button className="w-full">Rebook</Button></Link>
                </div>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </Shell>
  );
}

function Meta({ icon: Icon, children }: { icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground"><Icon className="h-3.5 w-3.5" /> {children}</p>;
}
function Empty({ text }: { text: string }) {
  return <Card className="p-8 text-center text-sm text-muted-foreground">{text}</Card>;
}
