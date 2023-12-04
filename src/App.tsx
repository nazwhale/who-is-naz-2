import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import All from "./Metronomes/All";
import Navigation from "./Nav";
import StandardMetronome from "./Metronomes/Standard.tsx";
import Blog from "./Blog";
import Post from "./Blog/Post.tsx";

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
          <Route path="/" element={<StandardMetronome />} />

          <Route path="/articles" element={<Blog />} />
          <Route path="/articles/:slug" element={<Post />} />

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
