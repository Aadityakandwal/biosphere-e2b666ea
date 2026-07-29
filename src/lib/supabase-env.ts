export function getSupabaseEnvStatus() {
  const serverEnv = typeof process !== "undefined" ? process.env : undefined;
  const url = import.meta.env.VITE_SUPABASE_URL || serverEnv?.SUPABASE_URL;
  const publishableKey =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || serverEnv?.SUPABASE_PUBLISHABLE_KEY;

  const missing = [
    !url ? "VITE_SUPABASE_URL" : null,
    !publishableKey ? "VITE_SUPABASE_PUBLISHABLE_KEY" : null,
  ].filter((name): name is string => Boolean(name));

  return {
    configured: missing.length === 0,
    missing,
  };
}