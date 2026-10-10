"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { fieldControlClass } from "@/components/ui/input";
import type { DiaryEntry } from "@/features/diary/types";
import { drawingEntry } from "@/features/diary/utils";
import { toISODate } from "@/lib/dates";
import { cn } from "@/lib/utils";

const COLORS = [
  { name: "Verde escuro", value: "#36461f" },
  { name: "Verde", value: "#5e7638" },
  { name: "Amarelo", value: "#c9a227" },
  { name: "Marrom", value: "#8a5a44" },
];
const SIZES = [
  { name: "Fino", value: 3 },
  { name: "Médio", value: 8 },
  { name: "Grosso", value: 16 },
];
const WIDTH = 600;
const HEIGHT = 360;
const PAPER = "#fbf8f1";

/** Um espaço para desenhar com o dedo ou o mouse. O desenho vira uma página do diário. */
export function DrawPanel({ onSave }: { onSave: (entry: DiaryEntry) => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [color, setColor] = useState(COLORS[0].value);
  const [size, setSize] = useState(SIZES[1].value);
  const [title, setTitle] = useState("");
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const ctx = () => canvas.current?.getContext("2d") ?? null;

  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / (rect.width || WIDTH)) * WIDTH,
      y: ((e.clientY - rect.top) / (rect.height || HEIGHT)) * HEIGHT,
    };
  };

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = ctx();
    if (!c) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    drawing.current = true;
    const { x, y } = point(e);
    c.strokeStyle = color;
    c.fillStyle = color;
    c.lineWidth = size;
    c.lineCap = "round";
    c.lineJoin = "round";
    c.beginPath();
    c.arc(x, y, size / 2, 0, Math.PI * 2);
    c.fill();
    c.beginPath();
    c.moveTo(x, y);
    setDirty(true);
    setSaved(false);
  };
  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const c = ctx();
    if (!c) return;
    const { x, y } = point(e);
    c.lineTo(x, y);
    c.stroke();
  };
  const stop = () => {
    drawing.current = false;
  };

  const clear = () => {
    const c = ctx();
    if (c) {
      c.fillStyle = PAPER;
      c.fillRect(0, 0, WIDTH, HEIGHT);
    }
    setDirty(false);
  };

  const save = () => {
    const el = canvas.current;
    if (!el) return;
    let url = el.toDataURL("image/webp", 0.7);
    if (!url.startsWith("data:image/webp")) url = el.toDataURL("image/png");
    const entry = drawingEntry({
      id: crypto.randomUUID(),
      dataUrl: url,
      title,
      today: toISODate(new Date()),
    });
    if (!entry) {
      setError("Este desenho ficou grande demais para guardar. Tente com menos traços.");
      return;
    }
    setError("");
    onSave(entry);
    setTitle("");
    clear();
    setSaved(true);
  };

  const chip = (on: boolean) =>
    cn(
      "min-h-11 rounded-full border px-4 text-sm focus-visible:ring-3 focus-visible:ring-brand-600/50 focus-visible:outline-none",
      on
        ? "border-brand-600 bg-brand-100 font-medium text-brand-ink"
        : "border-border hover:border-brand-600",
    );

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Desenhe o que as palavras não alcançam. Ninguém avalia: é só seu.
      </p>
      <canvas
        ref={(el) => {
          canvas.current = el;
          // Papel creme na primeira vez que o elemento aparece.
          const c = el?.getContext("2d");
          if (c && el && !el.dataset.ready) {
            c.fillStyle = PAPER;
            c.fillRect(0, 0, WIDTH, HEIGHT);
            el.dataset.ready = "1";
          }
        }}
        width={WIDTH}
        height={HEIGHT}
        role="img"
        aria-label="Área de desenho"
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={stop}
        onPointerLeave={stop}
        onPointerCancel={stop}
        className="w-full touch-none rounded-2xl border border-border"
        style={{ aspectRatio: `${WIDTH} / ${HEIGHT}`, background: PAPER }}
      />
      <div className="flex flex-wrap gap-4">
        <div role="radiogroup" aria-label="Cor do traço" className="flex gap-2">
          {COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              role="radio"
              aria-checked={color === c.value}
              aria-label={c.name}
              onClick={() => setColor(c.value)}
              className={cn(
                "size-11 rounded-full border-2",
                color === c.value ? "border-ink" : "border-transparent",
              )}
              style={{ background: c.value }}
            />
          ))}
        </div>
        <div role="radiogroup" aria-label="Espessura do traço" className="flex gap-2">
          {SIZES.map((s) => (
            <button
              key={s.value}
              type="button"
              role="radio"
              aria-checked={size === s.value}
              onClick={() => setSize(s.value)}
              className={chip(size === s.value)}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-1">
        <label htmlFor="draw-title" className="block text-sm font-medium text-foreground">
          Nome do desenho (se quiser)
        </label>
        <input
          id="draw-title"
          className={fieldControlClass}
          value={title}
          maxLength={80}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-danger-600">
          {error}
        </p>
      )}
      {saved && <p className="text-sm text-brand-ink">Desenho guardado. Só você vê.</p>}
      <div className="flex gap-2">
        <Button className="min-h-11" onClick={save} disabled={!dirty}>
          Guardar desenho
        </Button>
        <Button variant="outline" className="min-h-11" onClick={clear} disabled={!dirty}>
          Limpar
        </Button>
      </div>
    </div>
  );
}
