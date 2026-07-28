-- SkyHunter — Supabase schema.
-- Run this once in your Supabase project: SQL Editor → paste → Run.
-- All access is server-side via the service_role key, which bypasses RLS.
-- RLS is enabled with no policies so the anon/public key can't read these.

create table if not exists public.users (
  email         text primary key,
  name          text not null,
  password_hash text,
  provider      text,
  is_admin      boolean not null default false,
  profile       jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now()
);

create table if not exists public.pending_signups (
  email         text primary key,
  name          text not null,
  password_hash text not null,
  profile       jsonb not null default '{}'::jsonb,
  code          text not null,
  expires_at    bigint not null,
  attempts      int not null default 0
);

create table if not exists public.registrations (
  id            bigint generated always as identity primary key,
  created_at    timestamptz not null default now(),
  name          text,
  email         text,
  previous_role text,
  industry      text,
  situation     text,
  location      text
);

create table if not exists public.jobs (
  id         text primary key,
  data       jsonb not null,
  sort       int not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.content (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  email      text not null,
  type       text not null,
  title      text not null,
  body       text not null default '',
  read       boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists notifications_email_idx on public.notifications (email);

create table if not exists public.applications (
  id         uuid primary key default gen_random_uuid(),
  email      text not null,
  job_id     text not null,
  job_title  text not null default '',
  status     text not null default 'applied',
  note       text not null default '',
  created_at timestamptz not null default now(),
  unique (email, job_id)
);
create index if not exists applications_email_idx on public.applications (email);
-- If the applications table already exists from an earlier deploy, add the note
-- column (the app degrades gracefully until this is run):
alter table public.applications add column if not exists note text not null default '';

create table if not exists public.intro_requests (
  id            uuid primary key default gen_random_uuid(),
  email         text not null,
  name          text not null default '',
  partner       text not null,
  role          text not null default '',
  contact_email text not null default '',
  phone         text not null default '',
  message       text not null default '',
  status        text not null default 'pending',
  scheduled_at  timestamptz,
  meeting_link  text not null default '',
  schedule_note text not null default '',
  created_at    timestamptz not null default now()
);
create index if not exists intro_requests_email_idx on public.intro_requests (email);
-- add contact columns to any pre-existing table
alter table public.intro_requests add column if not exists contact_email text not null default '';
alter table public.intro_requests add column if not exists phone text not null default '';
alter table public.intro_requests add column if not exists message text not null default '';
-- schedule columns (admin schedules & sends the interview to the member)
alter table public.intro_requests add column if not exists scheduled_at  timestamptz;
alter table public.intro_requests add column if not exists meeting_link  text not null default '';
alter table public.intro_requests add column if not exists schedule_note text not null default '';

-- Real-time chat: conversations (support: member↔admins; contract: member↔member)
-- and their messages. Access is enforced in the app (service-role key).
create table if not exists public.conversations (
  id              uuid primary key default gen_random_uuid(),
  kind            text not null default 'support',
  participants    text[] not null default '{}',
  title           text not null default '',
  last_message    text not null default '',
  last_message_at timestamptz not null default now(),
  created_at      timestamptz not null default now()
);
create index if not exists conversations_participants_idx
  on public.conversations using gin (participants);

create table if not exists public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_email    text not null,
  sender_name     text not null default '',
  body            text not null,
  created_at      timestamptz not null default now()
);
create index if not exists messages_conversation_idx
  on public.messages (conversation_id, created_at);

alter table public.users           enable row level security;
alter table public.pending_signups enable row level security;
alter table public.registrations   enable row level security;
alter table public.jobs            enable row level security;
alter table public.content         enable row level security;
alter table public.notifications   enable row level security;
alter table public.applications    enable row level security;
alter table public.intro_requests  enable row level security;
alter table public.conversations   enable row level security;
alter table public.messages        enable row level security;

-- Tip: to make yourself an admin after signing up, either add your email to the
-- ADMIN_EMAILS env var, or run:
--   update public.users set is_admin = true where email = 'you@example.com';
