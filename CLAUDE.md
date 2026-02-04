# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev              # Start dev server
npm run build            # Production build
npm run check            # Type-check (svelte-kit sync + svelte-check)
npm run lint             # ESLint
npm run format           # Prettier format
npm run test:unit        # Vitest unit tests
npm run test:unit -- --run   # Run tests once (no watch)
npm run db:start         # Start local Supabase
npm run db:stop          # Stop local Supabase
npm run db:reset         # Reset DB and apply migrations
npm run db:types         # Generate TypeScript types from Supabase schema
```

## Architecture

**Stack**: SvelteKit 2 + Svelte 5 (runes) + Supabase + Tailwind CSS v4 + TypeScript (strict)

**WriteTrack** is a writing project manager. Users create projects containing a hierarchy of parts → chapters → scenes, organized into drafts with snapshot versioning.

### Data flow

1. `src/hooks.server.ts` — Creates Supabase SSR client, provides `event.locals.supabase` and `event.locals.safeGetSession()` to all routes. Handles route protection (unauthenticated → `/login`, authenticated on auth pages → `/projects`).
2. `+page.server.ts` load functions query Supabase and return data to components.
3. Form mutations use SvelteKit named actions (`action="?/create"`) with `use:enhance`.
4. API routes under `src/routes/api/` handle JSON endpoints (scene updates, reordering).

### Layout structure

`+layout.svelte` conditionally renders: auth pages (`/login`, `/signup`) get bare layout; all other pages get `AppShell` (Sidebar + Topbar + content area). The project detail layout (`/projects/[projectId]/+layout.svelte`) adds a `ProjectTree` sidebar showing the parts/chapters/scenes hierarchy.

### Database schema (6 tables, all with RLS)

`projects` → `parts` (optional) → `chapters` → `scenes` (scoped to a `draft`) → `snapshots`. Each table has `user_id` for RLS ownership. Migrations live in `supabase/migrations/`.

## Key Conventions

### Links must use resolve()

All `<a href>` values must use `resolve()` from `$app/paths`. The ESLint rule `svelte/no-navigation-without-resolve` enforces this.

```svelte
import { resolve } from '$app/paths';
<a href={resolve('/projects')}>Projects</a>
<a href={resolve(`/projects/${id}`)}>Project</a>
```

### Forms use use:enhance with error handling

```svelte
<form method="POST" action="?/create" use:enhance={() => {
    return async ({ result, update }) => {
        if (result.type === 'failure') {
            error = (result.data as { error?: string })?.error ?? 'Something went wrong';
        } else {
            await update();
        }
    };
}}>
```

### Svelte 5 runes throughout

- `$state()` for reactive variables, `$derived()` for computed values, `$props()` for component props, `$bindable()` for two-way bindings, `$effect()` for side effects
- Component children use `Snippet` type, rendered with `{@render children()}`

### Supabase queries always check auth

```typescript
const { user } = await safeGetSession();
if (!user) return fail(401, { error: 'Unauthorized' });
```

### Custom Tailwind theme

`src/app.css` defines `--color-primary-50` through `--color-primary-950` (oklch scale). Use `bg-primary-600`, `text-primary-500`, etc.

### Project tree is built server-side

`/projects/[projectId]/+layout.server.ts` loads flat rows from Supabase and assembles them into a nested `ProjectStructure` type (parts → chapters → scenes). Types in `src/lib/types/structure.ts`.

### Scene completion uses weighted status

Scene statuses (`brainstormed`=0, `rough`=0.25, `revised`=0.5, `polished`=0.75, `final`=1.0) drive project completion percentage, not word count alone.
