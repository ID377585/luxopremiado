import { MISSIONS } from "@/lib/vip/constants";

export function VipMissions() {
  return (
    <section className="rounded-3xl border border-white/10 bg-zinc-900 p-6 md:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold md:text-3xl">Rota Andressa Urach</h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-zinc-300">
          Missões específicas aceleram sua progressão e multiplicam suas chances dentro da campanha.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {MISSIONS.map((mission) => (
          <article
            key={mission.id}
            className="rounded-2xl border border-white/10 bg-black/20 p-5"
          >
            <h3 className="text-lg font-semibold text-white">{mission.title}</h3>
            <p className="mt-3 text-sm leading-7 text-zinc-300">
              {mission.description}
            </p>
            <div className="mt-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-3">
              <p className="text-sm font-medium text-yellow-300">
                Recompensa: {mission.reward}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}