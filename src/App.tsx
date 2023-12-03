import "./App.css";
import Metronome from "./Metronome.tsx";

function App() {
  return (
    <div>
      <h1 className="mb-8 text-4xl font-semibold text-primary-content">
        circle of 5<span className="text-sm align-super">ths</span>{" "}
        <span className="text-primary-content/60">metronome</span>
      </h1>

      <Metronome />
    </div>
  );
}

export default App;
