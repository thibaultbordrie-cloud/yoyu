import type { View } from "../app.ts";
import { TEMPLATES } from "../content/situations.ts";
import { newId, type Card } from "../db.ts";
import { formatDay, locale, t } from "../i18n.ts";
import { announce, h, lines } from "../ui.ts";

const whenLabel = (when?: string) => (when ? formatDay(when.slice(0, 10)) + (when.length > 10 ? ` · ${when.slice(11, 16)}` : "") : "");

export const prepare: View = async (app) => {
  const cards = (await app.store.all("cards")).sort((a, b) => (b.updatedAt > a.updatedAt ? 1 : -1));

  const create = async (templateId?: string) => {
    const tpl = TEMPLATES.find((x) => x.id === templateId)?.text[locale()];
    const now = new Date().toISOString();
    const card: Card = {
      id: newId(),
      template: templateId,
      title: tpl?.title ?? "",
      steps: tpl?.steps ?? [],
      phrases: tpl?.phrases ?? [],
      bring: tpl?.bring ?? [],
      planB: tpl?.planB ?? [],
      recovery: tpl?.recovery ?? "",
      checked: [],
      createdAt: now,
      updatedAt: now,
    };
    await app.store.put("cards", card);
    app.go(`#/prepare/edit/${card.id}`);
  };

  return h(
    "section",
    { "aria-labelledby": "page-title" },
    h("h1", { id: "page-title" }, t("prepare.title")),
    h("p", {}, t("prepare.intro")),
    h("h2", {}, t("prepare.mine")),
    cards.length === 0
      ? h("p", { class: "subtle" }, t("prepare.mine.none"))
      : h(
          "ul",
          { class: "list" },
          cards.map((c) => h("li", {}, h("a", { href: `#/prepare/card/${c.id}` }, c.title || t("prepare.untitled")), c.when && h("span", { class: "subtle" }, ` · ${whenLabel(c.when)}`))),
        ),
    h("h2", {}, t("prepare.templates")),
    h(
      "ul",
      { class: "templates" },
      TEMPLATES.map((tpl) =>
        h(
          "li",
          { class: "card" },
          h("span", { class: "icon", "aria-hidden": "true" }, tpl.icon),
          h("strong", {}, tpl.text[locale()].title),
          h("button", { type: "button", class: "secondary", onclick: () => create(tpl.id) }, t("prepare.use")),
        ),
      ),
      h("li", { class: "card" }, h("span", { class: "icon", "aria-hidden": "true" }, "+"), h("strong", {}, t("prepare.blank")), h("button", { type: "button", class: "secondary", onclick: () => create() }, t("prepare.use"))),
    ),
  );
};

async function load(app: Parameters<View>[0], id: string | undefined): Promise<Card | undefined> {
  return (await app.store.all("cards")).find((c) => c.id === id);
}

export const card: View = async (app, [id]) => {
  const c = await load(app, id);
  if (!c) return h("p", {}, h("a", { href: "#/prepare" }, t("common.back")));
  const list = (title: string, items: string[]) => items.length > 0 && [h("h2", {}, title), h("ul", {}, items.map((x) => h("li", {}, x)))];
  return h(
    "section",
    { "aria-labelledby": "page-title" },
    h("p", {}, h("a", { href: "#/prepare" }, `← ${t("common.back")}`)),
    h("h1", { id: "page-title" }, c.title || t("prepare.untitled")),
    c.when && h("p", { class: "subtle" }, whenLabel(c.when)),
    h(
      "div",
      { class: "row" },
      c.steps.length > 0 && h("a", { class: "button", href: `#/prepare/day/${c.id}` }, t("prepare.dayMode")),
      h("a", { class: "button secondary", href: `#/prepare/edit/${c.id}` }, t("common.edit")),
    ),
    list(t("prepare.steps"), c.steps),
    list(t("prepare.phrases"), c.phrases),
    c.bring.length > 0 && [
      h("h2", {}, t("prepare.bring")),
      h(
        "ul",
        { class: "checklist" },
        c.bring.map((item, i) =>
          h(
            "li",
            {},
            h(
              "label",
              {},
              h("input", {
                type: "checkbox",
                checked: c.checked.includes(i),
                onchange: async (e: Event) => {
                  const on = (e.target as HTMLInputElement).checked;
                  c.checked = on ? [...new Set([...c.checked, i])] : c.checked.filter((x) => x !== i);
                  c.updatedAt = new Date().toISOString();
                  await app.store.put("cards", c);
                },
              }),
              " ",
              item,
            ),
          ),
        ),
      ),
    ],
    list(t("prepare.planB"), c.planB),
    c.recovery && [h("h2", {}, t("prepare.recovery")), h("p", {}, c.recovery)],
  );
};

export const edit: View = async (app, [id]) => {
  const c = await load(app, id);
  if (!c) return h("p", {}, h("a", { href: "#/prepare" }, t("common.back")));
  const field = (key: string, label: string, value: string, rows = 4) => [
    h("label", { for: key }, label),
    h("textarea", { id: key, name: key, rows, value, maxLength: 5000 }),
  ];
  const form = h(
    "form",
    {
      class: "card",
      onsubmit: async (e: Event) => {
        e.preventDefault();
        const d = new FormData(form);
        const s = (k: string) => String(d.get(k) ?? "");
        const bring = lines(s("bring"));
        Object.assign(c, {
          title: s("title").trim(),
          when: s("when") || undefined,
          steps: lines(s("steps")),
          phrases: lines(s("phrases")),
          bring,
          planB: lines(s("planB")),
          recovery: s("recovery").trim(),
          checked: c.checked.filter((i) => i < bring.length),
          updatedAt: new Date().toISOString(),
        });
        await app.store.put("cards", c);
        announce(t("common.saved"));
        app.go(`#/prepare/card/${c.id}`);
      },
    },
    h("label", { for: "title" }, t("prepare.field.title")),
    h("input", { id: "title", name: "title", type: "text", value: c.title, maxLength: 200 }),
    h("label", { for: "when" }, t("prepare.field.when"), h("span", { class: "subtle" }, ` (${t("common.optional")})`)),
    h("input", { id: "when", name: "when", type: "datetime-local", value: c.when && c.when.length === 10 ? `${c.when}T09:00` : (c.when ?? "") }),
    field("steps", t("prepare.field.steps"), c.steps.join("\n"), 6),
    field("phrases", t("prepare.field.phrases"), c.phrases.join("\n"), 5),
    field("bring", t("prepare.field.bring"), c.bring.join("\n")),
    field("planB", t("prepare.field.planB"), c.planB.join("\n")),
    field("recovery", t("prepare.field.recovery"), c.recovery, 2),
    h(
      "div",
      { class: "row" },
      h("button", { type: "submit" }, t("common.save")),
      h(
        "button",
        {
          type: "button",
          class: "danger",
          onclick: async () => {
            if (!confirm(t("prepare.delete.confirm"))) return;
            await app.store.remove("cards", c.id);
            app.go("#/prepare");
          },
        },
        t("common.delete"),
      ),
    ),
  );
  return h("section", { "aria-labelledby": "page-title" }, h("p", {}, h("a", { href: `#/prepare/card/${c.id}` }, `← ${t("common.back")}`)), h("h1", { id: "page-title" }, c.title || t("prepare.untitled")), form);
};

/** One step at a time, large text, nothing else on screen. */
export const day: View = async (app, [id, stepRaw]) => {
  const c = await load(app, id);
  if (!c || c.steps.length === 0) return h("p", {}, h("a", { href: "#/prepare" }, t("common.back")));
  const i = Math.min(Math.max(Number(stepRaw ?? 0) || 0, 0), c.steps.length - 1);
  const last = i === c.steps.length - 1;
  return h(
    "section",
    { class: "day", "aria-labelledby": "page-title" },
    h("p", { class: "subtle", id: "page-title" }, `${c.title} · ${t("prepare.step", { n: i + 1, total: c.steps.length })}`),
    h("p", { class: "step", "aria-live": "polite" }, c.steps[i]!),
    h(
      "div",
      { class: "row" },
      i > 0 && h("a", { class: "button secondary", href: `#/prepare/day/${c.id}/${i - 1}` }, t("prepare.prev")),
      last ? h("a", { class: "button", href: `#/prepare/card/${c.id}` }, t("prepare.finish")) : h("a", { class: "button", href: `#/prepare/day/${c.id}/${i + 1}` }, t("prepare.next")),
    ),
    c.phrases.length > 0 && h("details", {}, h("summary", {}, t("prepare.phrases")), h("ul", {}, c.phrases.map((p) => h("li", {}, p)))),
    c.planB.length > 0 && h("details", {}, h("summary", {}, t("prepare.planB")), h("ul", {}, c.planB.map((p) => h("li", {}, p)))),
  );
};
