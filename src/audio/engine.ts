export type Region = {
  id: string
  trackId: string
  startSec: number
  durationSec: number
  buffer?: AudioBuffer | null
  bufferOffset?: number
}

export class AudioEngine {
  audioCtx: AudioContext
  masterGain: GainNode
  tracksMap: Map<string, { gain: GainNode; effectsNode?: AudioNode }> = new Map()
  scheduled: Array<{ source: AudioBufferSourceNode; stopAt: number }> = []
  onTimeUpdate?: (playbackTime: number) => void
  rafId?: number
  playStartTimeAbs?: number
  playStartOffsetSec = 0
  isPlaying = false
  pausedAtOffsetSec?: number

  constructor() {
    this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
    this.masterGain = this.audioCtx.createGain()
    this.masterGain.gain.value = 1
    this.masterGain.connect(this.audioCtx.destination)
  }

  ensureTrack(trackId: string, volume = 1) {
    if (!this.tracksMap.has(trackId)) {
      const g = this.audioCtx.createGain()
      g.gain.value = volume
      g.connect(this.masterGain)
      this.tracksMap.set(trackId, { gain: g })
    }
    return this.tracksMap.get(trackId)!
  }

  createEffectsChain(trackId: string) {
    const t = this.ensureTrack(trackId)
    // simple chain: gain -> low -> mid -> high -> compressor -> destination
    const low = this.audioCtx.createBiquadFilter(); low.type = 'lowshelf'; low.frequency.value = 200
    const mid = this.audioCtx.createBiquadFilter(); mid.type = 'peaking'; mid.frequency.value = 1000; mid.Q.value = 1
    const high = this.audioCtx.createBiquadFilter(); high.type = 'highshelf'; high.frequency.value = 5000
    const comp = this.audioCtx.createDynamicsCompressor()
    // connect: gain -> low -> mid -> high -> comp -> master
    t.gain.disconnect()
    t.gain.connect(low)
    low.connect(mid); mid.connect(high); high.connect(comp); comp.connect(this.masterGain)
    t.effectsNode = comp
    console.debug('[DEBUG][AudioEngine]:', { action: 'create_effects_chain', details: { trackId } })
    return { low, mid, high, comp }
  }

  setEffectParam(trackId: string, effectName: string, param: string, value: number) {
    const t = this.tracksMap.get(trackId)
    if (!t) return
    const node = (t as any)[effectName] as AudioNode | undefined
    if (!node) return
    try {
      ;(node as any)[param].value = value
      console.debug('[DEBUG][AudioEngine]:', { action: 'set_effect_param', details: { trackId, effectName, param, value } })
    } catch (err) {
      console.debug('[DEBUG][AudioEngine]:', { action: 'set_effect_param_error', details: { trackId, effectName, param, value, error: String(err) } })
    }
  }

  setTrackVolume(trackId: string, volLinear: number) {
    const t = this.ensureTrack(trackId)
    t.gain.gain.value = volLinear
  }

  async schedulePlayback(regions: Region[], startSec: number, projectStartOffsetSec = 0) {
    // Ensure audio context is running (some browsers start suspended until a user gesture resumes it)
    try {
      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume()
        console.debug('[DEBUG][AudioEngine]:', { action: 'resume_audio_context' })
      }
    } catch (err) {
      console.debug('[DEBUG][AudioEngine]:', { action: 'resume_error', details: { error: String(err) } })
    }

    this.stopAllScheduled()
    const now = this.audioCtx.currentTime
    this.playStartTimeAbs = now
    this.playStartOffsetSec = projectStartOffsetSec
    this.isPlaying = true
    console.debug('[DEBUG][Playback]:', { action: 'start', details: { cursorTime: startSec, scheduleAtAudioTime: now, regionCount: regions.length, audioCtxState: this.audioCtx.state } })

    for (const region of regions) {
      const track = this.ensureTrack(region.trackId)
      if (!region.buffer) continue
      const regionStartRelative = region.startSec - startSec
      const startAt = now + Math.max(0, regionStartRelative)
      const src = this.audioCtx.createBufferSource()
      src.buffer = region.buffer
      src.connect(track.gain)
      const offset = region.bufferOffset || 0
      try {
        src.start(startAt, offset)
      } catch (e) {
        // some browsers may throw if start params are invalid
        try { src.start(startAt) } catch {}
      }
      const stopAt = startAt + region.durationSec
      try { src.stop(stopAt) } catch {}
      this.scheduled.push({ source: src, stopAt })
    }
    this.rafTick()
  }

  pause() {
    // pausing: stop scheduled, remember offset
    this.pausedAtOffsetSec = this.getPlaybackTime()
    this.stopAllScheduled()
    this.isPlaying = false
    console.debug('[DEBUG][Playback]:', { action: 'pause', details: { pausedAt: this.pausedAtOffsetSec } })
  }

  resume() {
    if (this.pausedAtOffsetSec == null) return
    console.debug('[DEBUG][Playback]:', { action: 'resume', details: { resumeFrom: this.pausedAtOffsetSec } })
    // Scheduling should be orchestrated by caller: gather regions and call schedulePlayback with startSec = pausedAtOffsetSec
  }

  rafTick() {
    const update = () => {
      const playbackTime = this.getPlaybackTime()
      if (this.onTimeUpdate) this.onTimeUpdate(playbackTime)
      this.rafId = requestAnimationFrame(update)
    }
    this.rafId = requestAnimationFrame(update)
  }

  getPlaybackTime() {
    if (!this.playStartTimeAbs) return 0
    return this.playStartOffsetSec + (this.audioCtx.currentTime - this.playStartTimeAbs)
  }

  stopAllScheduled() {
    if (this.rafId) cancelAnimationFrame(this.rafId)
    this.rafId = undefined
    for (const s of this.scheduled) {
      try { s.source.stop() } catch {}
    }
    this.scheduled = []
    this.playStartTimeAbs = undefined
  }
}
