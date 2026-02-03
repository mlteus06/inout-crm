import { useEffect, useMemo, useState } from 'react'
import useAccount from '../hooks/useAccount'
import { getSubscription, type Subscription } from '../lib/billing'

const Billing = () => {
  const { account } = useAccount()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const paymentLink = import.meta.env.VITE_STRIPE_PAYMENT_LINK as string

  useEffect(() => {
    if (!account?.id) return
    getSubscription(account.id).then(setSubscription)
  }, [account?.id])

  const linkWithRef = useMemo(() => {
    if (!paymentLink || !account?.id) return ''
    const url = new URL(paymentLink)
    url.searchParams.set('client_reference_id', account.id)
    return url.toString()
  }, [paymentLink, account?.id])

  return (
    <section className="page-section">
      <div className="section__header">
        <div>
          <p className="eyebrow">Billing</p>
          <h2>Planos, cobrança e status.</h2>
        </div>
      </div>
      {!account ? (
        <div className="empty">Crie sua conta para acessar o billing.</div>
      ) : (
        <div className="grid grid--cards">
          <article className="card">
            <p className="card__title">Plano atual</p>
            <p className="card__meta">
              Status: {subscription?.status ?? 'Sem assinatura'}
            </p>
            <p className="card__meta">
              Renovação: {subscription?.current_period_end ?? '—'}
            </p>
            <button className="btn btn--primary" type="button" disabled={!linkWithRef} onClick={() => linkWithRef && window.open(linkWithRef, '_blank')}>
              Assinar / Gerenciar
            </button>
            {!linkWithRef && <p className="card__meta">Defina VITE_STRIPE_PAYMENT_LINK.</p>}
          </article>
          <article className="card">
            <p className="card__title">Pagamento</p>
            <p className="card__meta">Checkout seguro via Stripe.</p>
            <p className="card__meta">Teste grátis já incluso no link.</p>
          </article>
        </div>
      )}
    </section>
  )
}

export default Billing
