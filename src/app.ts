// What every view receives.

import type { Store } from "./db.ts";
import type { Prefs } from "./ui.ts";

export interface App {
  store: Store;
  prefs: Prefs;
  persistent: boolean;
  /** Today as YYYY-MM-DD, local time. */
  today(): string;
  /** Minutes since midnight, local time. */
  nowMinutes(): number;
  go(path: string): void;
  refresh(): void;
  setPrefs(p: Partial<Prefs>): void;
}

export type View = (app: App, params: string[]) => Promise<HTMLElement>;

export const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number) as [number, number];
  return h * 60 + m;
};
