import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="auth-page">
      <div className="card">
        <p className="card__title">Página não encontrada</p>
        <p className="card__meta">Volte para o dashboard.</p>
        <Link className="btn btn--primary" to="/dashboard">
          Ir para o Dashboard
        </Link>
      </div>
    </div>
  )
}

export default NotFound
