"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import type { Session } from "@supabase/supabase-js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import {
  SupabaseProvider,
  type BrowserSupabaseClient,
} from "@/lib/supabase-context";

interface ProvidersProps {
  children: ReactNode;
  initialSession: Session | null;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.",
  );
}

export function Providers({ children, initialSession }: ProvidersProps) {
  const [supabase] = useState<BrowserSupabaseClient>(() =>
    createPagesBrowserClient({ supabaseUrl, supabaseKey: supabaseAnonKey }),
  );
  const [queryClient] = useState(() => new QueryClient());

  return (
    <SupabaseProvider
      supabaseClient={supabase}
      initialSession={initialSession}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </SupabaseProvider>
  );
}
