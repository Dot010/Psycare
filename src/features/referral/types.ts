/**
 * Encaminhamento para a psicóloga. É um papel entregue em mãos pelo psiquiatra, então o app só registra
 * as etapas: pedido, emitido (psiquiatra), autorizado pelo convênio e entregue à psicóloga.
 */
export type ReferralStage = "requested" | "issued" | "authorized" | "delivered";

export interface ReferralReminder {
  at: string;
  text: string;
}

export interface Referral {
  id: string;
  patientId: string;
  /** AAAA-MM-DD. */
  requestedAt: string;
  note?: string;
  issuedAt?: string;
  insurance?: string;
  sessions?: number;
  authorizedAt?: string;
  deliveredAt?: string;
  canceled?: boolean;
  /** Lembretes gentis que a psicóloga enviou. */
  reminders: ReferralReminder[];
}
