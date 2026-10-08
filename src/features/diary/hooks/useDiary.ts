"use client";

import { useUndo } from "@/components/feedback/UndoProvider";
import { grantWater } from "@/features/garden/water";
import type { DiaryEntry } from "@/features/diary/types";
import { insertAt, removeById, upsertById } from "@/lib/list";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { mockUser } from "@/mocks/user";

export const DIARY_KEY = "psycare:diary:v1";

export function useDiary() {
  const [entries, setEntries] = useLocalStorage<DiaryEntry[]>(DIARY_KEY, mockUser.diaryEntries);
  const { showUndo } = useUndo();

  const saveEntry = (entry: DiaryEntry) => {
    const isNew = !entries.some((item) => item.id === entry.id);
    setEntries((current) => upsertById(current, entry));
    if (isNew) grantWater("diary");
  };

  const deleteEntry = (id: string) => {
    const index = entries.findIndex((entry) => entry.id === id);
    const removed = entries[index];
    if (!removed) return;
    setEntries((current) => removeById(current, id));
    showUndo({
      message: "Registro excluído.",
      onUndo: () => setEntries((current) => insertAt(current, removed, index)),
    });
  };

  return { entries, saveEntry, deleteEntry };
}
