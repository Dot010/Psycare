import type { Metadata } from "next";
import BreathingView from "@/features/breathing/components/BreathingView";

export const metadata: Metadata = {
  title: "Respiração guiada | Psy Care",
};

export default function BreathingPage() {
  return <BreathingView />;
}
