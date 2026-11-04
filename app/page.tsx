"use client";

import { Check, CloudRain, MapPin, ShieldCheck, Truck } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ConsultationForm } from "@/components/consultation-form";
import { WHATSAPP_NUMBER } from "@/lib/consultation";

const PLAIN_WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

function SparkleButtonLabel({ children }: { children: string }) {
  return (
    <>
      <span className="sparkle-dots-border" aria-hidden="true" />
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="sparkle-icon" aria-hidden="true">
        <path className="sparkle-path" strokeLinejoin="round" strokeLinecap="round" d="M14.187 8.096 15 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L21.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09L15 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L8.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09Z" />
        <path className="sparkle-path" strokeLinejoin="round" strokeLinecap="round" d="m6 14.25-.259 1.035a3.75 3.75 0 0 1-2.456 2.456L2.25 18l1.035.259a3.75 3.75 0 0 1 2.456 2.456L6 21.75l.259-1.035a3.75 3.75 0 0 1 2.455-2.456L9.75 18l-1.036-.259a3.75 3.75 0 0 1-2.455-2.456L6 14.25Z" />
        <path className="sparkle-path" strokeLinejoin="round" strokeLinecap="round" d="m6.5 4-.197.592a1.5 1.5 0 0 1-.711.711L5 5.5l.592.197a1.5 1.5 0 0 1 .711.711L6.5 7l.197-.592a1.5 1.5 0 0 1 .711-.711L8 5.5l-.592-.197a1.5 1.5 0 0 1-.711-.711L6.5 4Z" />
      </svg>
      <span className="sparkle-text">{children}</span>
    </>
  );
}

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#inicio" aria-label="Inolvidable Kids, inicio">
          <img src="/inolvidable-icon.png" alt="" className="brand-icon" />
          <span className="brand-name">Inolvidable</span>
          <span className="brand-kids">KIDS</span>
        </a>
        <nav className="desktop-nav" aria-label="Navegación principal">
          <a href="#combos">Combos</a><a href="/arrepentimiento">Botón de arrepentimiento</a><a href="#fechas">Fechas</a>
          <a href="#seguridad">Seguridad</a><a href="#preguntas">Preguntas</a>
        </nav>
        <Button asChild className="header-cta">
          <a href={PLAIN_WHATSAPP_URL} target="_blank" rel="noreferrer"><img src="/social-whatsapp-light.png" alt="" /> <span>WhatsApp</span></a>
        </Button>
      </header>

      <section className="hero" id="inicio">
        <div className="hero-copy">
          <div className="location-pill" data-detector-ignore="true"><MapPin /> Colonia Alberdi, Oberá, Alvear y más</div>
          <h1>
            <span>¡Los mejores juegos </span>
            <span>para recuerdos inolvidables!</span>
          </h1>
          <p className="hero-lead"><span>Alquiler de peloteros, metegoles y camas elásticas </span><span>para cumpleaños en tu casa o donde quieras.</span></p>
          <div className="hero-actions">
            <Button asChild size="lg" className="primary-action sparkle-action"><a href="#combos"><SparkleButtonLabel>¡Elegir mi combo!</SparkleButtonLabel></a></Button>
          </div>
          <div className="trust-row" aria-label="Beneficios principales">
            <span><Truck /> Traslado gratis</span>
            <span><ShieldCheck /> Equipos probados</span>
            <span><CloudRain /> Reprogramación por lluvia</span>
          </div>
        </div>
      </section>

      <ConsultationForm />

      <section className="calendar-section" id="fechas">
        <div className="calendar-heading">
          <span className="section-kicker light">¿Está libre tu fecha?</span>
          <h2>Consultá nuestras fechas disponibles</h2>
          <p>El calendario muestra los alquileres que ya tenemos programados, con su fecha y horario. Aunque aparezca una reserva el día de tu festejo, podría quedar otro turno disponible. Elegí tu combo y consultanos para confirmar la fecha y el horario que preferís.</p>
          <Button asChild size="lg" className="calendar-cta sparkle-action"><a href="#combos"><SparkleButtonLabel>¡Armá tu combo ahora!</SparkleButtonLabel></a></Button>
        </div>
        <div className="calendar-frame">
          <iframe
            src="https://calendar.google.com/calendar/embed?src=inolvidablekids%40gmail.com&ctz=America%2FArgentina%2FCordoba"
            title="Calendario de fechas disponibles de Inolvidable Kids"
            frameBorder="0"
            scrolling="no"
          />
        </div>
      </section>

      <section className="equipment-section" id="equipos">
        <div className="section-heading compact">
          <span className="section-kicker">Antes de elegir</span>
          <h2>Conocé cada juego de cerca.</h2>
          <p>Modelos seleccionados para crear una experiencia divertida, segura y memorable.</p>
        </div>
        <div className="equipment-grid">
          <article className="equipment-card">
            <div className="equipment-media"><img className="equipment-corner-brand brand-fabrica" src="/marca-fabrica-inflables.png" alt="La Fábrica de Inflables" /><img className="equipment-product" src="/juego-pelotero-completo.webp" alt="Pelotero inflable multicolor con entrada y tobogán" /></div>
            <div className="equipment-copy">
              <h3>Juego, saltos y tobogán</h3><p>Inflable 3x4 metros con rampa.</p>
              <ul className="equipment-features"><li>Rampa lateral para deslizarse</li><li>Amplia zona de saltos y juego</li><li>Ideal para cumpleaños infantiles</li></ul>
            </div>
          </article>
          <article className="equipment-card">
            <div className="equipment-media"><img className="equipment-corner-brand brand-gadnic" src="/marca-gadnic.png" alt="Gadnic" /><img className="equipment-product" src="/juego-cama-elastica-completa.webp" alt="Cama elástica Gadnic azul con red protectora" /></div>
            <div className="equipment-copy">
              <h3>Cama Elástica Gadnic</h3><p>Salto uniforme y cómodo.</p>
              <ul className="equipment-features"><li>Red de protección en todo el contorno</li><li>Superficie amplia para saltar</li><li>Uso infantil con supervisión adulta</li></ul>
            </div>
          </article>
          <article className="equipment-card equipment-card-estadio">
            <div className="equipment-media"><img className="equipment-corner-brand brand-estadio" src="/marca-estadio.png" alt="Estadio" /><img className="equipment-product" src="/juego-metegol-estadio-completo.webp" alt="Metegol Estadio con jugadores de Argentina y Brasil" /></div>
            <div className="equipment-copy">
              <h3>Metegol Estadio Profesional</h3><p>Diversión para chicos y grandes.</p>
              <ul className="equipment-features"><li>Tamaño profesional para jugar cómodos</li><li>Jugadores de Argentina y Brasil</li><li>Diversión para chicos y grandes</li></ul>
            </div>
          </article>
        </div>
      </section>

      <section className="section safety-section" id="seguridad">
        <div className="safety-copy">
          <span className="section-kicker light">Diversión responsable</span>
          <h2>Un espacio preparado hace la diferencia.</h2>
          <p>Antes del evento confirmamos con la familia que el lugar permita una instalación firme, cómoda y segura. Trabajamos con equipos nuevos, a estrenar, que se entregan limpios y desinfectados para cuidar a los más chicos. Además, entregamos un comprobante oficial de la contratación para mayor tranquilidad.</p>
        </div>
        <ul className="safety-list">
          <li><Check /> Lugar firme, nivelado y despejado</li><li><Check /> Distancia segura de ramas, cables y obstáculos</li>
          <li><Check /> Toma eléctrica cercana y protegida</li><li><Check /> Acceso libre para instalar y retirar</li>
          <li><Check /> Supervisión adulta durante el uso</li><li><Check /> Equipos nuevos, limpios y desinfectados</li>
          <li><Check /> Revisión y prueba antes de cada evento</li><li><Check /> Comprobante oficial de contratación</li>
        </ul>
      </section>

      <section className="section weather-section">
        <CloudRain />
        <div><span className="section-kicker">Si el clima no acompaña</span><h2>Si llueve, buscamos otra fecha o te devolvemos el pago.</h2><p>Podés reprogramar sin costo si el clima impide una instalación segura. Si preferís cancelar, te devolvemos lo abonado.</p></div>
        <a href="#preguntas">Ver condiciones <span aria-hidden="true">→</span></a>
      </section>

      <section className="section faq-section" id="preguntas">
        <div className="section-heading compact"><span className="section-kicker">Antes de reservar</span><h2>Preguntas frecuentes</h2></div>
        <Accordion type="single" collapsible className="faq-list">
          <AccordionItem value="lluvia"><AccordionTrigger>¿Qué pasa si llueve?</AccordionTrigger><AccordionContent>Buscamos una nueva fecha sin costo. Si preferís cancelar, te devolvemos el total abonado.</AccordionContent></AccordionItem>
          <AccordionItem value="flete"><AccordionTrigger>¿El flete está incluido?</AccordionTrigger><AccordionContent>Sí, dentro de Colonia Alberdi. Para General Alvear, Oberá y alrededores se cotiza según la distancia.</AccordionContent></AccordionItem>
          <AccordionItem value="limpieza"><AccordionTrigger>¿Los juegos se entregan limpios?</AccordionTrigger><AccordionContent>Sí. Los equipos se limpian, revisan y prueban antes de cada evento.</AccordionContent></AccordionItem>
          <AccordionItem value="pagos"><AccordionTrigger>¿Cómo puedo pagar?</AccordionTrigger><AccordionContent>Aceptamos transferencia bancaria, Mercado Pago, tarjeta de débito, tarjeta de crédito y efectivo. El pago completo, incluido el traslado si corresponde, se realiza antes de que salgamos a instalar.</AccordionContent></AccordionItem>
          <AccordionItem value="armado"><AccordionTrigger>¿Cuánto tarda el armado?</AccordionTrigger><AccordionContent>Depende del combo y del acceso. Coordinamos el armado para dejar todo listo antes del festejo.</AccordionContent></AccordionItem>
          <AccordionItem value="precio"><AccordionTrigger>¿Qué incluye el precio base?</AccordionTrigger><AccordionContent>Incluye 3 horas, traslado dentro de Colonia Alberdi, instalación, prueba de los equipos y retiro coordinado.</AccordionContent></AccordionItem>
        </Accordion>
      </section>

      <section className="final-cta">
        <img src="/inolvidable-icon.png" alt="" />
        <div><span className="section-kicker light">¿Ya tenés la fecha?</span><h2>Hagamos que sea inolvidable.</h2><p>Elegí tu combo y consultanos la disponibilidad por WhatsApp.</p></div>
        <Button asChild size="lg" className="final-button sparkle-action"><a href="#combos"><SparkleButtonLabel>¡Elegir un combo!</SparkleButtonLabel></a></Button>
      </section>

      <footer>
        <div className="footer-main">
          <div className="footer-links"><a href="#fechas">Fechas disponibles</a><a href="#combos">Combos</a><a href="#seguridad">Seguridad</a><a href="#preguntas">Preguntas frecuentes</a></div>
          <nav className="footer-policy-links" aria-label="Información legal">
            <a href="/terminos-y-condiciones">Términos y condiciones</a>
            <a href="/politica-de-privacidad">Política de privacidad</a>
            <a href="/arrepentimiento">Botón de arrepentimiento</a>
            <a href="/baja-de-servicio">Botón de baja de servicio</a>
          </nav>
        </div>
        <div className="fiscal-section">
          <a href="http://qr.afip.gob.ar/?qr=CCmIBpS5hK1gtpBgoJX9ZA,," target="_F960AFIPInfo" rel="noreferrer" className="fiscal-link">
            <img src="https://www.afip.gob.ar/images/f960/DATAWEB.jpg" alt="Formulario 960/D - Data Fiscal" />
            <span><strong>Comercio Registrado</strong><small>Data Fiscal En ARCA</small></span>
          </a>
        </div>
        <div className="social-section">
          <strong>¡Síguenos en nuestras redes sociales!</strong>
          <div className="social-links">
            <a href="https://www.instagram.com/inolvidablekids/" target="_blank" rel="noreferrer"><img src="/social-instagram.png" alt="" /><span>Instagram</span></a>
            <a href="https://www.tiktok.com/@inolvidablekids" target="_blank" rel="noreferrer"><img src="/social-tiktok.png" alt="" /><span>TikTok</span></a>
            <a href={PLAIN_WHATSAPP_URL} target="_blank" rel="noreferrer"><img src="/social-whatsapp.png" alt="" /><span>WhatsApp</span></a>
            <a href="https://www.facebook.com/profile.php?id=61594786734250" target="_blank" rel="noreferrer"><img src="/social-facebook.png" alt="" /><span>Facebook</span></a>
            <a href="https://www.youtube.com/@InolvidableKids" target="_blank" rel="noreferrer"><img src="/social-youtube.png" alt="" /><span>YouTube</span></a>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-legal">
            <span>© {new Date().getFullYear()} Inolvidable Kids. Todos los derechos reservados.</span>
            <span className="footer-love"><span aria-hidden="true">♥</span> Hecho con amor para todos los niños.</span>
          </div>
        </div>
      </footer>
      <a className="floating-whatsapp" href={PLAIN_WHATSAPP_URL} target="_blank" rel="noreferrer" aria-label="Consultar por WhatsApp"><img src="/social-whatsapp.png" alt="" /></a>
    </main>
  );
}
