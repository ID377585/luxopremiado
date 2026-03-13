-- Add extended profile fields for address, banking and avatar
alter table public.profiles
  add column if not exists avatar_url text,
  add column if not exists address_line text,
  add column if not exists address_number text,
  add column if not exists address_complement text,
  add column if not exists address_district text,
  add column if not exists address_city text,
  add column if not exists address_state text,
  add column if not exists address_country text,
  add column if not exists address_zip text,
  add column if not exists cpf text,
  add column if not exists bank_name text,
  add column if not exists bank_agency text,
  add column if not exists bank_account text,
  add column if not exists bank_pix_key text;

comment on column public.profiles.avatar_url is 'URL da foto do usuário';
comment on column public.profiles.address_line is 'Rua/Avenida';
comment on column public.profiles.address_number is 'Número do endereço';
comment on column public.profiles.address_complement is 'Complemento';
comment on column public.profiles.address_district is 'Bairro';
comment on column public.profiles.address_city is 'Cidade';
comment on column public.profiles.address_state is 'Estado/UF';
comment on column public.profiles.address_country is 'País';
comment on column public.profiles.address_zip is 'CEP';
comment on column public.profiles.cpf is 'CPF do titular';
comment on column public.profiles.bank_name is 'Banco';
comment on column public.profiles.bank_agency is 'Agência';
comment on column public.profiles.bank_account is 'Conta corrente';
comment on column public.profiles.bank_pix_key is 'Chave PIX preferencial';
