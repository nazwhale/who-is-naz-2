import * as Tone from "tone";

// Synthesizer for regular beats
export const regularSynth = new Tone.Synth({
  oscillator: {
    type: "sine",
  },
  envelope: {
    attack: 0.005,
    decay: 0.1,
    sustain: 0,
    release: 0.1,
  },
}).toDestination();

// Synthesizer for the 4th beat
export const fourthBeatSynth = new Tone.Synth({
  oscillator: {
    type: "sine",
  },
  envelope: {
    attack: 0.005,
    decay: 0.1,
    sustain: 0,
    release: 0.2,
  },
}).toDestination();
