import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  /** Extra classes applied to the wrapper. */
  className?: string;
  /** Stagger the direct children instead of the wrapper itself. */
  stagger?: boolean;
  /** Delay in ms before the reveal transition starts. */
  delay?: number;
  as?: ElementType;
};

/**
 * Reveals its content with a soft rise + fade the first time it scrolls
 * into view. Falls back to visible immediately when IntersectionObserver
 * is unavailable (or during SSR hydration).
 */
export function Reveal({ children, className = "", stagger = false, delay = 0, as }: RevealProps) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={`${stagger ? "stagger-children" : "reveal-item"} ${visible ? "is-visible" : ""} ${className}`.trim()}
    >
      {children}
    </Tag>
  );
}
