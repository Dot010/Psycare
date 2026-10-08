"use client";

import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { DropdownMenu } from "radix-ui";
import { cn } from "@/lib/utils";

interface ItemMenuProps {
  /** Nome do item, usado no rótulo do botão para leitores de tela. */
  label: string;
  onEdit?: () => void;
  onDelete?: () => void;
  editLabel?: string;
  deleteLabel?: string;
  className?: string;
}

const itemClass =
  "flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none data-highlighted:bg-sunken";

/** Menu de três pontos (editar / excluir) usado em todas as listas. */
export function ItemMenu({
  label,
  onEdit,
  onDelete,
  editLabel = "Editar",
  deleteLabel = "Excluir",
  className,
}: ItemMenuProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label={`Opções de ${label}`}
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-sunken hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none",
            className,
          )}
        >
          <MoreVertical className="size-4" aria-hidden />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={4}
          className="z-50 min-w-40 rounded-xl border border-border bg-card p-1 text-foreground shadow-lg"
        >
          {onEdit && (
            <DropdownMenu.Item onSelect={onEdit} className={itemClass}>
              <Pencil className="size-4" aria-hidden />
              {editLabel}
            </DropdownMenu.Item>
          )}
          {onDelete && (
            <DropdownMenu.Item onSelect={onDelete} className={cn(itemClass, "text-danger-600")}>
              <Trash2 className="size-4" aria-hidden />
              {deleteLabel}
            </DropdownMenu.Item>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
