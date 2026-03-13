alter table public.vip_withdrawal_requests
  add column if not exists provider text,
  add column if not exists provider_reference text,
  add column if not exists provider_status text,
  add column if not exists payout_raw jsonb not null default '{}'::jsonb,
  add column if not exists paid_at timestamptz;

create index if not exists vip_withdrawal_requests_provider_reference_idx
  on public.vip_withdrawal_requests (provider, provider_reference);
