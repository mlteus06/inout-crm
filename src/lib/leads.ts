import { supabase } from './supabase'

export type LeadStatus = 'nova' | 'em_contato' | 'qualificada' | 'perdida'

export type Lead = {
  id: string
  account_id: string
  name: string
  email: string | null
  phone: string | null
  status: LeadStatus
  source: string
  created_at: string
  notes?: string | null
}

export type Account = {
  id: string
  name: string
}

export type Integration = {
  id: string
  account_id: string
  page_id: string | null
  page_name: string | null
  ad_account_id: string | null
  expires_at: string | null
}

export const getAccountForUser = async (userId: string) => {
  if (!supabase) return null
  const { data: membership } = await supabase
    .from('account_members')
    .select('account_id, accounts ( id, name )')
    .eq('user_id', userId)
    .maybeSingle()

  if (membership?.accounts) {
    return Array.isArray(membership.accounts)
      ? (membership.accounts[0] as Account)
      : (membership.accounts as Account)
  }

  return null
}

export const createAccount = async (userId: string, name: string) => {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('accounts')
    .insert({ name, owner_id: userId })
    .select('id,name')
    .single()

  if (error || !data) return null

  await supabase.from('account_members').insert({
    account_id: data.id,
    user_id: userId,
    role: 'owner',
  })

  return data as Account
}

export const listLeads = async (accountId: string) => {
  if (!supabase) return []
  const { data } = await supabase
    .from('leads')
    .select('id,account_id,name,email,phone,status,source,created_at,notes')
    .eq('account_id', accountId)
    .order('created_at', { ascending: false })

  return (data ?? []) as Lead[]
}

export const getLead = async (id: string) => {
  if (!supabase) return null
  const { data } = await supabase
    .from('leads')
    .select('id,account_id,name,email,phone,status,source,created_at,notes')
    .eq('id', id)
    .maybeSingle()

  return (data ?? null) as Lead | null
}

export const createLead = async (lead: Partial<Lead> & { account_id: string; name: string }) => {
  if (!supabase) return null
  const { data } = await supabase
    .from('leads')
    .insert(lead)
    .select('id,account_id,name,email,phone,status,source,created_at,notes')
    .single()

  return (data ?? null) as Lead | null
}

export const updateLeadStatus = async (id: string, status: LeadStatus) => {
  if (!supabase) return null
  const { data } = await supabase
    .from('leads')
    .update({ status })
    .eq('id', id)
    .select('id,account_id,name,email,phone,status,source,created_at,notes')
    .single()

  return (data ?? null) as Lead | null
}

export const getIntegration = async (accountId: string) => {
  if (!supabase) return null
  const { data } = await supabase
    .from('integrations_facebook')
    .select('id,account_id,page_id,page_name,ad_account_id,expires_at')
    .eq('account_id', accountId)
    .maybeSingle()

  return (data ?? null) as Integration | null
}

export const upsertIntegration = async (accountId: string, payload: Partial<Integration>) => {
  if (!supabase) return null
  const { data } = await supabase
    .from('integrations_facebook')
    .upsert({
      account_id: accountId,
      page_id: payload.page_id ?? null,
      page_name: payload.page_name ?? null,
      ad_account_id: payload.ad_account_id ?? null,
      updated_at: new Date().toISOString(),
    })
    .select('id,account_id,page_id,page_name,ad_account_id,expires_at')
    .single()

  return (data ?? null) as Integration | null
}
