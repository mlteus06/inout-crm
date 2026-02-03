import type { Lead, LeadStatus } from '../lib/leads'

type KanbanColumnProps = {
  status: LeadStatus
  leads: Lead[]
  onDropLead: (leadId: string, status: LeadStatus) => void
}

const statusLabel: Record<LeadStatus, string> = {
  nova: 'Nova',
  em_contato: 'Em contato',
  qualificada: 'Qualificada',
  convertido: 'Convertido',
  desqualificado: 'Desqualificado',
  perdida: 'Perdida',
}

const KanbanColumn = ({ status, leads, onDropLead }: KanbanColumnProps) => {
  return (
    <div
      className="kanban__column"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        const leadId = event.dataTransfer.getData('lead-id')
        if (leadId) onDropLead(leadId, status)
      }}
    >
      <div className="kanban__header">
        <h3>{statusLabel[status]}</h3>
        <span className="chip chip--status">{leads.length}</span>
      </div>
      <div className="kanban__list">
        {leads.map((lead) => (
          <div
            key={lead.id}
            className="kanban__card"
            draggable
            onDragStart={(event) => event.dataTransfer.setData('lead-id', lead.id)}
          >
            <p>{lead.name}</p>
            <span>{lead.source}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default KanbanColumn
