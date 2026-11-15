"use client";

import { Send } from "lucide-react";
import { useState } from "react";
import { Page } from "@/components/layout/Page";
import { Button } from "@/components/ui/button";
import { fieldControlClass } from "@/components/ui/input";
import { useMessages } from "@/features/messages/hooks/useMessages";
import { MESSAGE_MAX } from "@/features/messages/types";
import { cn } from "@/lib/utils";

const QUICK_REPLIES = [
  { label: "Dúvida remédio", text: "Tenho uma dúvida sobre a medicação: " },
  { label: "Enviar exame", text: "Gostaria de enviar o resultado de um exame: " },
  { label: "Sintoma novo", text: "Estou sentindo o seguinte sintoma novo: " },
];

function Avatar({ name, className }: { name: string; className?: string }) {
  const initials = name
    .replace(/^(Dr|Dra)\.?\s+/i, "")
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-ink",
        className,
      )}
    >
      {initials}
    </span>
  );
}

export function MessagesView() {
  const { chats, activeChat, activeChatId, setActiveChatId, sendMessage } = useMessages();
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChat || !newMessage.trim()) return;

    const result = sendMessage({ chatId: activeChat.id, content: newMessage });
    if (!result.success) {
      setError(result.error);
      return;
    }
    setError("");
    setNewMessage("");
  };

  return (
    <Page
      title="Conversar com quem cuida de você"
      kicker="Mensagens"
      description="Para recados e dúvidas. A resposta vem em horário de atendimento, não na hora."
      width="wide"
    >
      <p
        role="note"
        className="animate-rise rounded-2xl border-[1.5px] border-danger-300 bg-danger-50 px-4 py-3 text-sm"
      >
        <strong className="font-semibold text-danger-600">Mensagem não é para emergência.</strong> Se estiver
        em perigo agora, ligue 188 (CVV) ou 192 (SAMU).
      </p>

      <div className="animate-rise grid overflow-hidden rounded-3xl border border-border bg-card [animation-delay:80ms] md:grid-cols-[18rem_minmax(0,1fr)]">
        <section
          aria-label="Conversas"
          className="space-y-1 border-b border-border p-3 md:border-r md:border-b-0"
        >
          {chats.length === 0 ? (
            <div className="p-3">
              <p className="text-sm font-medium text-ink">Nenhuma conversa ativa</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Assim que você iniciar um atendimento, ele aparecerá aqui.
              </p>
            </div>
          ) : (
            <ul className="space-y-1">
              {chats.map((chat) => (
                <li key={chat.id}>
                  <button
                    type="button"
                    aria-current={chat.id === activeChatId}
                    onClick={() => setActiveChatId(chat.id)}
                    className={cn(
                      "flex min-h-16 w-full items-center gap-3 rounded-2xl p-3 text-left transition-colors focus-visible:ring-3 focus-visible:ring-brand-600/50 focus-visible:outline-none",
                      chat.id === activeChatId ? "bg-brand-50" : "hover:bg-canvas",
                    )}
                  >
                    <Avatar name={chat.doctorName} className="size-11" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink">{chat.doctorName}</span>
                      <span className="block text-xs text-brand-ink">{chat.specialty}</span>
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                        {chat.lastMessage}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {activeChat ? (
          <section
            aria-label={`Conversa com ${activeChat.doctorName}`}
            className="flex h-[620px] min-w-0 flex-col"
          >
            <header className="flex items-center gap-3 border-b border-border px-5 py-4">
              <Avatar name={activeChat.doctorName} className="size-10" />
              <div className="min-w-0">
                <h2 className="font-medium text-ink">{activeChat.doctorName}</h2>
                <p className="text-xs text-muted-foreground">
                  {activeChat.specialty} · demonstração: as respostas são de exemplo
                </p>
              </div>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
              {activeChat.messages.length === 0 ? (
                <div className="flex h-full items-center justify-center px-8 text-center">
                  <div>
                    <p className="text-base font-medium text-ink">Conversa iniciada</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Envie uma mensagem para começar este acompanhamento.
                    </p>
                  </div>
                </div>
              ) : (
                activeChat.messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "animate-rise max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                      message.sender === "user"
                        ? "ml-auto bg-primary text-primary-foreground"
                        : "mr-auto bg-sunken text-foreground",
                    )}
                  >
                    <p>{message.content}</p>
                    <span className="mt-1 block text-right text-xs opacity-75">{message.timestamp}</span>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-3 border-t border-border px-5 py-4">
              <div className="no-scrollbar flex gap-2 overflow-x-auto">
                {QUICK_REPLIES.map((reply) => (
                  <button
                    key={reply.label}
                    type="button"
                    onClick={() => setNewMessage(reply.text)}
                    className="min-h-10 shrink-0 rounded-full border border-border px-4 text-sm hover:border-brand-600 focus-visible:ring-3 focus-visible:ring-brand-600/50 focus-visible:outline-none"
                  >
                    {reply.label}
                  </button>
                ))}
              </div>
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <input
                  name="mensagem"
                  type="text"
                  maxLength={MESSAGE_MAX}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  aria-label="Mensagem"
                  placeholder="Escreva sua mensagem..."
                  className={cn(fieldControlClass, "flex-1")}
                />
                <Button type="submit" disabled={!newMessage.trim()}>
                  <Send />
                  Enviar
                </Button>
              </form>
              {error && (
                <p role="alert" className="text-xs text-danger-600">
                  {error}
                </p>
              )}
            </div>
          </section>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            <p className="font-medium text-ink">Nenhuma conversa selecionada.</p>
            <p className="mt-1 text-sm">Selecione uma conversa no painel lateral para continuar.</p>
          </div>
        )}
      </div>
    </Page>
  );
}
