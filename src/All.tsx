import Blog from "./Blog";
import Home from "./Home";
import Music from "./Music";
import PoemPage from "./Poems/PoemPage";
import Projects from "./Projects";

const All = [
  {
    path: "/",
    component: Home,
    name: "home",
  },
  {
    path: "/music",
    component: Music,
    name: "music",
  },
  {
    path: "/projects",
    component: Projects,
    name: "projects",
  },
  {
    path: "/articles",
    component: Blog,
    name: "words",
  },
  {
    path: "/poems",
    component: PoemPage,
    name: "poems",
  },
];

export default All;
