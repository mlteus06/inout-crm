import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseServiceKey =
  Deno.env.get('SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type,authorization,apikey',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
}

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers })

const cors = () => new Response(null, { status: 204, headers })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return cors()
  }
  if (req.method !== 'POST') {
    return json(405, { error: 'Método não permitido.' })
  }

  const payload = await req.json().catch(() => null)
  if (!payload?.account_id) {
    return json(400, { error: 'account_id é obrigatório.' })
  }

  const { data: integration } = await supabase
    .from('integrations_facebook')
    .select('access_token')
    .eq('account_id', payload.account_id)
    .maybeSingle()

  if (!integration?.access_token) {
    return json(404, { error: 'Integração não encontrada.' })
  }

  const url = new URL('https://graph.facebook.com/v19.0/me/accounts')
  url.searchParams.set('access_token', integration.access_token)
  url.searchParams.set('fields', 'id,name')

  const response = await fetch(url)
  const data = await response.json()

  if (!response.ok) {
    return json(400, { error: 'Falha ao listar páginas.', details: data })
  }

  return json(200, { data: data?.data ?? [] })
})
