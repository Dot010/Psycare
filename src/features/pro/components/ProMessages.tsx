"use client";

import { Send } from "lucide-react";
import { useState } from "react";
import { DemoNotice } from "@/components/feedback/DemoNotice";
import { Page } from "@/components/layout/Page";
import { Button } from "@/components/ui/button";
import { CHATS_KEY } from "@/features/messages/hooks/useMessages";
import { withAllChats } from "@/features/messages/logic";
import { MESSAGE_MAX, sendMessageSchema, type Chat, type MessageItem } from "@/features/messages/types";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { cn } from "@/lib/utils";
import { mockUser } from "@/mocks/user";
import { LIVE_PATIENT_ID, PATIENTS } from "../data";
import { useProIdentity } from "./ProIdentity";

/** Conversas com os pacientes de exemplo: ficam só do lado do profissional (ninguém responde). */
export const PRO_CHATS_KEY = "psycare:pro:chats:v1";
const NO_CHATS: Record<string, MessageItem[]> = {};

/**
 * Mensagens do profissional: a lista de pacientes e a conversa com cada um.
 * A do paciente de demonstração é a mesma que ele vê; cada profissional tem a sua.
 */
export default function ProMessages() {
  const me = useProIdentity();
  const [stored, setChats] = useLocalStorage<Chat[]>(CHATS_KEY, mockUser.chats);
  const [others, setOthers] = useLocalStorage<Record<string, MessageItem[]>>(PRO_CHATS_KEY, NO_CHATS);
  const [selected, setSelected] = useState(LIVE_PATIENT_ID);
  const [text, setText] = useState("");

  const liveChat = withAllChats(stored, mockUser.chats).find((c) => c.doctorName === me.name);
  const key = `${me.id}:${selected}`;
  const messages = selected === LIVE_PATIENT_ID ? (liveChat?.messages ?? []) : (others[key] ?? []);
  const patient = PATIENTS.find((p) => p.id === selected);
  const lastOf = (patientId: string) =>
    (patientId === LIVE_PATIENT_ID ? liveChat?.messages : others[`${me.id}:${patientId}`])?.at(-1)?.content;

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = sendMessageSchema.safeParse({ chatId: liveChat?.id ?? "x", content: text });
    if (!parsed.success) return;
    const message: MessageItem = {
      id: crypto.randomUUID(),
      sender: "doctor",
      content: parsed.data.content,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    if (selected === LIVE_PATIENT_ID) {
      if (!liveChat) return;
      setChats((current) =>
        withAllChats(current, mockUser.chats).map((c) =>
          c.id === liveChat.id
            ? { ...c, lastMessage: message.content, messages: [...c.messages, message] }
            : c,
        ),
      );
    } else {
      setOthers((current) => ({ ...current, [key]: [...(current[key] ?? []), message] }));
    }
    setText("");
  };

  return (
    <Page title="Mensagens" description="Conversas com os seus pacientes." width="wide">
      <DemoNotice>
        Só o paciente de demonstração recebe as mensagens (neste navegador). Os outros são de exemplo.
      </DemoNotice>
      <div className="grid items-start gap-6 md:grid-cols-[16rem_minmax(0,1fr)]">
        <nav aria-label="Pacientes">
          <ul className="flex gap-2 overflow-x-auto md:block md:space-y-1">
            {PATIENTS.map((p) => (
              <li key={p.id} className="shrink-0">
                <button
                  type="button"
                  aria-current={selected === p.id}
                  onClick={() => setSelected(p.id)}
                  className={cn(
                    "w-full min-w-40 rounded-2xl px-4 py-3 text-left transition-colors focus-visible:ring-3 focus-visible:ring-brand-600/50 focus-visible:outline-none",
                    selected === p.id ? "bg-brand-50" : "hover:bg-sunken",
                  )}
                >
                  <span className="block font-medium text-foreground">{p.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {lastOf(p.id) ?? "Nenhuma mensagem ainda"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <section aria-label={`Conversa com ${patient?.name}`} className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold text-brand-ink">{patient?.name}</h2>
          {messages.length === 0 ? (
            <p className="text-base text-muted-foreground">Nenhuma mensagem ainda. Escreva a primeira.</p>
          ) : (
            <div className="space-y-3">
              {messages.map((m) => (
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
          )}
          <form onSubmit={send} className="flex items-center gap-2 border-t border-border pt-3">
            <input
              name="mensagem"
              value={text}
              onChange={(e) => setText(e.target.value)}
              aria-label="Mensagem"
              placeholder="Escreva sua mensagem..."
              maxLength={MESSAGE_MAX}
              className="h-11 flex-1 rounded-lg border border-border bg-card px-3"
            />
            <Button type="submit" disabled={!text.trim()}>
              <Send />
              Enviar
            </Button>
          </form>
        </section>
      </div>
    </Page>
  );
}
