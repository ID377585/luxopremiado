import Link from "next/link";

type Props = {
  chooseHref?: string;
  userHref?: string;
  vipHref?: string;
};

export default function QuickAccessBar({
  chooseHref = "/#premio",
  userHref = "/usuario",
  vipHref = "/vip",
}: Props) {
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1000,
        backdropFilter: "blur(12px)",
        background: "rgba(4,13,44,0.88)",
        borderBottom: "1px solid rgba(242,208,103,0.14)",
      }}
    >
      <div
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "10px 16px",
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            color: "#fff",
            fontWeight: 800,
            letterSpacing: 0.4,
          }}
        >
          Acesso rápido
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <Link
            href={chooseHref}
            style={{
              textDecoration: "none",
              background: "linear-gradient(135deg, #f7d978 0%, #d4a63a 100%)",
              color: "#111",
              padding: "10px 14px",
              borderRadius: 12,
              fontWeight: 900,
            }}
          >
            Escolher números
          </Link>

          <Link
            href={userHref}
            style={{
              textDecoration: "none",
              background: "rgba(255,255,255,0.06)",
              color: "#fff",
              padding: "10px 14px",
              borderRadius: 12,
              fontWeight: 800,
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            Área do Usuário
          </Link>

          <Link
            href={vipHref}
            style={{
              textDecoration: "none",
              background: "rgba(255,255,255,0.06)",
              color: "#fff",
              padding: "10px 14px",
              borderRadius: 12,
              fontWeight: 800,
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            VIP
          </Link>
        </div>
      </div>
    </div>
  );
}