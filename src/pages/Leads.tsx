import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LeadCard from '../components/LeadCard'
import useAccount from '../hooks/useAccount'
import type { Lead, LeadStatus } from '../lib/leads'
import { createLead, listLeads } from '../lib/leads'
import { supabase } from '../lib/supabase'

const Leads = () => {
  const { account } = useAccount()
  const navigate = useNavigate()
  const [leads, setLeads] = useState<Lead[]>([])
  const [filter, setFilter] = useState<LeadStatus | 'todos'>('todos')
  const [search, setSearch] = useState('')

  const [leadName, setLeadName] = useState('')
  const [leadEmail, setLeadEmail] = useState('')
  const [leadPhone, setLeadPhone] = useState('')
  const [leadSource, setLeadSource] = useState('Manual')
  const [leadNotes, setLeadNotes] = useState('')

    const statusLabels: Record<LeadStatus | 'todos', string> = {
    todos: 'Todos',
    nova: 'Nova',
    em_contato: 'Em contato',
    qualificada: 'Qualificada',
    convertido: 'Convertido',
    desqualificado: 'Desqualificado',
    perdida: 'Perdida',
  }
  
  useEffect(() => {
    if (!account?.id) return
    listLeads(account.id).then(setLeads)
  }, [account?.id])

  useEffect(() => {
    if (!account?.id || !supabase) return

    const channel = supabase
      .channel(`leads-updates-${account.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'leads', filter: `account_id=eq.${account.id}` },
        (payload) => {
          const newLead = payload.new as Lead | null
          const oldLead = payload.old as Lead | null
          if (payload.eventType === 'INSERT' && newLead) {
            setLeads((prev) => (prev.some((lead) => lead.id === newLead.id) ? prev : [newLead, ...prev]))
            return
          }
          if (payload.eventType === 'UPDATE' && newLead) {
            setLeads((prev) => prev.map((lead) => (lead.id === newLead.id ? newLead : lead)))
            return
          }
          if (payload.eventType === 'DELETE' && oldLead) {
            setLeads((prev) => prev.filter((lead) => lead.id !== oldLead.id))
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [account?.id])

  const filtered = useMemo(() => {
    return leads.filter((lead) => {
      if (filter !== 'todos' && lead.status !== filter) return false
      if (!search) return true
      return lead.name.toLowerCase().includes(search.toLowerCase())
    })
  }, [leads, filter, search])

  const handleCreateLead = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!account?.id) return

    const created = await createLead({
      account_id: account.id,
      name: leadName,
      email: leadEmail || null,
      phone: leadPhone || null,
      notes: leadNotes || null,
      source: leadSource,
      status: 'nova',
    })

    if (created) {
      setLeads((prev) => [created, ...prev])
      setLeadName('')
      setLeadEmail('')
      setLeadPhone('')
      setLeadSource('Manual')
      setLeadNotes('')
    }
  }

  return (
    <section className="page-section">
      <div className="section__header">
        <div>
          <p className="eyebrow">Leads</p>
          <h2>Lista completa e organizada.</h2>
        </div>
      </div>
      {!account ? (
        <div className="empty">Crie sua conta para cadastrar leads.</div>
      ) : (
        <>
          <form className="form form--inline" onSubmit={handleCreateLead}>
            <input value={leadName} onChange={(event) => setLeadName(event.target.value)} placeholder="Nome da lead" required />
            <input value={leadEmail} onChange={(event) => setLeadEmail(event.target.value)} placeholder="Email" type="email" />
            <input value={leadPhone} onChange={(event) => setLeadPhone(event.target.value)} placeholder="Telefone" />
            <input value={leadSource} onChange={(event) => setLeadSource(event.target.value)} placeholder="Origem" />
            <input value={leadNotes} onChange={(event) => setLeadNotes(event.target.value)} placeholder="Notas" />
            <button className="btn btn--primary" type="submit">
              Salvar lead
            </button>
          </form>

          <div className="toolbar">
            <div className="toolbar__filters">
              {(['todos', 'nova', 'em_contato', 'qualificada', 'convertido', 'desqualificado', 'perdida'] as const).map(
                (status) => (
                  <button
                    key={status}
                    type="button"
                    className={`btn btn--ghost ${filter === status ? 'is-active' : ''}`}
                    onClick={() => setFilter(status)}
                  >
                    {statusLabels[status]}
                  </button>
                ),
              )}
            </div>
            <input
              className="toolbar__search"
              placeholder="Buscar por nome"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="grid grid--list">
            {filtered.length === 0 ? (
              <div className="empty">Nenhuma lead encontrada.</div>
            ) : (
              filtered.map((lead) => (
                <LeadCard key={lead.id} lead={lead} onClick={() => navigate(`/leads/${lead.id}`)} />
              ))
            )}
          </div>
        </>
      )}
    </section>
  )
}

export default Leads
