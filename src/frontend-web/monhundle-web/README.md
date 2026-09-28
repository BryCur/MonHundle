# monhundle-web

MonHundle's Vue 3 / Vite frontend.

## Prerequisites

- **Docker** and **Docker Compose** (Docker Desktop on Windows). That's the only dependency: **Node/npm don't need to be installed the host machine**, everything runs in the containers defined in `docker-compose.yaml` (located in `src/frontend-web/`, one level above this folder).
- Optional but recommended for a full browser experience: the MonHundle backend (`src/monhundle/`) running locally — otherwise the app loads but API calls fail. Neither the unit tests nor the current Cypress spec need it (they stub the API responses).
- To (re)generate the API types described below, the backend needs to have been built at least once (`dotnet build` in `src/monhundle/core-api`, or an IDE build) — that's what produces the OpenAPI contract the generator reads from.

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

## Generated API Types (`src/domain/generated/`)

Request/response types are **generated from the backend's OpenAPI contract**, not written by hand, so they can't silently drift from what the API actually returns.

The backend exports its contract automatically on every build (`core-api/openapi/core-api_public.json`, see `core-api.csproj` — `AdminController` endpoints are excluded, since the frontend never calls them). `scripts/generate-api-models.ts` reads that file and writes **one `.ts` file per DTO/enum**, organized by how it's actually used in `paths`:

- `enum/` — enums, as real TypeScript `enum`s (e.g. `GameStates.Ongoing`), plus `enumNames.ts`, a registry of their names (see [Enum names and translations](#enum-names-and-translations))
- `request-params/` — request bodies/params (e.g. `MakeGuessBody`)
- `response/objects/` — success response shapes (e.g. `GuessResponse`)
- `response/errors/` — error response shapes (e.g. `ProblemDetails`)
- `models/` — everything else: a DTO nested inside another one (like `MonsterCriteriaDTO`, only ever a field of `GuessResponse`) or, in the future, one genuinely used on both the request and response side

These files **are committed** — they're what you actually open and read (e.g. `src/domain/generated/response/objects/GuessResponse.ts`), not a build artifact, so a contract change shows up in the diff of a PR like any other code change.

CI makes sure they stay in sync with the backend: the `API models - sync check with the backend contract` workflow (`.github/workflows/check-api-models.yml`) builds the backend, regenerates the models and fails if anything differs from what's committed — e.g. a DTO changed on the backend without regenerating. To fix it, rebuild the backend, run `npm run generate:api-models` and commit the result.

### What the backend adds to the contract

By default, Swashbuckle's contract loses two things the C# types know. The backend restores them (`core-api/Program.cs` and the filters in `core-api/Swagger/`), and the generated types depend on it:

- **Required and nullable fields** — every property is marked `required` (System.Text.Json always writes them all), and `nullable` only when the C# type is (`string?`). A C# `string` becomes `field: string`, a `string?` becomes `field: string | null`. Properties that can be left out of the payload (`[JsonIgnore(Condition = WhenWritingNull)]`, as on `ProblemDetails`) stay optional.
- **Enum member names** — enums travel as numbers, so their names are added under `x-enum-varnames`. Without them, the generator could only produce `type GameStates = 0 | 1 | 2 | 3`.

### Using the generated types: `src/domain/ApiModels.ts`

The rest of the app **never imports from `src/domain/generated/` directly** — an ESLint rule (`no-restricted-imports` in `eslint.config.ts`) enforces it. It imports from `src/domain/ApiModels.ts` instead, which re-exports the generated types, under front-end names where they differ:

```ts
import { GameStates, type Guess, type SettingsResponse } from '@/domain/ApiModels';
```

- `Guess`, `Criterias`, `ComparisonResult`, `SettingsResponse` and `UserSettingsBody` are aliases of `MonsterGuessDTO`, `MonsterCriteriaDTO`, `MonsterComparisonResult`, `PlayerProfileResponse` and `UserPreferencesBody`.
- A newly generated type isn't available to the app until it's added there.
- Types that carry front-end behavior stay classes of their own and are built from the payloads, e.g. `GameStatus.fromResponse(gameStateResponse)`.

### Enum names and translations

Translation keys are built from enum names, e.g. `(Weaknesses, 0)` → `game.criteria.weaknesses.fire`. The member name comes from the enum itself (`Weaknesses[0] === 'Fire'`), but an enum doesn't know its own name at runtime, and a value alone (`0`) can't tell which enum it belongs to. The generator therefore writes `enum/enumNames.ts`, mapping each enum object to its name; `getEnumName()` in `src/domain/EnumUtils.ts` reads it. Any enum added on the backend is registered automatically — its translations go under `game.criteria.<enum name in lowercase>` in `src/locales/*.json`.

**Regenerating manually**, inside the `frontend` container:

```sh
npm run generate:api-models
```

**Regenerating automatically**: the `api-models-watcher` container (starts with `docker compose up`, alongside `frontend`) watches the backend's exported contract and reruns the generator whenever it changes — so a plain `dotnet build` (or `dotnet watch build`) on the backend is enough to keep these types in sync, no manual step needed during day-to-day dev.

A custom script is used here rather than an established generator (`openapi-generator-cli`) — tried and compared on the `spike/openapi-generator-cli` branch. Its TypeScript generators aren't meant to be used in a "models only" mode: restricting them to just the DTOs produces code with dangling imports to the HTTP client files it also normally generates (`Cannot find module '../runtime'`), so it only compiles if the full generated client replaces `ApiBaseAccess.ts` entirely — a much larger change than intended here.

## Compile and Hot-Reload for Development

Still inside the `frontend` container:

```sh
npm run dev
```

The app is served at [http://localhost:5173](http://localhost:5173) (the port is mapped to the host by `docker-compose.yaml`).

## Code Quality Checks

All the commands below run inside the `frontend` container. Each check comes in two flavors: one that **fixes** what it can (for day-to-day use), and a `:check` one that only **reports** — the one CI runs.

### Format with [Prettier](https://prettier.io/)

The style (semicolons, 4-space indentation, single quotes, 100-character lines) is defined in `.prettierrc.json`; `.editorconfig` mirrors it for editors, and VS Code formats on save (see [Recommended IDE Setup](#recommended-ide-setup)).

```sh
npm run format        # rewrites every file to the expected style
npm run format:check  # only lists the files that aren't formatted (fails if any)
```

The commit that first applied this formatting to the whole codebase is listed in `.git-blame-ignore-revs` (at the repository root), so that `git blame` skips it. GitHub applies it automatically; locally, enable it once per clone with:

```sh
git config blame.ignoreRevsFile .git-blame-ignore-revs
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint        # fixes what can be fixed automatically, reports the rest
npm run lint:check  # only reports (fails on errors; warnings are reported but don't fail)
```

### Type-check with `vue-tsc`

```sh
npm run type-check
```

Checks every TypeScript project referenced by `tsconfig.json`: the app, the Vitest tests, the Cypress tests and the tooling configs/scripts.

### Run every check, in CI order

```sh
npm run format:check && npm run lint:check && npm run type-check && npm run test:unit && npm run build
```

End-to-end tests run separately, from the host (see [below](#run-end-to-end-tests-with-cypress)).

## Run Unit Tests with [Vitest](https://vitest.dev/)

Inside the `frontend` container:

```sh
npm run test:unit
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

## Environment variables

`.env` (local development) and `.env.production` define:

- `VITE_API_URL` — the backend API's base URL.
- `VITE_ICON_CDN_URL` — the base URL of the CDN serving monster icons.

These files are already committed with defaults suited for local development; only adjust them if the backend runs elsewhere.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur if installed).

The project's VS Code settings are committed in `.vscode/`:

- `extensions.json` — the recommended extensions (Vue, Vitest, ESLint, EditorConfig, Prettier), which VS Code offers to install when opening the project.
- `settings.json` — the shared workspace settings:
    - files are formatted with Prettier on save, and ESLint's automatic fixes are applied on save;
    - auto-imports use the path aliases (`@/...`) rather than relative paths, in line with the ESLint rule forbidding `../` imports.

VS Code only reads the `.vscode/` folder at the root of the opened workspace: open **this folder** (`src/frontend-web/monhundle-web`) in VS Code — or add it to a multi-root workspace — for these settings to apply. Opening the repository root instead ignores them.

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
