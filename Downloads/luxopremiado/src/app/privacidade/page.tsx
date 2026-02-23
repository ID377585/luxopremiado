export default function PrivacyPage() {
  const updatedAt = "23/02/2026";

  return (
    <main style={{ margin: "0 auto", maxWidth: "900px", padding: "3rem 1.25rem" }}>
      <h1 style={{ marginBottom: "1rem" }}>Política de Privacidade</h1>
      <p style={{ color: "#cbd5e1", lineHeight: 1.6 }}>Última atualização: {updatedAt}</p>

      <section style={{ color: "#e2e8f0", display: "grid", gap: "1rem", lineHeight: 1.65, marginTop: "1.5rem" }}>
        <p>
          Esta política descreve como o <strong>luxopremiado.com.br</strong> coleta, usa, armazena e protege dados
          pessoais em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
        </p>

        <h2 style={{ fontSize: "1.2rem", marginTop: "0.8rem" }}>1. Dados coletados</h2>
        <p>
          Podemos coletar: nome, e-mail, telefone, identificadores de conta, histórico de pedidos, informações de
          pagamento retornadas pelo gateway, endereço IP, dados de navegação e eventos técnicos de segurança.
        </p>

        <h2 style={{ fontSize: "1.2rem", marginTop: "0.8rem" }}>2. Finalidades do tratamento</h2>
        <p>
          Utilizamos os dados para: criar conta, processar reservas e pagamentos, prevenir fraude, cumprir obrigações
          legais, oferecer suporte, medir conversão da plataforma e enviar comunicações relacionadas ao serviço.
        </p>

        <h2 style={{ fontSize: "1.2rem", marginTop: "0.8rem" }}>3. Bases legais</h2>
        <p>
          As bases legais incluem execução de contrato, cumprimento de obrigação legal/regulatória, legítimo interesse
          (segurança e melhoria do serviço) e, quando aplicável, consentimento.
        </p>

        <h2 style={{ fontSize: "1.2rem", marginTop: "0.8rem" }}>4. Compartilhamento de dados</h2>
        <p>
          Compartilhamos dados estritamente necessários com provedores de pagamento, infraestrutura, autenticação,
          analytics e ferramentas antifraude. Não comercializamos dados pessoais.
        </p>

        <h2 style={{ fontSize: "1.2rem", marginTop: "0.8rem" }}>5. Cookies e tecnologias similares</h2>
        <p>
          Utilizamos cookies para sessão, segurança, antifraude, medição e personalização. Você pode ajustar cookies no
          navegador, ciente de que funções essenciais podem ser impactadas.
        </p>

        <h2 style={{ fontSize: "1.2rem", marginTop: "0.8rem" }}>6. Retenção e segurança</h2>
        <p>
          Mantemos dados pelo tempo necessário às finalidades informadas e às obrigações legais. Aplicamos controles de
          acesso, criptografia em trânsito, validações de integridade e trilhas de auditoria operacionais.
        </p>

        <h2 style={{ fontSize: "1.2rem", marginTop: "0.8rem" }}>7. Direitos do titular</h2>
        <p>
          Você pode solicitar confirmação de tratamento, acesso, correção, anonimização, portabilidade, eliminação de
          dados quando cabível e informações sobre compartilhamento, conforme limites legais.
        </p>

        <h2 style={{ fontSize: "1.2rem", marginTop: "0.8rem" }}>8. Transferência internacional</h2>
        <p>
          Alguns provedores podem processar dados fora do Brasil. Nesses casos, adotamos salvaguardas contratuais e
          técnicas compatíveis com a legislação aplicável.
        </p>

        <h2 style={{ fontSize: "1.2rem", marginTop: "0.8rem" }}>9. Contato para privacidade</h2>
        <p>
          Solicitações relacionadas a dados pessoais podem ser feitas pelos canais oficiais de suporte informados no
          site. Para demandas formais, descreva claramente o pedido e informe o e-mail da conta cadastrada.
        </p>
      </section>
    </main>
  );
}
