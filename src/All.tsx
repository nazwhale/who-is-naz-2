import Blog from "./Blog";
import Home from "./Home";
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
    path: "https://whoisnaz.bandcamp.com/",
    name: "listen",
    external: true,
  },
];

export default All;
