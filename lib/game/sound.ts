"use client";

type SoundKind = "correct" | "wrong" | "timeup";

let audioContext: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioContext) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioContext = new Ctor();
  }
  return audioContext;
}

function beep(ctx: AudioContext, frequency: number, startTime: number, duration: number, gain = 0.15) {
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  gainNode.gain.value = gain;
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  oscillator.start(startTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  oscillator.stop(startTime + duration);
}

export function playSound(kind: SoundKind) {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  if (kind === "correct") {
    beep(ctx, 660, now, 0.12);
    beep(ctx, 880, now + 0.1, 0.15);
  } else if (kind === "wrong") {
    beep(ctx, 220, now, 0.18, 0.18);
  } else {
    beep(ctx, 520, now, 0.15);
    beep(ctx, 520, now + 0.2, 0.15);
    beep(ctx, 520, now + 0.4, 0.2);
  }
}
