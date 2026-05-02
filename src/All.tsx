import Blog from "./Blog";
import Home from "./Home";
import PoemPage from "./Poems/PoemPage";
import Projects from "./Projects";

const All = [
  {
    path: "/",
    component: Home,
    name: "home",
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
  {
    path: "https://whoisnaz.bandcamp.com/",
    name: "listen",
    external: true,
  },
];

export default All;
