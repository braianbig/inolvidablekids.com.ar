import type { Metadata } from "next";
import { LegalShell } from "@/components/legal-shell";
import { ConsultationConfirmation } from "@/components/consultation-confirmation";

export const metadata: Metadata = {
  title: "Solicitud enviada | Inolvidable Kids",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function SolicitudEnviada() {
  return <LegalShell className="confirmation-page" title="¡Un paso menos!" intro="Cada vez falta menos para hacer llegar los juegos.">
    <ConsultationConfirmation />
  </LegalShell>;
}
