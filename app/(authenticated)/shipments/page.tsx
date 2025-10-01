import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

export const metadata: Metadata = {
  title: "Shipments | Supply Chain Toolkit",
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.");
}

interface ShipmentSummary {
  id: string;
  reference: string;
  origin: string;
  destination: string;
  status: string;
}

async function loadShipments(): Promise<ShipmentSummary[]> {
  const supabase = createServerComponentClient({ cookies }, {
    supabaseUrl,
    supabaseKey: supabaseAnonKey,
  });

  const { data } = await supabase
    .from("shipments")
    .select("id, reference, origin, destination, status")
    .order("updated_at", { ascending: false })
    .limit(20);

  return (
    data?.map((shipment) => ({
      id: shipment.id,
      reference: shipment.reference ?? "—",
      origin: shipment.origin ?? "Unknown",
      destination: shipment.destination ?? "Unknown",
      status: shipment.status ?? "Pending",
    })) ?? []
  );
}

export default async function ShipmentsPage() {
  const shipments = await loadShipments();

  return (
    <section style={{ display: "grid", gap: "1.75rem" }}>
      <header>
        <h1 style={{ marginBottom: "0.5rem" }}>Shipments</h1>
        <p style={{ color: "#475569" }}>Monitor the state and movement of each shipment in flight.</p>
      </header>

      <div style={{ background: "white", borderRadius: "1rem", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#e2e8f0", textAlign: "left" }}>
              <th style={{ padding: "0.75rem 1rem" }}>Reference</th>
              <th style={{ padding: "0.75rem 1rem" }}>Route</th>
              <th style={{ padding: "0.75rem 1rem" }}>Status</th>
              <th style={{ padding: "0.75rem 1rem" }}></th>
            </tr>
          </thead>
          <tbody>
            {shipments.map((shipment) => (
              <tr key={shipment.id} style={{ borderTop: "1px solid #e2e8f0" }}>
                <td style={{ padding: "0.85rem 1rem", fontWeight: 600 }}>{shipment.reference}</td>
                <td style={{ padding: "0.85rem 1rem" }}>
                  {shipment.origin} → {shipment.destination}
                </td>
                <td style={{ padding: "0.85rem 1rem" }}>{shipment.status}</td>
                <td style={{ padding: "0.85rem 1rem", textAlign: "right" }}>
                  <Link href={`/shipments/${shipment.id}`} style={{ color: "#2563eb", fontWeight: 600 }}>
                    View details
                  </Link>
                </td>
              </tr>
            ))}
            {shipments.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>
                  No shipments found. Connect an integration to begin receiving records.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
