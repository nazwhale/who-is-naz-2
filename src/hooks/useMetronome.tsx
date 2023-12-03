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
    // Check if the context is in "suspended" state which is the case
    // when the AudioContext has been created but not yet started.
    if (Tone.context.state === "suspended") {
      await Tone.context.resume();
    }

    // Start or stop the transport
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

const calculateNoteInterval = (bpm: number): number => {
  return 60 / bpm;
};

const getNextNote = (currentNote: string): string => {
  const currentNoteIndex = circleOfFifths.indexOf(currentNote);
  const nextNoteIndex = (currentNoteIndex + 1) % circleOfFifths.length;
  return circleOfFifths[nextNoteIndex];
};

export { useMetronome };
