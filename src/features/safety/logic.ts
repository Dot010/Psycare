import type { SafetyContact, SafetyListKey, SafetyPlan } from "@/features/safety/types";

export const EMPTY_PLAN: SafetyPlan = { warnings: [], coping: [], places: [], safeEnv: [], contacts: [] };

export const MAX_ITEMS = 8;
export const MAX_CONTACTS = 6;
export const MAX_ITEM_LENGTH = 120;

export const SAFETY_SECTIONS: { key: SafetyListKey; title: string; hint: string; placeholder: string }[] = [
  {
    key: "warnings",
    title: "Sinais de que não estou bem",
    hint: "O que eu percebo em mim quando começa a piorar.",
    placeholder: "Ex.: durmo muito pouco",
  },
  {
    key: "coping",
    title: "O que me ajuda",
    hint: "Coisas pequenas que já funcionaram antes.",
    placeholder: "Ex.: respirar devagar por 3 minutos",
  },
  {
    key: "places",
    title: "Lugares e pessoas que me distraem",
    hint: "Onde eu posso estar para me sentir menos só.",
    placeholder: "Ex.: o parque perto de casa",
  },
  {
    key: "safeEnv",
    title: "Deixar o ambiente mais seguro",
    hint: "O que eu posso afastar de mim nos dias difíceis.",
    placeholder: "Ex.: pedir para alguém guardar o que pode me machucar",
  },
];

/** Acrescenta um item ao fim da lista: ignora vazio, repetido e o que passar do limite. */
export function addItem(list: string[], raw: string): string[] {
  const text = raw.replace(/\s+/g, " ").trim().slice(0, MAX_ITEM_LENGTH);
  if (text.length < 2 || list.length >= MAX_ITEMS) return list;
  if (list.some((item) => item.toLowerCase() === text.toLowerCase())) return list;
  return [...list, text];
}

export function removeItem(list: string[], index: number): string[] {
  return list.filter((_, i) => i !== index);
}

/** Só dígitos (e um + no começo): é o que o telefone do celular precisa para discar. */
export function cleanPhone(raw: string): string {
  const trimmed = raw.trim();
  const digits = trimmed.replace(/\D/g, "");
  return trimmed.startsWith("+") ? `+${digits}` : digits;
}

/** Um telefone válido tem de 8 a 13 dígitos (com ou sem DDD e código do país). */
export function isValidPhone(raw: string): boolean {
  const digits = cleanPhone(raw).replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 13;
}

export function phoneHref(raw: string): string {
  return `tel:${cleanPhone(raw)}`;
}

export function addContact(
  list: SafetyContact[],
  input: { name: string; role: string; phone: string },
  id: string,
): SafetyContact[] {
  const name = input.name.replace(/\s+/g, " ").trim().slice(0, 60);
  const role = input.role.replace(/\s+/g, " ").trim().slice(0, 40);
  if (name.length < 2 || !isValidPhone(input.phone) || list.length >= MAX_CONTACTS) return list;
  return [...list, { id, name, role, phone: input.phone.trim() }];
}

export function removeContact(list: SafetyContact[], id: string): SafetyContact[] {
  return list.filter((contact) => contact.id !== id);
}

export function isPlanEmpty(plan: SafetyPlan): boolean {
  return plan.contacts.length === 0 && SAFETY_SECTIONS.every((section) => plan[section.key].length === 0);
}
