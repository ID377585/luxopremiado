import { FAQ_ITEMS } from "@/lib/vip/constants";

export function VipFaq() {
  return (
    <section className="rounded-3xl border border-white/10 bg-zinc-900 p-6 md:p-8">
      <h2 className="text-2xl font-bold md:text-3xl">Perguntas frequentes</h2>

      <div className="mt-6 space-y-4">
        {FAQ_ITEMS.map((item) => (
          <article
            key={item.question}
            className="rounded-2xl border border-white/10 bg-black/20 p-5"
          >
            <h3 className="text-base font-semibold text-white">{item.question}</h3>
            <p className="mt-2 text-sm leading-7 text-zinc-300">{item.answer}</p>
          </article>
        ))}
      </div>
    </section>
  );
}