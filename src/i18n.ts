// Four languages, one dictionary each. Every key must exist in every language (tested).

import en from "./locales/en.ts";
import fr from "./locales/fr.ts";
import ja from "./locales/ja.ts";
import zhHant from "./locales/zh-Hant.ts";

export const LOCALES = ["fr", "en", "ja", "zh-Hant"] as const;
export type Locale = (typeof LOCALES)[number];
export type Dict = Record<string, string>;

export const DICTS: Record<Locale, Dict> = { fr, en, ja, "zh-Hant": zhHant };

export const LOCALE_NAMES: Record<Locale, string> = {
  fr: "Français",
  en: "English",
  ja: "日本語",
  "zh-Hant": "繁體中文",
};

let current: Locale = "fr";

/** The best match for a list of browser languages; French when nothing matches. */
export function detect(languages: readonly string[]): Locale {
  for (const raw of languages) {
    const l = raw.toLowerCase();
    if (l.startsWith("fr")) return "fr";
    if (l.startsWith("en")) return "en";
    if (l.startsWith("ja")) return "ja";
    if (l === "zh-tw" || l === "zh-hk" || l === "zh-mo" || l.startsWith("zh-hant")) return "zh-Hant";
  }
  return "fr";
}

export function setLocale(l: Locale): void {
  current = l;
}

export function locale(): Locale {
  return current;
}

/** Translates a key; {name} placeholders are replaced by vars. A missing key shows itself, never crashes. */
export function t(key: string, vars: Record<string, string | number> = {}): string {
  const s = DICTS[current][key] ?? DICTS.fr[key] ?? key;
  return s.replace(/\{(\w+)\}/g, (_, k: string) => (k in vars ? String(vars[k]) : `{${k}}`));
}

/** A date such as "lundi 16 novembre" in the current language. */
export function formatDay(iso: string, opts: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "long" }): string {
  const [y, m, d] = iso.split("-").map(Number) as [number, number, number];
  return new Intl.DateTimeFormat(current, opts).format(new Date(y, m - 1, d));
}
