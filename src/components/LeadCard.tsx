import type { Lead } from '../lib/leads'

type LeadCardProps = {
  lead: Lead
  onClick?: () => void
}

const LeadCard = ({ lead, onClick }: LeadCardProps) => {
  return (
    <article className="lead lead-card" role="button" tabIndex={0} onClick={onClick}>
      <div>
        <p className="lead__name">{lead.name}</p>
        <p className="lead__meta">
          {lead.source} · {lead.email || lead.phone || 'Sem contato'}
        </p>
      </div>
      <span className="chip chip--status">{lead.status}</span>
    </article>
  )
}

export default LeadCard
