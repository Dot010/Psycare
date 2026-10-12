import type { Agendamento } from "@/features/appointments/types";
import type { Chat } from "@/features/messages/types";
import type { DiaryEntry } from "@/features/diary/types";
import type { Medicamento, Sintoma } from "@/features/health/types";
import type { Habit } from "@/features/habits/types";

export const mockUser = {
  habits: [
    {
      id: "1",
      title: "Treinar 2 horas",
      category: "Saúde",
      streak: 5,
    },
    {
      id: "2",
      title: "Levar o cachorro para passear",
      category: "Saúde",
      streak: 0,
    },
    {
      id: "3",
      title: "Estudar 2 horas",
      category: "Estudo",
      streak: 0,
    },
  ] as Habit[],

  diaryEntries: [
    {
      id: "1",
      date: "2026-09-03",
      mood: "Motivado",
      title: "Progresso no Dashboard",
      content: "Consegui estruturar o modal e resolver os erros de rota do Next.js.",
      anxietyLevel: 2,
    },
    {
      id: "2",
      date: "2026-09-02",
      mood: "Calmo",
      title: "Estudos de Frontend",
      content: "Dia focado em entender melhor os componentes de cliente e servidor no App Router.",
      anxietyLevel: 1,
    },
    {
      id: "3",
      date: "2026-09-01",
      mood: "Ansioso",
      title: "Desafios da semana",
      content: "Senti-me um pouco sobrecarregado com as tarefas, mas consegui organizar melhor meu tempo.",
      anxietyLevel: 4,
      discussInSession: true,
    },
  ] as DiaryEntry[],

  agendamentos: [
    {
      id: "1",
      profissional: "Dra. Helena Prado",
      data: "2026-10-15",
      hora: "15:30",
      status: "confirmado",
      tipo: "online",
    },
    {
      id: "2",
      profissional: "Dr. Rafael Nunes",
      data: "2026-10-20",
      hora: "10:00",
      status: "pendente",
      tipo: "presencial",
    },
    {
      id: "3",
      profissional: "Dra. Helena Prado",
      data: "2026-09-08",
      hora: "15:30",
      status: "confirmado",
      tipo: "online",
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

  chats: [
    {
      id: "1",
      doctorName: "Dra. Helena Prado",
      specialty: "Psicologia",
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
