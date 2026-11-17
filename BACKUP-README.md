# Young Pilot Journey — project backup

This ZIP contains the project source, app and workspace configuration, tests, and image assets. It does not contain credentials or secret values.

## Cloudflare Pages portability notes

- The student-facing web app is a React + Vite static site. Its Replit artifact build outputs to `artifacts/young-pilot-study/dist/public`.
- A local build currently requires `PORT` and `BASE_PATH` to be set by the Vite config. For a root Pages site, use `PORT=19858 BASE_PATH=/ pnpm --filter @workspace/young-pilot-study run build`; the output directory is `artifacts/young-pilot-study/dist/public`.
- The Replit artifact manifest supplies a single-page-app fallback (`/*` to `/index.html`). Cloudflare Pages needs an equivalent SPA fallback, such as an `_redirects` file.
- The separate Express API artifact currently has only `/api/healthz`; the student-facing app has no API calls. It is not needed for the current static learning features. If API features are added later, they need a Cloudflare Pages Function/Worker or another compatible server host.
- Study scores and game progress are stored in browser localStorage, not the Replit database. Moving to a different site origin will not automatically move that browser data.
- The workspace contains PostgreSQL/Drizzle scaffolding and a `DATABASE_URL` secret, but the current app/API does not use it and the schema has no active tables.
- Clerk-related secrets are present in the Replit workspace, but the current source has no Clerk integration or auth routes. No secret values are included here.
- No Replit App Storage configuration or upload routes are present; the website's photos are bundled local assets.
- Replit-specific files and dev tooling remain in the archive for reference. No Cloudflare Pages/Wrangler configuration was present when this backup was made.

## Archive exclusions

Excluded: `.git` history/remotes, `node_modules`, generated `dist` outputs, TypeScript build caches, `.cache`, `.config`, `.local` tooling, attached pasted prompt `.txt` files, and any `.env`/key/credential files. The attached image assets are included.
