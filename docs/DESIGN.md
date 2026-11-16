# Design principles

Yoyū is meant for people who can be tired by noise, surprises and pressure, including from apps. Each principle below is applied in the code and, where possible, tested.

| Principle | In practice | Checked by |
|---|---|---|
| Predictable | The same six places, in the same order, on every screen. One column. Buttons say what they do. | Review |
| Calm | Soft colours with enough contrast, no animation at all (also for people who did not ask for reduced motion), no sound, no notification. | axe-core contrast checks in light and dark themes |
| No pressure | No streak, no score, no red badge. A missed day changes nothing. | Review |
| Readable | System fonts with Japanese and Chinese fallbacks, three text sizes, large touch targets (44 px). | axe-core |
| Accessible | Labels on every field, live announcements after saving, focus moved to the page title on navigation, a skip link, keyboard use everywhere. | axe-core (WCAG 2.1 A and AA rules), Playwright |
| Honest | Statistics say when there are not enough days. Patterns are called clues. The Help page says the app is not care. | Unit tests |
| Private | Everything on the device, nothing sent. | Playwright test that records every request |
| Works offline | Installed as an app from the browser; works without network after the first visit. | Playwright test with the network cut |

Automated accessibility checks catch only part of the problems. Feedback from people who use screen readers, high zoom or switch access is the next step.
