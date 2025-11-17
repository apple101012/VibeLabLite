import { useState, useEffect } from 'react'
import { supabase } from './lib/supabaseClient'
import { Session } from '@supabase/supabase-js'
import Auth from './components/Auth'
import Studio from './components/Studio'

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const missingEnv = !((import.meta as any).env?.VITE_SUPABASE_URL) || !((import.meta as any).env?.VITE_SUPABASE_ANON_KEY)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then((res: any) => {
      const session = res?.data?.session ?? null
      setSession(session)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_: any, session: any) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="h-full">
      {missingEnv && (
        <div className="bg-yellow-600 text-black px-4 py-2 text-sm text-center">
          Warning: Supabase environment variables are not set. App is running in offline mode.
        </div>
      )}
      {!session ? <Auth /> : <Studio session={session} />}
    </div>
  )
}

export default App
