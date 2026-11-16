// Anonymity: nothing in this public repository may point to a real company, person, internal tool or
// cloud project. The forbidden terms are stored only as hashes, so this file does not reveal them.
// E-mail addresses must be example ones.

import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";

const FORBIDDEN = new Set([
  "08f6f59e0540944622c9", "0a13fe27742142ab0a55", "2384ec0e2963ba2a2c71", "3462ee2ec1e78c77d7f0",
  "3af7d17d9a4bc5308c57", "43b54885c5690ed70656", "44b1d90c896f767137f4", "54557012f65abc5908f3",
  "5845901d0e075c9bb3ab", "69185407befe30912e51", "7cbdf191488e3c89e8ce", "844ebbe693aaaf6a39d3",
  "915f4a517d06ef5fbf31", "91ae1deae4b736c50156", "9768f993f262761fe41e", "9be83f38bdcd57c6fe98",
  "abb81aaf9978b9966fed",
]);

const ROOT = path.resolve(import.meta.dirname, "..");
const SKIP = new Set([".git", "node_modules", "dist", "test-results", "playwright-report"]);

function files(): Map<string, string> {
  const out = new Map<string, string>();
  const walk = (dir: string) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (SKIP.has(e.name)) continue;
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else {
        const bytes = fs.readFileSync(p);
        if (bytes.includes(0)) continue; // images and other binary files
        out.set(path.relative(ROOT, p).split(path.sep).join("/"), bytes.toString("utf8"));
      }
    }
  };
  walk(ROOT);
  return out;
}

const hash = (s: string) => crypto.createHash("sha256").update(s).digest("hex").slice(0, 20);

test("no identifying term in any file", () => {
  const all = files();
  assert.ok(all.size >= 20, `only ${all.size} files scanned`);
  for (const [p, text] of all) {
    const words = `${text} ${p}`.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").match(/[a-z0-9]+/g) ?? [];
    for (let i = 0; i < words.length; i++) {
      for (let n = 1; n <= 3 && i + n <= words.length; n++) {
        assert.ok(!FORBIDDEN.has(hash(words.slice(i, i + n).join(" "))), `identifying term found in ${p}`);
      }
    }
  }
});

test("only example e-mail addresses", () => {
  for (const [p, text] of files()) {
    for (const m of text.matchAll(/[\w.+-]+@([\w-]+(?:\.[\w-]+)*\.[A-Za-z]{2,})\b/g)) {
      const domain = m[1]!.toLowerCase();
      assert.ok(["example.com", "example.org", "users.noreply.github.com"].some((d) => domain.endsWith(d)), `${p}: e-mail address at ${domain}`);
    }
  }
});
