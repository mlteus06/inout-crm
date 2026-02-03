import { useEffect, useMemo, useState } from 'react'
import StatCard from '../components/StatCard'
import useAccount from '../hooks/useAccount'
import type { Lead } from '../lib/leads'
import { createAccount, getAccountSettings, listLeads } from '../lib/leads'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

const Dashboard = () => {
  const { account, loading: accountLoading, error, refresh } = useAccount()
  const { session } = useAuth()
  const [leads, setLeads] = useState<Lead[]>([])
  const [accountName, setAccountName] = useState('')
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!account?.id) return
    listLeads(account.id).then(setLeads)
    getAccountSettings(account.id).then((settings) => {
      setNotificationsEnabled(Boolean(settings?.new_lead_notifications))
    })
  }, [account?.id])

  useEffect(() => {
    const client = supabase
    if (!account?.id || !client || !notificationsEnabled) return
    const channel = client
      .channel('lead-insert')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'leads', filter: `account_id=eq.${account.id}` },
        (payload) => {
          const newLead = payload.new as Lead
          setToast(`Nova lead: ${newLead.name}`)
          setLeads((prev) => [newLead, ...prev])
          setTimeout(() => setToast(null), 4000)
        },
      )
      .subscribe()

    return () => {
      client.removeChannel(channel)
    }
  }, [account?.id, notificationsEnabled])

  const stats = useMemo(() => {
    const byStatus = leads.reduce(
      (acc, lead) => {
        acc[lead.status] += 1
        return acc
      },
      { nova: 0, em_contato: 0, qualificada: 0, perdida: 0 },
    )

    return byStatus
  }, [leads])

  if (accountLoading) {
    return <div className="loading">Carregando...</div>
  }

  return (
    <section className="page-section">
      <div className="section__header">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h2>Visão geral de leads e performance.</h2>
        </div>
      </div>
      {!account ? (
        <div className="card">
          <p className="card__title">Crie sua conta</p>
          <p className="card__meta">Defina o nome da sua empresa para começar.</p>
          <form
            className="form form--stack"
            onSubmit={async (event) => {
              event.preventDefault()
              if (!session?.user?.id) return
              const result = await createAccount(session.user.id, accountName || 'Minha conta')
              if (result.error) {
                alert(result.error)
                return
              }
              setAccountName('')
              refresh()
            }}
          >
            <input
              value={accountName}
              onChange={(event) => setAccountName(event.target.value)}
              placeholder="Nome da empresa"
              required
            />
            <button className="btn btn--primary" type="submit">
              Salvar conta
            </button>
          </form>
        </div>
      ) : (
        <>
          {toast && <div className="notice">{toast}</div>}
          {error && <div className="notice">Erro ao carregar dados: {error}</div>}
          <div className="grid grid--cards">
            <StatCard title="Novas Leads" value={stats.nova} subtitle="Chegaram hoje" highlight />
            <StatCard title="Em contato" value={stats.em_contato} subtitle="Em andamento" />
            <StatCard title="Qualificadas" value={stats.qualificada} subtitle="Prontas para proposta" />
            <StatCard title="Perdidas" value={stats.perdida} subtitle="Motivos a revisar" />
          </div>
          <div className="panel">
            <div className="panel__header">
              <h3>Leads recentes</h3>
              <span className="chip chip--status">{leads.length}</span>
            </div>
            <div className="panel__list">
              {leads.slice(0, 5).map((lead) => (
                <div className="panel__item" key={lead.id}>
                  <div>
                    <p className="panel__label">{lead.name}</p>
                    <p className="panel__meta">{lead.source}</p>
                  </div>
                  <span className="chip chip--status">{lead.status}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  )
}

export default Dashboard
