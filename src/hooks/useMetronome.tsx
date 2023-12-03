import { useState, useEffect, useRef, ChangeEvent } from "react";
import * as Tone from "tone";
import { fourthBeatSynth, regularSynth } from "../synth";
import { circleOfFifths } from "../circleOfFifths";

const BEATS_PER_BAR = 4;
const FIRST_CHANGE_BAR = 5;
const BARS_BETWEEN_CHANGES = 4;

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
      updateBeat();
      updateBarAndNote();
      triggerSynth(time);
    }, calculateNoteInterval(bpm));

    return () => {
      Tone.Transport.clear(scheduleId);
    };
  }, [bpm]);

  const updateBeat = () => {
    beatRef.current = (beatRef.current % BEATS_PER_BAR) + 1;
    setCurrentBeat(beatRef.current);
  };

  const updateBarAndNote = () => {
    if (isFirstBeat()) {
      barCountRef.current += 1;
      updateCurrentBar();
      maybeUpdateCurrentNote();
    }
  };

  const isFirstBeat = () => beatRef.current === 1;

  const updateCurrentBar = () => {
    setCurrentBar(getBarDisplayValue(barCountRef.current));
  };

  const getBarDisplayValue = (barCount: number) => {
    return barCount % BEATS_PER_BAR === 0
      ? BEATS_PER_BAR
      : barCount % BEATS_PER_BAR;
  };

  const maybeUpdateCurrentNote = () => {
    if (shouldChangeNote()) {
      currentNoteRef.current = getNextNote(currentNoteRef.current);
    }
  };

  const shouldChangeNote = () => {
    return (
      barCountRef.current >= FIRST_CHANGE_BAR &&
      (barCountRef.current - FIRST_CHANGE_BAR) % BARS_BETWEEN_CHANGES === 0
    );
  };

  const triggerSynth = (time: number) => {
    if (isFirstBeat()) {
      fourthBeatSynth.triggerAttackRelease(
        currentNoteRef.current + "4",
        "8n",
        time,
      );
    } else {
      regularSynth.triggerAttackRelease(
        currentNoteRef.current + "5",
        "8n",
        time,
      );
    }
  };

  const toggleMetronome = async () => {
    // Ensure this function is directly triggered by a user interaction
    try {
      // Only call Tone.start() if the context is not already running
      if (Tone.context.state !== "running") {
        await Tone.start(); // This starts the audio context
        console.log("Playback resumed successfully");
      }
      // Then start or stop the metronome
      if (isPlaying) {
        Tone.Transport.stop();
      } else {
        Tone.Transport.start();
      }
      setIsPlaying(!isPlaying); // Update the state to reflect the new playing status
    } catch (e) {
      console.error("Could not start audio context:", e);
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

const calculateNoteInterval = (bpm: number): number => {
  return 60 / bpm;
};

const getNextNote = (currentNote: string): string => {
  const currentNoteIndex = circleOfFifths.indexOf(currentNote);
  const nextNoteIndex = (currentNoteIndex + 1) % circleOfFifths.length;
  return circleOfFifths[nextNoteIndex];
};

export { useMetronome };
