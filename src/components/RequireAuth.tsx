import { Navigate } from 'react-router-dom'
import { supabaseEnvMissing } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth()

  if (loading) {
    return <div className="loading">Carregando...</div>
  }

  if (supabaseEnvMissing) {
    return (
      <div className="loading">
        <div className="empty">
          <p>Configuração do Supabase ausente.</p>
          <p>Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/auth" replace />
  }

  return <>{children}</>
}

export default RequireAuth
