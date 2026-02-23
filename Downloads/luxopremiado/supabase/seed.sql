-- Seed opcional para ambiente local

insert into public.raffles (
  id,
  slug,
  title,
  description,
  cover_image_url,
  price_cents,
  total_numbers,
  max_numbers_per_user,
  draw_date,
  draw_method,
  status
)
values (
  gen_random_uuid(),
  'luxo-premiado',
  'Luxo Premiado - Jeep Compass Série S',
  'Campanha principal de lançamento da plataforma.',
  '/images/prize/compass-1.svg',
  1990,
  10000,
  50,
  now() + interval '60 days',
  'loteria_federal',
  'active'
)
on conflict (slug) do nothing;

-- Execute a função após inserir a rifa
-- select public.generate_raffle_numbers('<RAFFLE_ID>');
