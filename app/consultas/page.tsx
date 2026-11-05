import type { Metadata } from "next";
import { ConsultationForm } from "@/components/consultation-form";

export const metadata: Metadata = {
  title: "Consultá disponibilidad | Inolvidable Kids",
  description: "Elegí los juegos, la fecha y la duración de tu festejo y consultá disponibilidad con Inolvidable Kids.",
};

export default function ConsultasPage() {
  return (
    <main className="consultas-page">
      <header className="consultas-brand-header">
        <a className="brand consultas-brand" href="/#inicio" aria-label="Inolvidable Kids, volver al inicio">
          <img src="/inolvidable-icon.png" alt="" className="brand-icon" />
          <span className="brand-name">Inolvidable</span>
          <span className="brand-kids">KIDS</span>
        </a>
      </header>
      <ConsultationForm standalone />
    </main>
  );
}
