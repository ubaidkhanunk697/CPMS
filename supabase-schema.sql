-- =============================================================================
-- Clinic Payment Management System
-- Supabase-ready PostgreSQL schema
--
-- Frontend: HTML5 + CSS3 + Vanilla JavaScript
-- Database/Auth: Supabase
--
-- IMPORTANT:
-- 1) Run this script once in Supabase SQL Editor.
-- 2) Do NOT put a Supabase service-role key in frontend JavaScript.
-- 3) Create staff users through Supabase Authentication, then set their
--    profile role/office using the secure SQL section at the bottom.
-- 4) MRI Office share is calculated by the application:
--      payment >= 3000 -> MRI = 3000, Doctor = payment - 3000
--      payment < 3000  -> MRI = 0,    Doctor = payment
-- =============================================================================

-- =============================================================================
-- 1. EXTENSIONS
-- =============================================================================

create extension if not exists "uuid-ossp";

-- =============================================================================
-- 2. TABLES
-- =============================================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  username text not null unique,
  full_name text not null,
  role text not null check (
    role in (
      'mri_officer',
      'investigation_officer',
      'operation_officer',
      'doctor'
    )
  ),
  office text not null check (
    office in (
      'mri',
      'investigation',
      'operation',
      'doctor'
    )
  ),
  initials text not null,
  accent_color text not null default '#1E293B',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.mri_payments (
  id uuid primary key default gen_random_uuid(),
  patient_name text not null,
  mri_type text not null,
  payment_amount numeric(12,2) not null check (payment_amount > 0),
  date date not null default current_date,
  day text not null default trim(to_char(current_date, 'Day')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null default auth.uid()
    references auth.users(id) on delete set null
);

create table if not exists public.investigation_payments (
  id uuid primary key default gen_random_uuid(),
  patient_name text not null,
  test_name text not null,
  payment_amount numeric(12,2) not null check (payment_amount > 0),
  date date not null default current_date,
  day text not null default trim(to_char(current_date, 'Day')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null default auth.uid()
    references auth.users(id) on delete set null
);

create table if not exists public.operation_payments (
  id uuid primary key default gen_random_uuid(),
  patient_name text not null,
  operation_name text not null,
  payment_amount numeric(12,2) not null check (payment_amount > 0),
  date date not null default current_date,
  day text not null default trim(to_char(current_date, 'Day')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null default auth.uid()
    references auth.users(id) on delete set null
);

-- =============================================================================
-- 3. INDEXES
-- =============================================================================

create index if not exists idx_mri_payments_date
  on public.mri_payments (date desc, created_at desc);

create index if not exists idx_mri_payments_created_by
  on public.mri_payments (created_by);

create index if not exists idx_investigation_payments_date
  on public.investigation_payments (date desc, created_at desc);

create index if not exists idx_investigation_payments_created_by
  on public.investigation_payments (created_by);

create index if not exists idx_operation_payments_date
  on public.operation_payments (date desc, created_at desc);

create index if not exists idx_operation_payments_created_by
  on public.operation_payments (created_by);

-- =============================================================================
-- 4. SECURITY-DEFINER HELPER FUNCTIONS
-- =============================================================================

create or replace function public.get_current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select p.role
  from public.profiles p
  where p.id = auth.uid()
  limit 1;
$$;

create or replace function public.get_current_user_office()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select p.office
  from public.profiles p
  where p.id = auth.uid()
  limit 1;
$$;

-- =============================================================================
-- 5. AUTOMATIC DAY + UPDATED_AT FUNCTIONS
-- =============================================================================

create or replace function public.set_payment_day()
returns trigger
language plpgsql
as $$
begin
  new.day := trim(to_char(new.date, 'Day'));
  return new;
end;
$$;

create or replace function public.trigger_set_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- =============================================================================
-- 6. PROFILE SYNC FUNCTION
--
-- SECURITY NOTE:
-- Do not trust role/office supplied by public signup metadata.
-- New Auth users receive the least-privileged default:
--   role = mri_officer
--   office = mri
--
-- After creating each staff user, an administrator should assign the correct
-- role/office using the secure SQL statements in Section 10.
-- =============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  generated_username text;
begin
  generated_username :=
    coalesce(
      nullif(new.raw_user_meta_data->>'username', ''),
      split_part(coalesce(new.email, 'user'), '@', 1)
    );

  insert into public.profiles (
    id,
    email,
    username,
    full_name,
    role,
    office,
    initials,
    accent_color
  )
  values (
    new.id,
    coalesce(new.email, ''),
    generated_username,
    coalesce(
      nullif(new.raw_user_meta_data->>'full_name', ''),
      'Clinic Staff'
    ),
    'mri_officer',
    'mri',
    coalesce(
      nullif(new.raw_user_meta_data->>'initials', ''),
      'CP'
    ),
    coalesce(
      nullif(new.raw_user_meta_data->>'accent_color', ''),
      '#1E293B'
    )
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = excluded.full_name,
    updated_at = now();

  return new;
end;
$$;

-- =============================================================================
-- 7. ENABLE RLS
-- =============================================================================

alter table public.profiles enable row level security;
alter table public.mri_payments enable row level security;
alter table public.investigation_payments enable row level security;
alter table public.operation_payments enable row level security;

-- =============================================================================
-- 8. IDEMPOTENT POLICY SETUP
-- =============================================================================
-- DROP first so this script can safely be re-run without
-- "policy already exists" errors.

drop policy if exists "profiles_select_authenticated"
  on public.profiles;

drop policy if exists "profiles_update_own"
  on public.profiles;

drop policy if exists "mri_select_officer_doctor"
  on public.mri_payments;

drop policy if exists "mri_insert_officer"
  on public.mri_payments;

drop policy if exists "mri_update_officer_doctor"
  on public.mri_payments;

drop policy if exists "mri_delete_officer_doctor"
  on public.mri_payments;

drop policy if exists "investigation_select_officer_doctor"
  on public.investigation_payments;

drop policy if exists "investigation_insert_officer"
  on public.investigation_payments;

drop policy if exists "investigation_update_officer_doctor"
  on public.investigation_payments;

drop policy if exists "investigation_delete_officer_doctor"
  on public.investigation_payments;

drop policy if exists "operation_select_officer_doctor"
  on public.operation_payments;

drop policy if exists "operation_insert_officer"
  on public.operation_payments;

drop policy if exists "operation_update_officer_doctor"
  on public.operation_payments;

drop policy if exists "operation_delete_officer_doctor"
  on public.operation_payments;

-- =============================================================================
-- 9. RLS POLICIES
-- =============================================================================

-- -------------------------------------------------------------------------
-- Profiles
-- -------------------------------------------------------------------------

create policy "profiles_select_authenticated"
on public.profiles
for select
to authenticated
using (true);

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- -------------------------------------------------------------------------
-- MRI
-- MRI Officer + Doctor can read.
-- MRI Officer + Doctor can update/delete.
-- Only MRI Officer can insert.
-- -------------------------------------------------------------------------

create policy "mri_select_officer_doctor"
on public.mri_payments
for select
to authenticated
using (
  public.get_current_user_role() in ('mri_officer', 'doctor')
);

create policy "mri_insert_officer"
on public.mri_payments
for insert
to authenticated
with check (
  public.get_current_user_role() = 'mri_officer'
);

create policy "mri_update_officer_doctor"
on public.mri_payments
for update
to authenticated
using (
  public.get_current_user_role() in ('mri_officer', 'doctor')
)
with check (
  public.get_current_user_role() in ('mri_officer', 'doctor')
);

create policy "mri_delete_officer_doctor"
on public.mri_payments
for delete
to authenticated
using (
  public.get_current_user_role() in ('mri_officer', 'doctor')
);

-- -------------------------------------------------------------------------
-- Investigation
-- Investigation Officer + Doctor can read/update/delete.
-- Only Investigation Officer can insert.
-- -------------------------------------------------------------------------

create policy "investigation_select_officer_doctor"
on public.investigation_payments
for select
to authenticated
using (
  public.get_current_user_role() in ('investigation_officer', 'doctor')
);

create policy "investigation_insert_officer"
on public.investigation_payments
for insert
to authenticated
with check (
  public.get_current_user_role() = 'investigation_officer'
);

create policy "investigation_update_officer_doctor"
on public.investigation_payments
for update
to authenticated
using (
  public.get_current_user_role() in ('investigation_officer', 'doctor')
)
with check (
  public.get_current_user_role() in ('investigation_officer', 'doctor')
);

create policy "investigation_delete_officer_doctor"
on public.investigation_payments
for delete
to authenticated
using (
  public.get_current_user_role() in ('investigation_officer', 'doctor')
);

-- -------------------------------------------------------------------------
-- Operation / Assistant
-- Operation Officer + Doctor can read/update/delete.
-- Only Operation Officer can insert.
-- -------------------------------------------------------------------------

create policy "operation_select_officer_doctor"
on public.operation_payments
for select
to authenticated
using (
  public.get_current_user_role() in ('operation_officer', 'doctor')
);

create policy "operation_insert_officer"
on public.operation_payments
for insert
to authenticated
with check (
  public.get_current_user_role() = 'operation_officer'
);

create policy "operation_update_officer_doctor"
on public.operation_payments
for update
to authenticated
using (
  public.get_current_user_role() in ('operation_officer', 'doctor')
)
with check (
  public.get_current_user_role() in ('operation_officer', 'doctor')
);

create policy "operation_delete_officer_doctor"
on public.operation_payments
for delete
to authenticated
using (
  public.get_current_user_role() in ('operation_officer', 'doctor')
);

-- =============================================================================
-- 10. TRIGGERS
-- =============================================================================

-- Remove old triggers first so this script can be re-run safely.

drop trigger if exists set_timestamp_profiles
  on public.profiles;

drop trigger if exists set_timestamp_mri
  on public.mri_payments;

drop trigger if exists set_timestamp_investigation
  on public.investigation_payments;

drop trigger if exists set_timestamp_operation
  on public.operation_payments;

drop trigger if exists set_day_mri
  on public.mri_payments;

drop trigger if exists set_day_investigation
  on public.investigation_payments;

drop trigger if exists set_day_operation
  on public.operation_payments;

drop trigger if exists on_auth_user_created
  on auth.users;

create trigger set_timestamp_profiles
before update on public.profiles
for each row
execute function public.trigger_set_timestamp();

create trigger set_timestamp_mri
before update on public.mri_payments
for each row
execute function public.trigger_set_timestamp();

create trigger set_timestamp_investigation
before update on public.investigation_payments
for each row
execute function public.trigger_set_timestamp();

create trigger set_timestamp_operation
before update on public.operation_payments
for each row
execute function public.trigger_set_timestamp();

create trigger set_day_mri
before insert or update on public.mri_payments
for each row
execute function public.set_payment_day();

create trigger set_day_investigation
before insert or update on public.investigation_payments
for each row
execute function public.set_payment_day();

create trigger set_day_operation
before insert or update on public.operation_payments
for each row
execute function public.set_payment_day();

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- =============================================================================
-- 11. OPTIONAL STAFF ROLE ASSIGNMENT
-- =============================================================================
-- First create the users in:
-- Supabase Dashboard -> Authentication -> Users -> Add user
--
-- Then run the appropriate UPDATE statement below.
-- Replace the email if needed.
--
-- Aqeb Khan:
-- update public.profiles
-- set role = 'mri_officer', office = 'mri', initials = 'AK',
--     full_name = 'Aqeb Khan'
-- where email = 'aqeb@clinic.local';
--
-- Shezaad:
-- update public.profiles
-- set role = 'investigation_officer', office = 'investigation',
--     initials = 'SH', full_name = 'Shezaad'
-- where email = 'shezaad@clinic.local';
--
-- Qari Mustajab:
-- update public.profiles
-- set role = 'operation_officer', office = 'operation',
--     initials = 'QM', full_name = 'Qari Mustajab'
-- where email = 'mustajab@clinic.local';
--
-- Dr. Nawaz Khattak:
-- update public.profiles
-- set role = 'doctor', office = 'doctor',
--     initials = 'NK', full_name = 'Dr. Nawaz Khattak'
-- where email = 'doctor@clinic.local';

-- =============================================================================
-- 12. MRI BUSINESS RULE
-- =============================================================================
-- Keep this calculation in the Vanilla JS CalculationEngine:
--
-- if payment >= 3000:
--   mriOfficeShare = 3000
--   doctorAmount = payment - 3000
-- else:
--   mriOfficeShare = 0
--   doctorAmount = payment
--
-- Investigation:
--   doctorAmount = payment
--
-- Operation / Assistant:
--   doctorAmount = payment
--
-- The database stores the original payment only, avoiding duplicated
-- calculated values and conflicting totals.
-- =============================================================================
