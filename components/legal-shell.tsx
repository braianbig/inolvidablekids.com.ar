import type { ReactNode } from "react";

const links = [
  { href: "/arrepentimiento", label: "Botón de arrepentimiento" },
  { href: "/baja-de-servicio", label: "Botón de baja de servicio" },
  { href: "/politica-de-privacidad", label: "Política de privacidad" },
  { href: "/terminos-y-condiciones", label: "Términos y condiciones" },
];

export function LegalShell({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  return (
    <main className="legal-page">
      <header className="legal-header">
        <a className="brand" href="/" aria-label="Inolvidable Kids, volver al inicio">
          <img src="/inolvidable-icon.png" alt="" className="brand-icon" />
          <span className="brand-name">Inolvidable</span><span className="brand-kids">KIDS</span>
        </a>
        <a className="legal-back" href="/">Volver al inicio</a>
      </header>
      <section className="legal-hero">
        <div className="legal-hero-inner">
          <span className="legal-eyebrow">Inolvidable Kids · Información y solicitudes</span>
          <h1>{title}</h1>
          <p>{intro}</p>
        </div>
      </section>
      <div className="legal-content">{children}</div>
      <footer className="legal-footer">
        <nav aria-label="Información legal">{links.map(link => <a key={link.href} href={link.href}>{link.label}</a>)}</nav>
        <small className="legal-hours"><span>Atención: Lunes a viernes, de 8:00 a 18:00 horas</span><span>Sábados y domingos, cita previa</span></small>
        <div className="footer-legal">
          <span>© {new Date().getFullYear()} Inolvidable Kids. Todos los derechos reservados.</span>
        </div>
      </footer>
    </main>
  );
}
