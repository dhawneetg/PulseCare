/**
 * PulseCare Telemedicine Demo MediaStream Generator
 * Generates an active simulated video stream of the Hub Doctor (Dr. Rajesh Sharma, MBBS MD)
 * with animated medical telemetry, audio waveform, and stethoscope simulation.
 * Ensures video calls display immediately in 1-device hackathon evaluations or when remote peer is pending.
 */

let cachedDoctorStream = null;

export function getDoctorMockStream() {
  if (cachedDoctorStream && cachedDoctorStream.active) {
    return cachedDoctorStream;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext('2d');
  let frame = 0;
  let isRunning = true;

  const draw = () => {
    if (!isRunning) return;
    frame++;

    // Background clinic telemedicine suite
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 640, 480);

    // Radial gradient lighting
    const grad = ctx.createRadialGradient(320, 200, 30, 320, 240, 320);
    grad.addColorStop(0, '#1e293b');
    grad.addColorStop(1, '#090d16');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 640, 480);

    // Top Tele-Hub Header Bar
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(0, 0, 640, 48);
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.fillText('● PULSECARE TELE-HUB 3 • LIVE CONSULTATION', 20, 30);

    // Doctor Body (Medical Coat & Scrubs)
    ctx.fillStyle = '#0284c7'; // Teal scrubs
    ctx.beginPath();
    ctx.ellipse(320, 390, 150, 130, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f8fafc'; // White lab coat overlay
    ctx.beginPath();
    ctx.moveTo(210, 350);
    ctx.lineTo(260, 480);
    ctx.lineTo(190, 480);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(430, 350);
    ctx.lineTo(380, 480);
    ctx.lineTo(450, 480);
    ctx.closePath();
    ctx.fill();

    // Stethoscope
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(320, 320, 50, 0.1, Math.PI - 0.1);
    ctx.stroke();

    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.arc(320, 375, 12, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = '#fbcfe8';
    ctx.beginPath();
    ctx.arc(320, 210, 65, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.arc(320, 185, 68, Math.PI, Math.PI * 2);
    ctx.fill();

    // Eyes with blinking
    const isBlinking = frame % 120 > 115;
    ctx.fillStyle = '#0f172a';
    if (isBlinking) {
      ctx.fillRect(296, 200, 14, 2);
      ctx.fillRect(330, 200, 14, 2);
    } else {
      ctx.beginPath();
      ctx.arc(303, 201, 4, 0, Math.PI * 2);
      ctx.arc(337, 201, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Gentle talking mouth animation
    const mouthHeight = Math.abs(Math.sin(frame * 0.12)) * 10 + 3;
    ctx.fillStyle = '#b91c1c';
    ctx.beginPath();
    ctx.ellipse(320, 238, 12, mouthHeight, 0, 0, Math.PI * 2);
    ctx.fill();

    // Doctor Identification Plate
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.roundRect ? ctx.roundRect(210, 410, 220, 36, 8) : ctx.fillRect(210, 410, 220, 36);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.fillText('Dr. Rajesh Sharma (MBBS, MD)', 224, 428);
    ctx.fillStyle = '#059669';
    ctx.font = 'bold 10px system-ui, sans-serif';
    ctx.fillText('● Senior Medical Officer • Active Voice', 224, 441);

    // Audio frequency visualizer in bottom right corner
    ctx.fillStyle = '#10b981';
    for (let i = 0; i < 6; i++) {
      const barH = Math.abs(Math.sin((frame + i * 10) * 0.22)) * 20 + 4;
      ctx.fillRect(570 + i * 9, 450 - barH, 6, barH);
    }

    requestAnimationFrame(draw);
  };

  draw();

  const stream = canvas.captureStream(25);

  // Add subtle carrier audio track so WebRTC & video players treat as full AV stream
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      const audioCtx = new AudioContextClass();
      const dest = audioCtx.createMediaStreamDestination();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      gain.gain.value = 0.0001; // inaudible
      osc.connect(gain);
      gain.connect(dest);
      osc.start();
      dest.stream.getAudioTracks().forEach((track) => stream.addTrack(track));
    }
  } catch (e) {
    console.warn('[PulseCare] Audio track synthesis note:', e);
  }

  cachedDoctorStream = stream;
  return stream;
}
