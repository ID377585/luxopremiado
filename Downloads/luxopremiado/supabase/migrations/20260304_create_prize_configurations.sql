create table if not exists public.prize_configurations (
  id bigserial primary key,
  raffle_slug text not null,
  prize_order integer not null check (prize_order between 1 and 3),
  prize_label text not null,
  prize_value_cents integer not null default 0 check (prize_value_cents >= 0),
  image_url text,
  total_numbers integer not null check (total_numbers > 0),
  draw_date timestamptz not null,
  lucky_number integer not null check (lucky_number > 0),
  updated_by text,
  updated_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists prize_configurations_slug_order_idx
  on public.prize_configurations (raffle_slug, prize_order);
