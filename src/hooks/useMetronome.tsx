import { useState, useEffect, useRef, ChangeEvent } from "react";
import * as Tone from "tone";
import { fourthBeatSynth, regularSynth } from "../synth.tsx";
import { circleOfFifths } from "../circleOfFifths.tsx";

const useMetronome = (initialBpm: number) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(initialBpm);
  const beatRef = useRef(0);
  const barCountRef = useRef(0);
  const currentNoteRef = useRef(circleOfFifths[0]);
  const [currentBeat, setCurrentBeat] = useState(1);
  const [currentBar, setCurrentBar] = useState(1);

  useEffect(() => {
    const scheduleId = Tone.Transport.scheduleRepeat((time) => {
      beatRef.current = (beatRef.current % 4) + 1;
      setCurrentBeat(beatRef.current);

      if (beatRef.current === 1) {
        barCountRef.current += 1;
        setCurrentBar(
          barCountRef.current % 4 === 0 ? 4 : barCountRef.current % 4,
        );

        if (barCountRef.current >= 5 && (barCountRef.current - 5) % 4 === 0) {
          const nextNoteIndex =
            (Math.floor((barCountRef.current - 5) / 4) + 1) %
            circleOfFifths.length;
          currentNoteRef.current = circleOfFifths[nextNoteIndex];
        }
      }

      // Your logic for triggering sounds goes here...
      if (beatRef.current === 1) {
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
    }, calculateInterval(bpm));

    return () => {
      Tone.Transport.clear(scheduleId);
    };
  }, [bpm]);

  const toggleMetronome = async () => {
    if (isPlaying) {
      Tone.Transport.stop();
      setIsPlaying(false);
    } else {
      await Tone.start();
      Tone.Transport.start();
      setIsPlaying(true);
    }
  };

  const handleBpmChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newBpm = Number(event.target.value);
    setBpm(newBpm);
  };

  return {
    isPlaying,
    bpm,
    currentBeat,
    currentBar,
    currentNote: currentNoteRef.current,
    nextNote: getNextNote(currentNoteRef.current),
    toggleMetronome,
    handleBpmChange,
  };
};

function calculateInterval(bpm: number): number {
  return 60 / bpm;
}

export const getNextNote = (currentNote: string): string => {
  const currentNoteIndex = circleOfFifths.indexOf(currentNote);
  const nextNoteIndex = (currentNoteIndex + 1) % circleOfFifths.length;
  return circleOfFifths[nextNoteIndex];
};

export { useMetronome };
