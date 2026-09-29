import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Inolvidable Kids",
  description: "¡Alquiler de peloteros, metegoles y camas elásticas para cumpleaños en tu casa o donde quieras!",
  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },
  icons: {
    icon: "/favicon-brand.svg",
    shortcut: "/favicon-brand.svg",
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
