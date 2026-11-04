import { env, waitUntil } from "cloudflare:workers";
import { validateConsultation } from "@/lib/consultation";
import { allowConsultation, nextConsultationCode, ensureConsultationSchema, receiptFromRow, type ConsultationRow } from "@/lib/server/consultation-db";
import { syncPendingConsultations } from "@/lib/server/google-sheets";

const json = (body: object, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: Request) {
  const origin = request.headers.get("Origin");
  if (origin && origin !== new URL(request.url).origin) return json({ error: "Enviá la consulta desde nuestra página." }, 403);
  if (!request.headers.get("Content-Type")?.startsWith("application/json")) return json({ error: "Formato de consulta no válido." }, 415);
  if (Number(request.headers.get("Content-Length")) > 12000) return json({ error: "La consulta es demasiado extensa." }, 413);
  let input;
  try {
    const raw = await request.text();
    if (raw.length > 12000) return json({ error: "La consulta es demasiado extensa." }, 413);
    const body = JSON.parse(raw);
    if (body?.website) return json({ error: "No pudimos recibir la consulta." }, 400);
    input = validateConsultation(body);
  } catch (error) {
    return json({ error: error instanceof SyntaxError ? "Revisá los datos de tu consulta." : error instanceof Error ? error.message : "Revisá los datos de tu consulta." }, 400);
  }
  try {
    const db = env.DB;
    if (!db) throw new Error("Missing database");
    await ensureConsultationSchema(db);
    let row = await db.prepare("SELECT * FROM consultation_requests WHERE idempotency_key=?").bind(input.idempotencyKey).first<ConsultationRow>();
    if (!row) {
      if (!await allowConsultation(db, request.headers.get("CF-Connecting-IP") ?? "local-preview")) return json({ error: "Recibimos varias consultas seguidas. Esperá unos minutos o escribinos por WhatsApp." }, 429);
      const code = await nextConsultationCode(db);
      if (!code) return json({ error: "No pudimos generar un nuevo código. Escribinos por WhatsApp para recibir tu consulta." }, 503);
      const mapsUrl = `https://www.google.com/maps?q=${input.latitude},${input.longitude}`;
      await db.prepare(`INSERT INTO consultation_requests
        (code,idempotency_key,name,email,whatsapp,combo_id,games,event_date,event_time,duration_hours,latitude,longitude,maps_url,marketing_consent,marketing_consent_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(idempotency_key) DO NOTHING`).bind(
        code, input.idempotencyKey, input.name, input.email || null, input.whatsapp, input.comboId, input.games, input.eventDate, input.eventTime, input.durationHours, input.latitude, input.longitude, mapsUrl, Number(input.marketingConsent), input.marketingConsent ? new Date().toISOString() : null,
      ).run();
      row = await db.prepare("SELECT * FROM consultation_requests WHERE idempotency_key=?").bind(input.idempotencyKey).first<ConsultationRow>();
    }
    if (!row) throw new Error("Missing saved consultation");
    const receipt = receiptFromRow(row);
    if (Object.entries(input).some(([key, value]) => receipt[key as keyof typeof input] !== value)) return json({ error: "Esta consulta ya se recibió con otros datos. Actualizá la página para iniciar una nueva.", resetDraft: true }, 409);
    // A Sheets outage never turns a successful D1 save into a failed inquiry.
    waitUntil(syncPendingConsultations(env).catch(() => console.error("Consultation sync deferred; retained in D1.")));
    return json({ receipt }, 201);
  } catch {
    console.error("Consultation could not be saved to D1.");
    return json({ error: "No pudimos guardar tu consulta. Intentá nuevamente; también podés escribirnos por WhatsApp." }, 503);
  }
}
