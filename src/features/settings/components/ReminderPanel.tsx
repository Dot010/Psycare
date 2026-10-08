"use client";

import { isValidTime, usePrefs } from "../prefs";

export function ReminderPanel() {
  const { prefs, update } = usePrefs();
  return (
    <section aria-labelledby="reminder-title" className="space-y-3">
      <h2 id="reminder-title" className="text-xl font-semibold text-brand-ink">
        Lembrete do dia
      </h2>
      <p className="max-w-prose text-sm text-muted-foreground">
        Um convite gentil para registrar como você está. Sem cobrança: pode ignorar nos dias corridos.
      </p>
      <label className="flex min-h-11 cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={prefs.reminderOn}
          onChange={(e) => update({ reminderOn: e.target.checked })}
          className="size-5 accent-brand-600"
        />
        <span className="font-medium text-foreground">Quero um lembrete diário</span>
      </label>
      <label className="flex items-center gap-3 text-sm text-foreground">
        Horário
        <input
          type="time"
          value={prefs.reminderTime}
          disabled={!prefs.reminderOn}
          onChange={(e) => isValidTime(e.target.value) && update({ reminderTime: e.target.value })}
          className="h-11 rounded-lg border border-border bg-card px-3 disabled:opacity-50"
        />
      </label>
      <p className="text-xs text-muted-foreground">
        Demonstração: o horário fica guardado, mas o aviso no celular só chega quando o app tiver
        notificações.
      </p>
    </section>
  );
}
