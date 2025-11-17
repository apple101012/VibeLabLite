// TrackEditor: lightweight presentational component
import type { Track as T } from '../state/projectStore'
import Region from './Region'
import { useProjectDispatch } from '../state/projectStore'

export default function TrackEditor({ track, pixelsPerSecond = 100 }: { track: T; pixelsPerSecond?: number }) {
  const dispatch = useProjectDispatch()
  return (
    <div className="track border-b border-gray-800 py-3 px-3 flex items-start gap-4 min-h-[64px]">
      <div className="w-40 flex flex-col gap-2">
        <div className="text-sm font-medium text-white">{track.name}</div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <button className="btn btn-sm" onClick={() => { (window as any).__vibelab_toggle_mute && (window as any).__vibelab_toggle_mute(track.id); console.debug('[DEBUG][Track]:', { action: 'toggle_mute_clicked', details: { trackId: track.id } }) }}>M</button>
            <button className="btn btn-sm" onClick={() => { (window as any).__vibelab_toggle_solo && (window as any).__vibelab_toggle_solo(track.id); console.debug('[DEBUG][Track]:', { action: 'toggle_solo_clicked', details: { trackId: track.id } }) }}>S</button>
          </div>
          <div className="w-40">
            <input className="w-full" type="range" min={0} max={1} step={0.01} value={track.volume} onChange={(e) => { const v = Number((e.target as HTMLInputElement).value); (window as any).__vibelab_set_volume && (window as any).__vibelab_set_volume(track.id, v); console.debug('[DEBUG][Track]:', { action: 'volume_change', details: { trackId: track.id, volume: v } }) }} />
          </div>
          <div>
            <button className="btn btn-sm btn-danger" onClick={() => { if ((window as any).__vibelab_delete_track) { (window as any).__vibelab_delete_track(track.id) } else { dispatch({ type: 'DELETE_TRACK', payload: { trackId: track.id } }) } console.debug('[DEBUG][Track]:', { action: 'delete_clicked', details: { trackId: track.id } }) }}>Del</button>
          </div>
        </div>
      </div>

      <div className="flex-1 relative h-20 bg-vibelab-charcoal rounded">
        {track.regions.map(r => (
          <Region key={r.id} region={r} pixelsPerSecond={pixelsPerSecond} />
        ))}
      </div>
    </div>
  )
}
