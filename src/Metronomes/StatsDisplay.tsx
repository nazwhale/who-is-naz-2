import React from "react";

type StatsDisplayProps = {
  currentNote: string;
  nextNote: string;
  currentBeat: number;
  currentBar: number;
};

const StatsDisplay: React.FC<StatsDisplayProps> = ({
  currentNote,
  nextNote,
  currentBeat,
  currentBar,
}) => {
  return (
    <div className="bg-neutral-content stats stats-vertical sm:stats-horizontal shadow flex flex-grow max-w-md mx-auto">
      <div className="stat">
        <div className="stat-title">Note</div>
        <div className="stat-value">{currentNote}</div>
        <div className="stat-desc">next up: {nextNote}</div>
      </div>

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
        <div className="stat-desc">next note after 4</div>
      </div>
    </div>
  );
};

export default StatsDisplay;
