import type { Metadata } from "next";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

export const metadata: Metadata = {
  title: "Settings | Supply Chain Toolkit",
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.");
}

async function loadGeneralSettings() {
  const supabase = createServerComponentClient({ cookies }, {
    supabaseUrl,
    supabaseKey: supabaseAnonKey,
  });

  const { data } = await supabase.from("settings").select("timezone, locale").single();
  return {
    timezone: data?.timezone ?? "UTC",
    locale: data?.locale ?? "en-US",
  };
}

export default async function GeneralSettingsPage() {
  const settings = await loadGeneralSettings();

  return (
    <article
      style={{
        display: "grid",
        gap: "1rem",
        background: "white",
        padding: "1.5rem",
        borderRadius: "1rem",
        boxShadow: "0 18px 45px -36px rgba(15, 23, 42, 0.45)",
      }}
    >
      <h2 style={{ margin: 0 }}>General preferences</h2>
      <p style={{ color: "#475569" }}>Default organization-level settings.</p>
      <dl style={{ display: "grid", gap: "0.75rem", margin: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <dt style={{ fontWeight: 600, color: "#64748b" }}>Timezone</dt>
          <dd style={{ margin: 0, fontWeight: 700 }}>{settings.timezone}</dd>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <dt style={{ fontWeight: 600, color: "#64748b" }}>Locale</dt>
          <dd style={{ margin: 0, fontWeight: 700 }}>{settings.locale}</dd>
        </div>
      </dl>
    </article>
  );
}
