# Custos Nox — Dashboard

Marketing landing + sample event feed for [Custos Nox](https://github.com/cryptoyasenka/custos-nox),
an open-source real-time attack monitor for Solana multisigs and DAOs.

## What this repo contains

A single-page Next.js 16 (App Router) site that:

- Explains what Custos Nox catches and maps each detector to a step of the
  Drift April 2026 attack chain.
- Shows a **sample event feed** — a replay of the devnet smoke-harness run,
  not live mainnet data (labeled as such per the zero-fiction rule).
- Gives a copy-paste quick-start for self-hosting the daemon.

## Local dev

```bash
npm install
npm run dev   # http://localhost:3000
```

## Build

```bash
npm run build
npm start
```

## Tech

- Next.js 16 + React 19 + App Router
- Tailwind CSS v4 (`@theme` tokens, no config file)
- TypeScript, strict mode
- Inline SVG bar chart — no chart library dependency
- Geist Sans + Mono

## Deploy

Hosted on Vercel. `main` branch auto-deploys.

## License

MIT, same as the daemon.
