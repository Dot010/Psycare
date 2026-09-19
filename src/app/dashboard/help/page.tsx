"use client";

import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "Como funciona a renovação da assinatura?",
    answer:
      "A renovação ocorre automaticamente no dia do vencimento do seu plano. Caso utilize PIX, um código de pagamento e QR Code serão enviados por e-mail.",
  },
  {
    question: "Como alterar meu método de pagamento principal?",
    answer:
      "Acesse a página de Pagamentos, selecione o cartão ou chave PIX desejada e clique em 'Tornar principal'.",
  },
  {
    question: "Posso cancelar minha assinatura a qualquer momento?",
    answer:
      "Sim! Você pode cancelar na aba de Pagamentos. O acesso continuará ativo até o final do período já pago.",
  },
];

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [isSent, setIsSent] = useState(false);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) return;

    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      setTicketSubject("");
      setTicketMessage("");
    }, 3000);
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-5xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Central de <span className="text-emerald-600">Ajuda & Suporte</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Tire suas dúvidas ou entre em contato com nossa equipe.
          </p>
        </div>

        <span className="self-start md:self-auto inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          Módulo de Suporte em Expansão
        </span>
      </div>

      {/* Cards de Atalho */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a
          href="https://wa.me/"
          target="_blank"
          rel="noopener noreferrer"
          className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-emerald-300 hover:shadow-md transition group"
        >
          <div className="text-2xl mb-2">💬</div>
          <h3 className="font-bold text-slate-800 text-sm group-hover:text-emerald-600 transition">
            Atendimento via WhatsApp
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Fale diretamente com um especialista em tempo real.
          </p>
        </a>

        <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-2xl mb-2">📧</div>
          <h3 className="font-bold text-slate-800 text-sm">E-mail de Suporte</h3>
          <p className="text-xs text-slate-400 mt-1">
            suporte@empresa.com.br (Resposta em até 24h)
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-2xl mb-2">📚</div>
          <h3 className="font-bold text-slate-800 text-sm">Base de Conhecimento</h3>
          <p className="text-xs text-slate-400 mt-1">
            Artigos completos e tutoriais em vídeo (Em breve).
          </p>
        </div>
      </div>

      {/* Grid: FAQ e Formulário */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* FAQs */}
        <div className="md:col-span-7 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3">
            Perguntas Frequentes (FAQ)
          </h2>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={faq.question}
                  className="border border-slate-100 rounded-xl overflow-hidden transition"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full text-left p-4 font-semibold text-xs text-slate-800 bg-slate-50/50 hover:bg-slate-100/50 transition flex justify-between items-center gap-2"
                  >
                    <span>{faq.question}</span>
                    <span className="text-slate-400 font-bold">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="p-4 text-xs text-slate-600 bg-white border-t border-slate-100 leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Formulário de Chamado */}
        <div className="md:col-span-5 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3">
            Abrir Chamado de Ajuda
          </h2>

          {isSent ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
              <span className="text-2xl">🎉</span>
              <p className="font-bold text-xs text-emerald-800">
                Chamado enviado com sucesso!
              </p>
              <p className="text-[11px] text-emerald-700">
                Sua mensagem foi recebida. Entraremos em contato em breve.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmitTicket} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Assunto
                </label>
                <input
                  type="text"
                  placeholder="Ex: Dúvida sobre fatura"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Mensagem
                </label>
                <textarea
                  rows={4}
                  placeholder="Descreva o que está acontecendo..."
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition shadow-sm"
              >
                Enviar Chamado
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}