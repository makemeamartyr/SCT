"use client";

import { useCallback, useState } from "react";
import { getSupabaseClient, SupabaseConfigurationError } from "@/lib/supabaseClient";

interface CheckResult {
  status: "idle" | "loading" | "success" | "error";
  message: string;
  details?: string;
}

const initialResult: CheckResult = {
  status: "idle",
  message: "Awaiting check",
};

export default function HomePage() {
  const [browserCheck, setBrowserCheck] = useState<CheckResult>(initialResult);
  const [serverCheck, setServerCheck] = useState<CheckResult>(initialResult);

  const runBrowserCheck = useCallback(async () => {
    setBrowserCheck({ status: "loading", message: "Validating Supabase session from the browser..." });
    try {
      const client = getSupabaseClient();
      const { data, error } = await client.auth.getSession();
      if (error) {
        throw error;
      }

      const hasSession = Boolean(data.session);
      setBrowserCheck({
        status: "success",
        message: hasSession
          ? "Browser client connected successfully and retrieved an active session."
          : "Browser client connected successfully; no active session was found (expected for anonymous checks).",
      });
    } catch (error) {
      if (error instanceof SupabaseConfigurationError) {
        setBrowserCheck({
          status: "error",
          message: "Supabase client configuration is incomplete.",
          details: error.message,
        });
        return;
      }
      setBrowserCheck({
        status: "error",
        message: "Browser client failed to connect to Supabase.",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }, []);

  const runServerCheck = useCallback(async () => {
    setServerCheck({ status: "loading", message: "Invoking server-side health check..." });
    try {
      const response = await fetch("/api/healthcheck", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const payload: { status: string; message: string; details?: string } = await response.json();

      if (payload.status === "ok") {
        setServerCheck({
          status: "success",
          message: payload.message,
          details: payload.details,
        });
      } else {
        setServerCheck({
          status: "error",
          message: payload.message,
          details: payload.details,
        });
      }
    } catch (error) {
      setServerCheck({
        status: "error",
        message: "Server-side health check failed to run.",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }, []);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      await runBrowserCheck();
      await runServerCheck();
    },
    [runBrowserCheck, runServerCheck],
  );

  const renderResult = (label: string, result: CheckResult) => {
    const color =
      result.status === "success"
        ? "#0f5132"
        : result.status === "error"
          ? "#842029"
          : "#055160";
    const background =
      result.status === "success"
        ? "#d1e7dd"
        : result.status === "error"
          ? "#f8d7da"
          : "#cff4fc";

    return (
      <section style={{
        display: "grid",
        gap: "0.5rem",
        padding: "1rem",
        borderRadius: "0.75rem",
        backgroundColor: background,
        color,
      }}>
        <strong>{label}</strong>
        <span>{result.message}</span>
        {result.details ? (
          <code style={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            backgroundColor: "rgba(0,0,0,0.05)",
            padding: "0.75rem",
            borderRadius: "0.5rem",
            fontSize: "0.85rem",
          }}>
            {result.details}
          </code>
        ) : null}
      </section>
    );
  };

  return (
    <main>
      <h1 style={{ marginTop: 0 }}>Supabase connectivity diagnostics</h1>
      <p>
        Provide your Supabase project URL and anon key in <code>.env.local</code>, then trigger a
        connectivity check to validate both browser and server configurations.
      </p>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gap: "1rem",
          marginTop: "2rem",
        }}
      >
        <button
          type="submit"
          style={{
            padding: "0.9rem 1.25rem",
            borderRadius: "0.75rem",
            background: "linear-gradient(135deg, #2563eb, #7c3aed)",
            color: "white",
            fontWeight: 600,
            fontSize: "1rem",
          }}
        >
          Run Supabase health checks
        </button>
        <small>
          The browser check uses your public anon key, while the server check requires a service-role key
          stored securely on the server.
        </small>
      </form>

      <div style={{ display: "grid", gap: "1rem", marginTop: "2rem" }}>
        {renderResult("Browser connectivity", browserCheck)}
        {renderResult("Server connectivity", serverCheck)}
      </div>
    </main>
  );
}
