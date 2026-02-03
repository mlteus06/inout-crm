import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const facebookVerifyToken = Deno.env.get('FACEBOOK_VERIFY_TOKEN') ?? ''

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

const text = (status: number, body: string) =>
  new Response(body, { status, headers: { 'Content-Type': 'text/plain' } })

async function fetchLeadData(leadgenId: string, accessToken: string) {
  const leadUrl = new URL(`https://graph.facebook.com/v19.0/${leadgenId}`)
  leadUrl.searchParams.set('access_token', accessToken)
  leadUrl.searchParams.set('fields', 'created_time,field_data')
  const res = await fetch(leadUrl)
  const data = await res.json()
  if (!res.ok) {
    throw new Error(JSON.stringify(data))
  }
  return data
}

Deno.serve(async (req) => {
  if (req.method === 'GET') {
    const url = new URL(req.url)
    const mode = url.searchParams.get('hub.mode')
    const token = url.searchParams.get('hub.verify_token')
    const challenge = url.searchParams.get('hub.challenge')

    if (mode === 'subscribe' && token === facebookVerifyToken) {
      return text(200, challenge ?? '')
    }

    return text(403, 'Token inválido.')
  }

  if (req.method !== 'POST') {
    return json(405, { error: 'Método não permitido.' })
  }

  const body = await req.json().catch(() => null)
  if (!body?.entry?.length) {
    return json(400, { error: 'Payload inválido.' })
  }

  for (const entry of body.entry) {
    const pageId = entry.id
    const changes = entry.changes ?? []

    const { data: integration } = await supabase
      .from('integrations_facebook')
      .select('account_id, access_token')
      .eq('page_id', pageId)
      .maybeSingle()

    if (!integration?.account_id || !integration?.access_token) {
      continue
    }

    for (const change of changes) {
      if (change.field !== 'leadgen') continue

      const leadgenId = change.value?.leadgen_id
      if (!leadgenId) continue

      try {
        const leadData = await fetchLeadData(leadgenId, integration.access_token)
        const fields = leadData.field_data ?? []
        const nameField = fields.find((f: { name: string }) => f.name === 'full_name')
        const emailField = fields.find((f: { name: string }) => f.name === 'email')
        const phoneField = fields.find((f: { name: string }) => f.name === 'phone_number')

        await supabase.from('leads').insert({
          account_id: integration.account_id,
          status: 'nova',
          source: 'Facebook Lead Ads',
          name: nameField?.values?.[0] ?? 'Lead Facebook',
          email: emailField?.values?.[0] ?? null,
          phone: phoneField?.values?.[0] ?? null,
          metadata: { raw: leadData, leadgen_id: leadgenId },
        })
      } catch (_error) {
        continue
      }
    }
  }

  return json(200, { ok: true })
})
