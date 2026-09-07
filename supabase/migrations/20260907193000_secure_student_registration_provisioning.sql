-- ============================================================
-- Project Ginga: Secure student registration provisioning
-- ============================================================

create or replace function public.provision_student_account(
  target_user_id uuid,
  target_email text,
  target_first_name text,
  target_last_name text,
  target_phone text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  student_role_id uuid;
begin
  -- The provisioning function may only be used for the
  -- currently authenticated user.
  if auth.uid() is null or auth.uid() <> target_user_id then
    raise exception 'Unauthorized student account provisioning';
  end if;

  -- Resolve the role by its stable business name rather than
  -- relying on a seed-specific UUID.
  select id
    into student_role_id
  from public.roles
  where name = 'student';

  if student_role_id is null then
    raise exception 'Student role is not configured';
  end if;

  -- public.users is the application profile corresponding
  -- to auth.users.
  insert into public.users (
    id,
    email,
    first_name,
    last_name,
    phone
  )
  values (
    target_user_id,
    lower(trim(target_email)),
    trim(target_first_name),
    trim(target_last_name),
    nullif(trim(coalesce(target_phone, '')), '')
  )
  on conflict (id) do update
    set email = excluded.email,
        first_name = excluded.first_name,
        last_name = excluded.last_name,
        phone = excluded.phone,
        updated_at = now();

  -- Every self-registered account is provisioned as a student.
  insert into public.student_profiles (
    user_id
  )
  values (
    target_user_id
  )
  on conflict (user_id) do nothing;

  insert into public.user_roles (
    user_id,
    role_id
  )
  values (
    target_user_id,
    student_role_id
  )
  on conflict (user_id, role_id) do nothing;
end;
$$;

revoke all on function public.provision_student_account(
  uuid,
  text,
  text,
  text,
  text
) from public;

grant execute on function public.provision_student_account(
  uuid,
  text,
  text,
  text,
  text
) to authenticated;
