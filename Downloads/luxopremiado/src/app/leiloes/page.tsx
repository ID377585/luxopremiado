import Link from "next/link";

export default function LeiloesPage() {
  const leiloes = [
    { slug: "leilao-carro", titulo: "Carro 0km" },
    { slug: "leilao-moto", titulo: "Moto esportiva" },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <h1>Leilões disponíveis</h1>

      <ul>
        {leiloes.map((leilao) => (
          <li key={leilao.slug}>
            <Link href={`/leiloes/${leilao.slug}`}>
              {leilao.titulo}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}