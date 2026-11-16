import { toMinutes, type View } from "../app.ts";
import { newId, type Worry } from "../db.ts";
import { t } from "../i18n.ts";
import { worryOutcomes } from "../stats.ts";
import { announce, h } from "../ui.ts";

const DAY = 86_400_000;

export const worries: View = async (app) => {
  const all = (await app.store.all("worries")).sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
  const waiting = all.filter((w) => w.status === "waiting");
  const reviewed = all.filter((w) => w.status !== "waiting").sort((a, b) => ((b.reviewedAt ?? "") > (a.reviewedAt ?? "") ? 1 : -1));
  const toCheck = reviewed.find((w) => !w.outcome && w.reviewedAt && Date.now() - Date.parse(w.reviewedAt) >= 7 * DAY);
  const outcomes = worryOutcomes(all);
  const start = toMinutes(app.prefs.worryTime);
  const early = app.nowMinutes() < start;

  const input = h("textarea", { id: "worry", rows: 2, maxLength: 500 });
  const addForm = h(
    "form",
    {
      class: "card",
      onsubmit: async (e: Event) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;
        await app.store.put("worries", { id: newId(), text, createdAt: new Date().toISOString(), status: "waiting" });
        announce(t("worries.added", { time: app.prefs.worryTime }));
        app.refresh();
      },
    },
    h("label", { for: "worry" }, t("worries.add.label")),
    input,
    h("button", { type: "submit" }, t("worries.add.button")),
  );

  const setOutcome = async (w: Worry, outcome: Worry["outcome"]) => {
    await app.store.put("worries", { ...w, outcome, outcomeAt: new Date().toISOString() });
    app.refresh();
  };

  return h(
    "section",
    { "aria-labelledby": "page-title" },
    h("h1", { id: "page-title" }, t("worries.title")),
    h("p", {}, t("worries.intro")),
    addForm,
    h(
      "div",
      { class: "card" },
      h("label", { for: "worry-time" }, t("worries.time.label")),
      h("input", {
        id: "worry-time",
        type: "time",
        value: app.prefs.worryTime,
        onchange: (e: Event) => {
          const v = (e.target as HTMLInputElement).value;
          if (/^\d{2}:\d{2}$/.test(v)) {
            app.setPrefs({ worryTime: v });
            announce(t("common.saved"));
          }
        },
      }),
      h("p", { class: "subtle" }, t("worries.time.help")),
    ),
    h("h2", {}, t("worries.waiting")),
    waiting.length === 0
      ? h("p", { class: "subtle" }, t("worries.none"))
      : [
          h("ul", { class: "list" }, waiting.map((w) => h("li", {}, w.text))),
          early && h("p", { class: "subtle" }, t("worries.review.early", { time: app.prefs.worryTime })),
          h("a", { class: "button", href: "#/worries/review" }, t("worries.review.start")),
        ],
    toCheck &&
      h(
        "div",
        { class: "card" },
        h("h2", {}, t("worries.check.title")),
        h("p", {}, t("worries.check.q", { text: toCheck.text })),
        h(
          "div",
          { class: "row" },
          h("button", { type: "button", class: "secondary", onclick: () => setOutcome(toCheck, "happened") }, t("worries.check.happened")),
          h("button", { type: "button", class: "secondary", onclick: () => setOutcome(toCheck, "partly") }, t("worries.check.partly")),
          h("button", { type: "button", class: "secondary", onclick: () => setOutcome(toCheck, "not") }, t("worries.check.not")),
        ),
      ),
    h(
      "p",
      { class: "subtle" },
      outcomes.total > 0 ? t("worries.check.stats", { ...outcomes }) : t("worries.check.none"),
    ),
    reviewed.length > 0 && [
      h("h2", {}, t("worries.reviewed")),
      h(
        "ul",
        { class: "list" },
        reviewed.slice(0, 30).map((w) =>
          h(
            "li",
            {},
            w.text,
            h("br", {}),
            h("span", { class: "subtle" }, w.status === "actionable" && w.step ? t("worries.nextstep", { step: w.step }) : t("worries.letgo")),
            " ",
            h(
              "button",
              {
                type: "button",
                class: "link",
                "aria-label": `${t("common.delete")} : ${w.text}`,
                onclick: async () => {
                  await app.store.remove("worries", w.id);
                  app.refresh();
                },
              },
              t("common.delete"),
            ),
          ),
        ),
      ),
    ],
  );
};

/** The worry time itself: one worry at a time, two questions at most. */
export const review: View = async (app) => {
  const waiting = (await app.store.all("worries")).filter((w) => w.status === "waiting").sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
  const w = waiting[0];
  if (!w) {
    return h("section", { "aria-labelledby": "page-title" }, h("h1", { id: "page-title" }, t("worries.done")), h("a", { class: "button", href: "#/worries" }, t("common.back")));
  }
  const body = h("div", { class: "card" });
  const save = async (patch: Partial<Worry>) => {
    await app.store.put("worries", { ...w, ...patch, reviewedAt: new Date().toISOString() });
    app.refresh();
  };
  const ask = () =>
    body.replaceChildren(
      h("p", { class: "lead" }, w.text),
      h("p", {}, t("worries.q.actionable")),
      h("div", { class: "row" }, h("button", { type: "button", onclick: actionable }, t("worries.a.yes")), h("button", { type: "button", class: "secondary", onclick: hypothetical }, t("worries.a.no"))),
    );
  const actionable = () => {
    const step = h("input", { id: "step", type: "text", maxLength: 300 });
    body.replaceChildren(
      h("p", { class: "lead" }, w.text),
      h(
        "form",
        {
          onsubmit: (e: Event) => {
            e.preventDefault();
            if (step.value.trim()) save({ status: "actionable", step: step.value.trim() });
          },
        },
        h("label", { for: "step" }, t("worries.step.label")),
        step,
        h("button", { type: "submit" }, t("worries.step.save")),
      ),
    );
    step.focus();
  };
  const hypothetical = () =>
    body.replaceChildren(
      h("p", { class: "lead" }, w.text),
      h("h2", {}, t("worries.hypo.title")),
      h("p", {}, t("worries.hypo.text")),
      h("ol", {}, h("li", {}, t("worries.hypo.ex1")), h("li", {}, t("worries.hypo.ex2")), h("li", {}, t("worries.hypo.ex3"))),
      h("button", { type: "button", onclick: () => save({ status: "letgo" }) }, t("worries.hypo.letgo")),
    );
  ask();
  return h(
    "section",
    { "aria-labelledby": "page-title" },
    h("p", {}, h("a", { href: "#/worries" }, `← ${t("common.back")}`)),
    h("h1", { id: "page-title" }, t("worries.review.progress", { total: waiting.length })),
    body,
  );
};
