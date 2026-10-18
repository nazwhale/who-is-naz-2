import assert from "node:assert/strict";
import test from "node:test";
import { applyMove } from "../src/SharedScore/moves.ts";
import type { Cell } from "../src/SharedScore/score.ts";

const cell: Cell = {
  voice: "bass",
  step_index: 0,
  note: 38,
  last_note: 38,
  revision: 0,
};

test("toggle restores the previous pitch", () => {
  const muted = applyMove(cell, "toggle");
  assert.equal(muted.note, null);
  assert.equal(muted.last_note, 38);
  assert.equal(applyMove(muted, "toggle").note, 38);
});

test("rapid queued moves preserve every semitone and toggle", () => {
  const result = (["up", "up", "down", "toggle", "toggle"] as const).reduce(
    applyMove,
    cell,
  );
  assert.equal(result.note, 39);
  assert.equal(result.last_note, 39);
});

test("arrows respect voice bounds and leave off notes unchanged", () => {
  assert.equal(applyMove({ ...cell, note: 48 }, "up").note, 48);
  assert.equal(applyMove({ ...cell, note: 24 }, "down").note, 24);
  assert.equal(applyMove({ ...cell, note: null }, "up").note, null);
  assert.equal(applyMove({ ...cell, note: null }, "down").note, null);
});
