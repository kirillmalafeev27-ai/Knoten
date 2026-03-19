# Knot Words

Knot Words is a Render-ready language game that adapts the visual language of `Knot Dots` into a German sentence-building puzzle. The project is split into modules so it can grow into a fuller app without collapsing back into a single HTML file.

## What is included

- Canvas renderer with the original atmosphere: ambient glow, layered path strokes, particles, waves, staggered intros, Web Audio signals.
- Profile screen for learner name, age, CEFR level, and topic.
- Sentence-path gameplay with fallback content packs for `A1`, `A2`, `B1`, and `B2`.
- Win modal with sentence review and TTS replay.
- LocalStorage persistence for the learner profile.
- Built-in Node server for Render that serves the frontend and proxies Anthropic requests with a server-side API key.

## Project structure

```text
index.html
server.js
render.yaml
styles/
  main.css
src/
  App.js
  audio/
  core/
  data/
  render/
  services/
  ui/
```

## Run locally

The easiest local run now uses the same Node server that Render will use.

1. Create a local env file from `.env.example` if you want live Anthropic generation.
2. Start the app:

```powershell
cd C:\Users\pc\Downloads\knot-words-site
npm start
```

Then open `http://localhost:10000`.

If `ANTHROPIC_API_KEY` is missing, the app still works with built-in fallback levels.

## Deploy on Render

1. Push this folder to a GitHub repository.
2. In Render, create a new Web Service from that repo.
3. Render can auto-detect `render.yaml`, or you can set these values manually:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Health Check Path: `/healthz`
4. In the Render environment, set:
   - `ANTHROPIC_API_KEY`
   - Optional: `ANTHROPIC_MODEL`
   - Optional: `ANTHROPIC_VERSION`
   - Optional: `ANTHROPIC_MAX_TOKENS`
5. Deploy. The frontend and API live on the same Render URL.

The included [render.yaml](c:\Users\pc\Downloads\knot-words-site\render.yaml) already describes the service and leaves `ANTHROPIC_API_KEY` unsynced so you can enter it securely in Render.

## How the API works

The frontend now prefers the same-origin endpoint `/api/levels`. That means:

- On Render: it talks to the built-in Node server automatically.
- In other environments: you can still override the endpoint with `window.KNOT_WORDS_API_URL` or `localStorage.setItem("knotWords.apiUrl", "...")`.

Expected API response contract:

```json
{
  "levels": [
    {
      "id": "generated-a2-1",
      "sentences": [
        {
          "tokens": ["Ich", "lerne", "jeden Tag", "Deutsch"],
          "translation": "I learn German every day.",
          "grammar_note": "Zeitangaben stehen oft im Mittelfeld."
        }
      ]
    }
  ]
}
```

The server calls Anthropic's Messages API with the `x-api-key` and `anthropic-version` headers and returns only validated JSON level data. If validation fails or the request errors, the frontend falls back to built-in levels automatically.
