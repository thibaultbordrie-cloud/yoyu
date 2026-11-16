// What the battery log can honestly say. Pure functions, tested.

import type { CheckIn } from "./db.ts";

export const MIN_DAYS = 14; // before looking for patterns at all
export const MIN_SIDE = 5; // days with and days without a tag

/** YYYY-MM-DD of a Date in local time. */
export function isoDay(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function addDays(iso: string, n: number): string {
  const [y, m, d] = iso.split("-").map(Number) as [number, number, number];
  return isoDay(new Date(y, m - 1, d + n));
}

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : NaN);
const round1 = (x: number) => Math.round(x * 10) / 10;

export interface WeekSummary {
  days: number;
  energy: number;
  sensory: number;
  social: number;
  anxiety: number;
}

/** Averages over the 7 days ending on `today` (included). */
export function week(checkins: CheckIn[], today: string): WeekSummary {
  const from = addDays(today, -6);
  const w = checkins.filter((c) => c.date >= from && c.date <= today);
  return {
    days: w.length,
    energy: round1(mean(w.map((c) => c.energy))),
    sensory: round1(mean(w.map((c) => c.sensory))),
    social: round1(mean(w.map((c) => c.social))),
    anxiety: round1(mean(w.map((c) => c.anxiety))),
  };
}

/** Energy for each of the `n` days ending on `today`; null when the day was not logged. */
export function series(checkins: CheckIn[], today: string, n = 28): { date: string; energy: number | null }[] {
  const byDay = new Map(checkins.map((c) => [c.date, c.energy]));
  return Array.from({ length: n }, (_, i) => {
    const date = addDays(today, i - n + 1);
    return { date, energy: byDay.get(date) ?? null };
  });
}

export interface Pattern {
  tag: string;
  diff: number; // mean energy with the tag minus without
  with: number;
  without: number;
  p: number;
}

/** A small deterministic random generator, so the same log always gives the same answer. */
function rng(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}

/**
 * Tags that go with a different energy level. For each tag seen on at least MIN_SIDE days and absent on
 * at least MIN_SIDE days, a two-sided permutation test on the difference of mean energy. With many tags,
 * some would look "significant" by chance, so the threshold is divided by the number of tags tested
 * (Bonferroni): fewer patterns, but the ones shown are worth a look.
 */
export function patterns(checkins: CheckIn[], permutations = 4000): { tested: number; found: Pattern[] } {
  if (checkins.length < MIN_DAYS) return { tested: 0, found: [] };
  const tags = new Set(checkins.flatMap((c) => [...c.drains, ...c.rechargers]));
  const energy = checkins.map((c) => c.energy);
  const candidates: { tag: string; has: boolean[] }[] = [];
  for (const tag of [...tags].sort()) {
    const has = checkins.map((c) => c.drains.includes(tag) || c.rechargers.includes(tag));
    const n = has.filter(Boolean).length;
    if (n >= MIN_SIDE && checkins.length - n >= MIN_SIDE) candidates.push({ tag, has });
  }
  const alpha = 0.05 / Math.max(1, candidates.length);
  const found: Pattern[] = [];
  for (const { tag, has } of candidates) {
    const diffOf = (h: boolean[]) => mean(energy.filter((_, i) => h[i])) - mean(energy.filter((_, i) => !h[i]));
    const observed = diffOf(has);
    const random = rng(tag.split("").reduce((a, ch) => a * 31 + ch.charCodeAt(0), 7));
    const shuffled = [...has];
    let extreme = 0;
    for (let k = 0; k < permutations; k++) {
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
      }
      if (Math.abs(diffOf(shuffled)) >= Math.abs(observed) - 1e-12) extreme++;
    }
    const p = (extreme + 1) / (permutations + 1);
    if (p < alpha) {
      const n = has.filter(Boolean).length;
      found.push({ tag, diff: round1(observed), with: n, without: has.length - n, p });
    }
  }
  found.sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));
  return { tested: candidates.length, found };
}

export interface WorryOutcomes {
  total: number;
  happened: number;
  partly: number;
  not: number;
}

export function worryOutcomes(worries: { outcome?: string }[]): WorryOutcomes {
  const o = worries.filter((w) => w.outcome);
  return {
    total: o.length,
    happened: o.filter((w) => w.outcome === "happened").length,
    partly: o.filter((w) => w.outcome === "partly").length,
    not: o.filter((w) => w.outcome === "not").length,
  };
}
