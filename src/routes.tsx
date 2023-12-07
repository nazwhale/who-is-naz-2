import StandardMetronome from "./Metronomes/Standard.tsx";
import Blog from "./Blog";
import Post from "./Blog/Post.tsx";
import All from "./Metronomes/All";

const routes = [
  {
    path: "/",
    element: <StandardMetronome />,
  },
  {
    path: "/articles",
    element: <Blog />,
  },
  {
    path: "/articles/:slug",
    element: <Post />,
  },
  ...All.map((metronome) => ({
    path: metronome.path,
    element: <metronome.component />,
  })),
];

export default routes;
