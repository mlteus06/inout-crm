import { useEffect, useMemo, useState } from 'react'
import KanbanColumn from '../components/KanbanColumn'
import useAccount from '../hooks/useAccount'
import type { Lead, LeadStatus } from '../lib/leads'
import { listLeads, updateLeadStatus } from '../lib/leads'
import { supabase } from '../lib/supabase'

const statuses: LeadStatus[] = ['nova', 'em_contato', 'qualificada', 'convertido', 'desqualificado', 'perdida']

const Kanban = () => {
  const { account } = useAccount()
  const [leads, setLeads] = useState<Lead[]>([])

  useEffect(() => {
    if (!account?.id) return
    listLeads(account.id).then(setLeads)
  }, [account?.id])

    useEffect(() => {
    if (!account?.id || !supabase) return

    const channel = supabase
      .channel(`kanban-updates-${account.id}`)
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

  const grouped = useMemo(() => {
    return statuses.reduce<Record<LeadStatus, Lead[]>>(
      (acc, status) => {
        acc[status] = leads.filter((lead) => lead.status === status)
        return acc
      },
      { nova: [], em_contato: [], qualificada: [], convertido: [], desqualificado: [], perdida: [] },
    )
  }, [leads])

  const handleDropLead = async (leadId: string, status: LeadStatus) => {
    const updated = await updateLeadStatus(leadId, status)
    if (!updated) return
    setLeads((prev) => prev.map((lead) => (lead.id === leadId ? updated : lead)))
  }

  return (
    <section className="page-section">
      <div className="section__header">
        <div>
          <p className="eyebrow">Kanban</p>
          <h2>Arraste leads entre os estágios.</h2>
        </div>
      </div>
      {!account ? (
        <div className="empty">Crie sua conta para usar o Kanban.</div>
      ) : (
        <>
          {leads.length === 0 ? (
            <div className="empty">Nenhuma lead para organizar.</div>
          ) : (
            <div className="kanban">
              {statuses.map((status) => (
                <KanbanColumn
                  key={status}
                  status={status}
                  leads={grouped[status]}
                  onDropLead={handleDropLead}
                />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  )
}

export default Kanban
