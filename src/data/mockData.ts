import { ReactNode } from "react"

export interface DiaryEntry {
  id: string
  date: string
  mood: string
  title: string
  content: string
}
export interface MessageItem {
  id: string
  sender: "user" | "doctor"
  content: string
  timestamp: string

}

export interface Chat {
  id: string
  doctorName: string
  specialty: string
  avatarUrl: string
  lastMessage: string
  messages: MessageItem[]
}
export interface Medicamento{
  id: string
  nome: string
  dosagem: string
  frequencia: string
  horario: string
}

export interface Exame{
  id: string
  titulo: string
  data: string
  resultado: string
}
export interface Sintoma {
  id: string;
  descricao: string;
  data: string;
  nota: string;
}
export interface HealthData {
  habits: Habit[]
  diaryEntries: DiaryEntry[]
  agendamentos: Agendamento[]
  remedios: Medicamento[]
  exames: Exame[]
  sintomas: Sintoma[]
}
  export interface Habit{
    description?: ReactNode
    name?: ReactNode
    id: string
    title: string
    category: string
    completedToday?: boolean
    streak: number
  }
export type Agendamento = {
  id: string
  profissional: string
  data: string
  hora: string
  status: "pendente" | "confirmado" | "cancelado"
  tipo: 'online' | 'presencial'
}
export const mockUser = {
  name: "Jonathan",
  nextSession: {
    date: "Terça-feira, 08 de Setembro",
    time: "15:30h",
    doctor: "Dra. Amanda Silva",
  },  
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
    
  ],
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
      nome: "topiramato",
      dosagem: "100mg",
      frequencia: "Diária",
      horario: "20:00",
    }

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
      descricao: "Hemorrágia bucal",
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
  mensagens : [
    {
      id: "1",
      sender: "user",
      content: "Olá, doutora!",
      timestamp: "03/09/2026 08:00",
    },
    {
      id: "2",
      sender: "doctor",
      content: "Olá, Jonathan! Como você está se sentindo hoje?",
      timestamp: "03/09/2026 08:05",
    }
  ] as MessageItem[],
  chats: [
    {
      id: "1",
      doctorName: "Dra. Amanda Silva",
      specialty: "Cardiologia",
      avatarUrl: "https://example.com/avatar.jpg",
      lastMessage: "Olá, Jonathan! Como você está se sentindo hoje?",
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
          content: "Olá, Jonathan! Como você está se sentindo hoje?",
          timestamp: "03/09/2026 08:05",
        }
      ]
    },
   
  ] as Chat[],
  


  
  
};

  ;
