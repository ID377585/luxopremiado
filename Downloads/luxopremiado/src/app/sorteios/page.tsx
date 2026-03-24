import Link from "next/link";

export default function SorteiosPage() {
  const sorteios = [
    { slug: "sorteio-1000-reais", titulo: "R$ 1.000 no Pix" },
    { slug: "sorteio-viagem", titulo: "Viagem para o Nordeste" },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <h1>Sorteios disponíveis</h1>

      <ul>
        {sorteios.map((sorteio) => (
          <li key={sorteio.slug}>
            <Link href={`/sorteios/${sorteio.slug}`}>
              {sorteio.titulo}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}