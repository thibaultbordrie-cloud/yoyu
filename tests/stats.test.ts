import assert from "node:assert/strict";
import { test } from "node:test";
import type { CheckIn } from "../src/db.ts";
import { addDays, MIN_DAYS, patterns, series, week, worryOutcomes } from "../src/stats.ts";

function rng(seed: number) {
  let s = seed;
  return () => ((s = (s * 1103515245 + 12345) % 2147483648) / 2147483648);
}

function log(days: number, seed: number, effect: Record<string, number> = {}): CheckIn[] {
  const r = rng(seed);
  const tags = ["noise", "meeting", "call", "alone", "walk", "music"];
  return Array.from({ length: days }, (_, i) => {
    const on = tags.filter(() => r() < 0.4);
    let energy = 5 + Math.round((r() - 0.5) * 4);
    for (const t of on) energy += effect[t] ?? 0;
    energy = Math.max(0, Math.min(10, energy));
    return {
      date: addDays("2026-01-01", i), energy, sensory: 3, social: 3, anxiety: 3,
      drains: on.filter((t) => ["noise", "meeting", "call"].includes(t)),
      rechargers: on.filter((t) => ["alone", "walk", "music"].includes(t)),
      note: "", updatedAt: "",
    };
  });
}

test("dates move across months and years", () => {
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
  assert.equal(addDays("2024-03-01", -1), "2024-02-29");
});

test("week averages only the 7 days ending today", () => {
  const l = log(20, 1);
  const w = week(l, l[19]!.date);
  assert.equal(w.days, 7);
  const expected = l.slice(13).reduce((a, c) => a + c.energy, 0) / 7;
  assert.equal(w.energy, Math.round(expected * 10) / 10);
});

test("series leaves gaps for days not logged", () => {
  const l = log(3, 2);
  const s = series(l, addDays(l[2]!.date, 2), 5);
  assert.deepEqual(s.map((x) => x.energy === null), [false, false, false, true, true]);
  assert.equal(s.length, 5);
  assert.equal(s.filter((x) => x.energy !== null).length, 3);
});

test("no pattern before MIN_DAYS days", () => {
  assert.equal(patterns(log(MIN_DAYS - 1, 3, { meeting: -4 })).found.length, 0);
});

test("a real effect is found, with the right sign", () => {
  const r = patterns(log(60, 4, { meeting: -3, walk: 2 }));
  const meeting = r.found.find((p) => p.tag === "meeting");
  const walk = r.found.find((p) => p.tag === "walk");
  assert.ok(meeting && meeting.diff < -2, JSON.stringify(r.found));
  assert.ok(walk && walk.diff > 1, JSON.stringify(r.found));
});

test("pure noise rarely shows a pattern (false alarms under control)", () => {
  let alarms = 0;
  for (let seed = 1; seed <= 60; seed++) if (patterns(log(45, seed * 7), 1000).found.length > 0) alarms++;
  assert.ok(alarms <= 3, `${alarms} logs out of 60 showed a pattern that is not there`);
});

test("the same log always gives the same answer", () => {
  const l = log(40, 9, { call: -2 });
  assert.deepEqual(patterns(l), patterns(l));
});

test("worry outcomes are counted", () => {
  assert.deepEqual(worryOutcomes([{ outcome: "not" }, { outcome: "not" }, { outcome: "happened" }, {}]), { total: 3, happened: 1, partly: 0, not: 2 });
});
