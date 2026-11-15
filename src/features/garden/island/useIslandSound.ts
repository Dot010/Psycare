"use client";

import { useEffect, useRef, useState } from "react";
import { WATER_EVENT } from "@/features/garden/water";
import { audioContext, playDrop, unlockAudio } from "@/lib/sound";
import { useLocalStorage } from "@/lib/useLocalStorage";

/** A mesma escolha de som do resto do app (o jardim e os lembretes). */
const SOUND_KEY = "psycare:sound:v1";

interface Ambience {
  master: GainNode;
  rain: GainNode;
  stop: () => void;
}

function noise(ctx: AudioContext, seconds: number, brown: boolean): AudioBuffer {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < data.length; i++) {
    const w = Math.random() * 2 - 1;
    if (brown) {
      last = (last + 0.02 * w) / 1.02;
      data[i] = last * 3.5;
    } else data[i] = w;
  }
  return buffer;
}

/** Mar, vento que vai e volta e um canal para a chuva. Tudo gerado no navegador, sem arquivos. */
function startAmbience(ctx: AudioContext): Ambience {
  const master = ctx.createGain();
  master.gain.value = 0;
  master.gain.setTargetAtTime(1, ctx.currentTime, 0.6);
  master.connect(ctx.destination);
  const brown = noise(ctx, 3, true);
  const white = noise(ctx, 1, false);

  const sea = ctx.createBufferSource();
  sea.buffer = brown;
  sea.loop = true;
  const seaFilter = ctx.createBiquadFilter();
  seaFilter.type = "lowpass";
  seaFilter.frequency.value = 600;
  const seaGain = ctx.createGain();
  seaGain.gain.value = 0.3;
  // As ondas: o volume sobe e desce devagar.
  const swell = ctx.createOscillator();
  const swellDepth = ctx.createGain();
  swell.frequency.value = 0.12;
  swellDepth.gain.value = 0.1;
  swell.connect(swellDepth).connect(seaGain.gain);
  sea.connect(seaFilter).connect(seaGain).connect(master);

  const wind = ctx.createBufferSource();
  wind.buffer = white;
  wind.loop = true;
  const windFilter = ctx.createBiquadFilter();
  windFilter.type = "bandpass";
  windFilter.frequency.value = 420;
  windFilter.Q.value = 0.7;
  const windGain = ctx.createGain();
  windGain.gain.value = 0.02;
  const gust = ctx.createOscillator();
  const gustDepth = ctx.createGain();
  gust.frequency.value = 0.07;
  gustDepth.gain.value = 0.015;
  gust.connect(gustDepth).connect(windGain.gain);
  wind.connect(windFilter).connect(windGain).connect(master);

  const rainSource = ctx.createBufferSource();
  rainSource.buffer = white;
  rainSource.loop = true;
  const rainFilter = ctx.createBiquadFilter();
  rainFilter.type = "highpass";
  rainFilter.frequency.value = 1400;
  const rain = ctx.createGain();
  rain.gain.value = 0;
  rainSource.connect(rainFilter).connect(rain).connect(master);

  const sources = [sea, swell, wind, gust, rainSource];
  sources.forEach((source) => source.start());
  return {
    master,
    rain,
    stop: () => {
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.2);
      window.setTimeout(() => {
        sources.forEach((source) => source.stop());
        master.disconnect();
      }, 600);
    },
  };
}

function envelope(gain: GainNode, t0: number, peak: number, attack: number, decay: number) {
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(peak, t0 + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + attack + decay);
}

/** Passarinho: 2 a 4 piados curtos que sobem. */
function chirp(ctx: AudioContext, out: AudioNode) {
  const n = 2 + Math.floor(Math.random() * 3);
  const base = 2600 + Math.random() * 1400;
  for (let k = 0; k < n; k++) {
    const t0 = ctx.currentTime + k * (0.11 + Math.random() * 0.05);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(base, t0);
    osc.frequency.exponentialRampToValueAtTime(base * (1.3 + Math.random() * 0.3), t0 + 0.07);
    envelope(gain, t0, 0.04, 0.01, 0.08);
    osc.connect(gain).connect(out);
    osc.start(t0);
    osc.stop(t0 + 0.12);
  }
}

/** Grilo: três estalinhos agudos. */
function cricket(ctx: AudioContext, out: AudioNode) {
  for (let k = 0; k < 3; k++) {
    const t0 = ctx.currentTime + k * 0.06;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = 4300 + Math.random() * 300;
    envelope(gain, t0, 0.018, 0.005, 0.035);
    osc.connect(gain).connect(out);
    osc.start(t0);
    osc.stop(t0 + 0.05);
  }
}

/** Sininho de três notas (a água chegou nos canteiros). */
function bell(ctx: AudioContext, out: AudioNode) {
  (
    [
      [1318, 0.05],
      [1976, 0.03],
      [2637, 0.015],
    ] as const
  ).forEach(([freq, volume]) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    envelope(gain, ctx.currentTime, volume, 0.005, 1.4);
    osc.connect(gain).connect(out);
    osc.start();
    osc.stop(ctx.currentTime + 1.5);
  });
}

/** "Ronronar" da raposa: dois tons curtos subindo. */
function purr(ctx: AudioContext, out: AudioNode) {
  (
    [
      [660, 0],
      [880, 0.09],
    ] as const
  ).forEach(([freq, delay]) => {
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, t0);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.25, t0 + 0.08);
    envelope(gain, t0, 0.04, 0.01, 0.14);
    osc.connect(gain).connect(out);
    osc.start(t0);
    osc.stop(t0 + 0.2);
  });
}

/**
 * Sons da ilha: mar, vento, passarinhos de dia, grilos à noite, chuva quando chove,
 * sininho quando a água cai nos canteiros e um som de carinho na raposa.
 * Começa desligado; a escolha é a mesma do resto do app.
 */
export function useIslandSound({ night, raining }: { night: boolean; raining: boolean }) {
  const [enabled, setEnabled] = useLocalStorage<boolean>(SOUND_KEY, false);
  const ambience = useRef<Ambience | null>(null);
  // Som ligado de outra visita: o navegador só libera depois do primeiro toque na tela.
  const [unlocked, setUnlocked] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    const ctx = audioContext();
    if (!ctx) {
      const unlock = () => {
        unlockAudio();
        setUnlocked((value) => value + 1);
      };
      window.addEventListener("pointerdown", unlock, { once: true });
      return () => window.removeEventListener("pointerdown", unlock);
    }
    const amb = startAmbience(ctx);
    ambience.current = amb;
    // Passarinhos de dia, grilos à noite, cada um no seu ritmo.
    let timer = 0;
    const next = () => {
      timer = window.setTimeout(
        () => {
          if (ctx.state === "running") (night ? cricket : chirp)(ctx, amb.master);
          next();
        },
        night ? 400 + Math.random() * 1200 : 2500 + Math.random() * 6000,
      );
    };
    next();
    const onWater = () => {
      playDrop();
      bell(ctx, amb.master);
    };
    window.addEventListener(WATER_EVENT, onWater);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(WATER_EVENT, onWater);
      amb.stop();
      ambience.current = null;
    };
  }, [enabled, night, unlocked]);

  // A chuva entra e sai devagar.
  useEffect(() => {
    const amb = ambience.current;
    const ctx = audioContext();
    if (amb && ctx) amb.rain.gain.setTargetAtTime(raining ? 0.09 : 0, ctx.currentTime, raining ? 1.2 : 2);
  }, [raining, enabled, night]);

  const toggle = () => {
    // O toque no botão é o gesto que libera o som no navegador.
    unlockAudio();
    setEnabled(!enabled);
  };

  const pet = () => {
    const ctx = audioContext();
    if (enabled && ctx && ambience.current) purr(ctx, ambience.current.master);
  };

  return { enabled, toggle, pet };
}
