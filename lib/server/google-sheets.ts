import { comboLabel } from "../consultation";
import { ensureConsultationSchema, type ConsultationRow } from "./consultation-db";

type SyncEnv = { DB?: D1Database; GOOGLE_SERVICE_ACCOUNT_JSON?: string; GOOGLE_SHEETS_SPREADSHEET_ID?: string };
type Token = { credential: string; value: string; expires: number };
let cachedToken: Token | undefined;
const encoder = new TextEncoder();
const base64url = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
const encodeJson = (value: unknown) => base64url(encoder.encode(JSON.stringify(value)));

async function accessToken(credential: string) {
  if (cachedToken?.credential === credential && cachedToken.expires > Date.now()) return cachedToken.value;
  const account = JSON.parse(credential) as { client_email?: string; private_key?: string; private_key_id?: string };
  if (!account.client_email || !account.private_key) throw new Error("Google credential configuration is incomplete");
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${encodeJson({ alg: "RS256", typ: "JWT", kid: account.private_key_id })}.${encodeJson({
    iss: account.client_email, scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600,
  })}`;
  const pem = account.private_key.replace(/-----[^-]+-----/g, "").replace(/\s/g, "");
  const key = await crypto.subtle.importKey("pkcs8", Uint8Array.from(atob(pem), c => c.charCodeAt(0)), { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, encoder.encode(unsigned));
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST", body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${unsigned}.${base64url(new Uint8Array(signature))}` }), signal: AbortSignal.timeout(7000),
  });
  if (!response.ok) throw new Error(`Google authentication HTTP ${response.status}`);
  const body = await response.json() as { access_token?: string; expires_in?: number };
  if (!body.access_token) throw new Error("Google authentication returned no token");
  cachedToken = { credential, value: body.access_token, expires: Date.now() + Math.max(0, (body.expires_in ?? 3600) - 120) * 1000 };
  return body.access_token;
}

const serialDate = (date: string) => (Date.parse(`${date}T00:00:00Z`) - Date.UTC(1899, 11, 30)) / 86400000;
export function sheetValues(row: ConsultationRow): (string | number)[] {
  const created = new Date(`${row.created_at.replace(" ", "T").replace(/Z$/, "")}Z`);
  const createdDate = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Argentina/Buenos_Aires", year: "numeric", month: "2-digit", day: "2-digit" }).format(created);
  const [hour, minute] = row.event_time.split(":").map(Number);
  return [row.code, serialDate(createdDate), row.name, row.whatsapp, row.email ?? "", row.locality || "Ver ubicación en Observaciones", serialDate(row.event_date), (hour * 60 + minute) / 1440, comboLabel(row.combo_id, row.games), row.duration_hours, "Nueva", "Web", "", row.marketing_consent ? "Sí" : "No", `Juegos: ${row.games}. Ubicación del evento: ${row.maps_url}`];
}

export async function syncPendingConsultations(env: SyncEnv) {
  if (!env.DB) return;
  const db = env.DB;
  await ensureConsultationSchema(db);
  const owner = crypto.randomUUID();
  const lease = await db.prepare(`INSERT INTO consultation_sync_lock(name,owner,expires_at) VALUES ('sheets',?,?)
    ON CONFLICT(name) DO UPDATE SET owner=excluded.owner, expires_at=excluded.expires_at WHERE expires_at < ? RETURNING owner`)
    .bind(owner, Date.now() + 120000, Date.now()).first<{ owner: string }>();
  if (lease?.owner !== owner) return;
  try {
    const pending = await db.prepare("SELECT * FROM consultation_requests WHERE sheets_sync_status != 'synced' ORDER BY sheets_sync_attempts, created_at LIMIT 3").all<ConsultationRow>();
    if (!pending.results.length) return;
    const credential = env.GOOGLE_SERVICE_ACCOUNT_JSON;
    const spreadsheet = env.GOOGLE_SHEETS_SPREADSHEET_ID;
    if (!credential || !spreadsheet || !/^[a-zA-Z0-9_-]+$/.test(spreadsheet)) throw new Error("Missing Google Sheets configuration");
    const token = await accessToken(credential);
    const root = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheet}`;
    const api = async (suffix: string, init: RequestInit = {}) => {
      const response = await fetch(`${root}${suffix}`, { ...init, headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, signal: AbortSignal.timeout(7000) });
      if (!response.ok) throw new Error(`Google Sheets HTTP ${response.status}`);
      return response.json();
    };
    const deadline = Date.now() + 20000;
    for (const row of pending.results) {
      if (Date.now() > deadline) break;
      await db.prepare("UPDATE consultation_requests SET sheets_sync_attempts=sheets_sync_attempts+1 WHERE code=?").bind(row.code).run();
      try {
        // Read values only; RAW writes ensure user text is never interpreted as a formula.
        const sheet = await api(`/values/${encodeURIComponent("'Consultas'!A5:O")}?valueRenderOption=UNFORMATTED_VALUE`) as { values?: (string | number)[][] };
        const rows = sheet.values ?? [];
        const expected = ["Nº consulta", "Fecha consulta", "Nombre y apellido", "WhatsApp", "Correo", "Localidad", "Fecha festejo", "Hora", "Juegos / combo", "Duración (hs)", "Estado", "Origen", "Próximo seguimiento", "Permiso promociones", "Observaciones"];
        if (!expected.every((label, i) => rows[0]?.[i] === label)) throw new Error("Consultas column headers do not match");
        const existing = rows.findIndex((cells, i) => i > 0 && cells[0] === row.code);
        if (existing < 0) {
          const mapping = await db.prepare("SELECT row_number FROM consultation_sheet_rows WHERE code=? AND spreadsheet_id=?").bind(row.code, spreadsheet).first<{ row_number: number }>();
          let destination = mapping?.row_number ?? 0;
          // Never overwrite an occupied row, including notes or entries without an ID.
          if (!destination || rows[destination - 5]?.some(value => value !== "" && value !== null)) {
            const last = rows.reduce((n, cells, i) => cells.some(value => value !== "" && value !== null) ? i + 5 : n, 5);
            const maxReserved = await db.prepare("SELECT MAX(row_number) AS maximum FROM consultation_sheet_rows WHERE spreadsheet_id=?").bind(spreadsheet).first<{ maximum: number | null }>();
            destination = Math.max(last, maxReserved?.maximum ?? 5) + 1;
            await db.prepare("INSERT INTO consultation_sheet_rows(code,spreadsheet_id,row_number) VALUES (?,?,?) ON CONFLICT(code,spreadsheet_id) DO UPDATE SET row_number=excluded.row_number").bind(row.code, spreadsheet, destination).run();
          }
          const metadata = await api("?fields=sheets(properties,tables)") as { sheets: { properties: { sheetId: number; title: string; gridProperties: { rowCount: number } }; tables?: { tableId: string; range: { endRowIndex: number } }[] }[] };
          const target = metadata.sheets.find(s => s.properties.title === "Consultas");
          if (!target) throw new Error("Consultas sheet unavailable");
          const sheetId = target.properties.sheetId;
          const requests: object[] = [];
          if (destination > target.properties.gridProperties.rowCount) requests.push({ appendDimension: { sheetId, dimension: "ROWS", length: Math.max(100, destination - target.properties.gridProperties.rowCount) } });
          if (destination > 105) {
            requests.push({ copyPaste: { source: { sheetId, startRowIndex: 104, endRowIndex: 105, startColumnIndex: 0, endColumnIndex: 15 }, destination: { sheetId, startRowIndex: destination - 1, endRowIndex: destination, startColumnIndex: 0, endColumnIndex: 15 }, pasteType: "PASTE_FORMAT" } });
            requests.push({ copyPaste: { source: { sheetId, startRowIndex: 104, endRowIndex: 105, startColumnIndex: 0, endColumnIndex: 15 }, destination: { sheetId, startRowIndex: destination - 1, endRowIndex: destination, startColumnIndex: 0, endColumnIndex: 15 }, pasteType: "PASTE_DATA_VALIDATION" } });
          }
          const table = target.tables?.find(t => t.range.endRowIndex >= 105);
          if (table && table.range.endRowIndex < destination) requests.push({ updateTable: { table: { tableId: table.tableId, range: { ...table.range, endRowIndex: destination } }, fields: "range" } });
          for (const [column, type, pattern] of [[1, "DATE", "dd/mm/yyyy"], [6, "DATE", "dd/mm/yyyy"], [7, "TIME", "hh:mm"]] as const) requests.push({ repeatCell: { range: { sheetId, startRowIndex: destination - 1, endRowIndex: destination, startColumnIndex: column, endColumnIndex: column + 1 }, cell: { userEnteredFormat: { numberFormat: { type, pattern } } }, fields: "userEnteredFormat.numberFormat" } });
          if (requests.length) await api(":batchUpdate", { method: "POST", body: JSON.stringify({ requests }) });
          // The reserved destination makes retries deterministic even after an ambiguous timeout.
          await api(`/values/${encodeURIComponent(`'Consultas'!A${destination}:O${destination}`)}?valueInputOption=RAW`, { method: "PUT", body: JSON.stringify({ values: [sheetValues(row)] }) });
        }
        // Existing rows are left intact, preserving manual follow-up, state and notes.
        await db.prepare("UPDATE consultation_requests SET sheets_sync_status='synced',sheets_synced_at=CURRENT_TIMESTAMP,sheets_last_error=NULL WHERE code=?").bind(row.code).run();
      } catch (error) {
        const message = error instanceof Error && /^Google Sheets HTTP \d+$/.test(error.message) ? error.message : "Sync incomplete; automatic retry pending";
        await db.prepare("UPDATE consultation_requests SET sheets_sync_status='error',sheets_last_error=? WHERE code=?").bind(message, row.code).run();
      }
    }
    await db.prepare("DELETE FROM consultation_rate_limits WHERE expires_at < ?").bind(Math.floor(Date.now() / 1000)).run();
  } catch {
    // No credentials, customer data or Google response bodies in logs.
    console.error("Google Sheets sync postponed; consultations remain in D1.");
  } finally {
    await db.prepare("DELETE FROM consultation_sync_lock WHERE name='sheets' AND owner=?").bind(owner).run();
  }
}
