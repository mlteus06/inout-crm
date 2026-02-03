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
  new_lead_notifications?: boolean
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
  if (!supabase) return { account: null, error: 'Supabase indisponível.' }
  const { data: membership, error } = await supabase
    .from('account_members')
    .select('account_id')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    return { account: null, error: error.message }
  }

  if (membership?.account_id) {
    const { data: accountData, error: accountError } = await supabase
      .from('accounts')
      .select('id,name')
      .eq('id', membership.account_id)
      .maybeSingle()

    if (accountError) {
      return { account: null, error: accountError.message }
    }

    if (accountData) {
      return { account: accountData as Account, error: null }
    }
  }

  return { account: null, error: null }
}

export const createAccount = async (userId: string, name: string) => {
  if (!supabase) return { account: null, error: 'Supabase indisponível.' }
  const id = crypto.randomUUID()
  const { error } = await supabase
    .from('accounts')
    .insert({ id, name, owner_id: userId })

  if (error) return { account: null, error: error.message }

  const { error: memberError } = await supabase.from('account_members').insert({
    account_id: id,
    user_id: userId,
    role: 'owner',
  })

  if (memberError) {
    return { account: null, error: memberError.message }
  }

  return { account: { id, name } as Account, error: null }
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

export const updateLead = async (id: string, payload: Partial<Lead>) => {
  if (!supabase) return null
  const { data } = await supabase
    .from('leads')
    .update(payload)
    .eq('id', id)
    .select('id,account_id,name,email,phone,status,source,created_at,notes')
    .single()

  return (data ?? null) as Lead | null
}

export const updateAccount = async (accountId: string, payload: Partial<Account>) => {
  if (!supabase) return null
  const { data } = await supabase
    .from('accounts')
    .update(payload)
    .eq('id', accountId)
    .select('id,name,new_lead_notifications')
    .single()

  return (data ?? null) as Account | null
}

export const getAccountSettings = async (accountId: string) => {
  if (!supabase) return null
  const { data } = await supabase
    .from('accounts')
    .select('id,name,new_lead_notifications')
    .eq('id', accountId)
    .maybeSingle()

  return (data ?? null) as Account | null
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
