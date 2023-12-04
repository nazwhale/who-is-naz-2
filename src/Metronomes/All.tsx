// Metronomes.ts
import StandardMetronome from "./Standard.tsx";
import CircleOfFifthsMetronome from "./CircleOfFifths.tsx";

const All = [
  {
    path: "/online-metronome",
    component: StandardMetronome,
    name: "basic metronome",
  },
  {
    path: "/circle-of-fifths-metronome",
    component: CircleOfFifthsMetronome,
    name: "circle of fifths metronome",
  },
];

export default All;
