"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import supabaseClient from "@/lib/supabaseClient";

interface LoginState {
  status: "idle" | "loading" | "error";
  message?: string;
}

const emailRegex = /.+@.+\..+/i;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState<LoginState>({ status: "idle" });

  const redirectPath = useMemo(() => searchParams?.get("redirectTo") ?? "/dashboard", [searchParams]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!emailRegex.test(email)) {
        setState({ status: "error", message: "Please provide a valid email address." });
        return;
      }

      if (!password) {
        setState({ status: "error", message: "Enter your password to sign in." });
        return;
      }

      setState({ status: "loading" });

      const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

      if (error) {
        setState({ status: "error", message: error.message });
        return;
      }

      router.replace(redirectPath);
    },
    [email, password, redirectPath, router],
  );

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        background: "linear-gradient(135deg, rgba(37,99,235,0.15), rgba(124,58,237,0.15))",
      }}
    >
      <section
        style={{
          width: "min(420px, 100%)",
          padding: "2.5rem",
          borderRadius: "1.5rem",
          background: "white",
          boxShadow: "0 24px 60px -30px rgba(15, 23, 42, 0.35)",
          display: "grid",
          gap: "1.5rem",
        }}
      >
        <header>
          <h1 style={{ margin: 0, fontSize: "1.75rem" }}>Supply Chain Toolkit</h1>
          <p style={{ marginTop: "0.5rem", color: "#475569" }}>Sign in to continue.</p>
        </header>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1.25rem" }}>
          <label style={{ display: "grid", gap: "0.5rem" }}>
            <span style={{ fontWeight: 600, color: "#1e293b" }}>Email</span>
            <input
              value={email}
              type="email"
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              style={{
                padding: "0.75rem 1rem",
                borderRadius: "0.75rem",
                border: "1px solid #cbd5f5",
                fontSize: "1rem",
              }}
              required
            />
          </label>

          <label style={{ display: "grid", gap: "0.5rem" }}>
            <span style={{ fontWeight: 600, color: "#1e293b" }}>Password</span>
            <input
              value={password}
              type="password"
              autoComplete="current-password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              style={{
                padding: "0.75rem 1rem",
                borderRadius: "0.75rem",
                border: "1px solid #cbd5f5",
                fontSize: "1rem",
              }}
              required
            />
          </label>

          <button
            type="submit"
            disabled={state.status === "loading"}
            style={{
              padding: "0.85rem 1rem",
              borderRadius: "0.85rem",
              background: "linear-gradient(135deg, #2563eb, #7c3aed)",
              color: "white",
              fontWeight: 600,
              fontSize: "1rem",
              border: 0,
              cursor: state.status === "loading" ? "wait" : "pointer",
              transition: "filter 160ms ease",
            }}
          >
            {state.status === "loading" ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {state.status === "error" ? (
          <p style={{ color: "#b91c1c", margin: 0 }}>{state.message}</p>
        ) : null}
      </section>
    </main>
  );
}
