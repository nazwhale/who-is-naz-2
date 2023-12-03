import React from "react";
import StatsDisplay from "./StatsDisplay.tsx";
import { useMetronome } from "./hooks/useMetronome.tsx";

const Metronome: React.FC = () => {
  const {
    isPlaying,
    bpm,
    currentBeat,
    currentBar,
    currentNote,
    nextNote,
    toggleMetronome,
    handleBpmChange,
  } = useMetronome(120);

  return (
    <div className="space-y-8">
      <div>
        <div className="stat">
          <div className="stat-title">BPM</div>
          <div className="stat-value">{bpm}</div>
          <div className="stat-desc">
            every {calculateInterval(bpm).toFixed(2)}s
          </div>
        </div>

        <input
          type="range"
          min={40}
          max={200}
          value={bpm}
          className="range"
          onChange={handleBpmChange}
        />
      </div>

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
          {isPlaying ? "Stop" : "Start"}
        </button>
      </div>
    </div>
  );
};

export default Metronome;

function calculateInterval(bpm: number): number {
  return 60 / bpm;
}
