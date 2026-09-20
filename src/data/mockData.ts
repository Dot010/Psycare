import { ReactNode } from "react";


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

export interface HealthData {
  habits: Habit[];
  diaryEntries: DiaryEntry[];
  agendamentos: Agendamento[];
  remedios: Medicamento[];
  exames: Exame[];
  sintomas: Sintoma[];
}

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



export const mockUser = {
  name: "Usuário Demonstração",
  
  nextSession: {
    date: "Terça-feira, 08 de Setembro",
    time: "15:30h",
    doctor: "Dra. Amanda Silva",
    getSummary: (userName: string) => `Plano de acompanhamento individual de ${userName}`,
  },

  subscription: {
    planName: "Plano PsyCare Premium",
    price: 49.90,
    billingCycle: "mensal",
    nextBillingDate: "08/10/2026",
    status: "active",
  } as Subscription,

  paymentMethods: [
    {
      id: "1",
      type: "credit_card",
      brand: "Visa",
      last4: "1234",
      expiry: "12/26",
      isDefault: true,
    },
    {
      id: "2",
      type: "pix",
      pixKey: "meu-pix@exemplo.com",
      isDefault: false,
    },
  ] as PaymentMethod[],

  invoices: [
    {
      id: "1",
      description: "Assinatura Mensal - Setembro",
      amount: 49.90,
      date: "01/09/2026",
      status: "paid",
      pdfUrl: "https://example.com/invoice-september.pdf",
    },
    {
      id: "2",
      description: "Assinatura Mensal - Outubro",
      amount: 49.90,
      date: "01/10/2026",
      status: "pending",
      pdfUrl: "https://example.com/invoice-october.pdf",
    },
  ] as Invoice[],

  habits: [
    {
      id: "1",
      title: "Treinar 2 horas",
      category: "Saúde",
      completedToday: true,
      streak: 5,
    },
    {
      id: "2",
      title: "Levar o cachorro para passear",
      category: "Saúde",
      completedToday: false,
      streak: 0,
    },
    {
      id: "3",
      title: "Estudar 2 horas",
      category: "Estudo",
      completedToday: false,
      streak: 0,
    },
  ] as Habit[],

  diaryEntries: [
    {
      id: "1",
      date: "03 de Setembro, 2026",
      mood: "Motivado",
      title: "Progresso no Dashboard",
      content: "Consegui estruturar o modal e resolver os erros de rota do Next.js.",
    },
    {
      id: "2",
      date: "02 de Setembro, 2026",
      mood: "Calmo",
      title: "Estudos de Frontend",
      content: "Dia focado em entender melhor os componentes de cliente e servidor no App Router.",
    },
    {
      id: "3",
      date: "01 de Setembro, 2026",
      mood: "Ansioso",
      title: "Desafios da semana",
      content: "Senti-me um pouco sobrecarregado com as tarefas, mas consegui organizar melhor meu tempo.",
    },
  ] as DiaryEntry[],

  agendamentos: [
    {
      id: "1",
      profissional: "Dra. Amanda Silva",
      data: "08/09/2026",
      hora: "15:30",
      status: "confirmado",
      tipo: "online",
    },
    {
      id: "2",
      profissional: "Dr. Carlos Pereira",
      data: "09/09/2026",
      hora: "10:00",
      status: "pendente",
      tipo: "presencial",
    },
  ] as Agendamento[],

  remedios: [
    {
      id: "1",
      nome: "Lyberdia",
      dosagem: "70mg",
      frequencia: "Diária",
      horario: "08:00",
    },
    {
      id: "2",
      nome: "Topiramato",
      dosagem: "100mg",
      frequencia: "Diária",
      horario: "20:00",
    },
  ] as Medicamento[],

  exames: [
    {
      id: "1",
      titulo: "Exame de sangue",
      data: "01/09/2026",
      resultado: "Normal",
    },
    {
      id: "2",
      titulo: "Exame de urina",
      data: "05/09/2026",
      resultado: "Normal",
    },
  ] as Exame[],

  sintomas: [
    {
      id: "1",
      descricao: "Hemorragia bucal",
      data: "03/09/2026",
      nota: "Leve",
    },
    {
      id: "2",
      descricao: "Dor de cabeça",
      data: "04/09/2026",
      nota: "Moderada",
    },
  ] as Sintoma[],

  mensagens: [
    {
      id: "1",
      sender: "user",
      content: "Olá, doutora!",
      timestamp: "03/09/2026 08:00",
    },
    {
      id: "2",
      sender: "doctor",
      content: "Olá! Como você está se sentindo hoje?",
      timestamp: "03/09/2026 08:05",
    },
  ] as MessageItem[],

  chats: [
    {
      id: "1",
      doctorName: "Dra. Amanda Silva",
      specialty: "Cardiologia",
      avatarUrl: "https://example.com/avatar.jpg",
      lastMessage: "Olá! Como você está se sentindo hoje?",
      messages: [
        {
          id: "1",
          sender: "user",
          content: "Olá, doutora!",
          timestamp: "03/09/2026 08:00",
        },
        {
          id: "2",
          sender: "doctor",
          content: "Olá! Como você está se sentindo hoje?",
          timestamp: "03/09/2026 08:05",
        },
      ],
    },
  ] as Chat[],
};



export const getMockUser = (userName?: string) => {
  const activeName = userName && userName.trim() !== "" ? userName : mockUser.name;

  return {
    ...mockUser,
    name: activeName,
    chats: mockUser.chats.map((chat) => ({
      ...chat,
      lastMessage: chat.lastMessage.replace(/Jonathan/g, activeName),
      messages: chat.messages.map((msg) => ({
        ...msg,
        content: msg.content.replace(/Jonathan/g, activeName),
      })),
    })),
    mensagens: mockUser.mensagens.map((msg) => ({
      ...msg,
      content: msg.content.replace(/Jonathan/g, activeName),
    })),
  };
};