const Settings = () => {
  return (
    <section className="page-section">
      <div className="section__header">
        <div>
          <p className="eyebrow">Configurações</p>
          <h2>Preferências e dados da conta.</h2>
        </div>
      </div>
      <div className="grid grid--cards">
        <article className="card">
          <p className="card__title">Dados da empresa</p>
          <p className="card__meta">Atualize nome, segmento e dados fiscais.</p>
        </article>
        <article className="card">
          <p className="card__title">Notificações</p>
          <p className="card__meta">Receba alertas sobre novas leads.</p>
        </article>
        <article className="card">
          <p className="card__title">Segurança</p>
          <p className="card__meta">Gerencie senhas e acessos.</p>
        </article>
      </div>
    </section>
  )
}

export default Settings
