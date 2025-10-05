import Blog from "./Blog";
import Post from "./Blog/Post.tsx";
import Home from "./Home/index.tsx";
import WeatherMusic from "./WeatherMusic/index.tsx";

const routes = [
  {
    path: "/",
    element: <Home />,
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
];

export default routes;
