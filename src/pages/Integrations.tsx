import { useEffect, useMemo, useState } from 'react'
import useAccount from '../hooks/useAccount'
import { getIntegration, upsertIntegration } from '../lib/leads'
import { supabaseEnvMissing } from '../lib/supabase'

const Integrations = () => {
  const { account } = useAccount()
  const [message, setMessage] = useState<string | null>(null)
  const [integration, setIntegration] = useState<any>(null)
  const [pages, setPages] = useState<Array<{ id: string; name: string }>>([])
  const [loadingPages, setLoadingPages] = useState(false)
  const [pageId, setPageId] = useState('')
  const [pageName, setPageName] = useState('')
  const [adAccountId, setAdAccountId] = useState('')

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string
  const facebookAppId = import.meta.env.VITE_FACEBOOK_APP_ID as string
  const facebookRedirectUri = import.meta.env.VITE_FACEBOOK_REDIRECT_URI as string

  const oauthUrl = useMemo(() => {
    if (!facebookAppId || !facebookRedirectUri) return null
    const url = new URL('https://www.facebook.com/v19.0/dialog/oauth')
    url.searchParams.set('client_id', facebookAppId)
    url.searchParams.set('redirect_uri', facebookRedirectUri)
    url.searchParams.set('response_type', 'code')
    url.searchParams.set('scope', 'leads_retrieval,pages_read_engagement,pages_manage_ads')
    return url.toString()
  }, [facebookAppId, facebookRedirectUri])

  useEffect(() => {
    if (!account?.id) return
    getIntegration(account.id).then((data) => {
      setIntegration(data)
      setPageId(data?.page_id ?? '')
      setPageName(data?.page_name ?? '')
      setAdAccountId(data?.ad_account_id ?? '')
    })
  }, [account?.id])

  const fetchPages = async (accountId: string) => {
    try {
      setLoadingPages(true)
    const res = await fetch(`${supabaseUrl}/functions/v1/facebook-pages`, {
        method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${supabaseAnonKey}`,
        apikey: supabaseAnonKey,
      },
        body: JSON.stringify({ account_id: accountId }),
      })
      const body = await res.json().catch(() => ({}))
      if (res.ok) {
        setPages(body.data ?? [])
        if (body.data?.length === 1) {
          const page = body.data[0]
          setPageId(page.id)
          setPageName(page.name)
          const updated = await upsertIntegration(accountId, {
            page_id: page.id,
            page_name: page.name,
            ad_account_id: adAccountId,
          })
          setIntegration(updated)
          setMessage('Página vinculada automaticamente.')
        }
      } else {
        setMessage(body.error ?? 'Não foi possível listar páginas.')
      }
    } catch (_error) {
      setMessage('Falha ao conectar com a função de páginas.')
    } finally {
      setLoadingPages(false)
    }
  }

  useEffect(() => {
    const url = new URL(window.location.href)
    const code = url.searchParams.get('code')
    if (!code || !account?.id) return

    fetch(`${supabaseUrl}/functions/v1/facebook-oauth-exchange`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${supabaseAnonKey}`,
        apikey: supabaseAnonKey,
      },
      body: JSON.stringify({ code, account_id: account.id }),
    })
      .then(async (res) => {
        const body = await res.json().catch(() => ({}))
        if (!res.ok) {
          setMessage(body.error ?? 'Não foi possível conectar ao Facebook.')
          return
        }
        setMessage('Integração ativa. Buscando páginas...')
        getIntegration(account.id).then(setIntegration)
        fetchPages(account.id)
      })
      .finally(() => {
        url.searchParams.delete('code')
        window.history.replaceState({}, document.title, url.toString())
      })
  }, [account?.id, supabaseUrl])

  const handleSaveIntegration = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!account?.id) return
    if (!pageId) {
      setMessage('Selecione uma página para ativar o webhook.')
      return
    }
    const updated = await upsertIntegration(account.id, {
      page_id: pageId,
      page_name: pageName,
      ad_account_id: adAccountId,
    })
    setIntegration(updated)
    setMessage('Dados da integração salvos.')
  }

  return (
    <section className="page-section">
      <div className="section__header">
        <div>
          <p className="eyebrow">Integrações</p>
          <h2>Conecte campanhas e automatize a entrada de leads.</h2>
        </div>
      </div>
      {supabaseEnvMissing ? (
        <div className="empty">Configure o Supabase para ativar integrações.</div>
      ) : (
        <div className="grid grid--cards">
          <article className="card integration">
            <div className="integration__header">
              <div>
                <p className="card__title">Facebook Lead Ads</p>
                <p className="card__meta">Leads chegam automaticamente no CRM.</p>
              </div>
              <span className={`chip ${integration ? 'chip--success' : 'chip--warning'}`}>
                {integration ? 'Ativa' : 'Inativa'}
              </span>
            </div>
            <p className="integration__note">
              {integration
                ? 'Integração ativa e funcionando. Tudo pronto.'
                : 'Conecte sua conta Meta para começar.'}
            </p>
            <div className="integration__actions">
              <button
                className="btn btn--primary"
                type="button"
                disabled={!oauthUrl || !account}
                onClick={() => oauthUrl && (window.location.href = oauthUrl)}
              >
                Conectar Meta
              </button>
              <form className="form form--stack" onSubmit={handleSaveIntegration}>
                <label className="helper">Selecione a página conectada</label>
                <select
                  className="select"
                  value={pageId}
                  onChange={(event) => {
                    const value = event.target.value
                    setPageId(value)
                    const selected = pages.find((page) => page.id === value)
                    setPageName(selected?.name ?? '')
                  }}
                  disabled={loadingPages || pages.length === 0}
                >
                  <option value="">{loadingPages ? 'Carregando páginas...' : 'Escolha uma página'}</option>
                  {pages.map((page) => (
                    <option key={page.id} value={page.id}>{page.name}</option>
                  ))}
                </select>
                <input value={adAccountId} onChange={(event) => setAdAccountId(event.target.value)} placeholder="Ad Account ID (opcional)" />
                <button className="btn btn--ghost" type="submit" disabled={!account}>
                  Salvar dados
                </button>
              </form>
              <button
                className="btn btn--ghost"
                type="button"
                disabled={!account || loadingPages}
                onClick={() => account?.id && fetchPages(account.id)}
              >
                Atualizar páginas
              </button>
              <p className="helper">A página será vinculada automaticamente após a conexão.</p>
              {message && <p className="notice">{message}</p>}
            </div>
          </article>
        </div>
      )}
    </section>
  )
}

export default Integrations
