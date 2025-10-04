import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function GET() {
  if (!supabaseUrl) {
    return NextResponse.json(
      {
        status: "error",
        message: "Missing NEXT_PUBLIC_SUPABASE_URL environment variable.",
      },
      { status: 500 },
    );
  }

  if (!serviceRoleKey) {
    return NextResponse.json(
      {
        status: "error",
        message: "Missing SUPABASE_SERVICE_ROLE_KEY environment variable on the server.",
        details: "Set SUPABASE_SERVICE_ROLE_KEY to enable privileged health checks.",
      },
      { status: 500 },
    );
  }

  const client = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  try {
    const { data, error } = await client.auth.admin.listUsers({ page: 1, perPage: 1 });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      status: "ok",
      message: "Server connected to Supabase successfully using the service role key.",
      details: `Visible users: ${data.users.length}`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Supabase service role health check failed.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
