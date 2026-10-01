import type { ReactNode } from "react";

export interface DiaryEntry {
  id: string;
  date: string;
  mood: string;
  title: string;
  content: string;
}

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
  avatarUrl: string;
  lastMessage: string;
  messages: MessageItem[];
}

export interface Medicamento {
  id: string;
  nome: string;
  dosagem: string;
  frequencia: string;
  horario: string;
}

export interface Exame {
  id: string;
  titulo: string;
  data: string;
  resultado: string;
}

export interface Sintoma {
  id: string;
  descricao: string;
  data: string;
  nota: string;
}

export interface Habit {
  id: string;
  title: string;
  category: string;
  completedToday?: boolean;
  streak: number;
  description?: ReactNode;
  name?: ReactNode;
}

export type Agendamento = {
  id: string;
  profissional: string;
  data: string;
  hora: string;
  status: "pendente" | "confirmado" | "cancelado";
  tipo: "online" | "presencial";
};

export interface PaymentMethod {
  id: string;
  type: "credit_card" | "debit_card" | "pix";
  brand?: string;
  last4?: string;
  expiry?: string;
  pixKey?: string;
  isDefault: boolean;
}

export interface Invoice {
  id: string;
  description: string;
  amount: number;
  date: string;
  status: "paid" | "pending" | "failed";
  pdfUrl?: string;
}

export interface Subscription {
  planName: string;
  price: number;
  billingCycle: "mensal" | "anual";
  nextBillingDate: string;
  status: "active" | "canceled";
}
