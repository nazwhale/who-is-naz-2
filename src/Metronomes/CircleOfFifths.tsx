import React from "react";
import StatsDisplay from "./StatsDisplay.tsx";
import { useMetronome } from "../hooks/useMetronome.tsx";
import BPMSlider from "./BPMSlider.tsx";

const CircleOfFifths: React.FC = () => {
  const {
    isPlaying,
    bpm,
    currentBeat,
    currentBar,
    currentNote,
    nextNote,
    toggleMetronome,
    handleBpmChange,
  } = useMetronome(120, true);

  return (
    <div className="space-y-8">
      <BPMSlider bpm={bpm} onBpmChange={handleBpmChange} />

      <StatsDisplay
        currentNote={currentNote}
        nextNote={nextNote}
        currentBeat={currentBeat}
        currentBar={currentBar}
      />

      <div>
        <button
          className={`btn-lg w-48 btn btn-active ${
            isPlaying ? "btn-accent" : "btn-primary"
          }`}
          onClick={toggleMetronome}
        >
          {isPlaying ? "stop" : "start"}
        </button>
      </div>
    </div>
  );
};

export default CircleOfFifths;
