import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useProfile, type PlanId } from "@/lib/stores";

/**
 * Keeps the local profile store in sync with the signed-in user's row
 * in the database. Mounted once from the root route.
 */
export function AuthSync() {
  useEffect(() => {
    let cancelled = false;

    const load = async (userId: string, fallbackEmail?: string | null) => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, email, phone, address, avatar_url, plan, green_points")
        .eq("id", userId)
        .maybeSingle();
      if (cancelled || !data) return;
      const s = useProfile.getState();
      s.update({
        name: data.full_name || s.name,
        email: data.email || fallbackEmail || s.email,
        phone: data.phone || s.phone,
        address: data.address || s.address,
        avatar: data.avatar_url || s.avatar,
      });
      if (data.plan) s.setPlan(data.plan as PlanId);
    };

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        // defer: no async work directly inside the callback
        setTimeout(() => void load(session.user.id, session.user.email), 0);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) void load(data.session.user.id, data.session.user.email);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  return null;
}
