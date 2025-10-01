# Application architecture

This document captures the new application layout introduced when replacing the Supabase diagnostics
page with authenticated and public routing.

## High-level structure

```
app/
├─ (public)/            # Routes that do not require authentication
│  └─ login/            # Username/password entry point backed by Supabase auth
├─ (authenticated)/     # Layout group that enforces Supabase sessions & role gating
│  ├─ dashboard/        # Server rendered overview for operations metrics
│  ├─ shipments/        # Shipment index, detail pages, and nested attachments UI
│  ├─ settings/         # Settings layout with nested sections (general, notifications, integrations)
│  ├─ users/            # Admin-only membership management page
│  └─ eta/              # Client-heavy page for realtime model output
├─ layout.tsx           # Root document shell (metadata, global styles)
└─ page.tsx             # Redirects to the public login route
```

* The **public** group hosts the login page (`/login`) with a client-side form that performs
  password authentication against Supabase.
* The **authenticated** group contains all protected routes. Access is enforced by
  `app/(authenticated)/layout.tsx`, which resolves the Supabase session server-side and redirects to
  `/login` if none is present. Navigation items are filtered based on the user's role metadata
  (`admin`, `operator`, `viewer`).

## Shared providers

`app/(authenticated)/providers.tsx` exposes two application-wide contexts for authenticated routes:

1. **`SessionContextProvider`** from `@supabase/auth-helpers-react`, seeded with the session fetched on
   the server. This ensures that client components can access the Supabase client and user data without
   repeating boilerplate.
2. **`QueryClientProvider`** from `@tanstack/react-query`, giving authenticated pages a common query
   cache for data fetching, realtime invalidation, and optimistic updates.

Every page rendered inside the authenticated layout inherits these providers, enabling mixed
client/server patterns (server components load critical data, client components handle interactivity).

## Route breakdown

### `/dashboard`
Server component that fetches key metrics from Supabase tables (`shipments`, `eta_predictions`) to
summarize operational health.

### `/shipments`
* `/shipments` – Server rendered table of recent shipments with deep links to detail views.
* `/shipments/[id]` – Server component for the shipment overview. It renders `timeline.tsx`, a client
  component powered by React Query that fetches and displays realtime event activity.
* `/shipments/[id]/attachments` – Server route that ensures the shipment exists before rendering
  `attachments/viewer.tsx`, a client interface for uploading and managing files stored in Supabase
  Storage.

### `/settings/*`
`settings/layout.tsx` provides the section navigation, while nested routes handle distinct concerns:

* `/settings` – General organization settings.
* `/settings/notifications` – Server component that loads preferences and hydrates the
  `NotificationPreferencesForm` client component for editing.
* `/settings/integrations` – Server component listing connected integrations and status metadata.

### `/users`
Server component gated in navigation to the `admin` role. It renders `UsersTable`, a client component
with search and role normalization.

### `/eta`
Client-driven dashboard (`EtaMonitor`) that uses Supabase realtime channels and React Query to display
model confidence for upcoming arrivals.

## Assumptions & future work

* Supabase tables (`shipments`, `eta_predictions`, `shipment_events`, `shipment_attachments`,
  `settings`, `notification_preferences`, `integrations`, `profiles`, `eta_buckets`) and the storage
  bucket (`shipment-files`) exist with the expected columns.
* User roles are stored in either `app_metadata.role` or `user_metadata.role` on the Supabase session.
* Environment variables `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are available
  both server- and client-side.
* Package installation is required to satisfy new dependencies:
  `@supabase/auth-helpers-nextjs`, `@supabase/auth-helpers-react`, and `@tanstack/react-query`.

Future contributors can extend this layout by adding more nested routes within the authenticated group,
reusing the shared providers for stateful client components, and updating navigation role requirements
as new personas are introduced.
