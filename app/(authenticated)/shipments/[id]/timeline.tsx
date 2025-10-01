"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSessionContext } from "@supabase/auth-helpers-react";

interface TimelineEvent {
  id: string;
  message: string;
  created_at: string;
}

async function fetchTimeline(supabaseUrl: string, accessToken: string, shipmentId: string) {
  const response = await fetch(`${supabaseUrl}/rest/v1/shipment_events?shipment_id=eq.${shipmentId}&select=*`, {
    headers: {
      apikey: accessToken,
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to load shipment timeline");
  }

  const payload = (await response.json()) as TimelineEvent[];
  return payload.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

interface ShipmentTimelineProps {
  shipmentId: string;
}

export function ShipmentTimeline({ shipmentId }: ShipmentTimelineProps) {
  const { supabaseClient } = useSessionContext();
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const subscription = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setAccessToken(session?.access_token ?? null);
    });

    void supabaseClient.auth.getSession().then(({ data }) => {
      setAccessToken(data.session?.access_token ?? null);
    });

    return () => {
      subscription.data.subscription.unsubscribe();
    };
  }, [supabaseClient]);

  const query = useQuery({
    queryKey: ["shipments", shipmentId, "timeline"],
    queryFn: async () => {
      if (!accessToken) {
        throw new Error("Missing access token");
      }
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable.");
      }
      return fetchTimeline(supabaseUrl, accessToken, shipmentId);
    },
    enabled: Boolean(accessToken),
  });

  if (query.status === "pending") {
    return <p style={{ color: "#64748b" }}>Loading timeline…</p>;
  }

  if (query.status === "error") {
    return <p style={{ color: "#b91c1c" }}>{query.error.message}</p>;
  }

  return (
    <section
      style={{
        display: "grid",
        gap: "1rem",
        background: "white",
        padding: "1.5rem",
        borderRadius: "1rem",
        boxShadow: "0 18px 45px -36px rgba(15, 23, 42, 0.45)",
      }}
    >
      <h2 style={{ margin: 0 }}>Activity</h2>
      <ul style={{ display: "grid", gap: "0.75rem", margin: 0, padding: 0, listStyle: "none" }}>
        {query.data?.map((event) => (
          <li
            key={event.id}
            style={{
              display: "grid",
              gap: "0.25rem",
              borderLeft: "3px solid #2563eb",
              paddingLeft: "0.75rem",
            }}
          >
            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
              {new Date(event.created_at).toLocaleString()}
            </span>
            <p style={{ margin: 0 }}>{event.message}</p>
          </li>
        ))}
        {query.data?.length === 0 ? (
          <li style={{ color: "#64748b" }}>No events recorded yet.</li>
        ) : null}
      </ul>
    </section>
  );
}
