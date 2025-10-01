"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { createBrowserClient } from "@supabase/auth-helpers-nextjs";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface ProvidersProps {
  children: ReactNode;
  initialSession: Session;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.");
}

export function Providers({ children, initialSession }: ProvidersProps) {
  const [supabase] = useState<SupabaseClient>(() =>
    createBrowserClient(supabaseUrl, supabaseAnonKey),
  );
  const [queryClient] = useState(() => new QueryClient());

  return (
    <SessionContextProvider supabaseClient={supabase} initialSession={initialSession}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </SessionContextProvider>
  );
}
