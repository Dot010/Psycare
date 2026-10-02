/**
 * Sons do jardim gerados no navegador (Web Audio), sem arquivos de áudio.
 * Navegadores só liberam som depois de um toque do usuário, por isso `unlockAudio` é chamado no botão de som.
 */

let context: AudioContext | null = null;
let ambient: { stop: () => void } | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!context) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    context = new Ctor();
  }
  return context;
}

export function unlockAudio(): void {
  const ctx = getContext();
  if (ctx && ctx.state === "suspended") void ctx.resume();
}

function noiseBuffer(ctx: AudioContext, seconds: number): AudioBuffer {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

/** "Plim" de uma gota de água caindo. */
export function playDrop(): void {
  const ctx = getContext();
  if (!ctx || ctx.state !== "running") return;
  const now = ctx.currentTime;

  const tone = ctx.createOscillator();
  const toneGain = ctx.createGain();
  tone.type = "sine";
  tone.frequency.setValueAtTime(1150, now);
  tone.frequency.exponentialRampToValueAtTime(380, now + 0.14);
  toneGain.gain.setValueAtTime(0.0001, now);
  toneGain.gain.exponentialRampToValueAtTime(0.22, now + 0.01);
  toneGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
  tone.connect(toneGain).connect(ctx.destination);
  tone.start(now);
  tone.stop(now + 0.25);

  const splash = ctx.createBufferSource();
  const splashFilter = ctx.createBiquadFilter();
  const splashGain = ctx.createGain();
  splash.buffer = noiseBuffer(ctx, 0.2);
  splashFilter.type = "bandpass";
  splashFilter.frequency.value = 2400;
  splashGain.gain.setValueAtTime(0.0001, now + 0.62);
  splashGain.gain.exponentialRampToValueAtTime(0.1, now + 0.64);
  splashGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
  splash.connect(splashFilter).connect(splashGain).connect(ctx.destination);
  splash.start(now);
  splash.stop(now + 0.9);
}

/** Riacho suave ao fundo: ruído filtrado com volume que sobe e desce devagar. */
export function startAmbient(): void {
  const ctx = getContext();
  if (!ctx || ambient) return;

  const source = ctx.createBufferSource();
  source.buffer = noiseBuffer(ctx, 3);
  source.loop = true;

  const low = ctx.createBiquadFilter();
  low.type = "lowpass";
  low.frequency.value = 900;
  const band = ctx.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = 520;
  band.Q.value = 0.6;

  const gain = ctx.createGain();
  gain.gain.value = 0.05;
  const lfo = ctx.createOscillator();
  const lfoDepth = ctx.createGain();
  lfo.frequency.value = 0.18;
  lfoDepth.gain.value = 0.02;
  lfo.connect(lfoDepth).connect(gain.gain);

  source.connect(low).connect(band).connect(gain).connect(ctx.destination);
  source.start();
  lfo.start();

  ambient = {
    stop: () => {
      source.stop();
      lfo.stop();
      source.disconnect();
      ambient = null;
    },
  };
}

export function stopAmbient(): void {
  ambient?.stop();
}
