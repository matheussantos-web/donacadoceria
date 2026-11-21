import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Indica se as variáveis de ambiente do Supabase estão definidas.
 * Útil para manter fallback seguro quando não configurado.
 */
export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseAnonKey)
}
