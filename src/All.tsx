import Blog from "./Blog";
import Home from "./Home";
import MusicWorlds from "./MusicWorlds";
import WeatherMusic from "./WeatherMusic";

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
    path: "/weathermusic",
    component: WeatherMusic,
    name: "weathermusic",
  },
  {
    path: "/a-second-of-your-time",
    component: MusicWorlds,
    name: "a second of your time",
  },
];

export default All;
