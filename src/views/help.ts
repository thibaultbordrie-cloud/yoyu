import type { View } from "../app.ts";
import { t } from "../i18n.ts";
import { h } from "../ui.ts";

export const SOURCE_URL = "https://github.com/thibaultbordrie-cloud/yoyu";

export const help: View = async () =>
  h(
    "section",
    { "aria-labelledby": "page-title" },
    h("h1", { id: "page-title" }, t("help.title")),
    h("p", { class: "lead" }, t("help.notcare")),
    h(
      "div",
      { class: "card crisis" },
      h("h2", {}, t("help.crisis.title")),
      h("p", {}, t("help.crisis.intro")),
      h(
        "ul",
        {},
        h("li", {}, t("help.crisis.fr")),
        h("li", {}, t("help.crisis.jp")),
        h("li", {}, t("help.crisis.tw")),
        h("li", {}, t("help.crisis.other")),
      ),
    ),
    h("h2", {}, t("help.pro.title")),
    h("p", {}, t("help.pro.text")),
    h("h2", {}, t("help.privacy.title")),
    h("p", {}, t("help.privacy.text")),
    h("h2", {}, t("help.about.title")),
    h("p", {}, t("help.about.text")),
    h("p", {}, h("a", { href: SOURCE_URL, rel: "noopener noreferrer", target: "_blank" }, t("help.source"))),
  );
