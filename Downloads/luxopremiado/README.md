# Luxo Premiado (`luxopremiado.com.br`)

Plataforma de sorteio/rifas com foco em produção, usando Next.js + TypeScript + Supabase.

## O que já está implementado

- Landing completa por rifa em `/r/[slug]`:
  Hero -> Prêmio -> Como Funciona -> Área do usuário -> Escolher Números -> Pagamento -> Transparência -> Prova Social -> FAQ -> Rodapé.
- Autenticação com Supabase Auth:
  `/login`, `/cadastro`, `/recuperar-senha`, `/reset-senha`.
- Área do usuário:
  `/app`, `/app/minhas-rifas`, `/app/perfil`, `/app/pagamentos`.
- Admin com Server Actions:
  CRUD de rifas/imagens/transparência + painel de afiliados/comissões.
- Fluxo de reserva e compra:
  reserva transacional, criação de pedido, criação de pagamento, webhook idempotente, confirmação de pagamento.
- Realtime da grade de números.
- Anti-bot com Turnstile + rate limit (Upstash Redis, fallback in-memory).
- Limite de compra por usuário na RPC de reserva.
- Afiliados e ranking de compradores.
- Observabilidade básica com logs estruturados, eventos persistidos e alerta por webhook.
- Testes automatizados de API crítica (reserva e webhook).

## Stack

- Next.js (App Router)
- TypeScript
- CSS Modules + HTML
- Supabase (Postgres, Auth, RLS, RPC)
- Gateway de pagamento (Stripe / Mercado Pago / Asaas)

## Setup local

1. Instalar dependências:

```bash
npm install
```

2. Criar `.env.local`:

```bash
cp .env.example .env.local
```

3. Preencher variáveis no `.env.local`:

### App/Supabase

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Segurança/infra

- `WEBHOOK_SECRET` (manual webhook)
- `CRON_SECRET`
- `ALERT_WEBHOOK_URL` (opcional)
- `TURNSTILE_SECRET_KEY`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

### Pagamentos

- `PAYMENT_SUCCESS_URL`
- `PAYMENT_CANCEL_URL`
- `PAYMENT_PENDING_URL`

#### Stripe

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

#### Mercado Pago

- `MERCADOPAGO_ACCESS_TOKEN`
- `MERCADOPAGO_WEBHOOK_SECRET`

#### Asaas

- `ASAAS_API_KEY`
- `ASAAS_API_URL` (default: `https://api.asaas.com`)
- `ASAAS_WEBHOOK_TOKEN`

4. Rodar projeto:

```bash
npm run dev
```

## Banco de dados (Supabase)

Aplicar migrations nesta ordem:

- `supabase/migrations/20260223152000_init_luxo_premiado.sql`
- `supabase/migrations/20260223201500_growth_features_realtime_antibot_affiliates.sql`
- `supabase/migrations/20260223214000_observability_platform_events.sql`
- `supabase/migrations/20260224011000_raffle_numbers_bigint_12_digits.sql`
- `supabase/migrations/20260225104500_purchase_flow_hardening.sql`
- `supabase/migrations/20260225123000_provider_contract_strict.sql`

Observação:
- Após a migration de 12 dígitos, o domínio de numeração passa a ser `000000000000` até `999999999999` (armazenado como `bigint`).

Se usar CLI:

```bash
npx supabase link --project-ref <PROJECT_REF>
npx supabase db push
```

Depois de criar/publicar uma rifa, gerar números:

```sql
select public.generate_raffle_numbers('<RAFFLE_ID>');
```

## Rotas principais

### Frontend

- `/r/[slug]`
- `/login`
- `/cadastro`
- `/recuperar-senha`
- `/reset-senha`
- `/app/*`
- `/admin/*`

### API

- `POST /api/raffles/[slug]/reserve`
- `GET /api/raffles/[slug]/numbers`
- `POST /api/payments/create`
- `GET /api/orders/[id]/status`
- `POST /api/webhooks/[provider]`
- `POST /api/cron/expire-reservations`
- `POST /api/affiliates/enroll`
- `GET /api/affiliates/me`

## Testes

```bash
npm run test
npm run test:coverage
```

## Deploy na Vercel

1. Conectar o repositório na Vercel.
2. Definir todas as variáveis de ambiente (Production/Preview/Development).
3. Garantir URL pública correta em `NEXT_PUBLIC_SITE_URL`.
4. Configurar webhooks dos gateways para:

- `https://SEU_DOMINIO/api/webhooks/stripe`
- `https://SEU_DOMINIO/api/webhooks/mercadopago`
- `https://SEU_DOMINIO/api/webhooks/asaas`

5. Configurar job para expirar reservas:

- chamar `POST /api/cron/expire-reservations` com header `x-cron-secret`.

## Observações importantes

- `README.md` é o arquivo oficial exibido no GitHub.
- `README.original.md` era só resquício do scaffold inicial e foi removido para evitar ambiguidade.
- Nunca expor `SUPABASE_SERVICE_ROLE_KEY` no frontend.
