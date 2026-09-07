-- ============================================================
-- Project Ginga / Capoeira Ghana
-- Migration: Harden public trial booking privileges
--
-- Purpose:
--   Keep the anonymous trial-booking boundary at the minimum
--   privilege required by the public booking API.
--
--   Anonymous visitors may INSERT bookings.
--   Anonymous visitors must not be able to read, modify,
--   delete, truncate, trigger, or create foreign-key references
--   against the trial_bookings table.
-- ============================================================

revoke
    select,
    update,
    delete,
    references,
    trigger,
    truncate
on table public.trial_bookings
from anon;

grant insert
on table public.trial_bookings
to anon;
