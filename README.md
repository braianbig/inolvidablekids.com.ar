# Inolvidable Kids

Landing page oficial de **Inolvidable Kids**, emprendimiento de alquiler de juegos infantiles en Colonia Alberdi, General Alvear, Oberá y alrededores.

La página permite conocer los juegos, armar un combo, seleccionar la fecha, la duración y el medio de pago, marcar la ubicación exacta del evento en un mapa y enviar la consulta completa por WhatsApp.

## Funciones principales

- Selección entre combo completo, dos juegos o un juego.
- Elección de pelotero, metegol y cama elástica.
- Duraciones de 3, 4 o 5 horas con cálculo automático del ahorro.
- Cálculo automático del total y de la reservación del 50 %.
- Calendario público de disponibilidad mediante Google Calendar.
- Mapa interactivo con Leaflet y OpenStreetMap.
- Ubicación por GPS o selección manual en el mapa.
- Consulta por WhatsApp con los datos elegidos.
- Información de seguridad, lluvia y preguntas frecuentes.
- Diseño adaptable para computadoras, tablets y teléfonos.

## Tecnologías

- React 19
- Next.js 16
- Vinext y Vite
- TypeScript
- Tailwind CSS 4
- Leaflet y OpenStreetMap
- Componentes accesibles basados en Base UI/Shadcn
- Cloudflare Workers

## Requisitos

- Node.js 22.13 o superior.
- pnpm 11.25 o una versión compatible.
- Git, únicamente si se trabajará con GitHub.

## Instalación en una computadora

1. Descomprimí el archivo ZIP.
2. Abrí una terminal dentro de la carpeta del proyecto.
3. Activá Corepack e instalá pnpm:

```bash
corepack enable
corepack prepare pnpm@11.25.0 --activate
```

4. Instalá las dependencias:

```bash
pnpm install --frozen-lockfile
```

5. Iniciá el entorno de desarrollo:

```bash
pnpm dev
```

6. Abrí en el navegador la dirección que muestre la terminal. Normalmente será:

```text
http://localhost:5173
```

## Compilación para producción

Para comprobar que el proyecto está listo para publicarse:

```bash
pnpm build
```

Para ejecutar localmente la versión compilada:

```bash
pnpm start
```

## Subir el proyecto a GitHub

Si el repositorio está vacío, ejecutá estos comandos desde la carpeta del proyecto:

```bash
git init
git add .
git commit -m "Publicar sitio de Inolvidable Kids"
git branch -M main
git remote add origin https://github.com/braianbig/inolvidablekids.com.ar.git
git push -u origin main
```

Si el repositorio ya contiene esta página, para futuras actualizaciones alcanza con:

```bash
git add .
git commit -m "Actualizar sitio de Inolvidable Kids"
git push
```

## Publicación en Cloudflare

El proyecto genera un Worker compatible con Cloudflare.

Al importar el repositorio desde **Workers & Pages**, usá:

- Rama de producción: `main`
- Directorio raíz: `/`
- Comando de instalación: `pnpm install --frozen-lockfile`
- Comando de compilación: `pnpm build`
- Comando de despliegue: `pnpm exec wrangler deploy --config dist/server/wrangler.json`
- Versión de Node.js: `22.13.0` o superior

Después del primer despliegue, el dominio se conecta desde la sección de dominios personalizados del Worker o proyecto creado en Cloudflare.

## Archivos importantes

- `app/page.tsx`: contenido, formulario, selección de combos y comportamiento principal.
- `app/globals.css`: estilos, diseño adaptable y animaciones.
- `app/layout.tsx`: metadatos y estructura general.
- `public/`: imágenes, logotipo, juegos, marcas e iconos sociales.
- `components/ui/`: componentes reutilizables de la interfaz.
- `vite.config.ts`: configuración de Vinext, Vite y Cloudflare.
- `package.json`: dependencias y comandos del proyecto.
- `pnpm-lock.yaml`: versiones exactas de las dependencias.
- `MAPA_ESTRUCTURA.md`: árbol completo del proyecto.
- `CODIGO_COMPLETO.md`: código de cada archivo de texto en bloques Markdown individuales.

## Datos configurados

- WhatsApp: `+54 9 3755 639300`
- Instagram: `@inolvidablekids`
- TikTok: `@inolvidablekids`
- YouTube: `@InolvidableKids`
- Correo: `inolvidablekids@gmail.com`

## Imágenes y archivos binarios

Las imágenes PNG, WebP y SVG están incluidas dentro de `public/`. Los archivos binarios no se reproducen como texto dentro de `CODIGO_COMPLETO.md`, pero forman parte del proyecto y del ZIP.

## Recomendaciones

- No subas `node_modules`, `dist`, `.next`, `.wrangler` ni archivos `.env` a GitHub.
- Conservá `pnpm-lock.yaml` para obtener instalaciones reproducibles.
- Ejecutá `pnpm build` antes de publicar cambios importantes.
- No publiques claves, tokens ni contraseñas dentro del repositorio.

## Licencia y marca

El diseño, la identidad visual, los textos y los recursos de marca pertenecen a Inolvidable Kids. Los logotipos de proveedores conservan los derechos de sus respectivos titulares.
