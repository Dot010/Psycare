"use client";

import { Mail, ChevronDown } from "lucide-react";
import Link from "next/link";
import { DemoNotice } from "@/components/feedback/DemoNotice";
import { Page } from "@/components/layout/Page";

const FAQS = [
  {
    question: "Quem lê o meu diário?",
    answer:
      "Só você lê o texto. Se você ativar o compartilhamento em Configurações, o seu profissional vê apenas o título das páginas que você marcar como “Para a próxima consulta”. Você muda isso quando quiser.",
  },
  {
    question: "Como as plantas do Refúgio crescem?",
    answer:
      "Cada gesto de cuidado (contar como está, escrever no diário, respirar, concluir um hábito ou uma tarefa) vira uma gota. No Refúgio, abra os Canteiros e toque em Regar: as plantas crescem. Elas nunca murcham.",
  },
  {
    question: "Como peço uma nova receita?",
    answer:
      "Em Saúde, abra a ficha do remédio e toque em “Pedir nova receita”. Seu psiquiatra responde, e a receita é entregue em mãos. O app só registra o que ele preparou.",
  },
  {
    question: "Como peço um encaminhamento para a psicóloga?",
    answer:
      "Em Saúde, na aba Exames e guias, toque em “Pedir encaminhamento”. O papel é entregue em mãos pelo psiquiatra, e você anota cada etapa até entregar à psicóloga.",
  },
  {
    question: "Como pago minhas consultas?",
    answer:
      "Em Pagamentos, cada profissional tem a sua lista de cobranças. Toque em Pagar e use o PIX daquele profissional. O PsyCare não tem assinatura: você paga só o que for atendimento.",
  },
  {
    question: "Posso pagar a mais de um profissional?",
    answer: "Sim. Cada profissional aparece separado em Pagamentos, e cada pagamento vai só para ele.",
  },
];

const CONTACTS = [
  { Icon: Mail, title: "E-mail de suporte", text: "suporte@exemplo.com (endereço de exemplo)." },
];

const panelClass = "space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm";
const panelTitleClass = "border-b border-border pb-3 text-base font-bold text-foreground";

export default function HelpView() {
  return (
    <Page title="Ajuda" description="Tire suas dúvidas ou fale com a equipe por e-mail." width="narrow">
      <DemoNotice>O e-mail abaixo é de exemplo.</DemoNotice>
      <p className="rounded-xl bg-brand-50 p-4 text-sm text-brand-ink">
        Precisa de ajuda agora? Ligue{" "}
        <a className="font-semibold underline" href="tel:188">
          188
        </a>{" "}
        (CVV, 24 h) ou{" "}
        <a className="font-semibold underline" href="tel:192">
          192
        </a>{" "}
        (SAMU). Seu{" "}
        <Link className="font-semibold underline" href="/dashboard/safety">
          plano de segurança
        </Link>{" "}
        está a um toque.
      </p>
      <ul className="grid grid-cols-1 gap-4">
        {CONTACTS.map(({ Icon, title, text }) => (
          <li key={title} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <Icon className="mb-2 size-5 text-brand-accent" aria-hidden />
            <h2 className="text-sm font-bold text-foreground">{title}</h2>
            <p className="mt-1 text-xs text-muted-foreground">{text}</p>
          </li>
        ))}
      </ul>

      <div>
        <section className={panelClass}>
          <h2 className={panelTitleClass}>Perguntas frequentes</h2>
          <div className="space-y-3">
            {FAQS.map((faq) => (
              <details key={faq.question} className="group overflow-hidden rounded-xl border border-border">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-2 bg-sunken/50 p-4 text-xs font-semibold text-foreground hover:bg-sunken/50">
                  {faq.question}
                  <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <p className="border-t border-border p-4 text-xs leading-relaxed text-muted-foreground">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </Page>
  );
}
