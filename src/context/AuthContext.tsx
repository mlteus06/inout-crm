import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

type SessionUser = {
  id: string
  email?: string
}

type AuthContextValue = {
  session: { user: SessionUser; access_token?: string } | null
  loading: boolean
}

const AuthContext = createContext<AuthContextValue>({ session: null, loading: true })

export const useAuth = () => useContext(AuthContext)

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<AuthContextValue['session']>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const client = supabase
    if (!client) {
      setLoading(false)
      return
    }

    const timeoutId = window.setTimeout(() => {
      setSession(null)
      setLoading(false)
    }, 6000)

    const hydrateSession = async () => {
      try {
        const { data, error } = await client.auth.getSession()
        if (error || !data.session) {
          setSession(null)
          return
        }

        const { data: userData, error: userError } = await client.auth.getUser()
        if (userError || !userData.user) {
          await client.auth.signOut()
          setSession(null)
          return
        }

        setSession((data.session as AuthContextValue['session']) ?? null)
        if (data.session.user?.id && data.session.user?.email) {
          await client.from('profiles').upsert({
            user_id: data.session.user.id,
            email: data.session.user.email,
          })
          await client.rpc('accept_invites')
        }
      } catch {
        setSession(null)
      } finally {
        window.clearTimeout(timeoutId)
        setLoading(false)
      }
    }

    hydrateSession()

    const { data: subscription } = client.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession((nextSession as AuthContextValue['session']) ?? null)
      if (nextSession?.user?.id && nextSession?.user?.email) {
        await client.from('profiles').upsert({
          user_id: nextSession.user.id,
          email: nextSession.user.email,
        })
        await client.rpc('accept_invites')
      }
    })

    return () => {
      window.clearTimeout(timeoutId)
      subscription.subscription.unsubscribe()
    }
  }, [])

  const value = useMemo(() => ({ session, loading }), [session, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
