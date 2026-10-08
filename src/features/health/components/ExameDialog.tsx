"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { ATTACHMENT_TYPES, MAX_ATTACHMENT_BYTES } from "@/features/health/logic";
import type { Exame, ExameAnexo } from "@/features/health/types";
import { toISODate } from "@/lib/dates";

interface ExameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: Exame;
  onSave: (item: Exame) => void;
}

export function ExameDialog({ open, onOpenChange, item, onSave }: ExameDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined} className="gap-4 rounded-2xl p-6 sm:max-w-md">
        <DialogTitle className="text-xl font-bold text-foreground">
          {item ? "Editar exame" : "Guardar um exame"}
        </DialogTitle>
        <ExameForm item={item} onSave={onSave} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function ExameForm({
  item,
  onSave,
  onClose,
}: {
  item?: Exame;
  onSave: (item: Exame) => void;
  onClose: () => void;
}) {
  const [titulo, setTitulo] = useState(item?.titulo ?? "");
  const [data, setData] = useState(item?.data ?? toISODate(new Date()));
  const [resultado, setResultado] = useState(item?.resultado ?? "");
  const [anexo, setAnexo] = useState<ExameAnexo | undefined>(item?.anexo);
  const [error, setError] = useState("");

  const pickFile = async (file: File | undefined) => {
    if (!file) return;
    if (!ATTACHMENT_TYPES.includes(file.type)) {
      setError("Use um PDF ou uma imagem (PNG, JPG ou WebP).");
      return;
    }
    if (file.size > MAX_ATTACHMENT_BYTES) {
      setError("O arquivo passa de 1,5 MB. Ele fica guardado só neste navegador, que tem pouco espaço.");
      return;
    }
    try {
      setAnexo({ nome: file.name.slice(0, 80), tipo: file.type, dados: await readAsDataUrl(file) });
      setError("");
    } catch {
      setError("Não consegui ler esse arquivo.");
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = titulo.trim();
    if (name.length < 2) return setError("Dê um nome ao exame.");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return setError("Escolha a data do exame.");
    onSave({
      id: item?.id ?? crypto.randomUUID(),
      titulo: name.slice(0, 80),
      data,
      resultado: resultado.trim().slice(0, 300) || undefined,
      anexo,
    });
    onClose();
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field
        label="Nome do exame"
        required
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        placeholder="Ex: Hemograma"
      />
      <Field
        label="Data"
        type="date"
        required
        max={toISODate(new Date())}
        value={data}
        onChange={(e) => setData(e.target.value)}
      />
      <Field
        label="O que o exame mostrou (opcional)"
        value={resultado}
        onChange={(e) => setResultado(e.target.value)}
        placeholder="Com as suas palavras ou as do laudo"
      />
      <div className="space-y-1">
        <label htmlFor="exame-anexo" className="block text-xs font-medium text-muted-foreground">
          Arquivo do exame (opcional)
        </label>
        <input
          id="exame-anexo"
          type="file"
          accept={ATTACHMENT_TYPES.join(",")}
          onChange={(e) => pickFile(e.target.files?.[0])}
          className="block w-full text-sm file:mr-3 file:rounded-lg file:border file:border-border file:bg-card file:px-3 file:py-2"
        />
        {anexo && (
          <p className="text-xs text-foreground">
            {anexo.nome}{" "}
            <button
              type="button"
              className="font-semibold text-brand-ink underline"
              onClick={() => setAnexo(undefined)}
            >
              remover
            </button>
          </p>
        )}
        <p className="text-xs text-muted-foreground">Fica guardado só neste navegador, até 1,5 MB.</p>
      </div>
      {error && (
        <p role="alert" className="text-xs text-danger-600">
          {error}
        </p>
      )}
      <DialogFooter className="-mx-6 -mb-6 rounded-b-2xl px-6 py-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit">Salvar</Button>
      </DialogFooter>
    </form>
  );
}
