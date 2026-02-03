import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseServiceKey =
  Deno.env.get('SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') ?? ''
const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

const computeSignature = async (payload: string, secret: string) => {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

const verifySignature = async (payload: string, header: string, secret: string) => {
  const parts = header.split(',')
  const timestamp = parts.find((p) => p.startsWith('t='))?.split('=')[1]
  const signature = parts.find((p) => p.startsWith('v1='))?.split('=')[1]
  if (!timestamp || !signature) return false

  const signedPayload = `${timestamp}.${payload}`
  const expected = await computeSignature(signedPayload, secret)
  return expected === signature
}

const fetchSubscription = async (subscriptionId: string) => {
  const res = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
    headers: { Authorization: `Bearer ${stripeSecretKey}` },
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data?.error?.message ?? 'Erro ao buscar subscription.')
  }
  return data
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return json(405, { error: 'Método não permitido.' })
  }

  if (!stripeWebhookSecret || !stripeSecretKey) {
    return json(500, { error: 'Stripe não configurado.' })
  }

  const signatureHeader = req.headers.get('stripe-signature') ?? ''
  const body = await req.text()

  const valid = await verifySignature(body, signatureHeader, stripeWebhookSecret)
  if (!valid) {
    return json(400, { error: 'Assinatura inválida.' })
  }

  const event = JSON.parse(body)
  const type = event.type
  const data = event.data?.object

  if (type === 'checkout.session.completed') {
    const accountId = data?.client_reference_id
    const subscriptionId = data?.subscription
    const customerId = data?.customer
    if (!accountId || !subscriptionId) {
      return json(200, { received: true })
    }

    const subscription = await fetchSubscription(subscriptionId)
    await supabase.from('subscriptions').upsert({
      account_id: accountId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      status: subscription.status,
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    })
  }

  if (type === 'customer.subscription.updated' || type === 'customer.subscription.deleted') {
    const subscriptionId = data?.id
    const customerId = data?.customer
    if (subscriptionId) {
      await supabase.from('subscriptions')
        .update({
          status: data?.status ?? null,
          current_period_end: data?.current_period_end
            ? new Date(data.current_period_end * 1000).toISOString()
            : null,
        })
        .eq('stripe_subscription_id', subscriptionId)
        .eq('stripe_customer_id', customerId)
    }
  }

  return json(200, { received: true })
})
