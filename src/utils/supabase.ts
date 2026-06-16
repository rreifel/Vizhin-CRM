import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = 'https://imbfhjfktkvmwdeejtuv.supabase.co'
  const supabaseKey = 'sb_publishable_iKqyd-sKlm0oqk-HkRUjXw_vwpSxPEG'

  return createBrowserClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    }
  })
}
