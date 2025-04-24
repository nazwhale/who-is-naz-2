import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import Navigation from "./Nav";
import routes from "./routes.tsx";

function App() {
  return (
    <Router>
      <div className="mb-8">
        <h1 className="mb-4 text-4xl font-semibold">
          who is <span className="">naz</span>
        </h1>
        <Navigation />
        <div className="divider"></div>
      </div>

      <Routes>
        {routes.map((route, index) => (
          <Route key={index} path={route.path} element={route.element} />
        ))}
      </Routes>


      <div className="divider"></div>

      <div className="flex my-12 text-sm">
        <a
          href="https://github.com/nazwhale"
          target="_blank"
          rel="noopener noreferrer"
        >
          Github
        </a>
        <div className="mx-4">•</div>
        <a
          href="mailto:naz@whoisnaz.com"
        >
          Email: naz@whoisnaz.com
        </a>
      </div>

    </Router>
  );
}

export default App;
