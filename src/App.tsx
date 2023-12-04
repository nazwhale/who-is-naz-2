import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import All from "./Metronomes/All";
import Navigation from "./Nav"; // Import the new Navigation component

function App() {
  return (
    <Router>
      <div>
        <div className="mb-8">
          <h1 className="mb-4 text-4xl font-semibold text-primary-content">
            tempotick <span className="text-primary-content/60">metronome</span>
          </h1>
          <div className="divider">
            <Navigation />
          </div>
        </div>

        <Routes>
          {All.map((metronome) => (
            <Route
              key={metronome.path}
              path={metronome.path}
              element={<metronome.component />}
            />
          ))}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
