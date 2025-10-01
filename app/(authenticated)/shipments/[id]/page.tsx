import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

import { ShipmentTimeline } from "./timeline";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.");
}

interface ShipmentDetails {
  id: string;
  reference: string;
  status: string;
  origin: string;
  destination: string;
  eta: string | null;
}

interface ShipmentPageProps {
  params: { id: string };
}

async function loadShipment(id: string): Promise<ShipmentDetails | null> {
  const supabase = createServerComponentClient({ cookies }, {
    supabaseUrl,
    supabaseKey: supabaseAnonKey,
  });

  const { data } = await supabase
    .from("shipments")
    .select("id, reference, status, origin, destination, eta")
    .eq("id", id)
    .single();

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    reference: data.reference ?? "—",
    status: data.status ?? "Pending",
    origin: data.origin ?? "Unknown",
    destination: data.destination ?? "Unknown",
    eta: data.eta ?? null,
  };
}

export async function generateMetadata({ params }: ShipmentPageProps): Promise<Metadata> {
  const shipment = await loadShipment(params.id);

  return {
    title: shipment
      ? `${shipment.reference} | Shipments | Supply Chain Toolkit`
      : "Shipment | Supply Chain Toolkit",
  };
}

export default async function ShipmentDetailsPage({ params }: ShipmentPageProps) {
  const shipment = await loadShipment(params.id);

  if (!shipment) {
    notFound();
  }

  return (
    <section style={{ display: "grid", gap: "1.5rem" }}>
      <header>
        <h1 style={{ marginBottom: "0.5rem" }}>Shipment {shipment.reference}</h1>
        <p style={{ color: "#475569" }}>
          {shipment.origin} → {shipment.destination}
        </p>
      </header>

      <article
        style={{
          display: "grid",
          gap: "0.75rem",
          background: "white",
          padding: "1.5rem",
          borderRadius: "1rem",
          boxShadow: "0 18px 45px -36px rgba(15, 23, 42, 0.45)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "0.875rem", color: "#64748b", fontWeight: 600 }}>Status</span>
          <span style={{ fontWeight: 700 }}>{shipment.status}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "0.875rem", color: "#64748b", fontWeight: 600 }}>Estimated arrival</span>
          <span style={{ fontWeight: 700 }}>{shipment.eta ?? "Pending"}</span>
        </div>
      </article>

      <ShipmentTimeline shipmentId={shipment.id} />
    </section>
  );
}
