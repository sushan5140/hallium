const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://liyhjtyadbeozwjtrqqr.supabase.co";

const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_ZFK_hBjdVwvCAbupYSZGog_oH0TEAfe";

export const HALLIM_SUPABASE_URL = supabaseUrl;
export const HALLIM_SUPABASE_PUBLISHABLE_KEY = supabasePublishableKey;
