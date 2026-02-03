import { useEffect, useState } from 'react'
import useAccount from '../hooks/useAccount'
import { getAccountSettings, updateAccount } from '../lib/leads'
import { supabase } from '../lib/supabase'

const Settings = () => {
  const { account } = useAccount()
  const [companyName, setCompanyName] = useState('')
  const [notifications, setNotifications] = useState(true)
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!account?.id) return
    getAccountSettings(account.id).then((data) => {
      if (!data) return
      setCompanyName(data.name)
      setNotifications(Boolean(data.new_lead_notifications))
    })
  }, [account?.id])

  const handleSaveAccount = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!account?.id) return
    const updated = await updateAccount(account.id, {
      name: companyName,
      new_lead_notifications: notifications,
    })
    setMessage(updated ? 'Configurações salvas.' : 'Erro ao salvar.')
  }

  const handlePassword = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!supabase || !password) return
    const { error } = await supabase.auth.updateUser({ password })
    setMessage(error ? error.message : 'Senha atualizada com sucesso.')
    setPassword('')
  }

  return (
    <section className="page-section">
      <div className="section__header">
        <div>
          <p className="eyebrow">Configurações</p>
          <h2>Preferências e dados da conta.</h2>
        </div>
      </div>
      {!account ? (
        <div className="empty">Crie sua conta para configurar.</div>
      ) : (
        <div className="grid grid--cards">
          <article className="card">
            <p className="card__title">Dados da empresa</p>
            <form className="form form--stack" onSubmit={handleSaveAccount}>
              <input value={companyName} onChange={(event) => setCompanyName(event.target.value)} placeholder="Nome da empresa" />
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(event) => setNotifications(event.target.checked)}
                />
                <span>Notificar novas leads</span>
              </label>
              <button className="btn btn--primary" type="submit">Salvar</button>
            </form>
          </article>
          <article className="card">
            <p className="card__title">Segurança</p>
            <form className="form form--stack" onSubmit={handlePassword}>
              <input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Nova senha" type="password" />
              <button className="btn btn--ghost" type="submit">Atualizar senha</button>
            </form>
          </article>
          {message && <p className="notice">{message}</p>}
        </div>
      )}
    </section>
  )
}

export default Settings
