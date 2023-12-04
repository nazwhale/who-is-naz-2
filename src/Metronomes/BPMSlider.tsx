import React from "react";

type BPMSliderProps = {
  bpm: number;
  onBpmChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

const BPMSlider: React.FC<BPMSliderProps> = ({ bpm, onBpmChange }) => {
  return (
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
        onChange={onBpmChange}
      />
    </div>
  );
};

function calculateInterval(bpm: number): number {
  return 60 / bpm;
}

export default BPMSlider;
