// compute peaks for waveform rendering
export function computePeaks(buffer: AudioBuffer, samplesPerPeak = 1024) {
  const channelData = buffer.getChannelData(0)
  const peaks: number[] = []
  const len = channelData.length
  for (let i = 0; i < len; i += samplesPerPeak) {
    let max = 0
    const end = Math.min(i + samplesPerPeak, len)
    for (let j = i; j < end; j++) {
      const v = Math.abs(channelData[j])
      if (v > max) max = v
    }
    peaks.push(max)
  }
  return peaks
}
