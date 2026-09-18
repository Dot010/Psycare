import { ReactNode } from "react"

export interface DiaryEntry {
  id: string
  date: string
  mood: string
  title: string
  content: string
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
};

  ;
