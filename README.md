# Promptalyst

Nx-style monorepo: **Angular** (`apps/web/`), **NestJS** (`apps/api/`), shared **`libs/contracts`**.

## Prerequisites

- Node.js + npm (see `apps/web/package.json` for `packageManager` pin).

## Local development

1. **API keys:** copy `apps/api/.env.example` to `apps/api/.env` and set `OPENAI_API_KEY`.

2. From the **repository root**:

```bash
npm install
npm run dev
```

This runs **Nest** on `http://localhost:3333` and **Angular** on `http://localhost:4200`. The Angular dev server proxies `/api` to Nest (see `apps/web/proxy.conf.cjs`). Chat completions go **only** through the backend; the browser never holds the OpenAI secret.

The UI shell is **`vb-app-shell`** from vbomba-ui: left **sidenav** navigation, top toolbar with theme toggle, and **`vb-select`** for UI language in the header actions slot. Routes live under `ShellLayoutComponent` (`apps/web/src/app/layout/`); the analyzer is at **`/analyzer`** (redirect from **`/`**).

3. Useful targets:

```bash
npx nx serve api
npx nx serve web
npx nx build api
npx nx build web
```

After structural moves, if Nx behaves oddly: `npx nx reset`.

## UI

The app uses **[vbomba-ui](https://www.npmjs.com/package/vbomba-ui)** theme SCSS (`apps/web/src/styles.scss`) and **`VbThemeService.init()`** in the root component. **`vb-theme-toggle`** switches light/dark (`app-light-theme` / `app-dark-theme` on `body`).

## Logging

Nest uses **nestjs-pino** (JSON logs to stdout). Send `X-Request-Id` from the client (Angular interceptor) for correlation. **Do not** log prompt bodies in new code.

## Repo layout

| Path | Role |
|------|------|
| `apps/web/` | Angular SPA |
| `apps/api/` | Nest API (OpenAI proxy, throttling, client telemetry) |
| `libs/contracts/` | Shared TypeScript contracts |
