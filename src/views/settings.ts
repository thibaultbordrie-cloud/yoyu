import type { View } from "../app.ts";
import { BackupError, decrypt, encrypt, MIN_PASSPHRASE, restore, snapshot } from "../backup.ts";
import { LOCALE_NAMES, LOCALES, t, type Locale } from "../i18n.ts";
import { isoDay } from "../stats.ts";
import { announce, download, h, type Prefs } from "../ui.ts";

export const settings: View = async (app) => {
  const select = <K extends keyof Prefs>(key: K, label: string, options: [string, string][]) =>
    h(
      "div",
      {},
      h("label", { for: `pref-${key}` }, label),
      h(
        "select",
        { id: `pref-${key}`, onchange: (e: Event) => app.setPrefs({ [key]: (e.target as HTMLSelectElement).value } as Partial<Prefs>) },
        options.map(([v, text]) => h("option", { value: v, selected: app.prefs[key] === v }, text)),
      ),
    );

  const pass = h("input", { id: "passphrase", type: "password", autocomplete: "new-password", minLength: MIN_PASSPHRASE });
  const file = h("input", { id: "backup-file", type: "file", accept: ".json,application/json", class: "visually-hidden", tabIndex: -1, "aria-label": t("settings.backup.import") });
  const status = h("p", { role: "status" });
  const say = (m: string) => {
    status.textContent = m;
    announce(m);
  };
  const checkPass = () => {
    if (pass.value.length < MIN_PASSPHRASE) {
      say(t("settings.backup.short"));
      pass.focus();
      return false;
    }
    return true;
  };

  file.addEventListener("change", async () => {
    const f = file.files?.[0];
    file.value = "";
    if (!f || !checkPass()) return;
    try {
      const n = await restore(app.store, await decrypt(await f.text(), pass.value));
      pass.value = "";
      say(t("settings.backup.restored", { n }));
    } catch (e) {
      say(e instanceof BackupError ? t("settings.backup.wrong") : String(e));
    }
  });

  return h(
    "section",
    { "aria-labelledby": "page-title" },
    h("h1", { id: "page-title" }, t("settings.title")),
    h(
      "div",
      { class: "card" },
      select("locale", t("settings.language"), LOCALES.map((l: Locale) => [l, LOCALE_NAMES[l]])),
      select("theme", t("settings.theme"), [
        ["auto", t("theme.auto")],
        ["light", t("theme.light")],
        ["dark", t("theme.dark")],
      ]),
      select("size", t("settings.textsize"), [
        ["normal", t("size.normal")],
        ["large", t("size.large")],
        ["xlarge", t("size.xlarge")],
      ]),
    ),
    h(
      "div",
      { class: "card" },
      h("h2", {}, t("settings.backup.title")),
      h("p", {}, t("settings.backup.text")),
      h("label", { for: "passphrase" }, t("settings.backup.pass")),
      pass,
      h(
        "div",
        { class: "row" },
        h(
          "button",
          {
            type: "button",
            onclick: async () => {
              if (!checkPass()) return;
              const text = await encrypt(await snapshot(app.store), pass.value);
              download(`yoyu-${isoDay(new Date())}.json`, text);
              pass.value = "";
              say(t("settings.backup.done"));
            },
          },
          t("settings.backup.export"),
        ),
        h("button", { type: "button", class: "secondary", onclick: () => checkPass() && file.click() }, t("settings.backup.import")),
      ),
      file,
      status,
    ),
    h(
      "div",
      { class: "card" },
      h("h2", {}, t("settings.erase.title")),
      h("p", {}, t("settings.erase.text")),
      h(
        "button",
        {
          type: "button",
          class: "danger",
          onclick: async () => {
            if (!confirm(t("settings.erase.confirm"))) return;
            await app.store.clear();
            announce(t("settings.erased"));
            app.go("#/");
          },
        },
        t("settings.erase.button"),
      ),
    ),
    h("p", { class: "subtle" }, t("settings.install")),
  );
};
