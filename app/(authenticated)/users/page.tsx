import type { Metadata } from "next";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

import { UsersTable } from "./table";

export const metadata: Metadata = {
  title: "Users | Supply Chain Toolkit",
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.");
}

async function loadUsers() {
  const supabase = createServerComponentClient({ cookies }, {
    supabaseUrl,
    supabaseKey: supabaseAnonKey,
  });

  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, last_seen_at")
    .order("full_name", { ascending: true });

  return data ?? [];
}

export default async function UsersPage() {
  const users = await loadUsers();

  return (
    <section style={{ display: "grid", gap: "1.5rem" }}>
      <header>
        <h1 style={{ marginBottom: "0.5rem" }}>Users</h1>
        <p style={{ color: "#475569" }}>Manage workspace members and their permissions.</p>
      </header>
      <UsersTable initialUsers={users} />
    </section>
  );
}
