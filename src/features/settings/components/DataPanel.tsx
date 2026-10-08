"use client";

import { Download, FlaskConical, Trash2 } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { buildExport, clearAll, clearDemoData, exportFileName, loadDemoData } from "../data";

function downloadJson(name: string, content: unknown) {
  const blob = new Blob([JSON.stringify(content, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

const rowClass =
  "flex flex-col gap-3 border-t border-border py-5 sm:flex-row sm:items-center sm:justify-between";

export function DataPanel() {
  const [message, setMessage] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmDemo, setConfirmDemo] = useState(false);

  const exportData = () => {
    downloadJson(exportFileName(), buildExport(window.localStorage));
    setMessage("Arquivo gerado. Guarde-o em um lugar seguro: ele tem o que você escreveu.");
  };

  const deleteAll = () => {
    const count = clearAll(window.localStorage);
    setMessage(count > 0 ? "Tudo foi apagado deste navegador." : "Não havia nada guardado.");
  };

  return (
    <section aria-labelledby="data-title" className="space-y-1">
      <h2 id="data-title" className="text-xl font-semibold text-brand-ink">
        Meus dados
      </h2>
      <p className="max-w-prose text-sm text-muted-foreground">
        Tudo o que você escreve aqui fica só neste navegador. Não enviamos para nenhum servidor.
      </p>

      <div className={rowClass}>
        <div>
          <p className="font-medium text-foreground">Baixar uma cópia</p>
          <p className="text-sm text-muted-foreground">
            Diário, humor, hábitos, plano de segurança e o resto, em um arquivo.
          </p>
        </div>
        <Button variant="outline" onClick={exportData}>
          <Download className="size-4" aria-hidden />
          Baixar meus dados
        </Button>
      </div>

      <div className={rowClass}>
        <div>
          <p className="font-medium text-foreground">Ver o app com dados de exemplo</p>
          <p className="text-sm text-muted-foreground">
            Preenche humor e diário com registros fictícios. Substitui o humor e o diário atuais.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setConfirmDemo(true)}>
            <FlaskConical className="size-4" aria-hidden />
            Carregar exemplo
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              clearDemoData();
              setMessage("Humor e diário foram esvaziados.");
            }}
          >
            Limpar humor e diário
          </Button>
        </div>
      </div>

      <div className={rowClass}>
        <div>
          <p className="font-medium text-foreground">Apagar tudo</p>
          <p className="text-sm text-muted-foreground">
            Remove os dados deste navegador. Não dá para desfazer.
          </p>
        </div>
        <Button variant="destructive" onClick={() => setConfirmDelete(true)}>
          <Trash2 className="size-4" aria-hidden />
          Apagar meus dados
        </Button>
      </div>

      {message && (
        <p role="status" className="pt-2 text-sm text-brand-ink">
          {message}
        </p>
      )}

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Apagar todos os seus dados?"
        description="Diário, humor, hábitos, jardim e plano de segurança serão removidos deste navegador. Baixe uma cópia antes se quiser guardar."
        confirmLabel="Apagar tudo"
        onConfirm={deleteAll}
      />
      <ConfirmDialog
        open={confirmDemo}
        onOpenChange={setConfirmDemo}
        title="Carregar dados de exemplo?"
        description="O humor e o diário atuais serão substituídos por registros fictícios."
        confirmLabel="Carregar"
        onConfirm={() => {
          loadDemoData();
          setMessage("Dados de exemplo carregados. Veja em Meu Humor e no Diário.");
        }}
      />
    </section>
  );
}
