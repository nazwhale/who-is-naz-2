import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import Navigation from "./Nav";
import routes from "./routes.tsx";

function App() {
  return (
    <Router>
      <div>
        <div className="mb-8">
          <h1 className="mb-4 text-4xl font-semibold text-primary-content">
            edinburgh <span className="text-primary-content/60">events</span>
          </h1>
          <div className="divider">
            <Navigation />
          </div>
        </div>

        <Routes>
          {routes.map((route, index) => (
            <Route key={index} path={route.path} element={route.element} />
          ))}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
