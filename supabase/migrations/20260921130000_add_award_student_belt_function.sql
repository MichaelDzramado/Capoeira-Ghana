create or replace function public.award_student_belt(
  target_student_id uuid,
  target_belt_id uuid,
  progression_notes text default null
)
returns public.student_progress
language plpgsql
security definer
set search_path = public
as $function$
declare
  current_user_id uuid;
  instructor_profile_id uuid;
  awarded_progress public.student_progress;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception 'Unauthorized.';
  end if;

  if not public.is_instructor() then
    raise exception 'Instructor authentication required.';
  end if;

  if not public.instructor_teaches_student(target_student_id) then
    raise exception 'Instructor is not authorized for this student.';
  end if;

  select ip.id
  into instructor_profile_id
  from public.instructor_profiles ip
  where ip.user_id = current_user_id
  limit 1;

  if instructor_profile_id is null then
    raise exception 'Instructor profile not found.';
  end if;

  if not exists (
    select 1
    from public.belts b
    where b.id = target_belt_id
  ) then
    raise exception 'Selected belt does not exist.';
  end if;

  if exists (
    select 1
    from public.student_progress sp
    where sp.student_id = target_student_id
      and sp.current_belt_id = target_belt_id
  ) then
    raise exception 'Student already has this belt.';
  end if;

  insert into public.student_progress (
    student_id,
    current_belt_id,
    notes,
    updated_by,
    updated_at
  )
  values (
    target_student_id,
    target_belt_id,
    nullif(trim(progression_notes), ''),
    current_user_id,
    now()
  )
  on conflict (student_id)
  do update set
    current_belt_id = excluded.current_belt_id,
    notes = excluded.notes,
    updated_by = excluded.updated_by,
    updated_at = now()
  returning * into awarded_progress;

  insert into public.belt_history (
    student_id,
    belt_id,
    awarded_at,
    awarded_by,
    notes
  )
  values (
    target_student_id,
    target_belt_id,
    current_date,
    instructor_profile_id,
    nullif(trim(progression_notes), '')
  );

  return awarded_progress;
end;
$function$;

revoke execute on function public.award_student_belt(uuid, uuid, text)
from public, anon;

grant execute on function public.award_student_belt(uuid, uuid, text)
to authenticated;
