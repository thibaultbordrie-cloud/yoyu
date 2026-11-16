# Security and privacy

Please report a vulnerability privately through **Security → Report a vulnerability** on this repository, not in a public issue.

Yoyū holds notes about energy, anxiety and difficult situations: health-related data. The design keeps them out of reach of anyone but the person:

- **No server, no account, no analytics.** The app is static files. Notes are stored in the browser's IndexedDB on the device. An end-to-end test records every request the app makes and fails if one leaves the site's origin.
- **A strict Content Security Policy**: scripts, styles and connections from the app's own origin only; no inline script, no form submission anywhere.
- **No HTML from data.** Every piece of text is inserted as text, never parsed as HTML.
- **Encrypted backups**: AES-256-GCM, key derived from a passphrase with PBKDF2-SHA-256 (600,000 iterations, random salt). The passphrase is never stored. A backup file cannot lower the key-derivation cost, and restored data is checked against the shapes the app writes before anything is stored.
- **No dependency at run time.** The shipped code is this repository's TypeScript, compiled; development tools are not shipped.

Limits: anyone who can unlock the device and open the browser can read the notes, as with any app without its own lock. A lock screen on the device is the protection.
