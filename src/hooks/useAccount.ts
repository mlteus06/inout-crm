import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getAccountForUser, type Account } from '../lib/leads'

const useAccount = () => {
  const { session } = useAuth()
  const [account, setAccount] = useState<Account | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    if (!session?.user?.id) {
      setAccount(null)
      setLoading(false)
      return
    }

    setLoading(true)
    const acct = await getAccountForUser(session.user.id)
    setAccount(acct)
    setLoading(false)
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id])

  return { account, loading, refresh }
}

export default useAccount
