import React from "react";
import StatsDisplay from "./StatsDisplay.tsx";
import { useMetronome } from "../hooks/useMetronome.tsx";
import BPMSlider from "./BPMSlider.tsx";
import PlayButton from "./PlayButton.tsx";

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

      <PlayButton isPlaying={isPlaying} onToggle={toggleMetronome} />
    </div>
  );
};

export default CircleOfFifths;
