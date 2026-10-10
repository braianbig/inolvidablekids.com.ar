import type { Metadata } from "next";
import { LegalShell } from "@/components/legal-shell";
import { LegalRequestForm } from "@/components/legal-request-form";

export const metadata: Metadata = { title: "Botón de arrepentimiento | Inolvidable Kids" };

export default function Arrepentimiento() {
  return <LegalShell title="Botón de arrepentimiento" intro="Podés solicitar la revocación de una contratación realizada a distancia desde esta página.">
    <section className="legal-card legal-request-card">
      <h2>Enviá tu solicitud</h2>
      <p>Completá tus datos para identificar la contratación. Recibirás un número de seguimiento en esta misma pantalla. Revisaremos tu pedido y nos comunicaremos con vos conforme a la normativa aplicable.</p>
      <LegalRequestForm type="arrepentimiento" />
    </section>
  </LegalShell>;
}
