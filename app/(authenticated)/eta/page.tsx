import type { Metadata } from "next";

import { EtaMonitor } from "./realtime";

export const metadata: Metadata = {
  title: "ETA Predictions | Supply Chain Toolkit",
};

export default function EtaPage() {
  return (
    <section style={{ display: "grid", gap: "1.5rem" }}>
      <header>
        <h1 style={{ marginBottom: "0.5rem" }}>ETA predictions</h1>
        <p style={{ color: "#475569" }}>
          Monitor live model confidence scores and distribution of upcoming arrivals.
        </p>
      </header>
      <EtaMonitor />
    </section>
  );
}
