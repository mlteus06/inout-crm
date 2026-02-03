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
@@ -33,10 +36,7 @@ const ApiDocs = () => {
        </div>
      </div>

      <div className="api">
        <aside className="api__nav" aria-label="Navegação API">
          <a className="api__link" href="#auth">Autenticação</a>
          <a className="api__link" href="#leads">Leads</a>
@@ -40,50 +43,59 @@ const ApiDocs = () => {
          <a className="api__link" href="#webhooks">Webhooks</a>
          <a className="api__link" href="#errors">Erros</a>
        </aside>
@@ -62,6 +62,15 @@ const ApiDocs = () => {
              Supabase Auth (ex.: <code>supabase.auth.signInWithPassword</code> ou{' '}
              <code>supabase.auth.getSession()</code>).
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
