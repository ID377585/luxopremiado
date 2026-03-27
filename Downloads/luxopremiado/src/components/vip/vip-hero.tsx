import Link from "next/link";
import { CAMPAIGN_COPY } from "@/lib/vip/constants";
import { VipUserState } from "@/lib/vip/types";
import { getCampaignStatusMessage, getTierLabel } from "@/lib/vip/utils";

interface Props {
  user: VipUserState;
}

export function VipHero({ user }: Props) {
  return (
    <section className="overflow-hidden rounded-3xl border border-yellow-500/20 bg-gradient-to-br from-zinc-900 via-neutral-950 to-zinc-900 p-6 shadow-2xl md:p-10">
      <div className="grid gap-8 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="space-y-5">
          <span className="inline-flex rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-1 text-sm font-medium text-yellow-300">
            {CAMPAIGN_COPY.eyebrow}
          </span>

          <div className="space-y-3">
            <h1 className="text-3xl font-bold leading-tight md:text-5xl">
              {CAMPAIGN_COPY.heroTitle}
            </h1>
            <p className="text-lg font-semibold text-yellow-300 md:text-xl">
              {CAMPAIGN_COPY.heroLead}
            </p>
            <p className="max-w-3xl text-sm leading-7 text-zinc-300 md:text-base">
              {CAMPAIGN_COPY.heroDescription}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="#progresso"
              className="inline-flex items-center justify-center rounded-xl bg-yellow-400 px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90"
            >
              {CAMPAIGN_COPY.unlockButton}
            </Link>

            <Link
              href="#regras"
              className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {CAMPAIGN_COPY.rulesButton}
            </Link>
          </div>
        </div>

        <aside className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                Seu status atual
              </p>
              <p className="mt-2 text-2xl font-bold text-yellow-300">
                {getTierLabel(user.tier)}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm font-medium text-zinc-300">
                {getCampaignStatusMessage(user)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs text-zinc-400">Tickets atuais</p>
                <p className="mt-2 text-2xl font-bold">{user.currentTickets}</p>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs text-zinc-400">XP na campanha</p>
                <p className="mt-2 text-2xl font-bold">{user.xpInCampaign.toLocaleString("pt-BR")}</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}