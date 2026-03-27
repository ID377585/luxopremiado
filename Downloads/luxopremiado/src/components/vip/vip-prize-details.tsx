export function VipPrizeDetails() {
  return (
    <section className="rounded-3xl border border-white/10 bg-zinc-900 p-6 md:p-8">
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold md:text-3xl">
            O que o ganhador vive na prática
          </h2>
          <p className="mt-4 text-sm leading-7 text-zinc-300">
            A campanha oferece uma experiência oficial premium com Andressa Urach, planejada, produzida e organizada com regras claras, agenda definida e despesas principais cobertas pela campanha.
          </p>

          <div className="mt-5 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-4">
            <p className="text-sm font-semibold text-yellow-300">
              Formulação oficial recomendada
            </p>
            <p className="mt-2 text-sm leading-7 text-zinc-200">
              Tenha uma experiência exclusiva, planejada e inesquecível com Andressa Urach, com despesas principais pagas pela campanha.
            </p>
          </div>

          <div className="mt-5">
            <p className="text-sm font-semibold text-zinc-100">Inclui, por exemplo:</p>
            <ul className="mt-3 space-y-2 text-sm text-zinc-300">
              <li>• hotel + G.P.</li>
              <li>• deslocamento local</li>
              <li>• almoço ou jantar programado</li>
              <li>• participação em ação registrada da campanha</li>
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
          <h3 className="text-xl font-semibold">Etapas da experiência oficial</h3>

          <div className="mt-5 space-y-4 text-sm text-zinc-300">
            <div>
              <p className="font-semibold text-white">Etapa 1 — Firmar o prêmio</p>
              <p>contato oficial com o ganhador e assinatura de regulamento, imagem e conduta</p>
            </div>

            <div>
              <p className="font-semibold text-white">Etapa 2 — Recepção</p>
              <p>check-in e kit experiência Bigode VIP</p>
            </div>

            <div>
              <p className="font-semibold text-white">Etapa 3 — Experiência principal</p>
              <p>encontro em local previamente aprovado, almoço ou jantar e participação em ação registrada da campanha</p>
            </div>

            <div>
              <p className="font-semibold text-white">Etapa 4 — Conteúdo</p>
              <p>gravação de reels/stories, depoimento do ganhador e making of para uso em site e redes</p>
            </div>

            <div>
              <p className="font-semibold text-white">Etapa 5 — Fechamento</p>
              <p>postagem oficial, certificado ou lembrança da experiência e publicação do case do campeão</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}