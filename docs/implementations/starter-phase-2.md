# WriteTrack Phase 1 — Core Project & Draft Management

## Summary

Implement the full Phase 1 (1a–1d) of the roadmap: Project CRUD with dashboard, hierarchical content structure (Part > Chapter > Scene), TipTap rich-text editor, multiple named drafts with word-level diff, snapshots, and per-scene status tags with project completion tracking.

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Editor | TipTap (ProseMirror-based) | Rich extension ecosystem, framework-agnostic core, good Svelte integration via thin wrapper |
| Scene content storage | `text` (HTML from TipTap `getHTML()`) | Simple to store, render, and diff; TipTap accepts HTML as input |
| Drafts model | Scenes scoped to a draft via `draft_id` FK; new draft = duplicate all scenes | Each draft has independent content; simple mental model for writers |
| Chapters without parts | `chapters.part_id` is nullable | Short novels can skip parts entirely; chapters attach directly to project |
| RLS strategy | `user_id` column on every table | Simplest, fastest RLS checks — no joins needed in policies |
| Mutations | SvelteKit form actions (primary) + API routes (auto-save, reorder) | Progressive enhancement for forms; async saves need API endpoints |
| DnD library | `svelte-dnd-action` | Mature Svelte-native library, supports nested sortable lists |
| Diff library | `diff-match-patch` | Standard word-level diffing, well-maintained |
| Project tree | Rendered inside `[projectId]` layout content area (not in AppShell sidebar) | Avoids double-sidebar; tree is project-contextual |

## New Dependencies

**Production:** `@tiptap/core`, `@tiptap/pm`, `@tiptap/starter-kit`, `svelte-dnd-action`, `diff-match-patch`
**Dev:** `@types/diff-match-patch`

## Database Migration

Single migration file: `supabase/migrations/20250201000000_phase1_structure_drafts.sql`

### New Enums
- `scene_status`: brainstormed, rough, revised, polished, final

### New Tables

**`parts`** — optional groupings within a project
- id (uuid pk), user_id (fk auth.users CASCADE), project_id (fk projects CASCADE), title, sort_order (int), timestamps

**`drafts`** — named versions of a manuscript
- id (uuid pk), user_id (fk auth.users CASCADE), project_id (fk projects CASCADE), name, notes, is_active (bool), timestamps
- Partial unique index: only one active draft per project

**`chapters`** — belong to a part or directly to a project
- id (uuid pk), user_id (fk auth.users CASCADE), project_id (fk projects CASCADE), part_id (fk parts CASCADE, **nullable**), title, sort_order (int), timestamps

**`scenes`** — atomic writing units, scoped to a chapter and draft
- id (uuid pk), user_id (fk auth.users CASCADE), chapter_id (fk chapters CASCADE), draft_id (fk drafts CASCADE), title, content (text, default ''), word_count (int, default 0), status (scene_status, default 'brainstormed'), sort_order (int), timestamps
- Composite index on (chapter_id, draft_id, sort_order)

**`snapshots`** — immutable point-in-time scene content saves
- id (uuid pk), user_id (fk auth.users CASCADE), scene_id (fk scenes CASCADE), draft_id (fk drafts SET NULL, nullable), content (text), word_count (int), label, description, created_at only (no updated_at — immutable)

### Modify Existing
- Add `archived_at timestamptz` to `projects` table

All tables get: user_id index, FK indexes, RLS (select/insert/update/delete for own rows), handle_updated_at trigger (except snapshots).

## Route Structure

```
src/routes/
  +page.svelte                                 ← Modified (live dashboard stats)
  +page.server.ts                              ← Created (load stats + recent projects)
  projects/
    +page.svelte                               ← Modified (project list + create modal)
    +page.server.ts                            ← Created (load projects, CRUD form actions)
    [projectId]/
      +layout.server.ts                        ← Created (load project + tree structure + drafts)
      +layout.svelte                           ← Created (project workspace: tree panel + content)
      +page.svelte                             ← Created (redirect to overview)
      +page.server.ts                          ← Created (redirect logic)
      overview/
        +page.svelte                           ← Created (project settings, draft management)
        +page.server.ts                        ← Created (project detail, draft CRUD actions)
      [sceneId]/
        +page.svelte                           ← Created (TipTap editor)
        +page.server.ts                        ← Created (load scene, save/status actions)
        snapshots/
          +page.svelte                         ← Created (snapshot list + diff view)
          +page.server.ts                      ← Created (load snapshots, create/restore actions)
  api/projects/[projectId]/
    scenes/[sceneId]/+server.ts                ← Created (PUT auto-save)
    reorder/+server.ts                         ← Created (PATCH reorder)
```

## Component Architecture

### `src/lib/components/ui/` (shared primitives)
- **Modal.svelte** — backdrop + title + close + children snippet
- **ConfirmDialog.svelte** — danger/warning confirm modal
- **Badge.svelte** — generic colored badge
- **DropdownMenu.svelte** — three-dot action menu with click-outside
- **InlineEdit.svelte** — double-click to edit text, Enter/Escape
- **SceneStatusBadge.svelte** — maps scene_status to colored badge
- **ProgressBar.svelte** — horizontal progress bar for completion %

### `src/lib/components/projects/`
- **ProjectCard.svelte** — card with title, status badge, word count, deadline, action menu
- **ProjectList.svelte** — grid of ProjectCards or empty state
- **ProjectForm.svelte** — create/edit form (title, description, status, genre, target, deadline)
- **ProjectStatusBadge.svelte** — maps project_status to colored badge

### `src/lib/components/structure/`
- **ProjectTree.svelte** — full tree-view with add buttons at each level, completion progress header
- **TreeNode.svelte** — single tree row: expand/collapse, inline-edit title, status badge (scenes), context menu, depth-based indent
- **StructureForm.svelte** — inline title-only form for adding part/chapter/scene

### `src/lib/components/editor/`
- **SceneEditor.svelte** — TipTap wrapper: init editor, auto-save (debounced PUT), word count tracking, status selector
- **EditorToolbar.svelte** — formatting buttons (bold, italic, headings, lists, undo/redo)
- **WordCounter.svelte** — current word count + optional target progress
- **tiptap.ts** — editor factory function, extensions config, word count utility

### `src/lib/components/drafts/`
- **DraftSelector.svelte** — dropdown for switching drafts
- **DraftDiff.svelte** — word-level diff display (additions green, deletions red)
- **DraftNotes.svelte** — textarea for per-draft notes
- **SnapshotList.svelte** — list snapshots with restore/compare/delete actions
- **SnapshotCreate.svelte** — button + label input for creating a snapshot

## Implementation Order

### Phase 1a: Project Dashboard

1. Migration: add `archived_at` to projects (combined into the single Phase 1 migration)
2. Update `src/lib/types/database.ts` — add archived_at to project types
3. Create shared UI components: Modal, ConfirmDialog, Badge, DropdownMenu, InlineEdit
4. Create project components: ProjectStatusBadge, ProjectCard, ProjectList, ProjectForm
5. Create `src/routes/projects/+page.server.ts` — load projects + CRUD form actions
6. Update `src/routes/projects/+page.svelte` — render ProjectList, create modal
7. Create `src/routes/+page.server.ts` — load dashboard stats
8. Update `src/routes/+page.svelte` — live stats from server data
9. Update `src/lib/utils/format.ts` — add formatDeadline, formatSceneStatus
10. Update `src/lib/utils/format.test.ts` — tests for new functions

### Phase 1b: Hierarchical Structure

1. Migration: create parts, chapters, scenes tables + scene_status enum + drafts table (single migration file)
2. Install: `@tiptap/core @tiptap/pm @tiptap/starter-kit svelte-dnd-action`
3. Update `src/lib/types/database.ts` — add all new table types + scene_status
4. Create `src/lib/types/structure.ts` — tree item interfaces, nested types, status weights
5. Create structure components: ProjectTree, TreeNode, StructureForm
6. Create editor components: tiptap.ts, SceneEditor, EditorToolbar, WordCounter
7. Create all `[projectId]` route files (layout, overview, scene editor)
8. Create API routes for auto-save and reorder
9. Update Sidebar.svelte — show "Back to Projects" when inside a project

### Phase 1c: Drafts & Snapshots

1. Migration: add snapshots table (part of the single migration)
2. Install: `diff-match-patch @types/diff-match-patch`
3. Create `src/lib/utils/diff.ts` — extract text from HTML, run diff-match-patch, return annotated segments
4. Create `src/lib/utils/diff.test.ts` — unit tests
5. Create draft components: DraftSelector, DraftDiff, DraftNotes
6. Create snapshot components: SnapshotList, SnapshotCreate
7. Create snapshot route files
8. Integrate drafts into project overview page
9. Add snapshot creation to scene editor page

### Phase 1d: Status Tags

1. Create SceneStatusBadge, ProgressBar components
2. Add `calculateCompletionPercentage()` to format.ts with tests
3. Integrate status badges into TreeNode (scenes)
4. Add completion progress to ProjectTree header
5. Add status selector to scene editor
6. Show completion % on ProjectCard

## Types Added to `src/lib/types/database.ts`

```typescript
export type SceneStatus = 'brainstormed' | 'rough' | 'revised' | 'polished' | 'final';

// Row/Insert/Update interfaces for: parts, chapters, scenes, drafts, snapshots
// Added archived_at to projects Row/Insert/Update
```

## New File: `src/lib/types/structure.ts`

```typescript
// Tree item interfaces for sidebar rendering
export interface SceneTreeItem { id, title, word_count, status, sort_order }
export interface ChapterWithScenes { id, title, sort_order, part_id, scenes: SceneTreeItem[] }
export interface PartWithChildren { id, title, sort_order, chapters: ChapterWithScenes[] }
export interface ProjectStructure { parts: PartWithChildren[], chapters: ChapterWithScenes[] }

// Status weights for completion calculation
export const SCENE_STATUS_WEIGHTS: Record<SceneStatus, number> = {
  brainstormed: 0, rough: 0.25, revised: 0.5, polished: 0.75, final: 1.0
};
```

## Data Flow

- **Dashboard**: `+page.server.ts` loads aggregate stats (project count, total words from active drafts, recent projects) → `+page.svelte` renders stat cards with real data
- **Projects list**: `+page.server.ts` loads non-archived projects → form actions handle create/update/archive/delete → `use:enhance` for progressive enhancement
- **Project workspace**: `[projectId]/+layout.server.ts` loads project + full tree structure (parts with nested chapters with nested scene metadata) + drafts → passed to all child routes
- **Scene editor**: `[sceneId]/+page.server.ts` loads full scene content → TipTap editor initialized → auto-save via debounced PUT to API route → form actions for status update and snapshot creation
- **Tree-view sync**: clicking a scene navigates to `/projects/[projectId]/[sceneId]`; layout data is cached by SvelteKit for sibling navigations; structure mutations use API fetch + `invalidateAll()` to refresh tree

## Files Created/Modified

### New Files (~50)

| File | Description |
|------|-------------|
| `supabase/migrations/20250201000000_phase1_structure_drafts.sql` | Migration |
| `src/lib/types/structure.ts` | Tree item interfaces + status weights |
| `src/lib/components/ui/Modal.svelte` | Modal dialog |
| `src/lib/components/ui/ConfirmDialog.svelte` | Confirm dialog |
| `src/lib/components/ui/Badge.svelte` | Generic badge |
| `src/lib/components/ui/DropdownMenu.svelte` | Action menu |
| `src/lib/components/ui/InlineEdit.svelte` | Inline text edit |
| `src/lib/components/ui/SceneStatusBadge.svelte` | Scene status badge |
| `src/lib/components/ui/ProgressBar.svelte` | Progress bar |
| `src/lib/components/projects/ProjectCard.svelte` | Project card |
| `src/lib/components/projects/ProjectList.svelte` | Project list grid |
| `src/lib/components/projects/ProjectForm.svelte` | Project create/edit form |
| `src/lib/components/projects/ProjectStatusBadge.svelte` | Project status badge |
| `src/lib/components/structure/ProjectTree.svelte` | Full tree-view |
| `src/lib/components/structure/TreeNode.svelte` | Tree row |
| `src/lib/components/structure/StructureForm.svelte` | Inline add form |
| `src/lib/components/editor/tiptap.ts` | Editor factory + word count |
| `src/lib/components/editor/SceneEditor.svelte` | TipTap wrapper |
| `src/lib/components/editor/EditorToolbar.svelte` | Formatting toolbar |
| `src/lib/components/editor/WordCounter.svelte` | Word count display |
| `src/lib/components/drafts/DraftSelector.svelte` | Draft switcher |
| `src/lib/components/drafts/DraftDiff.svelte` | Word-level diff view |
| `src/lib/components/drafts/DraftNotes.svelte` | Draft notes textarea |
| `src/lib/components/drafts/SnapshotList.svelte` | Snapshot list |
| `src/lib/components/drafts/SnapshotCreate.svelte` | Snapshot create button |
| `src/routes/+page.server.ts` | Dashboard stats loader |
| `src/routes/projects/+page.server.ts` | Projects CRUD actions |
| `src/routes/projects/[projectId]/+layout.server.ts` | Project workspace loader |
| `src/routes/projects/[projectId]/+layout.svelte` | Project workspace layout |
| `src/routes/projects/[projectId]/+page.svelte` | Redirect to overview |
| `src/routes/projects/[projectId]/+page.server.ts` | Redirect logic |
| `src/routes/projects/[projectId]/overview/+page.svelte` | Project settings + drafts |
| `src/routes/projects/[projectId]/overview/+page.server.ts` | Draft CRUD actions |
| `src/routes/projects/[projectId]/[sceneId]/+page.svelte` | Scene editor |
| `src/routes/projects/[projectId]/[sceneId]/+page.server.ts` | Scene loader + actions |
| `src/routes/projects/[projectId]/[sceneId]/snapshots/+page.svelte` | Snapshot list + diff |
| `src/routes/projects/[projectId]/[sceneId]/snapshots/+page.server.ts` | Snapshot actions |
| `src/routes/api/projects/[projectId]/scenes/[sceneId]/+server.ts` | PUT auto-save |
| `src/routes/api/projects/[projectId]/reorder/+server.ts` | PATCH structure CRUD |
| `src/lib/utils/diff.ts` | Diff utility |
| `src/lib/utils/diff.test.ts` | Diff tests |

### Modified Files

| File | Changes |
|------|---------|
| `package.json` | Added 6 new dependencies |
| `src/lib/types/database.ts` | Added SceneStatus, parts, chapters, scenes, drafts, snapshots types, archived_at on projects |
| `src/lib/utils/format.ts` | Added formatSceneStatus, formatDeadline, calculateCompletionPercentage |
| `src/lib/utils/format.test.ts` | Added tests for new format functions (25 total tests) |
| `src/lib/components/layout/Sidebar.svelte` | Added "Back to Projects" link when inside a project |
| `src/routes/+page.svelte` | Live dashboard stats from server data |
| `src/routes/projects/+page.svelte` | Project list with create modal, archive/delete |

## Verification

```bash
npm run check            # Type checking passes (0 errors, 4 warnings)
npm run lint             # Linting passes (0 errors)
npm run test:unit -- --run  # All 34 tests pass (existing + new format/diff tests)
npm run build            # Build succeeds
npm run dev              # Dev server starts at localhost:5173
```

## Implementation Notes

- The `state_referenced_locally` Svelte warnings in SceneEditor, DraftNotes, and InlineEdit are expected — these components intentionally initialize local mutable state from props (e.g., `let wordCount = $state(scene.word_count)`) so edits don't propagate back to the parent until explicitly saved.
- TreeNode uses an eslint-disable comment for `svelte/no-navigation-without-resolve` because it receives pre-resolved href strings from its parent (ProjectTree calls `resolve()` before passing).
- The DropdownMenu uses `tabindex="-1"` on the menu div to satisfy the `a11y_interactive_supports_focus` rule for elements with `role="menu"`.
- The `SnapshotCreate` component accepts a `sceneId` prop for future use (e.g., custom snapshot API) but currently uses form actions, so an eslint-disable is applied.
- The `formatDeadline` function compares dates by calendar day (stripping time) to avoid off-by-one errors from `Math.ceil` on fractional day differences.
- Draft creation automatically duplicates all scenes from the source (active) draft, giving each draft independent content.
- The partial unique index on `drafts(project_id) WHERE is_active = true` enforces at most one active draft per project at the database level.
