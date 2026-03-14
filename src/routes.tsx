import Blog from "./Blog";
import Post from "./Blog/Post.tsx";
import Home from "./Home/index.tsx";
import Projects from "./Projects/index.tsx";
import WeatherMusic from "./WeatherMusic/index.tsx";
import MusicWorlds from "./MusicWorlds/index.tsx";

const routes = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/projects",
    element: <Projects />,
  },
  {
    path: "/articles",
    element: <Blog />,
  },
  {
    path: "/articles/:slug",
    element: <Post />,
  },
  {
    path: "/tags/:tag",
    element: <Blog />,
  },
  {
    path: "/weathermusic",
    element: <WeatherMusic />,
  },
  {
    path: "/a-second-of-your-time",
    element: <MusicWorlds />,
  },
];

export default routes;
