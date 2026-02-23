create table if not exists public.platform_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  level text not null default 'info' check (level in ('debug', 'info', 'warn', 'error')),
  request_id text,
  user_id uuid references public.profiles(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  raffle_id uuid references public.raffles(id) on delete set null,
  provider text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists platform_events_created_at_idx on public.platform_events(created_at desc);
create index if not exists platform_events_event_type_idx on public.platform_events(event_type);
create index if not exists platform_events_level_idx on public.platform_events(level);
create index if not exists platform_events_order_idx on public.platform_events(order_id);

alter table public.platform_events enable row level security;

drop policy if exists "platform_events_admin_read" on public.platform_events;
create policy "platform_events_admin_read"
on public.platform_events for select
using (public.is_admin());

revoke all on public.platform_events from anon, authenticated;
grant select on public.platform_events to authenticated;
