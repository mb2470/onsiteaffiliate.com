-- ============================================================
-- Onsite Affiliate: Customer Presentations Schema
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. Create the presentations table
create table if not exists public.presentations (
  id uuid default gen_random_uuid() primary key,
  customer_name text not null,
  slug text not null unique,
  slides jsonb not null default '[]'::jsonb,
  logo_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Index on slug for fast lookups
create unique index if not exists idx_presentations_slug
  on public.presentations (slug);

-- 3. Auto-update the updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on public.presentations;
create trigger set_updated_at
  before update on public.presentations
  for each row
  execute function public.handle_updated_at();

-- 4. Enable Row Level Security
alter table public.presentations enable row level security;

-- Public read access (anyone can view a presentation by slug)
create policy "Public can read presentations"
  on public.presentations for select using (true);

-- Allow inserts/updates/deletes via anon key (for your admin panel)
-- For production, replace these with authenticated-only policies
create policy "Anon can insert presentations"
  on public.presentations for insert with check (true);

create policy "Anon can update presentations"
  on public.presentations for update using (true);

create policy "Anon can delete presentations"
  on public.presentations for delete using (true);


-- ============================================================
-- MIGRATION: If table already exists, add logo_url column
-- Run this separately if you already have the table created
-- ============================================================
-- ALTER TABLE public.presentations ADD COLUMN IF NOT EXISTS logo_url text;
