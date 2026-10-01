import { z } from "zod";

export const sendMessageSchema = z.object({
  chatId: z.string().min(1),
  content: z.string().trim().min(1, "Mensagem não pode estar vazia").max(1200),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
