/** Uma cobrança de atendimento. Cada uma é paga a um único profissional. */
export interface Charge {
  id: string;
  professionalId: string;
  description: string;
  /** Valor em reais. */
  amount: number;
  /** Data do atendimento (AAAA-MM-DD). */
  date: string;
  status: "paid" | "pending";
}
