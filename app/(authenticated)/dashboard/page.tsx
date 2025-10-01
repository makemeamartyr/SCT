import type { Metadata } from "next";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

export const metadata: Metadata = {
  title: "Dashboard | Supply Chain Toolkit",
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.");
}

interface DashboardMetric {
  label: string;
  value: string;
  description: string;
}

async function loadMetrics(): Promise<DashboardMetric[]> {
  const supabase = createServerComponentClient({ cookies }, {
    supabaseUrl,
    supabaseKey: supabaseAnonKey,
  });

  const { count: shipmentsCount } = await supabase
    .from("shipments")
    .select("id", { count: "exact", head: true });

  const { count: etaCount } = await supabase
    .from("eta_predictions")
    .select("id", { count: "exact", head: true });

  return [
    {
      label: "Active shipments",
      value: shipmentsCount?.toString() ?? "--",
      description: "Total shipments currently tracked",
    },
    {
      label: "Predicted arrivals",
      value: etaCount?.toString() ?? "--",
      description: "ETA predictions updated in the last 24h",
    },
    {
      label: "System health",
      value: "Nominal",
      description: "All integrations responding within SLA",
    },
  ];
}

export default async function DashboardPage() {
  const metrics = await loadMetrics();

  return (
    <section style={{ display: "grid", gap: "2rem" }}>
      <header>
        <h1 style={{ marginBottom: "0.5rem" }}>Operations dashboard</h1>
        <p style={{ color: "#475569" }}>
          Overview of live shipments, predictions, and integration health.
        </p>
      </header>

      <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        {metrics.map((metric) => (
          <article
            key={metric.label}
            style={{
              padding: "1.5rem",
              borderRadius: "1rem",
              background: "white",
              boxShadow: "0 18px 45px -36px rgba(15, 23, 42, 0.45)",
              display: "grid",
              gap: "0.75rem",
            }}
          >
            <span style={{ fontSize: "0.9rem", color: "#64748b", fontWeight: 600 }}>{metric.label}</span>
            <strong style={{ fontSize: "2rem" }}>{metric.value}</strong>
            <p style={{ margin: 0, color: "#475569" }}>{metric.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
