import StandardMetronome from "./Standard.tsx";
import CircleOfFifthsMetronome from "./CircleOfFifths.tsx";
import Blog from "../Blog";

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
  {
    path: "/articles",
    component: Blog,
    name: "articles",
  },
];

export default All;
