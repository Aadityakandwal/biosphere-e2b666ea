type EnvMap = Record<string, string | undefined>;

function getProcessEnv(): EnvMap {
  if (typeof process === "undefined") return {};
  return process.env ?? {};
}

export function getSupabaseEnvStatus() {
  const processEnv = getProcessEnv();
  const url = import.meta.env.VITE_SUPABASE_URL || processEnv.SUPABASE_URL;
  const publishableKey =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || processEnv.SUPABASE_PUBLISHABLE_KEY;

  const missing = [
    ...(!url ? ["VITE_SUPABASE_URL"] : []),
    ...(!publishableKey ? ["VITE_SUPABASE_PUBLISHABLE_KEY"] : []),
  ];

  return {
    configured: missing.length === 0,
    missing,
    url,
    publishableKey,
  };
}

export function isSupabaseConfigured() {
  return getSupabaseEnvStatus().configured;
}