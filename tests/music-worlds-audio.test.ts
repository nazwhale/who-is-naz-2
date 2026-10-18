import assert from "node:assert/strict";
import test from "node:test";
import { extractOneSecondMono, findSoundStart } from "../src/MusicWorlds/wav.ts";

function audioFixture(channelCount = 1, duration = 3) {
  const sampleRate = 48000;
  const channels = Array.from({ length: channelCount }, () => new Float32Array(sampleRate * duration));
  return {
    sampleRate,
    length: channels[0].length,
    numberOfChannels: channelCount,
    getChannelData: (channel: number) => channels[channel],
  } as AudioBuffer;
}

function addSound(audio: AudioBuffer, start: number, end: number, channel = 0) {
  const samples = audio.getChannelData(channel);
  for (let i = Math.floor(start * audio.sampleRate); i < end * audio.sampleRate; i++) {
    samples[i] += 0.3 * Math.sin(i * 0.05);
  }
}

test("selection skips leading silence and quiet background noise with a short lead-in", () => {
  const audio = audioFixture();
  const samples = audio.getChannelData(0);
  for (let i = 0; i < samples.length; i++) samples[i] = 0.001 * Math.sin(i);
  addSound(audio, 1, 2);
  assert.ok(Math.abs(findSoundStart(audio) - 0.97) < 0.011);
});

test("detects a sound in either stereo channel without cancellation", () => {
  const audio = audioFixture(2);
  addSound(audio, 1, 2, 1);
  assert.ok(Math.abs(findSoundStart(audio) - 0.97) < 0.011);
});

test("silence, very quiet audio, and immediate sounds keep a start of zero", () => {
  const audio = audioFixture();
  assert.equal(findSoundStart(audio), 0);
  audio.getChannelData(0).fill(0.0001);
  assert.equal(findSoundStart(audio), 0);
  addSound(audio, 0, 1);
  assert.equal(findSoundStart(audio), 0);
});

test("short sounds near the end export a full second with trailing silence", () => {
  const audio = audioFixture();
  addSound(audio, 2.7, 2.9);
  const start = findSoundStart(audio);
  assert.ok(start > 2.6);
  const clip = extractOneSecondMono(audio, start);
  assert.equal(clip.length, audio.sampleRate);
  assert.ok(clip.some(sample => Math.abs(sample) > 0.1));
  assert.ok(clip.slice(audio.sampleRate / 2).every(sample => sample === 0));
});
