// Metronomes.ts
import StandardMetronome from "./Standard.tsx";
import CircleOfFifthsMetronome from "./CircleOfFifths.tsx";

const All = [
  {
    path: "/online-metronome",
    component: StandardMetronome,
    name: "Basic Metronome",
  },
  {
    path: "/circle-of-fifths-metronome",
    component: CircleOfFifthsMetronome,
    name: "Circle of Fifths Metronome",
  },
];

export default All;
