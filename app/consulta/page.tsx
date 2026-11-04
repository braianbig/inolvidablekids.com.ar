import type { Metadata } from "next";
import { ConsultationForm } from "@/components/consultation-form";

export const metadata: Metadata = {
  title: "Consultá disponibilidad | Inolvidable Kids",
  description: "Elegí los juegos, la fecha y la duración de tu festejo y consultá disponibilidad con Inolvidable Kids.",
};

export default function ConsultaPage() {
  return (
    <main>
      <header className="legal-header consultation-header">
        <a className="brand" href="/" aria-label="Inolvidable Kids, volver al inicio">
          <img src="/inolvidable-icon.png" alt="" className="brand-icon" />
          <span className="brand-name">Inolvidable</span><span className="brand-kids">KIDS</span>
        </a>
      </header>
      <ConsultationForm standalone />
    </main>
  );
}
