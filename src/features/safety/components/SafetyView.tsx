"use client";

import { Phone, X } from "lucide-react";
import { useState } from "react";
import { EmergencyCalls } from "@/features/safety/components/EmergencyCalls";
import { useSafetyPlan } from "@/features/safety/hooks/useSafetyPlan";
import {
  isValidPhone,
  MAX_CONTACTS,
  MAX_ITEM_LENGTH,
  MAX_ITEMS,
  phoneHref,
  SAFETY_SECTIONS,
} from "@/features/safety/logic";
import type { SafetyListKey } from "@/features/safety/types";

const inputClass =
  "h-11 min-w-0 flex-1 rounded-xl border border-input bg-card px-3 text-sm text-foreground focus-visible:ring-3 focus-visible:ring-brand-600/40 focus-visible:outline-none";
const addButtonClass =
  "h-11 shrink-0 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-700 focus-visible:ring-3 focus-visible:ring-brand-600/40 focus-visible:outline-none";

function ItemSection({
  id,
  title,
  hint,
  placeholder,
  items,
  onAdd,
  onRemove,
}: {
  id: SafetyListKey;
  title: string;
  hint: string;
  placeholder: string;
  items: string[];
  onAdd: (text: string) => void;
  onRemove: (index: number) => void;
}) {
  const [draft, setDraft] = useState("");

  return (
    <section aria-labelledby={`safety-${id}`} className="space-y-3 border-t border-border pt-6">
      <div>
        <h2 id={`safety-${id}`} className="text-xl font-semibold text-brand-ink">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground">{hint}</p>
      </div>

      {items.length > 0 && (
        <ul className="space-y-1">
          {items.map((item, index) => (
            <li
              key={`${item}-${index}`}
              className="flex items-start gap-2 text-base leading-snug text-foreground"
            >
              <span aria-hidden className="pt-0.5 text-brand-400">
                •
              </span>
              <span className="flex-1 pt-0.5">{item}</span>
              <button
                type="button"
                aria-label={`Remover: ${item}`}
                onClick={() => onRemove(index)}
                className="flex size-11 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-brand-600/40 focus-visible:outline-none"
              >
                <X className="size-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}

      {items.length < MAX_ITEMS && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onAdd(draft);
            setDraft("");
          }}
          className="flex gap-2"
        >
          <label htmlFor={`add-${id}`} className="sr-only">
            Adicionar em {title}
          </label>
          <input
            id={`add-${id}`}
            value={draft}
            maxLength={MAX_ITEM_LENGTH}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={placeholder}
            className={inputClass}
          />
          <button type="submit" className={addButtonClass}>
            Adicionar
          </button>
        </form>
      )}
    </section>
  );
}

function PeopleSection() {
  const { plan, addPerson, removePerson } = useSafetyPlan();
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) return setError("Escreva o nome.");
    if (!isValidPhone(phone)) return setError("Confira o telefone, com DDD.");
    setError("");
    addPerson({ name, role, phone });
    setName("");
    setRole("");
    setPhone("");
  };

  return (
    <section aria-labelledby="safety-people" className="space-y-3 border-t border-border pt-6">
      <div>
        <h2 id="safety-people" className="text-xl font-semibold text-brand-ink">
          Pessoas de confiança
        </h2>
        <p className="text-sm text-muted-foreground">Quem eu posso chamar quando estiver difícil.</p>
      </div>

      {plan.contacts.length > 0 && (
        <ul className="space-y-1">
          {plan.contacts.map((contact) => (
            <li key={contact.id} className="flex items-center gap-2">
              <span className="min-w-0 flex-1">
                <span className="block text-base font-medium text-foreground">{contact.name}</span>
                {contact.role && <span className="block text-sm text-muted-foreground">{contact.role}</span>}
              </span>
              <a
                href={phoneHref(contact.phone)}
                aria-label={`Ligar para ${contact.name}`}
                className="flex min-h-11 min-w-20 items-center justify-center gap-1.5 rounded-full border-2 border-brand-600 px-4 text-sm font-semibold text-brand-ink transition-colors hover:bg-brand-50 focus-visible:ring-3 focus-visible:ring-brand-600/40 focus-visible:outline-none"
              >
                <Phone className="size-4" aria-hidden />
                Ligar
              </a>
              <button
                type="button"
                aria-label={`Remover ${contact.name}`}
                onClick={() => removePerson(contact.id)}
                className="flex size-11 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-brand-600/40 focus-visible:outline-none"
              >
                <X className="size-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}

      {plan.contacts.length < MAX_CONTACTS && (
        <form onSubmit={submit} className="space-y-2">
          <div className="flex flex-col gap-2 sm:flex-row">
            <label htmlFor="person-name" className="sr-only">
              Nome
            </label>
            <input
              id="person-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome"
              maxLength={60}
              className={inputClass}
            />
            <label htmlFor="person-role" className="sr-only">
              Quem é para você
            </label>
            <input
              id="person-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Quem é (irmã, amigo…)"
              maxLength={40}
              className={inputClass}
            />
          </div>
          <div className="flex gap-2">
            <label htmlFor="person-phone" className="sr-only">
              Telefone com DDD
            </label>
            <input
              id="person-phone"
              type="tel"
              inputMode="tel"
              autoComplete="off"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Telefone com DDD"
              className={inputClass}
            />
            <button type="submit" className={addButtonClass}>
              Adicionar
            </button>
          </div>
          {error && (
            <p role="alert" className="text-xs text-danger-600">
              {error}
            </p>
          )}
        </form>
      )}
    </section>
  );
}

/** O plano de segurança: escrito nos dias calmos, lido nos dias difíceis. Os telefones de emergência vêm primeiro. */
export default function SafetyView() {
  const { plan, addTo, removeFrom } = useSafetyPlan();

  return (
    <div className="bg-linear-to-b from-sun-100/80 to-transparent">
      <div className="mx-auto w-full max-w-2xl space-y-8 px-5 pt-8 pb-16 md:px-8 md:pt-12">
        <header className="space-y-4">
          <h1 className="text-4xl leading-tight font-semibold text-ink">Você não está sozinho(a).</h1>
          <p className="max-w-md text-lg leading-snug text-foreground">
            Se você está em perigo agora ou pensando em se machucar, peça ajuda neste momento. A ligação é
            gratuita.
          </p>
          <EmergencyCalls />
        </header>

        <section className="space-y-2">
          <p className="text-xs font-medium tracking-widest text-brand-accent uppercase">Meu plano</p>
          <p className="max-w-md text-base leading-relaxed text-foreground">
            Escreva nos dias mais calmos, para ler nos dias difíceis. Fica só neste aparelho, e o botão de
            ajuda do app mostra um resumo dele.
          </p>
        </section>

        {SAFETY_SECTIONS.map((section) => (
          <ItemSection
            key={section.key}
            id={section.key}
            title={section.title}
            hint={section.hint}
            placeholder={section.placeholder}
            items={plan[section.key]}
            onAdd={(text) => addTo(section.key, text)}
            onRemove={(index) => removeFrom(section.key, index)}
          />
        ))}

        <PeopleSection />

        <p className="text-xs text-muted-foreground">
          Este plano é uma ajuda sua para você. Ele não substitui o acompanhamento com um profissional.
        </p>
      </div>
    </div>
  );
}
