const Reports = () => {
  return (
    <section className="page-section">
      <div className="section__header">
        <div>
          <p className="eyebrow">Relatórios</p>
          <h2>Performance e tendências de conversão.</h2>
        </div>
      </div>
      <div className="grid grid--cards">
        <article className="card">
          <p className="card__title">Origem de leads</p>
          <p className="card__meta">Facebook Lead Ads lidera a captura.</p>
        </article>
        <article className="card">
          <p className="card__title">Tempo de resposta</p>
          <p className="card__meta">Média de 1h para primeiro contato.</p>
        </article>
        <article className="card">
          <p className="card__title">Conversão</p>
          <p className="card__meta">19% das leads foram qualificadas.</p>
        </article>
      </div>
    </section>
  )
}

export default Reports
