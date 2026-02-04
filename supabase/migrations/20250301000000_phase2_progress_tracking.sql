-- Phase 2: Progress Tracking & Analytics
-- Adds: writing_sessions, daily_writing_stats, goals tables
-- Adds: goal_type, goal_scope, goal_status enums
-- Adds: calculate_streak function, daily stats trigger

-- ============================================================
-- Writing Sessions table (track individual writing sessions)
-- ============================================================
create table public.writing_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  scene_id uuid references public.scenes(id) on delete set null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  starting_word_count integer not null default 0,
  ending_word_count integer not null default 0,
  words_added integer not null default 0,
  words_deleted integer not null default 0,
  duration_seconds integer not null default 0,
  idle_seconds integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index writing_sessions_user_id_idx on public.writing_sessions(user_id);
create index writing_sessions_project_id_idx on public.writing_sessions(project_id);
create index writing_sessions_scene_id_idx on public.writing_sessions(scene_id);
create index writing_sessions_started_at_idx on public.writing_sessions(user_id, started_at);

alter table public.writing_sessions enable row level security;

create policy "Users can view own writing_sessions"
  on public.writing_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own writing_sessions"
  on public.writing_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own writing_sessions"
  on public.writing_sessions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own writing_sessions"
  on public.writing_sessions for delete
  using (auth.uid() = user_id);

create trigger on_writing_sessions_updated
  before update on public.writing_sessions
  for each row
  execute function public.handle_updated_at();

-- ============================================================
-- Daily Writing Stats table (aggregated daily stats for fast queries)
-- ============================================================
create table public.daily_writing_stats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  stat_date date not null,
  total_words_added integer not null default 0,
  total_words_deleted integer not null default 0,
  net_words integer not null default 0,
  total_duration_seconds integer not null default 0,
  session_count integer not null default 0,
  project_ids uuid[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint daily_writing_stats_unique unique (user_id, stat_date)
);

create index daily_writing_stats_user_id_idx on public.daily_writing_stats(user_id);
create index daily_writing_stats_date_idx on public.daily_writing_stats(user_id, stat_date);

alter table public.daily_writing_stats enable row level security;

create policy "Users can view own daily_writing_stats"
  on public.daily_writing_stats for select
  using (auth.uid() = user_id);

create policy "Users can insert own daily_writing_stats"
  on public.daily_writing_stats for insert
  with check (auth.uid() = user_id);

create policy "Users can update own daily_writing_stats"
  on public.daily_writing_stats for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own daily_writing_stats"
  on public.daily_writing_stats for delete
  using (auth.uid() = user_id);

create trigger on_daily_writing_stats_updated
  before update on public.daily_writing_stats
  for each row
  execute function public.handle_updated_at();

-- ============================================================
-- Goal enums
-- ============================================================
create type public.goal_type as enum (
  'word_count',
  'daily_words',
  'weekly_words',
  'daily_time',
  'weekly_time',
  'deadline'
);

create type public.goal_scope as enum (
  'global',
  'project'
);

create type public.goal_status as enum (
  'active',
  'completed',
  'failed',
  'paused'
);

-- ============================================================
-- Goals table (user-defined writing goals)
-- ============================================================
create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  title text not null,
  goal_type public.goal_type not null,
  goal_scope public.goal_scope not null,
  status public.goal_status not null default 'active',
  target_value integer not null,
  target_date date,
  current_value integer not null default 0,
  started_at date not null default current_date,
  is_recurring boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index goals_user_id_idx on public.goals(user_id);
create index goals_project_id_idx on public.goals(project_id);
create index goals_status_idx on public.goals(user_id, status);

alter table public.goals enable row level security;

create policy "Users can view own goals"
  on public.goals for select
  using (auth.uid() = user_id);

create policy "Users can insert own goals"
  on public.goals for insert
  with check (auth.uid() = user_id);

create policy "Users can update own goals"
  on public.goals for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own goals"
  on public.goals for delete
  using (auth.uid() = user_id);

create trigger on_goals_updated
  before update on public.goals
  for each row
  execute function public.handle_updated_at();

-- ============================================================
-- Calculate streak function
-- Counts consecutive days with net_words > 0, ending at current_date
-- ============================================================
create or replace function public.calculate_streak(p_user_id uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  streak_count integer := 0;
  check_date date := current_date;
  has_activity boolean;
begin
  loop
    -- Check if there's activity on check_date
    select exists(
      select 1
      from public.daily_writing_stats
      where user_id = p_user_id
        and stat_date = check_date
        and net_words > 0
    ) into has_activity;

    -- If no activity, break the streak
    if not has_activity then
      -- Special case: if checking today and no activity yet, check yesterday
      if check_date = current_date then
        check_date := check_date - 1;
        continue;
      end if;
      exit;
    end if;

    -- Increment streak and check previous day
    streak_count := streak_count + 1;
    check_date := check_date - 1;
  end loop;

  return streak_count;
end;
$$;

-- ============================================================
-- Trigger to update daily_writing_stats when a session ends
-- ============================================================
create or replace function public.update_daily_stats_on_session_end()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  session_date date;
  existing_project_ids uuid[];
begin
  -- Only process when session ends (ended_at goes from null to not null)
  if new.ended_at is not null and old.ended_at is null then
    session_date := (new.started_at at time zone 'UTC')::date;

    -- Insert or update daily stats
    insert into public.daily_writing_stats (
      user_id,
      stat_date,
      total_words_added,
      total_words_deleted,
      net_words,
      total_duration_seconds,
      session_count,
      project_ids
    )
    values (
      new.user_id,
      session_date,
      new.words_added,
      new.words_deleted,
      new.words_added - new.words_deleted,
      new.duration_seconds,
      1,
      case when new.project_id is not null then array[new.project_id] else '{}' end
    )
    on conflict (user_id, stat_date)
    do update set
      total_words_added = public.daily_writing_stats.total_words_added + new.words_added,
      total_words_deleted = public.daily_writing_stats.total_words_deleted + new.words_deleted,
      net_words = public.daily_writing_stats.net_words + (new.words_added - new.words_deleted),
      total_duration_seconds = public.daily_writing_stats.total_duration_seconds + new.duration_seconds,
      session_count = public.daily_writing_stats.session_count + 1,
      project_ids = case
        when new.project_id is not null
          and not (new.project_id = any(public.daily_writing_stats.project_ids))
        then array_append(public.daily_writing_stats.project_ids, new.project_id)
        else public.daily_writing_stats.project_ids
      end;
  end if;

  return new;
end;
$$;

create trigger on_writing_session_end
  after update on public.writing_sessions
  for each row
  execute function public.update_daily_stats_on_session_end();
