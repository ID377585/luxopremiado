import Link from "next/link";

type QuickAccessBarProps = {
  chooseHref?: string;
  userHref?: string;
  vipHref?: string;
};

export default function QuickAccessBar({
  chooseHref = "/app/comprar",
  userHref = "/area-do-usuario",
  vipHref = "/vip",
}: QuickAccessBarProps) {
  return (
    <section
      style={{
        maxWidth: 1240,
        margin: "0 auto",
        padding: "18px 24px 8px",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 12,
        }}
      >
        <Link href={chooseHref} style={cardStyle}>
          <span style={labelStyle}>ACESSO RÁPIDO</span>
          <strong style={titleStyle}>Escolher números</strong>
          <span style={textStyle}>
            Vá direto para a compra sem perder tempo.
          </span>
        </Link>

        <Link href={userHref} style={cardStyle}>
          <span style={labelStyle}>ÁREA DO USUÁRIO</span>
          <strong style={titleStyle}>Entrar no painel</strong>
          <span style={textStyle}>
            Acompanhe pagamentos, reservas e histórico.
          </span>
        </Link>

        <Link href={vipHref} style={cardStyle}>
          <span style={labelStyle}>VIP</span>
          <strong style={titleStyle}>Ver benefícios</strong>
          <span style={textStyle}>
            Confira vantagens e campanhas especiais.
          </span>
        </Link>
      </div>
    </section>
  );
}

const cardStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  textDecoration: "none",
  color: "#fff",
  padding: 18,
  borderRadius: 20,
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 10px 24px rgba(0,0,0,0.18)",
};

const labelStyle: React.CSSProperties = {
  color: "#f2d067",
  fontWeight: 900,
  fontSize: 12,
  letterSpacing: 0.8,
};

const titleStyle: React.CSSProperties = {
  fontSize: 20,
  lineHeight: 1.2,
};

const textStyle: React.CSSProperties = {
  color: "rgba(255,255,255,0.78)",
  lineHeight: 1.6,
  fontSize: 14,
};