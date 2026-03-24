import Link from "next/link";

export default function RifasPage() {
  // MOCK (depois você liga no banco/Firebase)
  const rifas = [
    { slug: "rifa-iphone-15", titulo: "iPhone 15 Pro Max" },
    { slug: "rifa-ps5", titulo: "PlayStation 5" },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <h1>Rifas disponíveis</h1>

      <ul>
        {rifas.map((rifa) => (
          <li key={rifa.slug}>
            <Link href={`/rifas/${rifa.slug}`}>
              {rifa.titulo}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}