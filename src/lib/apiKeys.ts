import { supabase } from './supabase'

export type ApiKey = {
  id: string
  key: string
  label: string | null
  created_at: string
  last_used_at: string | null
}

const generateKey = () => {
  const raw = crypto.randomUUID().replace(/-/g, '')
  return `inout_${raw}`
}

export const listApiKeys = async (accountId: string) => {
  if (!supabase) return []
  const { data } = await supabase
    .from('api_keys')
    .select('id,key,label,created_at,last_used_at')
    .eq('account_id', accountId)
    .order('created_at', { ascending: false })

  return (data ?? []) as ApiKey[]
}

export const createApiKey = async (accountId: string, label: string) => {
  if (!supabase) return null
  const key = generateKey()
  const { data } = await supabase
    .from('api_keys')
    .insert({ account_id: accountId, key, label })
    .select('id,key,label,created_at,last_used_at')
    .single()

  return (data ?? null) as ApiKey | null
}
