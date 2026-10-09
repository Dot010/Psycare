import { number } from "framer-motion";
import { or } from "three/src/nodes/TSL.js";
import { date } from "zod";

export function daysUntil(expiry: string, today: string): number {
  return Math.round((Date.parse(expiry) - Date.parse(today)) / 86400000);
}

export function prescriptionStatus(daysLeft: number): "expired" | "expiring" | "valid" {
  if (daysLeft < 0) return "expired";
  if (daysLeft <= 5) return "expiring";
  return "valid";
}

export function adherence(taken: number, planned: number): number | null {
  if (planned === 0) return null;

  return Math.round((taken / planned) * 100);
}
