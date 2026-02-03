import { supabase } from './supabase'

export type Subscription = {
  id: string
  status: string | null
  current_period_end: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
}

export const getSubscription = async (accountId: string) => {
  if (!supabase) return null
  const { data } = await supabase
    .from('subscriptions')
    .select('id,status,current_period_end,stripe_customer_id,stripe_subscription_id')
    .eq('account_id', accountId)
    .maybeSingle()

  return (data ?? null) as Subscription | null
}
