alter table public.prize_configurations
  add column if not exists prize_value_cents integer not null default 0 check (prize_value_cents >= 0),
  add column if not exists image_url text;
