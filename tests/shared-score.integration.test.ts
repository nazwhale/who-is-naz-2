import assert from "node:assert/strict";
import test from "node:test";

const base = process.env.SCORE_TEST_API_BASE;

test(
  "shared score persists one move, rejects invalid notes, and handles concurrent editors",
  { skip: !base },
  async () => {
    assert.ok(
      ["localhost", "127.0.0.1"].includes(new URL(base!).hostname),
      "Use a local test API",
    );
    const url = `${base}/api/scores/a-second-of-your-time-v2`;
    const score = await fetch(url).then((r) => r.json());
    assert.equal(score.version, 2);
    assert.equal(score.notes.length, 32);
    const original = score.notes.find(
      (n: { voice: string; step_index: number }) =>
        n.voice === "bass" && n.step_index === 7,
    );
    const target = `${url}/notes/bass/7`;
    const put = (body: unknown, endpoint = target) =>
      fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    assert.equal(
      (await put({ note: 90, revision: original.revision })).status,
      400,
    );
    assert.equal(
      (await put({ note: 36.5, revision: original.revision })).status,
      400,
    );
    assert.equal((await put({ note: 36 })).status, 400);
    assert.equal(
      (await put({ note: 36, revision: 0 }, `${url}/notes/bass/8`)).status,
      400,
    );
    assert.equal(
      (await put({ note: 36, revision: 0 }, `${url}/notes/unknown/0`)).status,
      400,
    );
    const responses = await Promise.all([
      put({ note: 37, revision: original.revision }),
      put({ note: null, revision: original.revision }),
    ]);
    let latest;
    try {
      assert.deepEqual(responses.map((r) => r.status).sort(), [200, 409]);
      const accepted = responses.find((r) => r.status === 200)!;
      latest = (await accepted.json()).cell;
      const conflict = await responses.find((r) => r.status === 409)!.json();
      assert.equal(conflict.cell.revision, latest.revision);
      const refreshed = await fetch(url).then((r) => r.json());
      const stored = refreshed.notes.find(
        (n: { voice: string; step_index: number }) =>
          n.voice === "bass" && n.step_index === 7,
      );
      assert.equal(stored.note, latest.note);
      assert.equal(stored.revision, original.revision + 1);
    } finally {
      if (latest)
        assert.equal(
          (await put({ note: original.note, revision: latest.revision }))
            .status,
          200,
          "Restore test note without overwriting someone else's move",
        );
    }
  },
);
