import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getLead, updateLeadStatus, type Lead, type LeadStatus } from '../lib/leads'

const LeadDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [lead, setLead] = useState<Lead | null>(null)
  const [status, setStatus] = useState<LeadStatus>('nova')

  useEffect(() => {
    if (!id) return
    getLead(id).then((data) => {
      if (data) {
        setLead(data)
        setStatus(data.status)
      }
    })
  }, [id])

  const handleUpdate = async () => {
    if (!lead) return
    const updated = await updateLeadStatus(lead.id, status)
    if (updated) {
      setLead(updated)
    }
  }

  if (!lead) {
    return <div className="loading">Carregando lead...</div>
  }

  return (
    <section className="page-section">
      <div className="section__header">
        <div>
          <p className="eyebrow">Detalhe da lead</p>
          <h2>{lead.name}</h2>
        </div>
        <button className="btn btn--ghost" type="button" onClick={() => navigate(-1)}>
          Voltar
        </button>
      </div>

      <div className="detail-grid">
        <div className="card">
          <p className="card__title">Informações principais</p>
          <p className="card__meta">Email: {lead.email || 'Não informado'}</p>
          <p className="card__meta">Telefone: {lead.phone || 'Não informado'}</p>
          <p className="card__meta">Origem: {lead.source}</p>
        </div>
        <div className="card">
          <p className="card__title">Status</p>
          <select className="select" value={status} onChange={(event) => setStatus(event.target.value as LeadStatus)}>
            <option value="nova">Nova</option>
            <option value="em_contato">Em contato</option>
            <option value="qualificada">Qualificada</option>
            <option value="perdida">Perdida</option>
          </select>
          <button className="btn btn--primary" type="button" onClick={handleUpdate}>
            Atualizar status
          </button>
        </div>
        <div className="card">
          <p className="card__title">Notas</p>
          <p className="card__meta">
            {lead.notes || 'Adicione notas e histórico de contato aqui.'}
          </p>
        </div>
      </div>
    </section>
  )
}

export default LeadDetail
