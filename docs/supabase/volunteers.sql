-- Golden Age Wisdom — volunteer applications in Supabase
-- Run once: Supabase dashboard → SQL Editor → New query → Run.
--
-- Why this exists: volunteer signups were being stored in a SQLite file on
-- GoDaddy, which issued its OWN member numbers starting at 100001 — the same
-- range gaw_signup issues from. Two people could hold the same GAW number.
-- This function calls gaw_signup internally, so there is now ONE source of
-- member numbers for the whole platform.
--
-- Security: the table is unreadable publicly and the function is NOT granted
-- to anon. Only the site's PHP handler can call it, using the service key
-- kept outside the web root. The browser can never reach it directly.

create table if not exists public.volunteers (
  email      text primary key,
  name       text not null default '',
  phone      text not null default '',
  city       text not null default '',
  lang       text not null default 'EN',
  teams      text[] not null default '{}',
  avail      text not null default '',
  note       text not null default '',
  member_num int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.volunteers enable row level security;
revoke all on table public.volunteers from anon, authenticated;

create index if not exists volunteers_teams_idx on public.volunteers using gin (teams);
