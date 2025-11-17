interface ToolbarProps {
  projectName: string
  onProjectNameChange: (name: string) => void
  onSave: () => void
  onSignOut: () => void
  isRecording: boolean
  isPlaying: boolean
  onRecord: () => void
  onPlay: () => void
  onStop: () => void
  onToggleEffects: () => void
}

export default function Toolbar({
  projectName,
  onProjectNameChange,
  onSave,
  onSignOut,
  isRecording,
  isPlaying,
  onRecord,
  onPlay,
  onStop,
  onToggleEffects,
}: ToolbarProps) {
  return (
    <div className="bg-vibelab-dark border-b border-vibelab-cyan border-opacity-30 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-vibelab-cyan">VibeLab</h1>
          <input
            type="text"
            value={projectName}
            onChange={(e) => onProjectNameChange(e.target.value)}
            className="input bg-vibelab-charcoal px-3 py-1 text-sm"
            placeholder="Project name"
          />
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onRecord}
            className={`btn-icon ${isRecording ? 'recording-pulse bg-red-500' : ''}`}
            title="Record (R)"
          >
            <svg
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="8" fill={isRecording ? 'white' : 'currentColor'} />
            </svg>
          </button>

          <button
            onClick={onPlay}
            className="btn-icon"
            title="Play/Pause (Space)"
          >
            {isPlaying ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <button
            onClick={onStop}
            className="btn-icon"
            title="Stop (S)"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" />
            </svg>
          </button>

          <div className="w-px h-8 bg-gray-700 mx-2"></div>

          <button
            onClick={onToggleEffects}
            className="btn btn-secondary text-sm"
            title="Effects"
          >
            Effects
          </button>

          <button
            onClick={onSave}
            className="btn btn-primary text-sm"
            title="Save (Ctrl+S)"
          >
            Save
          </button>

          <button
            onClick={onSignOut}
            className="btn btn-secondary text-sm"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
