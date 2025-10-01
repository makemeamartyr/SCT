import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Session } from "@supabase/supabase-js";

import { Providers } from "./providers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.");
}

type Role = "admin" | "operator" | "viewer";

type NavGroup = {
  title: string;
  href: string;
  roles?: Role[];
};

const navigation: NavGroup[] = [
  { title: "Dashboard", href: "/dashboard" },
  { title: "Shipments", href: "/shipments" },
  { title: "ETA", href: "/eta" },
  { title: "Settings", href: "/settings" },
  { title: "Users", href: "/users", roles: ["admin"] },
];

interface LayoutProps {
  children: ReactNode;
}

async function loadSession(): Promise<Session | null> {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore }, {
    supabaseUrl,
    supabaseKey: supabaseAnonKey,
  });
  const { data } = await supabase.auth.getSession();
  return data.session ?? null;
}

function resolveRole(session: Session | null): Role {
  const role = (session?.user?.app_metadata?.role ?? session?.user?.user_metadata?.role) as Role | undefined;
  return role ?? "viewer";
}

export default async function AuthenticatedLayout({ children }: LayoutProps) {
  const session = await loadSession();

  if (!session) {
    redirect("/login");
  }

  const role = resolveRole(session);
  const allowedNavigation = navigation.filter((item) => !item.roles || item.roles.includes(role));

  return (
    <Providers initialSession={session}>
      <div style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "260px 1fr" }}>
        <aside
          style={{
            padding: "2rem 1.75rem",
            background: "linear-gradient(180deg, #1e293b, #0f172a)",
            color: "white",
            display: "grid",
            gap: "1.5rem",
            alignContent: "start",
          }}
        >
          <div>
            <span style={{ fontWeight: 700, fontSize: "1.25rem" }}>Supply Chain Toolkit</span>
            <p style={{ marginTop: "0.25rem", fontSize: "0.875rem", color: "rgba(255,255,255,0.7)" }}>
              Signed in as {session.user.email}
            </p>
            <p style={{ margin: 0, fontSize: "0.75rem", color: "rgba(255,255,255,0.55)" }}>Role: {role}</p>
          </div>

          <nav style={{ display: "grid", gap: "0.75rem" }}>
            {allowedNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  padding: "0.75rem 1rem",
                  borderRadius: "0.85rem",
                  background: "rgba(255,255,255,0.08)",
                  color: "white",
                  fontWeight: 600,
                }}
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </aside>

        <main style={{ padding: "2.5rem", background: "#f8fafc" }}>{children}</main>
      </div>
    </Providers>
  );
}
