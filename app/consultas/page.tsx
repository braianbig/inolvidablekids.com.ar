import type { Metadata } from "next";
import { ConsultationForm } from "@/components/consultation-form";

export const metadata: Metadata = {
  title: "Consultá disponibilidad | Inolvidable Kids",
  description: "Elegí los juegos, la fecha y la duración de tu festejo y consultá disponibilidad con Inolvidable Kids.",
};

export default function ConsultasPage() {
  return (
    <main>
      <ConsultationForm standalone />
    </main>
  );
}
