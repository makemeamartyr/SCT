import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

import { AttachmentManager } from "./viewer";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.");
}

interface AttachmentsPageProps {
  params: { id: string };
}

async function ensureShipmentExists(id: string): Promise<string | null> {
  const supabase = createServerComponentClient({ cookies }, {
    supabaseUrl,
    supabaseKey: supabaseAnonKey,
  });
  const { data } = await supabase.from("shipments").select("reference").eq("id", id).single();
  return data?.reference ?? null;
}

export async function generateMetadata({ params }: AttachmentsPageProps): Promise<Metadata> {
  const reference = await ensureShipmentExists(params.id);
  return {
    title: reference
      ? `${reference} attachments | Supply Chain Toolkit`
      : "Shipment attachments | Supply Chain Toolkit",
  };
}

export default async function ShipmentAttachmentsPage({ params }: AttachmentsPageProps) {
  const reference = await ensureShipmentExists(params.id);

  if (!reference) {
    notFound();
  }

  return (
    <section style={{ display: "grid", gap: "1.5rem" }}>
      <header>
        <h1 style={{ marginBottom: "0.5rem" }}>Attachments for {reference}</h1>
        <p style={{ color: "#475569" }}>Upload and manage documents tied to this shipment.</p>
      </header>
      <AttachmentManager shipmentId={params.id} />
    </section>
  );
}
