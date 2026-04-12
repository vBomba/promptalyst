# Promptalyst (frontend)

Angular app for **Prompt Analyzer & Optimizer** (see repository root `prd.md`).

## Prerequisites

- Node.js + npm
- OpenAI API key

## Local run

1. Copy `.env.example` to `.env` in this folder and set `OPENAI_API_KEY`.
2. `npm install`
3. `npm start` — open `http://localhost:4200/`

Traffic uses `/openai/...`; the dev proxy forwards to `https://api.openai.com` and adds the Bearer token from `.env` (OpenAI does not allow direct browser calls due to CORS).

## Build

`npm run build` — production config points at the public API URL; for real use you still need a same-origin proxy or backend.

## Theming

Tokens align with `ecolabel-apps/frontend`: Lexend, `--eco-*` variables, light/dark body classes.
