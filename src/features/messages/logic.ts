/** Respostas de exemplo do profissional na demonstração. Nada aqui chega a uma pessoa de verdade. */
export const REPLY_DELAY_MS = 1400;

const RULES: { match: RegExp; reply: string }[] = [
  {
    match: /(crise|me machucar|n[ãa]o aguento|suic)/i,
    reply:
      "Sinto muito que esteja assim. Se estiver em perigo agora, ligue 188 (CVV, 24 h) ou 192. Estou aqui para conversar com você na nossa sessão.",
  },
  {
    match: /(rem[ée]dio|medica[çc][ãa]o|dose)/i,
    reply:
      "Obrigada por contar. Sobre o remédio, vamos falar na consulta. Até lá, não mude nada por conta própria.",
  },
  {
    match: /exame/i,
    reply: "Pode guardar o exame na tela Hoje e levar para a consulta. Olho com calma com você.",
  },
  {
    match: /(sintoma|dor|insônia|insonia|cansa)/i,
    reply:
      "Anotei. Se puder, registre quando e quanto incomoda em Hoje, assim conseguimos ver o padrão juntos.",
  },
];

const FALLBACK =
  "Recebi sua mensagem e fico feliz que tenha escrito. Conversamos sobre isso na nossa próxima sessão.";

export function demoReply(content: string): string {
  return RULES.find((rule) => rule.match.test(content))?.reply ?? FALLBACK;
}
