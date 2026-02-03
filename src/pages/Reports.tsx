import { useEffect, useMemo, useState } from 'react'
import StatCard from '../components/StatCard'
import useAccount from '../hooks/useAccount'
import type { Lead } from '../lib/leads'
import { listLeads } from '../lib/leads'

const Reports = () => {
  const { account } = useAccount()
  const [leads, setLeads] = useState<Lead[]>([])

  useEffect(() => {
    if (!account?.id) return
    listLeads(account.id).then(setLeads)
  }, [account?.id])

  const stats = useMemo(() => {
    const total = leads.length
    const byStatus = leads.reduce(
      (acc, lead) => {
        acc[lead.status] += 1
        return acc
      },
     { nova: 0, em_contato: 0, qualificada: 0, convertido: 0, desqualificado: 0, perdida: 0 },
    )
    const bySource = leads.reduce<Record<string, number>>((acc, lead) => {
      acc[lead.source] = (acc[lead.source] || 0) + 1
      return acc
    }, {})
    const topSources = Object.entries(bySource)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    return { total, byStatus, topSources }
  }, [leads])

  return (
    <section className="page-section">
      <div className="section__header">
        <div>
          <p className="eyebrow">Relatórios</p>
          <h2>Performance real por conta.</h2>
        </div>
      </div>
      {!account ? (
        <div className="empty">Crie sua conta para ver relatórios.</div>
      ) : (
        <>
          <div className="grid grid--cards">
            <StatCard title="Total de leads" value={stats.total} subtitle="Todas as fontes" />
            <StatCard title="Novas" value={stats.byStatus.nova} subtitle="Aguardando contato" highlight />
            <StatCard title="Qualificadas" value={stats.byStatus.qualificada} subtitle="Oportunidades" />
            <StatCard title="Convertidas" value={stats.byStatus.convertido} subtitle="Clientes fechados" />
            <StatCard title="Desqualificadas" value={stats.byStatus.desqualificado} subtitle="Fora do perfil" />
            <StatCard title="Perdidas" value={stats.byStatus.perdida} subtitle="Revisar motivos" />
          </div>
          <div className="panel">
            <div className="panel__header">
              <h3>Top origens</h3>
            </div>
            <div className="panel__list">
              {stats.topSources.length === 0 ? (
                <div className="panel__item">
                  <p className="panel__label">Sem dados ainda</p>
                </div>
              ) : (
                stats.topSources.map(([source, count]) => (
                  <div className="panel__item" key={source}>
                    <div>
                      <p className="panel__label">{source}</p>
                      <p className="panel__meta">{count} leads</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </section>
  )
}

export default Reports
