export interface DiaryEntry {
  id: string
  date: string
  mood: string
  title: string
  content: string
}

export const mockUser = {
  name: "Jonathan",
  nextSession: {
    date: "Terça-feira, 08 de Setembro",
    time: "15:30h",
    doctor: "Dra. Amanda Silva",
  },  
  habitsSummary: "4 de 5 concluídos hoje",
  recentDiary: "Hoje me senti mais produtivo e focado...",
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
};

  ;
