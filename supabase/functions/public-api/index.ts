import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseServiceKey =
  Deno.env.get('SERVICE_ROLE_KEY') ??
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ??
  ''

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PATCH,OPTIONS',
    },
  })

const cors = () =>
  new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'content-type,x-api-key',
      'Access-Control-Allow-Methods': 'GET,POST,PATCH,OPTIONS',
    },
  })

const getAccountByKey = async (apiKey: string) => {
  const { data } = await supabase
    .from('api_keys')
    .select('account_id')
    .eq('key', apiKey)
    .maybeSingle()

  if (data?.account_id) {
    await supabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('key', apiKey)
  }

  return data?.account_id ?? null
}

Deno.serve(
  async (req) => {
    if (req.method === 'OPTIONS') {
      return cors()
    }

    const url = new URL(req.url)
    const pathParts = url.pathname.split('/').filter(Boolean)
    const baseIndex = pathParts.indexOf('public-api')
    const resourceParts = baseIndex === -1 ? [] : pathParts.slice(baseIndex + 1)

    const allowedStatuses = new Set([
      'nova',
      'em_contato',
      'qualificada',
      'convertido',
      'desqualificado',
      'perdida',
    ])

    const apiKey = req.headers.get('x-api-key')
    if (!apiKey) {
      return json(401, { error: 'API key ausente.' })
    }

    const accountId = await getAccountByKey(apiKey)
    if (!accountId) {
      return json(401, { error: 'API key inválida.' })
    }

    /* =======================
       GET /public-api/leads
    ======================= */
    if (req.method === 'GET' && resourceParts[0] === 'leads') {
      const status = url.searchParams.get('status')
      const source = url.searchParams.get('source')
      const limit = Number(url.searchParams.get('limit') ?? '50')

      let query = supabase
        .from('leads')
        .select('id,name,email,phone,notes,status,source,created_at')
        .eq('account_id', accountId)
        .order('created_at', { ascending: false })
        .limit(Number.isNaN(limit) ? 50 : limit)

      if (status) query = query.eq('status', status)
      if (source) query = query.eq('source', source)

      const { data } = await query
      return json(200, { data: data ?? [] })
    }

    /* =======================
       POST /public-api/leads
    ======================= */
    if (req.method === 'POST' && resourceParts.length === 1 && resourceParts[0] === 'leads') {
      const payload = await req.json().catch(() => null)

      if (!payload?.name) {
        return json(400, { error: 'name é obrigatório.' })
      }

      const { data, error } = await supabase
        .from('leads')
        .insert({
          account_id: accountId,
          name: payload.name,
          email: payload.email ?? null,
          phone: payload.phone ?? null,
          notes: payload.notes ?? null,
          status: payload.status ?? 'nova',
          source: payload.source ?? 'API Pública',
        })
        .select('id,name,email,phone,notes,status,source,created_at')
        .single()

      if (error) {
        return json(400, { error: error.message })
      }

      return json(201, { data })
    }

    /* =================================
   POST /public-api/leads/:id/status
================================= */
if (
  req.method === 'POST' &&
  resourceParts.length === 3 &&
  resourceParts[0] === 'leads' &&
  resourceParts[2] === 'status'
) {
  const leadId = resourceParts[1]
  const payload = await req.json().catch(() => null)

  if (!payload?.status || !allowedStatuses.has(payload.status)) {
    return json(400, { error: 'status inválido.' })
  }

  const { data, error } = await supabase
    .from('leads')
    .update({ status: payload.status })
    .eq('id', leadId)
    .eq('account_id', accountId)
    .select('id,name,email,phone,notes,status,source,created_at')
    .single()

  if (error) {
    return json(400, { error: error.message })
  }

  return json(200, { data })
}

      const { data, error } = await supabase
        .from('leads')
        .update({ status: payload.status })
        .eq('id', leadId)
        .eq('account_id', accountId)
        .select('id,name,email,phone,notes,status,source,created_at')
        .single()

      if (error) {
        return json(400, { error: error.message })
      }

      return json(200, { data })
    }

    return json(405, { error: 'Método não permitido.' })
  },
  {
    verify_jwt: false,
  }
)
