"use client";

import { addContact, addItem, EMPTY_PLAN, removeContact, removeItem } from "@/features/safety/logic";
import type { SafetyListKey, SafetyPlan } from "@/features/safety/types";
import { useLocalStorage } from "@/lib/useLocalStorage";

export const SAFETY_KEY = "psycare:safety-plan:v1";

export function useSafetyPlan() {
  const [stored, setPlan] = useLocalStorage<SafetyPlan>(SAFETY_KEY, EMPTY_PLAN);
  // Planos salvos por versões antigas podem não ter todas as listas.
  const plan: SafetyPlan = { ...EMPTY_PLAN, ...stored };

  return {
    plan,
    addTo: (key: SafetyListKey, text: string) =>
      setPlan((current) => ({ ...EMPTY_PLAN, ...current, [key]: addItem(current[key] ?? [], text) })),
    removeFrom: (key: SafetyListKey, index: number) =>
      setPlan((current) => ({ ...EMPTY_PLAN, ...current, [key]: removeItem(current[key] ?? [], index) })),
    addPerson: (input: { name: string; role: string; phone: string }) =>
      setPlan((current) => ({
        ...EMPTY_PLAN,
        ...current,
        contacts: addContact(current.contacts ?? [], input, crypto.randomUUID()),
      })),
    removePerson: (id: string) =>
      setPlan((current) => ({
        ...EMPTY_PLAN,
        ...current,
        contacts: removeContact(current.contacts ?? [], id),
      })),
  };
}
