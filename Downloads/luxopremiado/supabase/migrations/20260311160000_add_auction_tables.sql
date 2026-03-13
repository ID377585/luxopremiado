create extension if not exists pgcrypto;

create table if not exists public.auctions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  image_url text,
  current_bid_cents integer not null default 0 check (current_bid_cents >= 0),
  min_increment_cents integer not null default 500 check (min_increment_cents > 0),
  ends_at timestamptz not null,
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.auction_bids (
  id bigserial primary key,
  auction_id uuid not null references public.auctions(id) on delete cascade,
  bidder_name text,
  bidder_contact text,
  amount_cents integer not null check (amount_cents > 0),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists auction_bids_auction_id_created_idx on public.auction_bids (auction_id, created_at desc);

-- seed default auction for PlayStation 5
insert into public.auctions (slug, title, description, image_url, current_bid_cents, min_increment_cents, ends_at, status)
values (
  'ps5-leilao',
  'Leilão PlayStation 5',
  'Console PlayStation 5 lacrado com DualSense. Participe e dê seu lance agora!',
  'https://upload.wikimedia.org/wikipedia/commons/3/3a/PS5_console.png',
  0,
  1000,
  timezone('utc', now()) + interval '3 days',
  'open'
)
on conflict (slug) do nothing;
