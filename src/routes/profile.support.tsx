import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/Shell";
import { Card } from "@/components/ui/card";
import { ArrowLeft, MessageCircle, Mail, Phone } from "lucide-react";

export const Route = createFileRoute("/profile/support")({
  head: () => ({ meta: [{ title: "Help & Support — Biosphere" }] }),
  component: SupportPage,
});

function SupportPage() {
  const options = [
    { icon: MessageCircle, label: "WhatsApp chatbot", hint: "Instant help, 24/7", href: "https://wa.me/919999999999", color: "bg-green-500" },
    { icon: Mail, label: "Email us", hint: "support@biosphere.app", href: "mailto:support@biosphere.app", color: "bg-blue-500" },
    { icon: Phone, label: "Call support", hint: "+91 80 4567 8900 · 9am–7pm", href: "tel:+918045678900", color: "bg-primary" },
  ];

  const faqs = [
    { q: "How do I reschedule a booking?", a: "Open Bookings → your booking → Reschedule. A 10% fee applies and new slot must be 24h+ from the original." },
    { q: "When do I get Green Points?", a: "Instantly after a service or order is confirmed. 50 pts per ₹100 spent." },
    { q: "Can I return Biovelocity products?", a: "Sealed bottles within 7 days are eligible. Opened bottles are non-returnable." },
  ];

  return (
    <Shell>
      <Link to="/profile" className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4" /> Back</Link>
      <h1 className="font-display text-2xl font-semibold">Help & Support</h1>

      <div className="mt-4 space-y-2">
        {options.map(o => (
          <a key={o.label} href={o.href} target="_blank" rel="noreferrer">
            <Card className="flex items-center gap-3 p-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${o.color} text-white`}><o.icon className="h-5 w-5" /></div>
              <div className="flex-1">
                <p className="text-sm font-medium">{o.label}</p>
                <p className="text-xs text-muted-foreground">{o.hint}</p>
              </div>
            </Card>
          </a>
        ))}
      </div>

      <h2 className="mt-6 font-display text-lg font-semibold">FAQs</h2>
      <div className="mt-2 space-y-2">
        {faqs.map(f => (
          <Card key={f.q} className="p-3">
            <p className="text-sm font-medium">{f.q}</p>
            <p className="mt-1 text-sm text-muted-foreground">{f.a}</p>
          </Card>
        ))}
      </div>
    </Shell>
  );
}
