import type { View } from "../app.ts";
import type { CheckIn } from "../db.ts";
import { formatDay, t } from "../i18n.ts";
import { MIN_DAYS, addDays, patterns, series, week } from "../stats.ts";
import { announce, h } from "../ui.ts";

export const DRAINS = ["noise", "crowd", "meeting", "call", "change", "transport", "screens", "lowsleep", "conflict", "admin", "masking"];
export const RECHARGERS = ["alone", "nature", "interest", "music", "walk", "sleep", "routine", "quiet", "animal", "create"];
const SCALES = ["energy", "sensory", "social", "anxiety"] as const;

const SVG = "http://www.w3.org/2000/svg";
function svg(tag: string, attrs: Record<string, string | number>): SVGElement {
  const el = document.createElementNS(SVG, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  return el;
}

function chart(points: { date: string; energy: number | null }[]): Element {
  const w = 28 * 12;
  const hgt = 110;
  const root = svg("svg", { viewBox: `0 0 ${w} ${hgt}`, class: "chart", role: "img", "aria-label": t("battery.chart.label") });
  root.append(svg("line", { x1: 0, x2: w, y1: hgt - 10, y2: hgt - 10, class: "axis" }));
  points.forEach((p, i) => {
    const x = i * 12 + 2;
    if (p.energy === null) {
      root.append(svg("circle", { cx: x + 4, cy: hgt - 10, r: 1.5, class: "missing" }));
      return;
    }
    const bh = Math.max(2, (p.energy / 10) * (hgt - 20));
    const bar = svg("rect", { x, y: hgt - 10 - bh, width: 8, height: bh, rx: 2, class: "bar" });
    const title = svg("title", {});
    title.textContent = `${formatDay(p.date, { day: "numeric", month: "short" })} · ${p.energy}/10`;
    bar.append(title);
    root.append(bar);
  });
  return root;
}

export const battery: View = async (app) => {
  const today = app.today();
  const all = await app.store.all("checkins");
  let day = today;
  const byDay = () => all.find((c) => c.date === day);

  const form = h("form", { class: "card", "aria-labelledby": "checkin-title" });
  const fill = () => {
    const existing = byDay();
    const values: CheckIn = existing ?? { date: day, energy: 5, sensory: 3, social: 3, anxiety: 3, drains: [], rechargers: [], note: "", updatedAt: "" };
    form.replaceChildren(
      h("h2", { id: "checkin-title" }, formatDay(day)),
      h("label", { for: "day" }, t("battery.date")),
      h("input", {
        id: "day",
        type: "date",
        value: day,
        max: today,
        onchange: (e: Event) => {
          const v = (e.target as HTMLInputElement).value;
          if (v && v <= today) {
            day = v;
            fill();
          }
        },
      }),
      ...SCALES.map((s) => {
        const out = h("output", { id: `${s}-out`, for: s }, values[s]);
        return h(
          "div",
          { class: "scale" },
          h("label", { for: s }, t(`battery.${s}`), " ", out),
          h("input", {
            id: s,
            name: s,
            type: "range",
            min: 0,
            max: 10,
            step: 1,
            value: values[s],
            "aria-valuetext": `${values[s]} / 10`,
            oninput: (e: Event) => {
              const el = e.target as HTMLInputElement;
              out.textContent = el.value;
              el.setAttribute("aria-valuetext", `${el.value} / 10`);
            },
          }),
          h("div", { class: "scale-ends", "aria-hidden": "true" }, h("span", {}, `0 · ${t(`battery.${s}.low`)}`), h("span", {}, `${t(`battery.${s}.high`)} · 10`)),
        );
      }),
      chips("drains", t("battery.drains"), DRAINS, values.drains),
      chips("rechargers", t("battery.rechargers"), RECHARGERS, values.rechargers),
      h("label", { for: "note" }, t("battery.note"), h("span", { class: "subtle" }, ` (${t("common.optional")})`)),
      h("textarea", { id: "note", name: "note", rows: 2, maxLength: 1000, value: values.note }),
      h("button", { type: "submit" }, t("common.save")),
    );
  };
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const checkin: CheckIn = {
      date: day,
      energy: Number(data.get("energy")),
      sensory: Number(data.get("sensory")),
      social: Number(data.get("social")),
      anxiety: Number(data.get("anxiety")),
      drains: data.getAll("drains").map(String),
      rechargers: data.getAll("rechargers").map(String),
      note: String(data.get("note") ?? "").trim(),
      updatedAt: new Date().toISOString(),
    };
    await app.store.put("checkins", checkin);
    announce(t("battery.saved"));
    app.refresh();
  });
  fill();

  const w = week(all, today);
  const before = week(all, addDays(today, -7));
  const found = patterns(all);
  const label = (tag: string) => t(`tag.${tag}`);

  return h(
    "section",
    { "aria-labelledby": "page-title" },
    h("h1", { id: "page-title" }, t("battery.title")),
    h("p", {}, t("battery.intro")),
    form,
    h(
      "div",
      { class: "card" },
      h("h2", {}, t("battery.history")),
      all.length ? chart(series(all, today)) : h("p", { class: "subtle" }, t("battery.chart.empty")),
      h("h3", {}, t("battery.week")),
      w.days > 0 && h("p", {}, t("battery.week.avg", { ...w })),
      before.days > 0 && h("p", { class: "subtle" }, t("battery.week.compare", { energy: before.energy })),
      h("h3", {}, t("battery.patterns")),
      all.length < MIN_DAYS
        ? h("p", {}, t("battery.patterns.need", { n: MIN_DAYS - all.length, min: MIN_DAYS }))
        : found.found.length === 0
          ? h("p", {}, t("battery.patterns.none"))
          : h(
              "ul",
              {},
              found.found.map((p) =>
                h("li", {}, t(p.diff < 0 ? "battery.pattern.lower" : "battery.pattern.higher", { tag: label(p.tag), diff: Math.abs(p.diff), with: p.with, without: p.without })),
              ),
            ),
      all.length >= MIN_DAYS && h("p", { class: "subtle" }, t("battery.patterns.caution")),
      h("p", { class: "subtle" }, t("battery.days", { n: all.length })),
    ),
  );
};

function chips(name: string, legend: string, tags: string[], selected: string[]): HTMLElement {
  return h(
    "fieldset",
    { class: "chips" },
    h("legend", {}, legend),
    tags.map((tag) =>
      h(
        "label",
        { class: "chip" },
        h("input", { type: "checkbox", name, value: tag, checked: selected.includes(tag) }),
        h("span", {}, t(`tag.${tag}`)),
      ),
    ),
  );
}
