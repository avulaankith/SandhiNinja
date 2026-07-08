# Sandhi Ninja

Live website: [https://sandhi-ninja.vercel.app](https://sandhi-ninja.vercel.app)

Sandhi Ninja is a Sanskrit sandhi practice web app built with React, Phaser, Vite, and a same-repo TypeScript backend. The current version combines fast gameplay, guided feedback, and a separate sandhi analysis section for trying supported chedas on new samasta padams.

## What The Current Version Includes

- `Arcade Slice`: fast rounds focused on choosing the correct sandhi and cutting at the correct split point
- `Full Split`: recursive play for words that can be split more than once
- `Practice mode`: the solved word stays on screen until the user clicks `Next word`
- `Timed` and `Untimed` play modes
- Randomized word order on refresh and across sessions
- Rule-aware feedback that tells the learner whether:
  - both the split place and sandhi were correct
  - the place was correct but the sandhi was wrong
  - the sandhi was valid but at a different place
  - both were wrong
- `Sandhi Explorer`: a separate section where the user can enter a word in `IAST`, `Devanagari`, or `Telugu` and inspect supported svara-sandhi analyses step by step
- `Custom Builder`: analyzer results can be saved into the local game bank for future practice
- Multilingual UI in `English`, `Sanskrit`, and `Telugu`
- Updated `Sandhi Ninja` branding and logo mark

## Supported Svara-Sandhi Rules

The current analyzer and gameplay bank support these deterministic svara-sandhi reversals:

- `Savarna Dirgha`
- `Guna`
- `Vrddhi`
- `Yan`
- `Ayavayava`
- `Purvarupa`
- `Pararupa`

## Tech Stack

- `React 19`
- `TypeScript`
- `Vite`
- `Phaser 4`
- `Framer Motion`
- `Node.js` + `Express`

## Architecture

The repo is split into a small client/server/shared structure:

```text
src/
  components/        React UI
  data/              game bank, rules, copy
  game/              Phaser runtime and scene logic
  styles/            global visual system
  types/             gameplay types
  utils/             client helpers and explorer adapter

server/
  engine/            sandhi analyzer engine
  routes/            API handlers

shared/
  contracts/         request/response types
  core/              normalization and transliteration helpers

tests/
  engine.test.mjs    engine and API contract tests
```

The `Sandhi Explorer` calls `POST /api/sandhi/analyze` when the backend is available. For supported rules, the client also has a local fallback path so the explorer can still function if the API is unavailable.

## Local Development

Install dependencies:

```bash
npm install
```

Run frontend and backend together:

```bash
npm run dev
```

Run them separately if needed:

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
npm start
```

During local development, Vite proxies `/api/*` to `http://127.0.0.1:3001`.

## Production Build

Create production assets:

```bash
npm run build
```

Start the Node server:

```bash
npm start
```

The production server serves:

- the built frontend from `dist/`
- the API from `/api/*`

## API

### `POST /api/sandhi/analyze`

Request body:

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

Health response:

```json
{
  "status": "ok"
}
```

## Deployment

### Vercel

Current live deployment:

- [https://sandhi-ninja.vercel.app](https://sandhi-ninja.vercel.app)

To deploy from GitHub:

1. Push this repo to GitHub.
2. In Vercel, create a new project from the repo.
3. Use these settings:

```bash
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
```

4. Deploy.

The app uses same-origin `/api/*` requests when the backend is available. The explorer also includes a client fallback for supported rule analysis, which keeps the feature usable even if the deployed environment is frontend-first.

### Render

This repo also includes [render.yaml](/Users/ankith/github/SandhiNinja/render.yaml:1) for a single Node service deploy.

Manual settings:

```bash
Build Command: npm install && npm run build
Start Command: npm start
```

Health check:

- `/api/health`

## Testing

Run the analyzer and API tests with:

```bash
npm test
```

## Notes And Limitations

- The current analyzer is rule-based and does not yet do dictionary or morphology validation.
- Custom entries are stored locally in browser storage.
- Gameplay and explorer share rule data, but only the explorer depends on the API path.
