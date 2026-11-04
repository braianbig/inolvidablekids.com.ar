import type { Metadata } from "next";
import { LegalShell } from "@/components/legal-shell";
import { ConsultationConfirmation } from "@/components/consultation-confirmation";

export const metadata: Metadata = {
  title: "Solicitud enviada | Inolvidable Kids",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function SolicitudEnviada() {
  return <LegalShell title="Un paso menos" intro="Tu festejo empieza con una buena charla.">
    <ConsultationConfirmation />
  </LegalShell>;
}
