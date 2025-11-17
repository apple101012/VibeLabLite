import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/database'

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || ''
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || ''

// If environment variables are missing, don't throw — export a safe stub
// so the app can render in development and surface a friendly message to users.
let supabase: ReturnType<typeof createClient> | any = null

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.error('Missing Supabase environment variables. Running in offline mode.')

  // Minimal stub implementing the subset of the Supabase client used by the app.
  supabase = {
    auth: {
      getSession: async () => ({ data: { session: null } }),
      onAuthStateChange: (_cb: any) => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: async () => ({ data: null, error: null }),
      signUp: async () => ({ data: null, error: null }),
      signOut: async () => ({ data: null, error: null }),
      signInWithOAuth: async () => ({ data: null, error: null }),
    },
    from: () => ({ select: async () => ({ data: null, error: null }), insert: async () => ({ data: null, error: null }), update: async () => ({ data: null, error: null }), delete: async () => ({ data: null, error: null }) }),
    storage: { from: () => ({ upload: async () => ({ data: null, error: null }), download: async () => ({ data: null, error: null }) }) },
  }
} else {
  supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
}

export { supabase }
