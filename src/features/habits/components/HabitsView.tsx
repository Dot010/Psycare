"use client";

import { useState } from "react";
import { mockUser } from "@/data/mockData";
import type { Habit } from "@/types/domain";
import { NewHabitModal } from "@/features/habits/components/NewHabitModal";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { TiltCard } from "@/components/ui/TiltCard";


const HabitPage = () => {
  const [habits, setHabits] = useState<Habit[]>([...(mockUser.habits || [])]);

  const handleAddHabit = (newHabit: Habit) => {
    setHabits((prevHabits) => [...prevHabits, newHabit]);
  };

  const handleRemoveHabit = ( id: string) => {
    setHabits((prevHabits) => prevHabits.filter((habit) => habit.id !== id));
  }



const toggleHabit = (id: string) => {
  setHabits((prevHabits) =>
    prevHabits.map((habit) =>
      habit.id === id
        ? { ...habit, completedToday: !habit.completedToday }
        : habit
    )
  );
};
  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto bg-slate-50 min-h-screen font-sans">
      <div className="flex justify-between items-center">
        <div>
          <AnimatedText as="h1" text="Meus Hábitos" className="text-3xl font-bold text-slate-800" />
          <p className="text-sm text-slate-500 mt-1 ">
            Registre seus hábitos e acompanhe sua evolução
          </p>
        </div>
        <NewHabitModal onAddHabit={handleAddHabit} />

      </div>
        {/* Contadores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TiltCard className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <p className="text-xs text-slate-500 uppercase font-bold">Concluidos Hoje</p>
          <p className="text-2xl text-slate-800 mt-1 font-black">
            {habits.filter((h) => h.completedToday).length / habits.length}
          </p>
        </TiltCard>
        {/* Taxa de Sucesso */}
        <TiltCard className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <p className="text-xs text-slate-500 uppercase font-bold">Taxa de Sucesso</p>
          <p className="text-2xl text-emerald-600 mt-1 font-black">
            {habits.length > 0
            ? (habits.filter((h) => h.completedToday).length / habits.length) * 100
            : 0} %
          </p>
        </TiltCard>
{/* Maior Sequencia */}
         <TiltCard className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <p className="text-xs text-slate-500 uppercase font-bold">Maior Sequencia</p>
            <p className="text-2xl text-amber-500 mt-1 font-black">
              🔥 {habits.length > 0 ? Math.max(...habits.map((h) => h.streak), 0) : 0} dias
          </p>
        </TiltCard>
        </div>

      <div className="space-y-3">
        {habits.map((habit) => (
          <div
            key={habit.id}
            className={`p-4 border rounded-xl flex justify-between items-center shadow-sm ${
              habit.completedToday
                ? " bg-emerald-50 border-emerald-200"
                : "bg-white border-slate-200"
            }`}
          >
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {habit.category}
              </span>
              <p
                className={`font-bold text-lg ${habit.completedToday ? "line-through text-slate-400" : "text-slate-800"}`}
              >
                {habit.title}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <span
                className="font-bold text-amber-500 bg-amber-50 px-2 py-1
                rounded-md text-sm"
              >🔥{habit.streak}d</span>
              <MagneticButton onClick={() => toggleHabit(habit.id)}
                className={`w-8 h-8 rounded-full border-2 transition-colors flex items-center justify-center font-bold 
                ${habit.completedToday ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white border-slate-200 text-slate-500"}}`}
              >
                {habit.completedToday ? "👍" : "👎"}
                
              </MagneticButton>
              
              <MagneticButton onClick={() => handleRemoveHabit(habit.id)} className="w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-slate-500 border-slate-200">
                🗑️
              </MagneticButton>

            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
};

export default HabitPage;
