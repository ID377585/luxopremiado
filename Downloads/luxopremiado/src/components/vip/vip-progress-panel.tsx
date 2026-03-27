import { VipUserState } from "@/lib/vip/types";
import { getProgressPercentage, getTicketBonusSummary } from "@/lib/vip/utils";

interface Props {
  user: VipUserState;
}

export function VipProgressPanel({ user }: Props) {
  const percentage = getProgressPercentage(user);

  return (
    <section
      id="progresso"
      className="rounded-3xl border border-white/10 bg-zinc-900 p-6 md:p-8"
    >
      <div className="mb-6 flex flex-col gap-2">
        <h2 className="text-2xl font-bold md:text-3xl">
          Seu progresso para entrar oficialmente na Missão Elite
        </h2>
        <p className="max-w-3xl text-sm leading-7 text-zinc-300">
          A campanha transforma progressão em vantagem real. Entrar no VIP coloca você no jogo. Evoluir torna você competitivo.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <div className="h-4 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-yellow-400 transition-all"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <StatCard label="Seus pontos totais" value={user.totalPoints.toLocaleString("pt-BR")} />
            <StatCard label="Seus pontos próprios" value={user.ownPoints.toLocaleString("pt-BR")} />
            <StatCard
              label="Afiliados qualificados"
              value={`${user.qualifiedAffiliates}/${user.requiredAffiliates}`}
            />
            <StatCard
              label="Falta para liberar VIP"
              value={`${user.pointsToUnlockVip.toLocaleString("pt-BR")} pontos`}
            />
          </div>
        </div>

        <aside className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-5">
          <p className="text-sm font-semibold text-yellow-300">
            Vantagem competitiva
          </p>
          <p className="mt-3 text-sm leading-7 text-zinc-300">
            {getTicketBonusSummary(user)}
          </p>

          <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">
            <p className="text-sm font-medium text-zinc-200">
              Ao bater o VIP, você libera:
            </p>
            <ul className="mt-3 space-y-2 text-sm text-zinc-300">
              <li>• 1 ticket oficial para a experiência</li>
              <li>• selo de Participante Oficial Missão Elite</li>
              <li>• acesso às missões premium</li>
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-xs uppercase tracking-wide text-zinc-400">{label}</p>
      <p className="mt-2 text-xl font-bold text-white">{value}</p>
    </div>
  );
}