-- ============================================================
-- JJB Prep — Supabase schema
-- À copier-coller tel quel dans : Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================================

-- 1) Profil utilisateur (un par compte) ----------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  unit        text not null default 'kg' check (unit in ('kg','lb')),
  schedule    jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_self_select" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_self_upsert" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles_self_update" on public.profiles
  for update using (auth.uid() = id);

-- Auto-crée la ligne profil quand un user s'inscrit
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2) Logs de séance ------------------------------------------
create table if not exists public.session_logs (
  id            text primary key,
  user_id       uuid not null references auth.users(id) on delete cascade,
  date          date not null,
  session_id    text not null,
  session_title text not null,
  type          text not null,
  exercises     jsonb not null default '[]'::jsonb,
  duration_min  integer,
  rpe           integer,
  notes         text,
  completed     boolean not null default false,
  updated_at    timestamptz not null default now()
);

create index if not exists session_logs_user_date_idx
  on public.session_logs(user_id, date desc);

alter table public.session_logs enable row level security;
create policy "session_logs_owner" on public.session_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 3) Logs de conditioning ------------------------------------
create table if not exists public.conditioning_logs (
  id           text primary key,
  user_id      uuid not null references auth.users(id) on delete cascade,
  date         date not null,
  type         text not null,
  duration_min integer not null,
  rpe          integer,
  avg_hr       integer,
  notes        text,
  updated_at   timestamptz not null default now()
);

create index if not exists conditioning_logs_user_date_idx
  on public.conditioning_logs(user_id, date desc);

alter table public.conditioning_logs enable row level security;
create policy "conditioning_logs_owner" on public.conditioning_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 4) Check-ins (readiness) -----------------------------------
create table if not exists public.readiness_logs (
  id             text primary key,
  user_id        uuid not null references auth.users(id) on delete cascade,
  date           date not null,
  weight_kg      numeric(5,2),
  sleep_hours    numeric(4,2),
  sleep_quality  smallint not null,
  fatigue        smallint not null,
  energy         smallint not null,
  soreness       smallint not null,
  low_back_pain  smallint not null default 0,
  motivation     smallint not null,
  notes          text,
  updated_at     timestamptz not null default now(),
  unique (user_id, date)
);

create index if not exists readiness_logs_user_date_idx
  on public.readiness_logs(user_id, date desc);

alter table public.readiness_logs enable row level security;
create policy "readiness_logs_owner" on public.readiness_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 5) Mensurations --------------------------------------------
create table if not exists public.body_metric_logs (
  id         text primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  date       date not null,
  weight_kg  numeric(5,2),
  waist_cm   numeric(5,2),
  notes      text,
  updated_at timestamptz not null default now()
);

create index if not exists body_metric_logs_user_date_idx
  on public.body_metric_logs(user_id, date desc);

alter table public.body_metric_logs enable row level security;
create policy "body_metric_logs_owner" on public.body_metric_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 6) Trigger updated_at automatique --------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

do $$
declare t text;
begin
  for t in select unnest(array[
    'profiles',
    'session_logs',
    'conditioning_logs',
    'readiness_logs',
    'body_metric_logs'
  ]) loop
    execute format('drop trigger if exists touch_%1$s on public.%1$s;', t);
    execute format('create trigger touch_%1$s before update on public.%1$s
      for each row execute function public.touch_updated_at();', t);
  end loop;
end $$;
