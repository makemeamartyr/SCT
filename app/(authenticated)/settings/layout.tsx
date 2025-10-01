import Link from "next/link";
import type { ReactNode } from "react";

const settingsNav = [
  { href: "/settings", label: "General" },
  { href: "/settings/notifications", label: "Notifications" },
  { href: "/settings/integrations", label: "Integrations" },
];

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "grid", gap: "2rem" }}>
      <header>
        <h1 style={{ marginBottom: "0.5rem" }}>Settings</h1>
        <p style={{ color: "#475569" }}>
          Manage system configuration, notifications, and integrations.
        </p>
      </header>
      <div style={{ display: "grid", gap: "1.5rem" }}>
        <nav style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          {settingsNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                padding: "0.6rem 1rem",
                borderRadius: "999px",
                background: "#e2e8f0",
                fontWeight: 600,
                color: "#0f172a",
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <section>{children}</section>
      </div>
    </div>
  );
}
