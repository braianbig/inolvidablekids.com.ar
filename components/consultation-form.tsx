"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import { CalendarDays, Clock3, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { argentinaToday, CONSULTATION_STORAGE_KEY, DRAFT_KEY, newConsultationId, validateConsultation, WHATSAPP_NUMBER } from "@/lib/consultation";
import type { ConsultationReceipt } from "@/lib/consultation";

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

export function ConsultationForm({ standalone = false }: { standalone?: boolean }) {
  const Heading = standalone ? "h1" : "h2";
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
  const [attempted, setAttempted] = useState(false);
  const [locationError, setLocationError] = useState(false);
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
        setGeoStatus("Podés moverla tocando otro punto del mapa.");
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
      () => setGeoStatus("No pudimos acceder al GPS.\nPermití la ubicación o marcá el lugar en el mapa."),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
    );
  };

  const submitConsultation = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submissionRef.current) return;
    setSubmitError("");
    setAttempted(true);
    setConsentError(!marketingConsent);
    setLocationError(!selectedLocation);
    const form = event.currentTarget;
    const invalid = form.querySelector<HTMLInputElement>("input:invalid");
    if (invalid) {
      invalid.scrollIntoView({ behavior: "smooth", block: "center" });
      invalid.focus({ preventScroll: true });
      return;
    }
    if (!selectedLocation) {
      document.getElementById("mapa-evento")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
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
    <section className="booking-section" id="combos">
      <form className={`booking-card consultation-form${attempted ? " validation-attempted" : ""}`} noValidate onSubmit={submitConsultation} aria-busy={isSubmitting}>
        <div className="booking-heading">
          <div><Heading>¡Armá tu diversión!</Heading><p>Elegí juegos, fecha y duración a tu gusto.</p></div>
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
          <div className={`location-status ${selectedLocation ? "selected" : locationError ? "invalid" : ""}`} role="status">
            <span>{selectedLocation ? "✓" : "📍"}</span>
            <div><strong>{selectedLocation ? "Ubicación lista" : locationError ? "Falta la ubicación" : "Ubicación obligatoria"}</strong><small>{(locationError && !selectedLocation ? "Necesitamos conocer la ubicación del cumpleaños." : geoStatus).split("\n").map((line, index) => <Fragment key={index}>{index > 0 && <br />}{line}</Fragment>)}</small></div>
          </div>
        </section>

        <div className={`consultation-consent${consentError ? " invalid" : ""}`}>
          <p>Usaremos tus datos para registrar y responder esta consulta, según nuestra política de privacidad.</p>
          <label><input id="marketing-consent" type="checkbox" checked={marketingConsent} aria-invalid={consentError} onChange={event => { setMarketingConsent(event.target.checked); if (event.target.checked) setConsentError(false); }} /><span>Quiero recibir novedades y promociones de Inolvidable Kids. Luego podés darte de baja.</span></label>
        </div>
        {submitError && <p className="consultation-error" role="alert">{submitError} <a href={PLAIN_WHATSAPP_URL} target="_blank" rel="noreferrer">Hablar por WhatsApp</a></p>}
        {savedCode ? <a className="consultation-saved" href={`/solicitud-enviada?codigo=${encodeURIComponent(savedCode)}`}>Tu consulta {savedCode} se guardó. Ver confirmación →</a> : <Button type="submit" size="lg" disabled={isSubmitting} className="whatsapp-main">{isSubmitting ? "Guardando tu consulta…" : "Enviar consulta"}</Button>}
      </form>
    </section>
  );
}
