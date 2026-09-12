# monhundle-web

MonHundle's Vue 3 / Vite frontend.

## Prerequisites

- **Docker** and **Docker Compose** (Docker Desktop on Windows). That's the only dependency: **Node/npm don't need to be installed the host machine**, everything runs in the containers defined in `docker-compose.yaml` (located in `src/frontend-web/`, one level above this folder).
- Optional but recommended for a full browser experience: the MonHundle backend (`src/monhundle/`) running locally — otherwise the app loads but API calls fail. Neither the unit tests nor the current Cypress spec need it (they stub the API responses).

## Project setup

From `src/frontend-web/` (where `docker-compose.yaml` lives):

```sh
docker compose up -d
```

Then, to enter the development container:

```sh
docker compose exec frontend sh
```

And, inside the container, once in this folder (`cd monhundle-web` if needed):

```sh
npm install
```

## Compile and Hot-Reload for Development

Still inside the `frontend` container:

```sh
npm run dev
```

The app is served at [http://localhost:5173](http://localhost:5173) (the port is mapped to the host by `docker-compose.yaml`).

## Run Unit Tests with [Vitest](https://vitest.dev/)

Inside the `frontend` container:

```sh
npm run test:unit
```

To type-check (what CI runs before the tests):

```sh
npx vue-tsc --noEmit
```

## Run End-to-End Tests with [Cypress](https://www.cypress.io/)

E2E tests run in a **dedicated container** (`cypress`, official `cypress/included` image), separate from the development container. It never starts with `docker compose up` (it sits behind an `e2e` profile) — it has to be invoked explicitly.

**Prerequisite**: the dev server must already be running in the `frontend` container (`npm run dev`, see above) — the `cypress` container tests against it via `http://frontend:5173`.

From the host (not from inside a container — this command drives Docker itself), in `src/frontend-web/`:

```sh
docker compose run --rm cypress
```

Alternative: a container named `cypress-e2e` is created after a first run and stays visible in Docker Desktop — clicking ▶ **Start** on it reruns the suite (test files are volume-mounted, so it always picks up the latest changes).

### Running against every browser

`cypress/included` bundles Chrome, Edge, and Firefox alongside its default Electron, so a single browser can be targeted with `--browser`:

```sh
docker compose run --rm cypress --browser chrome
```

To run the whole suite against all of them in one command (each runs in turn; the command exits non-zero if any browser failed):

```sh
docker compose run --rm --entrypoint sh cypress -c 'STATUS=0; for b in electron chrome firefox; do cypress run --browser $b || STATUS=1; done; exit $STATUS'
```

### Run results

- **Screenshots** of failed tests: `cypress/screenshots/` (nothing is generated for a passing test).
- **Videos**: disabled by default (`video: false`), nothing in `cypress/videos/` unless enabled in `cypress.config.ts`.

Both folders are in `.gitignore` — they're run artifacts, not source code.

## Type-Check, Compile and Minify for Production

```sh
npm run build
```

Runs type-checking (`vue-tsc`) then compiles (`vite build`). This is what CI runs before any deployment.

## Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## Environment variables

`.env` (local development) and `.env.production` define:
- `VITE_API_URL` — the backend API's base URL.
- `VITE_ICON_CDN_URL` — the base URL of the CDN serving monster icons.

These files are already committed with defaults suited for local development; only adjust them if the backend runs elsewhere.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur if installed).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we use `vue-tsc` instead of the `tsc` CLI for type checking. In editors, [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) is needed to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See the [Vite Configuration Reference](https://vite.dev/config/).
