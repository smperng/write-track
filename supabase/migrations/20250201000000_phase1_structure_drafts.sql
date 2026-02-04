-- Phase 1: Structure, Drafts & Snapshots
-- Adds: scene_status enum, parts, drafts, chapters, scenes, snapshots tables
-- Modifies: projects (add archived_at)

-- ============================================================
-- Add archived_at to projects
-- ============================================================
alter table public.projects add column archived_at timestamptz;

-- ============================================================
-- Create scene_status enum
-- ============================================================
create type public.scene_status as enum (
  'brainstormed',
  'rough',
  'revised',
  'polished',
  'final'
);

-- ============================================================
-- Parts table (optional groupings within a project)
-- ============================================================
create table public.parts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index parts_user_id_idx on public.parts(user_id);
create index parts_project_id_idx on public.parts(project_id);

alter table public.parts enable row level security;

create policy "Users can view own parts"
  on public.parts for select
  using (auth.uid() = user_id);

create policy "Users can insert own parts"
  on public.parts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own parts"
  on public.parts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own parts"
  on public.parts for delete
  using (auth.uid() = user_id);

create trigger on_parts_updated
  before update on public.parts
  for each row
  execute function public.handle_updated_at();

-- ============================================================
-- Drafts table (named versions of a manuscript)
-- ============================================================
create table public.drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  notes text,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index drafts_user_id_idx on public.drafts(user_id);
create index drafts_project_id_idx on public.drafts(project_id);

-- Only one active draft per project per user
create unique index drafts_active_unique
  on public.drafts(project_id)
  where (is_active = true);

alter table public.drafts enable row level security;

create policy "Users can view own drafts"
  on public.drafts for select
  using (auth.uid() = user_id);

create policy "Users can insert own drafts"
  on public.drafts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own drafts"
  on public.drafts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own drafts"
  on public.drafts for delete
  using (auth.uid() = user_id);

create trigger on_drafts_updated
  before update on public.drafts
  for each row
  execute function public.handle_updated_at();

-- ============================================================
-- Chapters table (belong to a part or directly to a project)
-- ============================================================
create table public.chapters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  part_id uuid references public.parts(id) on delete cascade,
  title text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index chapters_user_id_idx on public.chapters(user_id);
create index chapters_project_id_idx on public.chapters(project_id);
create index chapters_part_id_idx on public.chapters(part_id);

alter table public.chapters enable row level security;

create policy "Users can view own chapters"
  on public.chapters for select
  using (auth.uid() = user_id);

create policy "Users can insert own chapters"
  on public.chapters for insert
  with check (auth.uid() = user_id);

create policy "Users can update own chapters"
  on public.chapters for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own chapters"
  on public.chapters for delete
  using (auth.uid() = user_id);

create trigger on_chapters_updated
  before update on public.chapters
  for each row
  execute function public.handle_updated_at();

-- ============================================================
-- Scenes table (atomic writing units, scoped to chapter + draft)
-- ============================================================
create table public.scenes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  chapter_id uuid not null references public.chapters(id) on delete cascade,
  draft_id uuid not null references public.drafts(id) on delete cascade,
  title text not null,
  content text not null default '',
  word_count integer not null default 0,
  status public.scene_status not null default 'brainstormed',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index scenes_user_id_idx on public.scenes(user_id);
create index scenes_chapter_id_idx on public.scenes(chapter_id);
create index scenes_draft_id_idx on public.scenes(draft_id);
create index scenes_chapter_draft_sort_idx on public.scenes(chapter_id, draft_id, sort_order);

alter table public.scenes enable row level security;

create policy "Users can view own scenes"
  on public.scenes for select
  using (auth.uid() = user_id);

create policy "Users can insert own scenes"
  on public.scenes for insert
  with check (auth.uid() = user_id);

create policy "Users can update own scenes"
  on public.scenes for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own scenes"
  on public.scenes for delete
  using (auth.uid() = user_id);

create trigger on_scenes_updated
  before update on public.scenes
  for each row
  execute function public.handle_updated_at();

-- ============================================================
-- Snapshots table (immutable point-in-time scene content saves)
-- ============================================================
create table public.snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scene_id uuid not null references public.scenes(id) on delete cascade,
  draft_id uuid references public.drafts(id) on delete set null,
  content text not null,
  word_count integer not null default 0,
  label text not null,
  description text,
  created_at timestamptz not null default now()
);

create index snapshots_user_id_idx on public.snapshots(user_id);
create index snapshots_scene_id_idx on public.snapshots(scene_id);
create index snapshots_draft_id_idx on public.snapshots(draft_id);

alter table public.snapshots enable row level security;

create policy "Users can view own snapshots"
  on public.snapshots for select
  using (auth.uid() = user_id);

create policy "Users can insert own snapshots"
  on public.snapshots for insert
  with check (auth.uid() = user_id);

create policy "Users can update own snapshots"
  on public.snapshots for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own snapshots"
  on public.snapshots for delete
  using (auth.uid() = user_id);
