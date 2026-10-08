"use client";

import { useState } from "react";
import { DemoNotice } from "@/components/feedback/DemoNotice";
import { Page } from "@/components/layout/Page";
import { Button } from "@/components/ui/button";
import { ACTIVITIES, ACTIVITY_KINDS } from "@/features/activities/catalog";
import type { ActivityKind } from "@/features/activities/types";
import { usePro } from "../hooks/usePro";
import { AssignDialog } from "./AssignDialog";
import { useProIdentity } from "./ProIdentity";

export default function LibraryView() {
  const pro = usePro();
  const me = useProIdentity();
  const [kind, setKind] = useState<ActivityKind | null>(null);

  return (
    <Page
      title="Atividades"
      description="Ferramentas de reflexão para pedir aos pacientes. Eles fazem no próprio ritmo e você vê o resultado."
      width="narrow"
    >
      <DemoNotice>
        O paciente de demonstração recebe o pedido na tela Atividades dele, neste mesmo navegador.
      </DemoNotice>
      <ul>
        {ACTIVITY_KINDS.map((k) => (
          <li
            key={k}
            className="flex flex-wrap items-center justify-between gap-3 border-t border-border py-4"
          >
            <div className="max-w-prose">
              <p className="text-lg font-medium text-foreground">{ACTIVITIES[k].title}</p>
              <p className="text-sm text-muted-foreground">{ACTIVITIES[k].blurb}</p>
            </div>
            <Button variant="outline" onClick={() => setKind(k)}>
              Pedir a um paciente
            </Button>
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted-foreground">
        São ferramentas de reflexão, não avaliações clínicas. A interpretação é sua.
      </p>
      <AssignDialog
        open={kind !== null}
        onOpenChange={(open) => !open && setKind(null)}
        kind={kind ?? undefined}
        onAssign={(pid, k, due, msg) => pro.assign(pid, k, due, msg, me.name)}
      />
    </Page>
  );
}
