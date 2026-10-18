import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Cell,
  cellKey,
  noteName,
  SCORE_ID,
  ScorePlayer,
  STEPS,
  VOICES,
} from "./score";
import { applyMove, Move } from "./moves";
import "./style.css";

const API_BASE = import.meta.env.DEV
  ? "/music-worlds-api"
  : import.meta.env.VITE_MUSIC_WORLDS_API_BASE;
const SCORE_URL = `${API_BASE}/api/scores/${SCORE_ID}`;

export default function SharedScore() {
  const [cells, setCells] = useState<Map<string, Cell>>(new Map());
  const cellsRef = useRef(cells);
  const queuesRef = useRef(new Map<string, Move[]>());
  const [pendingCells, setPendingCells] = useState(new Set<string>());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [playing, setPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState<number | null>(null);
  const playerRef = useRef<ScorePlayer | null>(null);
  const activeRef = useRef(true);

  const mergeCells = useCallback((incoming: Cell[], fromMove = false) => {
    const next = new Map(cellsRef.current);
    for (const cell of incoming) {
      const key = cellKey(cell.voice, cell.step_index);
      if (!fromMove && queuesRef.current.has(key)) continue;
      if (!next.has(key) || next.get(key)!.revision <= cell.revision)
        next.set(key, cell);
    }
    cellsRef.current = next;
    setCells(next);
  }, []);

  useEffect(() => {
    activeRef.current = true;
    let disposed = false;
    const controller = new AbortController();
    let timer: number;
    async function refresh() {
      try {
        const response = await fetch(SCORE_URL, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) throw new Error();
        const { notes }: { notes: Cell[] } = await response.json();
        if (notes.length !== STEPS * VOICES.length) throw new Error();
        if (disposed) return;
        mergeCells(notes);
        setError(null);
      } catch {
        if (!disposed)
          setError("Couldn’t reach the shared piece. Reconnecting…");
      } finally {
        if (!disposed) {
          setLoading(false);
          timer = window.setTimeout(refresh, 2000);
        }
      }
    }
    void refresh();
    return () => {
      disposed = true;
      activeRef.current = false;
      controller.abort();
      window.clearTimeout(timer);
      playerRef.current?.stop();
    };
  }, [mergeCells]);

  async function togglePlayback() {
    if (playing) {
      playerRef.current?.stop();
      setPlaying(false);
      setCurrentStep(null);
      return;
    }
    const player = new ScorePlayer();
    playerRef.current = player;
    setPlaying(true);
    try {
      await player.start(() => cellsRef.current, setCurrentStep);
    } catch {
      if (activeRef.current) {
        setPlaying(false);
        setMessage("Couldn’t start playback. Please try again.");
      }
    }
  }

  function makeMove(key: string, move: Move) {
    const existing = queuesRef.current.get(key);
    if (existing) {
      existing.push(move);
      setPendingCells(new Set(queuesRef.current.keys()));
      return;
    }
    const queue = [move];
    queuesRef.current.set(key, queue);
    setPendingCells(new Set(queuesRef.current.keys()));
    setMessage("");
    void saveMoves();

    async function saveMoves() {
      try {
        while (queue.length && activeRef.current) {
          const cell = cellsRef.current.get(key);
          if (!cell) break;
          const next = applyMove(cell, queue[0]);
          if (next.note === cell.note) {
            queue.shift();
            continue;
          }
          const response = await fetch(
            `${SCORE_URL}/notes/${cell.voice}/${cell.step_index}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                note: next.note,
                revision: cell.revision,
              }),
            },
          );
          if (!activeRef.current) return;
          if (response.status === 409) {
            const { cell: latest }: { cell: Cell } = await response.json();
            queue.length = 0;
            mergeCells([latest], true);
            setMessage(
              "Someone just changed this note. It’s updated here—try your move again.",
            );
            return;
          }
          if (!response.ok) throw new Error();
          const { cell: updated }: { cell: Cell } = await response.json();
          queue.shift();
          mergeCells([updated], true);
        }
      } catch {
        if (activeRef.current)
          setMessage("Your move wasn’t saved. Please try again.");
      } finally {
        queuesRef.current.delete(key);
        if (activeRef.current)
          setPendingCells(new Set(queuesRef.current.keys()));
      }
    }
  }

  const unavailable = loading || cells.size !== STEPS * VOICES.length;

  return (
    <main className="shared-score">
      <p className="score-eyebrow">A Second of Your Time · v2</p>
      <h1>A little harmony, made by everyone.</h1>
      <p className="score-intro">
        Four voices. Twenty steps. Tap ↑ or ↓ to change a note. Tap its name to
        turn it off or on. Every move is shared.
      </p>
      <div className="score-toolbar">
        <button
          className="score-play"
          onClick={togglePlayback}
          disabled={unavailable}
        >
          <span aria-hidden="true">{playing ? "■" : "▶"}</span>{" "}
          {playing ? "Stop loop" : "Play loop"}
        </button>
        <span className="score-connection" role="status">
          {loading
            ? "Loading the piece…"
            : error || "Changes are shared with everyone"}
        </span>
      </div>
      <div
        className="score-scroll"
        role="region"
        aria-label="Four voice shared score"
        tabIndex={0}
      >
        <div className="score-grid">
          <span className="score-corner" aria-hidden="true" />
          {Array.from({ length: STEPS }, (_, step) => (
            <span
              className={`score-step ${
                currentStep === step ? "is-playing" : ""
              }`}
              key={step}
            >
              {step + 1}
            </span>
          ))}
          {VOICES.map((v) => (
            <Fragment key={v.id}>
              <span className="score-voice">{v.label}</span>
              {Array.from({ length: STEPS }, (_, step) => {
                const key = cellKey(v.id, step);
                const confirmed = cells.get(key);
                const item = confirmed
                  ? (queuesRef.current.get(key) ?? []).reduce(
                      applyMove,
                      confirmed,
                    )
                  : undefined;
                const label = `${v.label}, step ${step + 1}`;
                return (
                  <div
                    key={key}
                    className={`score-cell voice-${v.id}${
                      currentStep === step ? " is-playing" : ""
                    }${item?.note === null ? " is-rest" : ""}`}
                    role="group"
                    aria-label={label}
                    aria-busy={pendingCells.has(key)}
                  >
                    <button
                      className="score-nudge"
                      disabled={
                        !item || item.note === null || item.note >= v.max
                      }
                      onClick={() => makeMove(key, "up")}
                      aria-label={`Raise ${label} by one semitone`}
                    >
                      <span aria-hidden="true">↑</span>
                    </button>
                    <button
                      className="score-toggle"
                      disabled={!item}
                      onClick={() => makeMove(key, "toggle")}
                      aria-label={`${
                        item?.note === null ? "Turn on" : "Turn off"
                      } ${label}, ${
                        item
                          ? noteName(item.note ?? item.last_note ?? v.initial)
                          : "loading"
                      }`}
                      aria-pressed={!!item && item.note !== null}
                    >
                      {item
                        ? item.note === null
                          ? "off"
                          : noteName(item.note)
                        : "·"}
                    </button>
                    <button
                      className="score-nudge"
                      disabled={
                        !item || item.note === null || item.note <= v.min
                      }
                      onClick={() => makeMove(key, "down")}
                      aria-label={`Lower ${label} by one semitone`}
                    >
                      <span aria-hidden="true">↓</span>
                    </button>
                  </div>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>
      <p className="score-feedback" role="status">
        {pendingCells.size ? "Saving your moves…" : message}
      </p>
      <p className="score-footer">
        <Link to="/a-second-of-your-time">Microphone version</Link>
        <Link to="/v0/a-second-of-your-time">Original audio version</Link>
      </p>
    </main>
  );
}
