import { supabase } from './supabase'

export type TeamMember = {
  user_id: string
  role: string
  email?: string | null
  name?: string | null
}

export type Invite = {
  id: string
  email: string
  role: string
  status: string
  created_at: string
}

export const listMembers = async (accountId: string) => {
  if (!supabase) return []
  const { data } = await supabase
    .from('account_members')
    .select('user_id, role, profiles ( email, name )')
    .eq('account_id', accountId)

  return (
    data?.map((row: any) => ({
      user_id: row.user_id,
      role: row.role,
      email: row.profiles?.email ?? null,
      name: row.profiles?.name ?? null,
    })) ?? []
  ) as TeamMember[]
}

export const listInvites = async (accountId: string) => {
  if (!supabase) return []
  const { data } = await supabase
    .from('invites')
    .select('id,email,role,status,created_at')
    .eq('account_id', accountId)
    .order('created_at', { ascending: false })

  return (data ?? []) as Invite[]
}

export const createInvite = async (accountId: string, email: string, role: string) => {
  if (!supabase) return null
  const { data } = await supabase
    .from('invites')
    .insert({ account_id: accountId, email, role })
    .select('id,email,role,status,created_at')
    .single()

  return (data ?? null) as Invite | null
}
