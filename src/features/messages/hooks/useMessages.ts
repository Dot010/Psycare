"use client";

import { useMemo, useState } from "react";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { mockUser } from "@/mocks/user";
import type { Chat, MessageItem } from "@/features/messages/types";
import { sendMessageSchema, type SendMessageInput } from "@/features/messages/types";

export const CHATS_KEY = "psycare:chats:v1";

export function useMessages() {
  const [chats, setChats] = useLocalStorage<Chat[]>(CHATS_KEY, mockUser.chats);
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
