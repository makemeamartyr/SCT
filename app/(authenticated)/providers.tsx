"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import {
  createBrowserSupabaseClient,
  SupabaseProvider,
  type BrowserSupabaseClient,
} from "@/lib/supabase-context";

interface ProvidersProps {
  children: ReactNode;
  initialSession: Session | null;
}

export function Providers({ children, initialSession }: ProvidersProps) {
  const [supabase] = useState<BrowserSupabaseClient>(() =>
    createBrowserSupabaseClient(),
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
