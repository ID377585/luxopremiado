"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { formatBrlFromCents } from "@/lib/format";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  AuctionBidEntry,
  AuctionLeaderboardEntry,
  AuctionPublicResponse,
} from "@/types/auction";

import styles from "./auction.module.css";

interface Props {
  raffleSlug: string;
  auctionSlug?: string;
}

type PressureCardProps = {
  isLeading?: boolean;
  gap?: string | null;
  rival?: string | null;
};

function PressureCard({ isLeading, gap, rival }: PressureCardProps) {
  const tone = isLeading
    ? {
        background: "rgba(62, 194, 107, 0.12)",
        border: "1px solid rgba(62, 194, 107, 0.35)",
        title: "Você está na frente",
        description:
          "Mantenha a liderança. Nos minutos finais, um único lance pode mudar tudo.",
      }
    : {
        background: "rgba(255, 80, 80, 0.12)",
        border: "1px solid rgba(255, 80, 80, 0.35)",
        title: "Você pode perder esse lote",
        description: gap
          ? `Faltam apenas ${gap} para você assumir a liderança.`
          : "Outro participante já está liderando neste momento.",
      };

  return (
    <div
      style={{
        background: tone.background,
        border: tone.border,
        borderRadius: 20,
        padding: 18,
        marginBottom: 14,
      }}
    >
      <strong style={{ display: "block", marginBottom: 8 }}>{tone.title}</strong>
      <p
        style={{
          margin: 0,
          color: "rgba(255,255,255,0.88)",
          lineHeight: 1.6,
        }}
      >
        {tone.description}
      </p>
      {rival ? (
        <span
          style={{
            display: "block",
            marginTop: 8,
            fontSize: 13,
            color: "rgba(255,255,255,0.7)",
          }}
        >
          Disputando com: {rival}
        </span>
      ) : null}
    </div>
  );
}

function formatCountdown(targetIso: string): string {
  const diff = Date.parse(targetIso) - Date.now();
  if (Number.isNaN(diff) || diff <= 0) return "Encerrado";

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }

  return `${hours}h ${minutes}m ${seconds}s`;
}

function formatRelativeTime(value: string | null | undefined): string {
  if (!value) return "ainda sem lances";

  const diffMs = Date.now() - Date.parse(value);
  if (!Number.isFinite(diffMs)) return "agora há pouco";

  const seconds = Math.max(0, Math.floor(diffMs / 1000));
  if (seconds < 10) return "agora mesmo";
  if (seconds < 60) return `há ${seconds}s`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `há ${minutes}min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours}h`;

  const days = Math.floor(hours / 24);
  return `${days}d atrás`;
}

function formatBidderName(
  bid: Pick<AuctionBidEntry | AuctionLeaderboardEntry, "bidder_name" | "bidder_contact">,
  fallback: string,
) {
  const name = bid.bidder_name?.trim();
  if (name) return name;

  const email = bid.bidder_contact?.trim();
  if (email) {
    const [user, domain] = email.split("@");
    if (user && domain) {
      const masked =
        user.length > 2 ? `${user.slice(0, 2)}***` : `${user[0] ?? "*"}***`;
      return `${masked}@${domain}`;
    }
  }

  return fallback;
}

function formatSeconds(value: number | null): string {
  if (value == null) return "--";
  if (value < 60) return `${value}s`;
  const minutes = Math.floor(value / 60);
  const seconds = value % 60;
  return `${minutes}min ${seconds}s`;
}

export function Auction({ raffleSlug, auctionSlug }: Props) {
  const [data, setData] = useState<AuctionPublicResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<"default" | "success" | "error">(
    "default",
  );
  const [amount, setAmount] = useState<string>("");
  const [proxyMaxAmount, setProxyMaxAmount] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState(0);
  const previousViewerStateRef = useRef<{
    isLeading: boolean;
    hasBid: boolean;
  } | null>(null);

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const fetchAuction = useCallback(
    async (silent = false) => {
      try {
        if (!silent) {
          setLoading(true);
        }

        const query = new URLSearchParams({ raffleSlug });
        if (auctionSlug?.trim()) {
          query.set("slug", auctionSlug.trim());
        }

        const res = await fetch(`/api/auction?${query.toString()}`, {
          cache: "no-store",
        });
        const json = (await res.json()) as
          | AuctionPublicResponse
          | { error?: string };

        if (!res.ok || !("auction" in json)) {
          throw new Error(
            ("error" in json && json.error) || "Falha ao carregar leilão.",
          );
        }

        const nextViewerState = {
          isLeading: json.viewer.is_leading,
          hasBid: json.viewer.has_bid,
        };

        const previousViewerState = previousViewerStateRef.current;
        if (silent && previousViewerState && json.viewer.authenticated && !submitting) {
          if (
            previousViewerState.isLeading &&
            !nextViewerState.isLeading &&
            nextViewerState.hasBid
          ) {
            setStatusMessage(
              "Seu lance foi ultrapassado. O lote segue em disputa ao vivo.",
            );
            setStatusTone("error");
          } else if (!previousViewerState.isLeading && nextViewerState.isLeading) {
            setStatusMessage("Você assumiu a liderança do leilão.");
            setStatusTone("success");
          }
        }

        previousViewerStateRef.current = nextViewerState;
        setData(json);

        if (!silent) {
          setStatusMessage(null);
          setStatusTone("default");
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Falha ao carregar leilão.";
        setStatusMessage(message);
        setStatusTone("error");
      } finally {
        setLoading(false);
      }
    },
    [auctionSlug, raffleSlug, submitting],
  );

  useEffect(() => {
    void fetchAuction(false);
    const id = window.setInterval(() => {
      void fetchAuction(true);
    }, 15_000);

    return () => window.clearInterval(id);
  }, [fetchAuction]);

  useEffect(() => {
    if (!supabase || !data?.auction.id) {
      return;
    }

    const channel = supabase
      .channel(`auction-live-${data.auction.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "auction_bids",
          filter: `auction_id=eq.${data.auction.id}`,
        },
        () => {
          void fetchAuction(true);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "auctions",
          filter: `id=eq.${data.auction.id}`,
        },
        () => {
          void fetchAuction(true);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "auction_timeline_events",
          filter: `auction_id=eq.${data.auction.id}`,
        },
        () => {
          void fetchAuction(true);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [data?.auction.id, fetchAuction, supabase]);

  const gallery = useMemo(() => {
    const items = [data?.auction.image_url, ...(data?.auction.gallery_urls ?? [])]
      .filter((item): item is string => Boolean(item?.trim()));

    return [...new Set(items)];
  }, [data]);

  useEffect(() => {
    setSelectedImage(0);
  }, [data?.auction.id]);

  const auction = data?.auction ?? null;
  const viewer = data?.viewer ?? null;
  const stats = data?.stats ?? null;
  const trust = data?.trust ?? null;
  const performance = data?.performance ?? null;
  const recentBids = data?.recentBids ?? [];
  const leaderboard = data?.leaderboard ?? [];
  const timeline = data?.timeline ?? [];
  const nextMinBidCents = stats?.next_min_bid_cents ?? null;
  const countdown = auction ? formatCountdown(auction.ends_at) : "--";
  const auctionAcceptingBids =
    auction
      ? auction.status === "open" &&
        !auction.paused_at &&
        Date.parse(auction.ends_at) > Date.now()
      : false;
  const auctionEnded = !auctionAcceptingBids;
  const endsSoon = auction
    ? Date.parse(auction.ends_at) - Date.now() <= 5 * 60 * 1000
    : false;

  const quickBidOptions = useMemo(() => {
    if (!auction || nextMinBidCents == null) return [];
    const increment = Math.max(auction.min_increment_cents, 1);
    return [
      ...new Set([
        nextMinBidCents,
        nextMinBidCents + increment,
        nextMinBidCents + increment * 3,
      ]),
    ];
  }, [auction, nextMinBidCents]);

  const winnerLabel = useMemo(() => {
    if (!auction || auction.status !== "settled") return null;
    return formatBidderName(
      {
        bidder_name: auction.winner_name,
        bidder_contact: auction.winner_contact,
      },
      "Arrematante confirmado",
    );
  }, [auction]);

  const rivalLabel = useMemo(() => {
    if (!viewer?.rival_bidder_name) return null;
    return formatBidderName(
      {
        bidder_name: viewer.rival_bidder_name,
        bidder_contact: null,
      },
      "Participante",
    );
  }, [viewer?.rival_bidder_name]);

  const submitBid = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();

      if (!auction || !viewer?.authenticated) {
        setStatusMessage("Faça login para participar do leilão.");
        setStatusTone("error");
        return;
      }

      const numericAmount =
        amount.trim() === "" ? null : Number(amount.trim().replace(",", "."));
      const numericProxy =
        proxyMaxAmount.trim() === ""
          ? null
          : Number(proxyMaxAmount.trim().replace(",", "."));

      if (
        (numericAmount == null ||
          !Number.isFinite(numericAmount) ||
          numericAmount <= 0) &&
        (numericProxy == null ||
          !Number.isFinite(numericProxy) ||
          numericProxy <= 0)
      ) {
        setStatusMessage("Informe um lance manual ou um teto de auto-bid válido.");
        setStatusTone("error");
        return;
      }

      setSubmitting(true);
      setStatusMessage(null);
      setStatusTone("default");

      try {
        const res = await fetch("/api/auction", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            raffleSlug,
            slug: auctionSlug,
            amount: numericAmount,
            proxyMaxAmount: numericProxy,
          }),
        });

        const json = (await res.json()) as {
          ok?: boolean;
          error?: string;
          nextMinBidCents?: number | null;
          extended?: boolean;
          autoBidEnabled?: boolean;
          autoBidMaxCents?: number | null;
        };

        if (!res.ok || !json.ok) {
          throw new Error(json.error || "Não foi possível registrar o lance.");
        }

        setAmount("");
        setProxyMaxAmount("");
        setStatusMessage(
          json.autoBidEnabled
            ? `Lance confirmado e auto-bid armado até ${
                json.autoBidMaxCents
                  ? formatBrlFromCents(json.autoBidMaxCents)
                  : "--"
              }.`
            : json.extended
              ? "Lance confirmado. O relógio foi estendido porque a disputa entrou nos minutos finais."
              : "Lance confirmado. Você já aparece na atualização ao vivo do leilão.",
        );
        setStatusTone("success");
        await fetchAuction(true);
      } catch (error) {
        setStatusMessage(
          error instanceof Error ? error.message : "Falha ao registrar lance.",
        );
        setStatusTone("error");
      } finally {
        setSubmitting(false);
      }
    },
    [amount, auction, auctionSlug, fetchAuction, proxyMaxAmount, raffleSlug, viewer?.authenticated],
  );

  if (loading && !data) {
    return (
      <section className={styles.section} id="leilao">
        <div className={styles.container}>
          <div className={styles.skeleton} />
        </div>
      </section>
    );
  }

  if (!auction) {
    return null;
  }

  const statusClassName =
    auction.status === "closed"
      ? `${styles.statusBadge} ${styles.statusClosed}`
      : auction.status === "settled"
        ? `${styles.statusBadge} ${styles.statusSettled}`
        : auction.paused_at
          ? `${styles.statusBadge} ${styles.statusPaused}`
          : styles.statusBadge;

  const viewerBadgeClass =
    viewer?.is_leading
      ? styles.viewerBadge
      : viewer?.has_bid
        ? `${styles.viewerBadge} ${styles.viewerBadgeWarn}`
        : styles.viewerBadge;

  return (
    <section className={styles.section} id="leilao">
      <div className={styles.container}>
        <div className={styles.shell}>
          <div className={styles.header}>
            <div className={styles.eyebrow}>
              <span className={styles.eyebrowDot} aria-hidden="true" />
              Leilão premium ao vivo
            </div>
            <div className={statusClassName}>
              {auction.paused_at
                ? "Pausado"
                : auction.status === "settled"
                  ? "Arrematado"
                  : auction.status === "closed"
                    ? "Encerrado"
                    : auction.status === "scheduled"
                      ? "Agendado"
                      : "Recebendo lances"}
            </div>
          </div>

          <div className={styles.heroGrid}>
            <div className={styles.heroPanel}>
              <div className={styles.titleWrap}>
                <div className={styles.kickerRow}>
                  {auction.lot_label ? (
                    <span className={styles.lotLabel}>{auction.lot_label}</span>
                  ) : null}
                  {auction.highlight_badge ? (
                    <span className={styles.highlightBadge}>
                      {auction.highlight_badge}
                    </span>
                  ) : null}
                  <span className={statusClassName}>{countdown}</span>
                </div>

                <h2 className={styles.title}>{auction.title}</h2>

                {auction.subtitle ? (
                  <p className={styles.subtitle}>{auction.subtitle}</p>
                ) : null}

                {auction.description ? (
                  <p className={styles.description}>{auction.description}</p>
                ) : null}
              </div>

              <div className={styles.metricGrid}>
                <div className={styles.metricCard}>
                  <p className={styles.metricLabel}>Lance atual</p>
                  <p className={styles.metricValue}>
                    {formatBrlFromCents(auction.current_bid_cents)}
                  </p>
                  <span className={styles.metricSoft}>
                    {auction.current_bid_cents > 0
                      ? `liderando ${formatBidderName(
                          {
                            bidder_name: auction.leading_bidder_name,
                            bidder_contact: auction.leading_bidder_contact,
                          },
                          "participante",
                        )}`
                      : "sem lance líder ainda"}
                  </span>
                </div>

                <div className={styles.metricCard}>
                  <p className={styles.metricLabel}>Próximo mínimo</p>
                  <p className={`${styles.metricValue} ${styles.metricAccent}`}>
                    {nextMinBidCents != null
                      ? formatBrlFromCents(nextMinBidCents)
                      : "--"}
                  </p>
                  <span className={styles.metricSoft}>
                    incremento de {formatBrlFromCents(auction.min_increment_cents)}
                  </span>
                </div>

                <div className={styles.metricCard}>
                  <p className={styles.metricLabel}>Mercado / reserva</p>
                  <p
                    className={`${styles.metricValue} ${
                      trust?.reserve_met ? styles.metricAccent : styles.metricWarn
                    }`}
                  >
                    {auction.market_value_cents != null
                      ? formatBrlFromCents(auction.market_value_cents)
                      : "sem referência"}
                  </p>
                  <span className={styles.metricSoft}>
                    {auction.reserve_price_cents != null
                      ? trust?.reserve_met
                        ? `reserva atingida em ${formatBrlFromCents(
                            auction.reserve_price_cents,
                          )}`
                        : `reserva em ${formatBrlFromCents(
                            auction.reserve_price_cents,
                          )}`
                      : "sem preço de reserva configurado"}
                  </span>
                </div>

                <div className={styles.metricCard}>
                  <p className={styles.metricLabel}>Pulso da disputa</p>
                  <p
                    className={`${styles.metricValue} ${
                      endsSoon ? styles.metricWarn : ""
                    }`}
                  >
                    {countdown}
                  </p>
                  <span className={styles.metricSoft}>
                    último lance {formatRelativeTime(stats?.last_bid_at)}
                  </span>
                </div>
              </div>

              <div className={styles.signalGrid}>
                <div className={styles.signalCard}>
                  <span className={styles.signalLabel}>Maior rival</span>
                  <strong className={styles.signalValue}>
                    {viewer?.rival_bidder_name
                      ? formatBidderName(
                          {
                            bidder_name: viewer.rival_bidder_name,
                            bidder_contact: null,
                          },
                          "Participante",
                        )
                      : "Sem rival direto"}
                  </strong>
                  <span className={styles.signalMeta}>
                    {viewer?.rival_amount_cents != null
                      ? formatBrlFromCents(viewer.rival_amount_cents)
                      : "sem valor comparativo"}
                  </span>
                </div>

                <div className={styles.signalCard}>
                  <span className={styles.signalLabel}>Gap para retomar</span>
                  <strong className={styles.signalValue}>
                    {viewer?.gap_to_lead_cents != null
                      ? formatBrlFromCents(viewer.gap_to_lead_cents)
                      : "--"}
                  </strong>
                  <span className={styles.signalMeta}>
                    {viewer?.rank
                      ? `seu rank atual: #${viewer.rank}`
                      : "entre para aparecer no ranking"}
                  </span>
                </div>

                <div className={styles.signalCard}>
                  <span className={styles.signalLabel}>Streak da liderança</span>
                  <strong className={styles.signalValue}>
                    {stats?.leader_streak_count ?? 0}x
                  </strong>
                  <span className={styles.signalMeta}>
                    sequência do líder atual
                  </span>
                </div>

                <div className={styles.signalCard}>
                  <span className={styles.signalLabel}>Ritmo médio</span>
                  <strong className={styles.signalValue}>
                    {formatSeconds(
                      performance?.average_bid_interval_seconds ?? null,
                    )}
                  </strong>
                  <span className={styles.signalMeta}>entre lances válidos</span>
                </div>
              </div>
            </div>

            <div className={styles.visualPanel}>
              <div className={styles.mediaStage}>
                {gallery[selectedImage] ? (
                  <Image
                    alt={auction.title}
                    className={styles.mediaImage}
                    fill
                    priority
                    sizes="(max-width: 1080px) 100vw, 36vw"
                    src={gallery[selectedImage]}
                  />
                ) : null}

                <div className={styles.mediaOverlay}>
                  <div className={styles.trustRow}>
                    <span className={styles.trustPill}>
                      {stats?.total_bids ?? 0} lances
                    </span>
                    <span className={styles.trustPill}>
                      {stats?.unique_bidders ?? 0} participantes
                    </span>
                    <span className={styles.trustPill}>
                      {performance?.visitors ?? 0} visitantes
                    </span>
                    <span className={styles.trustPill}>
                      {performance?.auto_bid_count ?? 0} auto-bids ativos
                    </span>
                  </div>

                  {auction.video_url ? (
                    <Link
                      className={styles.mediaLink}
                      href={auction.video_url}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Ver vídeo principal do lote
                    </Link>
                  ) : null}
                </div>
              </div>

              {gallery.length > 1 ? (
                <div className={styles.thumbRow}>
                  {gallery.map((image, index) => (
                    <button
                      className={
                        index === selectedImage
                          ? `${styles.thumbButton} ${styles.thumbButtonActive}`
                          : styles.thumbButton
                      }
                      key={`${image}-${index}`}
                      onClick={() => setSelectedImage(index)}
                      type="button"
                    >
                      <span className={styles.hiddenText}>
                        Selecionar imagem {index + 1}
                      </span>
                      <Image
                        alt=""
                        className={styles.thumbImage}
                        fill
                        sizes="84px"
                        src={image}
                      />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div className={styles.contentGrid}>
            <div className={styles.contentColumn}>
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>Por que esse lote prende atenção</h3>

                <div className={styles.statsStrip}>
                  <div className={styles.statBox}>
                    <strong>{stats?.total_bids ?? 0}</strong>
                    <span>lances registrados</span>
                  </div>
                  <div className={styles.statBox}>
                    <strong>{stats?.unique_bidders ?? 0}</strong>
                    <span>participantes ativos</span>
                  </div>
                  <div className={styles.statBox}>
                    <strong>{formatRelativeTime(stats?.last_bid_at)}</strong>
                    <span>tempo desde o último lance</span>
                  </div>
                </div>

                {auction.lot_story ? (
                  <p className={styles.storyCopy}>{auction.lot_story}</p>
                ) : null}

                {auction.feature_bullets.length > 0 ? (
                  <ul className={styles.featureList}>
                    {auction.feature_bullets.map((item) => (
                      <li className={styles.featureItem} key={item}>
                        <span className={styles.featureBullet} aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles.emptyState}>
                    Adicione ficha técnica e argumentos de valor para este lote no
                    painel administrativo.
                  </p>
                )}

                {auction.appraisal_notes ? (
                  <div className={styles.noteCard}>{auction.appraisal_notes}</div>
                ) : null}
              </div>

              <div className={styles.twoColumnGrid}>
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>Condição, laudo e autenticidade</h3>

                  <div className={styles.detailGrid}>
                    <div className={styles.detailCard}>
                      <span className={styles.detailLabel}>Condição</span>
                      <span className={styles.detailValue}>
                        {auction.condition_summary || "Não informado."}
                      </span>
                    </div>
                    <div className={styles.detailCard}>
                      <span className={styles.detailLabel}>Laudo / estado</span>
                      <span className={styles.detailValue}>
                        {auction.condition_report || "Sem laudo detalhado."}
                      </span>
                    </div>
                    <div className={styles.detailCard}>
                      <span className={styles.detailLabel}>Envio</span>
                      <span className={styles.detailValue}>
                        {auction.shipping_info || "Não informado."}
                      </span>
                    </div>
                    <div className={styles.detailCard}>
                      <span className={styles.detailLabel}>Retirada</span>
                      <span className={styles.detailValue}>
                        {auction.pickup_info || "Não informado."}
                      </span>
                    </div>
                    <div className={styles.detailCard}>
                      <span className={styles.detailLabel}>Autenticidade</span>
                      <span className={styles.detailValue}>
                        {auction.authenticity_info || "Não informado."}
                      </span>
                    </div>
                    <div className={styles.detailCard}>
                      <span className={styles.detailLabel}>Documentação</span>
                      <span className={styles.detailValue}>
                        {auction.invoice_info || "Não informado."}
                      </span>
                    </div>
                  </div>

                  {auction.authenticity_assets.length > 0 ? (
                    <div className={styles.assetGrid}>
                      {auction.authenticity_assets.map((asset, index) => (
                        <Link
                          className={styles.assetLink}
                          href={asset}
                          key={`${asset}-${index}`}
                          rel="noreferrer"
                          target="_blank"
                        >
                          Prova #{index + 1}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>Selo de confiança</h3>

                  <div className={styles.trustList}>
                    <div className={styles.trustItem}>
                      <strong>Extensão automática</strong>
                      <span>
                        Lance nos últimos{" "}
                        {trust?.bid_extension_window_seconds ??
                          auction.bid_extension_window_seconds}
                        s estende o relógio por{" "}
                        {trust?.bid_extension_seconds ??
                          auction.bid_extension_seconds}
                        s.
                      </span>
                    </div>

                    <div className={styles.trustItem}>
                      <strong>Reserva</strong>
                      <span>
                        {trust?.reserve_price_cents != null
                          ? `Valor de reserva em ${formatBrlFromCents(
                              trust.reserve_price_cents,
                            )}.`
                          : "Este lote não exige valor de reserva."}
                      </span>
                    </div>

                    <div className={styles.trustItem}>
                      <strong>Desempate</strong>
                      <span>
                        {trust?.tie_break_rule ||
                          "Em empate de valor, vence o lance registrado primeiro."}
                      </span>
                    </div>

                    <div className={styles.trustItem}>
                      <strong>Pagamento do vencedor</strong>
                      <span>
                        {trust?.settlement_deadline_hours ?? 24}h para concluir o
                        arremate após o fechamento.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.twoColumnGrid}>
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>Timeline da disputa</h3>

                  {timeline.length === 0 ? (
                    <p className={styles.emptyState}>
                      A linha do tempo aparece conforme o lote ganha movimento.
                    </p>
                  ) : (
                    <ul className={styles.timelineList}>
                      {timeline.map((event) => (
                        <li
                          className={
                            event.is_highlight
                              ? `${styles.timelineItem} ${styles.timelineHighlight}`
                              : styles.timelineItem
                          }
                          key={event.id}
                        >
                          <div className={styles.timelineMarker} aria-hidden="true" />
                          <div className={styles.timelineBody}>
                            <div className={styles.feedTop}>
                              <span className={styles.timelineHeadline}>
                                {event.headline}
                              </span>
                              {event.amount_cents != null ? (
                                <span className={styles.feedAmount}>
                                  {formatBrlFromCents(event.amount_cents)}
                                </span>
                              ) : null}
                            </div>

                            {event.description ? (
                              <span className={styles.timelineDescription}>
                                {event.description}
                              </span>
                            ) : null}

                            <span className={styles.feedMeta}>
                              {new Date(event.created_at).toLocaleString("pt-BR")} •{" "}
                              {formatRelativeTime(event.created_at)}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>Movimento mais recente</h3>

                  {recentBids.length === 0 ? (
                    <p className={styles.emptyState}>
                      Nenhum lance registrado ainda. Configure uma abertura forte e
                      empurre a primeira disputa.
                    </p>
                  ) : (
                    <ul className={styles.feedList}>
                      {recentBids.map((bid) => {
                        const itemClass =
                          bid.is_leading || bid.is_viewer
                            ? `${styles.feedItem} ${styles.feedItemStrong}`
                            : styles.feedItem;

                        return (
                          <li className={itemClass} key={bid.id}>
                            <div className={styles.feedTop}>
                              <span className={styles.feedName}>
                                {formatBidderName(bid, "Participante")}
                                {bid.is_leading
                                  ? " lidera"
                                  : bid.is_viewer
                                    ? " é seu lance"
                                    : ""}
                              </span>
                              <span className={styles.feedAmount}>
                                {formatBrlFromCents(bid.amount_cents)}
                              </span>
                            </div>
                            <span className={styles.feedMeta}>
                              {new Date(bid.created_at).toLocaleString("pt-BR")} •{" "}
                              {formatRelativeTime(bid.created_at)}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            <aside className={styles.aside}>
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>Entrar na disputa</h3>

                {viewer ? (
                  <div className={viewerBadgeClass}>
                    {viewer.is_leading
                      ? "Você está liderando neste momento."
                      : viewer.has_bid
                        ? `Seu maior lance: ${
                            viewer.highest_bid_cents != null
                              ? formatBrlFromCents(viewer.highest_bid_cents)
                              : "--"
                          }`
                        : "Você ainda não entrou na disputa."}
                  </div>
                ) : null}

                <PressureCard
                  isLeading={viewer?.is_leading}
                  gap={
                    viewer?.gap_to_lead_cents != null
                      ? formatBrlFromCents(viewer.gap_to_lead_cents)
                      : null
                  }
                  rival={rivalLabel}
                />

                {!viewer?.is_leading && auctionAcceptingBids ? (
                  <div
                    style={{
                      background: "rgba(255,120,0,0.1)",
                      border: "1px solid rgba(255,120,0,0.35)",
                      padding: 14,
                      borderRadius: 14,
                      marginBottom: 14,
                    }}
                  >
                    <strong style={{ display: "block", marginBottom: 6 }}>
                      Alta chance de outro participante entrar agora
                    </strong>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 14,
                        color: "rgba(255,255,255,0.82)",
                        lineHeight: 1.55,
                      }}
                    >
                      Esse lote está sendo acompanhado em tempo real. Quanto mais
                      você demora, maior a chance de perder a liderança ou entrar
                      tarde demais.
                    </p>
                  </div>
                ) : null}

                {auction.paused_at ? (
                  <div className={styles.detailCard}>
                    <span className={styles.detailLabel}>Pausa operacional</span>
                    <span className={styles.detailValue}>
                      {auction.pause_reason ||
                        "A moderação pausou os lances temporariamente."}
                    </span>
                  </div>
                ) : null}

                {auction.status === "settled" && winnerLabel ? (
                  <div className={styles.detailCard}>
                    <span className={styles.detailLabel}>Arrematante</span>
                    <span className={styles.detailValue}>
                      {winnerLabel}
                      {auction.winner_bid_cents != null
                        ? ` por ${formatBrlFromCents(auction.winner_bid_cents)}`
                        : ""}
                    </span>
                  </div>
                ) : null}

                {viewer?.authenticated ? (
                  <form className={styles.form} onSubmit={submitBid}>
                    <label className={styles.inputWrap}>
                      <span className={styles.inputLabel}>Seu lance agora</span>
                      <input
                        className={styles.input}
                        inputMode="decimal"
                        min={nextMinBidCents != null ? nextMinBidCents / 100 : undefined}
                        onChange={(event) => setAmount(event.target.value)}
                        placeholder={
                          nextMinBidCents != null
                            ? formatBrlFromCents(nextMinBidCents)
                            : "R$ 0,00"
                        }
                        step={Math.max(auction.min_increment_cents, 1) / 100}
                        type="number"
                        value={amount}
                      />
                    </label>

                    <label className={styles.inputWrap}>
                      <span className={styles.inputLabel}>Teto do auto-bid</span>
                      <input
                        className={styles.input}
                        inputMode="decimal"
                        onChange={(event) => setProxyMaxAmount(event.target.value)}
                        placeholder={
                          viewer.auto_bid_max_cents != null
                            ? `Atual: ${formatBrlFromCents(viewer.auto_bid_max_cents)}`
                            : "Ex: 790.00"
                        }
                        step={Math.max(auction.min_increment_cents, 1) / 100}
                        type="number"
                        value={proxyMaxAmount}
                      />
                    </label>

                    {quickBidOptions.length > 0 ? (
                      <div
                        style={{
                          display: "grid",
                          gap: 10,
                          marginTop: 4,
                          marginBottom: 6,
                        }}
                      >
                        {quickBidOptions.map((value, index) => {
                          const labels = [
                            "Dar lance mínimo",
                            "Dar lance competitivo",
                            "Dar lance agressivo",
                          ];
                          return (
                            <button
                              key={value}
                              onClick={() => setAmount((value / 100).toFixed(2))}
                              type="button"
                              style={{
                                padding: "14px",
                                borderRadius: 14,
                                fontWeight: 900,
                                background:
                                  "linear-gradient(135deg,#f7d978,#d4a63a)",
                                color: "#111",
                                border: "none",
                                cursor: "pointer",
                                boxShadow: "0 10px 24px rgba(0,0,0,0.18)",
                              }}
                            >
                              {labels[index] ?? "Dar lance"} •{" "}
                              {formatBrlFromCents(value)}
                            </button>
                          );
                        })}
                      </div>
                    ) : null}

                    <button
                      className={styles.submitButton}
                      disabled={submitting || auctionEnded}
                      type="submit"
                    >
                      {auctionEnded
                        ? "Leilão encerrado"
                        : submitting
                          ? "Enviando lance..."
                          : "Confirmar lance / auto-bid"}
                    </button>
                  </form>
                ) : (
                  <div className={styles.form}>
                    <p className={styles.message}>
                      Entre na sua conta para dar lance, ativar auto-bid, receber
                      atualização ao vivo e acompanhar se você está na frente.
                    </p>
                    <Link
                      className={styles.loginButton}
                      href={`/login?next=${encodeURIComponent(`/r/${raffleSlug}#leilao`)}`}
                    >
                      Entrar para participar
                    </Link>
                  </div>
                )}

                {statusMessage ? (
                  <p
                    className={
                      statusTone === "success"
                        ? `${styles.message} ${styles.messageSuccess}`
                        : statusTone === "error"
                          ? `${styles.message} ${styles.messageError}`
                          : styles.message
                    }
                  >
                    {statusMessage}
                  </p>
                ) : null}

                <div className={styles.smallStats}>
                  <span>Rank atual: {viewer?.rank ? `#${viewer.rank}` : "--"}</span>
                  <span>
                    {viewer?.outside_podium ? "fora do top 3" : "dentro do pódio"}
                  </span>
                  <span>streak: {viewer?.streak_count ?? 0}x</span>
                </div>

                <div style={{ marginTop: 20 }}>
                  <Link
                    href="/rifas"
                    style={{
                      display: "block",
                      textAlign: "center",
                      padding: "14px",
                      borderRadius: 14,
                      background: "rgba(255,255,255,0.05)",
                      color: "#fff",
                      fontWeight: 800,
                      textDecoration: "none",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    Enquanto isso, veja outras campanhas
                  </Link>
                </div>
              </div>

              <div className={styles.card}>
                <h3 className={styles.cardTitle}>Quem está na frente</h3>

                {leaderboard.length === 0 ? (
                  <p className={styles.emptyState}>
                    Assim que os primeiros lances entrarem, o pódio aparece aqui.
                  </p>
                ) : (
                  <ul className={styles.leaderboardList}>
                    {leaderboard.map((entry, index) => {
                      const itemClass = entry.is_viewer
                        ? `${styles.leaderboardItem} ${styles.leaderboardItemStrong}`
                        : styles.leaderboardItem;

                      return (
                        <li
                          className={itemClass}
                          key={`${entry.amount_cents}-${entry.created_at}-${index}`}
                        >
                          <div className={styles.feedTop}>
                            <span className={styles.leaderName}>
                              #{entry.rank ?? index + 1}{" "}
                              {formatBidderName(entry, "Participante")}
                              {entry.is_viewer ? " • você" : ""}
                            </span>
                            <span className={styles.leaderAmount}>
                              {formatBrlFromCents(entry.amount_cents)}
                            </span>
                          </div>
                          <span className={styles.leaderMeta}>
                            streak {entry.streak_count ?? 1}x •{" "}
                            {formatRelativeTime(entry.created_at)}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {viewer?.outside_podium ? (
                  <div className={styles.noteCard}>
                    Você está fora do top 3. Seu rank atual é #{viewer.rank} entre{" "}
                    {viewer.total_ranked_bidders} participantes.
                  </div>
                ) : null}
              </div>

              <div className={styles.card}>
                <h3 className={styles.cardTitle}>Performance do lote</h3>
                <div className={styles.performanceGrid}>
                  <div className={styles.performanceCard}>
                    <strong>{performance?.visitors ?? 0}</strong>
                    <span>visitantes</span>
                  </div>
                  <div className={styles.performanceCard}>
                    <strong>{performance?.participant_rate ?? 0}%</strong>
                    <span>taxa de participantes</span>
                  </div>
                  <div className={styles.performanceCard}>
                    <strong>
                      {formatBrlFromCents(performance?.total_raised_cents ?? 0)}
                    </strong>
                    <span>total arrecadado</span>
                  </div>
                  <div className={styles.performanceCard}>
                    <strong>
                      {formatSeconds(
                        performance?.average_bid_interval_seconds ?? null,
                      )}
                    </strong>
                    <span>tempo medio entre lances</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}