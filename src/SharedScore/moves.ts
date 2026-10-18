import { type Cell, VOICES } from "./score.ts";

export type Move = "up" | "down" | "toggle";

export function applyMove(cell: Cell, move: Move): Cell {
  const voice = VOICES.find((v) => v.id === cell.voice)!;
  if (move === "toggle") {
    const note = cell.note === null ? cell.last_note ?? voice.initial : null;
    return {
      ...cell,
      note,
      last_note: cell.note ?? cell.last_note ?? voice.initial,
    };
  }
  if (cell.note === null) return cell;
  const note = Math.max(
    voice.min,
    Math.min(voice.max, cell.note + (move === "up" ? 1 : -1)),
  );
  return { ...cell, note, last_note: note };
}
