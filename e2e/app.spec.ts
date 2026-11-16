// The app as a person uses it, in a real browser: offline, nothing sent, accessible, data kept.

import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import fs from "node:fs";

const PAGES = ["#/", "#/battery", "#/prepare", "#/worries", "#/help", "#/settings"];

async function open(page: Page, hash = "#/") {
  await page.goto(`./${hash}`);
  await expect(page.locator("main h1")).toBeVisible();
}

test("nothing ever leaves the device", async ({ page, baseURL }) => {
  const origin = new URL(baseURL!).origin;
  const outside: string[] = [];
  page.on("request", (r) => {
    const u = new URL(r.url());
    if (u.protocol.startsWith("http") && u.origin !== origin) outside.push(r.url());
  });
  for (const p of PAGES) await open(page, p);
  await page.fill("#passphrase", "a long enough passphrase");
  expect(outside).toEqual([]);
});

test("it works offline after the first visit", async ({ page, context }) => {
  await open(page);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator("main h1")).toBeVisible();
  await page.goto("./#/battery");
  await expect(page.locator("#energy")).toBeVisible();
  await context.setOffline(false);
});

test("a battery log is kept after a reload, and the chart shows it", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("yoyu.prefs", JSON.stringify({ locale: "en" })));
  await open(page, "#/battery");
  await page.locator("#energy").fill("3");
  await page.getByRole("checkbox", { name: "Noise", exact: true }).check();
  await page.getByRole("checkbox", { name: "A walk", exact: true }).check();
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.locator("#live")).toHaveText("Logged. Thank you.");
  await page.reload();
  await expect(page.locator("#energy")).toHaveValue("3");
  await expect(page.getByRole("checkbox", { name: "Noise", exact: true })).toBeChecked();
  await expect(page.locator("svg.chart rect.bar")).toHaveCount(1);
  await open(page, "#/");
  await expect(page.getByText("energy 3 out of 10")).toBeVisible();
});

test("worry time: write down, then sort", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("yoyu.prefs", JSON.stringify({ locale: "en" })));
  await open(page, "#/worries");
  await page.fill("#worry", "The report is due Friday");
  await page.getByRole("button", { name: "Write down for later" }).click();
  await expect(page.locator(".list li", { hasText: "The report is due Friday" })).toBeVisible();
  await page.fill("#worry", "What if the train is cancelled next month");
  await page.getByRole("button", { name: "Write down for later" }).click();
  await expect(page.locator(".list li", { hasText: "What if the train" })).toBeVisible();
  await page.getByRole("link", { name: "Start my worry time" }).click();
  await expect(page.getByText("The report is due Friday")).toBeVisible();
  await page.getByRole("button", { name: "Yes, I can act" }).click();
  await page.fill("#step", "Write the outline tonight");
  await page.getByRole("button", { name: "Keep this step" }).click();
  await expect(page.getByText("What if the train is cancelled next month")).toBeVisible();
  await page.getByRole("button", { name: "No, it is a “what if…”" }).click();
  await page.getByRole("button", { name: "I let it pass for today" }).click();
  await expect(page.locator("main h1")).toHaveText("That is all for today.");
  await open(page, "#/worries");
  await expect(page.getByText("Next step: Write the outline tonight")).toBeVisible();
});

test("a template becomes my card, and the day mode walks through it", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("yoyu.prefs", JSON.stringify({ locale: "ja" })));
  await open(page, "#/prepare");
  await page.locator(".templates button").first().click();
  await expect(page.locator("#steps")).toBeVisible();
  await page.locator("button[type=submit]").click();
  await page.getByRole("link", { name: "当日モード" }).click();
  await expect(page.getByText("ステップ 1 / 6")).toBeVisible();
  await page.getByRole("link", { name: "次のステップ" }).click();
  await expect(page.getByText("ステップ 2 / 6")).toBeVisible();
});

test("an encrypted backup restores everything after erasing", async ({ page }) => {
  test.setTimeout(60_000);
  await page.addInitScript(() => localStorage.setItem("yoyu.prefs", JSON.stringify({ locale: "en" })));
  await open(page, "#/battery");
  await page.locator("#energy").fill("7");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.locator("#live")).toHaveText("Logged. Thank you.");
  await open(page, "#/settings");
  await page.fill("#passphrase", "my very long passphrase");
  const [dl] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Create a backup" }).click()]);
  const file = await dl.path();
  expect(fs.readFileSync(file, "utf8")).toContain('"format":"yoyu-backup"');
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Erase everything" }).click();
  await expect(page.locator("main h1")).toContainText("Today");
  await expect(page.getByText("You have not logged your battery today yet.")).toBeVisible();
  await open(page, "#/settings");
  await page.fill("#passphrase", "my very long passphrase");
  await page.setInputFiles("#backup-file", file);
  await expect(page.getByRole("status").first()).toContainText("Backup restored: 1 items.");
  await open(page, "#/battery");
  await expect(page.locator("#energy")).toHaveValue("7");
});

for (const locale of ["fr", "ja"]) {
  for (const theme of ["light", "dark"]) {
    test(`no accessibility violation (${locale}, ${theme})`, async ({ page }) => {
      await page.addInitScript(([l, th]) => localStorage.setItem("yoyu.prefs", JSON.stringify({ locale: l, theme: th })), [locale, theme]);
      for (const p of PAGES) {
        await open(page, p);
        const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
        expect(r.violations.map((v) => `${p} ${v.id}: ${v.nodes.length}`)).toEqual([]);
      }
    });
  }
}
