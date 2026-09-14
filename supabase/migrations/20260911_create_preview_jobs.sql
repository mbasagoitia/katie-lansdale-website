-- Apply this migration in the Supabase SQL editor before enabling preview generation.
-- No client policies are added: only the Next.js server and Railway worker use the
-- Supabase secret key to access this internal queue.
create table if not exists public.preview_jobs (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'queued' check (status in ('queued', 'processing', 'completed', 'failed')),
  full_bucket text not null check (full_bucket in ('audio-full', 'video-full')),
  full_path text not null,
  media_type text not null check (media_type in ('audio', 'video')),
  preview_bucket text not null check (preview_bucket in ('audio-previews', 'video-previews')),
  preview_path text,
  requested_by text,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.preview_jobs enable row level security;

create index if not exists preview_jobs_queued_created_at_idx
  on public.preview_jobs (created_at)
  where status = 'queued';
