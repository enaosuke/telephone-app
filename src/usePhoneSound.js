// Web Audio API でボタン押下音（DTMF風）を鳴らす
let audioContext = null

function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
  }
  return audioContext
}

// 簡易DTMF風の周波数 (Hz)
const DTMF_FREQS = {
  '1': [697, 1209], '2': [697, 1336], '3': [697, 1477],
  '4': [770, 1209], '5': [770, 1336], '6': [770, 1477],
  '7': [852, 1209], '8': [852, 1336], '9': [852, 1477],
  '*': [941, 1209], '0': [941, 1336], '#': [941, 1477]
}

export function playButtonSound(key) {
  const ctx = getAudioContext()
  if (ctx.state === 'suspended') ctx.resume()

  const freqs = DTMF_FREQS[key] || [800, 1200]
  const duration = 0.12
  const gainNode = ctx.createGain()
  gainNode.gain.setValueAtTime(0.25, ctx.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)
  gainNode.connect(ctx.destination)

  freqs.forEach((freq) => {
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = freq
    osc.connect(gainNode)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + duration)
  })
}

/** 発信音を2回鳴らす（コール音っぽい） */
export function playCallSound() {
  const ctx = getAudioContext()
  const start = () => {
    if (ctx.state === 'suspended') {
      ctx.resume().then(() => scheduleBeeps())
    } else {
      scheduleBeeps()
    }
  }

  const scheduleBeeps = () => {
    const t0 = ctx.currentTime
    const beepLen = 0.35
    const gap = 0.25

    ;[0, beepLen + gap].forEach((offset) => {
      const gainNode = ctx.createGain()
      gainNode.gain.setValueAtTime(0.3, t0 + offset)
      gainNode.gain.exponentialRampToValueAtTime(0.01, t0 + offset + beepLen)
      gainNode.connect(ctx.destination)
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = 480
      osc.connect(gainNode)
      osc.start(t0 + offset)
      osc.stop(t0 + offset + beepLen)
    })
  }

  start()
}
