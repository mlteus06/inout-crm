const Billing = () => {
  return (
    <section className="page-section">
      <div className="section__header">
        <div>
          <p className="eyebrow">Billing</p>
          <h2>Planos, cobrança e status.</h2>
        </div>
      </div>
      <div className="grid grid--cards">
        <article className="card">
          <p className="card__title">Plano atual</p>
          <p className="card__meta">Starter · Próxima cobrança em 30 dias.</p>
        </article>
        <article className="card">
          <p className="card__title">Método de pagamento</p>
          <p className="card__meta">Atualize cartão e dados fiscais.</p>
        </article>
        <article className="card">
          <p className="card__title">Histórico</p>
          <p className="card__meta">Notas fiscais e faturas anteriores.</p>
        </article>
      </div>
    </section>
  )
}

export default Billing
