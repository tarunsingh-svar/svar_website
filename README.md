# SVAR AI — Marketing Website

Standalone landing site for [SVAR AI](https://svar.ai). Lives entirely in this
folder — no coupling to the Flutter app (`../svar_ai`) or the Flask API
(`../svar_ai_flask`). It shares only the Supabase project, used for the
early-access waitlist.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4
- Framer Motion
- Supabase (waitlist table, written via server route only)

## Development

```bash
npm install
cp .env.example .env.local   # then fill in SUPABASE_SERVICE_ROLE_KEY
npm run dev
```

The service role key is found in Supabase Dashboard → Project Settings → API
keys. It is server-only: never expose it to the browser or commit it.

## Waitlist

`POST /api/waitlist` validates the email (zod), checks a honeypot field,
rate-limits by IP, and inserts into `public.waitlist` using the service role
key. The table has RLS enabled with no policies, so the public anon key can
neither write nor read it. Duplicate signups return success so the endpoint
can't be used to probe who is on the list.

The table schema lives in the app repo's migration history:
`../svar_ai/supabase/migrations/20260727000000_add_waitlist.sql`.

## Deployment

Deploy to Vercel. Set `NEXT_PUBLIC_SUPABASE_URL` and
`SUPABASE_SERVICE_ROLE_KEY` in the project's environment variables.

## Structure

- `app/` — routes: `/` (landing), `/privacy`, `/terms`, `/api/waitlist`
- `components/sections/` — one component per landing page section
- `components/visuals/` — coded product visuals (waveform, phone frame, output morph)
- `lib/content.ts` — all marketing copy and sample-output data
- `lib/legal.ts` — privacy/terms text, ported from the app
