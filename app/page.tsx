"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { argentinaToday, CONSULTATION_STORAGE_KEY, DRAFT_KEY, newConsultationId, validateConsultation } from "@/lib/consultation";
import type { ConsultationReceipt } from "@/lib/consultation";
import type { FormEvent } from "react";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import {
  CalendarDays, Check, Clock3, CloudRain, MapPin, MessageCircle,
  Navigation, ShieldCheck, Truck,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const WHATSAPP_NUMBER = "5493755639300";
const PLAIN_WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;
const ALBERDI_CENTER: [number, number] = [-27.36032, -55.2324];

const gameImages: Record<string, { src: string; alt: string }> = {
  pelotero: { src: "/juego-pelotero-completo.webp", alt: "Pelotero inflable multicolor" },
  metegol: { src: "/juego-metegol-estadio-completo.webp", alt: "Metegol Estadio de tamaño completo" },
  cama: { src: "/juego-cama-elastica-completa.webp", alt: "Cama elástica Gadnic con red de seguridad" },
};

const combos = [
  { id: "completo", name: "Combo Completo", eyebrow: "Los tres juegos", featured: true },
  { id: "dos", name: "Combo Dúo", eyebrow: "Elegí tus favoritos" },
  { id: "uno", name: "Un juego", eyebrow: "Elegí el que quieras" },
];

const gameOptions = ["Pelotero", "Metegol", "Cama Elástica"];

const durationOptions = [{ hours: 3 }, { hours: 4 }, { hours: 5 }];

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
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [consentError, setConsentError] = useState(false);
  const [website, setWebsite] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [savedCode, setSavedCode] = useState("");
  const [minimumDate, setMinimumDate] = useState("");
  const submissionRef = useRef(false);
  const draftIdRef = useRef("");
  useEffect(() => { setMinimumDate(argentinaToday()); }, []);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const setMapPointRef = useRef<((lat: number, lng: number, focus?: boolean) => void) | null>(null);
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

  const handleComboChange = (value: string) => {
    setComboId(value);
    if (value !== "completo" && window.matchMedia("(max-width: 700px)").matches) {
      requestAnimationFrame(() => {
        document.querySelector(".combo-inline-detail")?.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
          block: "nearest",
        });
      });
    }
  };

  const gameSelector = (id: string) => id === "dos" ? (
    <label className="field-label combo-detail">¿Qué dos juegos preferís?
      <select value={twoGames} onChange={(event) => setTwoGames(event.target.value)}>
        <option>Pelotero + Metegol</option><option>Pelotero + Cama Elástica</option><option>Metegol + Cama Elástica</option>
      </select>
    </label>
  ) : id === "uno" ? (
    <label className="field-label combo-detail">¿Qué juegos preferís?
      <select value={singleGame} onChange={(event) => setSingleGame(event.target.value)}>
        {gameOptions.map((game) => <option key={game}>{game}</option>)}
      </select>
    </label>
  ) : null;

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
          name: { type: "string", description: "Nombre y apellido de la persona adulta." },
          email: { type: "string", description: "Correo Electrónico obligatorio." },
          whatsapp: { type: "string", description: "WhatsApp con código de área." },
          twoGames: { type: "string", enum: ["Pelotero + Metegol", "Pelotero + Cama Elástica", "Metegol + Cama Elástica"] },
          singleGame: { type: "string", enum: gameOptions },
        },
        required: ["comboId"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input) {
        const values = input as Record<string, unknown>;
        if (!validCombos.has(String(values.comboId))) {
          throw new Error("Combo no válido.");
        }
        setComboId(String(values.comboId));
        if (typeof values.date === "string") setDate(values.date);
        if (typeof values.eventTime === "string") setEventTime(values.eventTime);
        if ([3, 4, 5].includes(Number(values.durationHours))) setDurationHours(Number(values.durationHours));
        if (typeof values.latitude === "number" && typeof values.longitude === "number" && Number.isFinite(values.latitude) && Number.isFinite(values.longitude)) {
          setSelectedLocation({ lat: Number(values.latitude), lng: Number(values.longitude) });
          setMapPointRef.current?.(Number(values.latitude), Number(values.longitude), true);
        }
        if (typeof values.name === "string") setFullName(values.name);
        if (typeof values.email === "string") setEmail(values.email);
        if (typeof values.whatsapp === "string") setWhatsapp(values.whatsapp);
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
        setGeoStatus("Ubicación seleccionada.\nPodés moverla tocando otro punto del mapa.");
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

  const submitConsultation = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submissionRef.current) return;
    setSubmitError("");
    if (!marketingConsent) {
      setConsentError(true);
      document.getElementById("marketing-consent")?.focus();
      return;
    }
    if (!selectedLocation) {
      setSubmitError("Marcá la ubicación exacta del evento antes de enviar.");
      document.getElementById("mapa-evento")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    submissionRef.current = true;
    setIsSubmitting(true);
    try {
      if (!draftIdRef.current) {
        try { draftIdRef.current = sessionStorage.getItem(DRAFT_KEY) || ""; } catch { /* Storage can be disabled. */ }
        draftIdRef.current ||= newConsultationId();
        try { sessionStorage.setItem(DRAFT_KEY, draftIdRef.current); } catch { /* In-memory ID still prevents double submission. */ }
      }
      const input = validateConsultation({
        idempotencyKey: draftIdRef.current, name: fullName, email, whatsapp,
        comboId, games: comboGameLabel(comboId), eventDate: date, eventTime, durationHours,
        latitude: selectedLocation.lat, longitude: selectedLocation.lng, marketingConsent,
      });
      const response = await fetch("/api/consultas", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, website }), signal: AbortSignal.timeout(20000),
      });
      const result = await response.json() as { receipt?: ConsultationReceipt; error?: string; resetDraft?: boolean };
      if (!response.ok || !result.receipt) {
        if (result.resetDraft) {
          draftIdRef.current = "";
          try { sessionStorage.removeItem(DRAFT_KEY); } catch { /* Storage can be disabled. */ }
        }
        throw new Error(result.error || "No pudimos guardar tu consulta. Intentá nuevamente.");
      }
      // Only the code travels in the URL; contact and location remain in this tab.
      setSavedCode(result.receipt.code);
      try {
        sessionStorage.setItem(CONSULTATION_STORAGE_KEY, JSON.stringify(result.receipt));
        sessionStorage.removeItem(DRAFT_KEY);
      } catch { /* The confirmation also works with the code alone. */ }
      window.location.assign(`/solicitud-enviada?codigo=${encodeURIComponent(result.receipt.code)}`);
    } catch (error) {
      setSubmitError(error instanceof DOMException ? "No pudimos confirmar la respuesta. Intentá otra vez: conservaremos el mismo código si ya se guardó." : error instanceof Error ? error.message : "No pudimos guardar tu consulta. Intentá nuevamente.");
      submissionRef.current = false;
      setIsSubmitting(false);
    }
  };

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

      <section className="booking-section" id="combos">
        <form className="booking-card consultation-form" onSubmit={submitConsultation} aria-busy={isSubmitting}>
          <div className="booking-heading">
            <div><h2>¡Armá tu diversión!</h2><p>Elegí juegos, fecha y duración a tu gusto.</p></div>
          </div>
          <RadioGroup value={comboId} onValueChange={handleComboChange} aria-label="Combos disponibles" className="combo-options">
            {combos.map((item) => (
              <Fragment key={item.id}>
                <label className={`combo-option ${comboId === item.id ? "selected" : ""}`}>
                  <RadioGroupItem value={item.id} className="combo-radio" aria-label={item.name} />
                  <span className={`combo-gallery images-${comboImages(item.id).length}`} aria-hidden="true">
                    {comboImages(item.id).map((image) => <img key={image.src} src={image.src} alt="" />)}
                  </span>
                  <span className="combo-content">
                    <span className="combo-topline"><strong>{item.name}</strong>{item.featured && <span className="popular">¡Más completo!</span>}</span>
                    <span className="combo-eyebrow">{comboGameLabel(item.id)}</span>
                  </span>
                </label>
                {comboId === item.id && item.id !== "completo" && (
                  <div className="combo-inline-detail">{gameSelector(item.id)}</div>
                )}
              </Fragment>
            ))}
          </RadioGroup>

          {comboId !== "completo" && (
            <div className="combo-detail-desktop">{gameSelector(comboId)}</div>
          )}

          <fieldset className="choice-section">
            <legend>¿Cuánto tiempo querés disfrutarlo?</legend>
            <RadioGroup value={String(durationHours)} onValueChange={(value) => setDurationHours(Number(value))} className="duration-options" aria-label="Duración del alquiler">
              {durationOptions.map((option) => (
                <label key={option.hours} className={`choice-pill ${durationHours === option.hours ? "selected" : ""}`}>
                  <RadioGroupItem value={String(option.hours)} />
                  <span><strong>{option.hours} horas</strong></span>
                </label>
              ))}
            </RadioGroup>
          </fieldset>

          <div className="form-grid event-grid event-grid-simple">
            <label className="field-label"><span><CalendarDays /> Fecha del evento</span><input type="date" required min={minimumDate || undefined} value={date} onChange={(event) => setDate(event.target.value)} /></label>
            <label className="field-label"><span><Clock3 /> Hora de inicio</span><input type="time" required value={eventTime} onChange={(event) => setEventTime(event.target.value)} /></label>
          </div>

          <div className="form-grid contact-grid">
            <label className="field-label">Nombre y Apellido<input name="name" autoComplete="name" required pattern={"\\s*\\S+(?:\\s+\\S+)+\\s*"} title="Ingresá tu nombre y apellido." minLength={3} maxLength={120} value={fullName} onChange={event => setFullName(event.target.value)} placeholder="Tu nombre completo" /></label>
            <label className="field-label">Número de WhatsApp<input name="tel" type="tel" autoComplete="tel" inputMode="tel" required maxLength={25} value={whatsapp} onChange={event => setWhatsapp(event.target.value)} placeholder="3755123456" /></label>
            <label className="field-label">Correo Electrónico<input name="email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={event => setEmail(event.target.value)} placeholder="nombre@gmail.com" /></label>
          </div>
          <label className="consultation-honeypot" aria-hidden="true">Sitio web<input name="website" tabIndex={-1} autoComplete="off" value={website} onChange={event => setWebsite(event.target.value)} /></label>

          <section className="location-picker" id="mapa-evento" aria-labelledby="location-picker-title">
            <div className="location-picker-head">
              <div><span className="map-label"><Navigation /> Ubicación exacta del evento</span><strong id="location-picker-title">Marcá el lugar en el mapa</strong><small className="gps-hint"><span className="gps-hint-full">Usá el GPS y comprobá que el punto sea el lugar del evento.</span><span className="gps-hint-short">Usá el GPS y comprobá el lugar del evento.</span></small></div>
              <button type="button" className="gps-button" onClick={useCurrentLocation}>📍 Usar mi ubicación actual (GPS)</button>
            </div>
            <div ref={mapContainerRef} className="event-map" aria-label="Mapa para elegir la ubicación exacta del evento" />
            <div className={`location-status ${selectedLocation ? "selected" : ""}`} role="status">
              <span>{selectedLocation ? "✓" : "📍"}</span>
              <div><strong>{selectedLocation ? "Ubicación lista" : "Ubicación obligatoria"}</strong><small>{geoStatus}</small></div>
            </div>
          </section>

          <div className={`consultation-consent ${consentError ? "invalid" : ""}`}>
            <label><input id="marketing-consent" type="checkbox" required checked={marketingConsent} aria-invalid={consentError} onInvalid={() => setConsentError(true)} onChange={event => { setMarketingConsent(event.target.checked); if (event.target.checked) setConsentError(false); }} /><span>Acepto que quiero recibir novedades y promociones de Inolvidable Kids.</span></label>
          </div>
          {submitError && <p className="consultation-error" role="alert">{submitError} <a href={PLAIN_WHATSAPP_URL} target="_blank" rel="noreferrer">Hablar por WhatsApp</a></p>}
          {savedCode ? <a className="consultation-saved" href={`/solicitud-enviada?codigo=${encodeURIComponent(savedCode)}`}>Tu consulta {savedCode} se guardó. Ver confirmación →</a> : <Button type="submit" size="lg" disabled={isSubmitting} className="whatsapp-main" onClick={() => setConsentError(!marketingConsent)}><MessageCircle aria-hidden="true" />{isSubmitting ? "Guardando tu consulta…" : "Enviar consulta"}</Button>}
        </form>
      </section>

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
