import Link from "next/link";

import { LiveActivityPopup } from "@/components/common/LiveActivityPopup";
import { AuthMessage } from "@/components/auth/AuthMessage";
import authStyles from "@/components/auth/auth.module.css";
import loginStyles from "@/app/login/login.module.css";
import { forgotPasswordAction, signInWithGoogleAction } from "@/lib/actions/auth";
import { getRaffleLandingData } from "@/lib/raffles";

interface ForgotPasswordPageProps {
  searchParams: Promise<{ error?: string; success?: string }>;
}

function mapFriendlyError(error?: string): string | undefined {
  if (!error) {
    return undefined;
  }

  const normalized = error.toLowerCase();
  if (normalized.includes("rate limit") || normalized.includes("security purposes")) {
    return "Muitas tentativas em sequência. Aguarde cerca de 60 segundos e tente novamente.";
  }

  return error;
}

function mapFriendlySuccess(success?: string): string | undefined {
  if (!success) {
    return undefined;
  }

  return "Pronto! Enviamos o link para você voltar e finalizar sua participação. Verifique caixa de entrada e spam.";
}

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const params = await searchParams;
  const raffle = await getRaffleLandingData("luxo-premiado");
  const soldPercent = Math.min(100, Math.max(0, (raffle.stats.soldNumbers / Math.max(raffle.totalNumbers, 1)) * 100));
  const topBuyer = raffle.buyerRanking[0];
  const whatsAppLoginUrl = `https://wa.me/?text=${encodeURIComponent(
    "Quero voltar para a Luxo Premiado e finalizar meus números agora.",
  )}`;
  const friendlyError = mapFriendlyError(params.error);
  const friendlySuccess = mapFriendlySuccess(params.success);

  return (
    <main className={loginStyles.page}>
      <LiveActivityPopup scope="login" />

      <section className={loginStyles.layout}>
        <aside className={loginStyles.showcase}>
          <p className={loginStyles.showcaseKicker}>Retorno rápido ao sorteio</p>
          <h2 className={loginStyles.showcaseTitle}>Não perca seus números por causa da senha.</h2>
          <p className={loginStyles.showcaseSubtitle}>
            Enquanto você está fora, outros participantes continuam comprando. Recupere agora e volte para finalizar em
            menos de 1 minuto.
          </p>

          <div className={loginStyles.metricGrid}>
            <article className={loginStyles.metricCard}>
              <p className={loginStyles.metricLabel}>Prêmio atual</p>
              <p className={loginStyles.metricValue}>Jeep Compass 0km</p>
            </article>
            <article className={loginStyles.metricCard}>
              <p className={loginStyles.metricLabel}>Vendidos</p>
              <p className={loginStyles.metricValue}>{soldPercent.toFixed(1)}%</p>
            </article>
            <article className={loginStyles.metricCard}>
              <p className={loginStyles.metricLabel}>Ranking líder</p>
              <p className={loginStyles.metricValue}>
                {topBuyer ? `${topBuyer.participant} · ${topBuyer.totalNumbers}` : "Atualizando..."}
              </p>
            </article>
          </div>

          <div className={loginStyles.progressWrap} aria-label="Progresso de números vendidos">
            <div className={loginStyles.progressTrack}>
              <span className={loginStyles.progressFill} style={{ width: `${soldPercent}%` }} />
            </div>
            <p className={loginStyles.progressText}>
              {soldPercent.toFixed(1)}% vendidos. Ainda dá tempo de entrar no Top 10 hoje.
            </p>
          </div>
        </aside>

        <section className={loginStyles.loginCard}>
          <p className={loginStyles.vipTag}>Recuperação segura</p>
          <h1 className={loginStyles.title}>Volte agora e finalize sua participação.</h1>
          <p className={loginStyles.subtitle}>
            Se você já iniciou sua compra, seus números ainda podem estar disponíveis. Digite seu e-mail para recuperar
            o acesso e retomar o checkout.
          </p>
          <p className={loginStyles.urgencyLine}>Atenção: os números continuam sendo vendidos enquanto você está fora.</p>

          <AuthMessage error={friendlyError} success={friendlySuccess} />

          <ul className={loginStyles.benefitList}>
            <li>Retomar a compra sem perder tempo</li>
            <li>Garantir seus números antes que acabem</li>
            <li>Voltar para o ranking de compradores</li>
            <li>Concluir pagamento e confirmação no PIX</li>
          </ul>

          <form action={forgotPasswordAction} className={authStyles.form}>
            <input className={authStyles.input} name="email" placeholder="Seu e-mail" required type="email" />
            <button className={`${authStyles.button} ${loginStyles.mainButton}`} type="submit">
              RECUPERAR E VOLTAR PARA GARANTIR MEUS NÚMEROS
            </button>
          </form>

          <div className={loginStyles.socialGrid}>
            <form action={signInWithGoogleAction}>
              <input name="next" type="hidden" value="/app/comprar" />
              <button className={loginStyles.socialButton} type="submit">
                Entrar com Google
              </button>
            </form>
            <a className={loginStyles.socialButton} href={whatsAppLoginUrl} rel="noreferrer" target="_blank">
              Entrar com WhatsApp
            </a>
          </div>

          <p className={loginStyles.microtext}>O link é enviado imediatamente para seu e-mail. Simples e rápido.</p>

          <div className={authStyles.links}>
            <Link className={authStyles.buttonSecondary} href="/login">
              Voltar ao login
            </Link>
            <Link className={authStyles.buttonSecondary} href="/r/luxo-premiado#inicio">
              Voltar para a rifa
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}
