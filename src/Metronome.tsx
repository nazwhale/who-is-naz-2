import React, { useState, useEffect, useRef } from "react";
import * as Tone from "tone";
import { fourthBeatSynth, regularSynth } from "./synth.tsx";

const circleOfFifths = [
  "C",
  "G",
  "D",
  "A",
  "E",
  "B",
  "Gb",
  "Db",
  "Ab",
  "Eb",
  "Bb",
  "F",
];
const Metronome: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const beatRef = useRef(0);
  const barCountRef = useRef(0);
  const [currentBeat, setCurrentBeat] = useState(1);
  const [currentBar, setCurrentBar] = useState(1);

  const currentNoteRef = useRef(circleOfFifths[0]);

  useEffect(() => {
    // Create a Tone.js Transport to handle timing
    Tone.Transport.scheduleRepeat((time) => {
      // This function is called on every beat
      beatRef.current = (beatRef.current % 4) + 1;
      const currentBeatRef = beatRef.current;
      setCurrentBeat(currentBeatRef);

      if (beatRef.current === 1) {
        barCountRef.current += 1;

        setCurrentBar(
          barCountRef.current % 4 === 0 ? 4 : barCountRef.current % 4,
        );

        if (barCountRef.current >= 5 && (barCountRef.current - 5) % 4 === 0) {
          const nextNoteIndex =
            (Math.floor((barCountRef.current - 5) / 4) + 1) %
            circleOfFifths.length;

          console.log("setting current note", circleOfFifths[nextNoteIndex]);
          // setCurrentNote(circleOfFifths[nextNoteIndex]);
          currentNoteRef.current = circleOfFifths[nextNoteIndex];
        }
      }

      console.log(currentNoteRef.current);

      if (currentBeatRef === 1) {
        // Play a different sound on the 1st beat
        fourthBeatSynth.triggerAttackRelease(
          currentNoteRef.current + "4",
          "8n",
          time,
        );
      } else {
        // Play the regular sound
        regularSynth.triggerAttackRelease(
          currentNoteRef.current + "5",
          "8n",
          time,
        );
      }
    }, calculateInterval(bpm)); // "1n" means once every quarter note

    return () => {
      Tone.Transport.cancel(); // Clean up on unmount
    };
  }, [bpm]);

  const toggleMetronome = async () => {
    // Start the Tone.js context
    await Tone.start();

    if (isPlaying) {
      Tone.Transport.stop();
    } else {
      Tone.Transport.start();
    }
    setIsPlaying(!isPlaying);
  };

  const handleBpmChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newBpm = Number(event.target.value);
    setBpm(newBpm);
  };

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

      <div className="stats stats-vertical sm:stats-horizontal shadow flex flex-grow max-w-md mx-auto">
        <div className="stat">
          <div className="stat-title">Note</div>
          <div className="stat-value">{currentNoteRef.current}</div>
          <div className="stat-desc">
            next up:{" "}
            {
              circleOfFifths[
                (circleOfFifths.indexOf(currentNoteRef.current) + 1) %
                  circleOfFifths.length
              ]
            }
          </div>
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

      <div>
        <button
          className={`btn-lg w-48 btn btn-active ${
            isPlaying ? "btn-secondary" : "btn-primary"
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
