import { CampaignMission, CampaignRuleItem } from "./types";

export const VIP_EXPERIENCE_ROUTE = "/app/vip/experiencias";

export const CAMPAIGN_NAME = "Missão Elite: 1 dia com Andressa Urach";
export const CAMPAIGN_DISPLAY_TITLE = "Dia de Estrela: Experiência oficial com Andressa Urach";
export const CAMPAIGN_DURATION_DAYS = 30;

export const CAMPAIGN_COPY = {
  eyebrow: "Experiência oficial premium",
  heroTitle: "Dia de Estrela: Experiência oficial com Andressa Urach",
  heroLead:
    "Só alguns vão assistir. Poucos vão participar. Um vai viver.",
  heroDescription:
    "Entre na Missão Elite e desbloqueie sua chance de viver uma experiência oficial, premium e inesquecível com Andressa Urach. Suba para o VIP, evolua no ranking e acumule tickets para disputar o prêmio mais desejado da temporada. Quanto maior seu nível, maiores suas chances.",
  unlockButton: "Quero desbloquear minha participação",
  rulesButton: "Ver regras da campanha",
};

export const MISSIONS: CampaignMission[] = [
  {
    id: "mission-1",
    title: "Missão 1 — Entrada VIP",
    description: "Desbloqueie o VIP durante a campanha.",
    reward: "1 ticket oficial",
  },
  {
    id: "mission-2",
    title: "Missão 2 — Rede Qualificada",
    description: "Ative 3 afiliados válidos com a meta mínima.",
    reward: "2 tickets extras",
  },
  {
    id: "mission-3",
    title: "Missão 3 — Movimento Pessoal",
    description: "Bata a meta de pontos próprios da campanha.",
    reward: "1 ticket extra",
  },
  {
    id: "mission-4",
    title: "Missão 4 — Suba de Nível",
    description: "Avance ao menos 2 níveis após entrar no VIP.",
    reward: "2 tickets extras",
  },
  {
    id: "mission-5",
    title: "Missão 5 — Chegue ao VIP Elite",
    description: "Alcance o VIP Elite dentro da campanha.",
    reward: "3 tickets extras + 1 baú da experiência + entrada em sorteio paralelo de bônus",
  },
];

export const SECURITY_RULES: CampaignRuleItem[] = [
  { id: "rule-1", label: "agenda previamente definida" },
  { id: "rule-2", label: "local e formato aprovados por ambas as partes" },
  { id: "rule-3", label: "despesas cobertas especificadas" },
  { id: "rule-4", label: "sem promessas abertas fora do escopo do evento" },
  { id: "rule-5", label: "acompanhamento de equipe e produção" },
  { id: "rule-6", label: "cláusulas de segurança, imagem e conduta" },
  { id: "rule-7", label: "possibilidade de adequação por agenda" },
];

export const FAQ_ITEMS = [
  {
    question: "Quem pode participar do prêmio principal?",
    answer:
      "Somente usuários que já sejam VIP ativos antes da campanha ou que atinjam o status VIP dentro do período oficial da campanha.",
  },
  {
    question: "Usuário Base pode concorrer?",
    answer:
      "Usuários Base podem visualizar a campanha, mas não participam do prêmio principal até desbloquearem o VIP.",
  },
  {
    question: "VIP Elite tem vantagem real?",
    answer:
      "Sim. VIP Elite recebe tickets extras, prioridade em missões raras, acesso a baús exclusivos e vantagem promocional adicional conforme regulamento.",
  },
  {
    question: "O prêmio é um encontro livre?",
    answer:
      "Não. Trata-se de uma experiência oficial, premium, planejada e produzida, com agenda, formato, local e despesas principais definidos pela campanha.",
  },
];