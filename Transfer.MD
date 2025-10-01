# Shipping Manager Transfer Blueprint

## Product vision and scope
Shipping Manager delivers a role-aware dashboard for importers and distributors to monitor inbound container shipments, capturing compliance checkpoints, financial readiness, and logistics actions in one place.

Rebuild the experience with Next.js while preserving the breadth of functionality outlined here.

## Experience pillars
1. **Unified shipment intelligence** – Offer both tile and table layouts with consistent data, adaptive placeholders, quick toggles, and per-shipment tracking links so operational staff can assess dozens of containers at a glance.

2. **Actionable lifecycle controls** – Support create/edit workflows, duplication, archiving, and on-demand ETA refreshes to keep shipments current across finance, compliance, and ERP handoffs.

3. **Document & compliance oversight** – Maintain an attachment panel with role-restricted uploads, download links, and aggregate size metadata so teams can collaborate safely on paperwork.

4. **Configurable operations hub** – Provide an admin-only settings area that manages supplier branding, status colour mappings, hidden fields, tile ordering, tracking defaults, and user accounts.

5. **Live operations awareness** – Keep live ETA data refreshed automatically and expose controls to trigger manual updates, ensuring teams respond quickly to delays.

6. **Role-appropriate security** – Enforce admin, staff, and customs personas across UI and API layers, hiding sensitive values and restricting mutations where required.

## Personas and permissions
- **Administrators**: Full CRUD on shipments, attachments, settings, supplier branding, and user accounts; can toggle dashboards, refresh ETAs, and manage system configuration.

- **Staff**: Manage shipments and attachments but cannot alter global settings or user accounts.

- **Customs agents**: Read-only access with sensitive fields hidden (invoice totals, payment markers, attachments) to protect financial data.

## Domain model
Design persistence for the following entities and relationships:
- **Shipment**: Supplier, origin country, container counts/types/temperatures, order and invoice metadata, regulatory statuses, container numbers, bill of lading, shipping line, ETA/live ETA, payment flags, FX rate, tracking override, archive status, timestamps, and linked attachments.

- **Attachment**: Stored filename, original name, MIME type, size, timestamps, and parent shipment reference with cascade delete behavior.

- **Setting**: Supplier colours/logos, status colour maps, hidden fields for customs, tile field order, tracking base URL, shipping line templates, feature toggles, timestamps.

- **Supplier logo**: Supplier identifier plus stored metadata for logo assets.

- **User**: Username, hashed credential, role, timestamps; ensure the default admin is provisioned on bootstrap (`admin` / `admin123`).

## Functional requirements

### Authentication & session flow
- Present a branded login card and authenticate credentials, issuing signed tokens that include role claims and seven-day expirations.

- Provide a `/auth/me` style endpoint/handler so the client can restore sessions on reload.

### Dashboard & filtering experience
- Offer tile and table layouts with toggle controls; include search, supplier filter, invoice status filter, customs/biosecurity/IFIP filters, and archived-only toggle, preserving focus state for usability.

- Render quick status buttons (invoice paid, customs agent paid, cartage paid, ERP entered) with role-aware disabling and accessible labelling.

- Display shipment metadata with placeholder behaviour, supplier logos/colours, status badges, and tracking links derived from defaults, shipping-line templates, or overrides.

- Surface attachment summaries, upload buttons (non-customs only), collapsible file lists, and live ETA refresh timestamps.

### Shipment lifecycle management
- Provide modal forms for creating and editing shipments with all fields and validations, including multi-line container inputs, date/time pickers, status selectors, payment toggles, and tracking overrides.

- Support duplication, archive/unarchive, and manual live ETA refresh actions via API calls, with optimistic UI feedback (toast notifications).

- Ensure list endpoints respect role filtering so customs accounts never receive hidden fields from the server.

### Document handling
- Expose API endpoints to upload base64 payloads, persist them to a managed uploads directory, and register metadata against the shipment; enforce file-size limits and respond with stored records.

- Allow deletion with cleanup of stored files and ensure direct `/uploads/...` requests stream the asset if authorized.

### Settings & configuration
- Implement supplier branding controls (colour pickers, logo uploads/replacements/removals) and persist them with sanitisation and file housekeeping.

- Provide status colour editing, customs hidden-field selection, tile field reordering, shipping-line template management (placeholder substitution), and feature toggles (live ETA, placeholder text).

- Maintain tracking base URL editing with validation for absolute HTTP(S) links.

### User administration
- Admins can create, update, and delete users, reset passwords, and adjust roles through the settings view; enforce role restrictions server-side.

### Live ETA intelligence
- Schedule recurring live ETA recalculations, adjust timestamps, and expose manual refresh endpoints to set overrides and view updated-at markers.

### Health & reliability
- Publish a health endpoint reporting connectivity status for the persistence layer to aid deployments.

- Guard JSON body sizes (5 MB limit) and normalise inputs before persistence.

### Offline and mock data experience
- Honour a `?mock=1` query parameter and automatic fallback to mock data when the API is unreachable, keeping the UI functional for demos or outages.

## Non-functional expectations
- Preserve responsive layout behaviour and accessible controls (e.g., `aria-pressed`, keyboard focus retention) observed in the current UI, ensuring clarity across devices.

- Maintain secure storage of credentials (hashed on the server) and timing-safe token verification.

- Keep uploads writable directory configurable and validated, with descriptive errors when misconfigured.

## Implementation notes
- Use Next.js for the full application, leveraging its routing, rendering, and server-side capabilities while keeping the data layer abstract so future infrastructure choices stay flexible.
- Encapsulate persistence through repository-style modules that mirror the domain model above, enabling substitution of storage technology without altering feature code.
