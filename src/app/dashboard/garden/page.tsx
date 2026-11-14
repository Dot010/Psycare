import type { Metadata } from "next";
import GardenView from "@/features/garden/components/GardenView";

export const metadata: Metadata = {
  title: "Seu jardim | Psy Care",
};

export default function GardenPage() {
  return <GardenView />;
}
