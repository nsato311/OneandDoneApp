create or replace function public.import_2026_league_data(payload jsonb)
returns jsonb
language plpgsql
security definer
as $$
declare
  season_row jsonb;
  profile_row jsonb;
  tournament_row jsonb;
  pick_row jsonb;
  v_season_id uuid;
  v_profile_id uuid;
  v_entry_id uuid;
  v_tournament_id uuid;
begin
  season_row := coalesce(payload->'season', '{}'::jsonb);

  insert into public.seasons (year, name, status)
  values (
    (season_row->>'year')::int,
    coalesce(season_row->>'name', '2026 Season'),
    coalesce(season_row->>'status', 'active')
  )
  on conflict (year) do update
    set name = excluded.name,
        status = excluded.status
  returning id into v_season_id;

  for profile_row in select * from jsonb_array_elements(coalesce(payload->'profiles', '[]'::jsonb))
  loop
    insert into public.profiles (id, name, email, is_admin)
    values (
      coalesce((profile_row->>'id')::uuid, gen_random_uuid()),
      coalesce(profile_row->>'name', ''),
      lower(coalesce(profile_row->>'email', '')),
      coalesce((profile_row->>'is_admin')::boolean, false)
    )
    on conflict (email) do update
      set name = excluded.name,
          is_admin = excluded.is_admin
    returning id into v_profile_id;

    insert into public.season_entries (season_id, profile_id, status)
    values (v_season_id, v_profile_id, 'active')
    on conflict (season_id, profile_id) do nothing;
  end loop;

  for tournament_row in select * from jsonb_array_elements(coalesce(payload->'tournaments', '[]'::jsonb))
  loop
    insert into public.tournaments (
      season_id, ordinal, name, course, date_label, espn_event_id, is_major, picks_open, scored
    )
    values (
      v_season_id,
      (tournament_row->>'ordinal')::int,
      tournament_row->>'name',
      tournament_row->>'course',
      tournament_row->>'date_label',
      nullif(tournament_row->>'espn_event_id', ''),
      coalesce((tournament_row->>'is_major')::boolean, false),
      coalesce((tournament_row->>'picks_open')::boolean, false),
      coalesce((tournament_row->>'scored')::boolean, false)
    )
    on conflict (season_id, ordinal) do update
      set name = excluded.name,
          course = excluded.course,
          date_label = excluded.date_label,
          espn_event_id = excluded.espn_event_id,
          is_major = excluded.is_major,
          picks_open = excluded.picks_open,
          scored = excluded.scored;
  end loop;

  for pick_row in select * from jsonb_array_elements(coalesce(payload->'picks', '[]'::jsonb))
  loop
    select id into v_profile_id
    from public.profiles
    where lower(email) = lower(pick_row->>'email');

    if v_profile_id is null then
      continue;
    end if;

    select e.id into v_entry_id
    from public.season_entries e
    where e.season_id = v_season_id and e.profile_id = v_profile_id;

    if v_entry_id is null then
      continue;
    end if;

    select id into v_tournament_id
    from public.tournaments
    where season_id = v_season_id and ordinal = (pick_row->>'ordinal')::int;

    if v_tournament_id is null then
      continue;
    end if;

    insert into public.picks (entry_id, tournament_id, golfer_name, points)
    values (
      v_entry_id,
      v_tournament_id,
      coalesce(pick_row->>'golfer_name', ''),
      nullif(pick_row->>'points', '')::int
    )
    on conflict (entry_id, tournament_id) do update
      set golfer_name = excluded.golfer_name,
          points = excluded.points;
  end loop;

  return jsonb_build_object('season_id', v_season_id);
end;
$$;

create or replace function public.link_profile_to_auth_user(p_user_id uuid, p_email text, p_name text)
returns void
language plpgsql
security definer
as $$
declare
  v_profile_id uuid;
begin
  if p_user_id is null or p_email is null then
    return;
  end if;

  select id into v_profile_id
  from public.profiles
  where lower(email) = lower(p_email)
  order by created_at asc
  limit 1;

  if v_profile_id is null then
    insert into public.profiles (id, name, email, is_admin)
    values (p_user_id, coalesce(p_name, split_part(p_email, '@', 1)), lower(p_email), false)
    on conflict (id) do nothing;
    return;
  end if;

  if v_profile_id = p_user_id then
    update public.profiles
    set name = coalesce(p_name, name),
        email = lower(p_email)
    where id = p_user_id;
    return;
  end if;

  update public.profiles
  set id = p_user_id,
      name = coalesce(p_name, name),
      email = lower(p_email)
  where id = v_profile_id;

  update public.season_entries
  set profile_id = p_user_id
  where profile_id = v_profile_id;
end;
$$;
