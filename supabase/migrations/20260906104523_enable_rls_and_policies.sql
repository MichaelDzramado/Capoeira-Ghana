-- ============================================================
-- Project Ginga / Capoeira Ghana
-- Row-Level Security and Authorization Policies
-- ============================================================

-- ============================================================
-- AUTHORIZATION HELPERS
-- ============================================================

-- ------------------------------------------------------------
-- Role lookup
-- ------------------------------------------------------------
-- SECURITY DEFINER allows this trusted authorization function
-- to inspect user_roles without depending on caller-level RLS
-- policies.
--
-- PL/pgSQL is intentional: it prevents SQL-function inlining
-- from reintroducing policy recursion.
-- ------------------------------------------------------------

create or replace function public.has_role(required_role text)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $function$
declare
  role_exists boolean;
begin
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r
      on r.id = ur.role_id
    where ur.user_id = auth.uid()
      and r.name = required_role
  )
  into role_exists;

  return role_exists;
end;
$function$;

create or replace function public.is_admin()
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $function$
begin
  return public.has_role('admin');
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
  return public.has_role('instructor');
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
  return public.has_role('student');
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
  return public.has_role('parent');
end;
$function$;

-- ============================================================
-- ENABLE RLS
-- ============================================================

alter table public.users enable row level security;
alter table public.roles enable row level security;
alter table public.user_roles enable row level security;

alter table public.student_profiles enable row level security;
alter table public.parent_profiles enable row level security;
alter table public.instructor_profiles enable row level security;
alter table public.parent_student enable row level security;

alter table public.programs enable row level security;
alter table public.locations enable row level security;
alter table public.classes enable row level security;
alter table public.class_instructors enable row level security;
alter table public.enrollments enable row level security;
alter table public.trial_bookings enable row level security;
alter table public.class_sessions enable row level security;
alter table public.attendance enable row level security;

alter table public.belts enable row level security;
alter table public.student_progress enable row level security;
alter table public.belt_history enable row level security;
alter table public.certificates enable row level security;

alter table public.events enable row level security;
alter table public.event_registrations enable row level security;

alter table public.announcements enable row level security;
alter table public.notifications enable row level security;

alter table public.payments enable row level security;

alter table public.pages enable row level security;
alter table public.blog_posts enable row level security;
alter table public.gallery_items enable row level security;
alter table public.testimonials enable row level security;
alter table public.faqs enable row level security;

alter table public.analytics_events enable row level security;

alter table public.audit_logs enable row level security;

-- ============================================================
-- USERS
-- ============================================================

create policy "Users can view own profile"
on public.users
for select
to authenticated
using (
  id = auth.uid()
  or public.is_admin()
);

create policy "Users can update own profile"
on public.users
for update
to authenticated
using (
  id = auth.uid()
)
with check (
  id = auth.uid()
);

create policy "Admins can manage users"
on public.users
for all
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);

-- ============================================================
-- ROLES
-- ============================================================

create policy "Authenticated users can view roles"
on public.roles
for select
to authenticated
using (true);

create policy "Admins can manage roles"
on public.roles
for all
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);

-- ============================================================
-- USER ROLES
-- ============================================================

-- IMPORTANT:
-- Do NOT use is_admin() in this SELECT policy.
-- Doing so creates a circular dependency:
--
-- user_roles -> is_admin() -> has_role() -> user_roles
--
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

-- ============================================================
-- STUDENT PROFILES
-- ============================================================

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

create policy "Instructors can view student profiles"
on public.student_profiles
for select
to authenticated
using (
  public.is_instructor()
  or public.is_admin()
);

create policy "Parents can view linked student profiles"
on public.student_profiles
for select
to authenticated
using (
  exists (
    select 1
    from public.parent_student ps
    join public.parent_profiles pp
      on pp.id = ps.parent_id
    where ps.student_id = student_profiles.id
      and pp.user_id = auth.uid()
  )
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

-- ============================================================
-- PARENT PROFILES
-- ============================================================

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

-- ============================================================
-- INSTRUCTOR PROFILES
-- ============================================================

create policy "Instructors can view own profile"
on public.instructor_profiles
for select
to authenticated
using (
  user_id = auth.uid()
);

create policy "Instructors can update own profile"
on public.instructor_profiles
for update
to authenticated
using (
  user_id = auth.uid()
)
with check (
  user_id = auth.uid()
);

create policy "Admins can manage instructor profiles"
on public.instructor_profiles
for all
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);

-- ============================================================
-- PARENT-STUDENT RELATIONSHIPS
-- ============================================================

create policy "Parents can view own relationships"
on public.parent_student
for select
to authenticated
using (
  exists (
    select 1
    from public.parent_profiles pp
    where pp.id = parent_student.parent_id
      and pp.user_id = auth.uid()
  )
);

create policy "Students can view own parent relationships"
on public.parent_student
for select
to authenticated
using (
  exists (
    select 1
    from public.student_profiles sp
    where sp.id = parent_student.student_id
      and sp.user_id = auth.uid()
  )
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
-- PUBLIC TRAINING DATA
-- ============================================================

create policy "Public can view active programs"
on public.programs
for select
using (
  active = true
);

create policy "Admins can manage programs"
on public.programs
for all
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);

create policy "Public can view active locations"
on public.locations
for select
using (
  active = true
);

create policy "Admins can manage locations"
on public.locations
for all
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);

create policy "Public can view active classes"
on public.classes
for select
using (
  active = true
);

create policy "Instructors can manage assigned classes"
on public.classes
for all
to authenticated
using (
  public.is_instructor()
  or public.is_admin()
)
with check (
  public.is_instructor()
  or public.is_admin()
);

create policy "Public can view class instructors"
on public.class_instructors
for select
using (true);

create policy "Instructors can manage class instructors"
on public.class_instructors
for all
to authenticated
using (
  public.is_instructor()
  or public.is_admin()
)
with check (
  public.is_instructor()
  or public.is_admin()
);

-- ============================================================
-- ENROLLMENTS
-- ============================================================

create policy "Students can view own enrollments"
on public.enrollments
for select
to authenticated
using (
  exists (
    select 1
    from public.student_profiles sp
    where sp.id = enrollments.student_id
      and sp.user_id = auth.uid()
  )
);

create policy "Parents can view linked enrollments"
on public.enrollments
for select
to authenticated
using (
  exists (
    select 1
    from public.parent_student ps
    join public.parent_profiles pp
      on pp.id = ps.parent_id
    where ps.student_id = enrollments.student_id
      and pp.user_id = auth.uid()
  )
);

create policy "Instructors can manage enrollments"
on public.enrollments
for all
to authenticated
using (
  public.is_instructor()
  or public.is_admin()
)
with check (
  public.is_instructor()
  or public.is_admin()
);

-- ============================================================
-- TRIAL BOOKINGS
-- ============================================================

create policy "Anyone can create trial bookings"
on public.trial_bookings
for insert
to anon, authenticated
with check (true);

create policy "Admins can manage trial bookings"
on public.trial_bookings
for all
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);

-- ============================================================
-- CLASS SESSIONS
-- ============================================================

create policy "Authenticated users can view class sessions"
on public.class_sessions
for select
to authenticated
using (true);

create policy "Instructors can manage class sessions"
on public.class_sessions
for all
to authenticated
using (
  public.is_instructor()
  or public.is_admin()
)
with check (
  public.is_instructor()
  or public.is_admin()
);

-- ============================================================
-- ATTENDANCE
-- ============================================================

create policy "Students can view own attendance"
on public.attendance
for select
to authenticated
using (
  exists (
    select 1
    from public.student_profiles sp
    where sp.id = attendance.student_id
      and sp.user_id = auth.uid()
  )
);

create policy "Parents can view linked attendance"
on public.attendance
for select
to authenticated
using (
  exists (
    select 1
    from public.parent_student ps
    join public.parent_profiles pp
      on pp.id = ps.parent_id
    where ps.student_id = attendance.student_id
      and pp.user_id = auth.uid()
  )
);

create policy "Instructors can manage attendance"
on public.attendance
for all
to authenticated
using (
  public.is_instructor()
  or public.is_admin()
)
with check (
  public.is_instructor()
  or public.is_admin()
);

-- ============================================================
-- PROGRESSION
-- ============================================================

create policy "Authenticated users can view belts"
on public.belts
for select
to authenticated
using (true);

create policy "Admins can manage belts"
on public.belts
for all
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);

create policy "Students can view own progression"
on public.student_progress
for select
to authenticated
using (
  exists (
    select 1
    from public.student_profiles sp
    where sp.id = student_progress.student_id
      and sp.user_id = auth.uid()
  )
);

create policy "Parents can view linked progression"
on public.student_progress
for select
to authenticated
using (
  exists (
    select 1
    from public.parent_student ps
    join public.parent_profiles pp
      on pp.id = ps.parent_id
    where ps.student_id = student_progress.student_id
      and pp.user_id = auth.uid()
  )
);

create policy "Instructors can manage progression"
on public.student_progress
for all
to authenticated
using (
  public.is_instructor()
  or public.is_admin()
)
with check (
  public.is_instructor()
  or public.is_admin()
);

create policy "Students can view own belt history"
on public.belt_history
for select
to authenticated
using (
  exists (
    select 1
    from public.student_profiles sp
    where sp.id = belt_history.student_id
      and sp.user_id = auth.uid()
  )
);

create policy "Parents can view linked belt history"
on public.belt_history
for select
to authenticated
using (
  exists (
    select 1
    from public.parent_student ps
    join public.parent_profiles pp
      on pp.id = ps.parent_id
    where ps.student_id = belt_history.student_id
      and pp.user_id = auth.uid()
  )
);

create policy "Instructors can manage belt history"
on public.belt_history
for all
to authenticated
using (
  public.is_instructor()
  or public.is_admin()
)
with check (
  public.is_instructor()
  or public.is_admin()
);

create policy "Students can view own certificates"
on public.certificates
for select
to authenticated
using (
  exists (
    select 1
    from public.student_profiles sp
    where sp.id = certificates.student_id
      and sp.user_id = auth.uid()
  )
);

create policy "Parents can view linked certificates"
on public.certificates
for select
to authenticated
using (
  exists (
    select 1
    from public.parent_student ps
    join public.parent_profiles pp
      on pp.id = ps.parent_id
    where ps.student_id = certificates.student_id
      and pp.user_id = auth.uid()
  )
);

create policy "Instructors can manage certificates"
on public.certificates
for all
to authenticated
using (
  public.is_instructor()
  or public.is_admin()
)
with check (
  public.is_instructor()
  or public.is_admin()
);

-- ============================================================
-- EVENTS
-- ============================================================

create policy "Public can view active events"
on public.events
for select
using (
  active = true
);

create policy "Admins can manage events"
on public.events
for all
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);

create policy "Students can view own event registrations"
on public.event_registrations
for select
to authenticated
using (
  exists (
    select 1
    from public.student_profiles sp
    where sp.id = event_registrations.student_id
      and sp.user_id = auth.uid()
  )
);

create policy "Students can register for events"
on public.event_registrations
for insert
to authenticated
with check (
  exists (
    select 1
    from public.student_profiles sp
    where sp.id = event_registrations.student_id
      and sp.user_id = auth.uid()
  )
);

create policy "Admins can manage event registrations"
on public.event_registrations
for all
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);

-- ============================================================
-- COMMUNICATION
-- ============================================================

create policy "Authenticated users can view published announcements"
on public.announcements
for select
to authenticated
using (
  published = true
);

create policy "Admins can manage announcements"
on public.announcements
for all
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);

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
-- PAYMENTS
-- ============================================================

create policy "Students can view own payments"
on public.payments
for select
to authenticated
using (
  exists (
    select 1
    from public.student_profiles sp
    where sp.id = payments.student_id
      and sp.user_id = auth.uid()
  )
);

create policy "Parents can view linked payments"
on public.payments
for select
to authenticated
using (
  exists (
    select 1
    from public.parent_student ps
    join public.parent_profiles pp
      on pp.id = ps.parent_id
    where ps.student_id = payments.student_id
      and pp.user_id = auth.uid()
  )
);

create policy "Admins can manage payments"
on public.payments
for all
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);

-- ============================================================
-- CONTENT
-- ============================================================

create policy "Public can view published pages"
on public.pages
for select
using (
  published = true
);

create policy "Admins can manage pages"
on public.pages
for all
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);

create policy "Public can view published blog posts"
on public.blog_posts
for select
using (
  published = true
);

create policy "Admins can manage blog posts"
on public.blog_posts
for all
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);

create policy "Public can view published gallery items"
on public.gallery_items
for select
using (
  published = true
);

create policy "Admins can manage gallery items"
on public.gallery_items
for all
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);

create policy "Public can view published testimonials"
on public.testimonials
for select
using (
  published = true
);

create policy "Admins can manage testimonials"
on public.testimonials
for all
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);

create policy "Public can view published FAQs"
on public.faqs
for select
using (
  published = true
);

create policy "Admins can manage FAQs"
on public.faqs
for all
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);

-- ============================================================
-- ANALYTICS
-- ============================================================

create policy "Anyone can insert analytics events"
on public.analytics_events
for insert
to anon, authenticated
with check (true);

create policy "Admins can view analytics events"
on public.analytics_events
for select
to authenticated
using (
  public.is_admin()
);

-- ============================================================
-- AUDIT LOGS
-- ============================================================

create policy "Admins can view audit logs"
on public.audit_logs
for select
to authenticated
using (
  public.is_admin()
);

create policy "Admins can create audit logs"
on public.audit_logs
for insert
to authenticated
with check (
  public.is_admin()
);