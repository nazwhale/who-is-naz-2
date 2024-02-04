import Events from "./Events/index.tsx";
import Blog from "./Blog";
import Post from "./Blog/Post.tsx";

const routes = [
  {
    path: "/",
    element: <Events />,
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
