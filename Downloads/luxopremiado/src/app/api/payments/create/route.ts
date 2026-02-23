import { NextRequest, NextResponse } from "next/server";

import { hasSupabaseEnv } from "@/lib/env";
import { createPaymentProvider } from "@/lib/payments/providers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { paymentSchema } from "@/lib/validators/payment";

export async function POST(request: NextRequest) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json(
      { error: "Supabase não configurado. Defina as variáveis de ambiente." },
      { status: 503 },
    );
  }

  try {
    const payload = await request.json();
    const parsed = paymentSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Payload inválido",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, user_id, amount_cents, status")
      .eq("id", parsed.data.orderId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 400 });
    }

    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }

    if (order.status !== "pending") {
      return NextResponse.json({ error: "Status inválido para pagamento" }, { status: 400 });
    }

    const paymentResponse = await createPaymentProvider({
      provider: parsed.data.provider,
      method: parsed.data.method,
      order,
    });

    const serviceClient = createSupabaseServiceClient();

    const { error: paymentError } = await serviceClient.from("payments").insert({
      order_id: order.id,
      provider: parsed.data.provider,
      provider_reference: paymentResponse.providerReference,
      status: paymentResponse.status,
      pix_qr_code: paymentResponse.pixQrCode ?? null,
      pix_copy_paste: paymentResponse.pixCopyPaste ?? null,
      raw: paymentResponse.raw,
    });

    if (paymentError) {
      return NextResponse.json({ error: paymentError.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      payment: paymentResponse,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
