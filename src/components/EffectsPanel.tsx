import { useState } from 'react'

export default function EffectsPanel() {
  const [autotune, setAutotune] = useState(0.5)
  const [reverb, setReverb] = useState(0.25)
  const [compression, setCompression] = useState<'light' | 'medium' | 'heavy'>('light')
  const [eqLow, setEqLow] = useState(0)
  const [eqMid, setEqMid] = useState(0)
  const [eqHigh, setEqHigh] = useState(0)
  const [noiseReduction, setNoiseReduction] = useState(false)

  return (
    <div className="h-full flex flex-col p-4 overflow-y-auto custom-scrollbar">
      <h2 className="text-xl font-bold text-vibelab-cyan mb-6">Vocal Effects</h2>

      {/* Autotune */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Autotune
          <span className="text-vibelab-cyan ml-2">{Math.round(autotune * 100)}%</span>
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={autotune}
          onChange={(e) => setAutotune(parseFloat(e.target.value))}
          className="slider w-full"
        />
      </div>

      {/* Reverb */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Reverb
          <span className="text-vibelab-cyan ml-2">{Math.round(reverb * 100)}%</span>
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={reverb}
          onChange={(e) => setReverb(parseFloat(e.target.value))}
          className="slider w-full"
        />
      </div>

      {/* Compression */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Compression</label>
        <div className="flex gap-2">
          <button
            onClick={() => setCompression('light')}
            className={`btn flex-1 text-sm ${
              compression === 'light' ? 'btn-primary' : 'btn-secondary'
            }`}
          >
            Light
          </button>
          <button
            onClick={() => setCompression('medium')}
            className={`btn flex-1 text-sm ${
              compression === 'medium' ? 'btn-primary' : 'btn-secondary'
            }`}
          >
            Medium
          </button>
          <button
            onClick={() => setCompression('heavy')}
            className={`btn flex-1 text-sm ${
              compression === 'heavy' ? 'btn-primary' : 'btn-secondary'
            }`}
          >
            Heavy
          </button>
        </div>
      </div>

      {/* EQ */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-4">Equalizer</label>
        
        <div className="mb-4">
          <label className="block text-xs text-gray-400 mb-1">
            Low <span className="text-vibelab-cyan">{eqLow > 0 ? '+' : ''}{eqLow} dB</span>
          </label>
          <input
            type="range"
            min="-12"
            max="12"
            step="1"
            value={eqLow}
            onChange={(e) => setEqLow(parseInt(e.target.value))}
            className="slider w-full"
          />
        </div>

        <div className="mb-4">
          <label className="block text-xs text-gray-400 mb-1">
            Mid <span className="text-vibelab-cyan">{eqMid > 0 ? '+' : ''}{eqMid} dB</span>
          </label>
          <input
            type="range"
            min="-12"
            max="12"
            step="1"
            value={eqMid}
            onChange={(e) => setEqMid(parseInt(e.target.value))}
            className="slider w-full"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">
            High <span className="text-vibelab-cyan">{eqHigh > 0 ? '+' : ''}{eqHigh} dB</span>
          </label>
          <input
            type="range"
            min="-12"
            max="12"
            step="1"
            value={eqHigh}
            onChange={(e) => setEqHigh(parseInt(e.target.value))}
            className="slider w-full"
          />
        </div>
      </div>

      {/* Noise Reduction */}
      <div className="mb-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={noiseReduction}
            onChange={(e) => setNoiseReduction(e.target.checked)}
            className="w-4 h-4 bg-vibelab-charcoal border-gray-700 rounded text-vibelab-cyan focus:ring-vibelab-cyan"
          />
          <span className="text-sm font-medium">Noise Reduction</span>
        </label>
      </div>

      {/* Preset Buttons */}
      <div className="mt-auto pt-4 border-t border-gray-800">
        <button className="btn btn-secondary w-full mb-2">
          Reset to Default
        </button>
        <button className="btn btn-primary w-full">
          Apply Effects
        </button>
      </div>
    </div>
  )
}
