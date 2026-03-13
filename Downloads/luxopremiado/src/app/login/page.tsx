import Link from "next/link";

import { LiveActivityPopup } from "@/components/common/LiveActivityPopup";
import { AuthMessage } from "@/components/auth/AuthMessage";
import authStyles from "@/components/auth/auth.module.css";
import loginStyles from "@/app/login/login.module.css";
import { signInAction } from "@/lib/actions/auth";
import { formatBrlFromCents } from "@/lib/format";
import { buildLandingPathForSlug } from "@/lib/raffle-slug";
import { resolveAvailableRaffleSlug } from "@/lib/raffle-slug.server";
import { getRaffleLandingData } from "@/lib/raffles";

interface LoginPageProps {
  searchParams: Promise<{ error?: string; success?: string; next?: string }>;
}

function normalizeNextPath(next?: string): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/app/comprar";
  }

  return next;
}

function mapFriendlyError(error?: string): string | undefined {
  if (!error) {
    return undefined;
  }

  const normalized = error.toLowerCase();
  if (normalized.includes("faça login para continuar")) {
    return "Você precisa entrar para garantir seus números e continuar o pagamento.";
  }

  if (normalized.includes("acessar o admin")) {
    return "Use uma conta autorizada para acessar o painel administrativo.";
  }

  if (normalized.includes("área vip") || normalized.includes("programa vip")) {
    return "Faça login para verificar seu status e entrar na área VIP quando estiver liberada.";
  }

  return error;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const preferredSlug = await resolveAvailableRaffleSlug();
  let raffle: Awaited<ReturnType<typeof getRaffleLandingData>> | null = null;

  try {
    raffle = await getRaffleLandingData(preferredSlug, {
      resolveToAvailableSlug: true,
    });
  } catch {
    raffle = null;
  }

  const soldPercent = raffle
    ? Math.min(100, Math.max(0, (raffle.stats.soldNumbers / Math.max(raffle.totalNumbers, 1)) * 100))
    : 0;
  const prizeOne = raffle?.prize.configs?.find((entry) => entry.prizeOrder === 1) ?? raffle?.prize.configs?.[0];
  const prizeOneStats = prizeOne?.stats;
  const prizeOneTotal =
    typeof prizeOne?.totalNumbers === "number" && prizeOne.totalNumbers > 0 ? prizeOne.totalNumbers : raffle?.totalNumbers ?? 0;
  const prizeOneSold = prizeOneStats?.sold ?? Math.round((soldPercent / 100) * Math.max(prizeOneTotal, 0));
  const prizeOneReserved = prizeOneStats?.reserved ?? 0;
  const prizeOneAvailable = prizeOneStats?.available ?? Math.max(0, prizeOneTotal - prizeOneSold - prizeOneReserved);
  const prizeOneSoldPercent =
    prizeOneTotal > 0 ? Math.min(100, Math.max(0, (prizeOneSold / prizeOneTotal) * 100)) : 0;
  const prizeOneDrawDateLabel = (() => {
    if (prizeOne?.drawDateLabel) {
      return prizeOne.drawDateLabel;
    }

    if (prizeOne?.drawDate) {
      const parsed = new Date(prizeOne.drawDate);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
      }
    }

    return "A definir";
  })();
  const prizeOneValueLabel =
    prizeOne?.prizeValueLabel ?? (typeof prizeOne?.prizeValueCents === "number" ? formatBrlFromCents(prizeOne.prizeValueCents) : "A definir");

  const friendlyError = mapFriendlyError(params.error);
  const nextPath = normalizeNextPath(params.next);
  const landingHref = buildLandingPathForSlug(raffle?.slug ?? preferredSlug, "inicio");
  const isVipIntent = nextPath.startsWith("/app/vip");
  const headlinePrize = prizeOne?.prizeLabel ?? raffle?.prize.title ?? "o prêmio principal";

  return (
    <main className={loginStyles.page}>
      <LiveActivityPopup scope="login" />

      <section className={loginStyles.layout}>
        <aside className={loginStyles.showcase}>
          <p className={loginStyles.showcaseKicker}>{isVipIntent ? "Programa VIP" : "Área do Participante"}</p>
          <h2 className={loginStyles.showcaseTitle}>
            {isVipIntent
              ? "Entre para verificar seu nível e liberar os benefícios exclusivos do programa VIP."
              : `Entre agora e dispute ${headlinePrize} com seus melhores números.`}
          </h2>
          <p className={loginStyles.showcaseSubtitle}>
            {isVipIntent
              ? "O acesso VIP depende do seu perfil de afiliado e da pontuação acumulada em compras, leilões e indicações."
              : "Quem entra primeiro escolhe melhor. Seu acesso libera checkout rápido, confirmação automática no PIX e acompanhamento da campanha."}
          </p>

          <div className={loginStyles.metricGrid}>
            <article className={loginStyles.metricCard}>
              <p className={loginStyles.metricLabel}>Prêmio 1</p>
              <p className={loginStyles.metricValue}>{prizeOne?.prizeLabel ?? raffle?.prize.title ?? "Indisponível"}</p>
            </article>
            <article className={loginStyles.metricCard}>
              <p className={loginStyles.metricLabel}>Valor</p>
              <p className={loginStyles.metricValue}>{prizeOneValueLabel}</p>
            </article>
            <article className={loginStyles.metricCard}>
              <p className={loginStyles.metricLabel}>Data do sorteio</p>
              <p className={loginStyles.metricValue}>
                {prizeOneDrawDateLabel}
              </p>
            </article>
          </div>

          <div className={loginStyles.progressWrap} aria-label="Progresso de números vendidos">
            <div className={loginStyles.progressTrack}>
              <span className={loginStyles.progressFill} style={{ width: `${prizeOneSoldPercent}%` }} />
            </div>
            <p className={loginStyles.progressText}>
              {raffle
                ? `Prêmio 1: ${prizeOneSoldPercent.toFixed(1)}% vendidos (${prizeOneSold.toLocaleString("pt-BR")} de ${Math.max(prizeOneTotal, 0).toLocaleString("pt-BR")}). Restam ${prizeOneAvailable.toLocaleString("pt-BR")} números.`
                : "Dados da campanha indisponíveis no momento."}
            </p>
          </div>
        </aside>

        <section className={loginStyles.loginCard}>
          <p className={loginStyles.vipTag}>{isVipIntent ? "Acesso ao programa VIP" : "Acesso à sua conta"}</p>
          <h1 className={loginStyles.title}>
            {isVipIntent ? "Faça login para continuar no programa VIP" : "Você está a um passo de garantir seus números!"}
          </h1>
          <p className={loginStyles.subtitle}>
            {isVipIntent ? "Depois do login você verá sua pontuação, regras do programa e liberação da área exclusiva." : "Seus números só ficam garantidos após o login."}
          </p>

          <AuthMessage error={friendlyError} success={params.success} />

          <form action={signInAction} className={authStyles.form}>
            <input name="next" type="hidden" value={nextPath} />
            <input className={authStyles.input} name="email" placeholder="Seu e-mail" required type="email" />
            <input className={authStyles.input} name="password" placeholder="Sua senha" required type="password" />
            <button className={`${authStyles.button} ${loginStyles.mainButton}`} type="submit">
              ENTRAR E GARANTIR MEUS NÚMEROS
            </button>
          </form>

          <div className={authStyles.links}>
            <Link className={authStyles.buttonSecondary} href="/cadastro">
              Criar conta
            </Link>
            <Link className={authStyles.buttonSecondary} href="/recuperar-senha">
              Recuperar senha
            </Link>
            <Link className={authStyles.buttonSecondary} href={landingHref}>
              Voltar para a campanha
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}
