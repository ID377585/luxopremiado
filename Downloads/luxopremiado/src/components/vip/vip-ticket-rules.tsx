import { VipUserState } from "@/lib/vip/types";

interface Props {
  user: VipUserState;
}

export function VipTicketRules({ user }: Props) {
  return (
    <section className="rounded-3xl border border-white/10 bg-zinc-900 p-6 md:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold md:text-3xl">
          Quanto maior seu nível, maiores suas chances
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-zinc-300">
          Para forçar progressão, a campanha não trabalha com 1 usuário igual a 1 chance. O sistema usa tickets por nível, metas e evolução.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full border-collapse text-left">
          <thead className="bg-white/5">
            <tr>
              <th className="px-4 py-4 text-sm font-semibold text-zinc-200">Marco</th>
              <th className="px-4 py-4 text-sm font-semibold text-zinc-200">Recompensa</th>
            </tr>
          </thead>
          <tbody>
            <TableRow title="Usuário Base" reward="não participa do prêmio principal" />
            <TableRow title="Ao entrar no VIP" reward="1 ticket oficial" />
            <TableRow title="A cada novo nível VIP" reward="+1 ticket" />
            <TableRow title="Ao entrar no VIP Elite" reward="+3 tickets" />
            <TableRow title="A cada nível Elite" reward="+2 tickets" />
            <TableRow title="Missões concluídas" reward="tickets bônus" />
          </tbody>
        </table>
      </div>

      <div className="mt-5 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-4">
        <p className="text-sm text-zinc-200">
          <span className="font-semibold text-yellow-300">Resumo estratégico:</span>{" "}
          entrar no VIP coloca você dentro. Subir de nível faz você disputar de verdade.
        </p>
      </div>
    </section>
  );
}

function TableRow({ title, reward }: { title: string; reward: string }) {
  return (
    <tr className="border-t border-white/10">
      <td className="px-4 py-4 text-sm text-zinc-200">{title}</td>
      <td className="px-4 py-4 text-sm text-zinc-300">{reward}</td>
    </tr>
  );
}