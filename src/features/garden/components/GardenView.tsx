"use client";

import { useGarden } from "@/features/garden/hooks/useGarden";
import { Refuge } from "@/features/garden/island/Refuge";

/**
 * Página do Refúgio: a ilha em tela cheia, com intro. As gotas, a semana e de onde vêm as gotas
 * ficam no botão de gotas, por cima da ilha.
 */
export default function GardenView() {
  const garden = useGarden();
  return <Refuge garden={garden} />;
}
