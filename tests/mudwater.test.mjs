import test from "node:test";
import assert from "node:assert/strict";
import {
  BARREL_LETTERS,
  applyCounts,
  countsOf,
  fillFor,
  formatCountdown,
  getStadiumSnapshot,
  smallestNonEmpty,
} from "../src/lib/mudwater/stadium.ts";

test("fill engine: empty and zero-total barrels draw nothing", () => {
  assert.equal(fillFor(0, 244), 0);
  assert.equal(fillFor(10, 0), 0);
  assert.equal(fillFor(-3, 244), 0);
});

test("fill engine: a 33% crowd share renders near 49% height", () => {
  const fill = fillFor(33, 100);
  assert.ok(fill > 0.47 && fill < 0.51, `expected ~0.49, got ${fill}`);
});

test("fill engine: equal shares look identical at 100 and 10,000 players", () => {
  for (const total of [3, 100, 1000, 10_000]) {
    const a = fillFor(total, total * 3);
    const b = fillFor(total * 10, total * 30);
    assert.equal(a, b, `total=${total} produced ${a} vs ${b}`);
  }
});

test("fill engine: never exceeds the circle", () => {
  for (const [players, total] of [
    [1, 1],
    [999, 1000],
    [1, 1000],
  ]) {
    const fill = fillFor(players, total);
    assert.ok(fill > 0 && fill <= 1, `${players}/${total} -> ${fill}`);
  }
});

test("smallest non-empty barrel: empty barrels never qualify", () => {
  assert.equal(smallestNonEmpty([0, 0, 0]), null);
  assert.equal(smallestNonEmpty([0, 12, 0]), "B");
  assert.equal(smallestNonEmpty([35, 26, 11]), "C");
});

test("smallest non-empty barrel: ties resolve to the first qualifying barrel", () => {
  // Ties are drawn together by the rules; the badge just needs to be stable.
  assert.equal(smallestNonEmpty([7, 7, 12]), "A");
  assert.equal(smallestNonEmpty([12, 7, 7]), "B");
});

test("applyCounts recomputes totals, shares and fills consistently", () => {
  const snapshot = getStadiumSnapshot();
  const holders = snapshot.arenas[0];
  const next = applyCounts(holders, [10, 20, 30]);

  assert.equal(next.total, 60);
  assert.equal(next.smallest, "A");
  assert.deepEqual(
    next.barrels.map((barrel) => barrel.letter),
    [...BARREL_LETTERS],
  );

  const shareSum = next.barrels.reduce((sum, barrel) => sum + barrel.share, 0);
  assert.ok(Math.abs(shareSum - 1) < 1e-9, `shares summed to ${shareSum}`);

  const playersSum = next.barrels.reduce(
    (sum, barrel) => sum + barrel.players,
    0,
  );
  assert.equal(playersSum, next.total);
});

test("applyCounts clamps negative input instead of producing negative crowds", () => {
  const snapshot = getStadiumSnapshot();
  const next = applyCounts(snapshot.arenas[1], [-5, 3, 2]);
  assert.deepEqual(countsOf(next), [0, 3, 2]);
  assert.equal(next.total, 5);
});

test("stadium snapshot is deterministic and self-consistent", () => {
  const a = getStadiumSnapshot();
  const b = getStadiumSnapshot();

  assert.deepEqual(a, b, "snapshot must not depend on the clock");
  assert.equal(a.arenas.length, 2);
  assert.equal(
    a.players,
    a.arenas.reduce((sum, arena) => sum + arena.total, 0),
  );

  for (const arena of a.arenas) {
    assert.equal(arena.barrels.length, 3);
    assert.equal(arena.total, countsOf(arena).reduce((s, n) => s + n, 0));
    assert.ok(arena.smallest === null || arena.barrels.some((b) => b.letter === arena.smallest));
  }
});

test("countdown format is always hh:mm:ss", () => {
  assert.equal(formatCountdown(0), "00:00:00");
  assert.equal(formatCountdown(-5000), "00:00:00");
  assert.equal(formatCountdown(3_723_000), "01:02:03");
  assert.equal(formatCountdown(17 * 3600_000 + 48 * 60_000 + 22_000), "17:48:22");
});
