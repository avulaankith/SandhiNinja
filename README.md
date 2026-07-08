# Sandhi Ninja

Sandhi Ninja is a Sanskrit sandhi practice web app built with React, Phaser, Vite, and a same-repo TypeScript backend.

It currently includes:

- `Arcade Slice`: quick gameplay for cutting at the correct sandhi boundary
- `Full Split`: recursive splitting mode for words with multiple valid cuts
- `Sandhi Explorer`: enter a samasta padam in IAST, Devanagari, or Telugu and inspect supported svara-sandhi chedas step by step
- `Custom Builder`: save analyzer results into the local game bank or create custom practice words

## Supported Svara-Sandhi Reversal Rules

The backend analyzer currently supports deterministic reversal for:

- Savarna Dirgha
- Guna
- Vrddhi
- Yan
- Ayavayayava
- Purvarupa
- Pararupa

## Tech Stack

- `React 19`
- `Phaser 4`
- `Vite`
- `TypeScript`
- `Node.js` backend for API + static asset serving

## Project Structure

```text
src/
  components/        React UI
  data/              game bank and UI copy
  game/              Phaser runtime and scene logic
  styles/            global styles
  utils/             client-side helpers

server/
  engine/            sandhi analyzer engine
  routes/            API handlers

shared/
  contracts/         request/response types
  core/              shared rules + Sanskrit normalization helpers

tests/
  engine.test.mjs    engine and API contract tests
```

## Development

Install dependencies:

```bash
npm install
```

Run the frontend and backend together:

```bash
npm run dev
```

Run them separately if needed:

```bash
npm run dev:client
npm run dev:server
```

In local development, Vite proxies `/api/*` requests to `http://127.0.0.1:3001`.

## Build and Run

Create production builds:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

The Node server serves both:

- the built frontend from `dist/`
- the API from `/api/*`

## Deploy

The simplest deployment path for the current architecture is a single Node web service on Render, because the same server handles both static frontend files and the `/api` routes.

### Render

This repo includes [render.yaml](/Users/ankith/github/SandhiNinja/render.yaml:1) for a basic web-service deploy.

1. Push the repo to GitHub.
2. In Render, create a new Blueprint or Web Service from that GitHub repo.
3. If you use the Blueprint flow, Render will read `render.yaml`.
4. If you create the service manually, use:

```bash
Build Command: npm install && npm run build
Start Command: npm start
```

5. Render should expose the app on its assigned `PORT`. The server already reads `PORT` and now binds to `0.0.0.0` by default for hosted environments.

Health check:

- `/api/health`

### GitHub Push

If you want to create a new public repo from this directory with GitHub CLI, the usual flow is:

```bash
git init
git add .
git commit -m "Initial commit"
gh repo create SandhiNinja --public --source=. --remote=origin --push
```

If the repo already exists on GitHub, the usual flow is:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

## Tests

Run the analyzer and API tests:

```bash
npm test
```

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

The API normalizes the input across scripts and returns ranked candidate analyses with:

- normalized forms
- final split words
- step-by-step sandhi reversal details
- sūtra metadata

### `GET /api/health`

Returns a basic health payload for hosting checks:

```json
{
  "status": "ok"
}
```

## Notes

- The analyzer is rule-based in the current version and does not yet do lexical or morphology validation.
- Custom entries are stored locally in browser storage.
