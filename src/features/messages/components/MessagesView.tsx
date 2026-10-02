"use client";

import { Send } from "lucide-react";
import { useState } from "react";
import { Page } from "@/components/layout/Page";
import { Button } from "@/components/ui/button";
import { fieldControlClass } from "@/components/ui/input";
import { useMessages } from "@/features/messages/hooks/useMessages";
import { cn } from "@/lib/utils";

const QUICK_REPLIES = [
  { label: "Dúvida remédio", text: "Tenho uma dúvida sobre a medicação: " },
  { label: "Enviar exame", text: "Gostaria de enviar o resultado de um exame: " },
  { label: "Sintoma novo", text: "Estou sentindo o seguinte sintoma novo: " },
];

const panelClass = "rounded-2xl border border-slate-200 bg-white shadow-sm";

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
        "flex shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-800",
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
    <Page title="Minhas Mensagens" description="Converse com a sua equipe médica." width="wide">
      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-12">
        <section aria-label="Conversas" className={cn(panelClass, "space-y-3 p-4 md:col-span-4")}>
          <h2 className="px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Conversas</h2>

          {chats.length === 0 ? (
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-sm font-medium text-ink">Nenhuma conversa ativa</p>
              <p className="mt-1 text-xs text-slate-600">Assim que você iniciar um atendimento, ele aparecerá aqui.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {chats.map((chat) => (
                <li key={chat.id}>
                  <button
                    type="button"
                    aria-current={chat.id === activeChatId}
                    onClick={() => setActiveChatId(chat.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors",
                      chat.id === activeChatId ? "border-brand-200 bg-brand-50" : "border-transparent hover:bg-slate-50",
                    )}
                  >
                    <Avatar name={chat.doctorName} className="size-11" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-ink">{chat.doctorName}</span>
                      <span className="block text-xs font-medium text-brand-800">{chat.specialty}</span>
                      <span className="mt-0.5 block truncate text-xs text-slate-500">{chat.lastMessage}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {activeChat ? (
          <section aria-label={`Conversa com ${activeChat.doctorName}`} className={cn(panelClass, "flex h-[600px] flex-col p-6 md:col-span-8")}>
            <header className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <Avatar name={activeChat.doctorName} className="size-10" />
              <div>
                <h2 className="font-semibold text-ink">{activeChat.doctorName}</h2>
                <p className="text-xs font-medium text-brand-800">{activeChat.specialty}</p>
              </div>
            </header>

            <div className="my-2 flex-1 space-y-3 overflow-y-auto p-2">
              {activeChat.messages.length === 0 ? (
                <div className="flex h-full items-center justify-center px-8 text-center">
                  <div>
                    <p className="text-base font-medium text-ink">Conversa iniciada</p>
                    <p className="mt-1 text-sm text-slate-600">Envie uma mensagem para começar este acompanhamento.</p>
                  </div>
                </div>
              ) : (
                activeChat.messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "max-w-[75%] rounded-xl p-3 text-sm",
                      message.sender === "user" ? "ml-auto bg-brand-800 text-white" : "mr-auto bg-slate-100 text-slate-800",
                    )}
                  >
                    <p>{message.content}</p>
                    <span className="mt-1 block text-right text-[10px] opacity-75">{message.timestamp}</span>
                  </div>
                ))
              )}
            </div>

            <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1 pt-2">
              {QUICK_REPLIES.map((reply) => (
                <Button
                  key={reply.label}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setNewMessage(reply.text)}
                  className="h-8 rounded-full px-3 text-xs"
                >
                  {reply.label}
                </Button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-slate-100 pt-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                aria-label="Mensagem"
                placeholder="Escreva sua mensagem..."
                className={cn(fieldControlClass, "h-10 flex-1")}
              />
              <Button type="submit" disabled={!newMessage.trim()}>
                <Send />
                Enviar
              </Button>
            </form>

            {error && (
              <p role="alert" className="mt-2 text-xs text-red-600">
                {error}
              </p>
            )}
          </section>
        ) : (
          <div className={cn(panelClass, "p-8 text-center text-slate-500 md:col-span-8")}>
            <p className="font-medium text-ink">Nenhuma conversa selecionada.</p>
            <p className="mt-1 text-sm">Selecione uma conversa no painel lateral para continuar.</p>
          </div>
        )}
      </div>
    </Page>
  );
}
