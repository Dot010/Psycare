"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";

interface UndoRequest {
  message: string;
  onUndo: () => void;
}

interface UndoContextValue {
  showUndo: (request: UndoRequest) => void;
}

const UndoContext = createContext<UndoContextValue | null>(null);

const UNDO_WINDOW_MS = 6000;

/** Aviso "Excluído. Desfazer" mostrado por alguns segundos depois de apagar algo. */
export function UndoProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<UndoRequest | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const dismiss = useCallback(() => {
    clearTimeout(timer.current);
    setCurrent(null);
  }, []);

  const showUndo = useCallback((request: UndoRequest) => {
    clearTimeout(timer.current);
    setCurrent(request);
    timer.current = setTimeout(() => setCurrent(null), UNDO_WINDOW_MS);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  const value = useMemo(() => ({ showUndo }), [showUndo]);

  return (
    <UndoContext.Provider value={value}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex justify-center px-4 md:bottom-6"
      >
        {current && (
          <div className="pointer-events-auto flex items-center gap-3 rounded-full bg-ink py-2 pr-2 pl-5 text-sm text-white shadow-lg">
            <span>{current.message}</span>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                current.onUndo();
                dismiss();
              }}
            >
              Desfazer
            </Button>
          </div>
        )}
      </div>
    </UndoContext.Provider>
  );
}

export function useUndo(): UndoContextValue {
  const context = useContext(UndoContext);
  if (!context) throw new Error("useUndo precisa estar dentro de <UndoProvider>");
  return context;
}
