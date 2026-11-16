import assert from "node:assert/strict";
import { test } from "node:test";
import { BackupError, decrypt, encrypt, restore, snapshot, validate } from "../src/backup.ts";
import { MemoryStore } from "../src/db.ts";

const PASS = "correct horse battery staple";
const FAST = 100_000; // the minimum a file may ask for; the app uses 600,000

async function filled() {
  const s = new MemoryStore();
  await s.put("checkins", { date: "2026-11-16", energy: 4, sensory: 7, social: 6, anxiety: 5, drains: ["noise"], rechargers: ["walk"], note: "train bondé, 日本語 ok", updatedAt: "" });
  await s.put("worries", { id: "w1", text: "the meeting", createdAt: "2026-11-16T08:00:00Z", status: "waiting" });
  await s.put("cards", { id: "c1", title: "Call", steps: ["a"], phrases: [], bring: ["pen"], planB: [], recovery: "", checked: [0], createdAt: "", updatedAt: "" });
  return s;
}

test("a backup restores exactly what was saved", async () => {
  const s = await filled();
  const file = await encrypt(await snapshot(s), PASS, FAST);
  assert.doesNotMatch(file, /bondé|the meeting|Call/, "nothing is readable in the file");
  const other = new MemoryStore();
  assert.equal(await restore(other, await decrypt(file, PASS)), 3);
  for (const t of ["checkins", "worries", "cards"] as const) assert.deepEqual(await other.all(t), await s.all(t));
});

test("a wrong passphrase, a changed byte or a weakened file are refused", async () => {
  const file = await encrypt(await snapshot(await filled()), PASS, FAST);
  await assert.rejects(decrypt(file, PASS + "!"), BackupError);
  const env = JSON.parse(file);
  const bytes = Buffer.from(env.data, "base64");
  bytes[10] = bytes[10]! ^ 1;
  await assert.rejects(decrypt(JSON.stringify({ ...env, data: bytes.toString("base64") }), PASS), BackupError);
  await assert.rejects(decrypt(JSON.stringify({ ...env, kdf: { ...env.kdf, iterations: 1000 } }), PASS), BackupError);
  await assert.rejects(decrypt("not json", PASS), BackupError);
});

test("a short passphrase is refused", async () => {
  await assert.rejects(encrypt(await snapshot(await filled()), "short", FAST), BackupError);
});

test("only the shapes the app writes are accepted", () => {
  const base = { format: "yoyu-data", version: 1, exportedAt: "", checkins: [], worries: [], cards: [] };
  assert.doesNotThrow(() => validate(base));
  const bad = [
    { ...base, checkins: [{ date: "2026-11-16", energy: 99, sensory: 1, social: 1, anxiety: 1, drains: [], rechargers: [], note: "" }] },
    { ...base, checkins: [{ date: "<img>", energy: 1, sensory: 1, social: 1, anxiety: 1, drains: [], rechargers: [], note: "" }] },
    { ...base, worries: [{ id: "x", text: "t", createdAt: "", status: "deleted" }] },
    { ...base, cards: [{ id: "x", title: "t", steps: [1], phrases: [], bring: [], planB: [], recovery: "" }] },
    { ...base, version: 2 },
  ];
  for (const b of bad) assert.throws(() => validate(b), BackupError);
});
