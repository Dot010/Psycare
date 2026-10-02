/** Funções puras para listas de itens com `id`. Sempre devolvem uma lista nova. */

interface WithId {
  id: string;
}

export function removeById<T extends WithId>(list: T[], id: string): T[] {
  return list.filter((item) => item.id !== id);
}

/** Troca o item que tem o mesmo id; se não existir, coloca o novo no começo. */
export function upsertById<T extends WithId>(list: T[], item: T): T[] {
  return list.some((current) => current.id === item.id)
    ? list.map((current) => (current.id === item.id ? item : current))
    : [item, ...list];
}

/** Recoloca um item na posição em que estava (usado ao desfazer uma exclusão). */
export function insertAt<T extends WithId>(list: T[], item: T, index: number): T[] {
  if (list.some((current) => current.id === item.id)) return list;
  const next = [...list];
  next.splice(Math.min(Math.max(index, 0), next.length), 0, item);
  return next;
}
