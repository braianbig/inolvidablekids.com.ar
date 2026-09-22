"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import {
  CalendarDays, Check, Clock3, CloudRain, CreditCard, MapPin, MessageCircle,
  Navigation, ShieldCheck, Truck,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const WHATSAPP_NUMBER = "5493755639300";
const PLAIN_WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;
const ALBERDI_CENTER: [number, number] = [-27.36032, -55.2324];

const gameImages: Record<string, { src: string; alt: string }> = {
  pelotero: { src: "/juego-pelotero-cutout.png", alt: "Pelotero inflable multicolor" },
  metegol: { src: "/juego-metegol-estadio-cutout.png", alt: "Metegol Estadio de tamaño completo" },
  cama: { src: "/juego-cama-elastica-cutout.png", alt: "Cama elástica Gadnic con red de seguridad" },
};

const combos = [
  { id: "completo", name: "Combo completo", eyebrow: "Los tres juegos", price: 85000, featured: true },
  { id: "dos", name: "Dos juegos", eyebrow: "Elegí tus favoritos", price: 75000 },
  { id: "uno", name: "Un juego", eyebrow: "Elegí el que quieras", price: 65000 },
];

const gameOptions = ["Pelotero", "Metegol", "Cama Elástica"];

const durationOptions = [
  { hours: 3, extra: 0, label: "Incluido" },
  { hours: 4, extra: 20000, label: "¡Ahorrás $8.000!" },
  { hours: 5, extra: 35000, label: "¡Ahorrás $10.000!" },
];

const paymentMethods = ["Transferencia Bancaria", "Mercado Pago", "Tarjeta de Débito"];

const formatPrice = (value: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(value);

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
  const [comboId, setComboId] = useState("completo");
  const [twoGames, setTwoGames] = useState("Pelotero + Metegol");
  const [singleGame, setSingleGame] = useState("Pelotero");
  const [date, setDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [durationHours, setDurationHours] = useState(3);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState("Elegí el lugar exacto tocando el mapa.");
  const [paymentMethod, setPaymentMethod] = useState("Transferencia Bancaria");
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const setMapPointRef = useRef<((lat: number, lng: number, focus?: boolean) => void) | null>(null);
  const combo = combos.find((item) => item.id === comboId) ?? combos[0];
  const durationExtra = durationOptions.find((item) => item.hours === durationHours)?.extra ?? 0;
  const priceBenefit = durationHours === 3
    ? "3 horas incluidas"
    : durationOptions.find((item) => item.hours === durationHours)?.label;
  const total = combo.price + durationExtra;
  const reservationAmount = total / 2;

  const selectedTwoGameIds = twoGames === "Pelotero + Cama Elástica"
    ? ["pelotero", "cama"]
    : twoGames === "Metegol + Cama Elástica"
      ? ["metegol", "cama"]
      : ["pelotero", "metegol"];

  const selectedSingleGameId = singleGame === "Metegol" ? "metegol" : singleGame === "Cama Elástica" ? "cama" : "pelotero";
  const comboGameLabel = (id: string) => id === "completo"
    ? "Pelotero + Metegol + Cama Elástica"
    : id === "dos"
      ? twoGames
      : singleGame;

  const comboImages = (id: string) => id === "completo"
    ? [gameImages.pelotero, gameImages.metegol, gameImages.cama]
    : id === "dos"
      ? selectedTwoGameIds.map((gameId) => gameImages[gameId])
      : [gameImages[selectedSingleGameId]];

  useEffect(() => {
    const context = (document as unknown as {
      modelContext?: {
        registerTool: (tool: {
          name: string;
          title: string;
          description: string;
          inputSchema: object;
          annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
          execute: (input: unknown) => unknown;
        }, options: { signal: AbortSignal }) => void | Promise<void>;
      };
    }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const validCombos = new Set(["completo", "dos", "uno"]);
    const validPayments = new Set(paymentMethods);
    void Promise.resolve(context.registerTool({
      name: "configure_combo_consultation",
      title: "Configurar consulta de combo",
      description: "Selecciona un combo de Inolvidable Kids y completa los datos visibles de la consulta.",
      inputSchema: {
        type: "object",
        properties: {
          comboId: { type: "string", enum: ["completo", "dos", "uno"] },
          date: { type: "string", description: "Fecha en formato AAAA-MM-DD." },
          eventTime: { type: "string", description: "Hora de inicio en formato HH:MM." },
          durationHours: { type: "number", enum: [3, 4, 5] },
          latitude: { type: "number", description: "Latitud exacta del evento." },
          longitude: { type: "number", description: "Longitud exacta del evento." },
          paymentMethod: { type: "string", enum: paymentMethods },
          twoGames: { type: "string", enum: ["Pelotero + Metegol", "Pelotero + Cama Elástica", "Metegol + Cama Elástica"] },
          singleGame: { type: "string", enum: gameOptions },
        },
        required: ["comboId"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input) {
        const values = input as Record<string, unknown>;
        if (!validCombos.has(String(values.comboId)) || (values.paymentMethod && !validPayments.has(String(values.paymentMethod)))) {
          throw new Error("Combo o medio de pago no válidos.");
        }
        setComboId(String(values.comboId));
        if (typeof values.date === "string") setDate(values.date);
        if (typeof values.eventTime === "string") setEventTime(values.eventTime);
        if ([3, 4, 5].includes(Number(values.durationHours))) setDurationHours(Number(values.durationHours));
        if (typeof values.latitude === "number" && typeof values.longitude === "number" && Number.isFinite(values.latitude) && Number.isFinite(values.longitude)) {
          setSelectedLocation({ lat: Number(values.latitude), lng: Number(values.longitude) });
          setMapPointRef.current?.(Number(values.latitude), Number(values.longitude), true);
        }
        if (typeof values.paymentMethod === "string") setPaymentMethod(values.paymentMethod);
        if (typeof values.twoGames === "string") setTwoGames(values.twoGames);
        if (typeof values.singleGame === "string") setSingleGame(values.singleGame);
        document.querySelector("#combos")?.scrollIntoView({ behavior: "smooth", block: "center" });
        return { configured: true, comboId: values.comboId };
      },
    }, { signal: lifecycle.signal })).catch(() => undefined);
    return () => lifecycle.abort();
  }, []);

  useEffect(() => {
    let disposed = false;
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    void import("leaflet").then((leafletModule) => {
      if (disposed || !mapContainerRef.current) return;
      const L = leafletModule.default ?? leafletModule;
      const map = L.map(mapContainerRef.current, { scrollWheelZoom: false }).setView(ALBERDI_CENTER, 12);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);
      const pinIcon = L.divIcon({
        className: "event-map-marker",
        html: "<span aria-hidden=\"true\">📍</span>",
        iconSize: [42, 42],
        iconAnchor: [21, 39],
      });
      const setPoint = (lat: number, lng: number, focus = false) => {
        const point = L.latLng(lat, lng);
        if (markerRef.current) markerRef.current.setLatLng(point);
        else markerRef.current = L.marker(point, { icon: pinIcon }).addTo(map);
        if (focus) map.setView(point, 16);
        setSelectedLocation({ lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) });
        setGeoStatus("Ubicación seleccionada. Podés moverla tocando otro punto del mapa.");
      };
      map.on("click", (event) => setPoint(event.latlng.lat, event.latlng.lng));
      mapInstanceRef.current = map;
      setMapPointRef.current = setPoint;
      window.setTimeout(() => map.invalidateSize(), 0);
    });

    return () => {
      disposed = true;
      setMapPointRef.current = null;
      markerRef.current = null;
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus("Tu dispositivo no permite obtener la ubicación automáticamente.");
      return;
    }
    setGeoStatus("Buscando tu ubicación…");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setMapPointRef.current?.(coords.latitude, coords.longitude, true),
      () => setGeoStatus("No pudimos acceder al GPS. Permití la ubicación o marcá el lugar en el mapa."),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
    );
  };

  const googleMapsLink = selectedLocation
    ? `https://google.com/maps?q=${selectedLocation.lat},${selectedLocation.lng}`
    : "";

  const whatsappUrl = useMemo(() => {
    const detail = comboId === "dos" ? ` (${twoGames})` : comboId === "uno" ? ` (${singleGame})` : "";
    const message = [
      "Hola, Inolvidable Kids 👋",
      `Quiero consultar disponibilidad para ${combo.name}${detail}.`,
      `Fecha: ${date || "a confirmar"}.`,
      `Hora de inicio: ${eventTime || "a confirmar"}.`,
      `Duración: ${durationHours} horas.`,
      googleMapsLink ? `Ubicación del evento: ${googleMapsLink}.` : "Ubicación exacta: todavía no seleccionada.",
      `Medio de pago preferido: ${paymentMethod}.`,
      `Total estimado: ${formatPrice(total)}.`,
      `Reservación 50%: ${formatPrice(reservationAmount)}.`,
    ].filter(Boolean).join("\n");
    return `${PLAIN_WHATSAPP_URL}?text=${encodeURIComponent(message)}`;
  }, [combo.name, comboId, date, durationHours, eventTime, googleMapsLink, paymentMethod, reservationAmount, singleGame, total, twoGames]);

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#inicio" aria-label="Inolvidable Kids, inicio">
          <img src="/inolvidable-icon.png" alt="" className="brand-icon" />
          <span className="brand-name">Inolvidable</span>
          <span className="brand-kids">KIDS</span>
        </a>
        <nav className="desktop-nav" aria-label="Navegación principal">
          <a href="#combos">Combos</a><a href="#fechas">Fechas</a>
          <a href="#seguridad">Seguridad</a><a href="#preguntas">Preguntas</a>
        </nav>
        <Button asChild className="header-cta">
          <a href={PLAIN_WHATSAPP_URL} target="_blank" rel="noreferrer"><img src="/social-whatsapp-light.png" alt="" /> <span>WhatsApp</span></a>
        </Button>
      </header>

      <section className="hero" id="inicio">
        <div className="hero-copy">
          <div className="location-pill" data-detector-ignore="true"><MapPin /> Colonia Alberdi, General Alvear, Oberá y Alrededores</div>
          <h1>
            <span>Llevamos la diversión</span>
            <span>para recuerdos inolvidables</span>
          </h1>
          <p className="hero-lead"><span>Alquiler de peloteros, metegoles y camas elásticas</span><span>para cumpleaños en tu casa o donde quieras.</span></p>
          <div className="hero-actions">
            <Button asChild size="lg" className="primary-action sparkle-action"><a href="#combos"><SparkleButtonLabel>¡Elegir mi combo!</SparkleButtonLabel></a></Button>
          </div>
          <div className="trust-row" aria-label="Beneficios principales">
            <span><Truck /> Traslado gratis en Colonia Alberdi</span>
            <span><ShieldCheck /> Equipos probados</span>
            <span><CloudRain /> Reprogramación por lluvia</span>
          </div>
          <div className="payment-teaser">
            <div className="payment-heading"><CreditCard /><strong>Métodos de pago</strong></div>
            <span>Transferencia Bancaria · Mercado Pago · Tarjeta de Débito</span>
          </div>
        </div>
      </section>

      <section className="booking-section" id="combos">
        <div className="booking-card">
          <div className="booking-heading">
            <div><span className="section-kicker booking-kicker">La diversión empieza acá</span><h2>¡Armá tu combo!</h2><p>Elegí tus juegos, la fecha y el tiempo que necesitás.</p></div>
            <span className="duration"><Clock3 /> {durationHours} horas</span>
          </div>
          <RadioGroup value={comboId} onValueChange={setComboId} aria-label="Combos disponibles" className="combo-options">
            {combos.map((item) => (
              <label key={item.id} className={`combo-option ${comboId === item.id ? "selected" : ""}`}>
                <RadioGroupItem value={item.id} className="combo-radio" aria-label={item.name} />
                <span className={`combo-gallery images-${comboImages(item.id).length}`} aria-hidden="true">
                  {comboImages(item.id).map((image) => <img key={image.src} src={image.src} alt="" />)}
                </span>
                <span className="combo-content">
                  <span className="combo-topline"><strong>{item.name}</strong>{item.featured && <span className="popular">Más completo</span>}</span>
                  <span className="combo-eyebrow">{comboGameLabel(item.id)}</span>
                  <strong className="combo-price">{item.id === "uno" ? "Desde " : ""}{formatPrice(item.price)}</strong>
                </span>
              </label>
            ))}
          </RadioGroup>

          {comboId === "dos" && (
            <label className="field-label combo-detail">¿Qué dos juegos preferís?
              <select value={twoGames} onChange={(event) => setTwoGames(event.target.value)}>
                <option>Pelotero + Metegol</option><option>Pelotero + Cama Elástica</option><option>Metegol + Cama Elástica</option>
              </select>
            </label>
          )}

          {comboId === "uno" && (
            <label className="field-label combo-detail">¿Qué juego preferís?
              <select value={singleGame} onChange={(event) => setSingleGame(event.target.value)}>
                {gameOptions.map((game) => <option key={game}>{game}</option>)}
              </select>
            </label>
          )}

          <fieldset className="choice-section">
            <legend>¿Cuánto tiempo querés disfrutarlo?</legend>
            <RadioGroup value={String(durationHours)} onValueChange={(value) => setDurationHours(Number(value))} className="duration-options" aria-label="Duración del alquiler">
              {durationOptions.map((option) => (
                <label key={option.hours} className={`choice-pill ${durationHours === option.hours ? "selected" : ""}`}>
                  <RadioGroupItem value={String(option.hours)} />
                  <span><strong>{option.hours} horas</strong><small className={option.hours > 3 ? "saving-label" : ""}>{option.label}</small></span>
                </label>
              ))}
            </RadioGroup>
          </fieldset>

          <div className="form-grid event-grid event-grid-simple">
            <label className="field-label"><span><CalendarDays /> Fecha del evento</span><input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
            <label className="field-label"><span><Clock3 /> Hora de inicio</span><input type="time" value={eventTime} onChange={(event) => setEventTime(event.target.value)} /></label>
          </div>

          <section className="location-picker" id="mapa-evento" aria-labelledby="location-picker-title">
            <div className="location-picker-head">
              <div><span className="map-label"><Navigation /> Ubicación exacta del evento</span><strong id="location-picker-title">Marcá el lugar en el mapa</strong></div>
              <button type="button" className="gps-button" onClick={useCurrentLocation}>📍 Usar mi ubicación actual (GPS)</button>
            </div>
            <div ref={mapContainerRef} className="event-map" aria-label="Mapa para elegir la ubicación exacta del evento" />
            <div className={`location-status ${selectedLocation ? "selected" : ""}`} role="status">
              <span>{selectedLocation ? "✓" : "📍"}</span>
              <div><strong>{selectedLocation ? "Ubicación lista" : "Ubicación obligatoria"}</strong><small>{geoStatus}</small></div>
            </div>
          </section>

          <fieldset className="choice-section payment-section">
            <legend><CreditCard /> Medio de pago preferido</legend>
            <p className="payment-only-note">Transferencia Bancaria, Mercado Pago o Tarjeta de Débito.</p>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="payment-options" aria-label="Medio de pago">
              {paymentMethods.map((method) => (
                <label key={method} className={`payment-option ${paymentMethod === method ? "selected" : ""}`}>
                  <RadioGroupItem value={method} /> <span><strong>{method}</strong></span>
                </label>
              ))}
            </RadioGroup>
          </fieldset>

          <div className="price-summary">
            <div><span className="price-label">Total Estimado<small>{priceBenefit}</small></span><strong>{formatPrice(total)}</strong></div>
            <div className="deposit"><span>Reservación 50%</span><strong>{formatPrice(reservationAmount)}</strong></div>
          </div>
          <Button asChild size="lg" className={`whatsapp-main ${selectedLocation ? "" : "location-required"}`}><a href={selectedLocation ? whatsappUrl : "#mapa-evento"} target={selectedLocation ? "_blank" : undefined} rel={selectedLocation ? "noreferrer" : undefined}><img src="/social-whatsapp-light.png" alt="" /> {selectedLocation ? "Consultar Disponibilidad" : "Seleccioná la ubicación para consultar"}</a></Button>
          <p className="booking-note"><span>(Traslado gratis en Colonia Alberdi)</span><span>Para otras zonas, el flete se cotiza según la ubicación marcada.</span></p>
        </div>
      </section>

      <section className="calendar-section" id="fechas">
        <div className="calendar-heading">
          <span className="section-kicker light">¿Está libre tu fecha?</span>
          <h2>Consultá nuestras fechas disponibles</h2>
          <p>Revisá el calendario y después armá tu combo para confirmar la disponibilidad.</p>
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
            <div className="equipment-media"><img className="equipment-corner-brand brand-fabrica" src="/marca-fabrica-inflables.png" alt="La Fábrica de Inflables" /><img className="equipment-product" src="/juego-pelotero-cutout.png" alt="Pelotero inflable multicolor con entrada y tobogán" /></div>
            <div className="equipment-copy">
              <h3>Juego, saltos y tobogán</h3><p>Inflable 3x4 metros con rampa.</p>
              <ul className="equipment-features"><li>Rampa lateral para deslizarse</li><li>Amplia zona de saltos y juego</li><li>Ideal para cumpleaños infantiles</li></ul>
            </div>
          </article>
          <article className="equipment-card">
            <div className="equipment-media"><img className="equipment-corner-brand brand-gadnic" src="/marca-gadnic.png" alt="Gadnic" /><img className="equipment-product" src="/juego-cama-elastica-cutout.png" alt="Cama elástica Gadnic azul con red protectora" /></div>
            <div className="equipment-copy">
              <h3>Cama Elástica Gadnic</h3><p>Salto uniforme y cómodo.</p>
              <ul className="equipment-features"><li>Red de protección en todo el contorno</li><li>Superficie amplia para saltar</li><li>Uso infantil con supervisión adulta</li></ul>
            </div>
          </article>
          <article className="equipment-card equipment-card-estadio">
            <div className="equipment-media"><img className="equipment-corner-brand brand-estadio" src="/marca-estadio.png" alt="Estadio" /><img className="equipment-product" src="/juego-metegol-estadio-cutout.png" alt="Metegol Estadio con jugadores de Argentina y Brasil" /></div>
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
        <div><span className="section-kicker">Si el clima no acompaña</span><h2>Tu reservación pasa a una nueva fecha.</h2><p>Podés reprogramar una vez sin costo por lluvia o condiciones que no permitan una instalación segura, sujeto a disponibilidad.</p></div>
        <a href="#preguntas">Ver condiciones <span aria-hidden="true">→</span></a>
      </section>

      <section className="section faq-section" id="preguntas">
        <div className="section-heading compact"><span className="section-kicker">Antes de reservar</span><h2>Preguntas frecuentes</h2></div>
        <Accordion type="single" collapsible className="faq-list">
          <AccordionItem value="lluvia"><AccordionTrigger>¿Qué pasa si llueve?</AccordionTrigger><AccordionContent>Reprogramamos una vez sin costo, sujeto a disponibilidad. La reservación pasa a la nueva fecha.</AccordionContent></AccordionItem>
          <AccordionItem value="flete"><AccordionTrigger>¿El flete está incluido?</AccordionTrigger><AccordionContent>Sí, dentro de Colonia Alberdi. Para General Alvear, Oberá y alrededores se cotiza según la distancia.</AccordionContent></AccordionItem>
          <AccordionItem value="limpieza"><AccordionTrigger>¿Los juegos se entregan limpios?</AccordionTrigger><AccordionContent>Sí. Los equipos se limpian, revisan y prueban antes de cada evento.</AccordionContent></AccordionItem>
          <AccordionItem value="pagos"><AccordionTrigger>¿Cómo puedo pagar?</AccordionTrigger><AccordionContent>Aceptamos Transferencia Bancaria, Mercado Pago y Tarjeta de Débito. La fecha se confirma con una reservación del 50%.</AccordionContent></AccordionItem>
          <AccordionItem value="armado"><AccordionTrigger>¿Cuánto tarda el armado?</AccordionTrigger><AccordionContent>Depende del combo y del acceso al lugar. Coordinamos la llegada con anticipación para dejar todo listo antes del festejo.</AccordionContent></AccordionItem>
          <AccordionItem value="precio"><AccordionTrigger>¿Qué incluye el precio base?</AccordionTrigger><AccordionContent>Incluye 3 horas, traslado dentro de Colonia Alberdi, instalación, prueba de los equipos y retiro coordinado.</AccordionContent></AccordionItem>
          <AccordionItem value="ahorro"><AccordionTrigger>¿Cómo se calcula el ahorro por horas extras?</AccordionTrigger><AccordionContent>El selector actualiza el total automáticamente: con 4 horas ahorrás $8.000 y con 5 horas ahorrás $10.000.</AccordionContent></AccordionItem>
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
        </div>
        <div className="fiscal-section">
          <a href="https://qr.afip.gob.ar/?qr=dtFKsQDLajD3yE-P0kGaEg,," target="_F960AFIPInfo" rel="noreferrer" className="fiscal-link">
            <img src="https://www.afip.gob.ar/images/f960/DATAWEB.jpg" alt="Formulario 960/D - Data Fiscal" />
            <span><strong>Comercio Registrado</strong><small>Consultá nuestra Data Fiscal en ARCA</small></span>
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
