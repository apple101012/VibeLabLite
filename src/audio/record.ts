import { AudioEngine } from './engine'
import { Region } from './engine'

export async function recordTake(engine: AudioEngine, trackId: string, startAtSec: number, onComplete: (r: Region) => void) {
  console.debug('[DEBUG][Recording]:', { action: 'start_request', details: { trackId, startAtSec } })
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  const mediaRecorder = new MediaRecorder(stream)
  const chunks: Blob[] = []

  mediaRecorder.ondataavailable = (e) => {
    if (e.data && e.data.size) chunks.push(e.data)
  }

  mediaRecorder.onstop = async () => {
    const blob = new Blob(chunks, { type: 'audio/webm' })
    console.debug('[DEBUG][Recording]:', { action: 'stop', details: { blobSize: blob.size } })
    const arrayBuffer = await blob.arrayBuffer()
    const audioBuffer = await engine.audioCtx.decodeAudioData(arrayBuffer)
    console.debug('[DEBUG][Recording]:', { action: 'decoded', details: { duration: audioBuffer.duration } })
    const newRegion: Region = {
      id: 'r_' + Date.now(),
      trackId,
      startSec: startAtSec,
      durationSec: audioBuffer.duration,
      buffer: audioBuffer,
      bufferOffset: 0,
    }
    onComplete(newRegion)
    stream.getTracks().forEach(t => t.stop())
  }

  mediaRecorder.start()
  return {
    stop: () => { mediaRecorder.stop() }
  }
}
