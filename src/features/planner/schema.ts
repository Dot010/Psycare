import { z } from "zod";
import { tooLong } from "@/lib/validation";

export const TASK_TITLE_MAX = 80;

/** Título da tarefa: junta espaços repetidos, tira os das pontas e exige de 1 a 80 caracteres. */
export const taskTitleSchema = z
  .string()
  .transform((value) => value.replace(/\s+/g, " ").trim())
  .pipe(z.string().min(1, "Escreva o que precisa ser feito").max(TASK_TITLE_MAX, tooLong(TASK_TITLE_MAX)));
