interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
  // add other VITE_ env vars here as needed
  [key: string]: string | undefined
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
