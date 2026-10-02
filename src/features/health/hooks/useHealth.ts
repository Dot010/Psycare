"use client";

import { useUndo } from "@/components/feedback/UndoProvider";
import type { Exame, Medicamento, Sintoma } from "@/features/health/types";
import { insertAt, removeById, upsertById } from "@/lib/list";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { mockUser } from "@/mocks/user";

export const REMEDIOS_KEY = "psycare:remedios:v1";
export const SINTOMAS_KEY = "psycare:sintomas:v1";

export function useHealth() {
  const [remedios, setRemedios] = useLocalStorage<Medicamento[]>(REMEDIOS_KEY, mockUser.remedios);
  const [sintomas, setSintomas] = useLocalStorage<Sintoma[]>(SINTOMAS_KEY, mockUser.sintomas);
  const { showUndo } = useUndo();

  // Exames ainda não podem ser enviados: a lista é só leitura.
  const exames: Exame[] = mockUser.exames;

  const saveRemedio = (item: Medicamento) => setRemedios((current) => upsertById(current, item));
  const saveSintoma = (item: Sintoma) => setSintomas((current) => upsertById(current, item));

  const deleteRemedio = (id: string) => {
    const index = remedios.findIndex((item) => item.id === id);
    const removed = remedios[index];
    if (!removed) return;
    setRemedios((current) => removeById(current, id));
    showUndo({
      message: `Medicamento "${removed.nome}" excluído.`,
      onUndo: () => setRemedios((current) => insertAt(current, removed, index)),
    });
  };

  const deleteSintoma = (id: string) => {
    const index = sintomas.findIndex((item) => item.id === id);
    const removed = sintomas[index];
    if (!removed) return;
    setSintomas((current) => removeById(current, id));
    showUndo({
      message: "Sintoma excluído.",
      onUndo: () => setSintomas((current) => insertAt(current, removed, index)),
    });
  };

  return { remedios, sintomas, exames, saveRemedio, saveSintoma, deleteRemedio, deleteSintoma };
}
