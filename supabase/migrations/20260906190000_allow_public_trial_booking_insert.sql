-- ============================================================
-- Project Ginga / Capoeira Ghana
-- Migration: Allow public trial booking submissions
--
-- Purpose:
--   Grant the anonymous Supabase role the minimum table
--   privilege required to submit trial bookings.
--
--   RLS controls which rows may be inserted.
--   The public API controls the allowed application payload.
--   Existing booking records remain inaccessible to anon.
-- ============================================================


-- The original RLS foundation already provides:
--
--   "Anyone can create trial bookings"
--   INSERT TO anon, authenticated
--
-- No duplicate INSERT policy is required.


-- ============================================================
-- 1. ALLOW ANONYMOUS INSERT
-- ============================================================

grant insert
on table public.trial_bookings
to anon;


-- ============================================================
-- 2. MAINTAIN PUBLIC READ/MODIFICATION BOUNDARY
-- ============================================================

revoke select, update, delete
on table public.trial_bookings
from anon;
