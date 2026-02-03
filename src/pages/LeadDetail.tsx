import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { Lead, LeadStatus } from '../lib/leads'
import { getLead, updateLead, updateLeadStatus } from '../lib/leads'

const LeadDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [lead, setLead] = useState<Lead | null>(null)
  const [status, setStatus] = useState<LeadStatus>('nova')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (!id) return
    getLead(id).then((data) => {
      if (data) {
        setLead(data)
        setStatus(data.status)
        setEmail(data.email ?? '')
        setPhone(data.phone ?? '')
        setNotes(data.notes ?? '')
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

  const handleSaveDetails = async () => {
    if (!lead) return
    const updated = await updateLead(lead.id, {
      email: email || null,
      phone: phone || null,
      notes: notes || null,
    })
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
          <div className="form form--stack">
            <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" />
            <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Telefone" />
            <input value={lead.source} disabled />
            <button className="btn btn--primary" type="button" onClick={handleSaveDetails}>
              Salvar dados
            </button>
          </div>
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
          <textarea
            className="textarea"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Adicione notas e histórico de contato."
          />
          <button className="btn btn--ghost" type="button" onClick={handleSaveDetails}>
            Salvar notas
          </button>
        </div>
      </div>
    </section>
  )
}

export default LeadDetail
