import "./App.css";
import Metronome from "./Metronome.tsx";
import BuyMeACoffee from "./BuyMeACoffee.tsx";

function App() {
  return (
    <>
      <h1 className="mb-8 text-4xl font-bold text-gray-800">
        circle of 5<span className="text-sm align-super">ths</span>{" "}
        <span className="text-gray-400">metronome</span>
      </h1>

      <Metronome />

      <BuyMeACoffee />
    </>
  );
}

export default App;
