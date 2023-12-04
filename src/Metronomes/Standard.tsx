import { useMetronome } from "../hooks/useMetronome.tsx";
import React from "react";
import { calculateInterval } from "../utils.tsx";

const Standard: React.FC = () => {
  const {
    isPlaying,
    bpm,
    currentBeat,
    currentBar,
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

      <StandardStatsDisplay currentBeat={currentBeat} currentBar={currentBar} />

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

export default Standard;

type StatsDisplayProps = {
  currentBeat: number;
  currentBar: number;
};

const StandardStatsDisplay: React.FC<StatsDisplayProps> = ({
  currentBeat,
  currentBar,
}) => {
  return (
    <div className="bg-neutral-content stats stats-vertical sm:stats-horizontal shadow flex flex-grow max-w-md mx-auto">
      <div className="stat">
        <div className="stat-title">Beat</div>
        <div className="stat-value">
          <span className="countdown">{currentBeat}</span>
        </div>
        <div className="stat-desc">out of 4</div>
      </div>

      <div className="stat">
        <div className="stat-title">Bar</div>
        <div className="stat-value">
          <span className="countdown">{currentBar}</span>
        </div>
        <div className="stat-desc">out of 4</div>
      </div>
    </div>
  );
};
