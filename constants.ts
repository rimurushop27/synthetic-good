// Configuration for Supabase
// In a real production app, these should be environment variables (import.meta.env.VITE_...)
// but per request, we are hardcoding/configuring them here for static deployment ease.

export const SUPABASE_URL = "https://mdpyyaopokewvrumdpwd.supabase.co";
export const SUPABASE_ANON_KEY = "sb_publishable_xBoLox4NHFRMmPOqqqgqfA_G37DbQf6";

export const CATEGORIES = [
  'All',
  'Couple',
  'Boy',
  'Girl',
  'Girl Hijab'
] as const;
