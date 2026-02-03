import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const Header = () => {
  const navigate = useNavigate()

  const handleSignOut = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    navigate('/auth')
  }

  return (
    <header className="app-header">
      <div>
        <p className="eyebrow">Inout CRM</p>
        <h1>Painel</h1>
      </div>
      <div className="app-header__actions">
        <Link className="btn btn--ghost" to="/integrations">
          Conectar Meta
        </Link>
        <button className="btn btn--primary" type="button" onClick={handleSignOut}>
          Sair
        </button>
      </div>
    </header>
  )
}

export default Header
