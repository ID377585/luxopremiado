import { SECURITY_RULES } from "@/lib/vip/constants";

export function VipRules() {
  return (
    <section
      id="regras"
      className="rounded-3xl border border-white/10 bg-zinc-900 p-6 md:p-8"
    >
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold md:text-3xl">Regras oficiais da campanha</h2>
          <div className="mt-4 space-y-4 text-sm leading-7 text-zinc-300">
            <p>
              A campanha <strong>“Missão Elite: 1 dia com Andressa Urach”</strong> é promocional e limitada ao período divulgado na página oficial.
            </p>
            <p>
              Para participar do sorteio principal, o usuário deve atingir ou já possuir status VIP válido, conforme os critérios vigentes da plataforma.
            </p>
            <p>
              Usuários que alcançarem VIP Elite durante a campanha receberão benefícios adicionais, como tickets extras e vantagens promocionais.
            </p>
            <p>
              A experiência será realizada em formato oficial, previamente organizado, com agenda, local, duração e despesas cobertas definidos no regulamento específico.
            </p>
            <p>
              O prêmio é pessoal, intransferível e sujeito à disponibilidade de agenda, produção, validação cadastral e cumprimento das regras da plataforma.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
          <h3 className="text-xl font-semibold">Transparência, segurança e formato oficial</h3>
          <ul className="mt-4 space-y-3 text-sm text-zinc-300">
            {SECURITY_RULES.map((rule) => (
              <li key={rule.id}>• {rule.label}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}