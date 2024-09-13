import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import Navigation from "./Nav";
import routes from "./routes.tsx";

function App() {
  return (
    <Router>
      <div className="mb-8">
        <h1 className="mb-4 text-4xl font-semibold text-primary-content">
          who is <span className="text-primary-content/60">naz</span>
        </h1>
        <Navigation />
        <div className="divider"></div>
      </div>

      <Routes>
        {routes.map((route, index) => (
          <Route key={index} path={route.path} element={route.element} />
        ))}
      </Routes>
    </Router>
  );
}

export default App;
