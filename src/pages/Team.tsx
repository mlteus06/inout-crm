const Team = () => {
  return (
    <section className="page-section">
      <div className="section__header">
        <div>
          <p className="eyebrow">Time</p>
          <h2>Membros e permissões.</h2>
        </div>
      </div>
      <div className="grid grid--cards">
        <article className="card">
          <p className="card__title">Convites</p>
          <p className="card__meta">Adicione pessoas ao seu time.</p>
        </article>
        <article className="card">
          <p className="card__title">Roles</p>
          <p className="card__meta">Defina permissões por função.</p>
        </article>
        <article className="card">
          <p className="card__title">Atividade</p>
          <p className="card__meta">Veja quem fez alterações recentes.</p>
        </article>
      </div>
    </section>
  )
}

export default Team
