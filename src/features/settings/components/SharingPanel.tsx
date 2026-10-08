"use client";

import { useSharing } from "@/features/pro/hooks/usePro";
import type { Sharing } from "@/features/pro/types";

const OPTIONS: { key: keyof Sharing; title: string; text: string }[] = [
  { key: "mood", title: "Meu humor", text: "Os rostos dos últimos dias, sem o texto do diário." },
  {
    key: "diary",
    title: "Assuntos que marquei para a consulta",
    text: "Só o título dos registros do diário que você marcou. O texto nunca é compartilhado.",
  },
  {
    key: "activities",
    title: "Atividades",
    text: "Roda da vida, registro de pensamentos e as outras que você fizer.",
  },
  { key: "health", title: "Saúde", text: "Remédios, doses marcadas e sintomas." },
];

export function SharingPanel() {
  const [sharing, setSharing] = useSharing();
  return (
    <section aria-labelledby="share-title" className="space-y-2">
      <h2 id="share-title" className="text-xl font-semibold text-brand-ink">
        O que o meu profissional vê
      </h2>
      <p className="max-w-prose text-sm text-muted-foreground">
        Você decide. Desligue quando quiser: o profissional deixa de ver na hora. O que fica desligado não sai
        daqui.
      </p>
      <ul>
        {OPTIONS.map(({ key, title, text }) => (
          <li key={key} className="border-t border-border">
            <label className="flex min-h-14 cursor-pointer items-center justify-between gap-4 py-3">
              <span>
                <span className="block font-medium text-foreground">{title}</span>
                <span className="block text-sm text-muted-foreground">{text}</span>
              </span>
              <input
                type="checkbox"
                checked={sharing[key]}
                onChange={(e) => setSharing((current) => ({ ...current, [key]: e.target.checked }))}
                className="size-5 shrink-0 accent-brand-600"
              />
            </label>
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted-foreground">
        Demonstração: o profissional de exemplo vê estes dados neste mesmo navegador.
      </p>
    </section>
  );
}
