import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import * as Tone from 'tone'

interface TimelineProps {
  projectId: string | null
  userId: string
  isPlaying: boolean
  isRecording: boolean
}

export default function Timeline({ projectId, userId, isPlaying, isRecording }: TimelineProps) {
  const [beatFile, setBeatFile] = useState<File | null>(null)
  const [vocalTracks, setVocalTracks] = useState<string[]>([])
  const beatPlayerRef = useRef<Tone.Player | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (projectId) {
      loadTracks()
    }
  }, [projectId])

  useEffect(() => {
    if (isPlaying && beatPlayerRef.current) {
      beatPlayerRef.current.start()
    } else if (!isPlaying && beatPlayerRef.current) {
      beatPlayerRef.current.stop()
    }
  }, [isPlaying])

  useEffect(() => {
    if (isRecording) {
      startRecording()
    } else if (recorderRef.current && recorderRef.current.state === 'recording') {
      stopRecording()
    }
  }, [isRecording])

  const loadTracks = async () => {
    if (!projectId) return

    const { data, error } = await supabase
      .from('tracks')
      .select('*')
      .eq('project_id', projectId)

    if (error) {
      if ((error as any).status === 404 || (error.message || '').includes('Could not find the table')) {
        console.error('Tracks table not found:', error)
        alert('Database migration required: projects/tracks table not found. See SETUP.md')
        return
      }
    }
    if (data && !error) {
      // Load beat and vocal tracks
      const rows = data as any[]
      const beatTrack = rows.find((t: any) => t.type === 'beat')
      const vocals = rows.filter((t: any) => t.type === 'vocal')

      if (beatTrack) {
        // Download beat from storage
        const { data: beatData } = await supabase.storage
          .from('projects')
          .download(beatTrack.file_path)

        if (beatData) {
          const url = URL.createObjectURL(beatData)
          beatPlayerRef.current = new Tone.Player(url).toDestination()
        }
      }

      setVocalTracks(vocals.map((v: any) => v.file_path))
    }
  }

  const handleBeatUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !projectId) return

    setBeatFile(file)

    try {
      // Upload to Supabase Storage
      // Storage policy expects files under the user's folder: {userId}/{projectId}/...
      const filePath = `${userId}/${projectId}/beats/${file.name}`
      const { error: uploadError } = await supabase.storage
        .from('projects')
        .upload(filePath, file)

      if (uploadError) {
        console.error('Storage upload error:', uploadError)
        alert(`Upload failed: ${uploadError.message || JSON.stringify(uploadError)}`)
        return
      }

      // Save track metadata
      const { error: dbError } = await supabase
        .from('tracks')
        .insert({
          project_id: projectId,
          type: 'beat',
          file_path: filePath,
          position: 0,
        })

      if (dbError) {
        console.error('DB insert error for beat:', dbError)
        if ((dbError as any)?.status === 404 || (dbError?.message || '').includes('Could not find the table')) {
          alert('Database schema missing: tracks table not found. See SETUP.md')
        } else {
          alert('Error saving track metadata: ' + (dbError.message || JSON.stringify(dbError)))
        }
        return
      }

      // Load the beat for playback (use local file preview)
      const url = URL.createObjectURL(file)
      beatPlayerRef.current = new Tone.Player(url).toDestination()
    } catch (err) {
      console.error('Unexpected error during beat upload:', err)
      alert('Unexpected error during upload. See console for details.')
    }
  }

  const startRecording = async () => {
    try {
      await Tone.start() // Initialize audio context
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      const chunks: BlobPart[] = []

      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data)
      }

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        await saveVocalTrack(blob)
      }

      mediaRecorder.start()
      recorderRef.current = mediaRecorder
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Could not access microphone')
    }
  }

  const stopRecording = () => {
    if (recorderRef.current) {
      recorderRef.current.stop()
      recorderRef.current.stream.getTracks().forEach(track => track.stop())
    }
  }

  const saveVocalTrack = async (blob: Blob) => {
    if (!projectId) return

    try {
      const fileName = `vocal_${Date.now()}.webm`
      const filePath = `${userId}/${projectId}/vocals/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('projects')
        .upload(filePath, blob)

      if (uploadError) {
        console.error('Vocal upload error:', uploadError)
        alert(`Upload failed: ${uploadError.message || JSON.stringify(uploadError)}`)
        return
      }

      const { error: dbError } = await supabase
        .from('tracks')
        .insert({
          project_id: projectId,
          type: 'vocal',
          file_path: filePath,
          position: 0,
        })

      if (dbError) {
        console.error('DB insert error for vocal:', dbError)
        if ((dbError as any)?.status === 404 || (dbError?.message || '').includes('Could not find the table')) {
          alert('Database schema missing: tracks table not found. See SETUP.md')
        } else {
          alert('Error saving vocal metadata: ' + (dbError.message || JSON.stringify(dbError)))
        }
        return
      }

      setVocalTracks(prev => [...prev, filePath])
      alert('Vocal track saved!')
    } catch (err) {
      console.error('Unexpected error saving vocal:', err)
      alert('Unexpected error saving vocal track. See console for details.')
    }
  }

  return (
    <div className="flex-1 bg-vibelab-dark p-4 overflow-y-auto custom-scrollbar">
      <div className="space-y-4">
        {/* Beat Track */}
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium text-vibelab-cyan">Beat Track</h3>
            <label className="btn btn-primary text-sm cursor-pointer">
              Import Beat
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleBeatUpload}
                className="hidden"
              />
            </label>
          </div>
          {beatFile ? (
            <div className="h-24 bg-vibelab-charcoal rounded-lg flex items-center justify-center border border-vibelab-cyan border-opacity-30">
              <div className="text-center">
                <p className="text-sm text-vibelab-cyan">{beatFile.name}</p>
                <div className="w-full h-16 bg-gradient-to-r from-vibelab-cyan to-blue-500 opacity-30 rounded mt-2"></div>
              </div>
            </div>
          ) : (
            <div className="h-24 bg-vibelab-charcoal rounded-lg flex items-center justify-center border border-dashed border-gray-600">
              <p className="text-gray-500">Drag and drop a beat or click Import</p>
            </div>
          )}
        </div>

        {/* Vocal Tracks */}
        <div className="card">
          <h3 className="text-lg font-medium text-vibelab-cyan mb-2">Vocal Tracks</h3>
          {vocalTracks.length > 0 ? (
            <div className="space-y-2">
              {vocalTracks.map((_track, index) => (
                <div
                  key={index}
                  className="h-16 bg-vibelab-charcoal rounded-lg flex items-center px-4 border border-vibelab-cyan border-opacity-20"
                >
                  <span className="text-sm">Vocal {index + 1}</span>
                  <div className="flex-1 mx-4 h-12 bg-gradient-to-r from-purple-500 to-pink-500 opacity-30 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-16 bg-vibelab-charcoal rounded-lg flex items-center justify-center border border-dashed border-gray-600">
              <p className="text-gray-500">
                {isRecording ? 'Recording...' : 'Press R to record vocals'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
