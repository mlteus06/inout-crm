import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import type { Account } from '../lib/leads'
import { getAccountForUser } from '../lib/leads'

const useAccount = () => {
  const { session } = useAuth()
  const [account, setAccount] = useState<Account | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    if (!session?.user?.id) {
      setAccount(null)
      setLoading(false)
      return
    }

    setLoading(true)
    const { account: acct, error: fetchError } = await getAccountForUser(session.user.id)
    setAccount(acct)
    setError(fetchError)
    setLoading(false)
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id])

  return { account, loading, error, refresh }
}

export default useAccount
