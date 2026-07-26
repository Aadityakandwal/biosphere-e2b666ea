import { useEffect, useState } from "react";
import logoAsset from "@/assets/biosphere-logo.png.asset.json";

/** Small inline spinner: growing leaf ring. */
export function LeafSpinner({ size = 44 }: { size?: number }) {
  return (
    <span
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    >
      <span className="absolute inset-0 rounded-full border-2 border-primary/15" />
      <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-primary border-r-primary/50" />
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
    </span>
  );
}

/** Route-transition loader used as the router's pending component. */
export function PageLoader() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 bg-background">
      <LeafSpinner size={52} />
      <p className="animate-pulse text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
        Growing your page
      </p>
    </div>
  );
}

/** Skeleton block for content placeholders. */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`relative overflow-hidden rounded-2xl bg-muted/70 ${className}`}>
    <span className="shimmer absolute inset-0" />
  </div>;
}

/** Full-screen branded splash shown once per browser session. */
export function Splash() {
  // Rendered on the server too, so it covers the app from the very first paint.
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const reduced = useApplyReducedMotion();

  useEffect(() => {
    const t1 = setTimeout(() => setLeaving(true), reduced ? 250 : 1400);
    const t2 = setTimeout(() => setVisible(false), reduced ? 500 : 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [reduced]);

  if (!visible) return null;


  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background transition-all ${
        reduced ? "duration-200" : "duration-500"
      } ${leaving ? `pointer-events-none opacity-0 ${reduced ? "" : "scale-105"}` : "opacity-100"}`}
    >
      {/* soft botanical glow */}
      <div className={`pointer-events-none absolute h-72 w-72 rounded-full bg-primary/15 blur-3xl ${reduced ? "" : "animate-pulse"}`} />

      <div className="relative flex flex-col items-center">
        {/* pulsing rings */}
        {!reduced && (
          <>
            <span className="splash-ring absolute h-28 w-28 rounded-full border border-primary/30" />
            <span className="splash-ring absolute h-28 w-28 rounded-full border border-primary/30 [animation-delay:0.8s]" />
          </>
        )}


        <img
          src={logoAsset.url}
          alt="Biosphere"
          className="splash-logo h-24 w-24 rounded-3xl object-contain"
        />
        <h1 className="splash-word mt-6 font-display text-3xl font-semibold tracking-tight text-foreground">
          Biosphere
        </h1>
        <p className="splash-word mt-1 text-[11px] font-medium uppercase tracking-[0.28em] text-muted-foreground [animation-delay:0.25s]">
          Grow with care
        </p>

        {/* growing progress stem */}
        <span className="mt-8 block h-0.5 w-40 overflow-hidden rounded-full bg-muted">
          <span className="splash-bar block h-full rounded-full bg-primary" />
        </span>
      </div>
    </div>
  );
}
