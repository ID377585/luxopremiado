export function VipWireframeNote() {
  return (
    <section className="rounded-3xl border border-dashed border-white/15 bg-black/20 p-6 md:p-8">
      <h2 className="text-2xl font-bold md:text-3xl">Wireframe funcional da página</h2>

      <div className="mt-6 grid gap-4 text-sm text-zinc-300">
        <div className="rounded-2xl border border-white/10 p-4">
          <p className="font-semibold text-white">1. Hero premium</p>
          <p>título, subtítulo, CTA principal, CTA de regras, card lateral com status, tickets e XP</p>
        </div>

        <div className="rounded-2xl border border-white/10 p-4">
          <p className="font-semibold text-white">2. Painel de progresso</p>
          <p>barra de progresso, pontos totais, pontos próprios, afiliados, falta para liberar VIP</p>
        </div>

        <div className="rounded-2xl border border-white/10 p-4">
          <p className="font-semibold text-white">3. Estrutura de tickets</p>
          <p>tabela de recompensas por nível e resumo estratégico</p>
        </div>

        <div className="rounded-2xl border border-white/10 p-4">
          <p className="font-semibold text-white">4. Missões da campanha</p>
          <p>cards da Rota Andressa Urach com recompensas claras</p>
        </div>

        <div className="rounded-2xl border border-white/10 p-4">
          <p className="font-semibold text-white">5. Detalhes do prêmio</p>
          <p>explicação oficial, inclusões, etapas da experiência e posicionamento seguro</p>
        </div>

        <div className="rounded-2xl border border-white/10 p-4">
          <p className="font-semibold text-white">6. Regras e segurança</p>
          <p>regras resumidas, cláusulas de transparência, imagem, produção e agenda</p>
        </div>

        <div className="rounded-2xl border border-white/10 p-4">
          <p className="font-semibold text-white">7. FAQ</p>
          <p>respostas rápidas para elegibilidade, tickets, formato da experiência e VIP Elite</p>
        </div>
      </div>
    </section>
  );
}