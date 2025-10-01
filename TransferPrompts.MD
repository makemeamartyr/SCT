# TransferPrompts

1. **Architecture briefing**  
   “Review the Shipping Manager Transfer Blueprint and design a Next.js architecture that supports the role-based dashboard, shipment lifecycle controls, attachment handling, configurable settings, user management, live ETA automation, and mock mode described there. Outline page structure, shared state, server-side endpoints, and data access abstractions needed to satisfy those behaviors.”

2. **Authentication & authorization**  
   “In Next.js, implement authentication endpoints, session management helpers, and a login page that issues signed tokens containing role information. Enforce admin/staff/customs permissions across server logic and UI guards, including default admin bootstrap and forbidden responses when roles lack access.”

3. **Domain models & repositories**  
   “Define the data models for shipments, attachments, settings, supplier logos, and users, mirroring the fields and relations in the blueprint. Create repository interfaces with validation and sanitisation so future persistence adapters can plug in without leaking implementation details.”

4. **Dashboard views & filters**  
   “Build the main dashboard route with tile and table layouts, reusable filter controls (search, supplier, invoice, customs, biosecurity, IFIP, archived toggle), quick status toggles, placeholder logic, supplier branding, and tracking link generation. Ensure the UI respects hidden-field settings for customs roles.”

5. **Shipment lifecycle flows**  
   “Create modal forms and API handlers for creating, editing, duplicating, archiving, unarchiving, and refreshing shipments. Support all metadata fields (including multi-line container numbers, regulatory statuses, payment flags, FX rate, tracking override) and return toasts or banners on success/failure.”

6. **Attachment management**  
   “Implement attachment upload, listing, download, and deletion. Enforce role restrictions, file-size limits, storage cleanup, and display of aggregate counts/sizes along with timestamps.”

7. **Settings console**  
   “Deliver the admin settings area covering supplier branding (colours and logos), status colour editing, customs hidden-field toggles, tile field reordering, shipping line tracking templates, feature toggles, tracking base URL, and persistence back to storage.”

8. **User administration**  
   “Expose user management tools for admins to create accounts, adjust roles, reset passwords, and delete users, with corresponding API handlers and optimistic client updates.”

9. **Live ETA automation**  
   “Implement a scheduler within Next.js’s server environment (or compatible background mechanism) that refreshes live ETA values, plus API endpoints to trigger manual recalculations and surface updated-at timestamps in the UI.”

10. **Mock mode & resilience**  
    “Provide a mock-data fallback that activates via `?mock=1` or when API calls fail, mirroring the current behaviour. Ensure the client automatically switches to mock repositories, logs the reason, and continues to render representative shipments and settings.”
