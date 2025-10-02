"use client";

import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useSupabaseContext } from "@/lib/supabase-context";

interface EtaBucket {
  eta_window: string;
  shipments: number;
  confidence: number;
}

async function fetchEtaBuckets(supabaseUrl: string, accessToken: string) {
  const response = await fetch(`${supabaseUrl}/rest/v1/eta_buckets?select=*`, {
    headers: {
      apikey: accessToken,
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unable to fetch ETA predictions");
  }

  return (await response.json()) as EtaBucket[];
}

export function EtaMonitor() {
  const { supabaseClient } = useSupabaseContext();
  const queryClient = useQueryClient();
  const supabaseUrl = useMemo(() => process.env.NEXT_PUBLIC_SUPABASE_URL, []);

  const query = useQuery({
    queryKey: ["eta", "buckets"],
    queryFn: async () => {
      const { data } = await supabaseClient.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        throw new Error("Missing access token");
      }
      if (!supabaseUrl) {
        throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable.");
      }
      return fetchEtaBuckets(supabaseUrl, token);
    },
  });

  useEffect(() => {
    const channel = supabaseClient
      .channel("eta-buckets")
      .on("postgres_changes", { event: "*", schema: "public", table: "eta_buckets" }, () => {
        queryClient.invalidateQueries({ queryKey: ["eta", "buckets"] }).catch((error) => {
          console.error("Failed to invalidate ETA query", error);
        });
      })
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [queryClient, supabaseClient]);

  if (query.status === "pending") {
    return <p style={{ color: "#64748b" }}>Loading ETA predictions…</p>;
  }

  if (query.status === "error") {
    return <p style={{ color: "#b91c1c" }}>{query.error.message}</p>;
  }

  const buckets = query.data ?? [];

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
      <h2 style={{ margin: 0 }}>Arrival distribution</h2>
      <div style={{ display: "grid", gap: "0.75rem" }}>
        {buckets.map((bucket) => (
          <div
            key={bucket.eta_window}
            style={{
              display: "grid",
              gridTemplateColumns: "160px 1fr 80px",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <span style={{ fontWeight: 600 }}>{bucket.eta_window}</span>
            <div
              style={{
                position: "relative",
                height: "0.5rem",
                background: "#e2e8f0",
                borderRadius: "999px",
                overflow: "hidden",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  width: `${Math.min(bucket.confidence, 1) * 100}%`,
                  background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                }}
              />
            </div>
            <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
              {(bucket.confidence * 100).toFixed(0)}%
            </span>
          </div>
        ))}
        {buckets.length === 0 ? <p style={{ color: "#64748b" }}>No predictions generated yet.</p> : null}
      </div>
    </section>
  );
}
