import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Leaf, Loader2 } from "lucide-react";
import { toast } from "sonner";

/**
 * Public OAuth landing route. Providers redirect here after consent; the
 * Supabase client parses the code/hash, then we forward to the intended page.
 */
export const Route = createFileRoute("/auth/callback")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Signing you in — Biosphere" },
      { name: "description", content: "Completing your Biosphere sign-in." },
      { property: "og:title", content: "Signing you in — Biosphere" },
      { property: "og:description", content: "Completing your Biosphere sign-in." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthCallback,
});

function safePath(value: string | null): string {
  if (!value) return "/";
  return value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

function AuthCallback() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Finishing sign-in…");

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams(window.location.search);
    const dest = safePath(sessionStorage.getItem("bio-auth-redirect") ?? params.get("redirect"));
    sessionStorage.removeItem("bio-auth-redirect");

    const providerError = params.get("error_description") || params.get("error");
    if (providerError) {
      toast.error(providerError);
      navigate({ to: "/auth", replace: true });
      return;
    }

    const finish = async () => {
      // PKCE: exchange the ?code= for a session. Implicit/hash flows are
      // already handled by detectSessionInUrl before this runs.
      const code = params.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error && !/code verifier|already/i.test(error.message)) {
          if (cancelled) return;
          toast.error(error.message);
          navigate({ to: "/auth", replace: true });
          return;
        }
      }

      // Give the client a moment to persist the session, then verify.
      for (let i = 0; i < 20; i++) {
        const { data } = await supabase.auth.getSession();
        if (cancelled) return;
        if (data.session) {
          toast.success("Welcome back 🌿");
          navigate({ to: dest, replace: true });
          return;
        }
        await new Promise((r) => setTimeout(r, 150));
      }

      if (cancelled) return;
      setMessage("Could not complete sign-in.");
      navigate({ to: "/auth", replace: true });
    };

    void finish();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary shadow-[var(--shadow-soft)]">
        <Leaf className="h-8 w-8" />
      </span>
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> {message}
      </p>
    </main>
  );
}
