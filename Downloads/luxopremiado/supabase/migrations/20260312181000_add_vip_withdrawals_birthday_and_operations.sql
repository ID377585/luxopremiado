alter table public.profiles
  add column if not exists birth_date date;

comment on column public.profiles.birth_date is 'Data de nascimento para campanhas de aniversário e automações VIP';

create table if not exists public.vip_withdrawal_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount_cents integer not null check (amount_cents > 0),
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'paid', 'rejected', 'canceled')),
  requested_level_id text,
  requested_level_label text,
  withdrawal_limit_cents integer not null default 0 check (withdrawal_limit_cents >= 0),
  destination_pix_key text,
  notes text,
  admin_notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists vip_withdrawal_requests_user_created_idx
  on public.vip_withdrawal_requests (user_id, created_at desc);

create index if not exists vip_withdrawal_requests_status_created_idx
  on public.vip_withdrawal_requests (status, created_at desc);

create table if not exists public.vip_operations (
  id uuid primary key default gen_random_uuid(),
  category text not null
    check (category in ('host', 'event', 'tournament', 'odds')),
  title text not null,
  description text,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'active', 'completed', 'canceled')),
  target_tier text check (target_tier in ('none', 'vip', 'elite')),
  target_level_id text,
  user_id uuid references public.profiles(id) on delete cascade,
  host_contact text,
  starts_at timestamptz,
  ends_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists vip_operations_status_idx
  on public.vip_operations (status, category, starts_at desc);

create index if not exists vip_operations_user_idx
  on public.vip_operations (user_id, created_at desc);

alter table public.vip_withdrawal_requests enable row level security;
alter table public.vip_operations enable row level security;

drop policy if exists "vip_withdrawal_requests_read_own" on public.vip_withdrawal_requests;
create policy "vip_withdrawal_requests_read_own"
on public.vip_withdrawal_requests for select
using (auth.uid() = user_id or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists "vip_withdrawal_requests_insert_own" on public.vip_withdrawal_requests;
create policy "vip_withdrawal_requests_insert_own"
on public.vip_withdrawal_requests for insert
with check (auth.uid() = user_id);

drop policy if exists "vip_withdrawal_requests_admin_write" on public.vip_withdrawal_requests;
create policy "vip_withdrawal_requests_admin_write"
on public.vip_withdrawal_requests for all
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists "vip_operations_read_authenticated" on public.vip_operations;
create policy "vip_operations_read_authenticated"
on public.vip_operations for select
using (auth.uid() is not null);

drop policy if exists "vip_operations_admin_write" on public.vip_operations;
create policy "vip_operations_admin_write"
on public.vip_operations for all
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
