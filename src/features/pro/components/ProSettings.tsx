"use client";

import { DemoNotice } from "@/components/feedback/DemoNotice";
import { Page } from "@/components/layout/Page";
import { SPECIALTY_LABEL } from "../identity";
import { useProIdentity } from "./ProIdentity";

export default function ProSettings() {
  const me = useProIdentity();
  return (
    <Page
      title="Configurações"
      description="Seu perfil e como o PsyCare trata os dados dos pacientes."
      width="narrow"
      className="space-y-10"
    >
      <DemoNotice>Perfil fictício, só para a demonstração.</DemoNotice>
      <dl className="space-y-4">
        <div className="border-t border-border pt-3">
          <dt className="text-sm text-muted-foreground">Nome</dt>
          <dd className="text-lg text-foreground">{me.name}</dd>
        </div>
        <div className="border-t border-border pt-3">
          <dt className="text-sm text-muted-foreground">Especialidade</dt>
          <dd className="text-lg text-foreground">{SPECIALTY_LABEL[me.specialty]}</dd>
        </div>
        <div className="border-t border-border pt-3">
          <dt className="text-sm text-muted-foreground">Registro</dt>
          <dd className="text-lg text-foreground">{me.register}</dd>
        </div>
      </dl>
      <section aria-labelledby="priv-title" className="space-y-2 border-t border-border pt-8">
        <h2 id="priv-title" className="text-2xl font-semibold text-brand-ink">
          Privacidade
        </h2>
        <ul className="max-w-prose list-disc space-y-1 pl-5 text-base text-foreground">
          <li>Você só vê o que o paciente escolheu compartilhar, e ele pode desligar a qualquer momento.</li>
          <li>Do diário, só chegam os títulos do que ele marcou para levar à consulta.</li>
          <li>Suas notas de sessão são privadas: o paciente não tem acesso.</li>
          <li>O app não prescreve nem altera doses. Isso fica com você, fora do app.</li>
        </ul>
      </section>
    </Page>
  );
}
