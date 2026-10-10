"use client";

import { useState, type FormEvent } from "react";

export function LegalRequestForm({ type }: { type: "arrepentimiento" | "baja" }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    try {
      const response = await fetch("/api/solicitudes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, type }),
      });
      const result = await response.json() as { code?: string; error?: string };
      if (!response.ok || !result.code) throw new Error(result.error || "No pudimos enviar la solicitud.");
      setCode(result.code);
      form.reset();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No pudimos enviar la solicitud. Intentá nuevamente.");
    } finally {
      setPending(false);
    }
  }

  if (code) return (
    <div className="legal-success" role="status">
      <h2>Recibimos tu solicitud</h2>
      <p>Tu número de seguimiento es <strong>{code}</strong>. Guardalo para futuras consultas.</p>
      <p>Nos comunicaremos con vos por el dato de contacto que ingresaste. También podés escribirnos a <a href="mailto:inolvidablekids@gmail.com">inolvidablekids@gmail.com</a> e indicar este número.</p>
      <button type="button" onClick={() => setCode("")}>Enviar otra solicitud</button>
    </div>
  );

  return (
    <form className="legal-form" onSubmit={submit}>
      <label>Nombre y apellido <input name="name" autoComplete="name" maxLength={120} required /></label>
      <label>Correo electrónico o teléfono para responderte <input name="contact" maxLength={180} required /></label>
      <label>Fecha del evento o referencia de la reserva<input name="bookingReference" maxLength={120} /></label>
      <label>Comentario<textarea name="message" rows={4} maxLength={1000} /></label>
      <p>No necesitás crear una cuenta ni explicar el motivo para enviar tu solicitud.</p>
      {error && <p className="legal-error" role="alert">{error} También podés escribir a <a href="mailto:inolvidablekids@gmail.com">inolvidablekids@gmail.com</a>.</p>}
      <button type="submit" disabled={pending}>{pending ? "Enviando…" : "Enviar solicitud"}</button>
    </form>
  );
}
