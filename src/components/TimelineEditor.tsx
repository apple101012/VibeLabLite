import React, { useEffect, useState } from 'react'
import { useProjectState, useProjectDispatch } from '../state/projectStore'
import TrackEditor from './TrackEditor'
import { AudioEngine } from '../audio/engine'
import { recordTake } from '../audio/record'

export default function TimelineEditor() {
  const state = useProjectState()
  const dispatch = useProjectDispatch()
  const [engine] = useState(() => new AudioEngine())
  const [localPlayhead, setLocalPlayhead] = useState(0)
  const pixelsPerSecond = 80

  // Debug: expose tracks and regions to console to diagnose invisible timeline
  console.debug('[DEBUG][TimelineEditor]:', { tracksCount: state.tracks.length, tracks: state.tracks })

  useEffect(() => {
    engine.onTimeUpdate = (t) => {
      setLocalPlayhead(t)
      // keep a lightweight global for regions/double-click handlers to use
      ;(window as any).__vibelab_playhead_sec = t
    }
    return () => engine.stopAllScheduled()
  }, [engine])

  useEffect(() => {
    // create a default beat track if none
    if (state.tracks.length === 0) {
      dispatch({ type: 'ADD_TRACK', payload: { id: 't_beat', name: 'Beat', type: 'beat', volume: 1, regions: [] } })
      dispatch({ type: 'ADD_TRACK', payload: { id: 't_v1', name: 'Vocal 1', type: 'vocal', volume: 1, regions: [] } })
    }
  }, [])

  // expose helpers for TrackEditor to call without importing dispatch directly
  useEffect(() => {
    ;(window as any).__vibelab_toggle_mute = (trackId: string) => dispatch({ type: 'TOGGLE_TRACK_MUTE', payload: { trackId } })
    ;(window as any).__vibelab_toggle_solo = (trackId: string) => dispatch({ type: 'TOGGLE_TRACK_SOLO', payload: { trackId } })
    ;(window as any).__vibelab_set_volume = (trackId: string, volume: number) => { dispatch({ type: 'SET_TRACK_VOLUME', payload: { trackId, volume } }); engine.setTrackVolume(trackId, volume) }
    ;(window as any).__vibelab_reorder = (from: number, to: number) => dispatch({ type: 'REORDER_TRACK', payload: { fromIndex: from, toIndex: to } })
    ;(window as any).__vibelab_delete_track = (trackId: string) => dispatch({ type: 'DELETE_TRACK', payload: { trackId } })
    return () => {
      delete (window as any).__vibelab_toggle_mute
      delete (window as any).__vibelab_toggle_solo
      delete (window as any).__vibelab_set_volume
      delete (window as any).__vibelab_reorder
      delete (window as any).__vibelab_delete_track
    }
  }, [dispatch, engine])

  const play = async () => {
    const regions = gatherRegionsToPlay(state, state.playheadSec)
    console.debug('[DEBUG][Playback]: play_pressed', { cursor: state.playheadSec, regionsFound: regions.length })
    try {
      await engine.schedulePlayback(regions, state.playheadSec, state.playheadSec)
      dispatch({ type: 'SET_PLAYING', payload: { playing: true } })
      console.debug('[DEBUG][Playback]:', { action: 'play_started', details: { cursor: state.playheadSec, regions: regions.length } })
    } catch (err) {
      console.error('Playback scheduling error:', err)
      console.debug('[DEBUG][Playback]:', { action: 'play_error', details: { error: String(err) } })
    }
  }

  const stop = () => {
    engine.stopAllScheduled()
    dispatch({ type: 'SET_PLAYING', payload: { playing: false } })
    console.debug('[DEBUG][Playback]:', { action: 'stop_clicked', details: {} })
  }

  const onRulerClick = (e: React.MouseEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    const x = e.clientX - rect.left
    const sec = x / pixelsPerSecond
    dispatch({ type: 'SET_PLAYHEAD', payload: { sec } })
    console.debug('[DEBUG][Timeline]:', { action: 'ruler_click', details: { sec } })
  }

  const startRecordingOnTrack = async (trackId: string) => {
    console.debug('[DEBUG][Recording]:', { action: 'start', details: { trackId, startAt: state.playheadSec } })
    const recorder = await recordTake(engine, trackId, state.playheadSec, (r) => {
      dispatch({ type: 'ADD_REGION', payload: r })
      console.debug('[DEBUG][Recording]:', { action: 'region_added', details: { regionId: r.id, trackId: r.trackId, duration: r.durationSec } })
    })
    // demo auto-stop after 5s
    setTimeout(() => {
      recorder.stop()
      console.debug('[DEBUG][Recording]:', { action: 'auto_stop', details: { trackId } })
    }, 5000)
  }

  useEffect(() => {
    // listen for split requests from Region double-click
    const onSplit = (e: any) => {
      const { regionId, atSec } = e.detail
      dispatch({ type: 'SPLIT_REGION', payload: { regionId, atSec } })
    }
    window.addEventListener('vibelab:split_region', onSplit as EventListener)
    return () => window.removeEventListener('vibelab:split_region', onSplit as EventListener)
  }, [dispatch])

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <div />
        <label className="btn btn-primary text-sm cursor-pointer">
          Import Beat
          <input type="file" accept="audio/*" onChange={async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0]
            if (!file) return
            // create or find beat track
            let beat = state.tracks.find((x: any) => x.type === 'beat')
            let trackId = beat?.id
            if (!beat) {
              trackId = 't_beat_' + Date.now()
              dispatch({ type: 'ADD_TRACK', payload: { id: trackId, name: 'Beat', type: 'beat', volume: 1, regions: [] } })
            }

            // decode file into AudioBuffer using engine's context so playback works immediately
            try {
              const ab = await file.arrayBuffer()
              const decoded = await engine.audioCtx.decodeAudioData(ab)
              const region = {
                id: 'r_' + Date.now(),
                trackId: trackId as string,
                startSec: 0,
                durationSec: decoded.duration,
                fileName: file.name,
                buffer: decoded,
              }
              dispatch({ type: 'ADD_REGION', payload: region })
              console.debug('[DEBUG][Timeline]:', { action: 'import_beat', details: { trackId, regionId: region.id, fileName: file.name, duration: decoded.duration } })
            } catch (err) {
              console.error('Failed to decode imported file:', err)
              console.debug('[DEBUG][Timeline]:', { action: 'import_error', details: { error: String(err) } })
            }
          }} className="hidden" />
        </label>
      </div>
      <div className="ruler h-10 bg-gray-900 relative mb-2" onClick={onRulerClick}>
        <div style={{ position: 'absolute', left: state.playheadSec * pixelsPerSecond, top: 0, bottom: 0, width: 2, background: '#00ffff' }} />
      </div>
      <div className="text-xs text-gray-300 mb-2">Time: {localPlayhead.toFixed(2)}s</div>

      <div className="controls flex gap-2 mb-4">
        <button className="btn btn-primary" onClick={play}>Play</button>
        <button className="btn" onClick={stop}>Stop</button>
        <button className="btn" onClick={() => dispatch({ type: 'SET_PLAYHEAD', payload: { sec: 0 } })}>Rewind</button>
      </div>

      <div className="tracks space-y-2">
        {(state.tracks as any[]).map((t: any) => (
          <div key={t.id} className="flex items-center gap-4">
            <TrackEditor track={t} pixelsPerSecond={pixelsPerSecond} />
            <div className="flex flex-col gap-2">
              <button className="btn btn-sm" onClick={() => startRecordingOnTrack(t.id)}>Record 5s</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function gatherRegionsToPlay(state: any, playheadSec: number) {
  const all: any[] = []
  const isSoloActive = state.tracks.some((x: any) => x.solo)
  for (const t of state.tracks) {
    if (t.muted) continue
    if (isSoloActive && !t.solo) continue
    for (const r of t.regions) {
      if (r.startSec + r.durationSec > playheadSec && r.startSec < playheadSec + 3600) all.push(r)
    }
  }
  return all
}
