import Blog from "./Blog";
import Home from "./Home";

const All = [
  {
    path: "/",
    component: Home,
    name: "projects",
  },
  {
    path: "/articles",
    component: Blog,
    name: "articles",
  },
  {
    path: "https://nazmalik.bandcamp.com",
    name: "bandcamp",
    external: true,
  },
];

export default All;
