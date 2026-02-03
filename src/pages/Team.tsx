import { useEffect, useState } from 'react'
import useAccount from '../hooks/useAccount'
import type { Invite, TeamMember } from '../lib/team'
import { createInvite, listInvites, listMembers } from '../lib/team'

const Team = () => {
  const { account } = useAccount()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [invites, setInvites] = useState<Invite[]>([])
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('member')

  useEffect(() => {
    if (!account?.id) return
    listMembers(account.id).then(setMembers)
    listInvites(account.id).then(setInvites)
  }, [account?.id])

  const handleInvite = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!account?.id) return
    const created = await createInvite(account.id, email, role)
    if (created) {
      setInvites((prev) => [created, ...prev])
      setEmail('')
      setRole('member')
    }
  }

  return (
    <section className="page-section">
      <div className="section__header">
        <div>
          <p className="eyebrow">Time</p>
          <h2>Membros e convites da conta.</h2>
        </div>
      </div>
      {!account ? (
        <div className="empty">Crie sua conta para gerenciar o time.</div>
      ) : (
        <>
          <form className="form form--inline" onSubmit={handleInvite}>
            <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email do convidado" type="email" required />
            <select className="select" value={role} onChange={(event) => setRole(event.target.value)}>
              <option value="member">Membro</option>
              <option value="admin">Admin</option>
            </select>
            <button className="btn btn--primary" type="submit">Convidar</button>
          </form>

          <div className="grid grid--cards">
            <article className="card">
              <p className="card__title">Membros ativos</p>
              <div className="panel__list">
                {members.map((member) => (
                  <div className="panel__item" key={member.user_id}>
                    <div>
                      <p className="panel__label">{member.name || member.email || 'Usuário'}</p>
                      <p className="panel__meta">{member.email}</p>
                    </div>
                    <span className="chip chip--status">{member.role}</span>
                  </div>
                ))}
                {members.length === 0 && <p className="panel__meta">Sem membros ainda.</p>}
              </div>
            </article>
            <article className="card">
              <p className="card__title">Convites pendentes</p>
              <div className="panel__list">
                {invites.map((invite) => (
                  <div className="panel__item" key={invite.id}>
                    <div>
                      <p className="panel__label">{invite.email}</p>
                      <p className="panel__meta">{invite.status}</p>
                    </div>
                    <span className="chip chip--status">{invite.role}</span>
                  </div>
                ))}
                {invites.length === 0 && <p className="panel__meta">Sem convites.</p>}
              </div>
            </article>
          </div>
        </>
      )}
    </section>
  )
}

export default Team
