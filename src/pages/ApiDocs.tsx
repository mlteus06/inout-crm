import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import useAccount from '../hooks/useAccount'
import type { ApiKey } from '../lib/apiKeys'
import { createApiKey, listApiKeys } from '../lib/apiKeys'

const ApiDocs = () => {
  const { session } = useAuth()
  const { account } = useAccount()
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [label, setLabel] = useState('')
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
  const accessToken = session?.access_token ?? ''

  useEffect(() => {
    if (!account?.id) return
    listApiKeys(account.id).then(setKeys)
  }, [account?.id])

  const handleCreateKey = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!account?.id) return

    const created = await createApiKey(account.id, label || 'Chave principal')
    if (created) {
      setKeys((prev) => [created, ...prev])
      setLabel('')
    }
  }

  return (
    <section className="page-section">
      {/* HEADER */}
      <div className="section__header">
        <div>
          <p className="eyebrow">API Docs</p>
          <h2>Documentação completa e amigável.</h2>
        </div>
      </div>

      {/* LAYOUT */}
      <div className="api__layout">
        {/* ASIDE */}
        <aside className="api__aside">
          <a className="api__link" href="#auth">Autenticação</a>
          <a className="api__link" href="#leads">Leads</a>
          <a className="api__link" href="#webhooks">Webhooks</a>
          <a className="api__link" href="#errors">Erros</a>
        </aside>

        {/* CONTENT */}
        <div className="api__content">
          {/* AUTH */}
          <div id="auth" className="api__block">
            <p className="api__title">Autenticação</p>
            <p className="api__text">
              Para acessar o <strong>REST</strong> do Supabase use o token (JWT) e o header
              <strong> apikey</strong>. Base URL:{' '}
              <strong>{supabaseUrl}/rest/v1</strong>
            </p>

            <div className="api__example">
              <span>Exemplo</span>
              <p>Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhandudnBhcGhmbm9neGJ4ZXF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwOTc1NTcsImV4cCI6MjA4NTY3MzU1N30.Dy4f1_-4d1Q82kyIjGQrMnTND6hMY8_G0F-vRF6C-BQ;</p>
              <p>apikey: &lt;anon ou service key&gt;</p>
            </div>

            <p className="api__text">
              O <strong>token</strong> é o JWT da sessão do usuário.
            </p>

            <div className="api__example">
              <span>Token atual do usuário</span>
              {accessToken ? (
                <p className="api__text">{accessToken}</p>
              ) : (
                <p className="api__text">Faça login para ver o token JWT.</p>
              )}
            </div>
          </div>

          {/* API KEY */}
          <div className="api__block">
            <p className="api__title">API Key</p>
            <p className="api__text">
              Use a chave no header <strong>x-api-key</strong> apenas na função pública{' '}
              <strong>{supabaseUrl}/functions/v1/public-api</strong>.
            </p>

            {!account ? (
              <div className="api__example">
                <p>Crie sua conta para gerar chaves.</p>
              </div>
            ) : (
              <>
                <form className="form form--inline" onSubmit={handleCreateKey}>
                  <input
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="Nome da chave"
                  />
                  <button className="btn btn--ghost" type="submit">
                    Gerar chave
                  </button>
                </form>

                <div className="panel__list">
                  {keys.map((key) => (
                    <div className="panel__item" key={key.id}>
                      <div>
                        <p className="panel__label">{key.label}</p>
                        <p className="panel__meta">{key.key}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* LEADS */}
          <div id="leads" className="api__block">
            <p className="api__title">POST /leads</p>
            <p className="api__text">
              Endpoint: <strong>{supabaseUrl}/functions/v1/public-api</strong>
            </p>

            <div className="api__example">
              <span>Payload</span>
              <p>name, email, phone, notes, source, status</p>
            </div>
            <p className="api__text">
              Status suportados: <strong>nova</strong>, <strong>em_contato</strong>, <strong>qualificada</strong>,{' '}
              <strong>convertido</strong>, <strong>desqualificado</strong>, <strong>perdida</strong>.
            </p>     
          </div>

          <div className="api__block">
            <p className="api__title">GET /leads</p>
            <p className="api__text">
              Liste leads com filtros por status e origem.
            </p>

            <div className="api__example">
              <span>Query</span>
              <p>?status=qualificada&amp;source=Facebook&amp;limit=50</p>
            </div>
          </div>

          <div className="api__block">
            <p className="api__title">POST /leads/:id/status</p>
            <p className="api__text">
              Mova o lead entre os quadros (altere o status).
            </p>
            <div className="api__example">
              <span>Endpoint</span>
              <p>{supabaseUrl}/functions/v1/public-api/leads/&lt;id&gt;/status</p>
            </div>
            <div className="api__example">
              <span>Payload</span>
              <p>status</p>
            </div>
          </div>
          
          {/* WEBHOOKS */}
          <div id="webhooks" className="api__block">
            <p className="api__title">POST /webhooks</p>
            <p className="api__text">Receba eventos de integrações externas.</p>

            <div className="api__example">
              <span>Evento</span>
              <p>lead.created</p>
            </div>
          </div>

          {/* ERRORS */}
          <div id="errors" className="api__block">
            <p className="api__title">Erros</p>
            <p className="api__text">
              Respostas seguem padrão JSON com message e code.
            </p>

            <div className="api__example">
              <span>Exemplo</span>
              <p>{'{'}"error": "Unauthorized"{'}'}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ApiDocs
