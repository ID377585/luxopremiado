import Link from "next/link";

import { LiveActivityPopup } from "@/components/common/LiveActivityPopup";
import styles from "@/app/area-do-usuario/user-area.module.css";
import { buildLandingPathForSlug } from "@/lib/raffle-slug";
import { resolveAvailableRaffleSlug } from "@/lib/raffle-slug.server";
import { getRaffleLandingData } from "@/lib/raffles";
import { getSessionUser } from "@/lib/session";

export default async function UserAreaPage() {
  const user = await getSessionUser();
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
  const landingHref = buildLandingPathForSlug(raffle?.slug ?? preferredSlug, "inicio");
  const topBuyer = raffle?.buyerRanking[0];
  const isLoggedIn = Boolean(user?.id);
  const nextPath = "/app/comprar";

  return (
    <main className={styles.page}>
      <LiveActivityPopup scope="login" />

      <section className={styles.layout}>
        <aside className={styles.showcase}>
          <p className={styles.kicker}>Área VIP do Participante</p>
          <h1 className={styles.title}>
            {isLoggedIn
              ? `Olá, ${user?.name ?? user?.email}. Sua área está pronta para compra rápida.`
              : "Entre agora e garanta seus números antes de todo mundo."}
          </h1>
          <p className={styles.subtitle}>
            Fluxo direto para escolher números, pagar no PIX e acompanhar confirmação com transparência.
          </p>

          <div className={styles.statGrid}>
            <article className={styles.statCard}>
              <p className={styles.statLabel}>Vendidos</p>
              <p className={styles.statValue}>{raffle ? `${soldPercent.toFixed(1)}%` : "Indisponível"}</p>
            </article>
            <article className={styles.statCard}>
              <p className={styles.statLabel}>Restantes</p>
              <p className={styles.statValue}>
                {raffle ? raffle.stats.availableNumbers.toLocaleString("pt-BR") : "Indisponível"}
              </p>
            </article>
            <article className={styles.statCard}>
              <p className={styles.statLabel}>Top Ranking</p>
              <p className={styles.statValue}>
                {topBuyer ? `${topBuyer.participant} · ${topBuyer.totalNumbers}` : "Atualizando..."}
              </p>
            </article>
          </div>

          <div className={styles.progressWrap} aria-label="Progresso de números vendidos">
            <div className={styles.progressTrack}>
              <span className={styles.progressFill} style={{ width: `${soldPercent}%` }} />
            </div>
            <p className={styles.progressText}>
              {raffle
                ? `${soldPercent.toFixed(1)}% vendidos. Você pode entrar no Top 10 ainda hoje.`
                : "Dados da campanha indisponíveis no momento."}
            </p>
          </div>
        </aside>

        <section className={styles.panel}>
          <p className={styles.panelTag}>Acesso rápido</p>
          <h2 className={styles.panelTitle}>
            {isLoggedIn ? "Continue sua compra agora" : "Faça login e libere seus benefícios agora"}
          </h2>
          <p className={styles.panelText}>
            {isLoggedIn
              ? "Entre no checkout para escolher números, pagar e acompanhar status do pedido em tempo real."
              : "Sem login os números não ficam garantidos. Entre em menos de 1 minuto e finalize no PIX."}
          </p>

          <ul className={styles.benefits}>
            <li>Garantir números antes de esgotar</li>
            <li>Acompanhar posição no ranking</li>
            <li>Receber atualização automática por etapa</li>
            <li>Confirmar participação oficial no sorteio</li>
          </ul>

          <div className={styles.actionGrid}>
            {isLoggedIn ? (
              <>
                <Link className={styles.primaryAction} href="/app/comprar">
                  IR PARA COMPRA RÁPIDA
                </Link>
                <Link className={styles.secondaryAction} href="/app/minhas-rifas">
                  VER MINHAS RIFAS
                </Link>
                <Link className={styles.secondaryAction} href="/app/pagamentos">
                  VER PAGAMENTOS
                </Link>
                <Link className={styles.secondaryAction} href={landingHref}>
                  VOLTAR PARA CAMPANHA
                </Link>
              </>
            ) : (
              <>
                <Link
                  className={styles.primaryAction}
                  href={`/login?error=${encodeURIComponent("Faça login para continuar")}&next=${encodeURIComponent(nextPath)}`}
                >
                  ENTRAR E GARANTIR MEUS NÚMEROS
                </Link>
                <Link className={styles.secondaryAction} href="/cadastro">
                  CRIAR CONTA AGORA
                </Link>
              </>
            )}
          </div>

          <p className={styles.micro}>Leva menos de 1 minuto. Simples, rápido e sem burocracia.</p>
        </section>
      </section>
    </main>
  );
}
