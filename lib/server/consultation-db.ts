import type { ConsultationInput, ConsultationReceipt } from "../consultation";

export type ConsultationRow = {
  code: string; idempotency_key: string; name: string; email: string | null; whatsapp: string;
  combo_id: ConsultationInput["comboId"]; games: string; event_date: string; event_time: string;
  duration_hours: number; latitude: number; longitude: number; maps_url: string;
  locality: string | null; marketing_consent: number; created_at: string;
  sheets_sync_status: string;
};

const ready = new WeakMap<D1Database, Promise<unknown>>();
export async function ensureConsultationSchema(db: D1Database) {
  let promise = ready.get(db);
  if (!promise) {
    promise = db.batch([
      db.prepare(`CREATE TABLE IF NOT EXISTS consultation_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT, code TEXT NOT NULL UNIQUE, idempotency_key TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL, email TEXT, whatsapp TEXT NOT NULL,
        combo_id TEXT NOT NULL CHECK(combo_id IN ('completo','dos','uno')), games TEXT NOT NULL,
        event_date TEXT NOT NULL, event_time TEXT NOT NULL, duration_hours INTEGER NOT NULL CHECK(duration_hours IN (3,4,5)),
        latitude REAL NOT NULL CHECK(latitude BETWEEN -90 AND 90), longitude REAL NOT NULL CHECK(longitude BETWEEN -180 AND 180),
        maps_url TEXT NOT NULL, locality TEXT,
        marketing_consent INTEGER NOT NULL DEFAULT 0 CHECK(marketing_consent IN (0,1)), marketing_consent_at TEXT,
        source TEXT NOT NULL DEFAULT 'Web', status TEXT NOT NULL DEFAULT 'Nueva',
        sheets_sync_status TEXT NOT NULL DEFAULT 'pending' CHECK(sheets_sync_status IN ('pending','synced','error')),
        sheets_sync_attempts INTEGER NOT NULL DEFAULT 0, sheets_synced_at TEXT, sheets_last_error TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`),
      db.prepare("CREATE TABLE IF NOT EXISTS consultation_code_sequence (name TEXT PRIMARY KEY, value INTEGER NOT NULL CHECK(value BETWEEN 0 AND 9999))"),
      db.prepare("INSERT INTO consultation_code_sequence(name,value) SELECT 'consultations', COALESCE(MAX(CAST(CASE WHEN code GLOB 'IK[0-9][0-9][0-9][0-9]' THEN substr(code,3) ELSE substr(code,4) END AS INTEGER)),0) FROM consultation_requests WHERE code GLOB 'IK[0-9][0-9][0-9][0-9]' OR code GLOB 'IK-[0-9][0-9][0-9][0-9]' ON CONFLICT(name) DO UPDATE SET value=MAX(consultation_code_sequence.value,excluded.value)"),
      db.prepare("CREATE INDEX IF NOT EXISTS idx_consultation_requests_sync ON consultation_requests(sheets_sync_status, created_at)"),
      db.prepare("CREATE TABLE IF NOT EXISTS consultation_sync_lock (name TEXT PRIMARY KEY, owner TEXT NOT NULL, expires_at INTEGER NOT NULL)"),
      db.prepare("CREATE TABLE IF NOT EXISTS consultation_sheet_rows (code TEXT NOT NULL, spreadsheet_id TEXT NOT NULL, row_number INTEGER NOT NULL, PRIMARY KEY(code, spreadsheet_id), UNIQUE(spreadsheet_id, row_number))"),
      db.prepare("CREATE TABLE IF NOT EXISTS consultation_rate_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires_at INTEGER NOT NULL)"),
      // One-time launch reset requested after deleting test inquiries.
      // D1 executes this ordered batch atomically. A populated database is never reset.
      db.prepare("CREATE TABLE IF NOT EXISTS consultation_maintenance (name TEXT PRIMARY KEY, result TEXT NOT NULL, completed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)"),
      db.prepare("DELETE FROM consultation_sheet_rows WHERE NOT EXISTS (SELECT 1 FROM consultation_requests) AND NOT EXISTS (SELECT 1 FROM consultation_maintenance WHERE name='launch-reset-v1')"),
      db.prepare("UPDATE consultation_code_sequence SET value=0 WHERE name='consultations' AND NOT EXISTS (SELECT 1 FROM consultation_requests) AND NOT EXISTS (SELECT 1 FROM consultation_maintenance WHERE name='launch-reset-v1')"),
      db.prepare("DELETE FROM sqlite_sequence WHERE name='consultation_requests' AND NOT EXISTS (SELECT 1 FROM consultation_requests) AND NOT EXISTS (SELECT 1 FROM consultation_maintenance WHERE name='launch-reset-v1')"),
      db.prepare("INSERT OR IGNORE INTO consultation_maintenance(name,result) SELECT 'launch-reset-v1', CASE WHEN EXISTS (SELECT 1 FROM consultation_requests) THEN 'skipped_nonempty' ELSE 'reset_empty' END"),
    ]).catch(error => { ready.delete(db); throw error; });
    ready.set(db, promise);
  }
  await promise;
}

// Atomic allocation keeps concurrent inquiries distinct; numbers are never recycled.
export async function nextConsultationCode(db: D1Database): Promise<string | null> {
  const sequence = await db.prepare("UPDATE consultation_code_sequence SET value=value+1 WHERE name='consultations' AND value<9999 RETURNING value").first<{ value: number }>();
  return sequence ? "IK" + String(sequence.value).padStart(4, "0") : null;
}

export function receiptFromRow(row: ConsultationRow): ConsultationReceipt {
  return { code: row.code, idempotencyKey: row.idempotency_key, name: row.name, email: row.email ?? "", whatsapp: row.whatsapp, comboId: row.combo_id, games: row.games, eventDate: row.event_date, eventTime: row.event_time, durationHours: row.duration_hours, latitude: row.latitude, longitude: row.longitude, marketingConsent: !!row.marketing_consent, mapsUrl: row.maps_url, createdAt: row.created_at };
}

export async function allowConsultation(db: D1Database, ip: string) {
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip));
  const key = Array.from(new Uint8Array(hash), n => n.toString(16).padStart(2, "0")).join("");
  const now = Math.floor(Date.now() / 1000);
  const result = await db.prepare(`INSERT INTO consultation_rate_limits(key,count,expires_at) VALUES (?,1,?)
    ON CONFLICT(key) DO UPDATE SET count=CASE WHEN expires_at < ? THEN 1 ELSE count+1 END,
    expires_at=CASE WHEN expires_at < ? THEN excluded.expires_at ELSE expires_at END RETURNING count`).bind(key, now + 900, now, now).first<{ count: number }>();
  return (result?.count ?? 99) <= 5;
}
