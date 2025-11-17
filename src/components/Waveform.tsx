import { useEffect, useRef } from 'react'
import { computePeaks } from '../lib/waveform'
import type { Region } from '../state/projectStore'

export default function Waveform({ region, width, height = 56 }: { region: Region; width: number; height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = Math.max(1, Math.floor(width))
    canvas.height = height
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = 'rgba(0,255,255,0.08)'
    ctx.strokeStyle = 'rgba(0,255,255,0.35)'
    ctx.lineWidth = 1

    if (!region.buffer) {
      // placeholder
      ctx.fillRect(0, height / 4, canvas.width, height / 2)
      return
    }

    try {
      const peaks = computePeaks(region.buffer, Math.max(1, Math.floor(region.buffer.length / canvas.width)))
      const middle = height / 2
      ctx.beginPath()
      for (let i = 0; i < peaks.length; i++) {
        const x = (i / peaks.length) * canvas.width
        const h = peaks[i] * height
        ctx.moveTo(x, middle - h / 2)
        ctx.lineTo(x, middle + h / 2)
      }
      ctx.stroke()
    } catch (err) {
      console.debug('[DEBUG][Waveform]:', { action: 'render_error', details: { regionId: region.id, error: String(err) } })
    }
  }, [region, width, height])

  return <canvas ref={canvasRef} style={{ display: 'block', width, height }} />
}
