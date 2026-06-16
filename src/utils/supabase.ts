import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = 'https://imbfhjfktkvmwdeejtuv.supabase.co'
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

  return createBrowserClient(supabaseUrl, supabaseKey)
}
