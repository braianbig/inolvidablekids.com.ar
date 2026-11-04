export const CONSULTATION_STORAGE_KEY = "ik:consultation-receipt";
export const DRAFT_KEY = "ik:consultation-draft-id";
export const WHATSAPP_NUMBER = "5493755639300";

export function newConsultationId() {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  // Local HTTP previews lack randomUUID, but still support cryptographic bytes.
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 15) | 64;
  bytes[8] = (bytes[8] & 63) | 128;
  const hex = Array.from(bytes, value => value.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export type ConsultationInput = {
  idempotencyKey: string;
  name: string;
  email: string;
  whatsapp: string;
  comboId: "completo" | "dos" | "uno";
  games: string;
  eventDate: string;
  eventTime: string;
  durationHours: number;
  latitude: number;
  longitude: number;
  marketingConsent: boolean;
};
export type ConsultationReceipt = ConsultationInput & { code: string; mapsUrl: string; createdAt: string };

export function argentinaToday(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Argentina/Buenos_Aires", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

export function normalizeWhatsapp(value: string) {
  const digits = value.replace(/\D/g, "");
  // Argentine area code + subscriber number; also accept an international number.
  if (digits.length === 10) return `+549${digits}`;
  return `+${digits}`;
}

export function validateConsultation(body: unknown, today = argentinaToday()): ConsultationInput {
  if (!body || typeof body !== "object") throw new Error("Revisá los datos de tu consulta.");
  const b = body as Record<string, unknown>;
  const text = (key: string) => typeof b[key] === "string" ? (b[key] as string).trim() : "";
  const name = text("name");
  const email = text("email");
  const rawPhone = text("whatsapp");
  const whatsapp = normalizeWhatsapp(rawPhone);
  const comboId = text("comboId");
  const games = text("games");
  const eventDate = text("eventDate");
  const eventTime = text("eventTime");
  const idempotencyKey = text("idempotencyKey");
  const gameChoices: Record<string, string[]> = {
    completo: ["Pelotero + Metegol + Cama Elástica"],
    dos: ["Pelotero + Metegol", "Pelotero + Cama Elástica", "Metegol + Cama Elástica"],
    uno: ["Pelotero", "Metegol", "Cama Elástica"],
  };
  if (!/^[a-f0-9-]{36}$/i.test(idempotencyKey)) throw new Error("Actualizá la página e intentá nuevamente.");
  if (name.length < 3 || name.length > 120 || name.split(/\s+/).length < 2 || /[\r\n\x00-\x1f]/.test(name)) throw new Error("Ingresá tu nombre y apellido.");
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Revisá tu correo electrónico.");
  if (!/^[+\d\s().-]+$/.test(rawPhone) || !/^\+[1-9]\d{9,14}$/.test(whatsapp)) throw new Error("Ingresá un WhatsApp válido con código de área.");
  if (!Object.hasOwn(gameChoices, comboId) || !gameChoices[comboId].includes(games)) throw new Error("Elegí los juegos de tu combo.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(eventDate) || !Number.isFinite(Date.parse(`${eventDate}T12:00:00Z`)) || new Date(`${eventDate}T12:00:00Z`).toISOString().slice(0, 10) !== eventDate || eventDate < today) throw new Error("Elegí una fecha válida, desde hoy en adelante.");
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(eventTime)) throw new Error("Indicá la hora de inicio del evento.");
  if (typeof b.durationHours !== "number" || ![3, 4, 5].includes(b.durationHours)) throw new Error("Elegí una duración de 3, 4 o 5 horas.");
  if (typeof b.latitude !== "number" || typeof b.longitude !== "number" || !Number.isFinite(b.latitude) || !Number.isFinite(b.longitude) || Math.abs(b.latitude) > 90 || Math.abs(b.longitude) > 180) throw new Error("Marcá la ubicación exacta del evento en el mapa.");
  if (typeof b.marketingConsent !== "boolean") throw new Error("Revisá la opción de promociones.");
  return { idempotencyKey, name, email, whatsapp, comboId: comboId as ConsultationInput["comboId"], games, eventDate, eventTime, durationHours: b.durationHours, latitude: b.latitude, longitude: b.longitude, marketingConsent: b.marketingConsent };
}

export function isConsultationCode(value: string) {
  return /^IK(?:\d{4}|-\d{4}|-\d{8}-[A-F0-9]{20})$/.test(value);
}

export function comboLabel(comboId: string, games: string) {
  return comboId === "completo" ? "Combo completo" : comboId === "dos" ? "Combo dúo" : games === "Cama Elástica" ? "Cama elástica" : games;
}

export function consultationWhatsapp(receipt: ConsultationReceipt) {
  const message = [
    "Hola, Inolvidable Kids 👋", `Mi consulta es ${receipt.code}.`,
    `Nombre y apellido: ${receipt.name}`, `WhatsApp: ${receipt.whatsapp}`,
    receipt.email ? `Correo: ${receipt.email}` : "",
    `Combo: ${comboLabel(receipt.comboId, receipt.games)}`, `Juegos: ${receipt.games}`,
    `Fecha del evento: ${receipt.eventDate.split("-").reverse().join("/")}`,
    `Hora de inicio: ${receipt.eventTime}`, `Duración: ${receipt.durationHours} horas`,
    `Ubicación del evento: ${receipt.mapsUrl}`, "Quisiera confirmar disponibilidad y precio, incluido el traslado si corresponde.",
  ].filter(Boolean).join("\n");
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
