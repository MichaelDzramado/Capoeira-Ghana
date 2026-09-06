-- ============================================================
-- Project Ginga / Capoeira Ghana
-- Initial PostgreSQL Schema
-- Migration: initial_schema
-- ============================================================

create extension if not exists "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================

create type public.user_status as enum (
  'active',
  'inactive',
  'suspended'
);

create type public.enrollment_status as enum (
  'pending',
  'active',
  'paused',
  'completed',
  'cancelled'
);

create type public.trial_booking_status as enum (
  'pending',
  'confirmed',
  'attended',
  'converted',
  'cancelled',
  'no_show'
);

create type public.attendance_status as enum (
  'present',
  'absent',
  'late',
  'excused'
);

create type public.event_registration_status as enum (
  'registered',
  'attended',
  'cancelled',
  'no_show'
);

create type public.payment_status as enum (
  'pending',
  'paid',
  'failed',
  'refunded',
  'cancelled'
);

create type public.notification_status as enum (
  'unread',
  'read',
  'archived'
);

-- ============================================================
-- IDENTITY
-- ============================================================

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  first_name text not null,
  last_name text not null,
  phone text,
  status public.user_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table public.user_roles (
  user_id uuid not null references public.users(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, role_id)
);

create table public.student_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  date_of_birth date,
  emergency_contact_name text,
  emergency_contact_phone text,
  medical_notes text,
  joined_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.parent_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.instructor_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  bio text,
  specialization text,
  years_experience integer check (years_experience >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.parent_student (
  parent_id uuid not null references public.parent_profiles(id) on delete cascade,
  student_id uuid not null references public.student_profiles(id) on delete cascade,
  relationship text,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (parent_id, student_id)
);

-- ============================================================
-- TRAINING
-- ============================================================

create table public.programs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  age_group text,
  level text,
  duration_minutes integer check (duration_minutes > 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  city text,
  region text,
  latitude numeric(9,6),
  longitude numeric(9,6),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.classes (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id),
  location_id uuid not null references public.locations(id),
  name text not null,
  day_of_week integer check (day_of_week between 0 and 6),
  start_time time,
  end_time time,
  capacity integer check (capacity > 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.class_instructors (
  class_id uuid not null references public.classes(id) on delete cascade,
  instructor_id uuid not null references public.instructor_profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (class_id, instructor_id)
);

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.student_profiles(id),
  class_id uuid not null references public.classes(id),
  status public.enrollment_status not null default 'pending',
  enrolled_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, class_id)
);

create table public.trial_bookings (
  id uuid primary key default gen_random_uuid(),
  student_name text not null,
  email text not null,
  phone text,
  age integer check (age >= 0),
  program_id uuid references public.programs(id),
  class_id uuid references public.classes(id),
  preferred_date date,
  message text,
  status public.trial_booking_status not null default 'pending',
  booked_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.class_sessions (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  session_date date not null,
  start_time time,
  end_time time,
  instructor_id uuid references public.instructor_profiles(id),
  notes text,
  created_at timestamptz not null default now(),
  unique (class_id, session_date, start_time)
);

create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.class_sessions(id) on delete cascade,
  student_id uuid not null references public.student_profiles(id) on delete cascade,
  status public.attendance_status not null,
  notes text,
  recorded_by uuid references public.users(id),
  recorded_at timestamptz not null default now(),
  unique (session_id, student_id)
);

-- ============================================================
-- PROGRESSION
-- ============================================================

create table public.belts (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  rank_order integer not null unique check (rank_order > 0),
  description text,
  created_at timestamptz not null default now()
);

create table public.student_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null unique references public.student_profiles(id) on delete cascade,
  current_belt_id uuid references public.belts(id),
  notes text,
  updated_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.belt_history (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.student_profiles(id) on delete cascade,
  belt_id uuid not null references public.belts(id),
  awarded_at date not null,
  awarded_by uuid references public.instructor_profiles(id),
  notes text,
  created_at timestamptz not null default now()
);

create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.student_profiles(id) on delete cascade,
  title text not null,
  certificate_number text unique,
  issued_at date not null default current_date,
  file_path text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- EVENTS
-- ============================================================

create table public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  location_id uuid references public.locations(id),
  start_at timestamptz not null,
  end_at timestamptz,
  capacity integer check (capacity > 0),
  registration_required boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_at is null or end_at >= start_at)
);

create table public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  student_id uuid not null references public.student_profiles(id) on delete cascade,
  status public.event_registration_status not null default 'registered',
  registered_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (event_id, student_id)
);

-- ============================================================
-- COMMUNICATION
-- ============================================================

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  published boolean not null default false,
  published_at timestamptz,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  message text not null,
  status public.notification_status not null default 'unread',
  created_at timestamptz not null default now(),
  read_at timestamptz
);

-- ============================================================
-- FINANCE FOUNDATION
-- ============================================================

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.student_profiles(id),
  amount numeric(12,2) not null check (amount >= 0),
  currency text not null default 'GHS',
  description text,
  status public.payment_status not null default 'pending',
  external_reference text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- CONTENT
-- ============================================================

create table public.pages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  content text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text,
  author_id uuid references public.users(id),
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  title text,
  description text,
  storage_path text not null,
  alt_text text,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  quote text not null,
  image_path text,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  display_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- ANALYTICS
-- ============================================================

create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  session_id text,
  event_name text not null,
  event_category text,
  page_path text,
  properties jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

-- ============================================================
-- ADMINISTRATION
-- ============================================================

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  old_values jsonb,
  new_values jsonb,
  created_at timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================

create index idx_users_status
  on public.users(status);

create index idx_user_roles_role_id
  on public.user_roles(role_id);

create index idx_parent_student_student_id
  on public.parent_student(student_id);

create index idx_classes_program_id
  on public.classes(program_id);

create index idx_classes_location_id
  on public.classes(location_id);

create index idx_class_instructors_instructor_id
  on public.class_instructors(instructor_id);

create index idx_enrollments_student_id
  on public.enrollments(student_id);

create index idx_enrollments_class_id
  on public.enrollments(class_id);

create index idx_trial_bookings_status
  on public.trial_bookings(status);

create index idx_trial_bookings_preferred_date
  on public.trial_bookings(preferred_date);

create index idx_class_sessions_class_id
  on public.class_sessions(class_id);

create index idx_class_sessions_session_date
  on public.class_sessions(session_date);

create index idx_attendance_student_id
  on public.attendance(student_id);

create index idx_attendance_session_id
  on public.attendance(session_id);

create index idx_belt_history_student_id
  on public.belt_history(student_id);

create index idx_event_registrations_event_id
  on public.event_registrations(event_id);

create index idx_event_registrations_student_id
  on public.event_registrations(student_id);

create index idx_notifications_user_id
  on public.notifications(user_id);

create index idx_notifications_status
  on public.notifications(status);

create index idx_payments_student_id
  on public.payments(student_id);

create index idx_payments_status
  on public.payments(status);

create index idx_analytics_events_user_id
  on public.analytics_events(user_id);

create index idx_analytics_events_name
  on public.analytics_events(event_name);

create index idx_analytics_events_occurred_at
  on public.analytics_events(occurred_at);

create index idx_audit_logs_user_id
  on public.audit_logs(user_id);

create index idx_audit_logs_entity
  on public.audit_logs(entity_type, entity_id);

-- ============================================================
-- DEFAULT ROLES
-- ============================================================

insert into public.roles (name, description)
values
  ('admin', 'Full administrative access'),
  ('instructor', 'Instructor and class-management access'),
  ('student', 'Student access'),
  ('parent', 'Parent/guardian access')
on conflict (name) do nothing;