import React, { useRef, useState } from 'react'
import type { Region as R } from '../state/projectStore'
import { useProjectDispatch } from '../state/projectStore'
import Waveform from './Waveform'

export default function Region({ region, pixelsPerSecond = 100 }: { region: R; pixelsPerSecond?: number }) {
  const dispatch = useProjectDispatch()
  const ref = useRef<HTMLDivElement | null>(null)
  const isDraggingRef = useRef<boolean>(false)
  const startXRef = useRef<number>(0)
  const origStartRef = useRef<number>(region.startSec)
  const [isResizingLeft, setIsResizingLeft] = useState(false)
  const [isResizingRight, setIsResizingRight] = useState(false)

  const onPointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true
    startXRef.current = e.clientX
    origStartRef.current = (region as any).startSec
    ;(e.target as Element).setPointerCapture(e.pointerId)
    console.debug('[DEBUG][Region]:', { action: 'drag_start', details: { regionId: region.id, startSec: region.startSec } })
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return
    const dx = e.clientX - startXRef.current
    const dSec = dx / pixelsPerSecond
    const newStart = Math.max(0, origStartRef.current + dSec)
    dispatch({ type: 'MOVE_REGION', payload: { regionId: region.id, trackId: region.trackId, startSec: newStart } })
  }

  const onResizePointerDown = (side: 'left' | 'right') => (e: React.PointerEvent) => {
    if (side === 'left') setIsResizingLeft(true)
    else setIsResizingRight(true)
    startXRef.current = e.clientX
    origStartRef.current = (region as any).startSec
    ;(e.target as Element).setPointerCapture(e.pointerId)
    console.debug('[DEBUG][Region]:', { action: 'resize_start', details: { regionId: region.id, side } })
  }

  const onResizePointerMove = (e: React.PointerEvent) => {
    if (!isResizingLeft && !isResizingRight) return
    const dx = e.clientX - startXRef.current
    const dSec = dx / pixelsPerSecond
    if (isResizingLeft) {
      const newStart = Math.max(0, origStartRef.current + dSec)
      const newDuration = Math.max(0.05, region.durationSec - (newStart - region.startSec))
      dispatch({ type: 'TRIM_REGION', payload: { regionId: region.id, newStart, newDuration } })
    } else if (isResizingRight) {
      const newDuration = Math.max(0.05, region.durationSec + dSec)
      dispatch({ type: 'TRIM_REGION', payload: { regionId: region.id, newDuration } })
    }
  }

  const onResizePointerUp = (e: React.PointerEvent) => {
    if (isResizingLeft) setIsResizingLeft(false)
    if (isResizingRight) setIsResizingRight(false)
    try { (e.target as Element).releasePointerCapture(e.pointerId) } catch {}
    console.debug('[DEBUG][Region]:', { action: 'resize_end', details: { regionId: region.id, startSec: region.startSec, duration: region.durationSec } })
  }

  const onPointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false
    try { ;(e.target as Element).releasePointerCapture(e.pointerId) } catch {}
    console.debug('[DEBUG][Region]:', { action: 'drag_end', details: { regionId: region.id, startSec: region.startSec } })
  }

  const onDoubleClick = () => {
    // split at current playhead (ask store for playhead or use global)
    const playhead = (window as any).__vibelab_playhead_sec ?? 0
    // dispatch split via custom event (since Region doesn't import dispatch directly to keep separation)
    const ev = new CustomEvent('vibelab:split_region', { detail: { regionId: region.id, atSec: playhead } })
    window.dispatchEvent(ev)
    console.debug('[DEBUG][Region]:', { action: 'split_request', details: { regionId: region.id, atSec: playhead } })
  }

  return (
    <div
      ref={ref}
      className="region bg-vibelab-cyan/10 border border-vibelab-cyan rounded relative overflow-hidden"
      style={{ left: region.startSec * pixelsPerSecond, width: region.durationSec * pixelsPerSecond, position: 'absolute', height: 56 }}
      onPointerDown={onPointerDown}
      onPointerMove={(e) => { onPointerMove(e); onResizePointerMove(e) }}
      onPointerUp={(e) => { onPointerUp(e); onResizePointerUp(e) }}
      onDoubleClick={onDoubleClick}
    >
      <div className="handle-left absolute left-0 w-3 h-full cursor-ew-resize z-10" onPointerDown={onResizePointerDown('left')} />
      <div className="content absolute left-0 right-0 top-0 bottom-0 flex items-center px-2">
        <Waveform region={region} width={region.durationSec * pixelsPerSecond} />
      </div>
      <div className="handle-right absolute right-0 w-3 h-full cursor-ew-resize z-10" onPointerDown={onResizePointerDown('right')} />
    </div>
  )
}
