import { z } from "zod";

/** Tamanhos máximos dos campos de texto da Saúde. Os formulários usam os mesmos números no `maxLength`. */
export const HEALTH_LIMITS = {
  medNome: 60,
  medDosagem: 40,
  medObservacao: 60,
  sintomaDescricao: 100,
  sintomaNota: 200,
  exameTitulo: 80,
  exameResultado: 300,
} as const;

/** AAAA-MM-DD que existe de verdade no calendário (recusa 2026-02-31, por exemplo). */
function isRealDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

const isoDate = (message: string) => z.string().refine(isRealDate, message);

const tooLong = (max: number) => `Use até ${max} caracteres`;

export const medicamentoSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(2, "Informe o nome do remédio")
    .max(HEALTH_LIMITS.medNome, tooLong(HEALTH_LIMITS.medNome)),
  dosagem: z
    .string()
    .trim()
    .min(1, "Informe a dosagem")
    .max(HEALTH_LIMITS.medDosagem, tooLong(HEALTH_LIMITS.medDosagem)),
  observacao: z
    .string()
    .trim()
    .max(HEALTH_LIMITS.medObservacao, tooLong(HEALTH_LIMITS.medObservacao))
    .optional(),
});

export const sintomaSchema = z.object({
  descricao: z
    .string()
    .trim()
    .min(2, "Descreva o sintoma")
    .max(HEALTH_LIMITS.sintomaDescricao, tooLong(HEALTH_LIMITS.sintomaDescricao)),
  nota: z.string().trim().max(HEALTH_LIMITS.sintomaNota, tooLong(HEALTH_LIMITS.sintomaNota)).optional(),
  data: isoDate("Escolha uma data"),
});

export const exameSchema = z.object({
  titulo: z
    .string()
    .trim()
    .min(2, "Dê um nome ao exame.")
    .max(HEALTH_LIMITS.exameTitulo, tooLong(HEALTH_LIMITS.exameTitulo)),
  data: isoDate("Escolha a data do exame."),
  resultado: z
    .string()
    .trim()
    .max(HEALTH_LIMITS.exameResultado, tooLong(HEALTH_LIMITS.exameResultado))
    .optional(),
});
