import React from "react";

type PropsT = {
  isPlaying: boolean;
  onToggle: () => void;
};

const PlayButton: React.FC<PropsT> = ({ isPlaying, onToggle }) => {
  const handleInteraction = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault(); // Prevents double firing of events
    onToggle();
  };

  return (
    <button
      className={`btn-lg w-48 btn btn-active ${
        isPlaying ? "btn-accent" : "btn-primary"
      }`}
      onClick={handleInteraction}
      onTouchStart={handleInteraction} // Using touchstart instead of touchend
    >
      {isPlaying ? "Stop" : "Start"}
    </button>
  );
};

export default PlayButton;
