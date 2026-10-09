-- Golden Age Wisdom — add occupation to volunteers (existing table).
-- Run once: Supabase dashboard → SQL Editor → New query → Run.

alter table public.volunteers
  add column if not exists occupation text not null default '';

-- Replace the apply function so it accepts and stores occupation.
create or replace function public.gaw_volunteer_apply(
  p_name  text,
  p_email text,
  p_phone text default '',
  p_city  text default '',
  p_lang  text default 'EN',
  p_teams text[] default '{}',
  p_avail text default '',
  p_note  text default '',
  p_occupation text default ''
)
returns json
language plpgsql security definer set search_path = public as $fn$
declare
  v_email  text := lower(trim(coalesce(p_email, '')));
  v_name   text := left(trim(coalesce(p_name, '')), 120);
  v_teams  text[];
  v_signup json;
  v_id     text;
  v_num    int;
  v_new    boolean;
begin
  if v_email = '' or v_email not like '%_@_%._%' then
    return json_build_object('ok', false, 'error', 'Please provide a valid email.');
  end if;

  select coalesce(array_agg(t), '{}')
    into v_teams
    from unnest(coalesce(p_teams, '{}')) as t
   where t in ('events-setup','helpline','local-event','kundalini-share',
               'donor','social-media','tech');

  v_signup := public.gaw_signup(v_name, v_email);
  if coalesce((v_signup ->> 'ok')::boolean, false) is not true then
    return v_signup;
  end if;
  v_id  := v_signup ->> 'memberId';
  v_num := nullif(regexp_replace(v_id, '\D', '', 'g'), '')::int;

  v_new := not exists (select 1 from volunteers where email = v_email);

  insert into volunteers (email, name, phone, city, lang, teams, avail, note, occupation, member_num)
  values (v_email, v_name, left(coalesce(p_phone,''),40), left(coalesce(p_city,''),120),
          left(coalesce(p_lang,'EN'),20), v_teams, left(coalesce(p_avail,''),120),
          left(coalesce(p_note,''),1000), left(coalesce(p_occupation,''),120), v_num)
  on conflict (email) do update set
    name       = coalesce(nullif(excluded.name, ''), volunteers.name),
    phone      = coalesce(nullif(excluded.phone, ''), volunteers.phone),
    city       = coalesce(nullif(excluded.city, ''), volunteers.city),
    lang       = excluded.lang,
    teams      = (select coalesce(array_agg(distinct t), '{}')
                    from unnest(volunteers.teams || excluded.teams) as t),
    avail      = coalesce(nullif(excluded.avail, ''), volunteers.avail),
    note       = coalesce(nullif(excluded.note, ''), volunteers.note),
    occupation = coalesce(nullif(excluded.occupation, ''), volunteers.occupation),
    member_num = coalesce(volunteers.member_num, excluded.member_num),
    updated_at = now();

  return json_build_object('ok', true, 'memberId', v_id, 'returning', not v_new);
end $fn$;

-- Drop the old 8-argument version so only one remains.
drop function if exists public.gaw_volunteer_apply(text,text,text,text,text,text[],text,text);

revoke execute on function public.gaw_volunteer_apply(text,text,text,text,text,text[],text,text,text)
  from anon, authenticated, public;
grant execute on function public.gaw_volunteer_apply(text,text,text,text,text,text[],text,text,text)
  to service_role;
