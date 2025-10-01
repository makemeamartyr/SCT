# SCT

Supabase connectivity toolkit scaffolded with Next.js App Router. It provides both client and server diagnostics to help verify your environment configuration before deploying.

## Prerequisites

- Node.js 18.17+ or 20+
- npm 9+ (or compatible package manager)

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.local.example` to `.env.local` and populate the required values:

   ```bash
   cp .env.local.example .env.local
   ```

   | Variable | Required | Description |
   | --- | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL. Safe to expose to the browser. |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon/public API key. Safe to expose to the browser. |
   | `SUPABASE_SERVICE_ROLE_KEY` | ⚠️ optional | Service-role key **for server-side use only**. Never expose it to the browser. |

3. Run the local development server:

   ```bash
   npm run dev
   ```

   Then visit [http://localhost:3000](http://localhost:3000) to trigger health checks.

## Deployment

### Vercel

1. Create a new project in Vercel and import this repository.
2. Set the following environment variables in the Vercel dashboard under **Project Settings → Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - (optional) `SUPABASE_SERVICE_ROLE_KEY` — add only for server-side health checks.
3. Deploy. Vercel automatically builds using `npm run build` and serves the app with `npm start`.

### Render (Static + Server)

1. Create a new **Web Service** in Render pointing to this repository.
2. Use the build command `npm install && npm run build` and the start command `npm run start`.
3. Add the same environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, optional `SUPABASE_SERVICE_ROLE_KEY`) under **Environment**.
4. Trigger a deploy. Render will host the Next.js server; ensure you select a Node-compatible runtime (Node 18+).

> ℹ️ Only the anon/public key should ever reach the browser. Keep the service-role key restricted to server environments and secret stores.

## Scripts

- `npm run dev` — start the Next.js development server.
- `npm run build` — create a production build.
- `npm run start` — serve the production build.
- `npm run lint` — run ESLint using Next.js defaults.

## Project structure

```
app/
  api/healthcheck/route.ts   # Server-side health check using service-role key
  layout.tsx                 # Root layout with global styles
  page.tsx                   # UI with Supabase connectivity diagnostics
  globals.css                # Shared styles
lib/
  supabaseClient.ts          # Browser-safe Supabase client
```

Feel free to extend the toolkit with custom checks or integrate it into your existing operational dashboards.
