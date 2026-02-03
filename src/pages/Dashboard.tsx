import { useEffect, useMemo, useState } from 'react'
import StatCard from '../components/StatCard'
import useAccount from '../hooks/useAccount'
import { Lead, createAccount, listLeads } from '../lib/leads'
import { useAuth } from '../context/AuthContext'

const Dashboard = () => {
  const { account, loading: accountLoading, refresh } = useAccount()
  const { session } = useAuth()
  const [leads, setLeads] = useState<Lead[]>([])
  const [accountName, setAccountName] = useState('')

  useEffect(() => {
    if (!account?.id) return
    listLeads(account.id).then(setLeads)
  }, [account?.id])

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
              await createAccount(session.user.id, accountName || 'Minha conta')
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
