export const SCORE_ID = "a-second-of-your-time-v2";
export const STEPS = 20;
export const STEP_SECONDS = 0.5;
export const VOICES = [
  { id: "soprano", label: "Soprano", initial: 72, min: 60, max: 84 },
  { id: "alto", label: "Alto", initial: 60, min: 48, max: 72 },
  { id: "tenor", label: "Tenor", initial: 48, min: 36, max: 60 },
  { id: "bass", label: "Bass", initial: 36, min: 24, max: 48 },
] as const;
export type VoiceId = (typeof VOICES)[number]["id"];
export type Cell = {
  voice: VoiceId;
  step_index: number;
  note: number | null;
  last_note?: number;
  revision: number;
};
export const cellKey = (voice: string, step: number) => `${voice}:${step}`;
export function noteName(note: number | null) {
  if (note === null) return "Rest";
  return `${
    ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"][note % 12]
  }${Math.floor(note / 12) - 1}`;
}

/** Schedule sound using the audio clock, keeping timer jitter out of the notes. */
export class ScorePlayer {
  private context: AudioContext | null = null;
  private timer: number | null = null;
  private nextTime = 0;
  private step = 0;
  private pendingFrames = new Set<number>();
  private generation = 0;

  async start(
    readCells: () => Map<string, Cell>,
    onStep: (step: number) => void,
  ) {
    this.stop();
    const generation = this.generation;
    const context = new AudioContext();
    this.context = context;
    try {
      await context.resume();
    } catch (error) {
      this.stop();
      throw error;
    }
    if (generation !== this.generation) return;
    this.nextTime = context.currentTime + 0.06;
    this.step = 0;
    const schedule = () => {
      // Background tabs can pause timers; resume on the current step without a burst of old notes.
      if (this.nextTime < context.currentTime - STEP_SECONDS) {
        const skipped = Math.ceil(
          (context.currentTime - this.nextTime) / STEP_SECONDS,
        );
        this.step = (this.step + skipped) % STEPS;
        this.nextTime += skipped * STEP_SECONDS;
      }
      while (this.nextTime < context.currentTime + 0.12) {
        const step = this.step;
        const time = this.nextTime;
        for (const voice of VOICES) {
          const note = readCells().get(cellKey(voice.id, step))?.note;
          if (note === null || note === undefined) continue;
          const oscillator = context.createOscillator();
          const gain = context.createGain();
          oscillator.type = "triangle";
          oscillator.frequency.value = 440 * 2 ** ((note - 69) / 12);
          gain.gain.setValueAtTime(0, time);
          gain.gain.linearRampToValueAtTime(0.055, time + 0.025);
          gain.gain.setValueAtTime(0.04, time + 0.3);
          gain.gain.linearRampToValueAtTime(0, time + 0.48);
          oscillator.connect(gain).connect(context.destination);
          oscillator.start(time);
          oscillator.stop(time + 0.49);
          oscillator.onended = () => {
            oscillator.disconnect();
            gain.disconnect();
          };
        }
        const frame = window.setTimeout(
          () => {
            this.pendingFrames.delete(frame);
            if (generation === this.generation) onStep(step);
          },
          Math.max(0, (time - context.currentTime) * 1000),
        );
        this.pendingFrames.add(frame);
        this.nextTime += STEP_SECONDS;
        this.step = (this.step + 1) % STEPS;
      }
    };
    schedule();
    this.timer = window.setInterval(schedule, 25);
  }

  stop() {
    this.generation++;
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
    this.pendingFrames.forEach(window.clearTimeout);
    this.pendingFrames.clear();
    if (this.context) void this.context.close().catch(() => {});
    this.context = null;
  }
}
