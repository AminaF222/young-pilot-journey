# Young Pilot Study App

A beginner-friendly aviation study app for high school students, with interactive lessons, flashcards, practice quizzes, pilot pathway guidance, and locally saved progress.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/young-pilot-study/` — student-facing web app
- `artifacts/young-pilot-study/src/App.tsx` — routes and learning interactions
- `artifacts/young-pilot-study/src/index.css` — app theme and responsive styling

## Architecture decisions

- Study progress is stored only in the student's browser; the app does not require accounts or collect personal information.

## Product

- Introduces airplane parts, cockpit instruments, aviation vocabulary, and basic flight principles.
- Offers interactive aviation flashcards and multiple-choice practice quizzes with explanations.
- Explains general pilot-certificate steps and tracks quiz scores locally.
- Educational content is not a substitute for official FAA guidance; requirements vary by certificate and circumstances.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
