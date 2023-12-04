import React from "react";

type PropsT = {
  isPlaying: boolean;
  onToggle: () => void;
};

const PlayButton: React.FC<PropsT> = ({ isPlaying, onToggle }) => {
  return (
    <button
      className={`btn-lg w-48 btn btn-active ${
        isPlaying ? "btn-accent" : "btn-primary"
      }`}
      onClick={onToggle}
    >
      {isPlaying ? "Stop" : "Start"}
    </button>
  );
};

export default PlayButton;
