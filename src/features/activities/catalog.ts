import type { ActivityKind, FieldSpec } from "./types";

export const WHEEL_AREAS = [
  "Saúde",
  "Família",
  "Amizades",
  "Trabalho",
  "Lazer",
  "Dinheiro",
  "Evolução",
  "Amor",
] as const;

export const VALUES_LIST = [
  "Família",
  "Honestidade",
  "Liberdade",
  "Saúde",
  "Aprender",
  "Criatividade",
  "Amizade",
  "Segurança",
  "Fé",
  "Natureza",
  "Respeito",
  "Aventura",
  "Calma",
  "Generosidade",
  "Trabalho bem feito",
] as const;

export const SLEEP_NIGHTS = 7;

export interface ActivityInfo {
  title: string;
  blurb: string;
  fields: readonly FieldSpec[];
}

const sleepFields: FieldSpec[] = Array.from({ length: SLEEP_NIGHTS }, (_, i) => ({
  id: `n${i + 1}`,
  label: `Noite ${i + 1}: quantas horas dormi`,
  type: "hours" as const,
}));

export const ACTIVITIES: Record<ActivityKind, ActivityInfo> = {
  wheel: {
    title: "Roda da vida",
    blurb: "Como você avalia cada área da sua vida hoje, de 1 a 10.",
    fields: WHEEL_AREAS.map((area) => ({
      id: area,
      label: area,
      type: "scale" as const,
      min: 1,
      max: 10,
      required: true,
    })),
  },
  thoughts: {
    title: "Registro de pensamentos",
    blurb: "Escreva o que aconteceu, o que passou pela cabeça e olhe a situação de outro ângulo.",
    fields: [
      { id: "situation", label: "O que aconteceu?", type: "long", required: true },
      { id: "thought", label: "Que pensamento veio?", type: "long", required: true },
      {
        id: "emotion",
        label: "O que senti?",
        hint: "Ex.: tristeza, medo, raiva.",
        type: "text",
        required: true,
      },
      {
        id: "intensity",
        label: "Quão forte foi, de 0 a 10?",
        type: "scale",
        min: 0,
        max: 10,
        required: true,
      },
      { id: "for", label: "O que mostra que esse pensamento é verdade?", type: "long" },
      { id: "against", label: "O que mostra que ele pode não ser tão verdade?", type: "long" },
      { id: "alternative", label: "Um pensamento mais equilibrado seria…", type: "long" },
      { id: "after", label: "Quão forte está a emoção agora, de 0 a 10?", type: "scale", min: 0, max: 10 },
    ],
  },
  thermometer: {
    title: "Termômetro emocional",
    blurb: "Meça o quanto algo pesa antes e depois de fazer algo que ajuda.",
    fields: [
      { id: "feeling", label: "O que estou sentindo?", type: "text", required: true },
      {
        id: "before",
        label: "Quanto pesa agora, de 0 a 10?",
        type: "scale",
        min: 0,
        max: 10,
        required: true,
      },
      {
        id: "action",
        label: "O que eu fiz para aliviar?",
        hint: "Respirar, caminhar, conversar…",
        type: "text",
      },
      {
        id: "after",
        label: "Quanto pesa depois, de 0 a 10?",
        type: "scale",
        min: 0,
        max: 10,
        required: true,
      },
    ],
  },
  sleep: {
    title: "Diário do sono",
    blurb: "Anote as horas dormidas em sete noites. Deixe em branco a noite que não lembra.",
    fields: [
      ...sleepFields,
      { id: "wake", label: "Como me senti ao acordar na maior parte dos dias?", type: "text" },
    ],
  },
  values: {
    title: "Lista de valores",
    blurb: "Escolha até cinco coisas que importam de verdade para você.",
    fields: [
      {
        id: "chosen",
        label: "O que importa para mim",
        type: "multi",
        options: VALUES_LIST,
        maxSelect: 5,
      },
      { id: "why", label: "Por que esses valores?", type: "long" },
    ],
  },
  plan: {
    title: "Plano de ação",
    blurb: "Um objetivo pequeno, um primeiro passo e um plano para o que pode atrapalhar.",
    fields: [
      { id: "goal", label: "O que eu quero mudar ou alcançar?", type: "long", required: true },
      { id: "step", label: "Qual é o primeiro passo, bem pequeno?", type: "long", required: true },
      { id: "when", label: "Quando vou fazer?", type: "text" },
      { id: "obstacle", label: "O que pode atrapalhar?", type: "long" },
      { id: "cope", label: "Se isso acontecer, vou…", type: "long" },
    ],
  },
};

export const ACTIVITY_KINDS = Object.keys(ACTIVITIES) as ActivityKind[];
