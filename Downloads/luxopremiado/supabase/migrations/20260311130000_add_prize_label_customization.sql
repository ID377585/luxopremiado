alter table public.prize_configurations
  add column if not exists prize_value_label text,
  add column if not exists total_numbers_label text,
  add column if not exists draw_date_label text,
  add column if not exists lucky_number_label text,
  add column if not exists guarantee_label text,
  add column if not exists delivery_label text;
