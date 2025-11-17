interface LyricsPanelProps {
  lyrics: string
  onChange: (lyrics: string) => void
}

export default function LyricsPanel({ lyrics, onChange }: LyricsPanelProps) {
  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-vibelab-cyan">Lyrics</h2>
        <button 
          className="btn-icon text-xs"
          title="Toggle Lyrics (L)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </button>
      </div>

      <textarea
        value={lyrics}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-vibelab-charcoal border border-vibelab-cyan border-opacity-20 rounded-lg p-4 text-white placeholder-gray-500 resize-none focus:outline-none focus:border-vibelab-cyan focus:ring-1 focus:ring-vibelab-cyan transition-all custom-scrollbar"
        placeholder="Write your lyrics here...

Verse 1:

Chorus:

Verse 2:

Bridge:"
        style={{ caretColor: '#00E5FF' }}
      />

      <div className="mt-4 text-xs text-gray-500 text-center">
        {lyrics.split('\n').length} lines
      </div>
    </div>
  )
}
