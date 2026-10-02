export interface Habit {
  id: string;
  title: string;
  category: string;
  completedToday?: boolean;
  streak: number;
}
