export default function TermsPage() {
  const updatedAt = "23/02/2026";

  return (
    <main style={{ margin: "0 auto", maxWidth: "900px", padding: "3rem 1.25rem" }}>
      <h1 style={{ marginBottom: "1rem" }}>Termos de Uso</h1>
      <p style={{ color: "#cbd5e1", lineHeight: 1.6 }}>Última atualização: {updatedAt}</p>

      <section style={{ color: "#e2e8f0", display: "grid", gap: "1rem", lineHeight: 1.65, marginTop: "1.5rem" }}>
        <p>
          Estes termos regulam o acesso e uso da plataforma <strong>luxopremiado.com.br</strong>, incluindo cadastro,
          compra de números, pagamentos e participação em campanhas promocionais.
        </p>

        <h2 style={{ fontSize: "1.2rem", marginTop: "0.8rem" }}>1. Aceitação e elegibilidade</h2>
        <p>
          Ao utilizar a plataforma, você declara ser maior de 18 anos, possuir capacidade civil e concordar com todas
          as regras publicadas na página da campanha ativa.
        </p>

        <h2 style={{ fontSize: "1.2rem", marginTop: "0.8rem" }}>2. Conta de usuário</h2>
        <p>
          Você é responsável por manter a confidencialidade do login e por toda atividade feita na sua conta. É
          proibido criar conta com dados falsos, de terceiros sem autorização ou para fraudar o sistema.
        </p>

        <h2 style={{ fontSize: "1.2rem", marginTop: "0.8rem" }}>3. Reserva, pagamento e confirmação</h2>
        <p>
          A reserva de números possui prazo limitado. A confirmação ocorre somente após aprovação do pagamento pelo
          gateway (PIX/cartão) e validação do webhook oficial. Reservas vencidas retornam automaticamente à
          disponibilidade pública.
        </p>

        <h2 style={{ fontSize: "1.2rem", marginTop: "0.8rem" }}>4. Regras de campanha e sorteio</h2>
        <p>
          Cada campanha possui regulamento próprio, método de apuração, prazo e critérios de elegibilidade. Em caso de
          divergência entre conteúdo promocional e regulamento específico, prevalece o regulamento da campanha.
        </p>

        <h2 style={{ fontSize: "1.2rem", marginTop: "0.8rem" }}>5. Uso indevido e antifraude</h2>
        <p>
          A plataforma adota mecanismos de segurança (rate limit, validações e monitoramento). Tentativas de fraude,
          uso de bots, manipulação de pagamento ou violação de segurança podem gerar bloqueio de conta, cancelamento de
          pedidos e comunicação às autoridades competentes.
        </p>

        <h2 style={{ fontSize: "1.2rem", marginTop: "0.8rem" }}>6. Cancelamentos e reembolsos</h2>
        <p>
          Cancelamentos e reembolsos seguem o regulamento da campanha, regras do meio de pagamento e legislação
          aplicável. Solicitações devem ser feitas pelos canais oficiais de suporte informados no rodapé do site.
        </p>

        <h2 style={{ fontSize: "1.2rem", marginTop: "0.8rem" }}>7. Afiliados e comissões</h2>
        <p>
          Códigos de afiliado são pessoais e intransferíveis. A plataforma pode aprovar, bloquear, revisar ou cancelar
          comissões em caso de autoindicação, fraude, chargeback, duplicidade ou descumprimento de política interna.
        </p>

        <h2 style={{ fontSize: "1.2rem", marginTop: "0.8rem" }}>8. Limitação de responsabilidade</h2>
        <p>
          A plataforma não responde por indisponibilidade causada por terceiros, falhas de rede, indisponibilidade de
          provedores de pagamento ou eventos fora de controle razoável. Em qualquer hipótese, a responsabilidade fica
          limitada ao valor efetivamente pago pelo usuário no pedido em questão.
        </p>

        <h2 style={{ fontSize: "1.2rem", marginTop: "0.8rem" }}>9. Alterações dos termos</h2>
        <p>
          Estes termos podem ser atualizados a qualquer momento. A versão vigente será sempre publicada nesta página,
          com a data de revisão correspondente.
        </p>

        <h2 style={{ fontSize: "1.2rem", marginTop: "0.8rem" }}>10. Contato</h2>
        <p>
          Para dúvidas jurídicas, operacionais ou solicitações formais, utilize os canais oficiais exibidos na seção de
          transparência e no rodapé do site.
        </p>
      </section>
    </main>
  );
}
