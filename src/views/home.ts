import { toMinutes, type View } from "../app.ts";
import { newId } from "../db.ts";
import { formatDay, t } from "../i18n.ts";
import { announce, h } from "../ui.ts";

export const home: View = async (app) => {
  const today = app.today();
  const [checkins, worries, cards] = await Promise.all([app.store.all("checkins"), app.store.all("worries"), app.store.all("cards")]);
  const todayCheckin = checkins.find((c) => c.date === today);
  const waiting = worries.filter((w) => w.status === "waiting");
  const start = toMinutes(app.prefs.worryTime);
  const isWorryTime = app.nowMinutes() >= start && app.nowMinutes() < start + 30;
  const upcoming = cards
    .filter((c) => c.when && c.when.slice(0, 10) >= today)
    .sort((a, b) => (a.when! < b.when! ? -1 : 1))[0];

  const quick = h("textarea", { id: "quick-worry", rows: 2, maxLength: 500 });
  const quickForm = h(
    "form",
    {
      class: "card",
      onsubmit: async (e: Event) => {
        e.preventDefault();
        const text = quick.value.trim();
        if (!text) return;
        await app.store.put("worries", { id: newId(), text, createdAt: new Date().toISOString(), status: "waiting" });
        quick.value = "";
        announce(t("worries.added", { time: app.prefs.worryTime }));
        app.refresh();
      },
    },
    h("label", { for: "quick-worry" }, t("home.quick.label")),
    quick,
    h("button", { type: "submit" }, t("worries.add.button")),
  );

  return h(
    "section",
    { "aria-labelledby": "page-title" },
    h("h1", { id: "page-title" }, t("home.title"), h("span", { class: "subtle" }, ` · ${formatDay(today)}`)),
    h(
      "div",
      { class: "card" },
      todayCheckin
        ? h("p", {}, t("home.checkin.done", { energy: todayCheckin.energy }))
        : [h("p", {}, t("home.checkin.todo")), h("a", { class: "button", href: "#/battery" }, t("home.checkin.cta"))],
    ),
    h(
      "div",
      { class: "card" },
      h("p", {}, t("home.worries.waiting", { n: waiting.length })),
      h("p", {}, isWorryTime ? t("home.worries.now") : t("home.worries.time", { time: app.prefs.worryTime })),
      waiting.length > 0 && h("a", { class: "button secondary", href: "#/worries" }, t("home.worries.cta")),
    ),
    quickForm,
    h(
      "div",
      { class: "card" },
      upcoming
        ? [h("p", {}, t("home.prepare.next")), h("a", { href: `#/prepare/card/${upcoming.id}` }, `${upcoming.title} · ${formatDay(upcoming.when!.slice(0, 10))}`)]
        : [h("p", {}, t("home.prepare.none")), h("a", { class: "button secondary", href: "#/prepare" }, t("home.prepare.cta"))],
    ),
    h("p", { class: "subtle" }, t("home.privacy")),
  );
};
