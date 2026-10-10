import { getDb } from "@/db";
import { legalRequests } from "@/db/schema";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Datos inválidos." }, { status: 400 });
  }

  const type = body.type;
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const contact = typeof body.contact === "string" ? body.contact.trim() : "";
  const bookingReference = typeof body.bookingReference === "string" ? body.bookingReference.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if ((type !== "arrepentimiento" && type !== "baja") || !name || !contact || name.length > 120 || contact.length > 180 || bookingReference.length > 120 || message.length > 1000) {
    return Response.json({ error: "Revisá los datos ingresados." }, { status: 400 });
  }

  try {
    const code = `IK-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    await getDb().insert(legalRequests).values({ code, type, name, contact, bookingReference, message });
    return Response.json({ code }, { status: 201 });
  } catch (error) {
    console.error("No se pudo registrar una solicitud legal", error);
    return Response.json({ error: "El formulario no está disponible en este momento." }, { status: 503 });
  }
}
