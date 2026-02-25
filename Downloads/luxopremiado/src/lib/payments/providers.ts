import { createHmac, randomUUID } from "node:crypto";

import Stripe from "stripe";

import { getSiteUrl } from "@/lib/env";

export type PaymentProviderName = "asaas" | "mercadopago" | "pagarme" | "stripe";

export interface PaymentProviderInput {
  provider: PaymentProviderName;
  method: "pix" | "card";
  order: {
    id: string;
    amount_cents: number;
    user_id: string;
    raffle_id?: string;
  };
  customer?: {
    email?: string | null;
    name?: string | null;
    phone?: string | null;
  };
}

export interface PaymentProviderResult {
  providerReference: string;
  pixQrCode?: string;
  pixCopyPaste?: string;
  checkoutUrl?: string;
  status: "pending" | "initiated";
  raw: Record<string, unknown>;
  expiresAt?: string;
}

type JsonObject = Record<string, unknown>;

function brlAmountFromCents(cents: number): number {
  return Number((cents / 100).toFixed(2));
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variável de ambiente ausente: ${name}`);
  }
  return value;
}

function buildSuccessUrl(orderId: string): string {
  return process.env.PAYMENT_SUCCESS_URL ?? `${getSiteUrl()}/app/pagamentos?status=success&orderId=${orderId}`;
}

function buildCancelUrl(orderId: string): string {
  return process.env.PAYMENT_CANCEL_URL ?? `${getSiteUrl()}/app/pagamentos?status=cancel&orderId=${orderId}`;
}

function buildPendingUrl(orderId: string): string {
  return process.env.PAYMENT_PENDING_URL ?? `${getSiteUrl()}/app/pagamentos?status=pending&orderId=${orderId}`;
}

function buildWebhookUrl(provider: PaymentProviderName): string {
  return `${getSiteUrl()}/api/webhooks/${provider}`;
}

function sanitizeEmail(input?: string | null, userId?: string): string {
  if (input && /.+@.+\..+/.test(input)) {
    return input;
  }

  return `${(userId ?? "cliente").slice(0, 10)}@placeholder.luxopremiado.com.br`;
}

function sanitizeName(input?: string | null): string {
  if (input && input.trim().length > 1) {
    return input.trim();
  }

  return "Cliente Luxo Premiado";
}

function asObject(value: unknown): JsonObject | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }

  return value as JsonObject;
}

function getString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function getStringFromStringOrNumber(value: unknown): string | null {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  return null;
}

async function createStripePayment(input: PaymentProviderInput): Promise<PaymentProviderResult> {
  const stripeSecret = requireEnv("STRIPE_SECRET_KEY");
  const stripe = new Stripe(stripeSecret);

  const paymentMethodTypes: Stripe.Checkout.SessionCreateParams.PaymentMethodType[] =
    input.method === "pix" ? ["pix"] : ["card"];

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "brl",
          unit_amount: input.order.amount_cents,
          product_data: {
            name: `Pedido ${input.order.id}`,
            description: `Rifa ${input.order.raffle_id ?? "luxopremiado"}`,
          },
        },
      },
    ],
    payment_method_types: paymentMethodTypes,
    success_url: `${buildSuccessUrl(input.order.id)}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: buildCancelUrl(input.order.id),
    metadata: {
      orderId: input.order.id,
      userId: input.order.user_id,
      raffleId: input.order.raffle_id ?? "",
    },
    client_reference_id: input.order.id,
    customer_email: sanitizeEmail(input.customer?.email, input.order.user_id),
  });

  if (!session.id) {
    throw new Error("Stripe não retornou ID de sessão.");
  }

  return {
    providerReference: session.id,
    checkoutUrl: session.url ?? undefined,
    status: "pending",
    raw: {
      provider: "stripe",
      checkoutSessionId: session.id,
      paymentStatus: session.payment_status,
      orderId: input.order.id,
    },
    expiresAt: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : undefined,
  };
}

async function createMercadoPagoPayment(input: PaymentProviderInput): Promise<PaymentProviderResult> {
  const token = requireEnv("MERCADOPAGO_ACCESS_TOKEN");

  if (input.method === "pix") {
    const response = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": randomUUID(),
      },
      body: JSON.stringify({
        transaction_amount: brlAmountFromCents(input.order.amount_cents),
        description: `Pedido ${input.order.id}`,
        payment_method_id: "pix",
        payer: {
          email: sanitizeEmail(input.customer?.email, input.order.user_id),
          first_name: sanitizeName(input.customer?.name),
        },
        external_reference: input.order.id,
        notification_url: buildWebhookUrl("mercadopago"),
        metadata: {
          orderId: input.order.id,
          raffleId: input.order.raffle_id ?? "",
        },
      }),
      cache: "no-store",
    });

    const data = (await response.json()) as JsonObject;

    if (!response.ok) {
      throw new Error(`Mercado Pago PIX: ${JSON.stringify(data)}`);
    }

    const pointOfInteraction = asObject(data.point_of_interaction);
    const tx = asObject(pointOfInteraction?.transaction_data);

    return {
      providerReference: getStringFromStringOrNumber(data.id) ?? randomUUID(),
      pixQrCode: getString(tx?.qr_code_base64) ?? undefined,
      pixCopyPaste: getString(tx?.qr_code) ?? undefined,
      status: "pending",
      raw: {
        provider: "mercadopago",
        orderId: input.order.id,
        paymentId: data.id,
        status: data.status,
      },
      expiresAt: getString(data.date_of_expiration) ?? undefined,
    };
  }

  const preferenceResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Idempotency-Key": randomUUID(),
    },
    body: JSON.stringify({
      items: [
        {
          title: `Pedido ${input.order.id}`,
          quantity: 1,
          currency_id: "BRL",
          unit_price: brlAmountFromCents(input.order.amount_cents),
        },
      ],
      back_urls: {
        success: buildSuccessUrl(input.order.id),
        pending: buildPendingUrl(input.order.id),
        failure: buildCancelUrl(input.order.id),
      },
      external_reference: input.order.id,
      notification_url: buildWebhookUrl("mercadopago"),
      metadata: {
        orderId: input.order.id,
      },
      payer: {
        email: sanitizeEmail(input.customer?.email, input.order.user_id),
        name: sanitizeName(input.customer?.name),
      },
      auto_return: "approved",
    }),
    cache: "no-store",
  });

  const preference = (await preferenceResponse.json()) as JsonObject;

  if (!preferenceResponse.ok) {
    throw new Error(`Mercado Pago cartão: ${JSON.stringify(preference)}`);
  }

  return {
    providerReference: getStringFromStringOrNumber(preference.id) ?? randomUUID(),
    checkoutUrl: getString(preference.init_point) ?? getString(preference.sandbox_init_point) ?? undefined,
    status: "initiated",
    raw: {
      provider: "mercadopago",
      preferenceId: preference.id,
      orderId: input.order.id,
    },
  };
}

async function asaasRequest<T>(path: string, init: RequestInit): Promise<T> {
  const apiKey = requireEnv("ASAAS_API_KEY");
  const baseUrl = process.env.ASAAS_API_URL ?? "https://api.asaas.com";

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      access_token: apiKey,
      "content-type": "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });

  const data = (await response.json()) as T & { errors?: Array<{ description?: string }> };
  if (!response.ok) {
    const reason = data?.errors?.map((item) => item.description).join(", ") || JSON.stringify(data);
    throw new Error(`Asaas erro: ${reason}`);
  }

  return data;
}

async function ensureAsaasCustomer(input: PaymentProviderInput): Promise<string> {
  const externalReference = `user_${input.order.user_id}`;

  const query = await asaasRequest<{ data?: Array<{ id: string }> }>(
    `/v3/customers?externalReference=${encodeURIComponent(externalReference)}`,
    {
      method: "GET",
    },
  );

  const existingId = query.data?.[0]?.id;
  if (existingId) {
    return existingId;
  }

  const customer = await asaasRequest<{ id: string }>("/v3/customers", {
    method: "POST",
    body: JSON.stringify({
      name: sanitizeName(input.customer?.name),
      email: sanitizeEmail(input.customer?.email, input.order.user_id),
      externalReference,
      notificationDisabled: true,
    }),
  });

  return customer.id;
}

async function createAsaasPayment(input: PaymentProviderInput): Promise<PaymentProviderResult> {
  const customerId = await ensureAsaasCustomer(input);

  if (input.method === "card") {
    const link = await asaasRequest<{ id: string; url?: string }>("/v3/paymentLinks", {
      method: "POST",
      body: JSON.stringify({
        name: `Pedido ${input.order.id}`,
        description: `Rifa ${input.order.raffle_id ?? "luxopremiado"}`,
        billingType: "UNDEFINED",
        chargeType: "DETACHED",
        value: brlAmountFromCents(input.order.amount_cents),
        dueDateLimitDays: 1,
        notificationEnabled: false,
        externalReference: input.order.id,
      }),
    });

    return {
      providerReference: link.id,
      checkoutUrl: link.url,
      status: "initiated",
      raw: {
        provider: "asaas",
        paymentLinkId: link.id,
        orderId: input.order.id,
      },
    };
  }

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 1);

  const payment = await asaasRequest<{ id: string; status?: string; dueDate?: string }>("/v3/payments", {
    method: "POST",
    body: JSON.stringify({
      customer: customerId,
      billingType: "PIX",
      value: brlAmountFromCents(input.order.amount_cents),
      dueDate: dueDate.toISOString().slice(0, 10),
      externalReference: input.order.id,
      description: `Pedido ${input.order.id}`,
    }),
  });

  const pixData = await asaasRequest<{ payload?: string; encodedImage?: string }>(
    `/v3/payments/${payment.id}/pixQrCode`,
    {
      method: "GET",
    },
  );

  return {
    providerReference: payment.id,
    pixQrCode: pixData.encodedImage,
    pixCopyPaste: pixData.payload,
    status: "pending",
    raw: {
      provider: "asaas",
      paymentId: payment.id,
      status: payment.status,
      orderId: input.order.id,
    },
    expiresAt: payment.dueDate,
  };
}

export async function createPaymentProvider(input: PaymentProviderInput): Promise<PaymentProviderResult> {
  if (input.provider === "stripe") {
    return createStripePayment(input);
  }

  if (input.provider === "mercadopago") {
    return createMercadoPagoPayment(input);
  }

  if (input.provider === "asaas") {
    return createAsaasPayment(input);
  }

  if (input.provider === "pagarme") {
    throw new Error(
      "Provider pagarme exige checkout dedicado/tokens de cartão. Configure implementação específica antes de ativar em produção.",
    );
  }

  throw new Error(`Provider de pagamento não suportado: ${input.provider}`);
}

function timingSafeEqualHex(a: string, b: string): boolean {
  const normalizedA = a.trim().toLowerCase();
  const normalizedB = b.trim().toLowerCase();

  if (normalizedA.length !== normalizedB.length) {
    return false;
  }

  let result = 0;
  for (let index = 0; index < normalizedA.length; index += 1) {
    result |= normalizedA.charCodeAt(index) ^ normalizedB.charCodeAt(index);
  }

  return result === 0;
}

function parseSignatureHeader(signature: string): Record<string, string> {
  return signature
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, piece) => {
      const [key, value] = piece.split("=");
      if (key && value) {
        acc[key.trim()] = value.trim();
      }
      return acc;
    }, {});
}

async function verifyMercadoPagoSignature(input: {
  rawBody: string;
  signatureHeader: string | null;
  requestId: string | null;
  dataId: string | null;
}): Promise<boolean> {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) {
    return false;
  }

  if (!input.signatureHeader || !input.requestId || !input.dataId) {
    return false;
  }

  const pieces = parseSignatureHeader(input.signatureHeader);
  const ts = pieces.ts;
  const v1 = pieces.v1;

  if (!ts || !v1) {
    return false;
  }

  const manifest = `id:${input.dataId};request-id:${input.requestId};ts:${ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");

  return timingSafeEqualHex(expected, v1);
}

async function fetchMercadoPagoPaymentById(paymentId: string): Promise<JsonObject> {
  const token = requireEnv("MERCADOPAGO_ACCESS_TOKEN");
  const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const data = (await response.json()) as JsonObject;

  if (!response.ok) {
    throw new Error(`Mercado Pago webhook fetch falhou: ${JSON.stringify(data)}`);
  }

  return data;
}

export interface ParsedWebhookResult {
  providerReference: string;
  orderId: string;
  paid: boolean;
  raw: Record<string, unknown>;
}

export async function verifyAndParseWebhook(input: {
  provider: PaymentProviderName;
  rawBody: string;
  headers: Headers;
  query: URLSearchParams;
}): Promise<ParsedWebhookResult> {
  if (input.provider === "stripe") {
    const secret = requireEnv("STRIPE_WEBHOOK_SECRET");
    const signature = input.headers.get("stripe-signature");

    if (!signature) {
      throw new Error("Assinatura Stripe ausente.");
    }

    const stripe = new Stripe(requireEnv("STRIPE_SECRET_KEY"));
    const event = stripe.webhooks.constructEvent(input.rawBody, signature, secret);
    const dataObject = event.data.object as Stripe.Checkout.Session | Stripe.PaymentIntent;

    const metadata = (dataObject as { metadata?: Record<string, string> }).metadata ?? {};
    const orderId = metadata.orderId || metadata.order_id || "";

    if (!orderId) {
      throw new Error("Stripe webhook sem orderId em metadata.");
    }

    const paidEvents = new Set([
      "checkout.session.completed",
      "payment_intent.succeeded",
      "charge.succeeded",
    ]);

    const providerReference = String(event.id);

    return {
      providerReference,
      orderId,
      paid: paidEvents.has(event.type),
      raw: event as unknown as Record<string, unknown>,
    };
  }

  const payload = JSON.parse(input.rawBody) as JsonObject;

  if (input.provider === "mercadopago") {
    const dataIdFromQuery = input.query.get("data.id") ?? null;
    const payloadData = asObject(payload.data);
    const dataIdFromPayload =
      getStringFromStringOrNumber(payloadData?.id) ?? getStringFromStringOrNumber(payload.id);

    const dataId = dataIdFromQuery ?? dataIdFromPayload;

    const valid = await verifyMercadoPagoSignature({
      rawBody: input.rawBody,
      signatureHeader: input.headers.get("x-signature"),
      requestId: input.headers.get("x-request-id"),
      dataId,
    });

    if (!valid) {
      throw new Error("Assinatura Mercado Pago inválida.");
    }

    if (!dataId) {
      throw new Error("Mercado Pago webhook sem data.id.");
    }

    const payment = await fetchMercadoPagoPaymentById(String(dataId));
    const metadata = asObject(payment.metadata);
    const orderId =
      getString(payment.external_reference) ?? getString(metadata?.orderId);

    if (!orderId) {
      throw new Error("Mercado Pago pagamento sem orderId.");
    }

    return {
      providerReference: String(payment.id ?? dataId),
      orderId,
      paid: String(payment.status ?? "").toLowerCase() === "approved",
      raw: payment,
    };
  }

  if (input.provider === "asaas") {
    const expectedToken = requireEnv("ASAAS_WEBHOOK_TOKEN");
    const providedToken = input.headers.get("asaas-access-token");

    if (!providedToken || providedToken !== expectedToken) {
      throw new Error("Token de webhook Asaas inválido.");
    }

    const payment = asObject(payload.payment);
    const orderId =
      getString(payment?.externalReference) ?? getString(payload.externalReference);

    if (!orderId) {
      throw new Error("Asaas webhook sem externalReference/orderId.");
    }

    const event = String(payload.event ?? "").toUpperCase();
    const status = String(payment?.status ?? "").toUpperCase();

    const paidEvents = new Set([
      "PAYMENT_RECEIVED",
      "PAYMENT_CONFIRMED",
      "PAYMENT_UPDATED",
      "PAYMENT_DUNNING_RECEIVED",
    ]);

    const paid = paidEvents.has(event) || status === "RECEIVED" || status === "CONFIRMED";

    return {
      providerReference:
        getStringFromStringOrNumber(payment?.id) ??
        getStringFromStringOrNumber(payload.id) ??
        randomUUID(),
      orderId,
      paid,
      raw: payload,
    };
  }

  if (input.provider === "pagarme") {
    const secret = requireEnv("PAGARME_WEBHOOK_SECRET");
    const signature = input.headers.get("x-hub-signature-256") ?? input.headers.get("x-hub-signature");

    if (!signature) {
      throw new Error("Assinatura Pagar.me ausente.");
    }

    const received = signature.replace(/^sha256=/i, "");
    const expected = createHmac("sha256", secret).update(input.rawBody).digest("hex");

    if (!timingSafeEqualHex(expected, received)) {
      throw new Error("Assinatura Pagar.me inválida.");
    }

    const payloadData = asObject(payload.data);
    const metadata = asObject(payloadData?.metadata);
    const orderId = getString(metadata?.orderId) ?? getString(metadata?.order_id);

    if (!orderId) {
      throw new Error("Pagar.me webhook sem metadata.orderId.");
    }

    const status = String(payloadData?.status ?? payload.status ?? "").toLowerCase();
    const paid = ["paid", "captured", "succeeded", "closed"].includes(status);

    return {
      providerReference:
        getStringFromStringOrNumber(payloadData?.id) ??
        getStringFromStringOrNumber(payload.id) ??
        randomUUID(),
      orderId,
      paid,
      raw: payload,
    };
  }

  throw new Error(`Provider de webhook não suportado: ${input.provider}`);
}
