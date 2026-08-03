# Sandhi Ninja

Live site: [https://sandhi-ninja.vercel.app](https://sandhi-ninja.vercel.app)

Sandhi Ninja is a Sanskrit sandhi practice app built with React, Phaser, Vite, and a same-repo TypeScript backend. The current live app centers on three game modes, family-based word filters, campaign graduation, and multilingual sandhi explanations.

## What It Does

- `Sandhi Splitting`: choose the correct sandhi, then split at the correct akshara boundary
- `Sandhi Joining`: choose the correct sandhi and join adjacent padani back into a compound
- `Ninja Slice`: a speed-focused split mode that shows the target sandhi directly and tests placement/timing
- `Learn`, `Practice`, and `Challenge` session presets
- advanced controls for `With clock` / `No clock`, answer reveal duration, and `Auto next` / `Stay here`
- `Mixed`, `Svara`, `Vyanjana`, and `Visarga` family filters
- campaign mastery and graduation across built-in `Sandhi Splitting` and `Sandhi Joining`
- feedback that distinguishes:
  - correct place + correct sandhi
  - correct place + wrong sandhi
  - wrong place + sandhi valid elsewhere in the word
  - both wrong
- red/shake wrong-attempt feedback on board interactions
- answer reveal after repeated misses, including sandhi name, split place, sutra number, nimittam, and explanation
- randomized word flow with stable per-word rule ordering in the dock
- responsive desktop and mobile layout
- UI in `English`, `Sanskrit`, and `Telugu`

## Current Scope

### Gameplay Bank

The built-in gameplay bank currently covers three sandhi families:

- `Svara`
- `Vyanjana`
- `Visarga`

Current built-in playable pool:

- `Mixed`: `392` unique gameplay-eligible root words
- `Svara`: `160` words containing at least one svara-sandhi step
- `Vyanjana`: `168` words containing at least one vyanjana-sandhi step
- `Visarga`: `69` words containing at least one visarga-sandhi step

Important counting note:

- `Mixed` is the unique playable pool
- family counts are membership counts, not disjoint buckets
- a multi-step word may belong to more than one family, so `160 + 168 + 69` is expected to be greater than `392`

Gameplay currently teaches 23 rule types:

- `Svara`: Savarṇa Dīrgha, Guṇa, Vṛddhi, Yaṇ, Ayavāyāva, Pūrvarūpa, Pararūpa
- `Vyanjana`: Jaśtva, Charva, Anunāsika, Anusvāra, Pūrvasavarṇa, Parasavarṇa, Chhatva, Tugāgama, Ścutva, Ṣṭutva, N-Final Satva, Yavalopa
- `Visarga`: Visarga-Satva, Visarga-Repha, Visarga-Lopa, Visarga-Ootvam

### Explorer / Analyzer

The same-repo analyzer backend currently supports deterministic `svara-sandhi reversal` for:

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

- `Sandhi Splitting`: choose the sandhi, then split at the shown gold boundary guide
- `Sandhi Joining`: choose sandhi and join valid neighboring pieces
- `Ninja Slice`: falling-word style split mode with direct target-sandhi display

### 2. Session Presets

- `Learn`: full help, no clock, answer reveal allowed, manual next, no campaign mastery
- `Practice`: teaching help visible, no clock by default, manual next, clean solves count toward mastery
- `Challenge`: lighter help, 4 lives, clock on by default, auto-next by default, clean solves count toward mastery

### 3. Coaching and Feedback

- guided hints after repeated misses
- reveal after repeated failures
- clear distinction between boundary mistakes and rule mistakes
- red/shake wrong-attempt feedback on the active word or join boundary
- `splits left` indicator during play

### 4. Campaign and Graduation

- graduation depends on mastering the built-in word bank in both `Sandhi Splitting` and `Sandhi Joining`
- `Learn` mode never grants mastery
- `Practice` and `Challenge` grant mastery only for clean solves without `Show answer`
- `Ninja Slice` is optional in v1 and does not affect graduation
- endless review stays available after graduation

### 5. Analyzer Backend

- same-repo API via `POST /api/sandhi/analyze`
- normalization across `IAST`, `Devanagari`, and `Telugu`
- ranked candidate analyses with step-by-step metadata
- current analyzer scope is `svara-first`, narrower than the gameplay bank

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
- family counts overlap by design because one built-in word may carry more than one sandhi family in its full split chain
- the analyzer is rule-based and does not yet validate against a lexical or morphology database
- custom entries live in browser storage
- the explorer and the game share the same rule definitions, but only the explorer depends on the analyzer API path
