const ApiDocs = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string

  return (
    <section className="page-section">
      <div className="section__header">
        <div>
          <p className="eyebrow">API Docs</p>
          <h2>Documentação completa e amigável.</h2>
        </div>
      </div>
      <div className="api">
        <aside className="api__nav" aria-label="Navegação API">
          <a className="api__link" href="#auth">Autenticação</a>
          <a className="api__link" href="#leads">Leads</a>
          <a className="api__link" href="#webhooks">Webhooks</a>
          <a className="api__link" href="#errors">Erros</a>
        </aside>
        <div className="api__content">
          <div id="auth" className="api__block">
            <p className="api__title">Autenticação</p>
            <p className="api__text">
              Use tokens do Supabase. Base URL: <strong>{supabaseUrl}/rest/v1</strong>
            </p>
            <div className="api__example">
              <span>Exemplo</span>
              <p>Authorization: Bearer &lt;token&gt;</p>
            </div>
          </div>
          <div id="leads" className="api__block">
            <p className="api__title">POST /leads</p>
            <p className="api__text">Crie uma lead nova com status nova.</p>
            <div className="api__example">
              <span>Payload</span>
              <p>name, email, source, status</p>
            </div>
          </div>
          <div className="api__block">
            <p className="api__title">GET /leads</p>
            <p className="api__text">Liste leads com filtros por status e origem.</p>
            <div className="api__example">
              <span>Query</span>
              <p>?status=qualificada&amp;source=Facebook</p>
            </div>
          </div>
          <div id="webhooks" className="api__block">
            <p className="api__title">POST /webhooks</p>
            <p className="api__text">Receba eventos de integrações externas.</p>
            <div className="api__example">
              <span>Evento</span>
              <p>lead.created</p>
            </div>
          </div>
          <div id="errors" className="api__block">
            <p className="api__title">Erros</p>
            <p className="api__text">Respostas seguem padrão JSON com message e code.</p>
            <div className="api__example">
              <span>Exemplo</span>
              <p>{'{'}&quot;error&quot;: &quot;Unauthorized&quot;{'}'}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ApiDocs
