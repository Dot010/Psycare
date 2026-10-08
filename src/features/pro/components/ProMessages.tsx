"use client";

import { Send } from "lucide-react";
import { useState } from "react";
import { DemoNotice } from "@/components/feedback/DemoNotice";
import { Page } from "@/components/layout/Page";
import { Button } from "@/components/ui/button";
import { CHATS_KEY } from "@/features/messages/hooks/useMessages";
import { sendMessageSchema, type Chat } from "@/features/messages/types";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { cn } from "@/lib/utils";
import { mockUser } from "@/mocks/user";
import { LIVE_PATIENT_ID, PATIENTS } from "../data";

export default function ProMessages() {
  const [chats, setChats] = useLocalStorage<Chat[]>(CHATS_KEY, mockUser.chats);
  const [text, setText] = useState("");
  const chat = chats[0];
  const live = PATIENTS.find((p) => p.id === LIVE_PATIENT_ID);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = sendMessageSchema.safeParse({ chatId: chat?.id ?? "", content: text });
    if (!parsed.success || !chat) return;
    const message = {
      id: crypto.randomUUID(),
      sender: "doctor" as const,
      content: parsed.data.content,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setChats((current) =>
      current.map((c) =>
        c.id === chat.id ? { ...c, lastMessage: message.content, messages: [...c.messages, message] } : c,
      ),
    );
    setText("");
  };

  return (
    <Page title="Mensagens" description="Conversas com os seus pacientes." width="narrow">
      <DemoNotice>
        Só a conversa com o paciente de demonstração existe. Ela aparece para ele neste navegador.
      </DemoNotice>
      {!chat ? (
        <p className="text-base text-muted-foreground">Nenhuma conversa ainda.</p>
      ) : (
        <section aria-label={`Conversa com ${live?.name}`} className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold text-brand-ink">{live?.name}</h2>
          <div className="space-y-3">
            {chat.messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "max-w-[80%] rounded-xl p-3 text-sm",
                  m.sender === "doctor"
                    ? "ml-auto bg-brand-800 text-white"
                    : "mr-auto bg-sunken text-foreground",
                )}
              >
                <p>{m.content}</p>
                <span className="mt-1 block text-right text-xs opacity-75">{m.timestamp}</span>
              </div>
            ))}
          </div>
          <form onSubmit={send} className="flex items-center gap-2 border-t border-border pt-3">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              aria-label="Mensagem"
              placeholder="Escreva sua mensagem..."
              maxLength={1200}
              className="h-11 flex-1 rounded-lg border border-border bg-card px-3"
            />
            <Button type="submit" disabled={!text.trim()}>
              <Send />
              Enviar
            </Button>
          </form>
        </section>
      )}
    </Page>
  );
}
