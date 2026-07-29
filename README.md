# Sandhi Ninja

Live site: [https://sandhi-ninja.vercel.app](https://sandhi-ninja.vercel.app)

Sandhi Ninja is a Sanskrit sandhi practice app built with React, Phaser, Vite, and a same-repo TypeScript backend. It combines game-style sandhi splitting and joining with guided explanations, sutra references, and a separate explorer for analyzing new samasta padams.

## What It Does

- `Sandhi Splitting`: choose the correct sandhi, then split at the correct akshara boundary
- `Sandhi Joining`: choose the correct sandhi and join adjacent padani back into a compound
- `Practice mode`: the current word stays on screen until the learner presses `Next word`
- `Timed` and `Untimed` play
- `Guided` and `Challenge` study modes
- `Mixed`, `Svara`, `Vyanjana`, and `Visarga` family filters
- feedback that distinguishes:
  - correct place + correct sandhi
  - correct place + wrong sandhi
  - wrong place + sandhi valid elsewhere in the word
  - both wrong
- answer reveal after repeated misses, including sandhi name, split place, sutra number, nimittam, and explanation
- randomized word flow with stable per-word rule ordering in the dock
- separate `Sandhi Explorer` for entering a word in `IAST`, `Devanagari`, or `Telugu`
- local custom entry workflow with save, edit, delete, import, and export
- responsive desktop and mobile layout
- UI in `English`, `Sanskrit`, and `Telugu`

## Current Scope

### Gameplay Bank

The gameplay bank covers three sandhi families:

- `Svara`
- `Vyanjana`
- `Visarga`

Gameplay includes 23 taught rule types:

- `Svara`: Savarṇa Dīrgha, Guṇa, Vṛddhi, Yaṇ, Ayavāyāva, Pūrvarūpa, Pararūpa
- `Vyanjana`: Jaśtva, Charva, Anunāsika, Anusvāra, Pūrvasavarṇa, Parasavarṇa, Chhatva, Tugāgama, Ścutva, Ṣṭutva, N-Final Satva, Yavalopa
- `Visarga`: Visarga-Satva, Visarga-Repha, Visarga-Lopa, Visarga-Ootvam

### Explorer / Analyzer

The explorer backend currently supports deterministic `svara-sandhi reversal` for:

- `Savarna Dirgha`
- `Guna`
- `Vrddhi`
- `Yan`
- `Ayavayava`
- `Purvarupa`
- `Pararupa`

The explorer returns normalized forms, ranked candidate analyses, split steps, sutra metadata, nimitta, and multilingual explanations.

## Product Areas

### 1. Game Modes

- `Sandhi Splitting`: Phaser-based slicing interaction
- `Sandhi Joining`: choose sandhi and join valid neighboring pieces
- `Practice mode`: no forced advance after success

### 2. Coaching

- guided hints after repeated misses
- reveal after repeated failures
- clear distinction between boundary mistakes and rule mistakes
- “splits left” indicator during play

### 3. Sandhi Explorer

- separate section from gameplay
- input in `IAST`, `Devanagari`, or `Telugu`
- same-repo API via `POST /api/sandhi/analyze`
- client fallback for supported analyzer rules if the API is unavailable

### 4. Custom Content

- locally save analyzer results into the practice bank
- create manual entries in Dev Studio
- import/export JSON
- edit or delete custom entries stored in browser storage

## Tech Stack

- `React 19`
- `TypeScript`
- `Vite`
- `Phaser 4`
- `Framer Motion`
- `Node.js` HTTP server for same-origin production serving
- Vercel-compatible serverless route wrappers in `api/`

## Repo Layout

```text
src/
  components/        React UI
  data/              sandhi bank, rules, and UI copy
  game/              Phaser runtime and scene logic
  styles/            global styling and responsive layout
  types/             gameplay and content types
  utils/             client helpers and explorer adapter

server/
  engine/            recursive sandhi analyzer
  routes/            API route logic shared by local server and Vercel wrappers

shared/
  contracts/         request/response types
  core/              rules, normalization, transliteration helpers

api/
  health.ts          Vercel health route
  sandhi/analyze.ts  Vercel analyzer route

tests/
  engine.test.mjs    analyzer and API tests
```

## Local Development

Install dependencies:

```bash
npm install
```

Run frontend and backend together:

```bash
npm run dev
```

Run them separately:

```bash
npm run dev:client
npm run dev:server
```

Useful scripts:

```bash
npm run build
npm run build:client
npm run build:server
npm run test
npm run preview
npm start
```

During local development, Vite proxies `/api/*` to `http://127.0.0.1:3001`.

## Production

### Node Server

Build:

```bash
npm run build
```

Start:

```bash
npm start
```

The Node server:

- serves the built frontend from `dist/`
- serves `/api/sandhi/analyze`
- serves `/api/health`

### Vercel

Current production:

- [https://sandhi-ninja.vercel.app](https://sandhi-ninja.vercel.app)

Deploy from the repo root:

```bash
npx vercel@latest deploy --prod --yes
```

This repo already includes:

- `vercel.json` for frontend + API rewrites
- `api/` serverless entrypoints for Vercel

### Render

This repo includes [render.yaml](/Users/ankith/github/SandhiNinja/render.yaml:1) for a single Node service deploy.

Manual settings:

```bash
Build Command: npm install && npm run build
Start Command: npm start
```

Health check:

- `/api/health`

## API

### `POST /api/sandhi/analyze`

Request:

```json
{
  "input": "शिवालयः",
  "script": "auto",
  "maxResults": 10
}
```

Accepted `script` values:

- `auto`
- `iast`
- `devanagari`
- `telugu`

Response includes:

- normalized forms in `IAST`, `Devanagari`, and `Telugu`
- ranked candidate analyses
- final split words
- step-by-step rule applications
- sutra, nimitta, and explanation metadata

### `GET /api/health`

Response:

```json
{
  "status": "ok"
}
```

## Testing

Run the analyzer and API tests:

```bash
npm test
```

## Notes

- gameplay support is broader than analyzer support; the analyzer is still `svara-first`
- the analyzer is rule-based and does not yet validate against a lexical or morphology database
- custom entries live in browser storage
- the explorer and the game share the same rule definitions, but only the explorer depends on the analyzer API path
