import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import { POST } from "../app/api/consultas/route";
import { env, jobs } from "./cloudflare-stub";
import { validateConsultation, isConsultationCode, consultationWhatsapp, type ConsultationInput } from "../lib/consultation";
import { ensureConsultationSchema, nextConsultationCode, receiptFromRow, type ConsultationRow } from "../lib/server/consultation-db";
import { syncPendingConsultations } from "../lib/server/google-sheets";

class LocalD1 {
  sql = new DatabaseSync(":memory:");
  prepare(query: string) {
    const compile = () => this.sql.prepare(query);
    let args: (string | number | null)[] = [];
    const prepared = {
      bind(...values: (string | number | null)[]) { args = values; return prepared; },
      async run() { compile().run(...args); return { success: true }; },
      async first() { return compile().get(...args) ?? null; },
      async all() { return { results: compile().all(...args) }; },
    };
    return prepared;
  }
  async batch(statements: ReturnType<LocalD1["prepare"]>[]) { return Promise.all(statements.map(stmt => stmt.run())); }
}

test("consultations survive Sheets errors; retries preserve a single row and manual data", async () => {
  const db = new LocalD1();
  env.DB = db as unknown as D1Database;
  await ensureConsultationSchema(env.DB);
  // Existing legal requests remain independent.
  db.sql.exec("CREATE TABLE legal_requests (id INTEGER PRIMARY KEY, message TEXT); INSERT INTO legal_requests VALUES (1,'Keep this request');");
  const keys = await crypto.subtle.generateKey({ name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["sign", "verify"]);
  const exported = await crypto.subtle.exportKey("pkcs8", keys.privateKey);
  env.GOOGLE_SERVICE_ACCOUNT_JSON = JSON.stringify({ client_email: "test@example.iam.gserviceaccount.com", private_key: `-----BEGIN PRIVATE KEY-----\n${Buffer.from(exported).toString("base64")}\n-----END PRIVATE KEY-----` });
  env.GOOGLE_SHEETS_SPREADSHEET_ID = "test-sheet";
  const header = ["Nº consulta", "Fecha consulta", "Nombre y apellido", "WhatsApp", "Correo", "Localidad", "Fecha festejo", "Hora", "Juegos / combo", "Duración (hs)", "Estado", "Origen", "Próximo seguimiento", "Permiso promociones", "Observaciones"];
  const sheet: (string | number)[][] = [header, ["001", "", "Existing manual customer", "", "", "", "", "", "", "", "Contactada", "", "", "", "Keep these notes"]];
  let writeMode = "fail";
  let writes = 0;
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    if (url === "https://oauth2.googleapis.com/token") {
      const assertion = (init?.body as URLSearchParams).get("assertion")!;
      const [head, claims, signature] = assertion.split(".");
      assert.equal(JSON.parse(Buffer.from(claims, "base64url").toString()).scope, "https://www.googleapis.com/auth/spreadsheets");
      assert.ok(await crypto.subtle.verify("RSASSA-PKCS1-v1_5", keys.publicKey, Buffer.from(signature, "base64url"), new TextEncoder().encode(`${head}.${claims}`)));
      return Response.json({ access_token: "test-token", expires_in: 3600 });
    }
    assert.ok(url.startsWith("https://sheets.googleapis.com/v4/spreadsheets/test-sheet"));
    if (init?.method === "PUT") {
      if (writeMode === "fail") return new Response("unavailable", { status: 503 });
      const range = decodeURIComponent(url.split("/values/")[1].split("?")[0]);
      const destination = Number(range.match(/!A(\d+):/)![1]);
      const values = JSON.parse(String(init.body)).values[0];
      assert.ok(url.endsWith("valueInputOption=RAW"));
      sheet[destination - 5] = values;
      writes++;
      if (writeMode === "ambiguous") throw new DOMException("Timed out after Google saved", "TimeoutError");
      return Response.json({ updatedRows: 1 });
    }
    if (init?.method === "POST") return Response.json({ replies: [] });
    if (url.includes("/values/")) return Response.json({ values: sheet });
    return Response.json({ sheets: [{ properties: { sheetId: 614721178, title: "Consultas", gridProperties: { rowCount: 1000 } }, tables: [{ tableId: "1259456020", range: { sheetId: 614721178, startRowIndex: 4, endRowIndex: 105, startColumnIndex: 0, endColumnIndex: 15 } }] }] });
  };
  const drain = async () => { await Promise.all(jobs.splice(0)); };
  try {
    const input: ConsultationInput = { idempotencyKey: crypto.randomUUID(), name: "=Customer text", email: "qa@example.com", whatsapp: "3755123456", comboId: "dos", games: "Pelotero + Metegol", eventDate: "2027-12-12", eventTime: "15:30", durationHours: 4, latitude: -27.36, longitude: -55.23, marketingConsent: false };
    assert.throws(() => validateConsultation({ ...input, eventDate: "2027-02-30" }, "2026-01-01"));
    assert.throws(() => validateConsultation({ ...input, latitude: null }, "2026-01-01"));
    assert.throws(() => validateConsultation({ ...input, games: "Not a game" }, "2026-01-01"));
    assert.throws(() => validateConsultation({ ...input, name: "" }, "2026-01-01"), /nombre y apellido/);
    assert.throws(() => validateConsultation({ ...input, name: "Ana" }, "2026-01-01"), /nombre y apellido/);
    assert.throws(() => validateConsultation({ ...input, email: "" }, "2026-01-01"), /correo/);
    assert.throws(() => validateConsultation({ ...input, email: "nombre@" }, "2026-01-01"), /correo/);
    assert.throws(() => validateConsultation({ ...input, whatsapp: "" }, "2026-01-01"), /WhatsApp/);
    const request = (body: unknown, origin = "https://example.test") => new Request("https://example.test/api/consultas", { method: "POST", headers: { "Content-Type": "application/json", Origin: origin }, body: JSON.stringify(body) });
    assert.equal((await POST(request(input, "https://evil.test"))).status, 403);
    assert.equal((await POST(request({ ...input, website: "bot" }))).status, 400);
    assert.equal((await POST(request({ ...input, email: "" }))).status, 400);
    assert.equal((await POST(request({ ...input, name: "Ana" }))).status, 400);
    assert.equal((await POST(request({ ...input, whatsapp: "" }))).status, 400);
    assert.equal(db.sql.prepare("SELECT count(*) AS n FROM consultation_requests").get()!.n, 0);
    const response = await POST(request(input));
    assert.equal(response.status, 201);
    const { receipt } = await response.json() as { receipt: { code: string } };
    assert.equal(receipt.code, "IK0001");
    await drain();
    assert.equal((db.sql.prepare("SELECT sheets_sync_status FROM consultation_requests").get() as { sheets_sync_status: string }).sheets_sync_status, "error");
    assert.equal((await POST(request(input))).status, 201);
    await drain();
    assert.equal(db.sql.prepare("SELECT count(*) AS n FROM consultation_requests").get()!.n, 1);
    assert.equal((await POST(request({ ...input, name: "Changed data" }))).status, 409);
    writeMode = "ambiguous";
    await syncPendingConsultations(env);
    assert.equal(writes, 1);
    writeMode = "ok";
    await Promise.all([syncPendingConsultations(env), syncPendingConsultations(env)]);
    assert.equal(writes, 1, "retry finds the already-saved code rather than duplicating it");
    assert.equal(sheet[1][0], "001");
    assert.equal(sheet[1][14], "Keep these notes");
    assert.equal(sheet[2][0], receipt.code);
    assert.equal(sheet[2][2], "=Customer text", "RAW keeps customer strings literal");
    assert.equal(sheet[2][3], "+5493755123456");
    assert.equal(typeof sheet[2][6], "number");
    assert.equal(sheet[2][7], (15 * 60 + 30) / 1440);
    assert.equal(sheet[2][8], "Combo dúo");
    assert.equal(sheet[2][13], "No");
    assert.equal(sheet[2][14], "https://www.google.com/maps?q=-27.36,-55.23");
    const saved = db.sql.prepare("SELECT * FROM consultation_requests").get() as unknown as ConsultationRow;
    assert.equal(saved.sheets_sync_status, "synced");
    assert.ok(decodeURIComponent(consultationWhatsapp(receiptFromRow(saved))).includes(receipt.code));
    // A repeated notification must leave manual progress intact.
    sheet[2][10] = "Reserva confirmada"; sheet[2][14] = "Manual follow-up note";
    db.sql.exec("UPDATE consultation_requests SET sheets_sync_status='pending'");
    await syncPendingConsultations(env);
    assert.equal(writes, 1);
    assert.equal(sheet[2][10], "Reserva confirmada");
    assert.equal(sheet[2][14], "Manual follow-up note");
    assert.equal(db.sql.prepare("SELECT message FROM legal_requests").get()!.message, "Keep this request");
    // With an empty planilla and fresh numbering, the first inquiry goes to row 6.
    const fresh = new LocalD1();
    env.DB = fresh as unknown as D1Database;
    sheet.splice(1);
    try {
      const firstResponse = await POST(request({ ...input, idempotencyKey: crypto.randomUUID() }));
      assert.equal(firstResponse.status, 201);
      await drain();
      assert.equal(fresh.sql.prepare("SELECT id FROM consultation_requests").get()!.id, 1);
      assert.equal(sheet[1][0], "IK0001");
      assert.equal(fresh.sql.prepare("SELECT row_number FROM consultation_sheet_rows").get()!.row_number, 6);
    } finally { fresh.sql.close(); env.DB = db as unknown as D1Database; }
  } finally {
    globalThis.fetch = realFetch;
    db.sql.close();
  }
});

test("short consultation codes remain unique under concurrent allocation and never wrap", async () => {
  const db = new LocalD1();
  const handle = db as unknown as D1Database;
  try {
    await ensureConsultationSchema(handle);
    const codes = await Promise.all(Array.from({ length: 50 }, () => nextConsultationCode(handle)));
    assert.equal(codes[0], "IK0001");
    assert.equal(codes[49], "IK0050");
    assert.equal(new Set(codes).size, 50);
    assert.ok(codes.every(code => code && /^IK\d{4}$/.test(code)));
    db.sql.exec("UPDATE consultation_code_sequence SET value=9998");
    assert.equal(await nextConsultationCode(handle), "IK9999");
    assert.equal(await nextConsultationCode(handle), null);
    assert.equal(await nextConsultationCode(handle), null);
  } finally { db.sql.close(); }
});

test("confirmation accepts short codes and existing legacy links", () => {
  assert.ok(isConsultationCode("IK0001"));
  assert.ok(isConsultationCode("IK9999"));
  assert.ok(isConsultationCode("IK-0001"));
  assert.ok(isConsultationCode("IK-9999"));
  assert.ok(isConsultationCode("IK-20261103-0123456789ABCDEF0123"));
  for (const code of ["IK-123", "IK-12345", "IK-ABCD", "IK-1234extra"]) assert.equal(isConsultationCode(code), false);
});

const newWorkerHandle = (db: LocalD1) => ({
  prepare: (query: string) => db.prepare(query),
  batch: (statements: ReturnType<LocalD1["prepare"]>[]) => db.batch(statements),
}) as unknown as D1Database;

async function insertFixture(db: LocalD1, code: string) {
  await db.prepare("INSERT INTO consultation_requests(code,idempotency_key,name,whatsapp,combo_id,games,event_date,event_time,duration_hours,latitude,longitude,maps_url) VALUES (?,?,'Test Person','+5493755123456','uno','Pelotero','2027-12-12','15:00',3,0,0,'https://www.google.com/maps?q=0,0')")
    .bind(code, crypto.randomUUID()).run();
}

test("launch reset restarts an empty test database once, including row reservations", async () => {
  const db = new LocalD1();
  try {
    await ensureConsultationSchema(newWorkerHandle(db));
    await insertFixture(db, "IK-0001");
    await insertFixture(db, "IK-0002");
    db.sql.exec("UPDATE consultation_code_sequence SET value=2; INSERT INTO consultation_sheet_rows VALUES ('IK-0001','test-sheet',6),('IK-0002','test-sheet',7); DELETE FROM consultation_requests; DELETE FROM consultation_maintenance;");
    const afterDeployment = newWorkerHandle(db);
    await ensureConsultationSchema(afterDeployment);
    assert.equal(db.sql.prepare("SELECT result FROM consultation_maintenance").get()!.result, "reset_empty");
    assert.equal(db.sql.prepare("SELECT count(*) AS n FROM consultation_sheet_rows").get()!.n, 0);
    assert.equal(db.sql.prepare("SELECT seq FROM sqlite_sequence WHERE name='consultation_requests'").get(), undefined);
    assert.equal(await nextConsultationCode(afterDeployment), "IK0001");
    await insertFixture(db, "IK0001");
    assert.equal(db.sql.prepare("SELECT id FROM consultation_requests").get()!.id, 1);
    db.sql.exec("DELETE FROM consultation_requests");
    const laterWorker = newWorkerHandle(db);
    await ensureConsultationSchema(laterWorker);
    assert.equal(await nextConsultationCode(laterWorker), "IK0002", "a later empty database must not trigger the launch reset again");
  } finally { db.sql.close(); }
});

test("launch reset preserves existing inquiries and both short-code formats", async () => {
  const db = new LocalD1();
  try {
    await ensureConsultationSchema(newWorkerHandle(db));
    await insertFixture(db, "IK0042");
    await insertFixture(db, "IK-0043");
    db.sql.exec("INSERT INTO consultation_sheet_rows VALUES ('IK0042','test-sheet',8); DELETE FROM consultation_maintenance;");
    const afterDeployment = newWorkerHandle(db);
    await ensureConsultationSchema(afterDeployment);
    assert.equal(db.sql.prepare("SELECT result FROM consultation_maintenance").get()!.result, "skipped_nonempty");
    assert.equal(db.sql.prepare("SELECT count(*) AS n FROM consultation_requests").get()!.n, 2);
    assert.equal(db.sql.prepare("SELECT row_number FROM consultation_sheet_rows").get()!.row_number, 8);
    assert.equal(await nextConsultationCode(afterDeployment), "IK0044");
    db.sql.exec("DELETE FROM consultation_requests");
    const laterWorker = newWorkerHandle(db);
    await ensureConsultationSchema(laterWorker);
    assert.equal(await nextConsultationCode(laterWorker), "IK0045", "a skipped reset must not run later");
  } finally { db.sql.close(); }
});
