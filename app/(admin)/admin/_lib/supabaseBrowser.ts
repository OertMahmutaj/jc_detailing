"use client";

import {
  createClient,
  type SupabaseClient,
} from "@supabase/supabase-js";

let browserSupabaseClient: SupabaseClient | null = null;

export function getBrowserSupabaseClient() {
  if (browserSupabaseClient) {
    return browserSupabaseClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error("Supabase-Konfiguration fehlt.");
  }

  browserSupabaseClient = createClient(
    supabaseUrl,
    supabasePublishableKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  return browserSupabaseClient;
}