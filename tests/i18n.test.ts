import assert from "node:assert/strict";
import { test } from "node:test";
import { TEMPLATES } from "../src/content/situations.ts";
import en from "../src/locales/en.ts";
import fr from "../src/locales/fr.ts";
import ja from "../src/locales/ja.ts";
import zh from "../src/locales/zh-Hant.ts";

const DICTS = { fr, en, ja, "zh-Hant": zh } as const;
const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(",");

test("every key exists in every language, with the same placeholders", () => {
  const keys = Object.keys(fr).sort();
  for (const [name, dict] of Object.entries(DICTS)) {
    assert.deepEqual(Object.keys(dict).sort(), keys, `${name} has different keys`);
    for (const k of keys) {
      assert.ok(dict[k]!.trim().length > 0, `${name}.${k} is empty`);
      assert.equal(placeholders(dict[k]!), placeholders(fr[k]!), `${name}.${k} placeholders differ`);
    }
  }
});

test("every situation template is complete in every language", () => {
  for (const tpl of TEMPLATES) {
    for (const [loc, c] of Object.entries(tpl.text)) {
      assert.ok(c.title && c.recovery, `${tpl.id}/${loc}`);
      for (const list of [c.steps, c.phrases, c.bring, c.planB]) assert.ok(list.length > 0 && list.every((x) => x.trim()), `${tpl.id}/${loc}`);
      assert.equal(c.steps.length, tpl.text.fr.steps.length, `${tpl.id}/${loc}: not the same number of steps as French`);
    }
  }
});

// Yoyū is an organising tool, not a medical device: no wording may promise care, outside the Help page
// that says exactly that.
const CLAIMS = [
  /gu[ée]ri/i, /traitement/i, /\btraiter\b/i, /diagnosti/i, /th[ée]rap/i, /\bsoigne/i,
  /\bcure\b/i, /\btreat/i, /diagnos/i, /therap/i, /\bheal(s|ed|ing)?\b/i,
  /治療/, /診断/, /治す/, /治る/, /療法/,
  /治療/, /診斷/, /療效/, /治好/,
];

test("no promise of care outside the Help page", () => {
  const texts: [string, string][] = [];
  for (const [name, dict] of Object.entries(DICTS)) {
    for (const [k, v] of Object.entries(dict)) if (!k.startsWith("help.")) texts.push([`${name}.${k}`, v]);
  }
  for (const tpl of TEMPLATES) {
    for (const [loc, c] of Object.entries(tpl.text)) {
      for (const v of [c.title, c.recovery, ...c.steps, ...c.phrases, ...c.bring, ...c.planB]) texts.push([`${tpl.id}/${loc}`, v]);
    }
  }
  for (const [where, v] of texts) for (const re of CLAIMS) assert.doesNotMatch(v, re, `${where}: "${v}"`);
});

test("the Help page says it is not care, in every language", () => {
  for (const [name, dict] of Object.entries(DICTS)) {
    assert.ok(dict["help.notcare"]!.length > 20, name);
    assert.match(dict["help.crisis.fr"]!, /3114/, name);
    assert.match(dict["help.crisis.jp"]!, /0120-061-338/, name);
    assert.match(dict["help.crisis.tw"]!, /1925/, name);
  }
});
