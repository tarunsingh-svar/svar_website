# SVAR AI — Website

Marketing landing site and web app for [SVAR AI](https://svarai.com). Lives in
this folder — no coupling to the Flutter app (`../svar_ai`) or the Flask API
(`../svar_ai_flask`). Shares the Supabase project for auth and the early-access
waitlist.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4
- Framer Motion
- Supabase (waitlist, auth)
- Cloudflare Pages (marketing, free)
- Render (web app + Flask API, when fully live)

## Development

```bash
npm install
cp .env.example .env.local   # then fill in SUPABASE_SERVICE_ROLE_KEY
npm run dev
```

The service role key is found in Supabase Dashboard → Project Settings → API
keys. It is server-only: never expose it to the browser or commit it.

## Waitlist

`POST /api/waitlist` validates the email, checks a honeypot field, rate-limits
by IP, and inserts into `public.waitlist` using the service role key.

- **Local dev / Render:** handled by `app/api/waitlist/route.ts`
- **Cloudflare Pages:** handled by `functions/api/waitlist.ts`

The table has RLS enabled with no policies, so the public anon key can neither
write nor read it. Duplicate signups return success so the endpoint can't be
used to probe who is on the list.

The table schema lives in the app repo's migration history:
`../svar_ai/supabase/migrations/20260727000000_add_waitlist.sql`.

## Deployment

### Marketing → Cloudflare Pages (free)

The marketing site (`/`, `/privacy`, `/terms`) deploys as a static export. App
routes, auth, and Next.js API routes are excluded from this build.

```bash
npm run build:marketing   # emits out/
npm run pages:preview     # local preview with waitlist function
```

**Cloudflare Pages project settings**

| Setting | Value |
|---|---|
| Framework preset | **None** |
| Build command | `npm run pages:build` |
| **Deploy command** (production) | `npm run pages:deploy` |
| **Non-production branch deploy command** | `npm run pages:deploy:preview` |
| Build output directory | *(not shown — set via `wrangler.toml` → `pages_build_output_dir`)* |

> **Use `npm run pages:build` on Cloudflare** — not `npm run build`. The latter
> runs the full web-app build (needs Supabase env vars and API routes). Marketing
> only needs the static export in `out/`.

**Environment variables** (Cloudflare dashboard → Settings → Environment variables)

| Variable | Notes |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public — baked into static build |
| `NEXT_PUBLIC_SITE_URL` | e.g. `https://svarai.com` |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret — used by Pages Function only |

**Do not add `CLOUDFLARE_API_TOKEN` unless you create one on purpose.** If deploy
fails with `Authentication error [code: 10000]`, a bad token is usually set in
Variables. Fix:

1. **Remove** `CLOUDFLARE_API_TOKEN` from Pages → Settings → Variables (try this
   first — git builds often authenticate automatically without a custom token).
2. If deploy still needs a token, create one at [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens):
   - **Account → Cloudflare Pages → Edit**
   - **User → User Details → Read**
   - **Account → Account Settings → Read**
3. Add it as an encrypted Variable: `CLOUDFLARE_API_TOKEN`
4. Optionally add `CLOUDFLARE_ACCOUNT_ID` as a Variable (Wrangler reads it from the
   environment automatically — do **not** pass it as a CLI flag)

**Custom domain:** add `svarai.com` and `www.svarai.com` in Cloudflare Pages,
then point DNS to Cloudflare (see below).

**Rollback after a temporary launch:** revert `svarai.com` DNS to the previous
registrar records. The Pages project can stay deployed at $0 while idle.

### Web app → Render (when fully live)

Deploy the full Next.js app (`npm run build && npm start`) as a Render Web
Service on a subdomain such as `app.svarai.com`. The Flask API already runs on
Render at `svar-ai-flask.onrender.com`.

### DNS for svarai.com

If the domain is on Cloudflare:

1. Pages → your project → Custom domains → add `svarai.com`
2. Cloudflare auto-configures DNS when the zone is on the same account

If the domain is elsewhere (e.g. GoDaddy), either:

- Transfer DNS to Cloudflare (recommended), or
- Add a CNAME: `www` → `<project>.pages.dev`, and configure redirect/root per
  Cloudflare docs

Current parking-page records to restore on rollback:

```
A     @    15.197.148.33
A     @    3.33.130.190
```

## Structure

- `app/(marketing)/` — landing, privacy, terms
- `app/app/` — authenticated web app (Render only)
- `app/api/waitlist/` — waitlist route for local dev / Render
- `functions/api/waitlist.ts` — waitlist for Cloudflare Pages
- `scripts/build-marketing.mjs` — static export build for Pages
- `components/sections/` — one component per landing page section
- `components/visuals/` — coded product visuals
- `lib/content.ts` — marketing copy and sample-output data
- `lib/legal.ts` — privacy/terms text
