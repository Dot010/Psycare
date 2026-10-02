"use client";

import { CircleCheck, Mail, MessageCircle, BookOpen, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { Page } from "@/components/layout/Page";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { fieldControlClass } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    question: "Como funciona a renovação da assinatura?",
    answer:
      "A renovação ocorre automaticamente no dia do vencimento do seu plano. Caso utilize PIX, um código de pagamento e QR Code serão enviados por e-mail.",
  },
  {
    question: "Como alterar meu método de pagamento principal?",
    answer:
      "Acesse a página de Pagamentos, escolha o cartão ou a chave PIX desejada e clique em “Tornar principal”.",
  },
  {
    question: "Posso cancelar minha assinatura a qualquer momento?",
    answer:
      "Sim. Você pode cancelar na página de Pagamentos. O acesso continua ativo até o fim do período já pago.",
  },
];

const CONTACTS = [
  { Icon: MessageCircle, title: "WhatsApp", text: "Atendimento em tempo real (em breve)." },
  { Icon: Mail, title: "E-mail de suporte", text: "suporte@empresa.com.br — resposta em até 24h." },
  { Icon: BookOpen, title: "Base de conhecimento", text: "Artigos e tutoriais (em breve)." },
];

const ticketSchema = z.object({
  subject: z.string().trim().min(4, "Assunto muito curto").max(120),
  message: z.string().trim().min(10, "Descreva melhor o problema"),
});

const panelClass = "space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm";
const panelTitleClass = "border-b border-border pb-3 text-base font-bold text-foreground";

export default function HelpView() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState("");
  const resetTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(resetTimer.current), []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = ticketSchema.safeParse({ subject, message });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Dados inválidos");
      return;
    }
    setError("");
    setIsSent(true);
    resetTimer.current = setTimeout(() => {
      setIsSent(false);
      setSubject("");
      setMessage("");
    }, 3000);
  };

  return (
    <Page
      title="Central de Ajuda e Suporte"
      description="Tire suas dúvidas ou entre em contato com a equipe."
      width="narrow"
    >
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {CONTACTS.map(({ Icon, title, text }) => (
          <li key={title} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <Icon className="mb-2 size-5 text-brand-accent" aria-hidden />
            <h2 className="text-sm font-bold text-foreground">{title}</h2>
            <p className="mt-1 text-xs text-muted-foreground">{text}</p>
          </li>
        ))}
      </ul>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
        <section className={cn(panelClass, "md:col-span-7")}>
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

        <section className={cn(panelClass, "md:col-span-5")}>
          <h2 className={panelTitleClass}>Abrir chamado</h2>

          {isSent ? (
            <div
              role="status"
              className="space-y-2 rounded-xl border border-brand-200 bg-brand-50 p-4 text-center"
            >
              <CircleCheck className="mx-auto size-6 text-brand-accent" aria-hidden />
              <p className="text-xs font-bold text-brand-ink">Chamado enviado</p>
              <p className="text-xs text-brand-ink">
                Recebemos sua mensagem e entraremos em contato em breve.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <Field
                label="Assunto"
                placeholder="Ex: Dúvida sobre fatura"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
              <div className="space-y-1">
                <label htmlFor="ticket-message" className="block text-xs font-medium text-muted-foreground">
                  Mensagem
                </label>
                <textarea
                  id="ticket-message"
                  rows={4}
                  required
                  placeholder="Descreva o que está acontecendo..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={cn(fieldControlClass, "resize-none")}
                />
              </div>
              {error && (
                <p role="alert" className="text-xs text-danger-600">
                  {error}
                </p>
              )}
              <Button type="submit" className="w-full">
                Enviar chamado
              </Button>
            </form>
          )}
        </section>
      </div>
    </Page>
  );
}
