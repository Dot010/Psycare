import { z } from "zod";
import { tooLong } from "@/lib/validation";

export const MESSAGE_MAX = 1200;

export const sendMessageSchema = z.object({
  chatId: z.string().min(1),
  content: z.string().trim().min(1, "Mensagem não pode estar vazia").max(MESSAGE_MAX, tooLong(MESSAGE_MAX)),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;

export interface MessageItem {
  id: string;
  sender: "user" | "doctor";
  content: string;
  timestamp: string;
}

export interface Chat {
  id: string;
  doctorName: string;
  specialty: string;
  lastMessage: string;
  messages: MessageItem[];
}
