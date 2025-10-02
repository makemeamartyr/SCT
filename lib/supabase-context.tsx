import type { ReactNode } from "react";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import type { Session } from "@supabase/supabase-js";

import type { Database } from "./database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.",
  );
}

export const createBrowserSupabaseClient = () =>
  createPagesBrowserClient<Database>({
    supabaseUrl,
    supabaseKey: supabaseAnonKey,
  });

export type BrowserSupabaseClient = ReturnType<
  typeof createBrowserSupabaseClient
>;

interface SupabaseContextValue {
  supabaseClient: BrowserSupabaseClient;
  session: Session | null;
}

const SupabaseContext = createContext<SupabaseContextValue | undefined>(
  undefined,
);

interface SupabaseProviderProps {
  children: ReactNode;
  initialSession: Session | null;
  supabaseClient?: BrowserSupabaseClient;
}

export function SupabaseProvider({
  children,
  initialSession,
  supabaseClient,
}: SupabaseProviderProps) {
  const [client] = useState<BrowserSupabaseClient>(() =>
    supabaseClient ?? createBrowserSupabaseClient(),
  );
  const [session, setSession] = useState<Session | null>(initialSession);

  useEffect(() => {
    setSession(initialSession);
  }, [initialSession]);

  useEffect(() => {
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [client]);

  const value = useMemo(
    () => ({
      session,
      supabaseClient: client,
    }),
    [client, session],
  );

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabaseContext() {
  const context = useContext(SupabaseContext);

  if (!context) {
    throw new Error("useSupabaseContext must be used within a SupabaseProvider");
  }

  return context;
}
