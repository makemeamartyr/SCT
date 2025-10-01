"use client";

import { useState, useTransition } from "react";
import { useSessionContext } from "@supabase/auth-helpers-react";

interface NotificationPreferencesFormProps {
  initialPreferences: {
    email: boolean;
    sms: boolean;
    slackWebhook: string;
  };
}

export function NotificationPreferencesForm({ initialPreferences }: NotificationPreferencesFormProps) {
  const { supabaseClient } = useSessionContext();
  const [email, setEmail] = useState(initialPreferences.email);
  const [sms, setSms] = useState(initialPreferences.sms);
  const [slackWebhook, setSlackWebhook] = useState(initialPreferences.slackWebhook);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(async () => {
      setStatus("idle");
      const { error } = await supabaseClient
        .from("notification_preferences")
        .upsert({ id: 1, email, sms, slack_webhook: slackWebhook });

      if (error) {
        setStatus("error");
        setMessage(error.message);
        return;
      }

      setStatus("success");
      setMessage("Notification preferences updated.");
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "grid",
        gap: "1.25rem",
        background: "white",
        padding: "1.5rem",
        borderRadius: "1rem",
        boxShadow: "0 18px 45px -36px rgba(15, 23, 42, 0.45)",
      }}
    >
      <h2 style={{ margin: 0 }}>Notification channels</h2>
      <label style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <input type="checkbox" checked={email} onChange={(event) => setEmail(event.target.checked)} />
        <span>Email alerts</span>
      </label>
      <label style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <input type="checkbox" checked={sms} onChange={(event) => setSms(event.target.checked)} />
        <span>SMS alerts</span>
      </label>
      <label style={{ display: "grid", gap: "0.5rem" }}>
        <span style={{ fontWeight: 600, color: "#475569" }}>Slack webhook URL</span>
        <input
          type="url"
          placeholder="https://hooks.slack.com/..."
          value={slackWebhook}
          onChange={(event) => setSlackWebhook(event.target.value)}
          style={{
            padding: "0.75rem 1rem",
            borderRadius: "0.75rem",
            border: "1px solid #cbd5f5",
            fontSize: "1rem",
          }}
        />
      </label>
      <button
        type="submit"
        disabled={isPending}
        style={{
          padding: "0.75rem 1rem",
          borderRadius: "0.85rem",
          background: "linear-gradient(135deg, #2563eb, #7c3aed)",
          color: "white",
          fontWeight: 600,
          fontSize: "1rem",
          border: 0,
          cursor: isPending ? "wait" : "pointer",
        }}
      >
        {isPending ? "Saving…" : "Save preferences"}
      </button>
      {status !== "idle" ? (
        <p style={{ color: status === "success" ? "#15803d" : "#b91c1c", margin: 0 }}>{message}</p>
      ) : null}
    </form>
  );
}
