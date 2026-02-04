# WriteTrack Phase 0 — Implementation Plan

## Summary

Scaffold a production-ready SvelteKit app from an empty directory. This covers all 8 items in Phase 0 of the roadmap plus an initial `projects` table migration to validate the DB workflow for Phase 1a.

## Tech Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Scaffolder | `npx sv create` with `--no-dir-check` | Official tool, generates SvelteKit + Svelte 5 + TS |
| TailwindCSS | v4 via `@tailwindcss/vite`, CSS-based `@theme` config | Latest standard, no tailwind.config.js |
| Supabase client | `@supabase/supabase-js` + `@supabase/ssr` | SSR-compatible auth via cookies |
| DB migrations | Raw SQL via Supabase CLI (`supabase/migrations/`) | Simplest Supabase-native approach, no ORM |
| AI SDK | `ai` + `@ai-sdk/openai` + `@ai-sdk/anthropic` + `@ai-sdk/google` | Provider-agnostic, server-only |
| CI | GitHub Actions (lint, type-check, test) | Lightweight, no Docker needed |

## Steps

### 1. Scaffold SvelteKit project
```
npx sv create . --template minimal --types ts \
  --no-add-ons --no-dir-check --no-install
```
Generates: package.json, svelte.config.js, vite.config.ts, tsconfig.json, src/

Note: `--no-add-ons` is used because `--add` with tailwindcss/vitest prompts for interactive input. Tailwind, ESLint, Prettier, and Vitest are configured manually instead.

### 2. Initialize git
`git init`, verify `.gitignore` includes node_modules, .svelte-kit, build, .env, .env.*

### 3. Install dependencies
**Production:** `@supabase/supabase-js`, `@supabase/ssr`, `ai`, `@ai-sdk/svelte`, `@ai-sdk/openai`, `@ai-sdk/anthropic`, `@ai-sdk/google`, `zod`
**Dev:** `@tailwindcss/vite`, `tailwindcss`, `eslint`, `eslint-config-prettier`, `eslint-plugin-svelte`, `globals`, `prettier`, `prettier-plugin-svelte`, `typescript-eslint`, `vitest`, `supabase` (CLI for migrations & type gen)

### 4. Configure tooling manually

#### vite.config.ts
- Import `@tailwindcss/vite` and add to plugins
- Use `vitest/config` for `defineConfig` with `test.include` for `src/**/*.{test,spec}.{js,ts}`

#### eslint.config.js
- ESLint 9 flat config with `typescript-eslint`, `eslint-plugin-svelte`, `eslint-config-prettier`
- Ignores: `build/`, `.svelte-kit/`, `dist/`

#### .prettierrc
- Tabs, single quotes, trailing comma none, print width 100
- `prettier-plugin-svelte` with svelte parser override

### 5. Environment variables
- `.env.example` (committed): `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`
- `.env` (gitignored): copy with placeholders

### 6. Supabase client setup
- `src/app.d.ts` — declare `App.Locals` with supabase client + safeGetSession
- `src/hooks.server.ts` — create SSR-compatible Supabase client per request using `@supabase/ssr`'s `createServerClient`
- `src/routes/+layout.server.ts` — pass session/user to pages
- `src/lib/types/database.ts` — hand-written type placeholder matching initial schema (Row/Insert/Update for projects table)

### 7. Database schema
- `npx supabase init` → creates supabase/config.toml + migrations/
- Create migration `20250101000000_create_projects_table.sql`:
  - `project_status` enum: planning, drafting, revising, complete, on_hold
  - `projects` table: id (uuid), user_id, title, description, status, genre, target_word_count, deadline, timestamps
  - Index on user_id
  - RLS policies (users access own projects only): select, insert, update, delete
  - `handle_updated_at()` trigger function
- Add db scripts to package.json: `db:start`, `db:stop`, `db:reset`, `db:migration:new`, `db:types`

### 8. AI SDK integration
- `src/lib/server/ai.ts` — create provider instances (openai, anthropic, google) + defaultModel export + providers availability map. Lives in `server/` to prevent client import.
- `src/routes/api/ai/health/+server.ts` — smoke-test GET endpoint returning provider availability status

### 9. Layout shell
- `src/lib/components/layout/Sidebar.svelte` — collapsible sidebar with nav links (Dashboard, Projects) using `resolve()` from `$app/paths` for route resolution
- `src/lib/components/layout/Topbar.svelte` — top bar with app name + user email display
- `src/lib/components/layout/AppShell.svelte` — orchestrates sidebar + topbar + main content area using Svelte 5 snippets
- Update `src/routes/+layout.svelte` — import app.css, render AppShell with user data from layout server load
- Update `src/routes/+page.svelte` — dashboard placeholder with stats cards
- Create `src/routes/projects/+page.svelte` — projects page placeholder (required for route type-safety with `resolve()`)

### 10. Tailwind theme
`src/app.css` with `@import 'tailwindcss'` and `@theme` block:
- Primary color scale (sky blue, oklch values) from 50–950
- Inter as the sans-serif font

### 11. CI pipeline
`.github/workflows/ci.yml`: checkout → Node 22 → npm ci → lint → format:check → type-check → test:unit

### 12. Baseline test
- `src/lib/utils/format.ts` — `formatWordCount` (locale-aware comma formatting), `formatStatus` (enum to label mapping)
- `src/lib/utils/format.test.ts` — 10 unit tests covering zero, small, large numbers, suffix toggle, and all status values

## Files Created/Modified

| File | Action |
|------|--------|
| `package.json` | Modified (add deps + scripts) |
| `vite.config.ts` | Modified (add tailwind + vitest) |
| `eslint.config.js` | Create |
| `.prettierrc` | Create |
| `.prettierignore` | Create |
| `.gitignore` | Verify (already correct from scaffold) |
| `.env.example` | Create |
| `.env` | Create |
| `src/app.d.ts` | Modify (add Supabase types) |
| `src/app.css` | Create (Tailwind + @theme) |
| `src/hooks.server.ts` | Create |
| `src/routes/+layout.svelte` | Modify (add AppShell) |
| `src/routes/+layout.server.ts` | Create |
| `src/routes/+page.svelte` | Modify (dashboard placeholder) |
| `src/routes/projects/+page.svelte` | Create (placeholder) |
| `src/routes/api/ai/health/+server.ts` | Create |
| `src/lib/server/ai.ts` | Create |
| `src/lib/types/database.ts` | Create |
| `src/lib/components/layout/Sidebar.svelte` | Create |
| `src/lib/components/layout/Topbar.svelte` | Create |
| `src/lib/components/layout/AppShell.svelte` | Create |
| `src/lib/utils/format.ts` | Create |
| `src/lib/utils/format.test.ts` | Create |
| `supabase/config.toml` | Create (via supabase init) |
| `supabase/migrations/20250101000000_create_projects_table.sql` | Create |
| `.github/workflows/ci.yml` | Create |

## Verification

```bash
npm run lint             # Linting passes
npm run format:check     # Prettier passes
npm run check            # Type checking passes (0 errors, 0 warnings)
npm run test:unit -- --run  # 10 tests pass
npm run build            # Build succeeds
npm run dev              # Dev server starts, layout shell visible at localhost:5173
curl localhost:5173/api/ai/health  # Returns JSON with provider availability
```

## Implementation Notes

- `sv create --add tailwindcss,vitest` was avoided because those addons require interactive prompts that can't be bypassed non-interactively. All tooling was configured manually instead.
- The `svelte/no-navigation-without-resolve` ESLint rule requires using `resolve()` from `$app/paths` directly in href attributes, not via pre-computed variables. Navigation items store route IDs and call `resolve()` inline in the template.
- The `resolve()` function is strictly typed to known routes, so the `/projects` route page was created as a placeholder to satisfy the type checker.
- `prettier-plugin-svelte` v4 does not exist yet; v3.4.x is the latest.
- The Supabase client in `app.d.ts` uses the unparameterized `SupabaseClient` type to avoid generic compatibility issues with `@supabase/ssr`'s `createServerClient` return type.
