# <img src="app/icon.svg" alt="Plynk Logo" width="72px"> Plynk

**A URL shortener that uses Pastebin as its storage backend.**

Plynk shortens URLs by encrypting them and storing the ciphertext as a Pastebin paste. The paste ID becomes the short slug. No database required — Pastebin *is* the database.

[![Plynk on Vercel](https://img.shields.io/badge/WebApp-plynk.vercel.app-54c934?style=for-the-badge&logo=vercel)](https://plynk.vercel.app/)

---

## How It Works

1. **Shorten** — The user pastes a long URL into the form and picks an expiration.
2. **Push** (`/api/push`) — The server encrypts the URL with AES-256-GCM and posts the ciphertext to Pastebin using your developer API key. The paste ID is then obfuscated with a Caesar-style cipher before being returned as the short slug.
3. **Redirect** — Visiting `plynk.vercel.app/<slug>` triggers the `404.html` page, which immediately calls `/api/pull` with the slug.
4. **Pull** (`/api/pull`) — The server fetches the raw paste, decrypts it, and returns the original URL. The browser then redirects.

```
User → pastes URL → /api/push → encrypts → Pastebin (stores ciphertext)
                                         → obfuscates paste ID → returns slug

User → visits /<slug> → 404.html → /api/pull → deobfuscates slug → Pastebin
                                              → decrypts → browser redirects
```

---

## Features

- **No database** — Pastebin is the only storage layer.
- **Obfuscated slugs** — The Pastebin paste ID is scrambled with a Caesar-style cipher before being surfaced as the short slug, so slugs don't directly expose the underlying paste ID.
- **Encrypted at rest** — URLs are AES-256-GCM encrypted before being stored. Raw paste content is unreadable without the server's key.
- **Expiration control** — Choose from 10 minutes, 1 hour, 1 day, 1 week, 2 weeks, 1 month, 6 months, 1 year, or never.
- **QR code generation** — Every shortened link can be displayed as a scannable QR code.
- **Copy to clipboard** — One-click copy of the generated short URL.
- **Light/dark theme** — Respects system preference, with a manual override that persists via `localStorage`.
- **PWA-ready** — Includes a web manifest and full icon set for installable app behaviour.
- **Self-hostable** — Deploy to Vercel (or any Node.js-compatible serverless host) with a few environment variables.

---

## Project Structure

```
plynk/
├── index.html              # Main page (shorten form)
├── 404.html                # Redirect page (handles all /<slug> routes)
├── api/
│   ├── push.js             # Serverless handler: encrypt + post to Pastebin
│   └── pull.js             # Serverless handler: fetch from Pastebin + decrypt
├── scripts/
│   ├── theme.js            # Light/dark theme switching (runs in <head>)
│   ├── body/
│   │   ├── create-link.js      # Form submit → calls /api/push
│   │   ├── expiration-click.js # Expiration selector UI
│   │   └── qr-config.js        # QR code rendering + copy-to-clipboard
│   └── head/
│       └── redirect.js         # Slug detection + calls /api/pull → redirects
├── styles/
│   ├── main.scss / main.css    # Core styles
│   └── jetbrainsmono.*         # Bundled JetBrains Mono font
├── fonts/                  # Self-hosted JetBrains Mono (woff/woff2)
├── app/                    # Icons, OG images, PWA manifest
├── package.json
└── LICENSE                 # MIT
```

Each `.js` file has a corresponding `.min.js` — the minified version actually loaded in production.

---

## Deployment (Vercel)

### 1. Fork / clone the repo

```bash
git clone https://github.com/NaeemBolchhi/plynk.git
cd plynk
```

### 2. Set environment variables

In your Vercel project settings (or a local `.env` file for testing), set:

| Variable | Description |
|---|---|
| `PUSH_TOKENS` | JSON array of Pastebin API key objects: `[{"dev_key":"...","user_key":"..."}]` |
| `SALT_STRING` | A random string used as the default encryption salt |
| `PASS_STRING` | A random string used as the encryption password |
| `CYPHER_CASES` | A string of characters used as the alphabet for slug obfuscation (e.g. all alphanumeric chars in a shuffled order) |

**Getting Pastebin credentials:**
- Sign up at [pastebin.com](https://pastebin.com) and go to your [API page](https://pastebin.com/doc_api) to get a `dev_key`.
- To get a `user_key`, call the Pastebin login API endpoint with your credentials (see [Pastebin API docs](https://pastebin.com/doc_api#2)).

> **Tip:** Add multiple key objects to `PUSH_TOKENS` to have Plynk pick one randomly.

### 3. Deploy

```bash
npx vercel
```

Vercel automatically serves `404.html` for any unmatched route, which is how `/<slug>` redirects are handled without a separate routing config.

---

## Encryption & Slug Obfuscation

### URL encryption

URLs are encrypted in `api/push.js` before being stored:

- **Algorithm:** AES-256-GCM (authenticated encryption)
- **Key derivation:** `scrypt(PASS_STRING, user_pass_or_SALT_STRING, 32)`
- **Stored format:** `base64(IV [16 bytes] + Auth Tag [16 bytes] + Ciphertext)`

Decryption in `api/pull.js` reverses this exactly. The auth tag ensures tamper detection — a modified paste will fail to decrypt.

### Slug obfuscation

After the paste is created, the raw Pastebin paste ID is not exposed directly as the slug. Instead:

1. A random displacer digit (1–9) is chosen.
2. Each character of the paste ID that appears in `CYPHER_CASES` is shifted forward in that alphabet by the displacer amount (wrapping around).
3. The displacer digit is appended as the final character of the slug.

On redirect, `/api/pull` reads the last character as the displacer, strips it, then shifts every character back by that amount to recover the real paste ID before fetching from Pastebin.

---

## Local Development

There are no build steps required for the frontend. For the serverless API functions you need the Vercel CLI:

```bash
npm install -g vercel
vercel dev
```

This starts a local dev server that emulates the Vercel serverless environment, including reading your `.env` file.

---

## Browser Support

Works in any modern browser with support for the Fetch API, Web Crypto, and the Clipboard API. The QR code component uses [`@bitjson/qr-code`](https://github.com/bitjson/qr-code) loaded from unpkg.

---

## License

[MIT](LICENSE) © 2026 NaeemBolchhi