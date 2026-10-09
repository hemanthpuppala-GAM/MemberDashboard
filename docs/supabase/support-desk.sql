-- Golden Age Wisdom — Support Desk (phone-call log for the core team)
-- Paste ALL of this into: Supabase dashboard → SQL Editor → New query → Run.
-- Then add each core-team member's phone + name in section 4. They sign in on
-- Support Desk.dc.html with that phone and choose their own password the first time.

create extension if not exists pgcrypto;

-- 1. Who may open the desk. Only phones listed here can sign in.
create table if not exists public.support_agents (
  phone       text primary key,                -- 10 digits, no +91
  name        text not null,
  email       text,                            -- set by the agent at first sign-in
  pass_hash   text,                            -- null until the agent sets a password
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  pass_set_at timestamptz
);
alter table public.support_agents enable row level security;
revoke all on table public.support_agents from anon, authenticated;

-- 2. Sessions: a random token per sign-in, 30-day life.
create table if not exists public.support_sessions (
  token      text primary key,
  phone      text not null references public.support_agents(phone) on delete cascade,
  expires_at timestamptz not null default now() + interval '30 days'
);
alter table public.support_sessions enable row level security;
revoke all on table public.support_sessions from anon, authenticated;

-- 3. The call log.
create table if not exists public.support_calls (
  id          bigint generated always as identity primary key,
  called_at   timestamptz not null default now(),
  name        text not null,
  phone       text not null,
  lang        text,
  place       text,
  member      text,
  mins        int,
  topic       text not null,
  asked       text not null,
  helped      text not null,
  helper      text not null default 'self',    -- 'self' (support desk) | 'volunteer'
  vol_name    text,
  vol_phone   text,
  vol_email   text,
  outcome     text not null,
  follow_date date,
  follow_note text,
  follow_done boolean not null default false,
  by_phone    text not null references public.support_agents(phone),
  by_name     text not null,
  by_email    text,
  created_at  timestamptz not null default now()
);
create index if not exists support_calls_phone on public.support_calls(phone);
alter table public.support_calls enable row level security;
revoke all on table public.support_calls from anon, authenticated;

-- 4. ✏️ Core team. Add one line per person; remove a line (or set active=false) to revoke.
insert into public.support_agents (phone, name) values
  ('7396112111', 'Raman Kumar'),
  ('7396119111', 'Aruna K'),
  ('9000000001', 'Test User')            -- dummy for live testing; set active=false before real use
on conflict (phone) do nothing;

-- ── helpers ──────────────────────────────────────────────────────────────
create or replace function public._gaw_clean_phone(p text) returns text
language sql immutable as $$
  select regexp_replace(regexp_replace(coalesce(p,''), '\D', '', 'g'), '^91(?=\d{10}$)', '')
$$;

create or replace function public._gaw_support_agent(p_token text) returns public.support_agents
language plpgsql security definer set search_path = public as $$
declare a public.support_agents;
begin
  select ag.* into a from support_sessions s join support_agents ag on ag.phone = s.phone
   where s.token = p_token and s.expires_at > now() and ag.active;
  return a;
end $$;

-- ── sign in ──────────────────────────────────────────────────────────────
-- {ok:true, token, name}         signed in
-- {ok:false, error:'set_password'} known phone, no password yet → show "choose password"
-- {ok:false, error:'bad'}        unknown phone / wrong password
create or replace function public.gaw_support_login(p_phone text, p_password text)
returns json language plpgsql security definer set search_path = public as $$
declare a public.support_agents; t text;
begin
  select * into a from support_agents where phone = _gaw_clean_phone(p_phone) and active;
  if a.phone is null then return json_build_object('ok', false, 'error', 'bad'); end if;
  if a.pass_hash is null then return json_build_object('ok', false, 'error', 'set_password', 'name', a.name); end if;
  if a.pass_hash <> crypt(coalesce(p_password,''), a.pass_hash) then return json_build_object('ok', false, 'error', 'bad'); end if;
  t := encode(gen_random_bytes(24), 'hex');
  insert into support_sessions (token, phone) values (t, a.phone);
  delete from support_sessions where expires_at < now();
  return json_build_object('ok', true, 'token', t, 'name', a.name, 'phone', a.phone, 'email', a.email);
end $$;

-- First sign-in only: works while pass_hash is null. Min 6 characters. Records the agent's email.
create or replace function public.gaw_support_set_password(p_phone text, p_password text, p_email text default null)
returns json language plpgsql security definer set search_path = public as $$
declare a public.support_agents;
begin
  select * into a from support_agents where phone = _gaw_clean_phone(p_phone) and active;
  if a.phone is null then return json_build_object('ok', false, 'error', 'bad'); end if;
  if a.pass_hash is not null then return json_build_object('ok', false, 'error', 'already_set'); end if;
  if length(coalesce(p_password,'')) < 6 then return json_build_object('ok', false, 'error', 'short'); end if;
  update support_agents set pass_hash = crypt(p_password, gen_salt('bf')), pass_set_at = now(),
    email = coalesce(nullif(lower(trim(p_email)), ''), email) where phone = a.phone;
  return gaw_support_login(a.phone, p_password);
end $$;

create or replace function public.gaw_support_logout(p_token text)
returns boolean language sql security definer set search_path = public as $$
  delete from support_sessions where token = p_token returning true
$$;

-- ── calls ────────────────────────────────────────────────────────────────
create or replace function public.gaw_support_list(p_token text)
returns json language plpgsql security definer set search_path = public as $$
declare a public.support_agents;
begin
  a := _gaw_support_agent(p_token);
  if a.phone is null then return json_build_object('ok', false, 'error', 'auth'); end if;
  return json_build_object('ok', true, 'me', json_build_object('name', a.name, 'phone', a.phone), 'calls', coalesce((
    select json_agg(json_build_object(
      'id', c.id, 'at', c.called_at, 'name', c.name, 'phone', c.phone, 'lang', c.lang, 'place', c.place,
      'member', c.member, 'mins', c.mins, 'topic', c.topic, 'asked', c.asked, 'helped', c.helped,
      'helper', c.helper, 'volName', c.vol_name, 'volPhone', c.vol_phone, 'volEmail', c.vol_email,
      'outcome', c.outcome, 'followDate', c.follow_date, 'followNote', c.follow_note,
      'followDone', c.follow_done, 'by', c.by_name, 'byPhone', c.by_phone, 'byEmail', c.by_email) order by c.called_at desc)
    from support_calls c), '[]'::json));
end $$;

create or replace function public.gaw_support_put(p_token text, p_call jsonb)
returns json language plpgsql security definer set search_path = public as $$
declare a public.support_agents; new_id bigint;
begin
  a := _gaw_support_agent(p_token);
  if a.phone is null then return json_build_object('ok', false, 'error', 'auth'); end if;
  insert into support_calls (called_at, name, phone, lang, place, member, mins, topic, asked, helped, helper, vol_name, vol_phone, vol_email, outcome, follow_date, follow_note, by_phone, by_name, by_email)
  values (
    coalesce((p_call->>'at')::timestamptz, now()), p_call->>'name', _gaw_clean_phone(p_call->>'phone'),
    p_call->>'lang', p_call->>'place', p_call->>'member', nullif(p_call->>'mins','')::int,
    p_call->>'topic', p_call->>'asked', p_call->>'helped',
    coalesce(nullif(p_call->>'helper',''), 'self'), nullif(p_call->>'volName',''), nullif(_gaw_clean_phone(p_call->>'volPhone'),''), nullif(p_call->>'volEmail',''),
    p_call->>'outcome', nullif(p_call->>'followDate','')::date, p_call->>'followNote', a.phone, a.name, a.email)
  returning id into new_id;
  return json_build_object('ok', true, 'id', new_id);
end $$;

create or replace function public.gaw_support_resolve(p_token text, p_id bigint)
returns json language plpgsql security definer set search_path = public as $$
declare a public.support_agents;
begin
  a := _gaw_support_agent(p_token);
  if a.phone is null then return json_build_object('ok', false, 'error', 'auth'); end if;
  update support_calls set follow_done = true, outcome = 'Resolved' where id = p_id;
  return json_build_object('ok', true);
end $$;

create or replace function public.gaw_support_delete(p_token text, p_id bigint)
returns json language plpgsql security definer set search_path = public as $$
declare a public.support_agents;
begin
  a := _gaw_support_agent(p_token);
  if a.phone is null then return json_build_object('ok', false, 'error', 'auth'); end if;
  delete from support_calls where id = p_id;
  return json_build_object('ok', true);
end $$;

grant execute on function public.gaw_support_login(text, text) to anon;
grant execute on function public.gaw_support_set_password(text, text, text) to anon;
grant execute on function public.gaw_support_logout(text) to anon;
grant execute on function public.gaw_support_list(text) to anon;
grant execute on function public.gaw_support_put(text, jsonb) to anon;
grant execute on function public.gaw_support_resolve(text, bigint) to anon;
grant execute on function public.gaw_support_delete(text, bigint) to anon;

-- Already ran an earlier version? Add the new columns without losing data:
--   alter table support_agents add column if not exists email text;
--   alter table support_calls add column if not exists helper text not null default 'self',
--     add column if not exists vol_name text, add column if not exists vol_phone text,
--     add column if not exists vol_email text, add column if not exists by_email text;
--   drop function if exists gaw_support_set_password(text, text);
-- then re-run the function definitions above.

-- Reset someone's password (they choose a new one at next sign-in):
--   update support_agents set pass_hash = null where phone = '9876543210';
-- Revoke access:
--   update support_agents set active = false where phone = '9876543210';
