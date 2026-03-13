alter table public.orders
  add column if not exists vip_original_amount_cents integer not null default 0 check (vip_original_amount_cents >= 0),
  add column if not exists vip_discount_cents integer not null default 0 check (vip_discount_cents >= 0),
  add column if not exists vip_cashback_cents integer not null default 0 check (vip_cashback_cents >= 0),
  add column if not exists vip_rakeback_cents integer not null default 0 check (vip_rakeback_cents >= 0),
  add column if not exists vip_xp_earned integer not null default 0 check (vip_xp_earned >= 0),
  add column if not exists vip_benefit_level_id text,
  add column if not exists vip_benefit_snapshot jsonb not null default '{}'::jsonb,
  add column if not exists vip_benefits_applied_at timestamptz;

update public.orders
set vip_original_amount_cents = amount_cents
where vip_original_amount_cents = 0
  and amount_cents > 0;

create table if not exists public.vip_wallets (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  cashback_balance_cents integer not null default 0 check (cashback_balance_cents >= 0),
  bonus_balance_cents integer not null default 0 check (bonus_balance_cents >= 0),
  rakeback_balance_cents integer not null default 0 check (rakeback_balance_cents >= 0),
  free_spins_balance integer not null default 0 check (free_spins_balance >= 0),
  total_earned_cents integer not null default 0 check (total_earned_cents >= 0),
  total_redeemed_cents integer not null default 0 check (total_redeemed_cents >= 0),
  total_xp_from_orders integer not null default 0 check (total_xp_from_orders >= 0),
  last_level_id text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.vip_ledger_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_type text not null,
  source_key text not null,
  amount_cents integer not null default 0,
  free_spins_delta integer not null default 0,
  xp_delta integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  constraint vip_ledger_entries_source_unique unique (user_id, event_type, source_key)
);

create index if not exists vip_ledger_entries_user_created_idx
  on public.vip_ledger_entries (user_id, created_at desc);

create table if not exists public.vip_program_settings (
  id text primary key,
  cashback_enabled boolean not null default true,
  discounts_enabled boolean not null default true,
  level_rewards_enabled boolean not null default true,
  birthday_bonus_enabled boolean not null default true,
  reload_bonus_enabled boolean not null default true,
  rakeback_enabled boolean not null default true,
  exclusive_perks_enabled boolean not null default true,
  default_reload_bonus_percent integer not null default 15 check (default_reload_bonus_percent >= 0),
  default_birthday_bonus_cents integer not null default 5000 check (default_birthday_bonus_cents >= 0),
  vip_host_channel text,
  event_notes text,
  benefit_overrides jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

insert into public.vip_program_settings (
  id,
  cashback_enabled,
  discounts_enabled,
  level_rewards_enabled,
  birthday_bonus_enabled,
  reload_bonus_enabled,
  rakeback_enabled,
  exclusive_perks_enabled,
  default_reload_bonus_percent,
  default_birthday_bonus_cents,
  vip_host_channel,
  event_notes,
  benefit_overrides
)
values (
  'default',
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  15,
  5000,
  'vip@bigodedasrifas.com',
  'Eventos e perks premium podem ser liberados manualmente pelo admin conforme o nível do usuário.',
  '{}'::jsonb
)
on conflict (id) do nothing;

alter table public.vip_wallets enable row level security;
alter table public.vip_ledger_entries enable row level security;
alter table public.vip_program_settings enable row level security;

drop policy if exists "vip_wallets_read_own" on public.vip_wallets;
create policy "vip_wallets_read_own"
on public.vip_wallets for select
using (auth.uid() = user_id or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists "vip_wallets_admin_write" on public.vip_wallets;
create policy "vip_wallets_admin_write"
on public.vip_wallets for all
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists "vip_ledger_entries_read_own" on public.vip_ledger_entries;
create policy "vip_ledger_entries_read_own"
on public.vip_ledger_entries for select
using (auth.uid() = user_id or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists "vip_ledger_entries_admin_write" on public.vip_ledger_entries;
create policy "vip_ledger_entries_admin_write"
on public.vip_ledger_entries for all
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists "vip_program_settings_read_authenticated" on public.vip_program_settings;
create policy "vip_program_settings_read_authenticated"
on public.vip_program_settings for select
using (auth.uid() is not null);

drop policy if exists "vip_program_settings_admin_write" on public.vip_program_settings;
create policy "vip_program_settings_admin_write"
on public.vip_program_settings for all
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
