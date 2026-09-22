import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Inolvidable Kids | Juegos para cumpleaños en Colonia Alberdi",
  description: "Alquiler de pelotero, metegol y cama elástica para cumpleaños en Colonia Alberdi, General Alvear, Oberá y alrededores.",
  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-AR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
