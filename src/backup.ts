// Encrypted backups. The passphrase never leaves the device and is never stored.
// AES-256-GCM, key derived with PBKDF2-SHA-256 (600,000 iterations, random salt).

import type { CheckIn, Card, Store, Worry } from "./db.ts";

export const FORMAT = "yoyu-backup";
export const ITERATIONS = 600_000;
export const MIN_PASSPHRASE = 12;

export interface Snapshot {
  format: "yoyu-data";
  version: 1;
  exportedAt: string;
  checkins: CheckIn[];
  worries: Worry[];
  cards: Card[];
}

interface Envelope {
  format: typeof FORMAT;
  version: 1;
  kdf: { name: "PBKDF2"; hash: "SHA-256"; iterations: number; salt: string };
  cipher: { name: "AES-GCM"; iv: string };
  data: string;
}

export class BackupError extends Error {
  override name = "BackupError";
}

function b64(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}
const unb64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

export async function snapshot(store: Store): Promise<Snapshot> {
  return {
    format: "yoyu-data",
    version: 1,
    exportedAt: new Date().toISOString(),
    checkins: await store.all("checkins"),
    worries: await store.all("worries"),
    cards: await store.all("cards"),
  };
}

async function key(passphrase: string, salt: Uint8Array, iterations: number): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(passphrase), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt: salt as BufferSource, iterations },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encrypt(snap: Snapshot, passphrase: string, iterations = ITERATIONS): Promise<string> {
  if (passphrase.length < MIN_PASSPHRASE) throw new BackupError("short");
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const k = await key(passphrase, salt, iterations);
  const plain = new TextEncoder().encode(JSON.stringify(snap));
  const sealed = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv as BufferSource }, k, plain));
  const env: Envelope = {
    format: FORMAT,
    version: 1,
    kdf: { name: "PBKDF2", hash: "SHA-256", iterations, salt: b64(salt) },
    cipher: { name: "AES-GCM", iv: b64(iv) },
    data: b64(sealed),
  };
  return JSON.stringify(env);
}

export async function decrypt(text: string, passphrase: string): Promise<Snapshot> {
  let env: Envelope;
  try {
    env = JSON.parse(text);
  } catch {
    throw new BackupError("wrong");
  }
  if (env?.format !== FORMAT || env.version !== 1 || env.kdf?.name !== "PBKDF2" || env.cipher?.name !== "AES-GCM") {
    throw new BackupError("wrong");
  }
  // A file can only ask for more work than the default, never less: a tampered file cannot weaken the key.
  if (!Number.isInteger(env.kdf.iterations) || env.kdf.iterations < 100_000 || env.kdf.iterations > 10_000_000) {
    throw new BackupError("wrong");
  }
  try {
    const k = await key(passphrase, unb64(env.kdf.salt), env.kdf.iterations);
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(env.cipher.iv) as BufferSource }, k, unb64(env.data) as BufferSource);
    return validate(JSON.parse(new TextDecoder().decode(plain)));
  } catch (e) {
    if (e instanceof BackupError) throw e;
    throw new BackupError("wrong");
  }
}

const isStr = (x: unknown): x is string => typeof x === "string";
const isStrArr = (x: unknown): x is string[] => Array.isArray(x) && x.every(isStr);
const isScore = (x: unknown) => typeof x === "number" && Number.isFinite(x) && x >= 0 && x <= 10;

/** Accepts only the shapes this app writes; anything else is refused rather than stored. */
export function validate(x: unknown): Snapshot {
  const s = x as Snapshot;
  const ok =
    s?.format === "yoyu-data" &&
    s.version === 1 &&
    Array.isArray(s.checkins) &&
    s.checkins.every(
      (c) => isStr(c.date) && /^\d{4}-\d{2}-\d{2}$/.test(c.date) && [c.energy, c.sensory, c.social, c.anxiety].every(isScore) &&
        isStrArr(c.drains) && isStrArr(c.rechargers) && isStr(c.note),
    ) &&
    Array.isArray(s.worries) &&
    s.worries.every((w) => isStr(w.id) && isStr(w.text) && isStr(w.createdAt) && ["waiting", "actionable", "letgo"].includes(w.status)) &&
    Array.isArray(s.cards) &&
    s.cards.every((c) => isStr(c.id) && isStr(c.title) && [c.steps, c.phrases, c.bring, c.planB].every(isStrArr) && isStr(c.recovery));
  if (!ok) throw new BackupError("wrong");
  return s;
}

/** Replaces everything in the store with the snapshot. Returns the number of items restored. */
export async function restore(store: Store, snap: Snapshot): Promise<number> {
  await store.clear();
  for (const c of snap.checkins) await store.put("checkins", c);
  for (const w of snap.worries) await store.put("worries", w);
  for (const c of snap.cards) await store.put("cards", { ...c, checked: Array.isArray(c.checked) ? c.checked : [] });
  return snap.checkins.length + snap.worries.length + snap.cards.length;
}
