import Link from "next/link";

import { LiveActivityPopup } from "@/components/common/LiveActivityPopup";
import { AuthMessage } from "@/components/auth/AuthMessage";
import authStyles from "@/components/auth/auth.module.css";
import loginStyles from "@/app/login/login.module.css";
import { signInAction, signInWithGoogleAction } from "@/lib/actions/auth";
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

  return error;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  let raffle: Awaited<ReturnType<typeof getRaffleLandingData>> | null = null;

  try {
    raffle = await getRaffleLandingData("luxo-premiado");
  } catch {
    raffle = null;
  }

  const soldPercent = raffle
    ? Math.min(100, Math.max(0, (raffle.stats.soldNumbers / Math.max(raffle.totalNumbers, 1)) * 100))
    : 0;
  const topBuyer = raffle?.buyerRanking[0];
  const friendlyError = mapFriendlyError(params.error);
  const nextPath = normalizeNextPath(params.next);
  const whatsAppLoginUrl = `https://wa.me/?text=${encodeURIComponent(
    "Quero acesso rapido para finalizar minha compra na Luxo Premiado.",
  )}`;

  return (
    <main className={loginStyles.page}>
      <LiveActivityPopup scope="login" />

      <section className={loginStyles.layout}>
        <aside className={loginStyles.showcase}>
          <p className={loginStyles.showcaseKicker}>Área VIP do Participante</p>
          <h2 className={loginStyles.showcaseTitle}>Jeep Compass 0km pode ser seu. Não deixe seus números escaparem.</h2>
          <p className={loginStyles.showcaseSubtitle}>
            Quem entra primeiro escolhe melhor. Seu acesso libera checkout rápido e confirmação automática no PIX.
          </p>

          <div className={loginStyles.metricGrid}>
            <article className={loginStyles.metricCard}>
              <p className={loginStyles.metricLabel}>Vendidos</p>
              <p className={loginStyles.metricValue}>{raffle ? `${soldPercent.toFixed(1)}%` : "Indisponível"}</p>
            </article>
            <article className={loginStyles.metricCard}>
              <p className={loginStyles.metricLabel}>Disponíveis</p>
              <p className={loginStyles.metricValue}>
                {raffle ? raffle.stats.availableNumbers.toLocaleString("pt-BR") : "Indisponível"}
              </p>
            </article>
            <article className={loginStyles.metricCard}>
              <p className={loginStyles.metricLabel}>Top Ranking</p>
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
              {raffle
                ? `${soldPercent.toFixed(1)}% já vendidos. Ainda dá tempo de entrar no Top 10 hoje.`
                : "Dados da campanha indisponíveis no momento."}
            </p>
          </div>
        </aside>

        <section className={loginStyles.loginCard}>
          <p className={loginStyles.vipTag}>Acesso exclusivo</p>
          <h1 className={loginStyles.title}>Você está a um passo de garantir seus números!</h1>
          <p className={loginStyles.subtitle}>
            Seus números só ficam garantidos após o login. Faça agora e finalize em menos de 1 minuto.
          </p>
          <p className={loginStyles.urgencyLine}>
            Seus números podem ser escolhidos por outra pessoa a qualquer momento.
          </p>

          <AuthMessage error={friendlyError} success={params.success} />

          <ul className={loginStyles.benefitList}>
            <li>Garantir seus números antes que acabem</li>
            <li>Acompanhar sua posição no ranking</li>
            <li>Receber confirmação automática no PIX</li>
            <li>Participar oficialmente do sorteio</li>
          </ul>

          <div className={loginStyles.bonusBox}>
            <p className={loginStyles.bonusTitle}>Bônus de boas-vindas</p>
            <p className={loginStyles.bonusText}>Entre agora e desbloqueie compra rápida com priorização no checkout.</p>
          </div>

          <form action={signInAction} className={authStyles.form}>
            <input name="next" type="hidden" value={nextPath} />
            <input className={authStyles.input} name="email" placeholder="Seu e-mail" required type="email" />
            <input className={authStyles.input} name="password" placeholder="Sua senha" required type="password" />
            <button className={`${authStyles.button} ${loginStyles.mainButton}`} type="submit">
              ENTRAR E GARANTIR MEUS NÚMEROS
            </button>
          </form>

          <div className={loginStyles.socialGrid}>
            <form action={signInWithGoogleAction}>
              <input name="next" type="hidden" value={nextPath} />
              <button className={loginStyles.socialButton} type="submit">
                Continuar com Google
              </button>
            </form>
            <a className={loginStyles.socialButton} href={whatsAppLoginUrl} rel="noreferrer" target="_blank">
              Continuar com WhatsApp
            </a>
          </div>

          <p className={loginStyles.microtext}>Leva menos de 1 minuto. Simples e rápido.</p>

          <div className={authStyles.links}>
            <Link className={authStyles.buttonSecondary} href="/cadastro">
              Criar conta
            </Link>
            <Link className={authStyles.buttonSecondary} href="/recuperar-senha">
              Recuperar senha
            </Link>
            <Link className={authStyles.buttonSecondary} href="/r/luxo-premiado#inicio">
              Voltar para a campanha
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}
