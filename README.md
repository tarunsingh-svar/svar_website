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

### Marketing → Cloudflare Workers (free)

The marketing site (`/`, `/privacy`, `/terms`) deploys as a static export to a
Cloudflare **Worker** with static assets (Workers Builds git integration).

```bash
npm run pages:build    # emits out/
npm run pages:preview  # local preview (waitlist API local only)
```

**Cloudflare Workers Builds settings** (Workers & Pages → your Worker → Settings → Builds)

| Setting | Value |
|---|---|
| Build command | `npm run pages:build` |
| **Deploy command** (production) | `npm run pages:deploy` |
| **Non-production branch deploy command** | `npm run pages:deploy:preview` |

> **Use `npm run pages:build`** — not `npm run build`. The deploy uses
> `wrangler deploy` (Workers), not `wrangler pages deploy` (Pages).

**Worker name must match:** the `name` in `wrangler.toml` must exactly match your
Worker name in the Cloudflare dashboard (currently `svar_website`). If your
Worker has a different name, update `wrangler.toml` to match.

**No API token needed.** Cloudflare injects auth automatically during git builds
(log may show `token=set` — that's the platform, not something you configure).

**Optional Variables** (Settings → Variables)

| Variable | Notes |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Baked into static build |
| `NEXT_PUBLIC_SITE_URL` | e.g. `https://svarai.com` |

> Waitlist (`POST /api/waitlist`) requires a follow-up for Workers static deploy
> (move to Supabase Edge Function). The landing page itself will deploy.

**Custom domain:** Workers & Pages → your Worker → Settings → Domains → add
`svarai.com`.

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
