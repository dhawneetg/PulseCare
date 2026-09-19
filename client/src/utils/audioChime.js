/**
 * PulseCare Synthesized Web Audio Ringtone
 * Uses standard dual-frequency telephone chime (440Hz + 480Hz)
 * Works 100% offline without external audio files.
 */

let ringtoneCtx = null;
let ringtoneInterval = null;

export function playIncomingRingtone() {
  try {
    stopIncomingRingtone();
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    ringtoneCtx = new AudioCtx();

    const playPulse = () => {
      if (!ringtoneCtx || ringtoneCtx.state === 'closed') return;
      if (ringtoneCtx.state === 'suspended') {
        ringtoneCtx.resume();
      }

      const now = ringtoneCtx.currentTime;
      const osc1 = ringtoneCtx.createOscillator();
      const osc2 = ringtoneCtx.createOscillator();
      const gain = ringtoneCtx.createGain();

      osc1.type = 'sine';
      osc1.frequency.value = 440; // Standard telecom frequency A4
      osc2.type = 'sine';
      osc2.frequency.value = 480; // Standard telecom frequency B4

      // Double-pulse chime ring (ring-ring ... pause ... ring-ring)
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.25, now + 0.08);
      gain.gain.setValueAtTime(0.25, now + 0.65);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);

      gain.gain.setValueAtTime(0.001, now + 0.95);
      gain.gain.exponentialRampToValueAtTime(0.25, now + 1.03);
      gain.gain.setValueAtTime(0.25, now + 1.6);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.7);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ringtoneCtx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.75);
      osc2.stop(now + 1.75);
    };

    playPulse();
    ringtoneInterval = setInterval(playPulse, 3800);
  } catch (err) {
    console.warn('[PulseCare] Web Audio chime warning:', err);
  }
}

export function stopIncomingRingtone() {
  if (ringtoneInterval) {
    clearInterval(ringtoneInterval);
    ringtoneInterval = null;
  }
  if (ringtoneCtx) {
    try {
      ringtoneCtx.close();
    } catch (e) {
      // ignore
    }
    ringtoneCtx = null;
  }
}
