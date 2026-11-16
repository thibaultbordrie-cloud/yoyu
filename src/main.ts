import "./styles.css";
import type { App, View } from "./app.ts";
import { openStore } from "./db.ts";
import { setLocale, t } from "./i18n.ts";
import { isoDay } from "./stats.ts";
import { applyPrefs, h, loadPrefs, savePrefs } from "./ui.ts";
import { battery } from "./views/battery.ts";
import { help } from "./views/help.ts";
import { home } from "./views/home.ts";
import { card, day, edit, prepare } from "./views/prepare.ts";
import { settings } from "./views/settings.ts";
import { review, worries } from "./views/worries.ts";

const ROUTES: [RegExp, View, string][] = [
  [/^#?\/?$/, home, "home"],
  [/^#\/battery$/, battery, "battery"],
  [/^#\/prepare$/, prepare, "prepare"],
  [/^#\/prepare\/card\/([\w-]+)$/, card, "prepare"],
  [/^#\/prepare\/edit\/([\w-]+)$/, edit, "prepare"],
  [/^#\/prepare\/day\/([\w-]+)(?:\/(\d+))?$/, day, "prepare"],
  [/^#\/worries$/, worries, "worries"],
  [/^#\/worries\/review$/, review, "worries"],
  [/^#\/help$/, help, "help"],
  [/^#\/settings$/, settings, "settings"],
];

const NAV = ["home", "battery", "prepare", "worries", "help", "settings"];

async function start(): Promise<void> {
  let prefs = loadPrefs();
  setLocale(prefs.locale);
  applyPrefs(prefs);
  const { store, persistent } = await openStore();
  const main = document.getElementById("app")!;
  const nav = document.getElementById("nav")!;
  let lastHash = "";

  const app: App = {
    store,
    get prefs() {
      return prefs;
    },
    persistent,
    today: () => isoDay(new Date()),
    nowMinutes: () => {
      const d = new Date();
      return d.getHours() * 60 + d.getMinutes();
    },
    go: (path) => {
      if (location.hash === path) render();
      else location.hash = path;
    },
    refresh: () => render(true),
    setPrefs: (p) => {
      prefs = { ...prefs, ...p };
      savePrefs(prefs);
      setLocale(prefs.locale);
      applyPrefs(prefs);
      render(true);
    },
  };

  async function render(keepPlace = false): Promise<void> {
    const hash = location.hash || "#/";
    const route = ROUTES.find(([re]) => re.test(hash)) ?? ROUTES[0]!;
    const params = (hash.match(route[0]) ?? []).slice(1).filter((x): x is string => x !== undefined);
    document.title = `${t(`nav.${route[2]}`)} · ${t("app.name")}`;
    nav.replaceChildren(
      ...NAV.map((n) =>
        h("a", { href: n === "home" ? "#/" : `#/${n}`, "aria-current": n === route[2] ? "page" : undefined }, t(`nav.${n}`)),
      ),
    );
    nav.setAttribute("aria-label", t("a11y.nav"));
    document.getElementById("skip")!.textContent = t("a11y.skip");
    const scroll = window.scrollY;
    const view = await route[1](app, params);
    main.replaceChildren(view);
    if (keepPlace && hash === lastHash) {
      window.scrollTo(0, scroll);
    } else {
      window.scrollTo(0, 0);
      // Move focus to the page title, so screen readers announce the new page.
      const title = main.querySelector<HTMLElement>("h1, #page-title");
      if (title && lastHash) {
        title.tabIndex = -1;
        title.focus({ preventScroll: true });
      }
    }
    lastHash = hash;
  }

  window.addEventListener("hashchange", () => render());
  await render();

  if (import.meta.env.PROD && "serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "127.0.0.1" || location.hostname === "localhost")) {
    navigator.serviceWorker.register("./sw.js").catch(() => undefined);
  }
}

start();
