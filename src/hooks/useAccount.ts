import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import type { Account } from '../lib/leads'
import { createAccount, getAccountForUser } from '../lib/leads'

const useAccount = () => {
  const { session } = useAuth()
  const [account, setAccount] = useState<Account | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const mountedRef = useRef(true)

  const refresh = useCallback(async () => {
    if (!session?.user?.id) {
      if (!mountedRef.current) return
      setAccount(null)
      setError(null)
      setLoading(false)
      return
    }

if (!data) {
  const { data: created } = await supabase
    .from('accounts')
    .insert({ user_id: session.user.id })
    .select()
    .single()

  setAccount(created)
}
    
    if (!mountedRef.current) return
    setLoading(true)
    const timeoutId = window.setTimeout(() => {
      if (!mountedRef.current) return
      setError('Tempo limite ao carregar conta.')
      setLoading(false)
    }, 8000)

    try {
      const { account: acct, error: fetchError } = await getAccountForUser(session.user.id)
      if (!mountedRef.current) return
      if (!acct && !fetchError) {
        const fallbackName = session.user.email?.split('@')[0] || 'Minha conta'
        const { account: createdAccount, error: createError } = await createAccount(
          session.user.id,
          fallbackName,
        )
        if (!mountedRef.current) return
        setAccount(createdAccount)
        setError(createError)
        return
      }
      setAccount(acct)
      setError(fetchError)
    } catch (err) {
      if (!mountedRef.current) return
      if (err instanceof DOMException && err.name === 'AbortError') {
        return
      }
      setError('Erro ao carregar conta.')
    } finally {
      window.clearTimeout(timeoutId)
      if (!mountedRef.current) return
      setLoading(false)
    }
  }, [session?.user?.id])

  useEffect(() => {
    mountedRef.current = true
    refresh()
    return () => {
      mountedRef.current = false
    }
  }, [refresh])

  return { account, loading, error, refresh }
}

export default useAccount
