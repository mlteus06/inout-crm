import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

export const supabaseEnvMissing = !supabaseUrl || !supabaseAnonKey

/**
 * Supabase client
 * - Nunca é null (evita TS18047)
 * - Se env faltar, usa strings vazias e a UI deve ser bloqueada via supabaseEnvMissing
 */
export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey,
)
