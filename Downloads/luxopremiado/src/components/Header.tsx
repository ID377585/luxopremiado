import Link from "next/link";

export default function Header() {
  return (
    <header style={{ padding: 20 }}>
      <nav style={{ display: "flex", gap: 20 }}>
        <Link href="/">Home</Link>
        <Link href="/rifas">Rifas</Link>
        <Link href="/sorteios">Sorteios</Link>
        <Link href="/leiloes">Leilões</Link>
        <Link href="/vip">VIP</Link>
      </nav>
    </header>
  );
}