-- ============================================================
-- Project Ginga / Capoeira Ghana
-- Development Seed Data
-- Synthetic data only — never production data
-- ============================================================

-- ============================================================
-- PROGRAMS
-- ============================================================

insert into public.programs
  (name, slug, description, age_group, level, duration_minutes)
values
  (
    'Kids Capoeira',
    'kids-capoeira',
    'Fun, structured Capoeira training for children.',
    '6–12 years',
    'Beginner',
    60
  ),
  (
    'Teen & Adult Capoeira',
    'teen-adult-capoeira',
    'Progressive Capoeira training combining movement, music, culture, and fitness.',
    '13+ years',
    'Beginner to Intermediate',
    90
  ),
  (
    'Capoeira Fundamentals',
    'capoeira-fundamentals',
    'Foundational movement, ginga, esquiva, kicks, and basic sequences.',
    '13+ years',
    'Beginner',
    75
  )
on conflict (slug) do nothing;

-- ============================================================
-- LOCATIONS
-- ============================================================

insert into public.locations
  (name, address, city, region, latitude, longitude)
values
  (
    'Accra Training Centre',
    'Community Sports Centre',
    'Accra',
    'Greater Accra',
    5.603717,
    -0.186964
  ),
  (
    'Legon Community Space',
    'University Community Training Hall',
    'Accra',
    'Greater Accra',
    5.650800,
    -0.186700
  ),
  (
    'Tema Community Studio',
    'Community Recreation Centre',
    'Tema',
    'Greater Accra',
    5.669800,
    0.016600
  )
on conflict do nothing;

-- ============================================================
-- BELTS
-- ============================================================

insert into public.belts
  (name, rank_order, description)
values
  ('Crua', 1, 'Beginning level in the development pathway.'),
  ('Crua-Amarela', 2, 'Early progression level.'),
  ('Amarela', 3, 'Developing practitioner level.'),
  ('Amarela-Laranja', 4, 'Intermediate progression level.'),
  ('Laranja', 5, 'Intermediate practitioner level.'),
  ('Laranja-Azul', 6, 'Advanced progression level.'),
  ('Azul', 7, 'Advanced practitioner level.')
on conflict (name) do nothing;

-- ============================================================
-- SYNTHETIC AUTH USERS
-- ============================================================
-- These users are development-only identities.
-- Passwords are intentionally defined here because these are
-- synthetic local-development accounts only.
--
-- DO NOT reuse these credentials in staging or production.
--
-- Auth token/string fields are explicitly initialized to empty
-- strings where appropriate for compatibility with the local
-- Supabase GoTrue version used by Project Ginga development.
-- ============================================================

insert into auth.users
  (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    invited_at,
    confirmation_token,
    confirmation_sent_at,
    recovery_token,
    recovery_sent_at,
    email_change_token_new,
    email_change,
    email_change_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    phone,
    phone_confirmed_at,
    phone_change,
    phone_change_token,
    phone_change_sent_at,
    email_change_token_current,
    email_change_confirm_status,
    banned_until,
    reauthentication_token,
    reauthentication_sent_at,
    is_sso_user,
    deleted_at,
    is_anonymous
  )
values
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000001',
    'authenticated',
    'authenticated',
    'admin@capoeiraghana.local',
    crypt('DevelopmentPassword123!', gen_salt('bf')),
    now(),
    null,
    '',
    null,
    '',
    null,
    '',
    '',
    null,
    null,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    false,
    now(),
    now(),
    null,
    null,
    '',
    '',
    null,
    '',
    0,
    null,
    '',
    null,
    false,
    null,
    false
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000002',
    'authenticated',
    'authenticated',
    'instructor@capoeiraghana.local',
    crypt('DevelopmentPassword123!', gen_salt('bf')),
    now(),
    null,
    '',
    null,
    '',
    null,
    '',
    '',
    null,
    null,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    false,
    now(),
    now(),
    null,
    null,
    '',
    '',
    null,
    '',
    0,
    null,
    '',
    null,
    false,
    null,
    false
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000003',
    'authenticated',
    'authenticated',
    'student1@capoeiraghana.local',
    crypt('DevelopmentPassword123!', gen_salt('bf')),
    now(),
    null,
    '',
    null,
    '',
    null,
    '',
    '',
    null,
    null,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    false,
    now(),
    now(),
    null,
    null,
    '',
    '',
    null,
    '',
    0,
    null,
    '',
    null,
    false,
    null,
    false
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000004',
    'authenticated',
    'authenticated',
    'student2@capoeiraghana.local',
    crypt('DevelopmentPassword123!', gen_salt('bf')),
    now(),
    null,
    '',
    null,
    '',
    null,
    '',
    '',
    null,
    null,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    false,
    now(),
    now(),
    null,
    null,
    '',
    '',
    null,
    '',
    0,
    null,
    '',
    null,
    false,
    null,
    false
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000005',
    'authenticated',
    'authenticated',
    'parent@capoeiraghana.local',
    crypt('DevelopmentPassword123!', gen_salt('bf')),
    now(),
    null,
    '',
    null,
    '',
    null,
    '',
    '',
    null,
    null,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    false,
    now(),
    now(),
    null,
    null,
    '',
    '',
    null,
    '',
    0,
    null,
    '',
    null,
    false,
    null,
    false
  )
on conflict (id) do nothing;
-- ============================================================
-- USER PROFILES
-- ============================================================

insert into public.users
  (id, email, first_name, last_name, phone)
values
  (
    '00000000-0000-0000-0000-000000000001',
    'admin@capoeiraghana.local',
    'Ama',
    'Mensah',
    '+233200000001'
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'instructor@capoeiraghana.local',
    'Kofi',
    'Asare',
    '+233200000002'
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'student1@capoeiraghana.local',
    'Kojo',
    'Mensah',
    '+233200000003'
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    'student2@capoeiraghana.local',
    'Adwoa',
    'Owusu',
    '+233200000004'
  ),
  (
    '00000000-0000-0000-0000-000000000005',
    'parent@capoeiraghana.local',
    'Yaw',
    'Mensah',
    '+233200000005'
  )
on conflict (id) do nothing;

-- ============================================================
-- USER ROLES
-- ============================================================

insert into public.user_roles (user_id, role_id)
select
  '00000000-0000-0000-0000-000000000001',
  id
from public.roles
where name = 'admin'
on conflict do nothing;

insert into public.user_roles (user_id, role_id)
select
  '00000000-0000-0000-0000-000000000002',
  id
from public.roles
where name = 'instructor'
on conflict do nothing;

insert into public.user_roles (user_id, role_id)
select
  '00000000-0000-0000-0000-000000000003',
  id
from public.roles
where name = 'student'
on conflict do nothing;

insert into public.user_roles (user_id, role_id)
select
  '00000000-0000-0000-0000-000000000004',
  id
from public.roles
where name = 'student'
on conflict do nothing;

insert into public.user_roles (user_id, role_id)
select
  '00000000-0000-0000-0000-000000000005',
  id
from public.roles
where name = 'parent'
on conflict do nothing;

-- ============================================================
-- STUDENT / PARENT / INSTRUCTOR PROFILES
-- ============================================================

insert into public.student_profiles
  (id, user_id, date_of_birth, joined_at)
values
  (
    '10000000-0000-4000-8000-000000000001',
    '00000000-0000-0000-0000-000000000003',
    '2010-05-12',
    current_date - interval '180 days'
  ),
  (
    '10000000-0000-4000-8000-000000000002',
    '00000000-0000-0000-0000-000000000004',
    '2008-09-21',
    current_date - interval '120 days'
  )
on conflict (id) do nothing;

insert into public.parent_profiles
  (id, user_id)
values
  (
    '20000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000005'
  )
on conflict (id) do nothing;

insert into public.instructor_profiles
  (id, user_id, bio, specialization, years_experience)
values
  (
    '30000000-0000-4000-8000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    'Capoeira instructor focused on accessible, structured training.',
    'Fundamentals and youth training',
    8
  )
on conflict (id) do nothing;

-- ============================================================
-- PARENT-STUDENT
-- ============================================================

insert into public.parent_student
  (parent_id, student_id, relationship, is_primary)
values
  (
    '20000000-0000-0000-0000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    'Parent',
    true
  )
on conflict do nothing;

-- ============================================================
-- CLASSES
-- ============================================================

insert into public.classes
  (id, program_id, location_id, name, day_of_week,
   start_time, end_time, capacity)
select
  '40000000-0000-4000-8000-000000000001',
  p.id,
  l.id,
  'Saturday Kids Capoeira',
  6,
  '09:00',
  '10:00',
  20
from public.programs p
cross join public.locations l
where p.slug = 'kids-capoeira'
  and l.name = 'Accra Training Centre'
on conflict (id) do nothing;

insert into public.classes
  (id, program_id, location_id, name, day_of_week,
   start_time, end_time, capacity)
select
  '40000000-0000-4000-8000-000000000002',
  p.id,
  l.id,
  'Tuesday Fundamentals',
  2,
  '18:00',
  '19:15',
  25
from public.programs p
cross join public.locations l
where p.slug = 'capoeira-fundamentals'
  and l.name = 'Accra Training Centre'
on conflict (id) do nothing;

insert into public.classes
  (id, program_id, location_id, name, day_of_week,
   start_time, end_time, capacity)
select
  '40000000-0000-4000-8000-000000000003',
  p.id,
  l.id,
  'Saturday Teen & Adult',
  6,
  '10:30',
  '12:00',
  30
from public.programs p
cross join public.locations l
where p.slug = 'teen-adult-capoeira'
  and l.name = 'Legon Community Space'
on conflict (id) do nothing;

-- ============================================================
-- CLASS INSTRUCTOR
-- ============================================================

insert into public.class_instructors
  (class_id, instructor_id)
select
  c.id,
  i.id
from public.classes c
cross join public.instructor_profiles i
where i.id = '30000000-0000-4000-8000-000000000001'
on conflict do nothing;

-- ============================================================
-- ENROLLMENTS
-- ============================================================

insert into public.enrollments
  (student_id, class_id, status, enrolled_at)
values
  (
    '10000000-0000-4000-8000-000000000001',
    '40000000-0000-4000-8000-000000000002',
    'active',
    current_date - interval '170 days'
  ),
  (
    '10000000-0000-4000-8000-000000000002',
    '40000000-0000-4000-8000-000000000003',
    'active',
    current_date - interval '110 days'
  )
on conflict do nothing;

-- ============================================================
-- CLASS SESSIONS
-- ============================================================

insert into public.class_sessions
  (id, class_id, session_date, start_time, end_time, instructor_id)
values
  (
    '50000000-0000-4000-8000-000000000001',
    '40000000-0000-4000-8000-000000000002',
    current_date - 14,
    '18:00',
    '19:15',
    '30000000-0000-4000-8000-000000000001'
  ),
  (
    '50000000-0000-4000-8000-000000000002',
    '40000000-0000-4000-8000-000000000002',
    current_date - 7,
    '18:00',
    '19:15',
    '30000000-0000-4000-8000-000000000001'
  ),
  (
    '50000000-0000-4000-8000-000000000003',
    '40000000-0000-4000-8000-000000000003',
    current_date - 7,
    '10:30',
    '12:00',
    '30000000-0000-4000-8000-000000000001'
  )
on conflict do nothing;

-- ============================================================
-- ATTENDANCE
-- ============================================================

insert into public.attendance
  (session_id, student_id, status, recorded_by)
values
  (
    '50000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    'present',
    '00000000-0000-0000-0000-000000000002'
  ),
  (
    '50000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000001',
    'present',
    '00000000-0000-0000-0000-000000000002'
  ),
  (
    '50000000-0000-4000-8000-000000000003',
    '10000000-0000-4000-8000-000000000002',
    'late',
    '00000000-0000-0000-0000-000000000002'
  )
on conflict do nothing;

-- ============================================================
-- STUDENT PROGRESSION
-- ============================================================

insert into public.student_progress
  (student_id, current_belt_id, updated_by)
select
  '10000000-0000-4000-8000-000000000001',
  b.id,
  '00000000-0000-0000-0000-000000000002'
from public.belts b
where b.name = 'Crua'
on conflict (student_id) do nothing;

insert into public.student_progress
  (student_id, current_belt_id, updated_by)
select
  '10000000-0000-4000-8000-000000000002',
  b.id,
  '00000000-0000-0000-0000-000000000002'
from public.belts b
where b.name = 'Crua-Amarela'
on conflict (student_id) do nothing;

insert into public.belt_history
  (student_id, belt_id, awarded_at, awarded_by)
select
  '10000000-0000-4000-8000-000000000001',
  b.id,
  current_date - 150,
  '30000000-0000-4000-8000-000000000001'
from public.belts b
where b.name = 'Crua'
on conflict do nothing;

insert into public.belt_history
  (student_id, belt_id, awarded_at, awarded_by)
select
  '10000000-0000-4000-8000-000000000002',
  b.id,
  current_date - 90,
  '30000000-0000-4000-8000-000000000001'
from public.belts b
where b.name = 'Crua'
on conflict do nothing;

insert into public.belt_history
  (student_id, belt_id, awarded_at, awarded_by)
select
  '10000000-0000-4000-8000-000000000002',
  b.id,
  current_date - 30,
  '30000000-0000-4000-8000-000000000001'
from public.belts b
where b.name = 'Crua-Amarela'
on conflict do nothing;

-- ============================================================
-- EVENTS
-- ============================================================

insert into public.events
  (name, slug, description, location_id, start_at, end_at,
   capacity, registration_required)
select
  'Capoeira Ghana Community Roda',
  'capoeira-ghana-community-roda',
  'A community roda bringing practitioners and newcomers together.',
  l.id,
  now() + interval '21 days',
  now() + interval '21 days 2 hours',
  100,
  true
from public.locations l
where l.name = 'Accra Training Centre'
on conflict (slug) do nothing;

insert into public.event_registrations
  (event_id, student_id, status)
select
  e.id,
  '10000000-0000-4000-8000-000000000001',
  'registered'
from public.events e
where e.slug = 'capoeira-ghana-community-roda'
on conflict do nothing;

-- ============================================================
-- ANNOUNCEMENTS
-- ============================================================

insert into public.announcements
  (title, body, published, published_at, created_by)
values
  (
    'Welcome to Capoeira Ghana',
    'Welcome to the Project Ginga development environment.',
    true,
    now(),
    '00000000-0000-0000-0000-000000000001'
  ),
  (
    'Community Roda Coming Soon',
    'Our next community roda is being prepared. Check the events section for details.',
    true,
    now(),
    '00000000-0000-0000-0000-000000000001'
  )
on conflict do nothing;

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

insert into public.notifications
  (user_id, title, message)
values
  (
    '00000000-0000-0000-0000-000000000003',
    'Welcome to Capoeira Ghana',
    'Your student development account is ready.'
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    'Welcome to Capoeira Ghana',
    'Your student development account is ready.'
  )
on conflict do nothing;

-- ============================================================
-- CONTENT
-- ============================================================

insert into public.pages
  (title, slug, content, published)
values
  (
    'About Capoeira Ghana',
    'about',
    'Capoeira Ghana connects movement, culture, community, and personal growth.',
    true
  ),
  (
    'What Is Capoeira?',
    'what-is-capoeira',
    'Capoeira is a Brazilian art combining movement, music, rhythm, culture, and community.',
    true
  )
on conflict (slug) do nothing;

insert into public.blog_posts
  (title, slug, excerpt, content, author_id, published, published_at)
values
  (
    'Starting Your Capoeira Journey',
    'starting-your-capoeira-journey',
    'A simple introduction to beginning Capoeira training.',
    'Your Capoeira journey begins with curiosity, movement, consistency, and community.',
    '00000000-0000-0000-0000-000000000002',
    true,
    now()
  )
on conflict (slug) do nothing;

insert into public.testimonials
  (name, role, quote, published)
values
  (
    'Development Student',
    'Student',
    'Capoeira gives me a place to learn, move, and grow with other people.',
    true
  )
on conflict do nothing;

insert into public.faqs
  (question, answer, display_order, published)
values
  (
    'Do I need previous experience?',
    'No. Beginners are welcome and training can be adapted to different starting levels.',
    1,
    true
  ),
  (
    'What should I wear?',
    'Wear comfortable clothing that allows free movement and bring water.',
    2,
    true
  ),
  (
    'Can children participate?',
    'Yes. Dedicated youth programming can provide age-appropriate training.',
    3,
    true
  )
on conflict do nothing;

-- ============================================================
-- ANALYTICS EVENTS
-- ============================================================

insert into public.analytics_events
  (user_id, session_id, event_name, event_category, page_path, properties)
values
  (
    '00000000-0000-0000-0000-000000000003',
    'dev-session-001',
    'page_view',
    'engagement',
    '/',
    '{"source":"development"}'::jsonb
  ),
  (
    null,
    'dev-session-002',
    'trial_cta_click',
    'conversion',
    '/',
    '{"source":"development"}'::jsonb
  );

-- ============================================================
-- END DEVELOPMENT SEED
-- ============================================================
