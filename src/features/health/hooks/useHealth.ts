"use client";

import { useMemo } from "react";
import { useUndo } from "@/components/feedback/UndoProvider";
import { grantWater } from "@/features/garden/water";
import { normalizeSintoma, toggleKey } from "@/features/health/logic";
import type { Exame, Medicamento, Sintoma } from "@/features/health/types";
import { toISODate } from "@/lib/dates";
import { insertAt, removeById, upsertById } from "@/lib/list";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { mockUser } from "@/mocks/user";

export const REMEDIOS_KEY = "psycare:remedios:v1";
export const SINTOMAS_KEY = "psycare:sintomas:v1";
export const EXAMES_KEY = "psycare:exames:v1";
/** Doses marcadas como tomadas: "idDoRemédio|AAAA-MM-DD|HH:MM". */
export const DOSES_KEY = "psycare:doses:v1";

const NO_EXAMES: Exame[] = [];
const NO_DOSES: string[] = [];

export function useHealth() {
  const [remedios, setRemedios] = useLocalStorage<Medicamento[]>(REMEDIOS_KEY, mockUser.remedios);
  const [rawSintomas, setSintomas] = useLocalStorage<Sintoma[]>(SINTOMAS_KEY, mockUser.sintomas);
  const [exames, setExames] = useLocalStorage<Exame[]>(EXAMES_KEY, NO_EXAMES);
  const [taken, setTaken] = useLocalStorage<string[]>(DOSES_KEY, NO_DOSES);
  const { showUndo } = useUndo();

  const sintomas = useMemo(() => rawSintomas.map(normalizeSintoma), [rawSintomas]);

  const saveRemedio = (item: Medicamento) => setRemedios((current) => upsertById(current, item));
  const saveSintoma = (item: Sintoma) => setSintomas((current) => upsertById(current, item));
  const saveExame = (item: Exame) => setExames((current) => upsertById(current, item));

  /** Marca ou desmarca uma dose. A primeira dose marcada no dia rende uma gota para o jardim. */
  const toggleDose = (key: string, date: string) => {
    const wasTaken = taken.includes(key);
    setTaken((current) => toggleKey(current, key));
    if (!wasTaken) grantWater("habit", `dose-${date}`);
  };

  /** Registra vários sintomas de hoje com a mesma intensidade. Repetir o mesmo sintoma no dia atualiza o registro. */
  const logSymptoms = (names: string[], intensidade: number, nota = "") => {
    const date = toISODate(new Date());
    setSintomas((current) => {
      let next = current.map(normalizeSintoma);
      for (const name of names) {
        const existing = next.find(
          (s) => s.data === date && s.descricao.toLowerCase() === name.toLowerCase(),
        );
        const item: Sintoma = {
          id: existing?.id ?? crypto.randomUUID(),
          descricao: name,
          data: date,
          nota: nota || existing?.nota || "",
          intensidade,
        };
        next = upsertById(next, item);
      }
      return next;
    });
  };

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
    setSintomas((current) => removeById(current.map(normalizeSintoma), id));
    showUndo({
      message: "Sintoma excluído.",
      onUndo: () => setSintomas((current) => insertAt(current.map(normalizeSintoma), removed, index)),
    });
  };

  const deleteExame = (id: string) => {
    const index = exames.findIndex((item) => item.id === id);
    const removed = exames[index];
    if (!removed) return;
    setExames((current) => removeById(current, id));
    showUndo({
      message: `Exame "${removed.titulo}" excluído.`,
      onUndo: () => setExames((current) => insertAt(current, removed, index)),
    });
  };

  return {
    remedios,
    sintomas,
    exames,
    taken,
    saveRemedio,
    saveSintoma,
    saveExame,
    toggleDose,
    logSymptoms,
    deleteRemedio,
    deleteSintoma,
    deleteExame,
  };
}
