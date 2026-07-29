# Biosphere — Migrating to your own Supabase project

This app is **backend-agnostic**: it talks to Supabase only through environment
variables. Point those variables at your own project and it runs anywhere
(localhost, Vercel, Netlify, Cloudflare, your own server).

---

## 1. Create your Supabase project

1. https://supabase.com/dashboard → **New project**.
2. Wait until it is provisioned.
3. Copy from **Project Settings → API**:
   - Project URL → `VITE_SUPABASE_URL`
   - `anon` / publishable key → `VITE_SUPABASE_PUBLISHABLE_KEY`

## 2. Create the database

Open **SQL Editor → New query**, paste the whole of [`db/schema.sql`](./db/schema.sql), Run.

It creates:

| Object | Type |
| --- | --- |
| `public.profiles` | table + RLS (own row read/insert/update) + `updated_at` trigger |
| `public.payments` | table + RLS (own rows, all ops) + index |
| `public.orders` | table + RLS + `updated_at` trigger + index, FK → payments |
| `public.bookings` | table + RLS + `updated_at` trigger + index, FK → payments |
| `public.update_updated_at_column()` | trigger function |
| `public.handle_new_user()` | SECURITY DEFINER function + `auth.users` trigger (auto profile on signup) |

Views: none. Storage buckets: none (optional avatars bucket documented at the
bottom of the file). Edge Functions: none — all server logic is TanStack
server functions inside this repo (`src/lib/*.functions.ts`), deployed with the app.

CLI alternative:

```bash
supabase link --project-ref <your-ref>
psql "$SUPABASE_DB_URL" -f db/schema.sql
```

## 3. Environment variables

Copy `.env.example` to `.env` and fill it in.

**Client (must be `VITE_`-prefixed, safe to expose):**

| Variable | Value |
| --- | --- |
| `VITE_SUPABASE_URL` | `https://<your-ref>.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | your anon/publishable key |

**Server (SSR / server functions, never exposed to the browser):**

| Variable | Value |
| --- | --- |
| `SUPABASE_URL` | same as above |
| `SUPABASE_PUBLISHABLE_KEY` | same anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | service role key (only if you add admin-side logic) |
| `GEMINI_API_KEY` | Google AI Studio key — powers AI Plant Doctor |
| `RAZORPAY_KEY_ID` | Razorpay key id (currently test: `rzp_test_TIsC5QDvvG8v2V`) |
| `RAZORPAY_KEY_SECRET` | Razorpay secret |

Set the same variables in your hosting provider's dashboard for production.

## 4. Authentication

### Email / password
Supabase Dashboard → **Authentication → Providers → Email**: enabled by default.
Turn "Confirm email" on or off to taste. Enable **Leaked password protection**.

### Google OAuth
1. Google Cloud Console → **APIs & Services → Credentials → Create OAuth client ID → Web application**.
2. **Authorized JavaScript origins**
   - `http://localhost:8080`
   - `https://your-production-domain.com`
3. **Authorized redirect URIs**
   - `https://<your-ref>.supabase.co/auth/v1/callback`
4. Supabase Dashboard → **Authentication → Providers → Google**: paste Client ID + Client Secret, Save.

### URL configuration (this is what fixes local 404s / bad redirects)
Supabase Dashboard → **Authentication → URL Configuration**:
- **Site URL**: `http://localhost:8080` while developing, your domain in production.
- **Redirect URLs** (add all):
  - `http://localhost:8080/**`
  - `https://your-production-domain.com/**`

The app signs in with
`supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: \`${window.location.origin}/auth/callback?redirect=...\` } })`
and the route `src/routes/auth.callback.tsx` exchanges the code for a session,
so it works on any origin without code changes. Sessions persist in
`localStorage` with auto-refresh (`src/integrations/supabase/client.ts`).

## 5. Run it

```bash
npm install
npm run dev     # http://localhost:8080
npm run build   # production build
```

## 6. Manual checklist

**Supabase Dashboard**
- [ ] Project created; URL + anon key copied
- [ ] `db/schema.sql` executed successfully
- [ ] Email provider enabled (confirm-email setting chosen)
- [ ] Google provider enabled with your Client ID + Secret
- [ ] Site URL + Redirect URLs include localhost and production
- [ ] Leaked-password protection on (optional but recommended)

**Google Cloud Console**
- [ ] OAuth consent screen configured (scopes: `email`, `profile`, `openid`)
- [ ] Web OAuth client created
- [ ] JS origins: `http://localhost:8080` + production domain
- [ ] Redirect URI: `https://<your-ref>.supabase.co/auth/v1/callback`

**Hosting provider**
- [ ] All env vars from section 3 set
- [ ] Build command `npm run build`

**Razorpay / Gemini**
- [ ] Swap Razorpay test keys for live keys when going live
- [ ] Gemini key restricted to your domains

## 7. Lovable dependency status

Removed: the Lovable managed-auth integration (`src/integrations/lovable`) and
the `@lovable.dev/cloud-auth-js` package. No backend call goes through Lovable.

Still present, and harmless outside Lovable:
- `@lovable.dev/vite-tanstack-config` — the Vite/TanStack build preset in
  `vite.config.ts`. It is a plain build-time config package on npm; it makes no
  network calls at runtime. Keep it, or inline an equivalent
  `@tanstack/react-start` Vite config if you prefer zero Lovable packages.
- `src/lib/lovable-error-reporting.ts` — a no-op unless the Lovable editor
  globals exist. Safe to delete if you want.
- `supabase/config.toml` holds the old managed project ref; it is only used by
  the Lovable/Supabase CLI link and is ignored by the app at runtime. Replace
  the ref with yours if you plan to use `supabase link`.

> Note: disconnecting Lovable Cloud itself is a dashboard action (Cloud →
> Advanced → Disconnect) and is irreversible for this project — do it only
> after your own Supabase project is verified working.
