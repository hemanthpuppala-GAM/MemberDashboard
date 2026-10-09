-- Golden Age Wisdom — member registry (Supabase)
-- Paste ALL of this into: Supabase dashboard → SQL Editor → New query → Run

-- 1. Member table. RLS on, NO policies for anon: the public site can never
--    read or write this table directly — only through the functions below.
create table if not exists public.members (
  id bigint generated always as identity primary key,
  member_num int unique not null,
  name text not null default '',
  email text unique not null,
  role text not null default '',
  created_at timestamptz not null default now()
);
alter table public.members enable row level security;
revoke all on table public.members from anon, authenticated;

-- 2. Ceremonial / reserved numbers. email NULL = seat claimable once by
--    whoever presents that fixed number first (the ceremony seal).
create table if not exists public.reserved_numbers (
  member_num int primary key,
  name text not null default '',
  email text,           -- null = open until claimed
  role text not null default ''
);
alter table public.reserved_numbers enable row level security;
revoke all on table public.reserved_numbers from anon, authenticated;

insert into public.reserved_numbers (member_num, name, email, role) values
  (111111, 'Dr. Hari Krishna', null, 'Founder'),
  (100001, 'Hemanth Puppala', 'hemanthpuppala@gmail.com', 'Core team')
on conflict (member_num) do nothing;

-- 3. Signup / silent-sync function. Atomic, one number per email, ever.
create or replace function public.gaw_signup(p_name text, p_email text)
returns json
language plpgsql security definer set search_path = public as $fn$
declare
  v_email text := lower(trim(p_email));
  v_name  text := left(trim(coalesce(p_name, '')), 120);
  v_row   members;
  v_res   reserved_numbers;
  v_next  int;
begin
  if v_email = '' or v_email not like '%_@_%._%' then
    return json_build_object('ok', false, 'error', 'invalid email');
  end if;
  if v_email like '%@preview.goldenagewisdom.org' then
    return json_build_object('ok', false, 'error', 'preview identity');
  end if;

  -- returning member keeps their number forever
  select * into v_row from members where email = v_email;
  if found then
    return json_build_object('ok', true, 'memberId', 'GAW-' || v_row.member_num,
                             'name', v_row.name, 'returning', true);
  end if;

  lock table members in share row exclusive mode;

  -- reserved seat for this email?
  select * into v_res from reserved_numbers r
    where lower(coalesce(r.email, '')) = v_email limit 1;
  if found then
    insert into members (member_num, name, email, role)
      values (v_res.member_num, coalesce(nullif(v_name, ''), v_res.name), v_email, v_res.role)
      on conflict (email) do nothing;
    return json_build_object('ok', true, 'memberId', 'GAW-' || v_res.member_num, 'name', v_res.name);
  end if;

  -- next sequential number, skipping every reserved seat
  select greatest(100000,
           coalesce((select max(member_num) from members where member_num < 111111), 100000)
         ) + 1 into v_next;
  while exists (select 1 from reserved_numbers where member_num = v_next)
     or exists (select 1 from members where member_num = v_next) loop
    v_next := v_next + 1;
  end loop;

  insert into members (member_num, name, email) values (v_next, v_name, v_email)
    returning * into v_row;
  return json_build_object('ok', true, 'memberId', 'GAW-' || v_row.member_num, 'name', v_row.name);
exception when unique_violation then
  select * into v_row from members where email = v_email;
  if found then
    return json_build_object('ok', true, 'memberId', 'GAW-' || v_row.member_num,
                             'name', v_row.name, 'returning', true);
  end if;
  return json_build_object('ok', false, 'error', 'retry');
end $fn$;

-- 4. The founder's ceremony seal: first call with the founder's real email
--    claims GAW-111111 for good. Callable only while the seat is unclaimed.
create or replace function public.gaw_seal_founder(p_name text, p_email text)
returns json
language plpgsql security definer set search_path = public as $fn$
declare
  v_email text := lower(trim(p_email));
begin
  if exists (select 1 from reserved_numbers where member_num = 111111 and email is not null)
     or exists (select 1 from members where member_num = 111111) then
    return json_build_object('ok', false, 'error', 'already sealed');
  end if;
  update reserved_numbers set email = v_email,
    name = coalesce(nullif(trim(p_name), ''), name) where member_num = 111111;
  insert into members (member_num, name, email, role)
    values (111111, coalesce(nullif(trim(p_name), ''), 'Dr. Hari Krishna'), v_email, 'Founder');
  return json_build_object('ok', true, 'memberId', 'GAW-111111');
end $fn$;

-- 5. Public live count (no PII exposed)
create or replace function public.gaw_count()
returns int language sql security definer stable set search_path = public as
$fn$ select count(*)::int from members; $fn$;

-- 6. Only these three functions are callable from the site
revoke execute on all functions in schema public from anon, authenticated;
grant execute on function public.gaw_signup(text, text) to anon;
grant execute on function public.gaw_seal_founder(text, text) to anon;
grant execute on function public.gaw_count() to anon;
