"use client";

import { Phone, X } from "lucide-react";
import { useState } from "react";
import { Page } from "@/components/layout/Page";
import { PageColumns } from "@/components/layout/PageColumns";
import { Block } from "@/components/ui/block";
import { EmergencyCalls } from "@/features/safety/components/EmergencyCalls";
import { useSafetyPlan } from "@/features/safety/hooks/useSafetyPlan";
import {
  filledSteps,
  MAX_CONTACTS,
  MAX_ITEM_LENGTH,
  MAX_ITEMS,
  phoneHref,
  PLAN_STEPS,
  SAFETY_SECTIONS,
} from "@/features/safety/logic";
import { CONTACT_NAME_MAX, CONTACT_ROLE_MAX, contactSchema } from "@/features/safety/schema";
import type { SafetyListKey } from "@/features/safety/types";
import { cn } from "@/lib/utils";

const inputClass =
  "h-11 min-w-0 rounded-xl border border-input bg-card px-3 text-sm text-foreground focus-visible:ring-3 focus-visible:ring-brand-600/40 focus-visible:outline-none";
const addButtonClass =
  "h-11 shrink-0 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-700 focus-visible:ring-3 focus-visible:ring-brand-600/40 focus-visible:outline-none";

function ItemSection({
  id,
  title,
  placeholder,
  items,
  onAdd,
  onRemove,
}: {
  id: SafetyListKey;
  title: string;
  placeholder: string;
  items: string[];
  onAdd: (text: string) => void;
  onRemove: (index: number) => void;
}) {
  const [draft, setDraft] = useState("");

  return (
    <div className="space-y-3">
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
            className={`${inputClass} flex-1`}
          />
          <button type="submit" className={addButtonClass}>
            Adicionar
          </button>
        </form>
      )}
    </div>
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
    const checked = contactSchema.safeParse({ name, role, phone });
    if (!checked.success) return setError(checked.error.issues[0]?.message ?? "Confira os dados.");
    setError("");
    addPerson({ name, role, phone });
    setName("");
    setRole("");
    setPhone("");
  };

  return (
    <div className="space-y-3">
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
              maxLength={CONTACT_NAME_MAX}
              className={`${inputClass} sm:flex-1`}
            />
            <label htmlFor="person-role" className="sr-only">
              Quem é para você
            </label>
            <input
              id="person-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Quem é (irmã, amigo…)"
              maxLength={CONTACT_ROLE_MAX}
              className={`${inputClass} sm:flex-1`}
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
              className={`${inputClass} flex-1`}
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
    </div>
  );
}

interface Step {
  key: SafetyListKey | "people";
  title: string;
  hint: string;
  filled: string[];
  body: React.ReactNode;
}

/**
 * O plano de segurança: escrito nos dias calmos, lido nos dias difíceis.
 * Os telefones de emergência ficam à mão na lateral; o plano vem em 5 passos, um aberto de cada vez.
 */
export default function SafetyView() {
  const { plan, addTo, removeFrom } = useSafetyPlan();
  const filled = filledSteps(plan);

  const list = (key: SafetyListKey): Step => {
    const section = SAFETY_SECTIONS.find((item) => item.key === key)!;
    return {
      key,
      title: section.title,
      hint: section.hint,
      filled: plan[key],
      body: (
        <ItemSection
          id={key}
          title={section.title}
          placeholder={section.placeholder}
          items={plan[key]}
          onAdd={(text) => addTo(key, text)}
          onRemove={(index) => removeFrom(key, index)}
        />
      ),
    };
  };
  // A ordem segue a do plano de segurança usado na clínica: sinais, o que fazer sozinho,
  // distrações, pessoas a quem pedir ajuda e, por último, deixar o ambiente seguro.
  const steps: Step[] = [
    list("warnings"),
    list("coping"),
    list("places"),
    {
      key: "people",
      title: "Pessoas de confiança",
      hint: "Quem eu posso chamar quando estiver difícil.",
      filled: plan.contacts.map((contact) => contact.name),
      body: <PeopleSection />,
    },
    list("safeEnv"),
  ];
  const firstEmpty = steps.findIndex((step) => step.filled.length === 0);
  const [open, setOpen] = useState<number | null>(null);
  const expanded = open ?? (firstEmpty === -1 ? null : firstEmpty);

  return (
    <Page
      title="Você não está sozinho(a)"
      kicker="Plano de segurança"
      description="Escreva nos dias mais calmos, para ler nos dias difíceis. Fica só neste aparelho."
      width="wide"
    >
      <PageColumns
        aside={
          <>
            <Block tone="danger" title="Em perigo agora?" className="[&_h2]:text-lg [&_h2]:text-danger-600">
              <p className="mb-4 text-sm leading-relaxed">
                Se você está pensando em se machucar, peça ajuda neste momento. A ligação é gratuita.
              </p>
              <EmergencyCalls />
            </Block>
            <Block title="No botão de ajuda">
              <p className="text-sm leading-relaxed text-muted-foreground">
                O botão &quot;Preciso de ajuda agora&quot;, no topo do app, mostra um resumo deste plano.
              </p>
            </Block>
          </>
        }
      >
        <Block
          title="Meu plano em 5 passos"
          size="lg"
          aside={
            <span className="flex items-center gap-3">
              <span aria-hidden className="block h-2.5 w-28 overflow-hidden rounded-full bg-brand-100">
                <span
                  className="block h-full rounded-full bg-primary transition-[width] duration-500"
                  style={{ width: `${(filled / PLAN_STEPS) * 100}%` }}
                />
              </span>
              <span className="font-semibold">
                {filled} de {PLAN_STEPS}
              </span>
            </span>
          }
        >
          <ol>
            {steps.map((step, index) => {
              const isOpen = expanded === index;
              const done = step.filled.length > 0;
              return (
                <li key={step.key} className="border-t border-sunken first:border-t-0">
                  <h3>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setOpen(isOpen ? -1 : index)}
                      className="flex min-h-16 w-full items-center gap-4 py-3 text-left focus-visible:ring-3 focus-visible:ring-brand-600/50 focus-visible:outline-none"
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold",
                          done
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-brand-400 text-brand-ink",
                        )}
                      >
                        {index + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-base font-medium">{step.title}</span>
                        <span className="block truncate text-sm text-muted-foreground">
                          {done ? step.filled.join(" · ") : step.hint}
                        </span>
                      </span>
                      <span className="sr-only">{done ? "(preenchido)" : "(vazio)"}</span>
                    </button>
                  </h3>
                  {isOpen && <div className="animate-rise pb-5 pl-12">{step.body}</div>}
                </li>
              );
            })}
          </ol>
        </Block>

        <p className="text-xs text-muted-foreground">
          Este plano é uma ajuda sua para você. Ele não substitui o acompanhamento com um profissional.
        </p>
      </PageColumns>
    </Page>
  );
}
