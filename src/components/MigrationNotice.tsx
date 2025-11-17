interface Props {
  onClose?: () => void
  details?: string
}

const PROJECTS_SQL = `-- Create projects table (from supabase/migrations/001_create_schema.sql)
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  lyrics TEXT,
  bpm INTEGER DEFAULT 140,
  key TEXT DEFAULT 'C',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
`;

export default function MigrationNotice({ onClose, details }: Props) {
  const copySQL = async () => {
    try {
      await navigator.clipboard.writeText(PROJECTS_SQL)
      alert('Migration SQL copied to clipboard — paste into Supabase SQL Editor')
    } catch (e) {
      alert('Could not copy to clipboard. See supabase/migrations/001_create_schema.sql in the repo.')
    }
  }

  return (
    <div className="fixed inset-4 z-50 flex items-start justify-center">
      <div className="w-full max-w-2xl bg-vibelab-charcoal border border-vibelab-cyan p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-vibelab-cyan">Database Migration Required</h3>
          <button className="text-gray-400" onClick={onClose}>✕</button>
        </div>
        <p className="mt-3 text-sm text-gray-300">
          The Supabase REST layer returned a 404 for the `projects` table. This usually means the database schema
          migrations have not been applied to your Supabase project. Run the migration SQL in the Supabase SQL Editor
          to create the required tables and RLS policies.
        </p>

        {details && (
          <pre className="mt-3 p-3 bg-black text-xs text-gray-200 rounded overflow-auto">{details}</pre>
        )}

        <div className="mt-4 flex gap-3">
          <button className="btn btn-primary" onClick={copySQL}>Copy migration SQL</button>
          <a href="#" onClick={(e) => { e.preventDefault(); window.open('https://app.supabase.com/', '_blank') }} className="btn btn-secondary">Open Supabase</a>
          <a href="/supabase/migrations/001_create_schema.sql" className="btn" onClick={(e) => e.preventDefault()}>See migration file in repo</a>
        </div>
      </div>
    </div>
  )
}
