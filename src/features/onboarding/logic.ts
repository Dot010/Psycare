export const ONBOARDING_KEY = "psycare:onboarding:v1";

export interface OnboardingState {
  done: boolean;
  /** O que a pessoa quer cuidar, escolhido na segunda tela. */
  goal?: string;
}

export const NOT_DONE: OnboardingState = { done: false };

export const GOALS = [
  "Entender melhor o meu humor",
  "Dormir melhor",
  "Manter uma rotina de cuidado",
  "Ter um espaço para escrever",
  "Acompanhar meu tratamento",
] as const;

/** Telas: 0 intro, 1 nome e ano (opcional), 2 objetivo, 3 primeira gota. */
export const STEP_COUNT = 4;

export function isGoal(value: string): boolean {
  return (GOALS as readonly string[]).includes(value);
}

export function finish(goal?: string): OnboardingState {
  return goal && isGoal(goal) ? { done: true, goal } : { done: true };
}
