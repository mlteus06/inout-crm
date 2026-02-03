import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseServiceKey =
  Deno.env.get('SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const facebookAppId = Deno.env.get('FACEBOOK_APP_ID') ?? ''
const facebookAppSecret = Deno.env.get('FACEBOOK_APP_SECRET') ?? ''
const facebookRedirectUri = Deno.env.get('FACEBOOK_REDIRECT_URI') ?? ''

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
  if (!payload?.code || !payload?.account_id) {
    return json(400, { error: 'code e account_id são obrigatórios.' })
  }

  if (!facebookAppId || !facebookAppSecret || !facebookRedirectUri) {
    return json(500, { error: 'Configuração do Facebook ausente.' })
  }

  const tokenUrl = new URL('https://graph.facebook.com/v19.0/oauth/access_token')
  tokenUrl.searchParams.set('client_id', facebookAppId)
  tokenUrl.searchParams.set('client_secret', facebookAppSecret)
  tokenUrl.searchParams.set('redirect_uri', facebookRedirectUri)
  tokenUrl.searchParams.set('code', payload.code)

  const tokenRes = await fetch(tokenUrl)
  const tokenJson = await tokenRes.json()

  if (!tokenRes.ok) {
    return json(400, { error: 'Falha ao trocar o code.', details: tokenJson })
  }

  const expiresAt = tokenJson.expires_in
    ? new Date(Date.now() + tokenJson.expires_in * 1000).toISOString()
    : null

  const integration = {
    account_id: payload.account_id,
    access_token: tokenJson.access_token,
    token_type: tokenJson.token_type ?? 'bearer',
    expires_at: expiresAt,
    page_id: payload.page_id ?? null,
    page_name: payload.page_name ?? null,
    ad_account_id: payload.ad_account_id ?? null,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('integrations_facebook')
    .upsert(integration, { onConflict: 'account_id' })

  if (error) {
    return json(500, { error: 'Não foi possível salvar integração.', details: error })
  }

  return json(200, {
    message: 'Integração salva com sucesso.',
    expires_at: expiresAt,
  })
})
