# Yoyū 余裕

[![ci](https://github.com/thibaultbordrie-cloud/yoyu/actions/workflows/ci.yml/badge.svg)](https://github.com/thibaultbordrie-cloud/yoyu/actions/workflows/ci.yml)
![Local-first](https://img.shields.io/badge/data-stays%20on%20the%20device-2f6f6a)
![Offline](https://img.shields.io/badge/works-offline-2f6f6a)
![a11y](https://img.shields.io/badge/axe--core-WCAG%202.1%20AA%20rules-2f6f6a)
![Languages](https://img.shields.io/badge/FR%20·%20EN%20·%20日本語%20·%20繁體中文-lightgrey)
![License: MIT](https://img.shields.io/badge/License-MIT-lightgrey)

**A calm web app for autistic adults and people living with anxiety: notice what drains and what recharges you, prepare the situations that cost you, and give worries a place in the day. Everything stays on the device.**

*Yoyū* means "margin, room to breathe". The app is not a treatment; it is an organising tool built on well-known ideas ([sources](docs/FOUNDATIONS.md)).

**[Open Yoyū](https://thibaultbordrie-cloud.github.io/yoyu/)** · on a phone, "Add to Home Screen" installs it like an app.

[日本語](#日本語での概要) · [繁體中文](#中文簡介繁體) · [Français](#en-bref-français)

## Three tools

**Battery.** In the evening, twenty seconds: energy left, sensory load, social load, anxiety, and what drained or recharged the day (noise, meetings, phone calls, unexpected changes, masking; time alone, nature, a special interest, a walk…). The app shows the last four weeks and, after 14 days, the tags that go with a clearly different energy level. It says plainly when there are not enough days to conclude, and calls patterns clues, not causes.

**Prepare.** Cards for situations that cost energy: a phone call, a medical appointment, a work meeting, a train or bus trip, a change of plan. Each card holds what will happen, ready-made phrases, what to bring, a plan B, and how to recover afterwards. An "on the day" mode shows one step at a time in large text.

**Worries.** When a worry comes, write it down and keep it for a fixed daily worry time. Then, one worry at a time: is it a current problem you can act on (write the smallest next step), or a "what if" about the future (practise accepting not knowing, for today)? A week later, the app asks whether it happened, and keeps the count.

## Built for calm and for privacy

| | |
|---|---|
| **Nothing leaves the device** | No account, no server, no analytics. Notes live in the browser's storage. A test records every request and fails if one goes elsewhere. |
| **Encrypted backups** | AES-256-GCM with a passphrase only the person knows (PBKDF2-SHA-256, 600,000 iterations). |
| **Works offline** | Installed from the browser; tested with the network cut. |
| **Calm by design** | No animation, no notification, no streak or score, the same six places on every screen, three text sizes, light and dark themes. See [docs/DESIGN.md](docs/DESIGN.md). |
| **Accessible** | Labels, live announcements, focus management, keyboard use; axe-core finds no WCAG 2.1 A/AA rule violation on any page, in French and Japanese, light and dark. |
| **Honest** | No pattern before 14 days; a statistical test with a correction for the number of tags; on 60 logs of pure noise, at most 3 show a pattern (tested). |
| **Not care** | No wording promises care, checked by a test in all four languages. The Help page gives crisis lines for France (3114), Japan and Taiwan (1925). |

## Run it

The live version needs nothing. To work on it (Node 22.18 or later):

```bash
git clone https://github.com/thibaultbordrie-cloud/yoyu.git && cd yoyu
npm ci
npm run dev          # http://127.0.0.1:5173
npm test             # unit tests: statistics, encryption, translations, wording
npm run build && npm run e2e   # browser tests: offline, no request out, accessibility, backups
```

No runtime dependency: the app is plain TypeScript and the browser's own APIs (IndexedDB, Web Crypto, service worker). Vite, TypeScript and Playwright are development tools only.

## Next

- **My user manual**: a page to share with an employer or relatives, saying what helps, what costs, and which adjustments work.
- Reviews of the Japanese and Traditional Chinese texts by native speakers, and of the worry module by a psychologist.
- Testing with autistic and anxious adults, and changes from what they say. Feedback is welcome in the issues.

## 日本語での概要

Yoyū（余裕）は、自閉スペクトラムの大人や不安を抱える人のための、静かなウェブアプリです。夜に「バッテリー」を記録して何で消耗し何で回復するかを知る、負担の大きい場面（電話、病院、会議、移動、予定の変更）を準備する、心配ごとを決まった「心配タイム」まで置いておく、の3つの道具があります。記録はすべて端末の中にとどまり、どこにも送信されません。オフラインで使え、アニメーションも通知もありません。治療ではなく、整理のための道具です。日本語の文章は、ネイティブの方の確認を歓迎します。

## 中文簡介（繁體）

Yoyū（餘裕）是一個給自閉症成人和焦慮者使用的安靜網頁應用。三個工具：晚上記錄「電量」，看出什麼讓你耗電、什麼幫你充電；為吃力的情境（講電話、看醫生、開會、搭車、計畫改變）做準備；把擔心先寫下來，留到每天固定的「擔心時間」再處理。所有紀錄都只留在裝置上，不會傳送到任何地方。可離線使用，沒有動畫、沒有通知。它不是治療，而是整理的工具。歡迎母語者協助校閱中文內容。

## En bref (français)

Yoyū (余裕, « avoir de la marge ») est une application web calme pour les adultes autistes et les personnes qui vivent avec l'anxiété. Trois outils : noter le soir sa « batterie » pour voir ce qui vide et ce qui recharge, préparer les situations qui coûtent (appel, rendez-vous médical, réunion, trajet, changement de programme), et garder ses inquiétudes pour un « temps d'inquiétude » fixe. Tout reste sur l'appareil, rien n'est envoyé. Elle marche hors ligne, sans animation ni notification. Ce n'est pas un soin, c'est un outil d'organisation.

## License

MIT.
