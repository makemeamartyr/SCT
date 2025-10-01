import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.");
}

interface Integration {
  id: string;
  provider: string;
  status: string;
  lastSync: string | null;
}

async function loadIntegrations(): Promise<Integration[]> {
  const supabase = createServerComponentClient({ cookies }, {
    supabaseUrl,
    supabaseKey: supabaseAnonKey,
  });

  const { data } = await supabase
    .from("integrations")
    .select("id, provider, status, last_sync")
    .order("provider", { ascending: true });

  return (
    data?.map((integration) => ({
      id: integration.id,
      provider: integration.provider ?? "Unknown",
      status: integration.status ?? "Disconnected",
      lastSync: integration.last_sync ?? null,
    })) ?? []
  );
}

export default async function IntegrationsSettingsPage() {
  const integrations = await loadIntegrations();

  return (
    <section style={{ display: "grid", gap: "1rem" }}>
      <h2 style={{ margin: 0 }}>External integrations</h2>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "0.75rem" }}>
        {integrations.map((integration) => (
          <li
            key={integration.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "white",
              padding: "1rem 1.25rem",
              borderRadius: "0.85rem",
              boxShadow: "0 18px 45px -36px rgba(15, 23, 42, 0.45)",
            }}
          >
            <div>
              <strong>{integration.provider}</strong>
              <p style={{ margin: 0, color: "#64748b" }}>
                Last sync: {integration.lastSync ? new Date(integration.lastSync).toLocaleString() : "Never"}
              </p>
            </div>
            <span style={{ fontWeight: 600 }}>{integration.status}</span>
          </li>
        ))}
        {integrations.length === 0 ? (
          <li style={{ color: "#64748b" }}>No integrations configured yet.</li>
        ) : null}
      </ul>
    </section>
  );
}
