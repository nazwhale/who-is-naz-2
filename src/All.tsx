import Blog from "./Blog";
import Home from "./Home";

const All = [
  {
    path: "/",
    component: Home,
    name: "home",
  },
  {
    path: "/articles",
    component: Blog,
    name: "articles",
  },
];

export default All;
