create table if not exists practice (
  email      text primary key,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table practice enable row level security;

create or replace function gaw_practice_get(p_email text)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare d jsonb;
begin
  if coalesce(p_email, '') = '' then return '{}'::jsonb; end if;
  select data into d from practice where email = lower(trim(p_email));
  return coalesce(d, '{}'::jsonb);
end $$;

create or replace function gaw_practice_put(p_email text, p_data jsonb)
returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if coalesce(p_email, '') = '' then return false; end if;
  insert into practice (email, data) values (lower(trim(p_email)), coalesce(p_data, '{}'::jsonb))
  on conflict (email) do update set data = excluded.data, updated_at = now();
  return true;
end $$;

grant execute on function gaw_practice_get(text) to anon;
grant execute on function gaw_practice_put(text, jsonb) to anon;
