import Blog from "./Blog";
import Home from "./Home";
import WeatherMusic from "./WeatherMusic";

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
  {
    path: "/weathermusic",
    component: WeatherMusic,
    name: "weathermusic",
  },
];

export default All;
