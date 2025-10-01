"use client";

import { useMemo, useState } from "react";

interface UserRecord {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  last_seen_at: string | null;
}

interface UsersTableProps {
  initialUsers: UserRecord[];
}

function normalizeRole(role: string | null) {
  if (!role) return "viewer";
  return role;
}

export function UsersTable({ initialUsers }: UsersTableProps) {
  const [search, setSearch] = useState("");

  const filteredUsers = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) {
      return initialUsers;
    }

    return initialUsers.filter((user) => {
      const name = user.full_name?.toLowerCase() ?? "";
      const email = user.email?.toLowerCase() ?? "";
      return name.includes(normalized) || email.includes(normalized);
    });
  }, [initialUsers, search]);

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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>Workspace members</h2>
        <input
          type="search"
          placeholder="Search users"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          style={{
            padding: "0.6rem 1rem",
            borderRadius: "999px",
            border: "1px solid #cbd5f5",
            minWidth: "220px",
          }}
        />
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", background: "#e2e8f0" }}>
            <th style={{ padding: "0.75rem 1rem" }}>Name</th>
            <th style={{ padding: "0.75rem 1rem" }}>Email</th>
            <th style={{ padding: "0.75rem 1rem" }}>Role</th>
            <th style={{ padding: "0.75rem 1rem" }}>Last seen</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.id} style={{ borderTop: "1px solid #e2e8f0" }}>
              <td style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>{user.full_name ?? "Unknown"}</td>
              <td style={{ padding: "0.75rem 1rem" }}>{user.email ?? "—"}</td>
              <td style={{ padding: "0.75rem 1rem" }}>{normalizeRole(user.role)}</td>
              <td style={{ padding: "0.75rem 1rem" }}>
                {user.last_seen_at ? new Date(user.last_seen_at).toLocaleString() : "—"}
              </td>
            </tr>
          ))}
          {filteredUsers.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ padding: "1.5rem", textAlign: "center", color: "#64748b" }}>
                No users match your search.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </section>
  );
}
