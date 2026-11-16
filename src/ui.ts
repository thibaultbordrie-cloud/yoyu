// Small DOM helpers. No framework: the app is small, and every node is built the same way.

import { detect, LOCALES, type Locale } from "./i18n.ts";

type Child = Node | string | number | null | undefined | false;
type Attrs = Record<string, string | number | boolean | EventListener | undefined | null>;

/** Creates an element. Text is always set as text, never parsed as HTML. */
export function h<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Attrs = {}, ...children: (Child | Child[])[]): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null || v === false) continue;
    if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v as EventListener);
    else if (k === "class") el.className = String(v);
    else if (v === true) el.setAttribute(k, "");
    else if (k in el && !k.includes("-") && k !== "list" && k !== "form") (el as unknown as Record<string, unknown>)[k] = v;
    else el.setAttribute(k, String(v));
  }
  for (const c of children.flat()) {
    if (c === null || c === undefined || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

/** Announces a short message to screen readers and shows it on screen. */
export function announce(message: string): void {
  const live = document.getElementById("live");
  if (!live) return;
  live.textContent = "";
  window.setTimeout(() => (live.textContent = message), 30);
  window.setTimeout(() => {
    if (live.textContent === message) live.textContent = "";
  }, 6000);
}

export interface Prefs {
  locale: Locale;
  theme: "auto" | "light" | "dark";
  size: "normal" | "large" | "xlarge";
  worryTime: string; // HH:MM
}

const PREFS_KEY = "yoyu.prefs";

/** Preferences live in localStorage: small, not sensitive, needed before the database opens. */
export function loadPrefs(): Prefs {
  const defaults: Prefs = { locale: detect(navigator.languages ?? [navigator.language]), theme: "auto", size: "normal", worryTime: "18:00" };
  try {
    const raw = JSON.parse(localStorage.getItem(PREFS_KEY) ?? "{}") as Partial<Prefs>;
    return {
      locale: LOCALES.includes(raw.locale as Locale) ? (raw.locale as Locale) : defaults.locale,
      theme: raw.theme === "light" || raw.theme === "dark" ? raw.theme : "auto",
      size: raw.size === "large" || raw.size === "xlarge" ? raw.size : "normal",
      worryTime: typeof raw.worryTime === "string" && /^\d{2}:\d{2}$/.test(raw.worryTime) ? raw.worryTime : defaults.worryTime,
    };
  } catch {
    return defaults;
  }
}

export function savePrefs(p: Prefs): void {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(p));
  } catch {
    /* private mode: preferences last for this visit only */
  }
}

export function applyPrefs(p: Prefs): void {
  const root = document.documentElement;
  root.lang = p.locale;
  if (p.theme === "auto") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", p.theme);
  root.setAttribute("data-size", p.size);
}

/** Lines of a textarea, trimmed, empty ones dropped. */
export const lines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);

/** Saves a text file through the browser's download, without any server. */
export function download(name: string, text: string, type = "application/json"): void {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = h("a", { href: url, download: name });
  document.body.append(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
