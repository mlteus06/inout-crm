import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { createAccount } from '../lib/leads'
import { supabase, supabaseEnvMissing } from '../lib/supabase'

const Auth = () => {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [message, setMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [accountName, setAccountName] = useState('')

  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault()
    setMessage(null)
    if (!supabase) return

    setSubmitting(true)
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setMessage(error.message)
      setSubmitting(false)
      return
    }

    if (data.user && data.session) {
      const result = await createAccount(data.user.id, accountName || 'Minha conta')
      if (result.error) {
        setMessage(result.error)
        setSubmitting(false)
        return
      }
      navigate('/dashboard')
      return
    }

    setMessage('Conta criada. Confirme seu email para entrar.')
    setSubmitting(false)
  }

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault()
    setMessage(null)
    if (!supabase) return

    setSubmitting(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setMessage(error.message)
      setSubmitting(false)
      return
    }

    navigate('/dashboard')
  }

  if (session) {
    return (
      <div className="auth-page">
        <div className="card">
          <p className="card__title">Você já está logado.</p>
          <button className="btn btn--primary" onClick={() => navigate('/dashboard')}>
            Ir para o Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (supabaseEnvMissing) {
    return (
      <div className="auth-page">
        <div className="card">
          <p className="card__title">Configuração ausente</p>
          <p className="card__meta">Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth">
        <form className="form form--stack" onSubmit={handleSignUp}>
          <h3>Criar conta</h3>
          <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" type="email" required />
          <input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Senha" type="password" required />
          <input value={accountName} onChange={(event) => setAccountName(event.target.value)} placeholder="Nome da empresa" />
          <button className="btn btn--primary" type="submit" disabled={submitting}>
            {submitting ? 'Criando...' : 'Criar conta'}
          </button>
        </form>
        <form className="form form--stack" onSubmit={handleSignIn}>
          <h3>Entrar</h3>
          <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" type="email" required />
          <input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Senha" type="password" required />
          <button className="btn btn--ghost" type="submit" disabled={submitting}>
            {submitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
      {message && <p className="notice">{message}</p>}
      {message?.includes('Confirme seu email') && (
        <button
          className="btn btn--ghost"
          type="button"
          disabled={!email || submitting}
          onClick={async () => {
            if (!supabase) return
            setSubmitting(true)
            const { error } = await supabase.auth.resend({ type: 'signup', email })
            setMessage(error ? error.message : 'Email de confirmação reenviado.')
            setSubmitting(false)
          }}
        >
          Reenviar confirmação
        </button>
      )}
    </div>
  )
}

export default Auth
