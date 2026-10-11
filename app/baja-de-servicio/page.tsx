import type { Metadata } from "next";
import { LegalShell } from "@/components/legal-shell";
import { LegalRequestForm } from "@/components/legal-request-form";

export const metadata: Metadata = { title: "Botón de baja de servicio | Inolvidable Kids" };

export default function BajaDeServicio() {
  return <LegalShell title="Botón de baja de servicio" intro="Pedí la baja de tu reserva.">
    <section className="legal-card legal-request-card">
      <h2>Solicitá la baja</h2>
      <p>Indicá un dato de contacto y, si la tenés, la referencia de tu reserva. Al enviarla verás un número de seguimiento; después nos comunicaremos para gestionar tu solicitud.</p>
      <LegalRequestForm type="baja" />
    </section>
  </LegalShell>;
}
