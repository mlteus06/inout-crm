import { useEffect, useMemo, useState } from 'react'
import KanbanColumn from '../components/KanbanColumn'
import useAccount from '../hooks/useAccount'
import { Lead, LeadStatus, listLeads, updateLeadStatus } from '../lib/leads'

const statuses: LeadStatus[] = ['nova', 'em_contato', 'qualificada', 'perdida']

const Kanban = () => {
  const { account } = useAccount()
  const [leads, setLeads] = useState<Lead[]>([])

  useEffect(() => {
    if (!account?.id) return
    listLeads(account.id).then(setLeads)
  }, [account?.id])

  const grouped = useMemo(() => {
    return statuses.reduce<Record<LeadStatus, Lead[]>>(
      (acc, status) => {
        acc[status] = leads.filter((lead) => lead.status === status)
        return acc
      },
      { nova: [], em_contato: [], qualificada: [], perdida: [] },
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
    </section>
  )
}

export default Kanban
