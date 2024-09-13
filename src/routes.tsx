import Blog from "./Blog";
import Post from "./Blog/Post.tsx";
import Home from "./Home/index.tsx";

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
];

export default routes;
