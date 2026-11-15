import type { Chat } from "@/features/messages/types";

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
    reply: "Pode guardar o exame em Saúde, na aba Exames, e levar para a consulta. Olho com calma com você.",
  },
  {
    match: /(sintoma|dor|insônia|insonia|cansa)/i,
    reply:
      "Anotei. Se puder, registre quando e quanto incomoda em Saúde, assim conseguimos ver o padrão juntos.",
  },
];

const FALLBACK =
  "Recebi sua mensagem e fico feliz que tenha escrito. Conversamos sobre isso na nossa próxima sessão.";

export function demoReply(content: string, doctorName = ""): string {
  const reply = RULES.find((rule) => rule.match.test(content))?.reply ?? FALLBACK;
  // "Obrigada" é da Dra. Helena; o Dr. Rafael diz "Obrigado".
  return doctorName.startsWith("Dr. ") ? reply.replace("Obrigada", "Obrigado") : reply;
}

/**
 * Cada profissional tem a sua conversa com o paciente. Quem já usava a demonstração com uma
 * conversa só (a da psicóloga) ganha a do psiquiatra, sem perder nada do que já escreveu.
 */
export function withAllChats(chats: Chat[], all: Chat[]): Chat[] {
  const missing = all.filter((chat) => !chats.some((c) => c.doctorName === chat.doctorName));
  return missing.length ? [...chats, ...missing] : chats;
}
