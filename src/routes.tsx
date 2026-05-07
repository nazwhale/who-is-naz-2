import Blog from "./Blog";
import Post from "./Blog/Post.tsx";
import Home from "./Home/index.tsx";
import Music from "./Music/index.tsx";
import Admin from "./Admin/index.tsx";
import NotFound from "./NotFound.tsx";
import AllPoems from "./Poems/AllPoems.tsx";
import PoemPage from "./Poems/PoemPage.tsx";
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
    path: "/music",
    element: <Music />,
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
    path: "/admin",
    element: <Admin />,
  },
  {
    path: "/poems",
    element: <PoemPage />,
  },
  {
    path: "/poems/all",
    element: <AllPoems />,
  },
  {
    path: "/poems/:slug",
    element: <PoemPage />,
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
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;
