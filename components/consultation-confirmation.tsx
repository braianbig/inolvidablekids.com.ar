"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Check, Clock3, Copy, MapPin } from "lucide-react";
import { CONSULTATION_STORAGE_KEY, comboLabel, consultationWhatsapp, type ConsultationReceipt, WHATSAPP_NUMBER } from "@/lib/consultation";

export function ConsultationConfirmation() {
  const [receipt, setReceipt] = useState<ConsultationReceipt | null>(null);
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const requestedCode = new URLSearchParams(window.location.search).get("codigo") ?? "";
    const validCode = /^IK-\d{8}-[A-F0-9]{20}$/.test(requestedCode) ? requestedCode : "";
    setCode(validCode);
    try {
      const stored = sessionStorage.getItem(CONSULTATION_STORAGE_KEY);
      const value = stored ? JSON.parse(stored) as ConsultationReceipt : null;
      if (value?.code === validCode) setReceipt(value);
    } catch { /* This page also works with just the inquiry code. */ }
    setReady(true);
  }, []);
  const copyCode = async () => {
    try { await navigator.clipboard.writeText(code); setCopied(true); } catch { setCopied(false); }
  };
  const whatsapp = receipt ? consultationWhatsapp(receipt) : `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hola, Inolvidable Kids 👋 Mi consulta es ${code}. Quisiera confirmar disponibilidad y precio.`)}`;
  return <article className="legal-card consultation-confirmation">
    <div className="confirmation-icon" aria-hidden="true"><Check /></div>
    <span className="section-kicker">Inolvidable Kids</span>
    <h2>{!ready ? "Preparando tu confirmación…" : code ? "¡Recibimos tu consulta!" : "Armemos un festejo inolvidable"}</h2>
    {code ? <>
      <p>Guardá este código y continuá por WhatsApp para que podamos confirmar tu fecha y preparar tu presupuesto.</p>
      <div className="confirmation-code"><span>Tu código de consulta</span><strong>{code}</strong><button type="button" onClick={copyCode}><Copy aria-hidden="true" />{copied ? "¡Copiado!" : "Copiar código"}</button></div>
      {receipt && <dl className="confirmation-details">
        <div><dt>Persona de contacto</dt><dd>{receipt.name}</dd></div>
        <div><dt>Tu elección</dt><dd>{comboLabel(receipt.comboId, receipt.games)}<small>{receipt.games}</small></dd></div>
        <div><dt><CalendarDays aria-hidden="true" /> Fecha del evento</dt><dd>{receipt.eventDate.split("-").reverse().join("/")}</dd></div>
        <div><dt><Clock3 aria-hidden="true" /> Hora y duración</dt><dd>{receipt.eventTime} · {receipt.durationHours} horas</dd></div>
        <div className="confirmation-map"><dt><MapPin aria-hidden="true" /> Lugar del evento</dt><dd><a href={receipt.mapsUrl} target="_blank" rel="noopener noreferrer">Ver ubicación en Google Maps ↗</a></dd></div>
      </dl>}
      <a className="whatsapp-main confirmation-whatsapp" href={whatsapp} target="_blank" rel="noopener noreferrer"><img src="/social-whatsapp-light.png" alt="" />Continuar por WhatsApp</a>
      <p className="confirmation-note">Tu consulta está registrada. La fecha queda pendiente de confirmación; todavía no es una reserva.</p>
    </> : ready && <p>Para consultar disponibilidad, elegí tus juegos y completá el formulario.</p>}
    <a className="confirmation-home" href="/#combos">Volver a los juegos →</a>
  </article>;
}
