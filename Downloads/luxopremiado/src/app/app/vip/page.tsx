import Link from "next/link";
import { redirect } from "next/navigation";

import styles from "@/app/app/vip/vip-panel.module.css";
import { getMyVipStatus } from "@/lib/dashboard";
import { getSessionUser } from "@/lib/session";
import { getVipWalletSnapshot, listVipOperationsForUser } from "@/lib/vip-runtime";
import {
  VIP_ACCESS_RULES,
  VIP_PRESTIGE_LEVELS,
  getVipPrestigeBenefit,
  normalizeMoneyToPoints,
} from "@/lib/vip";

function tierStateLabel(currentPoints: number, levelPoints: number, nextLevelPoints: number | null) {
  if (currentPoints < levelPoints) {
    return "Próximo marco";
  }

  if (nextLevelPoints !== null && currentPoints >= nextLevelPoints) {
    return "Nível concluído";
  }

  return "Seu nível atual";
}

export default async function VipAreaPage() {
  const user = await getSessionUser();
  const [vip, wallet, operations] = await Promise.all([
    getMyVipStatus(user?.id ?? "", user?.email ?? null),
    user?.id ? getVipWalletSnapshot(user.id, 8) : Promise.resolve(null),
    user?.id ? listVipOperationsForUser(user.id) : Promise.resolve([]),
  ]);

  if (!vip.access) {
    redirect(
      `/app/perfil?error=${encodeURIComponent("Área VIP liberada apenas para afiliados com status VIP ativo.")}`,
    );
  }

  const ownPoints = vip.point_breakdown.raffle_points + vip.point_breakdown.auction_points;
  const currentXpLevel = vip.xp.current_level;
  const nextXpLevel = vip.xp.next_level;
  const currentBenefits = getVipPrestigeBenefit(currentXpLevel);
  const upcomingBenefits = nextXpLevel ? getVipPrestigeBenefit(nextXpLevel) : null;
  const pointRows = [
    {
      label: "Pontos em rifas",
      points: vip.point_breakdown.raffle_points,
      hint: "Compras confirmadas em números da plataforma.",
    },
    {
      label: "Pontos em leilões",
      points: vip.point_breakdown.auction_points,
      hint: "Arremates concluídos e validados.",
    },
    {
      label: "Pontos da rede indicada",
      points: vip.point_breakdown.network_points,
      hint: "Soma dos pontos gerados pelos afiliados indicados conectados ao seu código.",
    },
    {
      label: "Bônus manual",
      points: vip.point_breakdown.manual_bonus_points,
      hint: vip.manual_override ? "Ajuste manual aplicado pelo administrador." : "Sem bônus manual ativo.",
    },
  ];

  const maxRowPoints = Math.max(1, ...pointRows.map((row) => row.points), vip.points);
  const xpRows = [
    {
      label: "Cashback",
      value: `${currentBenefits.cashbackPercent}%`,
      hint: "Percentual devolvido nas perdas qualificadas dentro do programa.",
    },
    {
      label: "Desconto em pacotes",
      value: `${currentBenefits.purchaseDiscountPercent}%`,
      hint: "Mais números por menos nos combos e recargas elegíveis.",
    },
    {
      label: "Bônus de quantidade",
      value: `+${currentBenefits.packageBonusPercent}%`,
      hint: "Números extras nas ofertas promocionais do seu nível atual.",
    },
    {
      label: "Free spins futuros",
      value: currentBenefits.freeSpins.toLocaleString("pt-BR"),
      hint: "Reservados para os jogos que entrarão no ecossistema da plataforma.",
    },
  ];

  return (
    <section className={styles.page}>
      <article className={styles.hero}>
        <div className={styles.heroContent}>
          <div>
            <p className={styles.heroKicker}>Painel VIP</p>
            <h1 className={styles.heroTitle}>{currentXpLevel.label} ativo na sua trilha de experiência premium.</h1>
            <p className={styles.heroSubtitle}>
              A plataforma agora trabalha com duas camadas complementares: a trilha de XP, que sobe a cada R$ 1,00
              gasto e libera vantagens progressivas, e a régua de acesso VIP, que exige pontos totais mais rede
              afiliada qualificada para abrir os círculos VIP e VIP Elite.
            </p>
            <div className={styles.heroMeta}>
              <span className={styles.metaChip}>{vip.points.toLocaleString("pt-BR")} pontos totais</span>
              <span className={styles.metaChip}>{ownPoints.toLocaleString("pt-BR")} pontos próprios</span>
              <span className={styles.metaChip}>{vip.xp.total_xp.toLocaleString("pt-BR")} XP de atividade</span>
              <span className={styles.metaChip}>
                {vip.affiliate_code ? `Código ${vip.affiliate_code}` : "Afiliado ativo"}
              </span>
              <span className={styles.metaChip}>
                {vip.unlocked_at
                  ? `Liberado em ${new Date(vip.unlocked_at).toLocaleDateString("pt-BR")}`
                  : "Liberação automática"}
              </span>
            </div>
          </div>

          <aside className={styles.progressCard}>
            <p className={styles.progressLabel}>Rumo ao próximo nível de XP</p>
            <p className={styles.progressValue}>{Math.round(vip.xp.progress_percent)}%</p>
            <div className={styles.progressTrack} aria-label="Progresso VIP">
              <span className={styles.progressFill} style={{ width: `${vip.xp.progress_percent}%` }} />
            </div>
            <p className={styles.progressText}>
              {nextXpLevel
                ? `Faltam ${vip.xp.remaining_xp.toLocaleString("pt-BR")} XP para ${nextXpLevel.label}.`
                : "Você já alcançou o topo atual da trilha de experiência."}
            </p>
            <p className={styles.progressText}>
              {vip.next_tier_label
                ? `Macrostatus seguinte: ${vip.next_tier_label}. Faltam ${vip.remaining_points.toLocaleString("pt-BR")} pontos na régua oficial.`
                : "Você já liberou o macrostatus máximo configurado hoje."}
            </p>
          </aside>
        </div>
      </article>

      <section className={styles.quickStats}>
        <article className={styles.statCard}>
          <p className={styles.statLabel}>XP acumulado</p>
          <p className={styles.statValue}>{vip.xp.total_xp.toLocaleString("pt-BR")}</p>
          <p className={styles.statHint}>10 XP por R$ 1,00 gasto em rifas, leilões e jogos futuros.</p>
        </article>
        <article className={styles.statCard}>
          <p className={styles.statLabel}>Cashback atual</p>
          <p className={styles.statValue}>{currentBenefits.cashbackPercent}%</p>
          <p className={styles.statHint}>Percentual progressivo liberado pelo seu nível de experiência.</p>
        </article>
        <article className={styles.statCard}>
          <p className={styles.statLabel}>Desconto em pacotes</p>
          <p className={styles.statValue}>{currentBenefits.purchaseDiscountPercent}%</p>
          <p className={styles.statHint}>Mais números por menos nas ofertas qualificadas do seu patamar.</p>
        </article>
        <article className={styles.statCard}>
          <p className={styles.statLabel}>Bônus de nível</p>
          <p className={styles.statValue}>{currentBenefits.levelLabel}</p>
          <p className={styles.statHint}>{currentBenefits.levelUpReward}</p>
        </article>
      </section>

      {wallet ? (
        <section className={styles.quickStats}>
          <article className={styles.statCard}>
            <p className={styles.statLabel}>Carteira cashback</p>
            <p className={styles.statValue}>
              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(wallet.cashbackBalanceCents / 100)}
            </p>
            <p className={styles.statHint}>Créditos gerados automaticamente após pedidos pagos.</p>
          </article>
          <article className={styles.statCard}>
            <p className={styles.statLabel}>Carteira bônus</p>
            <p className={styles.statValue}>
              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(wallet.bonusBalanceCents / 100)}
            </p>
            <p className={styles.statHint}>Prêmios de subida de nível e campanhas promocionais.</p>
          </article>
          <article className={styles.statCard}>
            <p className={styles.statLabel}>Rakeback</p>
            <p className={styles.statValue}>
              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(wallet.rakebackBalanceCents / 100)}
            </p>
            <p className={styles.statHint}>Saldo separado para o ecossistema de jogos e promoções futuras.</p>
          </article>
          <article className={styles.statCard}>
            <p className={styles.statLabel}>Free spins</p>
            <p className={styles.statValue}>{wallet.freeSpinsBalance.toLocaleString("pt-BR")}</p>
            <p className={styles.statHint}>Créditos já acumulados para ativação quando os jogos entrarem.</p>
          </article>
        </section>
      ) : null}

      <section className={styles.contentGrid}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Trilha de níveis VIP por XP</h2>
          <div className={styles.ladder}>
            {VIP_PRESTIGE_LEVELS.map((level, index) => {
              const nextLevel = VIP_PRESTIGE_LEVELS[index + 1] ?? null;
              const isActive = currentXpLevel.id === level.id;
              const levelBenefit = getVipPrestigeBenefit(level);

              return (
                <article className={`${styles.tierRow} ${isActive ? styles.tierRowActive : ""}`} key={level.id}>
                  <span className={styles.tierBadge}>{level.tier === "none" ? "Base" : level.tier === "vip" ? "VIP" : "Elite"}</span>
                  <div>
                    <p className={styles.tierName}>
                      {level.label} · {(level.minPoints * 10).toLocaleString("pt-BR")} XP
                    </p>
                    <p className={styles.tierHint}>
                      {level.description} Cashback {levelBenefit.cashbackPercent}% · desconto{" "}
                      {levelBenefit.purchaseDiscountPercent}% · bônus de pacote +{levelBenefit.packageBonusPercent}%.
                    </p>
                  </div>
                  <p className={styles.tierState}>
                    {tierStateLabel(vip.xp.total_xp, level.minPoints * 10, nextLevel ? nextLevel.minPoints * 10 : null)}
                  </p>
                </article>
              );
            })}
          </div>
        </div>

        <aside className={styles.card}>
          <h2 className={styles.cardTitle}>Regras oficiais</h2>
          <div className={styles.actionList}>
            <article className={styles.actionCard}>
              <p className={styles.actionTitle}>Entrada VIP</p>
              <p className={styles.actionText}>
                {VIP_ACCESS_RULES.vip.totalPoints.toLocaleString("pt-BR")} pontos totais,{" "}
                {VIP_ACCESS_RULES.vip.ownMinPoints.toLocaleString("pt-BR")} pontos próprios e{" "}
                {VIP_ACCESS_RULES.vip.partnerCount} afiliados indicados com{" "}
                {VIP_ACCESS_RULES.vip.partnerMinPoints.toLocaleString("pt-BR")} pontos cada.
              </p>
            </article>
            <article className={styles.actionCard}>
              <p className={styles.actionTitle}>Entrada VIP Elite</p>
              <p className={styles.actionText}>
                {VIP_ACCESS_RULES.elite.totalPoints.toLocaleString("pt-BR")} pontos totais,{" "}
                {VIP_ACCESS_RULES.elite.ownMinPoints.toLocaleString("pt-BR")} pontos próprios e{" "}
                {VIP_ACCESS_RULES.elite.partnerCount} afiliados indicados com{" "}
                {VIP_ACCESS_RULES.elite.partnerMinPoints.toLocaleString("pt-BR")} pontos cada.
              </p>
            </article>
            <article className={styles.actionCard}>
              <p className={styles.actionTitle}>Leitura do placar</p>
              <p className={styles.actionText}>
                A área VIP usa pontos para acesso e XP para progressão. Cada ponto equivale a R$ 1 movimentado entre a
                sua conta e a rede qualificada. Cada R$ 1,00 gasto diretamente por você gera 10 XP.
              </p>
            </article>
            <article className={styles.actionCard}>
              <p className={styles.actionTitle}>Ativação de benefícios</p>
              <p className={styles.actionText}>
                Cashback, descontos, bônus de recarga, free spins futuros, rakeback e atendimento premium crescem
                conforme o seu nível de experiência atual.
              </p>
            </article>
          </div>
        </aside>
      </section>

      <section className={styles.contentGrid}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>De onde vêm seus pontos</h2>
          <div className={styles.breakdownList}>
            {pointRows.map((row) => (
              <article className={styles.breakdownItem} key={row.label}>
                <div className={styles.breakdownHeader}>
                  <span>{row.label}</span>
                  <span>{row.points.toLocaleString("pt-BR")} pts</span>
                </div>
                <div className={styles.breakdownTrack}>
                  <span className={styles.breakdownFill} style={{ width: `${(row.points / maxRowPoints) * 100}%` }} />
                </div>
                <p className={styles.breakdownHint}>{row.hint}</p>
              </article>
            ))}
          </div>
        </div>

        <aside className={styles.card}>
          <h2 className={styles.cardTitle}>Metas práticas</h2>
          <div className={styles.actionList}>
            <article className={styles.actionCard}>
              <p className={styles.actionTitle}>Fortalecer XP pessoal</p>
              <p className={styles.actionText}>
                Você já gerou {vip.xp.total_xp.toLocaleString("pt-BR")} XP. Mantenha compras recorrentes para bater o
                próximo patamar de experiência.
              </p>
            </article>
            <article className={styles.actionCard}>
              <p className={styles.actionTitle}>Qualificar sua rede</p>
              <p className={styles.actionText}>
                Hoje {vip.metrics.qualified_partners_for_vip} afiliados indicados atingiram 2.000 pontos e{" "}
                {vip.metrics.qualified_partners_for_elite} atingiram 5.000 pontos.
              </p>
            </article>
            <article className={styles.actionCard}>
              <p className={styles.actionTitle}>Escalar a régua oficial</p>
              <p className={styles.actionText}>
                Sua rede já movimentou {normalizeMoneyToPoints(vip.metrics.network_investment_cents).toLocaleString("pt-BR")} pontos
                válidos. Isso acelera a liberação dos macrostatus VIP e VIP Elite.
              </p>
            </article>
          </div>
          <div className={styles.actionLinks}>
            <Link className={styles.buttonPrimary} href="/app/comprar">
              Comprar mais números
            </Link>
            <Link className={styles.buttonSecondary} href="/app/perfil">
              Ver meu código de afiliado
            </Link>
          </div>
        </aside>
      </section>

      <section className={styles.contentGrid}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Benefícios já liberados no seu nível</h2>
          <div className={styles.benefitGrid}>
            <article className={styles.benefitCard}>
              <p className={styles.benefitTier}>{currentXpLevel.label} · pacote ativo de experiência</p>
              <div className={styles.benefitHighlights}>
                {xpRows.map((item) => (
                  <article className={styles.benefitHighlight} key={item.label}>
                    <span className={styles.benefitHighlightLabel}>{item.label}</span>
                    <strong className={styles.benefitHighlightValue}>{item.value}</strong>
                    <p className={styles.benefitHighlightHint}>{item.hint}</p>
                  </article>
                ))}
              </div>
              <ul className={styles.benefitList}>
                {currentBenefits.benefits.map((benefit) => (
                  <li className={styles.benefitItem} key={benefit}>
                    {benefit}
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </div>

        <aside className={styles.card}>
          <h2 className={styles.cardTitle}>Próximo pacote de desbloqueios</h2>
          <div className={styles.benefitGrid}>
            <article className={styles.benefitCard}>
              <p className={styles.benefitTier}>{nextXpLevel ? nextXpLevel.label : "Topo do programa"}</p>
              {upcomingBenefits ? (
                <ul className={styles.benefitList}>
                  {upcomingBenefits.benefits.map((benefit) => (
                    <li className={styles.benefitItem} key={benefit}>
                      {benefit}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.actionText}>Você já liberou o pacote máximo configurado hoje.</p>
              )}
            </article>
          </div>
        </aside>
      </section>

      {wallet ? (
        <section className={styles.contentGrid}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Histórico da carteira VIP</h2>
            <div className={styles.actionList}>
              {wallet.recentEntries.length ? (
                wallet.recentEntries.map((entry) => (
                  <article className={styles.actionCard} key={entry.id}>
                    <p className={styles.actionTitle}>{entry.eventType}</p>
                    <p className={styles.actionText}>
                      {entry.amountCents
                        ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(entry.amountCents / 100)
                        : "Sem valor em dinheiro"}{" "}
                      · {entry.xpDelta ? `${entry.xpDelta.toLocaleString("pt-BR")} XP` : "0 XP"} ·{" "}
                      {entry.freeSpinsDelta ? `${entry.freeSpinsDelta} free spins` : "0 free spins"}
                    </p>
                    <p className={styles.actionText}>
                      {new Date(entry.createdAt).toLocaleString("pt-BR")} · origem {entry.sourceKey}
                    </p>
                  </article>
                ))
              ) : (
                <p className={styles.actionText}>Ainda não houve créditos lançados na sua carteira VIP.</p>
              )}
            </div>
          </div>

          <aside className={styles.card}>
            <h2 className={styles.cardTitle}>Resumo operacional</h2>
            <div className={styles.actionList}>
              <article className={styles.actionCard}>
                <p className={styles.actionTitle}>Total já ganho</p>
                <p className={styles.actionText}>
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(wallet.totalEarnedCents / 100)}
                </p>
              </article>
              <article className={styles.actionCard}>
                <p className={styles.actionTitle}>XP vindo de pedidos</p>
                <p className={styles.actionText}>{wallet.totalXpFromOrders.toLocaleString("pt-BR")} XP lançados no ledger.</p>
              </article>
              <article className={styles.actionCard}>
                <p className={styles.actionTitle}>Último nível gravado</p>
                <p className={styles.actionText}>{wallet.lastLevelId ?? "Ainda sem desbloqueio persistido."}</p>
              </article>
            </div>
          </aside>
        </section>
      ) : null}

      {operations.length ? (
        <section className={styles.contentGrid}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Operações VIP ativas</h2>
            <div className={styles.actionList}>
              {operations.map((item) => (
                <article className={styles.actionCard} key={item.id}>
                  <p className={styles.actionTitle}>
                    {item.category.toUpperCase()} · {item.title}
                  </p>
                  <p className={styles.actionText}>{item.description ?? "Sem descrição complementar."}</p>
                  <p className={styles.actionText}>
                    Status {item.status}
                    {item.hostContact ? ` · contato ${item.hostContact}` : ""}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <aside className={styles.card}>
            <h2 className={styles.cardTitle}>Execução premium</h2>
            <div className={styles.actionList}>
              <article className={styles.actionCard}>
                <p className={styles.actionTitle}>VIP Host</p>
                <p className={styles.actionText}>
                  Quando houver host dedicado ativo para você, ele aparece neste painel com contato e status.
                </p>
              </article>
              <article className={styles.actionCard}>
                <p className={styles.actionTitle}>Eventos e torneios</p>
                <p className={styles.actionText}>
                  Convites ativos, torneios fechados e odds personalizadas agora entram por operações programadas.
                </p>
              </article>
            </div>
          </aside>
        </section>
      ) : null}

      <section className={styles.contentGrid}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Pacotes premium do seu nível atual</h2>
          <div className={styles.actionList}>
            <article className={styles.actionCard}>
              <p className={styles.actionTitle}>Cashback e rakeback</p>
              <p className={styles.actionText}>
                Cashback atual de {currentBenefits.cashbackPercent}% e rakeback de {currentBenefits.rakebackPercent}%
                para os jogos futuros do ecossistema.
              </p>
            </article>
            <article className={styles.actionCard}>
              <p className={styles.actionTitle}>Recarga e retenção</p>
              <p className={styles.actionText}>
                Reload bonus de {currentBenefits.reloadBonusPercent}% com {currentBenefits.freeSpins} free spins
                elegíveis por ciclo.
              </p>
            </article>
            <article className={styles.actionCard}>
              <p className={styles.actionTitle}>Atendimento e saque</p>
              <p className={styles.actionText}>
                {currentBenefits.hostSupportLabel ?? "Atendimento em fila padrão com prioridade progressiva."}{" "}
                {currentBenefits.withdrawalLabel}.
              </p>
            </article>
          </div>
        </div>

        <aside className={styles.card}>
          <h2 className={styles.cardTitle}>Experiências e privilégios</h2>
          <div className={styles.actionList}>
            <article className={styles.actionCard}>
              <p className={styles.actionTitle}>Eventos exclusivos</p>
              <p className={styles.actionText}>
                {currentBenefits.hasEventInvites
                  ? "Seu nível atual já habilita convites para eventos exclusivos e experiências privadas."
                  : "Convites para eventos entram nas faixas mais altas de prestígio."}
              </p>
            </article>
            <article className={styles.actionCard}>
              <p className={styles.actionTitle}>Torneios fechados</p>
              <p className={styles.actionText}>
                {currentBenefits.hasExclusiveTournaments
                  ? "Seu perfil já pode receber acesso a torneios fechados com prêmios maiores."
                  : "Torneios exclusivos liberam quando você cruza a faixa alta da trilha."}
              </p>
            </article>
            <article className={styles.actionCard}>
              <p className={styles.actionTitle}>Experiências de luxo</p>
              <p className={styles.actionText}>
                {currentBenefits.hasLuxuryExperiences
                  ? "Seu nível já comporta experiências de luxo, viagens, jantares e ações premium sob curadoria."
                  : "As experiências de luxo ficam reservadas para os níveis mais raros da hierarquia."}
              </p>
            </article>
          </div>
        </aside>
      </section>
    </section>
  );
}
