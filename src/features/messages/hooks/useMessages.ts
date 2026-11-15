"use client";

import { useMemo, useState } from "react";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { mockUser } from "@/mocks/user";
import { demoReply, REPLY_DELAY_MS, withAllChats } from "@/features/messages/logic";
import type { Chat, MessageItem } from "@/features/messages/types";
import { sendMessageSchema, type SendMessageInput } from "@/features/messages/types";

export const CHATS_KEY = "psycare:chats:v1";

export function useMessages() {
  const [stored, setStored] = useLocalStorage<Chat[]>(CHATS_KEY, mockUser.chats);
  const chats = useMemo(() => withAllChats(stored, mockUser.chats), [stored]);
  const setChats = (update: (current: Chat[]) => Chat[]) =>
    setStored((current) => update(withAllChats(current, mockUser.chats)));
  const [activeChatId, setActiveChatId] = useState<string>(mockUser.chats?.[0]?.id || "");

  const activeChat = useMemo(
    () => chats.find((chat) => chat.id === activeChatId) || chats[0],
    [activeChatId, chats],
  );

  const sendMessage = (input: SendMessageInput) => {
    const parsed = sendMessageSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false as const, error: parsed.error.issues[0]?.message || "Mensagem inválida" };
    }

    const newMsg: MessageItem = {
      id: crypto.randomUUID(),
      sender: "user",
      content: parsed.data.content,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id === parsed.data.chatId) {
          return {
            ...chat,
            lastMessage: newMsg.content,
            messages: [...chat.messages, newMsg],
          };
        }

        return chat;
      }),
    );

    // Demonstração: o profissional "responde" sozinho. Na versão real, isto virá do servidor.
    const chatId = parsed.data.chatId;
    const reply = demoReply(parsed.data.content, chats.find((chat) => chat.id === chatId)?.doctorName);
    setTimeout(() => {
      const answer: MessageItem = {
        id: crypto.randomUUID(),
        sender: "doctor",
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId
            ? { ...chat, lastMessage: answer.content, messages: [...chat.messages, answer] }
            : chat,
        ),
      );
    }, REPLY_DELAY_MS);

    return { success: true as const };
  };

  return {
    chats,
    activeChat,
    activeChatId,
    setActiveChatId,
    sendMessage,
  };
}
