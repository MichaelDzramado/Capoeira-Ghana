-- ============================================================
-- Project Ginga / Capoeira Ghana
-- Migration: Fix RLS recursion
--
-- Purpose:
--   Replace recursive cross-table RLS checks with
--   SECURITY DEFINER authorization helpers.
--
-- This migration preserves the existing schema and seed data.
-- ============================================================


-- ============================================================
-- 1. SECURITY-DEFINER AUTHORIZATION HELPERS
-- ============================================================

create or replace function public.is_admin()
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $function$
begin
  return exists (
    select 1
    from public.user_roles ur
    join public.roles r
      on r.id = ur.role_id
    where ur.user_id = auth.uid()
      and r.name = 'admin'
  );
end;
$function$;


create or replace function public.is_instructor()
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $function$
begin
  return exists (
    select 1
    from public.user_roles ur
    join public.roles r
      on r.id = ur.role_id
    where ur.user_id = auth.uid()
      and r.name = 'instructor'
  );
end;
$function$;


create or replace function public.is_student()
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $function$
begin
  return exists (
    select 1
    from public.user_roles ur
    join public.roles r
      on r.id = ur.role_id
    where ur.user_id = auth.uid()
      and r.name = 'student'
  );
end;
$function$;


create or replace function public.is_parent()
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $function$
begin
  return exists (
    select 1
    from public.user_roles ur
    join public.roles r
      on r.id = ur.role_id
    where ur.user_id = auth.uid()
      and r.name = 'parent'
  );
end;
$function$;


-- ============================================================
-- 2. IDENTITY / OWNERSHIP HELPERS
-- ============================================================

create or replace function public.is_current_student(
  target_student_id uuid
)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $function$
begin
  return exists (
    select 1
    from public.student_profiles sp
    where sp.id = target_student_id
      and sp.user_id = auth.uid()
  );
end;
$function$;


create or replace function public.is_current_parent(
  target_parent_id uuid
)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $function$
begin
  return exists (
    select 1
    from public.parent_profiles pp
    where pp.id = target_parent_id
      and pp.user_id = auth.uid()
  );
end;
$function$;


create or replace function public.is_current_instructor(
  target_instructor_id uuid
)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $function$
begin
  return exists (
    select 1
    from public.instructor_profiles ip
    where ip.id = target_instructor_id
      and ip.user_id = auth.uid()
  );
end;
$function$;


-- ============================================================
-- 3. PARENT → STUDENT AUTHORIZATION
-- ============================================================

create or replace function public.is_parent_of_student(
  target_student_id uuid
)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $function$
begin
  return exists (
    select 1
    from public.parent_student ps
    join public.parent_profiles pp
      on pp.id = ps.parent_id
    where ps.student_id = target_student_id
      and pp.user_id = auth.uid()
  );
end;
$function$;


create or replace function public.is_student_of_parent(
  target_parent_id uuid
)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $function$
begin
  return exists (
    select 1
    from public.parent_student ps
    join public.student_profiles sp
      on sp.id = ps.student_id
    where ps.parent_id = target_parent_id
      and sp.user_id = auth.uid()
  );
end;
$function$;


-- ============================================================
-- 4. INSTRUCTOR → STUDENT / CLASS AUTHORIZATION
-- ============================================================

create or replace function public.instructor_teaches_class(
  target_class_id uuid
)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $function$
begin
  return exists (
    select 1
    from public.class_instructors ci
    join public.instructor_profiles ip
      on ip.id = ci.instructor_id
    where ci.class_id = target_class_id
      and ip.user_id = auth.uid()
  );
end;
$function$;


create or replace function public.instructor_teaches_student(
  target_student_id uuid
)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $function$
begin
  return exists (
    select 1
    from public.enrollments e
    join public.class_instructors ci
      on ci.class_id = e.class_id
    join public.instructor_profiles ip
      on ip.id = ci.instructor_id
    where e.student_id = target_student_id
      and ip.user_id = auth.uid()
      and e.status = 'active'
  );
end;
$function$;


-- ============================================================
-- 5. REPLACE RECURSIVE POLICIES
-- ============================================================

-- ------------------------------------------------------------
-- user_roles
-- ------------------------------------------------------------

drop policy if exists "Users can view own roles" on public.user_roles;
drop policy if exists "Admins can manage user roles" on public.user_roles;

create policy "Users can view own roles"
on public.user_roles
for select
to authenticated
using (
  user_id = auth.uid()
);

create policy "Admins can manage user roles"
on public.user_roles
for all
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);


-- ------------------------------------------------------------
-- student_profiles
-- ------------------------------------------------------------

drop policy if exists "Students can view own profile"
on public.student_profiles;

drop policy if exists "Students can update own profile"
on public.student_profiles;

drop policy if exists "Parents can view linked student profiles"
on public.student_profiles;

drop policy if exists "Instructors can view student profiles"
on public.student_profiles;

drop policy if exists "Admins can manage student profiles"
on public.student_profiles;

create policy "Students can view own profile"
on public.student_profiles
for select
to authenticated
using (
  user_id = auth.uid()
);

create policy "Students can update own profile"
on public.student_profiles
for update
to authenticated
using (
  user_id = auth.uid()
)
with check (
  user_id = auth.uid()
);

create policy "Parents can view linked student profiles"
on public.student_profiles
for select
to authenticated
using (
  public.is_parent_of_student(id)
);

create policy "Instructors can view student profiles"
on public.student_profiles
for select
to authenticated
using (
  public.is_instructor()
  and public.instructor_teaches_student(id)
);

create policy "Admins can manage student profiles"
on public.student_profiles
for all
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);


-- ------------------------------------------------------------
-- parent_profiles
-- ------------------------------------------------------------

drop policy if exists "Parents can view own profile"
on public.parent_profiles;

drop policy if exists "Parents can update own profile"
on public.parent_profiles;

drop policy if exists "Admins can manage parent profiles"
on public.parent_profiles;

create policy "Parents can view own profile"
on public.parent_profiles
for select
to authenticated
using (
  user_id = auth.uid()
);

create policy "Parents can update own profile"
on public.parent_profiles
for update
to authenticated
using (
  user_id = auth.uid()
)
with check (
  user_id = auth.uid()
);

create policy "Admins can manage parent profiles"
on public.parent_profiles
for all
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);


-- ------------------------------------------------------------
-- parent_student
-- ------------------------------------------------------------

drop policy if exists "Parents can view own relationships"
on public.parent_student;

drop policy if exists "Students can view own parent relationships"
on public.parent_student;

drop policy if exists "Admins can manage parent relationships"
on public.parent_student;

create policy "Parents can view own relationships"
on public.parent_student
for select
to authenticated
using (
  public.is_current_parent(parent_id)
);

create policy "Students can view own parent relationships"
on public.parent_student
for select
to authenticated
using (
  public.is_current_student(student_id)
);

create policy "Admins can manage parent relationships"
on public.parent_student
for all
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);


-- ============================================================
-- 6. ENROLLMENTS
-- ============================================================

drop policy if exists "Students can view own enrollments"
on public.enrollments;

drop policy if exists "Parents can view linked enrollments"
on public.enrollments;

drop policy if exists "Instructors can view class enrollments"
on public.enrollments;

drop policy if exists "Admins can manage enrollments"
on public.enrollments;

create policy "Students can view own enrollments"
on public.enrollments
for select
to authenticated
using (
  public.is_current_student(student_id)
);

create policy "Parents can view linked enrollments"
on public.enrollments
for select
to authenticated
using (
  public.is_parent_of_student(student_id)
);

create policy "Instructors can view class enrollments"
on public.enrollments
for select
to authenticated
using (
  public.instructor_teaches_class(class_id)
);

create policy "Admins can manage enrollments"
on public.enrollments
for all
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);


-- ============================================================
-- 7. ATTENDANCE
-- ============================================================

drop policy if exists "Students can view own attendance"
on public.attendance;

drop policy if exists "Parents can view linked attendance"
on public.attendance;

drop policy if exists "Instructors can manage class attendance"
on public.attendance;

drop policy if exists "Admins can manage attendance"
on public.attendance;

create policy "Students can view own attendance"
on public.attendance
for select
to authenticated
using (
  public.is_current_student(student_id)
);

create policy "Parents can view linked attendance"
on public.attendance
for select
to authenticated
using (
  public.is_parent_of_student(student_id)
);

create policy "Instructors can manage class attendance"
on public.attendance
for all
to authenticated
using (
  public.instructor_teaches_class(
    (
      select cs.class_id
      from public.class_sessions cs
      where cs.id = attendance.session_id
    )
  )
)
with check (
  public.instructor_teaches_class(
    (
      select cs.class_id
      from public.class_sessions cs
      where cs.id = attendance.session_id
    )
  )
);

create policy "Admins can manage attendance"
on public.attendance
for all
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);


-- ============================================================
-- 8. STUDENT PROGRESS
-- ============================================================

drop policy if exists "Students can view own progress"
on public.student_progress;

drop policy if exists "Parents can view linked student progress"
on public.student_progress;

drop policy if exists "Instructors can manage student progress"
on public.student_progress;

drop policy if exists "Admins can manage student progress"
on public.student_progress;

create policy "Students can view own progress"
on public.student_progress
for select
to authenticated
using (
  public.is_current_student(student_id)
);

create policy "Parents can view linked student progress"
on public.student_progress
for select
to authenticated
using (
  public.is_parent_of_student(student_id)
);

create policy "Instructors can manage student progress"
on public.student_progress
for all
to authenticated
using (
  public.instructor_teaches_student(student_id)
)
with check (
  public.instructor_teaches_student(student_id)
);

create policy "Admins can manage student progress"
on public.student_progress
for all
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);


-- ============================================================
-- 9. BELT HISTORY
-- ============================================================

drop policy if exists "Students can view own belt history"
on public.belt_history;

drop policy if exists "Parents can view linked belt history"
on public.belt_history;

drop policy if exists "Instructors can manage belt history"
on public.belt_history;

drop policy if exists "Admins can manage belt history"
on public.belt_history;

create policy "Students can view own belt history"
on public.belt_history
for select
to authenticated
using (
  public.is_current_student(student_id)
);

create policy "Parents can view linked belt history"
on public.belt_history
for select
to authenticated
using (
  public.is_parent_of_student(student_id)
);

create policy "Instructors can manage belt history"
on public.belt_history
for all
to authenticated
using (
  public.instructor_teaches_student(student_id)
)
with check (
  public.instructor_teaches_student(student_id)
);

create policy "Admins can manage belt history"
on public.belt_history
for all
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);


-- ============================================================
-- 10. CERTIFICATES
-- ============================================================

drop policy if exists "Students can view own certificates"
on public.certificates;

drop policy if exists "Parents can view linked certificates"
on public.certificates;

drop policy if exists "Instructors can view student certificates"
on public.certificates;

drop policy if exists "Admins can manage certificates"
on public.certificates;

create policy "Students can view own certificates"
on public.certificates
for select
to authenticated
using (
  public.is_current_student(student_id)
);

create policy "Parents can view linked certificates"
on public.certificates
for select
to authenticated
using (
  public.is_parent_of_student(student_id)
);

create policy "Instructors can view student certificates"
on public.certificates
for select
to authenticated
using (
  public.instructor_teaches_student(student_id)
);

create policy "Admins can manage certificates"
on public.certificates
for all
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);


-- ============================================================
-- 11. NOTIFICATIONS
-- ============================================================

drop policy if exists "Users can view own notifications"
on public.notifications;

drop policy if exists "Users can update own notifications"
on public.notifications;

drop policy if exists "Admins can manage notifications"
on public.notifications;

create policy "Users can view own notifications"
on public.notifications
for select
to authenticated
using (
  user_id = auth.uid()
);

create policy "Users can update own notifications"
on public.notifications
for update
to authenticated
using (
  user_id = auth.uid()
)
with check (
  user_id = auth.uid()
);

create policy "Admins can manage notifications"
on public.notifications
for all
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);


-- ============================================================
-- 12. ANALYTICS
-- ============================================================

drop policy if exists "Admins can view analytics"
on public.analytics_events;

create policy "Admins can view analytics"
on public.analytics_events
for select
to authenticated
using (
  public.is_admin()
);


-- ============================================================
-- 13. AUDIT LOGS
-- ============================================================

drop policy if exists "Admins can view audit logs"
on public.audit_logs;

create policy "Admins can view audit logs"
on public.audit_logs
for select
to authenticated
using (
  public.is_admin()
);


-- ============================================================
-- 14. EXECUTION PRIVILEGES
-- ============================================================

revoke execute on function public.is_admin()
from public, anon;

revoke execute on function public.is_instructor()
from public, anon;

revoke execute on function public.is_student()
from public, anon;

revoke execute on function public.is_parent()
from public, anon;

revoke execute on function public.is_current_student(uuid)
from public, anon;

revoke execute on function public.is_current_parent(uuid)
from public, anon;

revoke execute on function public.is_current_instructor(uuid)
from public, anon;

revoke execute on function public.is_parent_of_student(uuid)
from public, anon;

revoke execute on function public.is_student_of_parent(uuid)
from public, anon;

revoke execute on function public.instructor_teaches_class(uuid)
from public, anon;

revoke execute on function public.instructor_teaches_student(uuid)
from public, anon;

grant execute on function public.is_admin()
to authenticated;

grant execute on function public.is_instructor()
to authenticated;

grant execute on function public.is_student()
to authenticated;

grant execute on function public.is_parent()
to authenticated;

grant execute on function public.is_current_student(uuid)
to authenticated;

grant execute on function public.is_current_parent(uuid)
to authenticated;

grant execute on function public.is_current_instructor(uuid)
to authenticated;

grant execute on function public.is_parent_of_student(uuid)
to authenticated;

grant execute on function public.is_student_of_parent(uuid)
to authenticated;

grant execute on function public.instructor_teaches_class(uuid)
to authenticated;

grant execute on function public.instructor_teaches_student(uuid)
to authenticated;