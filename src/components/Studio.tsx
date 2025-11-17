import { useState, useEffect } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'
import Toolbar from './Toolbar'
import Timeline from './Timeline'
import LyricsPanel from './LyricsPanel'
import EffectsPanel from './EffectsPanel'
import MigrationNotice from './MigrationNotice'

interface StudioProps {
  session: Session
}

export default function Studio({ session }: StudioProps) {
  const [projectName, setProjectName] = useState('Untitled Project')
  const [lyrics, setLyrics] = useState('')
  const [showEffects, setShowEffects] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null)
  const [migrationNeeded, setMigrationNeeded] = useState<string | null>(null)

  useEffect(() => {
    // Load or create a new project
    loadProject()
  }, [])

  const loadProject = async () => {
    // Try to load the user's most recent project
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', session.user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      // If PostgREST responds with a 404 it likely means the table doesn't exist.
      if ((error as any).status === 404 || (error.message || '').includes('Could not find the table')) {
        console.error('Projects table not found:', error)
        setMigrationNeeded('projects')
        return
      }
    }

    if (data && !error) {
      setCurrentProjectId(data.id)
      setProjectName(data.name)
      setLyrics(data.lyrics || '')
    }
  }

  const handleSave = async () => {
    if (!currentProjectId) {
      // Create new project
      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: session.user.id,
          name: projectName,
          lyrics,
        })
        .select()
        .single()

      if (data && !error) {
        setCurrentProjectId(data.id)
        alert('Project saved successfully!')
      } else {
        // Show migration notice if table missing
        if ((error as any)?.status === 404 || (error?.message || '').includes('Could not find the table')) {
          console.error('Projects table not found during insert:', error)
          setMigrationNeeded('projects')
          return
        }
        alert('Error saving project: ' + error?.message)
      }
    } else {
      // Update existing project
      const { error } = await supabase
        .from('projects')
        .update({
          name: projectName,
          lyrics,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentProjectId)

      if (!error) {
        alert('Project saved successfully!')
      } else {
        if ((error as any)?.status === 404 || (error?.message || '').includes('Could not find the table')) {
          console.error('Projects table not found during update:', error)
          setMigrationNeeded('projects')
          return
        }
        alert('Error saving project: ' + error.message)
      }
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="h-full flex flex-col">
      {migrationNeeded && (
        <MigrationNotice details={`Table missing: ${migrationNeeded}. Run migrations in supabase/migrations/001_create_schema.sql`} onClose={() => setMigrationNeeded(null)} />
      )}
      {/* Top Toolbar */}
      <Toolbar
        projectName={projectName}
        onProjectNameChange={setProjectName}
        onSave={handleSave}
        onSignOut={handleSignOut}
        isRecording={isRecording}
        isPlaying={isPlaying}
        onRecord={() => setIsRecording(!isRecording)}
        onPlay={() => setIsPlaying(!isPlaying)}
        onStop={() => {
          setIsPlaying(false)
          setIsRecording(false)
        }}
        onToggleEffects={() => setShowEffects(!showEffects)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Effects Panel (Left Side - Collapsible) */}
        {showEffects && (
          <div className="w-80 bg-vibelab-charcoal border-r border-gray-800">
            <EffectsPanel />
          </div>
        )}

        {/* Timeline Section */}
        <div className="flex-1 flex flex-col">
          <Timeline 
            projectId={currentProjectId}
            userId={session.user.id}
            isPlaying={isPlaying}
            isRecording={isRecording}
          />
        </div>

        {/* Lyrics Panel (Right Side) */}
        <div className="w-96 bg-vibelab-charcoal border-l border-vibelab-cyan border-opacity-30">
          <LyricsPanel lyrics={lyrics} onChange={setLyrics} />
        </div>
      </div>
    </div>
  )
}
