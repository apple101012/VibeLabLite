import React, { createContext, useContext, useReducer } from 'react'

export type Region = {
  id: string
  trackId: string
  startSec: number
  durationSec: number
  buffer?: AudioBuffer | null
  bufferOffset?: number
  fileName?: string
}

export type Track = {
  id: string
  name: string
  type?: 'beat' | 'vocal'
  volume: number
  muted?: boolean
  solo?: boolean
  regions: Region[]
}

type State = {
  tracks: Track[]
  playheadSec: number
  isPlaying: boolean
  bpm: number
}

const initialState: State = { tracks: [], playheadSec: 0, isPlaying: false, bpm: 140 }

type Action =
  | { type: 'ADD_TRACK'; payload: Track }
  | { type: 'REORDER_TRACK'; payload: { fromIndex: number; toIndex: number } }
  | { type: 'ADD_REGION'; payload: Region }
  | { type: 'MOVE_REGION'; payload: { regionId: string; trackId: string; startSec: number } }
  | { type: 'SPLIT_REGION'; payload: { regionId: string; atSec: number } }
  | { type: 'TRIM_REGION'; payload: { regionId: string; newStart?: number; newDuration?: number } }
  | { type: 'DELETE_REGION'; payload: { regionId: string } }
  | { type: 'DUPLICATE_REGION'; payload: { regionId: string; newId: string; offsetSec?: number } }
  | { type: 'COPY_REGION'; payload: { regionId: string } }
  | { type: 'PASTE_REGION'; payload: { trackId: string; startSec: number } }
  | { type: 'SET_PLAYHEAD'; payload: { sec: number } }
  | { type: 'SET_PLAYING'; payload: { playing: boolean } }
  | { type: 'SET_TRACK_VOLUME'; payload: { trackId: string; volume: number } }
  | { type: 'TOGGLE_TRACK_MUTE'; payload: { trackId: string } }
  | { type: 'TOGGLE_TRACK_SOLO'; payload: { trackId: string } }
  | { type: 'DELETE_TRACK'; payload: { trackId: string } }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_TRACK':
      // Prevent adding duplicate tracks with the same id (helps during StrictMode double-mount)
      if (state.tracks.find(t => t.id === action.payload.id)) {
        console.debug('[DEBUG][ProjectStore]:', { action: 'add_track_ignored_duplicate', details: { trackId: action.payload.id } })
        return state
      }
      return { ...state, tracks: [...state.tracks, action.payload] }

    case 'REORDER_TRACK': {
      const { fromIndex, toIndex } = action.payload
      const arr = [...state.tracks]
      const [moved] = arr.splice(fromIndex, 1)
      arr.splice(toIndex, 0, moved)
      console.debug('[DEBUG][ProjectStore]:', { action: 'reorder_track', details: { fromIndex, toIndex, trackId: moved?.id } })
      return { ...state, tracks: arr }
    }

    case 'ADD_REGION':
      return { ...state, tracks: state.tracks.map(t => (t.id === action.payload.trackId ? { ...t, regions: [...t.regions, action.payload] } : t)) }

    case 'MOVE_REGION': {
      const { regionId, trackId, startSec } = action.payload
      console.debug('[DEBUG][ProjectStore]:', { action: 'move_region', details: { regionId, toTrack: trackId, startSec } })
      return { ...state, tracks: state.tracks.map(t => ({ ...t, regions: t.regions.map(r => (r.id === regionId ? { ...r, trackId, startSec } : r)) })) }
    }

    case 'SPLIT_REGION': {
      const { regionId, atSec } = action.payload
      const newTracks = state.tracks.map(t => ({ ...t, regions: [...t.regions] }))
      for (const t of newTracks) {
        const idx = t.regions.findIndex(r => r.id === regionId)
        if (idx >= 0) {
          const r = t.regions[idx]
          const offset = atSec - r.startSec
          if (offset <= 0 || offset >= r.durationSec) return state
          const left: Region = { ...r, id: r.id + '_L', durationSec: offset }
          const right: Region = { ...r, id: r.id + '_R', startSec: atSec, durationSec: r.durationSec - offset, bufferOffset: (r.bufferOffset || 0) + offset }
          t.regions.splice(idx, 1, left, right)
          console.debug('[DEBUG][ProjectStore]:', { action: 'split_region', details: { regionId, atSec } })
          break
        }
      }
      return { ...state, tracks: newTracks }
    }

    case 'TRIM_REGION': {
      const { regionId, newStart, newDuration } = action.payload
      const newTracks = state.tracks.map(t => ({ ...t, regions: t.regions.map(r => (r.id === regionId ? { ...r, startSec: newStart ?? r.startSec, durationSec: newDuration ?? r.durationSec } : r)) }))
      console.debug('[DEBUG][ProjectStore]:', { action: 'trim_region', details: { regionId, newStart, newDuration } })
      return { ...state, tracks: newTracks }
    }

    case 'DELETE_REGION':
      console.debug('[DEBUG][ProjectStore]:', { action: 'delete_region', details: { regionId: action.payload.regionId } })
      return { ...state, tracks: state.tracks.map(t => ({ ...t, regions: t.regions.filter(r => r.id !== action.payload.regionId) })) }

    case 'DUPLICATE_REGION': {
      const { regionId, newId, offsetSec } = action.payload
      const newTracks = state.tracks.map(t => {
        const found = t.regions.find(r => r.id === regionId)
        if (!found) return t
        const duplicate: Region = { ...found, id: newId, startSec: found.startSec + (offsetSec || 0) }
        return { ...t, regions: [...t.regions, duplicate] }
      })
      console.debug('[DEBUG][ProjectStore]:', { action: 'duplicate_region', details: { regionId, newId } })
      return { ...state, tracks: newTracks }
    }

    case 'COPY_REGION': {
      const { regionId } = action.payload
      let clipboard: Region | null = null
      for (const t of state.tracks) {
        const r = t.regions.find(r => r.id === regionId)
        if (r) { clipboard = { ...r }; break }
      }
      ;(window as any).__vibelab_clipboard = clipboard
      console.debug('[DEBUG][ProjectStore]:', { action: 'copy_region', details: { regionId, clipboardPresent: !!clipboard } })
      return state
    }

    case 'PASTE_REGION': {
      const cb = (window as any).__vibelab_clipboard as Region | undefined
      if (!cb) return state
      const newRegion: Region = { ...cb, id: 'r_' + Date.now(), trackId: action.payload.trackId, startSec: action.payload.startSec }
      console.debug('[DEBUG][ProjectStore]:', { action: 'paste_region', details: { fromRegionId: cb.id, newRegionId: newRegion.id, trackId: action.payload.trackId, startSec: action.payload.startSec } })
      return { ...state, tracks: state.tracks.map(t => (t.id === action.payload.trackId ? { ...t, regions: [...t.regions, newRegion] } : t)) }
    }

    case 'SET_PLAYHEAD':
      console.debug('[DEBUG][ProjectStore]:', { action: 'set_playhead', details: { sec: action.payload.sec } })
      return { ...state, playheadSec: action.payload.sec }

    case 'SET_PLAYING':
      console.debug('[DEBUG][ProjectStore]:', { action: 'set_playing', details: { playing: action.payload.playing } })
      return { ...state, isPlaying: action.payload.playing }

    case 'SET_TRACK_VOLUME':
      return { ...state, tracks: state.tracks.map(t => (t.id === action.payload.trackId ? { ...t, volume: action.payload.volume } : t)) }

    case 'TOGGLE_TRACK_MUTE':
      return { ...state, tracks: state.tracks.map(t => (t.id === action.payload.trackId ? { ...t, muted: !t.muted } : t)) }

    case 'TOGGLE_TRACK_SOLO':
      return { ...state, tracks: state.tracks.map(t => (t.id === action.payload.trackId ? { ...t, solo: !t.solo } : t)) }

    case 'DELETE_TRACK': {
      const { trackId } = action.payload
      console.debug('[DEBUG][ProjectStore]:', { action: 'delete_track', details: { trackId } })
      return { ...state, tracks: state.tracks.filter(t => t.id !== trackId) }
    }

    default:
      return state
  }
}

const ProjectStateContext = createContext<State | null>(null)
export const ProjectDispatchContext = createContext<React.Dispatch<Action> | null>(null)

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  return (
    <ProjectStateContext.Provider value={state}>
      <ProjectDispatchContext.Provider value={dispatch}>{children}</ProjectDispatchContext.Provider>
    </ProjectStateContext.Provider>
  )
}

export function useProjectState() {
  const ctx = useContext(ProjectStateContext)
  if (!ctx) throw new Error('useProjectState must be used within ProjectProvider')
  return ctx
}

export function useProjectDispatch() {
  const ctx = useContext(ProjectDispatchContext)
  if (!ctx) throw new Error('useProjectDispatch must be used within ProjectProvider')
  return ctx
}
