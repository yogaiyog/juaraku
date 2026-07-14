import { createAdminClient } from "@supabase/server/core";
import type { SupabaseClient } from "@supabase/supabase-js";

let supabaseInstance: SupabaseClient | null = null;
let supabaseAvailable: boolean | null = null;

export function createServerSupabase(): SupabaseClient | null {
  if (supabaseAvailable === false) return null;

  if (!supabaseInstance) {
    const url = process.env.SUPABASE_URL;
    const secretKey = process.env.SUPABASE_SECRET_KEY;

    if (!url || !secretKey) {
      supabaseAvailable = false;
      return null;
    }

    supabaseInstance = createAdminClient();
    supabaseAvailable = true;
  }

  return supabaseInstance;
}
