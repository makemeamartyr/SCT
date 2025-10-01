import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

import { NotificationPreferencesForm } from "./preferences-form";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.");
}

async function loadNotificationPreferences() {
  const supabase = createServerComponentClient({ cookies }, {
    supabaseUrl,
    supabaseKey: supabaseAnonKey,
  });

  const { data } = await supabase
    .from("notification_preferences")
    .select("email, sms, slack_webhook")
    .single();

  return {
    email: data?.email ?? true,
    sms: data?.sms ?? false,
    slackWebhook: data?.slack_webhook ?? "",
  };
}

export default async function NotificationSettingsPage() {
  const preferences = await loadNotificationPreferences();

  return (
    <NotificationPreferencesForm initialPreferences={preferences} />
  );
}
