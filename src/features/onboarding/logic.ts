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

export const STEP_COUNT = 3;

export function isGoal(value: string): boolean {
  return (GOALS as readonly string[]).includes(value);
}

export function finish(goal?: string): OnboardingState {
  return goal && isGoal(goal) ? { done: true, goal } : { done: true };
}
