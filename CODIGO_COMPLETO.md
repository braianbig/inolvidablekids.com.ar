# Código completo del proyecto

Cada archivo de texto aparece a continuación dentro de su propio bloque de código. Los recursos binarios se incluyen físicamente en el ZIP y se enumeran al final.

## `.gitignore`

``````text
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/versions

# testing
/coverage

# next.js
/.next/
/.vinext/
/out/

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# env files (can opt-in for committing if needed)
.env*

# vercel
.vercel

# typescript
next-env.d.ts
/dist/
/.wrangler/
# Checkout-local execution profile and tool state; never publish them.
/.sites-runtime/
/.agents/
/.codex/
/outputs/
/work/
``````

## `.npmrc`

``````text
audit=false
fund=false
update-notifier=false
``````

## `.openai/hosting.json`

``````json
{
  "d1": null,
  "r2": null,
  "project_id": "appgprj_6aadb45618fc8191afdae0a22ea0c6e1"
}
``````

## `app/chatgpt-auth.ts`

``````typescript
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export type ChatGPTUser = {
  userId: string;
  displayName: string;
  email: string;
  fullName: string | null;
};

const USER_ID_HEADER = "oai-authenticated-user-id";
const USER_EMAIL_HEADER = "oai-authenticated-user-email";
const USER_FULL_NAME_HEADER = "oai-authenticated-user-full-name";
const USER_FULL_NAME_ENCODING_HEADER =
  "oai-authenticated-user-full-name-encoding";
const PERCENT_ENCODED_UTF8 = "percent-encoded-utf-8";
const SIGN_IN_PATH = "/signin-with-chatgpt";
const SIGN_OUT_PATH = "/signout-with-chatgpt";
const CALLBACK_PATH = "/callback";

export async function getChatGPTUser(): Promise<ChatGPTUser | null> {
  const requestHeaders = await headers();
  const userId = requestHeaders.get(USER_ID_HEADER);
  const email = requestHeaders.get(USER_EMAIL_HEADER);
  if (!userId || !email) return null;

  const encodedFullName = requestHeaders.get(USER_FULL_NAME_HEADER);
  const fullName =
    encodedFullName &&
    requestHeaders.get(USER_FULL_NAME_ENCODING_HEADER) === PERCENT_ENCODED_UTF8
      ? safeDecodeURIComponent(encodedFullName)
      : null;

  return {
    userId,
    displayName: fullName ?? email,
    email,
    fullName,
  };
}

export async function requireChatGPTUser(
  returnTo: string,
): Promise<ChatGPTUser> {
  const user = await getChatGPTUser();
  if (user) return user;

  redirect(chatGPTSignInPath(returnTo));
}

export function chatGPTSignInPath(returnTo: string): string {
  const safeReturnTo = safeRelativeReturnPath(returnTo);
  return `${SIGN_IN_PATH}?return_to=${encodeURIComponent(safeReturnTo)}`;
}

export function chatGPTSignOutPath(returnTo = "/"): string {
  const safeReturnTo = safeRelativeReturnPath(returnTo);
  return `${SIGN_OUT_PATH}?return_to=${encodeURIComponent(safeReturnTo)}`;
}

function safeRelativeReturnPath(value: string): string {
  if (!value.startsWith("/") || value.startsWith("//")) return "/";

  let url: URL;
  try {
    url = new URL(value, "https://app.local");
  } catch {
    return "/";
  }
  if (url.origin !== "https://app.local") return "/";
  if (isReservedAuthPath(url.pathname)) return "/";

  return `${url.pathname}${url.search}${url.hash}`;
}

function isReservedAuthPath(pathname: string): boolean {
  return (
    pathname === SIGN_IN_PATH ||
    pathname === SIGN_OUT_PATH ||
    pathname === CALLBACK_PATH
  );
}

function safeDecodeURIComponent(value: string): string | null {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}
``````

## `app/globals.css`

``````css
@import "tailwindcss";
@import "tw-animate-css";
@import "../vendor/shadcn-tailwind-4.13.0.css";
@import "leaflet/dist/leaflet.css";

:root {
  --background: #f8fbf7; --foreground: #103d32; --card: #ffffff; --card-foreground: #103d32;
  --popover: #ffffff; --popover-foreground: #103d32; --primary: #005a46; --primary-foreground: #ffffff;
  --secondary: #ecf4e8; --secondary-foreground: #005a46; --muted: #edf3ef; --muted-foreground: #55746b;
  --accent: #a9d253; --accent-foreground: #103d32; --destructive: #b42318; --border: #d9e6df;
  --input: #cadbd2; --ring: #35a879; --chart-1: #005a46; --chart-2: #a9d253; --chart-3: #35a879;
  --chart-4: #8b78c6; --chart-5: #185c48; --radius: 1rem;
}
@theme inline {
  --color-background: var(--background); --color-foreground: var(--foreground); --color-card: var(--card);
  --color-card-foreground: var(--card-foreground); --color-popover: var(--popover); --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary); --color-primary-foreground: var(--primary-foreground); --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground); --color-muted: var(--muted); --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent); --color-accent-foreground: var(--accent-foreground); --color-destructive: var(--destructive);
  --color-border: var(--border); --color-input: var(--input); --color-ring: var(--ring);
  --radius-sm: calc(var(--radius) - 4px); --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius); --radius-xl: calc(var(--radius) + 6px);
  --font-sans: "Nunito", "Avenir Next", system-ui, sans-serif;
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { margin: 0; background: var(--background); color: var(--foreground); font-family: "Nunito", "Avenir Next", system-ui, sans-serif; }
a { color: inherit; text-decoration: none; }
button, input, select { font: inherit; }
.site-header { position: sticky; top: 0; z-index: 50; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; min-height: 76px; padding: 10px max(5vw, 24px); background: rgb(248 251 247 / 90%); border-bottom: 1px solid rgb(0 90 70 / 10%); backdrop-filter: blur(18px); }
.brand { display: flex; align-items: center; width: max-content; font-weight: 900; letter-spacing: -.04em; }
.brand-icon { width: 46px; height: 46px; object-fit: contain; margin-right: 8px; }
.brand-name { font-size: 1.45rem; color: #005a46; }
.brand-kids { margin-left: 7px; padding: 5px 8px; border-radius: 9px; background: #a9d253; color: #005a46; font-size: .67rem; letter-spacing: .04em; }
.desktop-nav { display: flex; gap: 30px; font-size: .93rem; font-weight: 750; color: #3b6257; }
.desktop-nav a:hover { color: #005a46; }
.header-cta { justify-self: end; gap: 8px; height: 44px; padding-inline: 18px; border-radius: 999px; background: #005a46; color: #a9d253; font-weight: 900; }
.header-cta:hover { background: #0a6d56; color: #b9df6b; }
.header-cta img { width: 20px; height: 20px; object-fit: contain; }
.hero { position: relative; overflow: hidden; display: grid; min-height: 640px; padding: clamp(70px, 8vw, 118px) max(5vw, 24px) clamp(78px, 9vw, 130px); place-items: center; background: radial-gradient(circle at 7% 18%, rgb(169 210 83 / 20%) 0 130px, transparent 132px), radial-gradient(circle at 86% 64%, rgb(0 90 70 / 7%) 0 135px, transparent 137px), linear-gradient(180deg, #f8fbf7 0%, #f8fbf7 76%, #edf5f1 100%); background-repeat: no-repeat; background-size: calc(100% + 40px) calc(100% + 40px), calc(100% + 64px) calc(100% + 64px), 100% 100%; animation: hero-circles-drift 12s ease-in-out infinite alternate; }
.hero::after { content: ""; position: absolute; width: 120px; height: 120px; right: 9%; top: 14%; border: 2px solid #a9d253; border-radius: 34% 66% 55% 45%; transform: rotate(18deg); opacity: .35; animation: hero-shape-wave 8s ease-in-out infinite; }
.hero-copy { position: relative; z-index: 1; width: 100%; max-width: 1120px; text-align: center; }
.location-pill { display: inline-flex; align-items: center; gap: 8px; padding: 9px 14px; border: 1px solid rgb(0 90 70 / 14%); border-radius: 999px; background: white; color: #005a46; font-size: .8rem; font-weight: 800; white-space: nowrap; box-shadow: 0 8px 30px rgb(0 90 70 / 6%); }
.location-pill, .location-pill * { color: #005a46; text-decoration: none !important; pointer-events: none; }
.location-pill svg { width: 16px; }
h1, h2, h3, p { margin-top: 0; }
.hero h1 { max-width: 1180px; margin: 28px auto 24px; font-size: clamp(3.15rem, 5.8vw, 5.7rem); line-height: .98; letter-spacing: -.055em; font-weight: 950; color: #005a46; text-align: center; }
.hero h1 span { display: block; }
.hero-lead { max-width: 760px; margin-inline: auto; color: #476a60; font-size: clamp(.98rem, 1.35vw, 1.16rem); line-height: 1.55; }
.hero-lead span { display: block; white-space: nowrap; }
.hero-actions { display: flex; align-items: center; justify-content: center; gap: 24px; margin-top: 34px; }
.primary-action { min-height: 54px; padding-inline: 27px; border-radius: 16px; font-size: 1rem; font-weight: 900; box-shadow: 0 16px 30px rgb(95 135 20 / 18%); }
.text-link { font-weight: 850; color: #005a46; }
.trust-row { display: flex; flex-wrap: wrap; justify-content: center; gap: 18px 26px; margin-top: 45px; color: #41665b; font-size: .87rem; font-weight: 750; }
.trust-row span { display: flex; align-items: center; gap: 7px; }
.trust-row svg { width: 18px; color: #35a879; }
.payment-teaser { display: inline-flex; align-items: center; justify-content: center; flex-direction: column; gap: 5px; margin-top: 22px; padding: 9px 14px; border: 1px solid rgb(0 90 70 / 12%); border-radius: 14px; background: rgb(255 255 255 / 78%); text-align: center; box-shadow: 0 10px 30px rgb(0 90 70 / 6%); }
.payment-teaser .payment-heading { display: inline-flex; align-items: center; justify-content: center; flex-direction: row; gap: 6px; }
.payment-heading svg { width: 19px; height: 19px; color: #35a879; }
.payment-teaser strong { color: #164a3d; font-size: .8rem; }
.payment-teaser > span { color: #688078; font-size: .68rem; }
.calendar-section { display: grid; grid-template-columns: minmax(260px, .72fr) minmax(520px, 1.28fr); gap: clamp(30px, 5vw, 72px); align-items: center; padding: clamp(64px, 8vw, 108px) max(5vw, 24px); background: #005a46; }
.calendar-heading { max-width: 480px; }
.calendar-heading h2 { margin: 0 0 16px; color: #fff; font-size: clamp(2rem, 4.2vw, 4.1rem); font-weight: 950; line-height: 1.02; letter-spacing: -.055em; }
.calendar-heading p { max-width: 420px; margin: 0; color: #c9ddd6; font-size: 1rem; line-height: 1.7; }
.calendar-cta { width: 100%; min-height: 58px; margin-top: 16px; padding: 12px 22px; border-radius: 16px; font-size: .95rem; font-weight: 950; line-height: 1.25; white-space: normal; box-shadow: 0 16px 34px rgb(0 28 22 / 24%); }
.calendar-cta:hover { color: #123d32; transform: translateY(-2px); }
.calendar-frame { overflow: hidden; width: 100%; min-height: 520px; border: 5px solid rgb(169 210 83 / 72%); border-radius: 26px; background: #fff; box-shadow: 0 26px 64px rgb(0 34 27 / 30%); }
.calendar-frame iframe { display: block; width: 100%; height: 520px; border: 0; }
.booking-section { padding: clamp(62px, 7vw, 96px) max(4vw, 20px); background: linear-gradient(180deg, #edf5f1 0%, #f8fbf7 100%); }
.booking-card { position: relative; z-index: 2; width: 100%; max-width: 1240px; margin: 0 auto; padding: clamp(24px, 4vw, 52px); border: 1px solid rgb(0 90 70 / 10%); border-radius: 30px; background: white; box-shadow: 0 28px 80px rgb(0 69 53 / 12%); }
.booking-heading { display: flex; justify-content: space-between; gap: 20px; align-items: start; margin-bottom: 22px; }
.section-kicker { display: block; margin-bottom: 9px; color: #79a928; font-size: .74rem; font-weight: 950; letter-spacing: .13em; text-transform: uppercase; }
.booking-kicker { color: #79a928; }
.booking-heading h2 { margin: 0; color: #005a46; font-size: 1.8rem; letter-spacing: -.04em; }
.booking-heading p { margin: 7px 0 0; color: #6a817a; font-size: .9rem; }
.duration { display: inline-flex; align-items: center; gap: 6px; padding: 7px 10px; border-radius: 99px; background: #edf5e2; color: #41631b; font-size: .78rem; font-weight: 900; }
.duration svg { width: 15px; }
.combo-options { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; }
.combo-option { position: relative; display: flex; min-width: 0; overflow: hidden; flex-direction: column; border: 0; border-radius: 20px; background: #edf5f1; cursor: pointer; transition: transform .22s ease, background .22s ease; }
.combo-option::after { content: ""; position: absolute; z-index: 3; inset: 0; border: 2px solid #88b638; border-radius: inherit; opacity: 0; pointer-events: none; transform: scale(.975); transition: opacity .22s ease, transform .22s ease; }
.combo-option:hover { transform: translateY(-2px); background: #e9f2ed; }
.combo-option.selected { background: #e7f1d2; box-shadow: none; }
.combo-option.selected::after { opacity: 1; transform: scale(1); }
.combo-radio { position: absolute; z-index: 2; top: 10px; left: 10px; width: 20px; height: 20px; border-color: #7da82b; background: rgb(255 255 255 / 92%); color: #005a46; }
.combo-gallery { display: grid; width: 100%; height: 226px; gap: 5px; overflow: hidden; padding: 12px; background: transparent; }
.combo-gallery.images-1 { grid-template-columns: 1fr; place-items: center; overflow: visible; }
.combo-gallery.images-2 { grid-template-columns: repeat(2, 1fr); }
.combo-gallery.images-3 { grid-template-columns: repeat(3, 1fr); }
.combo-gallery img { width: 100%; height: 100%; min-width: 0; object-fit: contain; filter: drop-shadow(0 13px 10px rgb(0 69 53 / 13%)); transform: scale(.94); transition: transform .25s ease; }
.combo-option:hover .combo-gallery img, .combo-option.selected .combo-gallery img { transform: scale(1); }
.combo-gallery.images-1 img { width: 78%; height: 78%; max-width: 78%; max-height: 78%; transform: none; }
.combo-option:hover .combo-gallery.images-1 img, .combo-option.selected .combo-gallery.images-1 img { transform: scale(1.035); }
.combo-content { display: flex; min-height: 128px; padding: 18px; flex-direction: column; align-items: flex-start; }
.combo-topline { display: flex; align-items: center; gap: 8px; }
.combo-topline strong { color: #103d32; font-size: .94rem; line-height: 1.15; }
.popular { position: absolute; z-index: 2; top: 13px; right: 13px; padding: 5px 8px; border-radius: 99px; background: #a9d253; color: #254308; font-size: .58rem; font-weight: 900; text-transform: uppercase; }
.combo-eyebrow { margin-top: 6px; color: #647b73; font-size: .71rem; line-height: 1.35; }
.combo-price { margin-top: auto; padding-top: 11px; color: #005a46; font-size: 1.05rem; white-space: nowrap; }
.combo-detail { max-width: 430px; }
.choice-section { min-width: 0; margin: 22px 0 0; padding: 0; border: 0; }
.choice-section legend { margin-bottom: 10px; color: #31584d; font-size: .875rem; font-weight: 900; }
.duration-options { display: grid; grid-template-columns: repeat(3, 1fr); gap: 9px; }
.choice-pill { display: flex; min-width: 0; align-items: center; gap: 9px; padding: 11px 13px; border: 1.5px solid #d7e4dd; border-radius: 14px; background: #fbfdfb; cursor: pointer; }
.choice-pill.selected { border-color: #8ebd31; background: #f4fae8; }
.choice-pill > span { display: flex; min-width: 0; flex-direction: column; }
.choice-pill strong { color: #214e42; font-size: .86rem; }
.choice-pill small { color: #688078; font-size: .73rem; }
.choice-pill .saving-label { width: max-content; margin-top: 4px; padding: 3px 7px; border-radius: 999px; background: #a9d253; color: #173f35; font-size: .7rem; font-weight: 950; line-height: 1.2; box-shadow: 0 4px 12px rgb(90 126 22 / 18%); }
.form-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 8px; }
.event-grid-simple { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.field-label { display: grid; gap: 7px; margin-top: 14px; color: #31584d; font-size: .875rem; font-weight: 850; }
.field-label span { display: flex; gap: 5px; align-items: center; }
.field-label svg { width: 15px; }
.field-label input, .field-label select { width: 100%; min-height: 47px; padding: 0 12px; border: 1px solid #d7e4dd; border-radius: 12px; outline: none; background: #fbfdfb; color: #173f35; }
.field-label input:focus, .field-label select:focus { border-color: #35a879; box-shadow: 0 0 0 3px rgb(53 168 121 / 12%); }
.field-label > small { color: #71877f; font-size: .76rem; font-weight: 650; }
.field-label span small { color: #71877f; font-weight: 700; }
.location-picker { margin-top: 20px; padding: 18px; border: 1px solid #d4e3db; border-radius: 20px; background: #f4f8f5; }
.location-picker-head { display: flex; align-items: center; justify-content: space-between; gap: 18px; margin-bottom: 14px; }
.location-picker-head > div { display: flex; flex-direction: column; gap: 4px; }
.location-picker-head strong { color: #17493c; font-size: 1rem; }
.map-label { display: flex; align-items: center; gap: 6px; color: #5c756d; font-size: .75rem; font-weight: 900; letter-spacing: .04em; text-transform: uppercase; }
.map-label svg { width: 15px; height: 15px; color: #35a879; }
.gps-button { min-height: 44px; padding: 9px 14px; border: 0; border-radius: 13px; background: #005a46; color: #fff; font-size: .8rem; font-weight: 900; cursor: pointer; box-shadow: 0 8px 20px rgb(0 90 70 / 15%); transition: transform .2s ease, background .2s ease; }
.gps-button:hover { background: #0a7058; transform: translateY(-1px); }
.event-map { position: relative; z-index: 1; width: 100%; height: 390px; overflow: hidden; border: 3px solid #fff; border-radius: 16px; background: #dce9e2; box-shadow: 0 12px 28px rgb(0 69 53 / 10%); }
.event-map .leaflet-control-attribution { font-size: .62rem; }
.event-map-marker { border: 0; background: transparent; }
.event-map-marker span { display: grid; width: 42px; height: 42px; place-items: center; font-size: 2rem; filter: drop-shadow(0 5px 5px rgb(0 50 39 / 30%)); }
.location-status { display: flex; align-items: center; gap: 10px; margin-top: 12px; padding: 11px 13px; border-radius: 13px; background: #fff; color: #6b7f78; }
.location-status > span { display: grid; width: 30px; height: 30px; flex: 0 0 30px; aspect-ratio: 1; place-items: center; border-radius: 50%; background: #edf2ef; line-height: 1; }
.location-status > div { display: flex; min-width: 0; flex-direction: column; }
.location-status strong { color: #31584d; font-size: .82rem; }
.location-status small { font-size: .72rem; line-height: 1.35; }
.location-status.selected { background: #eff8dc; color: #4f6a42; }
.location-status.selected > span { background: #a9d253; color: #164a3d; font-weight: 950; }
.payment-section legend { display: flex; align-items: center; gap: 7px; }
.payment-section legend svg { width: 17px; }
.payment-only-note { margin: -2px 0 10px; color: #58736a; font-size: .78rem; font-weight: 750; }
.payment-options { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 9px; }
.payment-option { display: flex; align-items: center; gap: 9px; min-height: 46px; padding: 10px 12px; border: 1.5px solid #d7e4dd; border-radius: 13px; color: #31584d; font-size: .84rem; font-weight: 800; cursor: pointer; }
.payment-option.selected { border-color: #8ebd31; background: #f4fae8; color: #214e42; }
.payment-option > span { display: flex; min-width: 0; flex-direction: column; line-height: 1.2; }
.payment-option strong { font-size: .82rem; white-space: nowrap; }
.payment-option small { margin-top: 3px; color: #6c847b; font-size: .65rem; font-weight: 850; }
.price-summary { display: grid; gap: 7px; margin: 18px 0 14px; }
.price-summary > div { display: flex; align-items: center; justify-content: space-between; }
.price-summary span { color: #688078; font-size: .82rem; }
.price-summary strong { color: #005a46; font-size: 1.3rem; }
.price-summary .price-label { display: flex; align-items: flex-start; flex-direction: column; gap: 4px; }
.price-summary .price-label small { padding: 3px 8px; border-radius: 999px; background: #eef7d9; color: #52751d; font-size: .68rem; font-weight: 900; line-height: 1.25; }
.price-summary .deposit { padding-top: 8px; border-top: 1px dashed #cbdad2; }
.price-summary .deposit strong { font-size: .92rem; }
.whatsapp-main { width: 100%; min-height: 54px; border-radius: 15px; background: #005a46; color: #a9d253; font-size: .96rem; font-weight: 900; }
.whatsapp-main:hover { background: #0b7059; color: #b9df6b; }
.whatsapp-main.location-required { background: #5f756e; color: #dbe7e2; }
.whatsapp-main.location-required:hover { background: #4e655e; color: #fff; }
.whatsapp-main img { width: 23px; height: 23px; object-fit: contain; }
.booking-note { display: flex; align-items: center; flex-direction: column; gap: 2px; margin: 10px 0 0; color: #71877f; font-size: .78rem; text-align: center; }
.equipment-section { padding: clamp(78px, 9vw, 132px) max(5vw, 24px); background: #f8fbf7; }
.equipment-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; max-width: 1400px; margin: 0 auto; }
.equipment-section .section-heading { max-width: 1400px; margin-inline: auto; }
.equipment-section .section-heading h2 { font-size: clamp(1.8rem, 3.25vw, 3.25rem); white-space: nowrap; }
.equipment-section .section-kicker { color: #a9d253; }
.equipment-card { overflow: hidden; border: 1px solid #d5e5d9; border-radius: 26px; background: #eff6e8; box-shadow: 0 16px 45px rgb(0 90 70 / 7%); transition: box-shadow .3s ease; }
.equipment-card:hover { box-shadow: 0 24px 55px rgb(0 90 70 / 12%); }
.equipment-media { position: relative; z-index: 2; display: grid; overflow: hidden; place-items: center; height: 370px; padding: 42px 30px 20px; background: #eff6e8; }
.equipment-media .equipment-product { width: 88%; height: 88%; max-width: 88%; max-height: 88%; object-fit: contain; filter: drop-shadow(0 17px 14px rgb(0 69 53 / 14%)); }
.equipment-copy { position: relative; z-index: 3; min-height: 292px; padding: 30px 26px 28px; background: #eff6e8; }
.equipment-copy > span { color: #79a928; font-size: .75rem; font-weight: 950; letter-spacing: .11em; text-transform: uppercase; }
.equipment-copy h3 { max-width: 100%; margin: 0 0 12px; color: #005a46; font-size: clamp(.98rem, 1.35vw, 1.16rem); font-weight: 950; line-height: 1.25; letter-spacing: -.02em; }
.equipment-copy p { margin: 0; color: #668078; line-height: 1.65; }
.equipment-features { display: grid; gap: 7px; margin: 18px 0 0; padding: 14px 0 0; border-top: 1px solid #e0ebe5; color: #43675d; font-size: .79rem; font-weight: 760; list-style: none; }
.equipment-features li { position: relative; padding-left: 17px; }
.equipment-features li::before { content: "✓"; position: absolute; left: 0; color: #7fad2c; font-weight: 950; }
.equipment-corner-brand { position: absolute; z-index: 2; top: 14px; left: 14px; width: 82px; height: 34px; object-fit: contain; object-position: left top; filter: none; }
.equipment-corner-brand.brand-fabrica { width: 108px; height: 38px; }
.equipment-corner-brand.brand-gadnic { width: 92px; height: 30px; }
.equipment-corner-brand.brand-estadio { width: 76px; height: 36px; }
.equipment-note { max-width: 1400px; margin: 18px auto 0; color: #6b817a; font-size: .78rem; }
.section { padding: clamp(76px, 9vw, 132px) max(5vw, 24px); }
.section-heading { max-width: 820px; margin-bottom: 46px; }
.section-heading h2, .safety-copy h2, .weather-section h2, .final-cta h2 { margin-bottom: 18px; color: #005a46; font-size: clamp(2.1rem, 4.2vw, 4.2rem); line-height: 1.03; letter-spacing: -.055em; font-weight: 950; }
.section-heading p { max-width: 620px; color: #607a72; font-size: 1.04rem; line-height: 1.7; }
.weather-section .section-kicker, .faq-section .section-kicker { color: #a9d253; }
.section-heading.compact { margin-bottom: 28px; }
.safety-section { display: grid; grid-template-columns: .95fr 1.05fr; gap: 70px; background: #005a46; color: white; }
.section-kicker.light { color: #b9df6b; }
.safety-copy h2 { color: white; }
.safety-copy p { max-width: 600px; color: #c9ddd6; line-height: 1.75; }
.safety-list { display: grid; grid-template-columns: 1fr 1fr; gap: 13px; margin: 0; padding: 0; list-style: none; align-content: center; }
.safety-list li { display: flex; align-items: center; gap: 11px; min-height: 64px; padding: 14px 16px; border: 1px solid rgb(255 255 255 / 15%); border-radius: 14px; background: rgb(255 255 255 / 6%); font-weight: 750; }
.safety-list svg { width: 20px; color: #a9d253; }
.weather-section { display: grid; grid-template-columns: auto 1fr auto; gap: 30px; align-items: center; max-width: 1180px; margin: 0 auto; }
.weather-section > svg { width: 62px; height: 62px; color: #35a879; stroke-width: 1.4; }
.weather-section h2 { margin-bottom: 10px; font-size: clamp(1.8rem, 3.4vw, 3.2rem); }
.weather-section p { max-width: 700px; margin: 0; color: #617a72; line-height: 1.65; }
.weather-section > a { font-weight: 900; color: #005a46; white-space: nowrap; }
.faq-section { max-width: 1050px; margin: 0 auto; padding-top: 40px; }
.faq-list { border-top: 1px solid #d7e4dd; }
.faq-list [data-slot="accordion-item"] { border-color: #d7e4dd; }
.faq-list [data-slot="accordion-trigger"] { padding: 22px 4px; color: #164a3d; font-size: 1.03rem; font-weight: 850; text-decoration: none; }
.faq-list [data-slot="accordion-content"] { max-width: 820px; padding-left: 4px; color: #5c786f; font-size: .96rem; line-height: 1.7; }
.final-cta { display: grid; grid-template-columns: auto 1fr auto; gap: 34px; align-items: center; margin: 30px max(3vw, 16px); padding: clamp(32px, 5vw, 62px); border-radius: 34px; background: #005a46; color: white; }
.final-cta img { width: 112px; height: 112px; object-fit: contain; }
.final-cta h2 { margin-bottom: 8px; color: white; font-size: clamp(2rem, 3.7vw, 3.8rem); }
.final-cta p { margin: 0; color: #c9ddd6; }
.final-button { min-height: 52px; padding-inline: 26px; border-radius: 15px; font-weight: 900; }
.sparkle-action { --button-radius: 9999px; --button-transition: .25s ease-in-out; position: relative; isolation: isolate; overflow: visible; display: inline-flex; align-items: center; justify-content: center; gap: .5rem; border: 0; border-radius: var(--button-radius); background: transparent; color: #164a3d; cursor: pointer; transform-origin: center; transition: transform var(--button-transition); }
.sparkle-action::before { content: ""; position: absolute; z-index: 0; top: 50%; left: 50%; width: 100%; height: 100%; border-radius: var(--button-radius); background: #b9dc72; box-shadow: inset 0 .5px rgb(255 255 255 / 72%), inset 0 -1px 2px rgb(50 91 36 / 16%), 0 7px 20px -10px rgb(0 90 70 / 32%); transform: translate(-50%, -50%); }
.sparkle-action::after { display: none; }
.sparkle-action:is(:hover, :focus-visible) { transform: translateY(-1px); }
.sparkle-action:active { transform: scale(1); }
.sparkle-dots-border { position: absolute; z-index: -1; top: 50%; left: 50%; width: calc(100% + 3px); height: calc(100% + 3px); overflow: hidden; border-radius: var(--button-radius); background: rgb(226 242 194 / 70%); transform: translate(-50%, -50%); }
.sparkle-dots-border::before { content: ""; position: absolute; top: 30%; left: 50%; width: 100%; height: 2rem; background: rgb(255 255 255 / 88%); mask: linear-gradient(transparent 0%, white 120%); transform: translate(-50%, -50%) rotate(0deg); transform-origin: left; animation: sparkle-border-spin 2.8s linear infinite; }
.sparkle-icon, .sparkle-text { position: relative; z-index: 10; }
.sparkle-icon { width: 1.4rem; height: 1.4rem; flex: 0 0 auto; }
.sparkle-path { fill: currentColor; stroke: currentColor; stroke-width: 1.1; color: #185c48; transform-origin: center; animation: sparkle-float 2.1s ease-in-out infinite; }
.sparkle-path:nth-child(2) { animation-delay: -.7s; }
.sparkle-path:nth-child(3) { animation-delay: -1.4s; }
.sparkle-text { display: inline-block; overflow: visible; padding: .08em 0 .2em; color: #185c48; line-height: 1.25; }
@keyframes sparkle-border-spin { to { transform: translate(-50%, -50%) rotate(360deg); } }
@keyframes sparkle-float { 0%, 100% { opacity: .72; transform: translateY(1.5px) scale(.94); } 50% { opacity: 1; transform: translateY(-2px) scale(1.12); } }
@keyframes hero-circles-drift { 0% { background-position: -10px -5px, 12px 10px, 0 0; } 50% { background-position: 12px 10px, -8px -6px, 0 0; } 100% { background-position: -4px 16px, 8px -12px, 0 0; } }
@keyframes hero-shape-wave { 0%, 100% { border-radius: 34% 66% 55% 45%; transform: translate3d(0, 0, 0) rotate(18deg) scale(1); } 35% { border-radius: 57% 43% 38% 62%; transform: translate3d(-10px, 8px, 0) rotate(27deg) scale(1.05); } 70% { border-radius: 42% 58% 68% 32%; transform: translate3d(8px, -7px, 0) rotate(10deg) scale(.97); } }
footer { padding: 60px max(5vw, 24px) 28px; background: #eff6f2; color: #55736a; }
.footer-main { display: flex; align-items: center; justify-content: center; }
.footer-links { display: flex; align-items: center; justify-content: center; gap: clamp(16px, 3.2vw, 40px); max-width: 100%; overflow-x: auto; font-size: .78rem; font-weight: 750; white-space: nowrap; scrollbar-width: none; }
.footer-links::-webkit-scrollbar { display: none; }
.footer-links a { color: #005a46; transition: color .2s ease, transform .2s ease; }
.footer-links a:hover { color: #0a7058; transform: translateX(2px); }
.fiscal-section { display: flex; justify-content: center; margin-top: 30px; text-align: center; }
.fiscal-link { display: inline-flex; align-items: center; gap: 12px; padding: 10px 14px; border: 1px solid #ccded4; border-radius: 14px; background: #fff; box-shadow: 0 8px 24px rgb(0 90 70 / 6%); }
.fiscal-link img { width: 58px; height: auto; object-fit: contain; }
.fiscal-link span { display: flex; align-items: center; flex-direction: column; gap: 2px; }
.fiscal-link strong { color: #005a46; font-size: .82rem; }
.fiscal-link small { color: #688078; font-size: .68rem; }
.social-section { display: flex; align-items: center; justify-content: center; gap: 18px; margin-top: 42px; padding: 26px 0; border-top: 1px solid #d1e1d8; border-bottom: 1px solid #d1e1d8; flex-direction: column; text-align: center; }
.social-section > strong { color: #005a46; font-size: .86rem; }
.social-links { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 10px; }
.social-links a { display: inline-flex; min-height: 42px; align-items: center; justify-content: center; gap: 8px; padding: 7px 13px; border: 1px solid rgb(0 90 70 / 16%); border-radius: 999px; background: rgb(255 255 255 / 76%); color: #005a46; font-size: .76rem; font-weight: 850; box-shadow: 0 7px 18px rgb(0 90 70 / 5%); transition: transform .2s ease, border-color .2s ease, background .2s ease; }
.social-links a:hover { border-color: rgb(0 90 70 / 32%); background: #fff; transform: translateY(-2px); }
.social-links img { width: 21px; height: 21px; object-fit: contain; }
.footer-bottom { display: flex; align-items: center; justify-content: center; padding-top: 28px; color: #688078; text-align: center; }
.footer-legal { display: flex; width: max-content; max-width: 100%; align-items: center; justify-content: center; flex-direction: column; gap: 5px; font-size: .75rem; text-align: center; }
.footer-legal > span { white-space: nowrap; }
.footer-love { display: inline-flex; align-items: center; justify-content: center; gap: 5px; }
.footer-love > span { color: #35a879; font-size: 1rem; line-height: 1; }
.floating-whatsapp { position: fixed; right: 22px; bottom: 22px; z-index: 40; display: grid; place-items: center; width: 58px; height: 58px; border-radius: 50%; background: #a9d253; color: #005a46; box-shadow: 0 12px 30px rgb(0 70 53 / 25%); }
.floating-whatsapp img { width: 30px; height: 30px; object-fit: contain; }
@media (max-width: 1040px) {
  .site-header { grid-template-columns: 1fr auto; } .desktop-nav { display: none; }
  .hero { min-height: auto; } .hero-copy { max-width: 850px; } .booking-card { max-width: 900px; }
  .calendar-section { grid-template-columns: 1fr; } .calendar-heading { max-width: 700px; }
  .combo-gallery { height: 190px; }
  .equipment-grid { grid-template-columns: 1fr 1fr; }
  .equipment-card-estadio { grid-column: span 2; display: grid; grid-template-columns: 1.1fr .9fr; }
  .equipment-card-estadio .equipment-copy { align-self: center; }
  .safety-section { grid-template-columns: 1fr; gap: 36px; }
}
@media (max-width: 700px) {
  .site-header { min-height: 66px; padding: 8px 16px; } .brand-icon { width: 40px; height: 40px; }
  .brand-name { font-size: 1.05rem; } .brand-kids { font-size: .56rem; } .header-cta { width: auto; height: 40px; padding: 0 12px; font-size: .73rem; }
  .header-cta img { width: 18px; height: 18px; } .hero { padding: 48px 8px 62px; background: radial-gradient(circle at 17% 18%, rgb(169 210 83 / 20%) 0 62px, transparent 64px), radial-gradient(circle at 78% 61%, rgb(0 90 70 / 7%) 0 64px, transparent 66px), linear-gradient(180deg, #f8fbf7 0%, #f8fbf7 76%, #edf5f1 100%); background-repeat: no-repeat; background-size: 100% 100%; } .hero h1 { margin-block: 24px 20px; font-size: clamp(1.42rem, 6.3vw, 1.95rem); line-height: 1.03; letter-spacing: -.045em; } .hero h1 span { white-space: nowrap; }
  .location-pill { gap: 4px; padding: 8px 7px; font-size: clamp(.61rem, 2.75vw, .69rem); letter-spacing: -.025em; }
  .location-pill svg { width: 13px; }
  .hero-lead { max-width: 351px; font-size: clamp(.72rem, 3.45vw, .82rem); line-height: 1.55; } .hero-actions { align-items: flex-start; flex-direction: column; gap: 16px; }
  .hero-actions { align-items: center; } .trust-row { display: grid; justify-content: center; } .payment-teaser { width: auto; max-width: 100%; padding: 8px 11px; } .payment-teaser > span { font-size: .65rem; }
  .calendar-section { padding: 52px 12px; } .calendar-heading h2 { font-size: clamp(1.8rem, 9vw, 2.65rem); } .calendar-frame { min-height: 440px; border-width: 4px; border-radius: 20px; } .calendar-frame iframe { height: 440px; }
  .booking-section { padding: 42px 12px; } .booking-card { padding: 20px 16px; border-radius: 24px; }
  .booking-heading { align-items: flex-start; } .booking-heading p { max-width: 210px; }
  .combo-options { grid-template-columns: 1fr; } .combo-option { display: grid; grid-template-columns: minmax(0, 1fr); }
  .combo-gallery { height: 210px; } .combo-gallery.images-1 { height: 244px; padding: 30px; } .combo-gallery.images-1 img { width: 82%; height: 82%; max-width: 82%; max-height: 82%; } .combo-content { min-height: 118px; } .combo-radio { left: 9px; top: 9px; }
  .duration-options, .form-grid, .payment-options { grid-template-columns: 1fr; }
  .location-picker { padding: 13px; } .location-picker-head { align-items: stretch; flex-direction: column; } .gps-button { width: 100%; } .event-map { height: 330px; }
  .equipment-section { padding-inline: 16px; } .equipment-grid { grid-template-columns: 1fr; }
  .equipment-card-estadio { grid-column: auto; display: block; }
  .equipment-section .section-heading h2 { font-size: clamp(1.28rem, 6vw, 1.55rem); letter-spacing: -.035em; }
  .equipment-media { height: 320px; padding: 34px 22px 18px; } .equipment-media .equipment-product { width: 84%; height: 84%; max-width: 84%; max-height: 84%; } .equipment-copy { min-height: auto; padding: 26px 16px; } .equipment-copy h3 { position: relative; z-index: 4; font-size: clamp(.92rem, 4vw, 1.02rem); font-weight: 950; line-height: 1.25; letter-spacing: -.02em; }
  .equipment-corner-brand { top: 12px; left: 12px; }
  .section { padding-inline: 18px; }
  .safety-list { grid-template-columns: 1fr; } .weather-section { grid-template-columns: 1fr; }
  .weather-section > a { margin-top: 8px; } .final-cta { grid-template-columns: 1fr; text-align: left; }
  footer { padding-inline: 12px; } .final-cta img { width: 86px; height: 86px; } .footer-links { width: 100%; justify-content: center; gap: 10px; padding-bottom: 4px; font-size: clamp(.61rem, 2.55vw, .69rem); } .fiscal-link { width: auto; max-width: 100%; } .social-section { align-items: center; } .social-links { width: 100%; justify-content: center; gap: 8px; } .social-links a { min-height: 38px; padding: 6px 10px; font-size: .7rem; } .social-links img { width: 18px; height: 18px; } .footer-legal { min-width: 0; font-size: .61rem; line-height: 1.4; } .footer-love > span { font-size: .82rem; } .floating-whatsapp { right: 16px; bottom: 16px; }
}
@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } * { transition-duration: .01ms !important; } .sparkle-dots-border, .sparkle-path, .hero, .hero::after { animation: none; } }
``````

## `app/layout.tsx`

``````tsx
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
``````

## `app/page.tsx`

``````tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import {
  CalendarDays, Check, Clock3, CloudRain, CreditCard, MapPin, MessageCircle,
  Navigation, ShieldCheck, Truck,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const WHATSAPP_NUMBER = "5493755639300";
const PLAIN_WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;
const ALBERDI_CENTER: [number, number] = [-27.36032, -55.2324];

const gameImages: Record<string, { src: string; alt: string }> = {
  pelotero: { src: "/juego-pelotero-cutout.png", alt: "Pelotero inflable multicolor" },
  metegol: { src: "/juego-metegol-estadio-cutout.png", alt: "Metegol Estadio de tamaño completo" },
  cama: { src: "/juego-cama-elastica-cutout.png", alt: "Cama elástica Gadnic con red de seguridad" },
};

const combos = [
  { id: "completo", name: "Combo completo", eyebrow: "Los tres juegos", price: 85000, featured: true },
  { id: "dos", name: "Dos juegos", eyebrow: "Elegí tus favoritos", price: 75000 },
  { id: "uno", name: "Un juego", eyebrow: "Elegí el que quieras", price: 65000 },
];

const gameOptions = ["Pelotero", "Metegol", "Cama Elástica"];

const durationOptions = [
  { hours: 3, extra: 0, label: "Incluido" },
  { hours: 4, extra: 20000, label: "¡Ahorrás $8.000!" },
  { hours: 5, extra: 35000, label: "¡Ahorrás $10.000!" },
];

const paymentMethods = ["Transferencia Bancaria", "Mercado Pago", "Tarjeta de Débito"];

const formatPrice = (value: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(value);

function SparkleButtonLabel({ children }: { children: string }) {
  return (
    <>
      <span className="sparkle-dots-border" aria-hidden="true" />
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="sparkle-icon" aria-hidden="true">
        <path className="sparkle-path" strokeLinejoin="round" strokeLinecap="round" d="M14.187 8.096 15 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L21.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09L15 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L8.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09Z" />
        <path className="sparkle-path" strokeLinejoin="round" strokeLinecap="round" d="m6 14.25-.259 1.035a3.75 3.75 0 0 1-2.456 2.456L2.25 18l1.035.259a3.75 3.75 0 0 1 2.456 2.456L6 21.75l.259-1.035a3.75 3.75 0 0 1 2.455-2.456L9.75 18l-1.036-.259a3.75 3.75 0 0 1-2.455-2.456L6 14.25Z" />
        <path className="sparkle-path" strokeLinejoin="round" strokeLinecap="round" d="m6.5 4-.197.592a1.5 1.5 0 0 1-.711.711L5 5.5l.592.197a1.5 1.5 0 0 1 .711.711L6.5 7l.197-.592a1.5 1.5 0 0 1 .711-.711L8 5.5l-.592-.197a1.5 1.5 0 0 1-.711-.711L6.5 4Z" />
      </svg>
      <span className="sparkle-text">{children}</span>
    </>
  );
}

export default function Home() {
  const [comboId, setComboId] = useState("completo");
  const [twoGames, setTwoGames] = useState("Pelotero + Metegol");
  const [singleGame, setSingleGame] = useState("Pelotero");
  const [date, setDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [durationHours, setDurationHours] = useState(3);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState("Elegí el lugar exacto tocando el mapa.");
  const [paymentMethod, setPaymentMethod] = useState("Transferencia Bancaria");
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const setMapPointRef = useRef<((lat: number, lng: number, focus?: boolean) => void) | null>(null);
  const combo = combos.find((item) => item.id === comboId) ?? combos[0];
  const durationExtra = durationOptions.find((item) => item.hours === durationHours)?.extra ?? 0;
  const priceBenefit = durationHours === 3
    ? "3 horas incluidas"
    : durationOptions.find((item) => item.hours === durationHours)?.label;
  const total = combo.price + durationExtra;
  const reservationAmount = total / 2;

  const selectedTwoGameIds = twoGames === "Pelotero + Cama Elástica"
    ? ["pelotero", "cama"]
    : twoGames === "Metegol + Cama Elástica"
      ? ["metegol", "cama"]
      : ["pelotero", "metegol"];

  const selectedSingleGameId = singleGame === "Metegol" ? "metegol" : singleGame === "Cama Elástica" ? "cama" : "pelotero";
  const comboGameLabel = (id: string) => id === "completo"
    ? "Pelotero + Metegol + Cama Elástica"
    : id === "dos"
      ? twoGames
      : singleGame;

  const comboImages = (id: string) => id === "completo"
    ? [gameImages.pelotero, gameImages.metegol, gameImages.cama]
    : id === "dos"
      ? selectedTwoGameIds.map((gameId) => gameImages[gameId])
      : [gameImages[selectedSingleGameId]];

  useEffect(() => {
    const context = (document as unknown as {
      modelContext?: {
        registerTool: (tool: {
          name: string;
          title: string;
          description: string;
          inputSchema: object;
          annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
          execute: (input: unknown) => unknown;
        }, options: { signal: AbortSignal }) => void | Promise<void>;
      };
    }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const validCombos = new Set(["completo", "dos", "uno"]);
    const validPayments = new Set(paymentMethods);
    void Promise.resolve(context.registerTool({
      name: "configure_combo_consultation",
      title: "Configurar consulta de combo",
      description: "Selecciona un combo de Inolvidable Kids y completa los datos visibles de la consulta.",
      inputSchema: {
        type: "object",
        properties: {
          comboId: { type: "string", enum: ["completo", "dos", "uno"] },
          date: { type: "string", description: "Fecha en formato AAAA-MM-DD." },
          eventTime: { type: "string", description: "Hora de inicio en formato HH:MM." },
          durationHours: { type: "number", enum: [3, 4, 5] },
          latitude: { type: "number", description: "Latitud exacta del evento." },
          longitude: { type: "number", description: "Longitud exacta del evento." },
          paymentMethod: { type: "string", enum: paymentMethods },
          twoGames: { type: "string", enum: ["Pelotero + Metegol", "Pelotero + Cama Elástica", "Metegol + Cama Elástica"] },
          singleGame: { type: "string", enum: gameOptions },
        },
        required: ["comboId"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input) {
        const values = input as Record<string, unknown>;
        if (!validCombos.has(String(values.comboId)) || (values.paymentMethod && !validPayments.has(String(values.paymentMethod)))) {
          throw new Error("Combo o medio de pago no válidos.");
        }
        setComboId(String(values.comboId));
        if (typeof values.date === "string") setDate(values.date);
        if (typeof values.eventTime === "string") setEventTime(values.eventTime);
        if ([3, 4, 5].includes(Number(values.durationHours))) setDurationHours(Number(values.durationHours));
        if (typeof values.latitude === "number" && typeof values.longitude === "number" && Number.isFinite(values.latitude) && Number.isFinite(values.longitude)) {
          setSelectedLocation({ lat: Number(values.latitude), lng: Number(values.longitude) });
          setMapPointRef.current?.(Number(values.latitude), Number(values.longitude), true);
        }
        if (typeof values.paymentMethod === "string") setPaymentMethod(values.paymentMethod);
        if (typeof values.twoGames === "string") setTwoGames(values.twoGames);
        if (typeof values.singleGame === "string") setSingleGame(values.singleGame);
        document.querySelector("#combos")?.scrollIntoView({ behavior: "smooth", block: "center" });
        return { configured: true, comboId: values.comboId };
      },
    }, { signal: lifecycle.signal })).catch(() => undefined);
    return () => lifecycle.abort();
  }, []);

  useEffect(() => {
    let disposed = false;
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    void import("leaflet").then((leafletModule) => {
      if (disposed || !mapContainerRef.current) return;
      const L = leafletModule.default ?? leafletModule;
      const map = L.map(mapContainerRef.current, { scrollWheelZoom: false }).setView(ALBERDI_CENTER, 12);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);
      const pinIcon = L.divIcon({
        className: "event-map-marker",
        html: "<span aria-hidden=\"true\">📍</span>",
        iconSize: [42, 42],
        iconAnchor: [21, 39],
      });
      const setPoint = (lat: number, lng: number, focus = false) => {
        const point = L.latLng(lat, lng);
        if (markerRef.current) markerRef.current.setLatLng(point);
        else markerRef.current = L.marker(point, { icon: pinIcon }).addTo(map);
        if (focus) map.setView(point, 16);
        setSelectedLocation({ lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) });
        setGeoStatus("Ubicación seleccionada. Podés moverla tocando otro punto del mapa.");
      };
      map.on("click", (event) => setPoint(event.latlng.lat, event.latlng.lng));
      mapInstanceRef.current = map;
      setMapPointRef.current = setPoint;
      window.setTimeout(() => map.invalidateSize(), 0);
    });

    return () => {
      disposed = true;
      setMapPointRef.current = null;
      markerRef.current = null;
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus("Tu dispositivo no permite obtener la ubicación automáticamente.");
      return;
    }
    setGeoStatus("Buscando tu ubicación…");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setMapPointRef.current?.(coords.latitude, coords.longitude, true),
      () => setGeoStatus("No pudimos acceder al GPS. Permití la ubicación o marcá el lugar en el mapa."),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
    );
  };

  const googleMapsLink = selectedLocation
    ? `https://google.com/maps?q=${selectedLocation.lat},${selectedLocation.lng}`
    : "";

  const whatsappUrl = useMemo(() => {
    const detail = comboId === "dos" ? ` (${twoGames})` : comboId === "uno" ? ` (${singleGame})` : "";
    const message = [
      "Hola, Inolvidable Kids 👋",
      `Quiero consultar disponibilidad para ${combo.name}${detail}.`,
      `Fecha: ${date || "a confirmar"}.`,
      `Hora de inicio: ${eventTime || "a confirmar"}.`,
      `Duración: ${durationHours} horas.`,
      googleMapsLink ? `Ubicación del evento: ${googleMapsLink}.` : "Ubicación exacta: todavía no seleccionada.",
      `Medio de pago preferido: ${paymentMethod}.`,
      `Total estimado: ${formatPrice(total)}.`,
      `Reservación 50%: ${formatPrice(reservationAmount)}.`,
    ].filter(Boolean).join("\n");
    return `${PLAIN_WHATSAPP_URL}?text=${encodeURIComponent(message)}`;
  }, [combo.name, comboId, date, durationHours, eventTime, googleMapsLink, paymentMethod, reservationAmount, singleGame, total, twoGames]);

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#inicio" aria-label="Inolvidable Kids, inicio">
          <img src="/inolvidable-icon.png" alt="" className="brand-icon" />
          <span className="brand-name">Inolvidable</span>
          <span className="brand-kids">KIDS</span>
        </a>
        <nav className="desktop-nav" aria-label="Navegación principal">
          <a href="#combos">Combos</a><a href="#fechas">Fechas</a>
          <a href="#seguridad">Seguridad</a><a href="#preguntas">Preguntas</a>
        </nav>
        <Button asChild className="header-cta">
          <a href={PLAIN_WHATSAPP_URL} target="_blank" rel="noreferrer"><img src="/social-whatsapp-light.png" alt="" /> <span>WhatsApp</span></a>
        </Button>
      </header>

      <section className="hero" id="inicio">
        <div className="hero-copy">
          <div className="location-pill" data-detector-ignore="true"><MapPin /> Colonia Alberdi, General Alvear, Oberá y Alrededores</div>
          <h1>
            <span>Llevamos la diversión</span>
            <span>para recuerdos inolvidables</span>
          </h1>
          <p className="hero-lead"><span>Alquiler de peloteros, metegoles y camas elásticas</span><span>para cumpleaños en tu casa o donde quieras.</span></p>
          <div className="hero-actions">
            <Button asChild size="lg" className="primary-action sparkle-action"><a href="#combos"><SparkleButtonLabel>¡Elegir mi combo!</SparkleButtonLabel></a></Button>
          </div>
          <div className="trust-row" aria-label="Beneficios principales">
            <span><Truck /> Traslado gratis en Colonia Alberdi</span>
            <span><ShieldCheck /> Equipos probados</span>
            <span><CloudRain /> Reprogramación por lluvia</span>
          </div>
          <div className="payment-teaser">
            <div className="payment-heading"><CreditCard /><strong>Métodos de pago</strong></div>
            <span>Transferencia Bancaria · Mercado Pago · Tarjeta de Débito</span>
          </div>
        </div>
      </section>

      <section className="booking-section" id="combos">
        <div className="booking-card">
          <div className="booking-heading">
            <div><span className="section-kicker booking-kicker">La diversión empieza acá</span><h2>¡Armá tu combo!</h2><p>Elegí tus juegos, la fecha y el tiempo que necesitás.</p></div>
            <span className="duration"><Clock3 /> {durationHours} horas</span>
          </div>
          <RadioGroup value={comboId} onValueChange={setComboId} aria-label="Combos disponibles" className="combo-options">
            {combos.map((item) => (
              <label key={item.id} className={`combo-option ${comboId === item.id ? "selected" : ""}`}>
                <RadioGroupItem value={item.id} className="combo-radio" aria-label={item.name} />
                <span className={`combo-gallery images-${comboImages(item.id).length}`} aria-hidden="true">
                  {comboImages(item.id).map((image) => <img key={image.src} src={image.src} alt="" />)}
                </span>
                <span className="combo-content">
                  <span className="combo-topline"><strong>{item.name}</strong>{item.featured && <span className="popular">Más completo</span>}</span>
                  <span className="combo-eyebrow">{comboGameLabel(item.id)}</span>
                  <strong className="combo-price">{item.id === "uno" ? "Desde " : ""}{formatPrice(item.price)}</strong>
                </span>
              </label>
            ))}
          </RadioGroup>

          {comboId === "dos" && (
            <label className="field-label combo-detail">¿Qué dos juegos preferís?
              <select value={twoGames} onChange={(event) => setTwoGames(event.target.value)}>
                <option>Pelotero + Metegol</option><option>Pelotero + Cama Elástica</option><option>Metegol + Cama Elástica</option>
              </select>
            </label>
          )}

          {comboId === "uno" && (
            <label className="field-label combo-detail">¿Qué juego preferís?
              <select value={singleGame} onChange={(event) => setSingleGame(event.target.value)}>
                {gameOptions.map((game) => <option key={game}>{game}</option>)}
              </select>
            </label>
          )}

          <fieldset className="choice-section">
            <legend>¿Cuánto tiempo querés disfrutarlo?</legend>
            <RadioGroup value={String(durationHours)} onValueChange={(value) => setDurationHours(Number(value))} className="duration-options" aria-label="Duración del alquiler">
              {durationOptions.map((option) => (
                <label key={option.hours} className={`choice-pill ${durationHours === option.hours ? "selected" : ""}`}>
                  <RadioGroupItem value={String(option.hours)} />
                  <span><strong>{option.hours} horas</strong><small className={option.hours > 3 ? "saving-label" : ""}>{option.label}</small></span>
                </label>
              ))}
            </RadioGroup>
          </fieldset>

          <div className="form-grid event-grid event-grid-simple">
            <label className="field-label"><span><CalendarDays /> Fecha del evento</span><input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
            <label className="field-label"><span><Clock3 /> Hora de inicio</span><input type="time" value={eventTime} onChange={(event) => setEventTime(event.target.value)} /></label>
          </div>

          <section className="location-picker" id="mapa-evento" aria-labelledby="location-picker-title">
            <div className="location-picker-head">
              <div><span className="map-label"><Navigation /> Ubicación exacta del evento</span><strong id="location-picker-title">Marcá el lugar en el mapa</strong></div>
              <button type="button" className="gps-button" onClick={useCurrentLocation}>📍 Usar mi ubicación actual (GPS)</button>
            </div>
            <div ref={mapContainerRef} className="event-map" aria-label="Mapa para elegir la ubicación exacta del evento" />
            <div className={`location-status ${selectedLocation ? "selected" : ""}`} role="status">
              <span>{selectedLocation ? "✓" : "📍"}</span>
              <div><strong>{selectedLocation ? "Ubicación lista" : "Ubicación obligatoria"}</strong><small>{geoStatus}</small></div>
            </div>
          </section>

          <fieldset className="choice-section payment-section">
            <legend><CreditCard /> Medio de pago preferido</legend>
            <p className="payment-only-note">Transferencia Bancaria, Mercado Pago o Tarjeta de Débito.</p>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="payment-options" aria-label="Medio de pago">
              {paymentMethods.map((method) => (
                <label key={method} className={`payment-option ${paymentMethod === method ? "selected" : ""}`}>
                  <RadioGroupItem value={method} /> <span><strong>{method}</strong></span>
                </label>
              ))}
            </RadioGroup>
          </fieldset>

          <div className="price-summary">
            <div><span className="price-label">Total Estimado<small>{priceBenefit}</small></span><strong>{formatPrice(total)}</strong></div>
            <div className="deposit"><span>Reservación 50%</span><strong>{formatPrice(reservationAmount)}</strong></div>
          </div>
          <Button asChild size="lg" className={`whatsapp-main ${selectedLocation ? "" : "location-required"}`}><a href={selectedLocation ? whatsappUrl : "#mapa-evento"} target={selectedLocation ? "_blank" : undefined} rel={selectedLocation ? "noreferrer" : undefined}><img src="/social-whatsapp-light.png" alt="" /> {selectedLocation ? "Consultar Disponibilidad" : "Seleccioná la ubicación para consultar"}</a></Button>
          <p className="booking-note"><span>(Traslado gratis en Colonia Alberdi)</span><span>Para otras zonas, el flete se cotiza según la ubicación marcada.</span></p>
        </div>
      </section>

      <section className="calendar-section" id="fechas">
        <div className="calendar-heading">
          <span className="section-kicker light">¿Está libre tu fecha?</span>
          <h2>Consultá nuestras fechas disponibles</h2>
          <p>Revisá el calendario y después armá tu combo para confirmar la disponibilidad.</p>
          <Button asChild size="lg" className="calendar-cta sparkle-action"><a href="#combos"><SparkleButtonLabel>¡Armá tu combo ahora!</SparkleButtonLabel></a></Button>
        </div>
        <div className="calendar-frame">
          <iframe
            src="https://calendar.google.com/calendar/embed?src=inolvidablekids%40gmail.com&ctz=America%2FArgentina%2FCordoba"
            title="Calendario de fechas disponibles de Inolvidable Kids"
            frameBorder="0"
            scrolling="no"
          />
        </div>
      </section>

      <section className="equipment-section" id="equipos">
        <div className="section-heading compact">
          <span className="section-kicker">Antes de elegir</span>
          <h2>Conocé cada juego de cerca.</h2>
          <p>Modelos seleccionados para crear una experiencia divertida, segura y memorable.</p>
        </div>
        <div className="equipment-grid">
          <article className="equipment-card">
            <div className="equipment-media"><img className="equipment-corner-brand brand-fabrica" src="/marca-fabrica-inflables.png" alt="La Fábrica de Inflables" /><img className="equipment-product" src="/juego-pelotero-cutout.png" alt="Pelotero inflable multicolor con entrada y tobogán" /></div>
            <div className="equipment-copy">
              <h3>Juego, saltos y tobogán</h3><p>Inflable 3x4 metros con rampa.</p>
              <ul className="equipment-features"><li>Rampa lateral para deslizarse</li><li>Amplia zona de saltos y juego</li><li>Ideal para cumpleaños infantiles</li></ul>
            </div>
          </article>
          <article className="equipment-card">
            <div className="equipment-media"><img className="equipment-corner-brand brand-gadnic" src="/marca-gadnic.png" alt="Gadnic" /><img className="equipment-product" src="/juego-cama-elastica-cutout.png" alt="Cama elástica Gadnic azul con red protectora" /></div>
            <div className="equipment-copy">
              <h3>Cama Elástica Gadnic</h3><p>Salto uniforme y cómodo.</p>
              <ul className="equipment-features"><li>Red de protección en todo el contorno</li><li>Superficie amplia para saltar</li><li>Uso infantil con supervisión adulta</li></ul>
            </div>
          </article>
          <article className="equipment-card equipment-card-estadio">
            <div className="equipment-media"><img className="equipment-corner-brand brand-estadio" src="/marca-estadio.png" alt="Estadio" /><img className="equipment-product" src="/juego-metegol-estadio-cutout.png" alt="Metegol Estadio con jugadores de Argentina y Brasil" /></div>
            <div className="equipment-copy">
              <h3>Metegol Estadio Profesional</h3><p>Diversión para chicos y grandes.</p>
              <ul className="equipment-features"><li>Tamaño profesional para jugar cómodos</li><li>Jugadores de Argentina y Brasil</li><li>Diversión para chicos y grandes</li></ul>
            </div>
          </article>
        </div>
      </section>

      <section className="section safety-section" id="seguridad">
        <div className="safety-copy">
          <span className="section-kicker light">Diversión responsable</span>
          <h2>Un espacio preparado hace la diferencia.</h2>
          <p>Antes del evento confirmamos con la familia que el lugar permita una instalación firme, cómoda y segura. Trabajamos con equipos nuevos, a estrenar, que se entregan limpios y desinfectados para cuidar a los más chicos. Además, entregamos un comprobante oficial de la contratación para mayor tranquilidad.</p>
        </div>
        <ul className="safety-list">
          <li><Check /> Lugar firme, nivelado y despejado</li><li><Check /> Distancia segura de ramas, cables y obstáculos</li>
          <li><Check /> Toma eléctrica cercana y protegida</li><li><Check /> Acceso libre para instalar y retirar</li>
          <li><Check /> Supervisión adulta durante el uso</li><li><Check /> Equipos nuevos, limpios y desinfectados</li>
          <li><Check /> Revisión y prueba antes de cada evento</li><li><Check /> Comprobante oficial de contratación</li>
        </ul>
      </section>

      <section className="section weather-section">
        <CloudRain />
        <div><span className="section-kicker">Si el clima no acompaña</span><h2>Tu reservación pasa a una nueva fecha.</h2><p>Podés reprogramar una vez sin costo por lluvia o condiciones que no permitan una instalación segura, sujeto a disponibilidad.</p></div>
        <a href="#preguntas">Ver condiciones <span aria-hidden="true">→</span></a>
      </section>

      <section className="section faq-section" id="preguntas">
        <div className="section-heading compact"><span className="section-kicker">Antes de reservar</span><h2>Preguntas frecuentes</h2></div>
        <Accordion type="single" collapsible className="faq-list">
          <AccordionItem value="lluvia"><AccordionTrigger>¿Qué pasa si llueve?</AccordionTrigger><AccordionContent>Reprogramamos una vez sin costo, sujeto a disponibilidad. La reservación pasa a la nueva fecha.</AccordionContent></AccordionItem>
          <AccordionItem value="flete"><AccordionTrigger>¿El flete está incluido?</AccordionTrigger><AccordionContent>Sí, dentro de Colonia Alberdi. Para General Alvear, Oberá y alrededores se cotiza según la distancia.</AccordionContent></AccordionItem>
          <AccordionItem value="limpieza"><AccordionTrigger>¿Los juegos se entregan limpios?</AccordionTrigger><AccordionContent>Sí. Los equipos se limpian, revisan y prueban antes de cada evento.</AccordionContent></AccordionItem>
          <AccordionItem value="pagos"><AccordionTrigger>¿Cómo puedo pagar?</AccordionTrigger><AccordionContent>Aceptamos Transferencia Bancaria, Mercado Pago y Tarjeta de Débito. La fecha se confirma con una reservación del 50%.</AccordionContent></AccordionItem>
          <AccordionItem value="armado"><AccordionTrigger>¿Cuánto tarda el armado?</AccordionTrigger><AccordionContent>Depende del combo y del acceso al lugar. Coordinamos la llegada con anticipación para dejar todo listo antes del festejo.</AccordionContent></AccordionItem>
          <AccordionItem value="precio"><AccordionTrigger>¿Qué incluye el precio base?</AccordionTrigger><AccordionContent>Incluye 3 horas, traslado dentro de Colonia Alberdi, instalación, prueba de los equipos y retiro coordinado.</AccordionContent></AccordionItem>
          <AccordionItem value="ahorro"><AccordionTrigger>¿Cómo se calcula el ahorro por horas extras?</AccordionTrigger><AccordionContent>El selector actualiza el total automáticamente: con 4 horas ahorrás $8.000 y con 5 horas ahorrás $10.000.</AccordionContent></AccordionItem>
        </Accordion>
      </section>

      <section className="final-cta">
        <img src="/inolvidable-icon.png" alt="" />
        <div><span className="section-kicker light">¿Ya tenés la fecha?</span><h2>Hagamos que sea inolvidable.</h2><p>Elegí tu combo y consultanos la disponibilidad por WhatsApp.</p></div>
        <Button asChild size="lg" className="final-button sparkle-action"><a href="#combos"><SparkleButtonLabel>¡Elegir un combo!</SparkleButtonLabel></a></Button>
      </section>

      <footer>
        <div className="footer-main">
          <div className="footer-links"><a href="#fechas">Fechas disponibles</a><a href="#combos">Combos</a><a href="#seguridad">Seguridad</a><a href="#preguntas">Preguntas frecuentes</a></div>
        </div>
        <div className="fiscal-section">
          <a href="https://qr.afip.gob.ar/?qr=dtFKsQDLajD3yE-P0kGaEg,," target="_F960AFIPInfo" rel="noreferrer" className="fiscal-link">
            <img src="https://www.afip.gob.ar/images/f960/DATAWEB.jpg" alt="Formulario 960/D - Data Fiscal" />
            <span><strong>Comercio Registrado</strong><small>Consultá nuestra Data Fiscal en ARCA</small></span>
          </a>
        </div>
        <div className="social-section">
          <strong>¡Síguenos en nuestras redes sociales!</strong>
          <div className="social-links">
            <a href="https://www.instagram.com/inolvidablekids/" target="_blank" rel="noreferrer"><img src="/social-instagram.png" alt="" /><span>Instagram</span></a>
            <a href="https://www.tiktok.com/@inolvidablekids" target="_blank" rel="noreferrer"><img src="/social-tiktok.png" alt="" /><span>TikTok</span></a>
            <a href={PLAIN_WHATSAPP_URL} target="_blank" rel="noreferrer"><img src="/social-whatsapp.png" alt="" /><span>WhatsApp</span></a>
            <a href="https://www.facebook.com/profile.php?id=61594786734250" target="_blank" rel="noreferrer"><img src="/social-facebook.png" alt="" /><span>Facebook</span></a>
            <a href="https://www.youtube.com/@InolvidableKids" target="_blank" rel="noreferrer"><img src="/social-youtube.png" alt="" /><span>YouTube</span></a>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-legal">
            <span>© {new Date().getFullYear()} Inolvidable Kids. Todos los derechos reservados.</span>
            <span className="footer-love"><span aria-hidden="true">♥</span> Hecho con amor para todos los niños.</span>
          </div>
        </div>
      </footer>
      <a className="floating-whatsapp" href={PLAIN_WHATSAPP_URL} target="_blank" rel="noreferrer" aria-label="Consultar por WhatsApp"><img src="/social-whatsapp.png" alt="" /></a>
    </main>
  );
}
``````

## `build/sites-vite-plugin.LICENSE`

``````text
MIT License

Copyright (c) 2026 OpenAI

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
``````

## `build/sites-vite-plugin.ts`

``````typescript
// Vendored from @openai/sites-vite-plugin 0.2.0 (openai/sites#9).
// See sites-vite-plugin.LICENSE for the upstream MIT license.
import { access, cp, mkdir, rm } from "node:fs/promises";
import type { IncomingMessage, ServerResponse } from "node:http";
import { resolve } from "node:path";
import type { Plugin } from "vite";

const localUserId = "local_seedy";
const localEmail = "seedy@sites.test";
const localFullName = "Seedy";
const localCookieName = "__sites_local_auth";
const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);
const localAddresses = new Set(["127.0.0.1", "::1", "::ffff:127.0.0.1"]);
const authPaths = new Set([
  "/signin-with-chatgpt",
  "/signout-with-chatgpt",
  "/callback",
]);

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

export function sites({ mockAuth = true } = {}): Plugin {
  let root = process.cwd();
  let command: "build" | "serve" = "build";

  return {
    name: "sites",
    configResolved(config) {
      root = config.root;
      command = config.command;
    },
    configureServer(server) {
      if (!mockAuth) return;
      const secure = Boolean(server.config.server.https);

      server.config.logger.info(`Sites local sign-in: ${localEmail}`);
      server.middlewares.use((request, response, next) => {
        for (const name of Object.keys(request.headers)) {
          if (name.startsWith("oai-authenticated-user-")) {
            removeHeader(request, name);
          }
        }

        let authority: URL;
        let url: URL;
        try {
          authority = new URL(
            `${secure ? "https" : "http"}://${request.headers.host}`,
          );
          url = new URL(request.url ?? "/", authority);
        } catch {
          if (authPaths.has((request.url ?? "/").split("?")[0])) {
            respond(response, 403);
          } else {
            next();
          }
          return;
        }

        const hostname = authority.hostname
          .replace(/^\[|\]$/g, "")
          .toLowerCase();
        if (
          !localHosts.has(hostname) ||
          !localAddresses.has(request.socket.remoteAddress ?? "") ||
          url.origin !== authority.origin
        ) {
          if (authPaths.has(url.pathname)) respond(response, 403);
          else next();
          return;
        }

        const cookies = (request.headers.cookie ?? "")
          .split(";")
          .map((cookie) => cookie.trim())
          .filter(Boolean);
        const signInCookies = cookies
          .filter((cookie) => cookie.startsWith(`${localCookieName}=`))
          .map((cookie) => cookie.slice(localCookieName.length + 1));
        const applicationCookies = cookies.filter(
          (cookie) => !cookie.startsWith(`${localCookieName}=`),
        );
        if (applicationCookies.length !== cookies.length) {
          removeHeader(request, "cookie");
          if (applicationCookies.length) {
            setHeader(request, "cookie", applicationCookies.join("; "));
          }
        }

        if (url.pathname === "/callback") {
          respond(response, 501);
          return;
        }

        const signIn = url.pathname === "/signin-with-chatgpt";
        const signOut = url.pathname === "/signout-with-chatgpt";
        if (!signIn && !signOut) {
          if (signInCookies.length === 1 && signInCookies[0] === "1") {
            setHeader(request, "oai-authenticated-user-id", localUserId);
            setHeader(request, "oai-authenticated-user-email", localEmail);
            setHeader(
              request,
              "oai-authenticated-user-full-name",
              localFullName,
            );
            setHeader(
              request,
              "oai-authenticated-user-full-name-encoding",
              "percent-encoded-utf-8",
            );
          }
          next();
          return;
        }

        if (
          (request.headers.origin && request.headers.origin !== url.origin) ||
          request.headers["sec-fetch-site"] === "cross-site"
        ) {
          respond(response, 403);
          return;
        }

        if (
          request.headers["next-router-prefetch"] !== undefined ||
          request.headers["x-middleware-prefetch"] === "1" ||
          [request.headers.purpose, request.headers["sec-purpose"]].some(
            (value) =>
              typeof value === "string" &&
              value
                .split(/[;,]/)
                .some((part) => part.trim().toLowerCase() === "prefetch"),
          )
        ) {
          respond(response, 204);
          return;
        }

        if (
          request.method !== "GET" &&
          (!signOut || request.method !== "POST")
        ) {
          response.setHeader("Allow", signIn ? "GET" : "GET, POST");
          respond(response, 405);
          return;
        }

        response.statusCode = request.method === "POST" ? 303 : 302;
        response.setHeader("Cache-Control", "private, no-store");
        response.setHeader(
          "Location",
          safeReturn(url.searchParams.get("return_to")),
        );
        response.setHeader(
          "Set-Cookie",
          `${localCookieName}=${signIn ? "1" : ""}; Path=/; ${
            signOut ? "Max-Age=0; " : ""
          }HttpOnly; SameSite=Lax${secure ? "; Secure" : ""}`,
        );
        response.end();
      });
    },
    async closeBundle() {
      if (command !== "build") return;

      const outputDirectory = resolve(root, "dist", ".openai");
      const hostingConfig = resolve(root, ".openai", "hosting.json");
      const drizzleSource = resolve(root, "drizzle");

      await rm(outputDirectory, { recursive: true, force: true });
      await mkdir(outputDirectory, { recursive: true });

      await cp(hostingConfig, resolve(outputDirectory, "hosting.json"));
      if (await exists(drizzleSource)) {
        await cp(drizzleSource, resolve(outputDirectory, "drizzle"), {
          recursive: true,
        });
      }
    },
  };
}

function removeHeader(request: IncomingMessage, name: string): void {
  delete request.headers[name];
  for (let index = request.rawHeaders.length - 2; index >= 0; index -= 2) {
    if (request.rawHeaders[index]?.toLowerCase() === name) {
      request.rawHeaders.splice(index, 2);
    }
  }
}

function setHeader(
  request: IncomingMessage,
  name: string,
  value: string,
): void {
  removeHeader(request, name);
  request.headers[name] = value;
  request.rawHeaders.push(name, value);
}

function respond(response: ServerResponse, status: number): void {
  response.statusCode = status;
  response.setHeader("Cache-Control", "private, no-store");
  response.end();
}

function safeReturn(value: string | null): string {
  if (!value?.startsWith("/") || value.startsWith("//")) return "/";

  try {
    const url = new URL(value, "http://localhost");
    if (url.origin !== "http://localhost" || authPaths.has(url.pathname)) {
      return "/";
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/";
  }
}
``````

## `cloudflare-env.d.ts`

``````typescript
declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
  }
}
``````

## `components/ui/accordion.tsx`

``````tsx
"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"
import { Accordion as AccordionPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Accordion({
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-b last:border-b-0", className)}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon className="pointer-events-none size-4 shrink-0 translate-y-0.5 text-muted-foreground transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      {...props}
    >
      <div className={cn("pt-0 pb-4", className)}>{children}</div>
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
``````

## `components/ui/alert-dialog.tsx`

``````tsx
"use client"

import * as React from "react"
import { AlertDialog as AlertDialogPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

function AlertDialog({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />
}

function AlertDialogTrigger({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return (
    <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
  )
}

function AlertDialogPortal({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  return (
    <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
  )
}

function AlertDialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogContent({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Content> & {
  size?: "default" | "sm"
}) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        data-size={size}
        className={cn(
          "group/alert-dialog-content fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-background p-6 shadow-lg duration-200 data-[size=sm]:max-w-xs data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[size=default]:sm:max-w-lg",
          className
        )}
        {...props}
      />
    </AlertDialogPortal>
  )
}

function AlertDialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn(
        "grid grid-rows-[auto_1fr] place-items-center gap-1.5 text-center has-data-[slot=alert-dialog-media]:grid-rows-[auto_auto_1fr] has-data-[slot=alert-dialog-media]:gap-x-6 sm:group-data-[size=default]/alert-dialog-content:place-items-start sm:group-data-[size=default]/alert-dialog-content:text-left sm:group-data-[size=default]/alert-dialog-content:has-data-[slot=alert-dialog-media]:grid-rows-[auto_1fr]",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 group-data-[size=sm]/alert-dialog-content:grid group-data-[size=sm]/alert-dialog-content:grid-cols-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn(
        "text-lg font-semibold sm:group-data-[size=default]/alert-dialog-content:group-has-data-[slot=alert-dialog-media]/alert-dialog-content:col-start-2",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function AlertDialogMedia({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-media"
      className={cn(
        "mb-2 inline-flex size-16 items-center justify-center rounded-md bg-muted sm:group-data-[size=default]/alert-dialog-content:row-span-2 *:[svg:not([class*='size-'])]:size-8",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogAction({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Action> &
  Pick<React.ComponentProps<typeof Button>, "variant" | "size">) {
  return (
    <Button variant={variant} size={size} asChild>
      <AlertDialogPrimitive.Action
        data-slot="alert-dialog-action"
        className={cn(className)}
        {...props}
      />
    </Button>
  )
}

function AlertDialogCancel({
  className,
  variant = "outline",
  size = "default",
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel> &
  Pick<React.ComponentProps<typeof Button>, "variant" | "size">) {
  return (
    <Button variant={variant} size={size} asChild>
      <AlertDialogPrimitive.Cancel
        data-slot="alert-dialog-cancel"
        className={cn(className)}
        {...props}
      />
    </Button>
  )
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
}
``````

## `components/ui/alert.tsx`

``````tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative grid w-full grid-cols-[0_1fr] items-start gap-y-0.5 rounded-lg border px-4 py-3 text-sm has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] has-[>svg]:gap-x-3 [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive:
          "bg-card text-destructive *:data-[slot=alert-description]:text-destructive/90 [&>svg]:text-current",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight",
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "col-start-2 grid justify-items-start gap-1 text-sm text-muted-foreground [&_p]:leading-relaxed",
        className
      )}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription }
``````

## `components/ui/aspect-ratio.tsx`

``````tsx
"use client"

import { AspectRatio as AspectRatioPrimitive } from "radix-ui"

function AspectRatio({
  ...props
}: React.ComponentProps<typeof AspectRatioPrimitive.Root>) {
  return <AspectRatioPrimitive.Root data-slot="aspect-ratio" {...props} />
}

export { AspectRatio }
``````

## `components/ui/attachment.tsx`

``````tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const attachmentVariants = cva(
  "group/attachment relative flex w-fit max-w-full min-w-0 shrink-0 flex-wrap rounded-xl border bg-card text-card-foreground transition-colors focus-within:ring-1 focus-within:ring-ring/50 has-[>a,>button]:hover:bg-muted/50 data-[state=error]:border-destructive/30 data-[state=idle]:border-dashed",
  {
    variants: {
      size: {
        default:
          "gap-2 text-sm has-data-[slot=attachment-content]:px-2.5 has-data-[slot=attachment-content]:py-2 has-data-[slot=attachment-media]:p-2",
        sm: "gap-2.5 text-xs has-data-[slot=attachment-content]:px-2 has-data-[slot=attachment-content]:py-1.5 has-data-[slot=attachment-media]:p-1.5",
        xs: "gap-1.5 rounded-lg text-xs has-data-[slot=attachment-content]:px-1.5 has-data-[slot=attachment-content]:py-1 has-data-[slot=attachment-media]:p-1",
      },
      orientation: {
        horizontal: "min-w-40 items-center",
        vertical: "w-24 flex-col has-data-[slot=attachment-content]:w-30",
      },
    },
  }
)

function Attachment({
  className,
  state = "done",
  size = "default",
  orientation = "horizontal",
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof attachmentVariants> & {
    state?: "idle" | "uploading" | "processing" | "error" | "done"
  }) {
  return (
    <div
      data-slot="attachment"
      data-state={state}
      data-size={size}
      data-orientation={orientation}
      className={cn(attachmentVariants({ size, orientation }), className)}
      {...props}
    />
  )
}

const attachmentMediaVariants = cva(
  "relative flex aspect-square w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted text-foreground group-data-[orientation=vertical]/attachment:w-full group-data-[size=sm]/attachment:w-8 group-data-[size=xs]/attachment:w-7 group-data-[size=xs]/attachment:rounded-md group-data-[state=error]/attachment:bg-destructive/10 group-data-[state=error]/attachment:text-destructive group-data-[orientation=vertical]/attachment:*:data-[slot=spinner]:size-6! [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 group-data-[orientation=vertical]/attachment:[&_svg:not([class*='size-'])]:size-6 group-data-[size=xs]/attachment:[&_svg:not([class*='size-'])]:size-3.5",
  {
    variants: {
      variant: {
        icon: "",
        image:
          "opacity-60 group-data-[state=done]/attachment:opacity-100 group-data-[state=idle]/attachment:opacity-100 *:[img]:aspect-square *:[img]:w-full *:[img]:object-cover",
      },
    },
    defaultVariants: {
      variant: "icon",
    },
  }
)

function AttachmentMedia({
  className,
  variant = "icon",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof attachmentMediaVariants>) {
  return (
    <div
      data-slot="attachment-media"
      data-variant={variant}
      className={cn(attachmentMediaVariants({ variant }), className)}
      {...props}
    />
  )
}

function AttachmentContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="attachment-content"
      className={cn(
        "max-w-full min-w-0 flex-1 leading-tight group-data-[orientation=vertical]/attachment:px-1",
        className
      )}
      {...props}
    />
  )
}

function AttachmentTitle({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="attachment-title"
      className={cn(
        "block max-w-full min-w-0 truncate font-medium group-data-[state=processing]/attachment:shimmer group-data-[state=uploading]/attachment:shimmer",
        className
      )}
      {...props}
    />
  )
}

function AttachmentDescription({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="attachment-description"
      className={cn(
        "mt-0.5 block min-w-0 truncate text-xs text-muted-foreground group-data-[state=error]/attachment:text-destructive/80",
        "max-w-full",
        className
      )}
      {...props}
    />
  )
}

function AttachmentActions({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="attachment-actions"
      className={cn(
        "relative z-20 flex shrink-0 items-center group-data-[orientation=vertical]/attachment:absolute group-data-[orientation=vertical]/attachment:top-3 group-data-[orientation=vertical]/attachment:right-3 group-data-[orientation=vertical]/attachment:gap-1",
        className
      )}
      {...props}
    />
  )
}

function AttachmentAction({
  className,
  variant,
  size = "icon-xs",
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      data-slot="attachment-action"
      variant={variant ?? "ghost"}
      size={size}
      className={cn(className)}
      {...props}
    />
  )
}

function AttachmentTrigger({
  className,
  asChild = false,
  type,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean
}) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="attachment-trigger"
      type={asChild ? undefined : (type ?? "button")}
      className={cn("absolute inset-0 z-10 outline-none", className)}
      {...props}
    />
  )
}

function AttachmentGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="attachment-group"
      className={cn(
        "flex min-w-0 scroll-fade-x snap-x snap-mandatory scroll-px-1 scrollbar-none gap-3 overflow-x-auto overscroll-x-contain py-1 *:data-[slot=attachment]:flex-none *:data-[slot=attachment]:snap-start",
        className
      )}
      {...props}
    />
  )
}

export {
  Attachment,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentContent,
  AttachmentTitle,
  AttachmentDescription,
  AttachmentActions,
  AttachmentAction,
  AttachmentTrigger,
}
``````

## `components/ui/avatar.tsx`

``````tsx
"use client"

import * as React from "react"
import { Avatar as AvatarPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Avatar({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> & {
  size?: "default" | "sm" | "lg"
}) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={cn(
        "group/avatar relative flex size-8 shrink-0 overflow-hidden rounded-full select-none data-[size=lg]:size-10 data-[size=sm]:size-6",
        className
      )}
      {...props}
    />
  )
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "flex size-full items-center justify-center rounded-full bg-muted text-sm text-muted-foreground group-data-[size=sm]/avatar:text-xs",
        className
      )}
      {...props}
    />
  )
}

function AvatarBadge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="avatar-badge"
      className={cn(
        "absolute right-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-background select-none",
        "group-data-[size=sm]/avatar:size-2 group-data-[size=sm]/avatar:[&>svg]:hidden",
        "group-data-[size=default]/avatar:size-2.5 group-data-[size=default]/avatar:[&>svg]:size-2",
        "group-data-[size=lg]/avatar:size-3 group-data-[size=lg]/avatar:[&>svg]:size-2",
        className
      )}
      {...props}
    />
  )
}

function AvatarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group"
      className={cn(
        "group/avatar-group flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background",
        className
      )}
      {...props}
    />
  )
}

function AvatarGroupCount({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group-count"
      className={cn(
        "relative flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm text-muted-foreground ring-2 ring-background group-has-data-[size=lg]/avatar-group:size-10 group-has-data-[size=sm]/avatar-group:size-6 [&>svg]:size-4 group-has-data-[size=lg]/avatar-group:[&>svg]:size-5 group-has-data-[size=sm]/avatar-group:[&>svg]:size-3",
        className
      )}
      {...props}
    />
  )
}

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarBadge,
  AvatarGroup,
  AvatarGroupCount,
}
``````

## `components/ui/badge.tsx`

``````tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "bg-destructive text-white focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40 [a&]:hover:bg-destructive/90",
        outline:
          "border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        ghost: "[a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        link: "text-primary underline-offset-4 [a&]:hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
``````

## `components/ui/breadcrumb.tsx`

``````tsx
import * as React from "react"
import { ChevronRight, MoreHorizontal } from "lucide-react"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

function Breadcrumb({ ...props }: React.ComponentProps<"nav">) {
  return <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        "flex flex-wrap items-center gap-1.5 text-sm break-words text-muted-foreground sm:gap-2.5",
        className
      )}
      {...props}
    />
  )
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn("inline-flex items-center gap-1.5", className)}
      {...props}
    />
  )
}

function BreadcrumbLink({
  asChild,
  className,
  ...props
}: React.ComponentProps<"a"> & {
  asChild?: boolean
}) {
  const Comp = asChild ? Slot.Root : "a"

  return (
    <Comp
      data-slot="breadcrumb-link"
      className={cn("transition-colors hover:text-foreground", className)}
      {...props}
    />
  )
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn("font-normal text-foreground", className)}
      {...props}
    />
  )
}

function BreadcrumbSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn("[&>svg]:size-3.5", className)}
      {...props}
    >
      {children ?? <ChevronRight />}
    </li>
  )
}

function BreadcrumbEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontal className="size-4" />
      <span className="sr-only">More</span>
    </span>
  )
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
}
``````

## `components/ui/bubble.tsx`

``````tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

function BubbleGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="bubble-group"
      className={cn("flex min-w-0 flex-col gap-2", className)}
      {...props}
    />
  )
}

const bubbleVariants = cva(
  "group/bubble relative flex w-fit max-w-[80%] min-w-0 flex-col gap-1 group-data-[align=end]/message:self-end data-[align=end]:self-end data-[variant=ghost]:max-w-full",
  {
    variants: {
      variant: {
        default:
          "*:data-[slot=bubble-content]:bg-primary *:data-[slot=bubble-content]:text-primary-foreground [&>[data-slot=bubble-content]:is(button,a):hover]:bg-primary/80",
        secondary:
          "*:data-[slot=bubble-content]:bg-secondary *:data-[slot=bubble-content]:text-secondary-foreground [&>[data-slot=bubble-content]:is(button,a):hover]:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)]",
        muted:
          "*:data-[slot=bubble-content]:bg-muted [&>[data-slot=bubble-content]:is(button,a):hover]:bg-[color-mix(in_oklch,var(--muted),var(--foreground)_5%)]",
        tinted:
          "*:data-[slot=bubble-content]:bg-[oklch(from_var(--primary)_0.93_calc(c*0.4)_h)] *:data-[slot=bubble-content]:text-foreground dark:*:data-[slot=bubble-content]:bg-[oklch(from_var(--primary)_0.3_calc(c*0.4)_h)] [&>[data-slot=bubble-content]:is(button,a):hover]:bg-[oklch(from_var(--primary)_0.88_calc(c*0.5)_h)] dark:[&>[data-slot=bubble-content]:is(button,a):hover]:bg-[oklch(from_var(--primary)_0.35_calc(c*0.5)_h)]",
        outline:
          "*:data-[slot=bubble-content]:border-border *:data-[slot=bubble-content]:bg-background [&>[data-slot=bubble-content]:is(button,a):hover]:bg-muted [&>[data-slot=bubble-content]:is(button,a):hover]:text-foreground dark:[&>[data-slot=bubble-content]:is(button,a):hover]:bg-input/30",
        ghost:
          "border-none *:data-[slot=bubble-content]:rounded-none *:data-[slot=bubble-content]:bg-transparent *:data-[slot=bubble-content]:p-0 [&>[data-slot=bubble-content]:is(button,a):hover]:bg-muted [&>[data-slot=bubble-content]:is(button,a):hover]:text-foreground dark:[&>[data-slot=bubble-content]:is(button,a):hover]:bg-muted/50",
        destructive:
          "*:data-[slot=bubble-content]:bg-destructive/10 *:data-[slot=bubble-content]:text-destructive dark:*:data-[slot=bubble-content]:bg-destructive/20 [&>[data-slot=bubble-content]:is(button,a):hover]:bg-destructive/20 dark:[&>[data-slot=bubble-content]:is(button,a):hover]:bg-destructive/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Bubble({
  variant = "default",
  align = "start",
  className,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof bubbleVariants> & {
    align?: "start" | "end"
  }) {
  return (
    <div
      data-slot="bubble"
      data-variant={variant}
      data-align={align}
      className={cn(bubbleVariants({ variant }), className)}
      {...props}
    />
  )
}

function BubbleContent({
  asChild = false,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  asChild?: boolean
}) {
  const Comp = asChild ? Slot.Root : "div"

  return (
    <Comp
      data-slot="bubble-content"
      className={cn(
        "w-fit max-w-full min-w-0 overflow-hidden rounded-xl border border-transparent px-3 py-2 text-sm leading-relaxed wrap-break-word group-data-[align=end]/bubble:self-end [button]:text-left [button,a]:transition-colors [button,a]:outline-none [button,a]:focus-visible:border-ring [button,a]:focus-visible:ring-3 [button,a]:focus-visible:ring-ring/50",
        className
      )}
      {...props}
    />
  )
}

const bubbleReactionsVariants = cva(
  "absolute z-10 flex w-fit shrink-0 items-center justify-center gap-1 rounded-full bg-muted px-1.5 py-0.5 text-sm ring-3 ring-card has-[button]:p-0",
  {
    variants: {
      side: {
        top: "top-0 -translate-y-3/4",
        bottom: "bottom-0 translate-y-3/4",
      },
      align: {
        start: "left-3",
        end: "right-3",
      },
    },
    defaultVariants: {
      side: "bottom",
      align: "end",
    },
  }
)

function BubbleReactions({
  side = "bottom",
  align = "end",
  className,
  ...props
}: React.ComponentProps<"div"> & {
  align?: "start" | "end"
  side?: "top" | "bottom"
}) {
  return (
    <div
      data-slot="bubble-reactions"
      data-align={align}
      data-side={side}
      className={cn(bubbleReactionsVariants({ side, align }), className)}
      {...props}
    />
  )
}

export { BubbleGroup, Bubble, BubbleContent, BubbleReactions }
``````

## `components/ui/button-group.tsx`

``````tsx
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

const buttonGroupVariants = cva(
  "flex w-fit items-stretch has-[>[data-slot=button-group]]:gap-2 [&>*]:focus-visible:relative [&>*]:focus-visible:z-10 has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-r-md [&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit [&>input]:flex-1",
  {
    variants: {
      orientation: {
        horizontal:
          "[&>*:not(:first-child)]:rounded-l-none [&>*:not(:first-child)]:border-l-0 [&>*:not(:last-child)]:rounded-r-none",
        vertical:
          "flex-col [&>*:not(:first-child)]:rounded-t-none [&>*:not(:first-child)]:border-t-0 [&>*:not(:last-child)]:rounded-b-none",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
    },
  }
)

function ButtonGroup({
  className,
  orientation,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof buttonGroupVariants>) {
  return (
    <div
      role="group"
      data-slot="button-group"
      data-orientation={orientation}
      className={cn(buttonGroupVariants({ orientation }), className)}
      {...props}
    />
  )
}

function ButtonGroupText({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & {
  asChild?: boolean
}) {
  const Comp = asChild ? Slot.Root : "div"

  return (
    <Comp
      className={cn(
        "flex items-center gap-2 rounded-md border bg-muted px-4 text-sm font-medium shadow-xs [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function ButtonGroupSeparator({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="button-group-separator"
      orientation={orientation}
      className={cn(
        "relative m-0! self-stretch bg-input data-[orientation=vertical]:h-auto",
        className
      )}
      {...props}
    />
  )
}

export {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
  buttonGroupVariants,
}
``````

## `components/ui/button.tsx`

``````tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
``````

## `components/ui/calendar.tsx`

``````tsx
"use client"

import * as React from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import {
  DayPicker,
  getDefaultClassNames,
  type DayButton,
} from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "group/calendar bg-background p-3 [--cell-size:--spacing(8)] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
          "relative flex flex-col gap-4 md:flex-row",
          defaultClassNames.months
        ),
        month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-(--cell-size) p-0 select-none aria-disabled:opacity-50",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-(--cell-size) p-0 select-none aria-disabled:opacity-50",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "flex h-(--cell-size) w-full items-center justify-center gap-1.5 text-sm font-medium",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "relative rounded-md border border-input shadow-xs has-focus:border-ring has-focus:ring-[3px] has-focus:ring-ring/50",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          "absolute inset-0 bg-popover opacity-0",
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          "font-medium select-none",
          captionLayout === "label"
            ? "text-sm"
            : "flex h-8 items-center gap-1 rounded-md pr-1 pl-2 text-sm [&>svg]:size-3.5 [&>svg]:text-muted-foreground",
          defaultClassNames.caption_label
        ),
        month_grid: cn("w-full border-collapse", defaultClassNames.month_grid),
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "flex-1 rounded-md text-[0.8rem] font-normal text-muted-foreground select-none",
          defaultClassNames.weekday
        ),
        week: cn("mt-2 flex w-full", defaultClassNames.week),
        week_number_header: cn(
          "w-(--cell-size) select-none",
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          "text-[0.8rem] text-muted-foreground select-none",
          defaultClassNames.week_number
        ),
        day: cn(
          "group/day relative aspect-square h-full w-full p-0 text-center select-none [&:last-child[data-selected=true]_button]:rounded-r-md",
          props.showWeekNumber
            ? "[&:nth-child(2)[data-selected=true]_button]:rounded-l-md"
            : "[&:first-child[data-selected=true]_button]:rounded-l-md",
          defaultClassNames.day
        ),
        range_start: cn(
          "rounded-l-md bg-accent",
          defaultClassNames.range_start
        ),
        range_middle: cn("rounded-none", defaultClassNames.range_middle),
        range_end: cn("rounded-r-md bg-accent", defaultClassNames.range_end),
        today: cn(
          "rounded-md bg-accent text-accent-foreground data-[selected=true]:rounded-none",
          defaultClassNames.today
        ),
        outside: cn(
          "text-muted-foreground aria-selected:text-muted-foreground",
          defaultClassNames.outside
        ),
        disabled: cn(
          "text-muted-foreground opacity-50",
          defaultClassNames.disabled
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          )
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon className={cn("size-4", className)} {...props} />
            )
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon
                className={cn("size-4", className)}
                {...props}
              />
            )
          }

          return (
            <ChevronDownIcon className={cn("size-4", className)} {...props} />
          )
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-(--cell-size) items-center justify-center text-center">
                {children}
              </div>
            </td>
          )
        },
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-[3px] group-data-[focused=true]/day:ring-ring/50 data-[range-end=true]:rounded-md data-[range-end=true]:rounded-r-md data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:rounded-md data-[range-start=true]:rounded-l-md data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground dark:hover:text-accent-foreground [&>span]:text-xs [&>span]:opacity-70",
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
``````

## `components/ui/card.tsx`

``````tsx
import * as React from "react"

import { cn } from "@/lib/utils"

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
``````

## `components/ui/carousel.tsx`

``````tsx
"use client"

import * as React from "react"
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type CarouselApi = UseEmblaCarouselType[1]
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
type CarouselOptions = UseCarouselParameters[0]
type CarouselPlugin = UseCarouselParameters[1]

type CarouselProps = {
  opts?: CarouselOptions
  plugins?: CarouselPlugin
  orientation?: "horizontal" | "vertical"
  setApi?: (api: CarouselApi) => void
}

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  api: ReturnType<typeof useEmblaCarousel>[1]
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
} & CarouselProps

const CarouselContext = React.createContext<CarouselContextProps | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }

  return context
}

function Carousel({
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & CarouselProps) {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === "horizontal" ? "x" : "y",
    },
    plugins
  )
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)

  const onSelect = React.useCallback((api: CarouselApi) => {
    if (!api) return
    setCanScrollPrev(api.canScrollPrev())
    setCanScrollNext(api.canScrollNext())
  }, [])

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev()
  }, [api])

  const scrollNext = React.useCallback(() => {
    api?.scrollNext()
  }, [api])

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault()
        scrollPrev()
      } else if (event.key === "ArrowRight") {
        event.preventDefault()
        scrollNext()
      }
    },
    [scrollPrev, scrollNext]
  )

  React.useEffect(() => {
    if (!api || !setApi) return
    setApi(api)
  }, [api, setApi])

  React.useEffect(() => {
    if (!api) return
    onSelect(api)
    api.on("reInit", onSelect)
    api.on("select", onSelect)

    return () => {
      api?.off("select", onSelect)
    }
  }, [api, onSelect])

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api: api,
        opts,
        orientation:
          orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }}
    >
      <div
        onKeyDownCapture={handleKeyDown}
        className={cn("relative", className)}
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  )
}

function CarouselContent({ className, ...props }: React.ComponentProps<"div">) {
  const { carouselRef, orientation } = useCarousel()

  return (
    <div
      ref={carouselRef}
      className="overflow-hidden"
      data-slot="carousel-content"
    >
      <div
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className
        )}
        {...props}
      />
    </div>
  )
}

function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
  const { orientation } = useCarousel()

  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className
      )}
      {...props}
    />
  )
}

function CarouselPrevious({
  className,
  variant = "outline",
  size = "icon",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel()

  return (
    <Button
      data-slot="carousel-previous"
      variant={variant}
      size={size}
      className={cn(
        "absolute size-8 rounded-full",
        orientation === "horizontal"
          ? "top-1/2 -left-12 -translate-y-1/2"
          : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ArrowLeft />
      <span className="sr-only">Previous slide</span>
    </Button>
  )
}

function CarouselNext({
  className,
  variant = "outline",
  size = "icon",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollNext, canScrollNext } = useCarousel()

  return (
    <Button
      data-slot="carousel-next"
      variant={variant}
      size={size}
      className={cn(
        "absolute size-8 rounded-full",
        orientation === "horizontal"
          ? "top-1/2 -right-12 -translate-y-1/2"
          : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ArrowRight />
      <span className="sr-only">Next slide</span>
    </Button>
  )
}

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
}
``````

## `components/ui/chart.tsx`

``````tsx
"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"
import type { TooltipValueType } from "recharts"

import { cn } from "@/lib/utils"

const THEMES = {
  light: null,
  dark: "(prefers-color-scheme: dark)",
} as const

const INITIAL_DIMENSION = { width: 320, height: 200 } as const
type TooltipNameType = number | string

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
>

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

function ChartContainer({
  id,
  className,
  children,
  config,
  initialDimension = INITIAL_DIMENSION,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >["children"]
  initialDimension?: {
    width: number
    height: number
  }
}) {
  const uniqueId = React.useId()
  const chartId = `chart-${id ?? uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer
          initialDimension={initialDimension}
        >
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, config]) => config.theme ?? config.color
  )

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(([theme, media]) => {
            const rule = `
[data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ??
      itemConfig.color
    return color ? `  --color-${key}: ${color};` : null
  })
  .join("\n")}
}
`
            return media ? `@media ${media} {\n${rule}}\n` : rule
          })
          .join("\n"),
      }}
    />
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
}: React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
  React.ComponentProps<"div"> & {
    hideLabel?: boolean
    hideIndicator?: boolean
    indicator?: "line" | "dot" | "dashed"
    nameKey?: string
    labelKey?: string
  } & Omit<
    RechartsPrimitive.DefaultTooltipContentProps<
      TooltipValueType,
      TooltipNameType
    >,
    "accessibilityLayer"
  >) {
  const { config } = useChart()

  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) {
      return null
    }

    const [item] = payload
    const key = `${labelKey ?? item?.dataKey ?? item?.name ?? "value"}`
    const itemConfig = getPayloadConfigFromPayload(config, item, key)
    const value =
      !labelKey && typeof label === "string"
        ? (config[label]?.label ?? label)
        : itemConfig?.label

    if (labelFormatter) {
      return (
        <div className={cn("font-medium", labelClassName)}>
          {labelFormatter(value, payload)}
        </div>
      )
    }

    if (!value) {
      return null
    }

    return <div className={cn("font-medium", labelClassName)}>{value}</div>
  }, [
    label,
    labelFormatter,
    payload,
    hideLabel,
    labelClassName,
    config,
    labelKey,
  ])

  if (!active || !payload?.length) {
    return null
  }

  const nestLabel = payload.length === 1 && indicator !== "dot"

  return (
    <div
      className={cn(
        "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
        className
      )}
    >
      {!nestLabel ? tooltipLabel : null}
      <div className="grid gap-1.5">
        {payload
          .filter((item) => item.type !== "none")
          .map((item, index) => {
            const key = `${nameKey ?? item.name ?? item.dataKey ?? "value"}`
            const itemConfig = getPayloadConfigFromPayload(config, item, key)
            const indicatorColor = color ?? item.payload?.fill ?? item.color

            return (
              <div
                key={index}
                className={cn(
                  "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                  indicator === "dot" && "items-center"
                )}
              >
                {formatter && item?.value !== undefined && item.name ? (
                  formatter(item.value, item.name, item, index, item.payload)
                ) : (
                  <>
                    {itemConfig?.icon ? (
                      <itemConfig.icon />
                    ) : (
                      !hideIndicator && (
                        <div
                          className={cn(
                            "shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)",
                            {
                              "h-2.5 w-2.5": indicator === "dot",
                              "w-1": indicator === "line",
                              "w-0 border-[1.5px] border-dashed bg-transparent":
                                indicator === "dashed",
                              "my-0.5": nestLabel && indicator === "dashed",
                            }
                          )}
                          style={
                            {
                              "--color-bg": indicatorColor,
                              "--color-border": indicatorColor,
                            } as React.CSSProperties
                          }
                        />
                      )
                    )}
                    <div
                      className={cn(
                        "flex flex-1 justify-between leading-none",
                        nestLabel ? "items-end" : "items-center"
                      )}
                    >
                      <div className="grid gap-1.5">
                        {nestLabel ? tooltipLabel : null}
                        <span className="text-muted-foreground">
                          {itemConfig?.label ?? item.name}
                        </span>
                      </div>
                      {item.value != null && (
                        <span className="font-mono font-medium text-foreground tabular-nums">
                          {typeof item.value === "number"
                            ? item.value.toLocaleString()
                            : String(item.value)}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
      </div>
    </div>
  )
}

const ChartLegend = RechartsPrimitive.Legend

function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = "bottom",
  nameKey,
}: React.ComponentProps<"div"> & {
  hideIcon?: boolean
  nameKey?: string
} & RechartsPrimitive.DefaultLegendContentProps) {
  const { config } = useChart()

  if (!payload?.length) {
    return null
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className
      )}
    >
      {payload
        .filter((item) => item.type !== "none")
        .map((item, index) => {
          const key = `${nameKey ?? item.dataKey ?? "value"}`
          const itemConfig = getPayloadConfigFromPayload(config, item, key)

          return (
            <div
              key={index}
              className={cn(
                "flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"
              )}
            >
              {itemConfig?.icon && !hideIcon ? (
                <itemConfig.icon />
              ) : (
                <div
                  className="h-2 w-2 shrink-0 rounded-[2px]"
                  style={{
                    backgroundColor: item.color,
                  }}
                />
              )}
              {itemConfig?.label}
            </div>
          )
        })}
    </div>
  )
}

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string
) {
  if (typeof payload !== "object" || payload === null) {
    return undefined
  }

  const payloadPayload =
    "payload" in payload &&
    typeof payload.payload === "object" &&
    payload.payload !== null
      ? payload.payload
      : undefined

  let configLabelKey: string = key

  if (
    key in payload &&
    typeof payload[key as keyof typeof payload] === "string"
  ) {
    configLabelKey = payload[key as keyof typeof payload] as string
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
  ) {
    configLabelKey = payloadPayload[
      key as keyof typeof payloadPayload
    ] as string
  }

  return configLabelKey in config ? config[configLabelKey] : config[key]
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
}
``````

## `components/ui/checkbox.tsx`

``````tsx
"use client"

import * as React from "react"
import { CheckIcon } from "lucide-react"
import { Checkbox as CheckboxPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer size-4 shrink-0 rounded-[4px] border border-input shadow-xs transition-shadow outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:bg-input/30 dark:aria-invalid:ring-destructive/40 dark:data-[state=checked]:bg-primary",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none"
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
``````

## `components/ui/collapsible.tsx`

``````tsx
"use client"

import { Collapsible as CollapsiblePrimitive } from "radix-ui"

function Collapsible({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
}

function CollapsibleTrigger({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>) {
  return (
    <CollapsiblePrimitive.CollapsibleTrigger
      data-slot="collapsible-trigger"
      {...props}
    />
  )
}

function CollapsibleContent({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>) {
  return (
    <CollapsiblePrimitive.CollapsibleContent
      data-slot="collapsible-content"
      {...props}
    />
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
``````

## `components/ui/combobox.tsx`

``````tsx
"use client"

import * as React from "react"
import { Combobox as ComboboxPrimitive } from "@base-ui/react"
import { CheckIcon, ChevronDownIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"

const Combobox = ComboboxPrimitive.Root

function ComboboxValue({ ...props }: ComboboxPrimitive.Value.Props) {
  return <ComboboxPrimitive.Value data-slot="combobox-value" {...props} />
}

function ComboboxTrigger({
  className,
  children,
  ...props
}: ComboboxPrimitive.Trigger.Props) {
  return (
    <ComboboxPrimitive.Trigger
      data-slot="combobox-trigger"
      className={cn("[&_svg:not([class*='size-'])]:size-4", className)}
      {...props}
    >
      {children}
      <ChevronDownIcon
        data-slot="combobox-trigger-icon"
        className="pointer-events-none size-4 text-muted-foreground"
      />
    </ComboboxPrimitive.Trigger>
  )
}

function ComboboxClear({ className, ...props }: ComboboxPrimitive.Clear.Props) {
  return (
    <ComboboxPrimitive.Clear
      data-slot="combobox-clear"
      render={<InputGroupButton variant="ghost" size="icon-xs" />}
      className={cn(className)}
      {...props}
    >
      <XIcon className="pointer-events-none" />
    </ComboboxPrimitive.Clear>
  )
}

function ComboboxInput({
  className,
  children,
  disabled = false,
  showTrigger = true,
  showClear = false,
  ...props
}: ComboboxPrimitive.Input.Props & {
  showTrigger?: boolean
  showClear?: boolean
}) {
  return (
    <InputGroup className={cn("w-auto", className)}>
      <ComboboxPrimitive.Input
        render={<InputGroupInput disabled={disabled} />}
        {...props}
      />
      <InputGroupAddon align="inline-end">
        {showTrigger && (
          <InputGroupButton
            size="icon-xs"
            variant="ghost"
            asChild
            data-slot="input-group-button"
            className="group-has-data-[slot=combobox-clear]/input-group:hidden data-pressed:bg-transparent"
            disabled={disabled}
          >
            <ComboboxTrigger />
          </InputGroupButton>
        )}
        {showClear && <ComboboxClear disabled={disabled} />}
      </InputGroupAddon>
      {children}
    </InputGroup>
  )
}

function ComboboxContent({
  className,
  side = "bottom",
  sideOffset = 6,
  align = "start",
  alignOffset = 0,
  anchor,
  ...props
}: ComboboxPrimitive.Popup.Props &
  Pick<
    ComboboxPrimitive.Positioner.Props,
    "side" | "align" | "sideOffset" | "alignOffset" | "anchor"
  >) {
  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        className="isolate z-50"
      >
        <ComboboxPrimitive.Popup
          data-slot="combobox-content"
          data-chips={!!anchor}
          className={cn(
            "group/combobox-content relative max-h-96 w-(--anchor-width) max-w-(--available-width) min-w-[calc(var(--anchor-width)+--spacing(7))] origin-(--transform-origin) overflow-hidden rounded-md bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-[chips=true]:min-w-(--anchor-width) data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 *:data-[slot=input-group]:m-1 *:data-[slot=input-group]:mb-0 *:data-[slot=input-group]:h-8 *:data-[slot=input-group]:border-input/30 *:data-[slot=input-group]:bg-input/30 *:data-[slot=input-group]:shadow-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className
          )}
          {...props}
        />
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  )
}

function ComboboxList({ className, ...props }: ComboboxPrimitive.List.Props) {
  return (
    <ComboboxPrimitive.List
      data-slot="combobox-list"
      className={cn(
        "max-h-[min(calc(--spacing(96)---spacing(9)),calc(var(--available-height)---spacing(9)))] scroll-py-1 overflow-y-auto p-1 data-empty:p-0",
        className
      )}
      {...props}
    />
  )
}

function ComboboxItem({
  className,
  children,
  ...props
}: ComboboxPrimitive.Item.Props) {
  return (
    <ComboboxPrimitive.Item
      data-slot="combobox-item"
      className={cn(
        "relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <ComboboxPrimitive.ItemIndicator
        data-slot="combobox-item-indicator"
        render={
          <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center" />
        }
      >
        <CheckIcon className="pointer-events-none size-4 pointer-coarse:size-5" />
      </ComboboxPrimitive.ItemIndicator>
    </ComboboxPrimitive.Item>
  )
}

function ComboboxGroup({ className, ...props }: ComboboxPrimitive.Group.Props) {
  return (
    <ComboboxPrimitive.Group
      data-slot="combobox-group"
      className={cn(className)}
      {...props}
    />
  )
}

function ComboboxLabel({
  className,
  ...props
}: ComboboxPrimitive.GroupLabel.Props) {
  return (
    <ComboboxPrimitive.GroupLabel
      data-slot="combobox-label"
      className={cn(
        "px-2 py-1.5 text-xs text-muted-foreground pointer-coarse:px-3 pointer-coarse:py-2 pointer-coarse:text-sm",
        className
      )}
      {...props}
    />
  )
}

function ComboboxCollection({ ...props }: ComboboxPrimitive.Collection.Props) {
  return (
    <ComboboxPrimitive.Collection data-slot="combobox-collection" {...props} />
  )
}

function ComboboxEmpty({ className, ...props }: ComboboxPrimitive.Empty.Props) {
  return (
    <ComboboxPrimitive.Empty
      data-slot="combobox-empty"
      className={cn(
        "hidden w-full justify-center py-2 text-center text-sm text-muted-foreground group-data-empty/combobox-content:flex",
        className
      )}
      {...props}
    />
  )
}

function ComboboxSeparator({
  className,
  ...props
}: ComboboxPrimitive.Separator.Props) {
  return (
    <ComboboxPrimitive.Separator
      data-slot="combobox-separator"
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

function ComboboxChips({
  className,
  ...props
}: React.ComponentPropsWithRef<typeof ComboboxPrimitive.Chips> &
  ComboboxPrimitive.Chips.Props) {
  return (
    <ComboboxPrimitive.Chips
      data-slot="combobox-chips"
      className={cn(
        "flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent bg-clip-padding px-2.5 py-1.5 text-sm shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 has-aria-invalid:border-destructive has-aria-invalid:ring-[3px] has-aria-invalid:ring-destructive/20 has-data-[slot=combobox-chip]:px-1.5 dark:bg-input/30 dark:has-aria-invalid:border-destructive/50 dark:has-aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

function ComboboxChip({
  className,
  children,
  showRemove = true,
  ...props
}: ComboboxPrimitive.Chip.Props & {
  showRemove?: boolean
}) {
  return (
    <ComboboxPrimitive.Chip
      data-slot="combobox-chip"
      className={cn(
        "flex h-[calc(--spacing(5.5))] w-fit items-center justify-center gap-1 rounded-sm bg-muted px-1.5 text-xs font-medium whitespace-nowrap text-foreground has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-disabled:opacity-50 has-data-[slot=combobox-chip-remove]:pr-0",
        className
      )}
      {...props}
    >
      {children}
      {showRemove && (
        <ComboboxPrimitive.ChipRemove
          render={<Button variant="ghost" size="icon-xs" />}
          className="-ml-1 opacity-50 hover:opacity-100"
          data-slot="combobox-chip-remove"
        >
          <XIcon className="pointer-events-none" />
        </ComboboxPrimitive.ChipRemove>
      )}
    </ComboboxPrimitive.Chip>
  )
}

function ComboboxChipsInput({
  className,
  children,
  ...props
}: ComboboxPrimitive.Input.Props) {
  return (
    <ComboboxPrimitive.Input
      data-slot="combobox-chip-input"
      className={cn("min-w-16 flex-1 outline-none", className)}
      {...props}
    />
  )
}

function useComboboxAnchor() {
  return React.useRef<HTMLDivElement | null>(null)
}

export {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxCollection,
  ComboboxEmpty,
  ComboboxSeparator,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxTrigger,
  ComboboxValue,
  useComboboxAnchor,
}
``````

## `components/ui/command.tsx`

``````tsx
"use client"

import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import { SearchIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

function Command({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
        className
      )}
      {...props}
    />
  )
}

function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  className,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  title?: string
  description?: string
  className?: string
  showCloseButton?: boolean
}) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent
        className={cn("overflow-hidden p-0", className)}
        showCloseButton={showCloseButton}
      >
        <Command className="**:data-[slot=command-input-wrapper]:h-12 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  )
}

function CommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div
      data-slot="command-input-wrapper"
      className="flex h-9 items-center gap-2 border-b px-3"
    >
      <SearchIcon className="size-4 shrink-0 opacity-50" />
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn(
          "flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    </div>
  )
}

function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn(
        "max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto",
        className
      )}
      {...props}
    />
  )
}

function CommandEmpty({
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className="py-6 text-center text-sm"
      {...props}
    />
  )
}

function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        "overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn("-mx-1 h-px bg-border", className)}
      {...props}
    />
  )
}

function CommandItem({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        "relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function CommandShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}
``````

## `components/ui/context-menu.tsx`

``````tsx
"use client"

import * as React from "react"
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react"
import { ContextMenu as ContextMenuPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function ContextMenu({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Root>) {
  return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />
}

function ContextMenuTrigger({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Trigger>) {
  return (
    <ContextMenuPrimitive.Trigger data-slot="context-menu-trigger" {...props} />
  )
}

function ContextMenuGroup({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Group>) {
  return (
    <ContextMenuPrimitive.Group data-slot="context-menu-group" {...props} />
  )
}

function ContextMenuPortal({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Portal>) {
  return (
    <ContextMenuPrimitive.Portal data-slot="context-menu-portal" {...props} />
  )
}

function ContextMenuSub({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Sub>) {
  return <ContextMenuPrimitive.Sub data-slot="context-menu-sub" {...props} />
}

function ContextMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.RadioGroup>) {
  return (
    <ContextMenuPrimitive.RadioGroup
      data-slot="context-menu-radio-group"
      {...props}
    />
  )
}

function ContextMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.SubTrigger> & {
  inset?: boolean
}) {
  return (
    <ContextMenuPrimitive.SubTrigger
      data-slot="context-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[inset]:pl-8 data-[state=open]:bg-accent data-[state=open]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto" />
    </ContextMenuPrimitive.SubTrigger>
  )
}

function ContextMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.SubContent>) {
  return (
    <ContextMenuPrimitive.SubContent
      data-slot="context-menu-sub-content"
      className={cn(
        "z-50 min-w-[8rem] origin-(--radix-context-menu-content-transform-origin) overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
        className
      )}
      {...props}
    />
  )
}

function ContextMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Content>) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content
        data-slot="context-menu-content"
        className={cn(
          "z-50 max-h-(--radix-context-menu-content-available-height) min-w-[8rem] origin-(--radix-context-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          className
        )}
        {...props}
      />
    </ContextMenuPrimitive.Portal>
  )
}

function ContextMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Item> & {
  inset?: boolean
  variant?: "default" | "destructive"
}) {
  return (
    <ContextMenuPrimitive.Item
      data-slot="context-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground data-[variant=destructive]:*:[svg]:text-destructive!",
        className
      )}
      {...props}
    />
  )
}

function ContextMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.CheckboxItem>) {
  return (
    <ContextMenuPrimitive.CheckboxItem
      data-slot="context-menu-checkbox-item"
      className={cn(
        "relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.CheckboxItem>
  )
}

function ContextMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.RadioItem>) {
  return (
    <ContextMenuPrimitive.RadioItem
      data-slot="context-menu-radio-item"
      className={cn(
        "relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.RadioItem>
  )
}

function ContextMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Label> & {
  inset?: boolean
}) {
  return (
    <ContextMenuPrimitive.Label
      data-slot="context-menu-label"
      data-inset={inset}
      className={cn(
        "px-2 py-1.5 text-sm font-medium text-foreground data-[inset]:pl-8",
        className
      )}
      {...props}
    />
  )
}

function ContextMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Separator>) {
  return (
    <ContextMenuPrimitive.Separator
      data-slot="context-menu-separator"
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

function ContextMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="context-menu-shortcut"
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
}
``````

## `components/ui/dialog.tsx`

``````tsx
"use client"

import * as React from "react"
import { XIcon } from "lucide-react"
import { Dialog as DialogPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
}) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-background p-6 shadow-lg duration-200 outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 sm:max-w-lg",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className="absolute top-4 right-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  )
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close asChild>
          <Button variant="outline">Close</Button>
        </DialogPrimitive.Close>
      )}
    </div>
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
``````

## `components/ui/direction.tsx`

``````tsx
"use client"

import * as React from "react"
import { Direction } from "radix-ui"

function DirectionProvider({
  dir,
  direction,
  children,
}: React.ComponentProps<typeof Direction.DirectionProvider> & {
  direction?: React.ComponentProps<typeof Direction.DirectionProvider>["dir"]
}) {
  return (
    <Direction.DirectionProvider dir={direction ?? dir}>
      {children}
    </Direction.DirectionProvider>
  )
}

const useDirection = Direction.useDirection

export { DirectionProvider, useDirection }
``````

## `components/ui/drawer.tsx`

``````tsx
"use client"

import * as React from "react"
import { Drawer as DrawerPrimitive } from "vaul"

import { cn } from "@/lib/utils"

function Drawer({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) {
  return <DrawerPrimitive.Root data-slot="drawer" {...props} />
}

function DrawerTrigger({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />
}

function DrawerPortal({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />
}

function DrawerClose({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Close>) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />
}

function DrawerOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
  return (
    <DrawerPrimitive.Overlay
      data-slot="drawer-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    />
  )
}

function DrawerContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Content>) {
  return (
    <DrawerPortal data-slot="drawer-portal">
      <DrawerOverlay />
      <DrawerPrimitive.Content
        data-slot="drawer-content"
        className={cn(
          "group/drawer-content fixed z-50 flex h-auto flex-col bg-background",
          "data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=top]:rounded-b-lg data-[vaul-drawer-direction=top]:border-b",
          "data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80vh] data-[vaul-drawer-direction=bottom]:rounded-t-lg data-[vaul-drawer-direction=bottom]:border-t",
          "data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:border-l data-[vaul-drawer-direction=right]:sm:max-w-sm",
          "data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:border-r data-[vaul-drawer-direction=left]:sm:max-w-sm",
          className
        )}
        {...props}
      >
        <div className="mx-auto mt-4 hidden h-2 w-[100px] shrink-0 rounded-full bg-muted group-data-[vaul-drawer-direction=bottom]/drawer-content:block" />
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  )
}

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-header"
      className={cn(
        "flex flex-col gap-0.5 p-4 group-data-[vaul-drawer-direction=bottom]/drawer-content:text-center group-data-[vaul-drawer-direction=top]/drawer-content:text-center md:gap-1.5 md:text-left",
        className
      )}
      {...props}
    />
  )
}

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  )
}

function DrawerTitle({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn("font-semibold text-foreground", className)}
      {...props}
    />
  )
}

function DrawerDescription({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}
``````

## `components/ui/dropdown-menu.tsx`

``````tsx
"use client"

import * as React from "react"
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react"
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function DropdownMenu({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

function DropdownMenuPortal({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  return (
    <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
  )
}

function DropdownMenuTrigger({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return (
    <DropdownMenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      {...props}
    />
  )
}

function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn(
          "z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          className
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
}

function DropdownMenuGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return (
    <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
  )
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean
  variant?: "default" | "destructive"
}) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground data-[variant=destructive]:*:[svg]:text-destructive!",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(
        "relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  )
}

function DropdownMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
  return (
    <DropdownMenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  )
}

function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(
        "relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  )
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        "px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuSub({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[inset]:pl-8 data-[state=open]:bg-accent data-[state=open]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-4" />
    </DropdownMenuPrimitive.SubTrigger>
  )
}

function DropdownMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  return (
    <DropdownMenuPrimitive.SubContent
      data-slot="dropdown-menu-sub-content"
      className={cn(
        "z-50 min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
        className
      )}
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}
``````

## `components/ui/empty.tsx`

``````tsx
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

function Empty({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty"
      className={cn(
        "flex min-w-0 flex-1 flex-col items-center justify-center gap-6 rounded-lg border-dashed p-6 text-center text-balance md:p-12",
        className
      )}
      {...props}
    />
  )
}

function EmptyHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-header"
      className={cn(
        "flex max-w-sm flex-col items-center gap-2 text-center",
        className
      )}
      {...props}
    />
  )
}

const emptyMediaVariants = cva(
  "mb-2 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground [&_svg:not([class*='size-'])]:size-6",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function EmptyMedia({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof emptyMediaVariants>) {
  return (
    <div
      data-slot="empty-icon"
      data-variant={variant}
      className={cn(emptyMediaVariants({ variant, className }))}
      {...props}
    />
  )
}

function EmptyTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-title"
      className={cn("text-lg font-medium tracking-tight", className)}
      {...props}
    />
  )
}

function EmptyDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <div
      data-slot="empty-description"
      className={cn(
        "text-sm/relaxed text-muted-foreground [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
        className
      )}
      {...props}
    />
  )
}

function EmptyContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-content"
      className={cn(
        "flex w-full max-w-sm min-w-0 flex-col items-center gap-4 text-sm text-balance",
        className
      )}
      {...props}
    />
  )
}

export {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
}
``````

## `components/ui/field.tsx`

``````tsx
"use client"

import { useMemo } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

function FieldSet({ className, ...props }: React.ComponentProps<"fieldset">) {
  return (
    <fieldset
      data-slot="field-set"
      className={cn(
        "flex flex-col gap-6",
        "has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3",
        className
      )}
      {...props}
    />
  )
}

function FieldLegend({
  className,
  variant = "legend",
  ...props
}: React.ComponentProps<"legend"> & { variant?: "legend" | "label" }) {
  return (
    <legend
      data-slot="field-legend"
      data-variant={variant}
      className={cn(
        "mb-3 font-medium",
        "data-[variant=legend]:text-base",
        "data-[variant=label]:text-sm",
        className
      )}
      {...props}
    />
  )
}

function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-group"
      className={cn(
        "group/field-group @container/field-group flex w-full flex-col gap-7 data-[slot=checkbox-group]:gap-3 [&>[data-slot=field-group]]:gap-4",
        className
      )}
      {...props}
    />
  )
}

const fieldVariants = cva(
  "group/field flex w-full gap-3 data-[invalid=true]:text-destructive",
  {
    variants: {
      orientation: {
        vertical: ["flex-col [&>*]:w-full [&>.sr-only]:w-auto"],
        horizontal: [
          "flex-row items-center",
          "[&>[data-slot=field-label]]:flex-auto",
          "has-[>[data-slot=field-content]]:items-start has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
        ],
        responsive: [
          "flex-col @md/field-group:flex-row @md/field-group:items-center [&>*]:w-full @md/field-group:[&>*]:w-auto [&>.sr-only]:w-auto",
          "@md/field-group:[&>[data-slot=field-label]]:flex-auto",
          "@md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
        ],
      },
    },
    defaultVariants: {
      orientation: "vertical",
    },
  }
)

function Field({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof fieldVariants>) {
  return (
    <div
      role="group"
      data-slot="field"
      data-orientation={orientation}
      className={cn(fieldVariants({ orientation }), className)}
      {...props}
    />
  )
}

function FieldContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-content"
      className={cn(
        "group/field-content flex flex-1 flex-col gap-1.5 leading-snug",
        className
      )}
      {...props}
    />
  )
}

function FieldLabel({
  className,
  ...props
}: React.ComponentProps<typeof Label>) {
  return (
    <Label
      data-slot="field-label"
      className={cn(
        "group/field-label peer/field-label flex w-fit gap-2 leading-snug group-data-[disabled=true]/field:opacity-50",
        "has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col has-[>[data-slot=field]]:rounded-md has-[>[data-slot=field]]:border [&>*]:data-[slot=field]:p-4",
        "has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/5 dark:has-data-[state=checked]:bg-primary/10",
        className
      )}
      {...props}
    />
  )
}

function FieldTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-label"
      className={cn(
        "flex w-fit items-center gap-2 text-sm leading-snug font-medium group-data-[disabled=true]/field:opacity-50",
        className
      )}
      {...props}
    />
  )
}

function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-description"
      className={cn(
        "text-sm leading-normal font-normal text-muted-foreground group-has-[[data-orientation=horizontal]]/field:text-balance",
        "last:mt-0 nth-last-2:-mt-1 [[data-variant=legend]+&]:-mt-1.5",
        "[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
        className
      )}
      {...props}
    />
  )
}

function FieldSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  children?: React.ReactNode
}) {
  return (
    <div
      data-slot="field-separator"
      data-content={!!children}
      className={cn(
        "relative -my-2 h-5 text-sm group-data-[variant=outline]/field-group:-mb-2",
        className
      )}
      {...props}
    >
      <Separator className="absolute inset-0 top-1/2" />
      {children && (
        <span
          className="relative mx-auto block w-fit bg-background px-2 text-muted-foreground"
          data-slot="field-separator-content"
        >
          {children}
        </span>
      )}
    </div>
  )
}

function FieldError({
  className,
  children,
  errors,
  ...props
}: React.ComponentProps<"div"> & {
  errors?: Array<{ message?: string } | undefined>
}) {
  const content = useMemo(() => {
    if (children) {
      return children
    }

    if (!errors?.length) {
      return null
    }

    const uniqueErrors = [
      ...new Map(errors.map((error) => [error?.message, error])).values(),
    ]

    if (uniqueErrors?.length == 1) {
      return uniqueErrors[0]?.message
    }

    return (
      <ul className="ml-4 flex list-disc flex-col gap-1">
        {uniqueErrors.map(
          (error, index) =>
            error?.message && <li key={index}>{error.message}</li>
        )}
      </ul>
    )
  }, [children, errors])

  if (!content) {
    return null
  }

  return (
    <div
      role="alert"
      data-slot="field-error"
      className={cn("text-sm font-normal text-destructive", className)}
      {...props}
    >
      {content}
    </div>
  )
}

export {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldContent,
  FieldTitle,
}
``````

## `components/ui/form.tsx`

``````tsx
"use client"

import * as React from "react"
import type { Label as LabelPrimitive } from "radix-ui"
import { Slot } from "radix-ui"
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

const Form = FormProvider

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
)

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState } = useFormContext()
  const formState = useFormState({ name: fieldContext.name })
  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

type FormItemContextValue = {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
)

function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        data-slot="form-item"
        className={cn("grid gap-2", className)}
        {...props}
      />
    </FormItemContext.Provider>
  )
}

function FormLabel({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  const { error, formItemId } = useFormField()

  return (
    <Label
      data-slot="form-label"
      data-error={!!error}
      className={cn("data-[error=true]:text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  )
}

function FormControl({ ...props }: React.ComponentProps<typeof Slot.Root>) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  return (
    <Slot.Root
      data-slot="form-control"
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  )
}

function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { formDescriptionId } = useFormField()

  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function FormMessage({ className, ...props }: React.ComponentProps<"p">) {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message ?? "") : props.children

  if (!body) {
    return null
  }

  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      className={cn("text-sm text-destructive", className)}
      {...props}
    >
      {body}
    </p>
  )
}

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
}
``````

## `components/ui/hover-card.tsx`

``````tsx
"use client"

import * as React from "react"
import { HoverCard as HoverCardPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function HoverCard({
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Root>) {
  return <HoverCardPrimitive.Root data-slot="hover-card" {...props} />
}

function HoverCardTrigger({
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Trigger>) {
  return (
    <HoverCardPrimitive.Trigger data-slot="hover-card-trigger" {...props} />
  )
}

function HoverCardContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Content>) {
  return (
    <HoverCardPrimitive.Portal data-slot="hover-card-portal">
      <HoverCardPrimitive.Content
        data-slot="hover-card-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-50 w-64 origin-(--radix-hover-card-content-transform-origin) rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-hidden data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          className
        )}
        {...props}
      />
    </HoverCardPrimitive.Portal>
  )
}

export { HoverCard, HoverCardTrigger, HoverCardContent }
``````

## `components/ui/input-group.tsx`

``````tsx
"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-group"
      role="group"
      className={cn(
        "group/input-group relative flex w-full items-center rounded-md border border-input shadow-xs transition-[color,box-shadow] outline-none dark:bg-input/30",
        "h-9 min-w-0 has-[>textarea]:h-auto",

        // Variants based on alignment.
        "has-[>[data-align=inline-start]]:[&>input]:pl-2",
        "has-[>[data-align=inline-end]]:[&>input]:pr-2",
        "has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>[data-align=block-start]]:[&>input]:pb-3",
        "has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-end]]:[&>input]:pt-3",

        // Focus state.
        "has-[[data-slot=input-group-control]:focus-visible]:border-ring has-[[data-slot=input-group-control]:focus-visible]:ring-[3px] has-[[data-slot=input-group-control]:focus-visible]:ring-ring/50",

        // Error state.
        "has-[[data-slot][aria-invalid=true]]:border-destructive has-[[data-slot][aria-invalid=true]]:ring-destructive/20 dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40",

        className
      )}
      {...props}
    />
  )
}

const inputGroupAddonVariants = cva(
  "flex h-auto cursor-text items-center justify-center gap-2 py-1.5 text-sm font-medium text-muted-foreground select-none group-data-[disabled=true]/input-group:opacity-50 [&>kbd]:rounded-[calc(var(--radius)-5px)] [&>svg:not([class*='size-'])]:size-4",
  {
    variants: {
      align: {
        "inline-start":
          "order-first pl-3 has-[>button]:ml-[-0.45rem] has-[>kbd]:ml-[-0.35rem]",
        "inline-end":
          "order-last pr-3 has-[>button]:mr-[-0.45rem] has-[>kbd]:mr-[-0.35rem]",
        "block-start":
          "order-first w-full justify-start px-3 pt-3 group-has-[>input]/input-group:pt-2.5 [.border-b]:pb-3",
        "block-end":
          "order-last w-full justify-start px-3 pb-3 group-has-[>input]/input-group:pb-2.5 [.border-t]:pt-3",
      },
    },
    defaultVariants: {
      align: "inline-start",
    },
  }
)

function InputGroupAddon({
  className,
  align = "inline-start",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof inputGroupAddonVariants>) {
  return (
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={align}
      className={cn(inputGroupAddonVariants({ align }), className)}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button")) {
          return
        }
        e.currentTarget.parentElement?.querySelector("input")?.focus()
      }}
      {...props}
    />
  )
}

const inputGroupButtonVariants = cva(
  "flex items-center gap-2 text-sm shadow-none",
  {
    variants: {
      size: {
        xs: "h-6 gap-1 rounded-[calc(var(--radius)-5px)] px-2 has-[>svg]:px-2 [&>svg:not([class*='size-'])]:size-3.5",
        sm: "h-8 gap-1.5 rounded-md px-2.5 has-[>svg]:px-2.5",
        "icon-xs":
          "size-6 rounded-[calc(var(--radius)-5px)] p-0 has-[>svg]:p-0",
        "icon-sm": "size-8 p-0 has-[>svg]:p-0",
      },
    },
    defaultVariants: {
      size: "xs",
    },
  }
)

function InputGroupButton({
  className,
  type = "button",
  variant = "ghost",
  size = "xs",
  ...props
}: Omit<React.ComponentProps<typeof Button>, "size"> &
  VariantProps<typeof inputGroupButtonVariants>) {
  return (
    <Button
      type={type}
      data-size={size}
      variant={variant}
      className={cn(inputGroupButtonVariants({ size }), className)}
      {...props}
    />
  )
}

function InputGroupText({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "flex items-center gap-2 text-sm text-muted-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function InputGroupInput({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <Input
      data-slot="input-group-control"
      className={cn(
        "flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent",
        className
      )}
      {...props}
    />
  )
}

function InputGroupTextarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <Textarea
      data-slot="input-group-control"
      className={cn(
        "flex-1 resize-none rounded-none border-0 bg-transparent py-3 shadow-none focus-visible:ring-0 dark:bg-transparent",
        className
      )}
      {...props}
    />
  )
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
  InputGroupTextarea,
}
``````

## `components/ui/input-otp.tsx`

``````tsx
"use client"

import * as React from "react"
import { OTPInput, OTPInputContext } from "input-otp"
import { MinusIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function InputOTP({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string
}) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn(
        "flex items-center gap-2 has-disabled:opacity-50",
        containerClassName
      )}
      className={cn("disabled:cursor-not-allowed", className)}
      {...props}
    />
  )
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn("flex items-center", className)}
      {...props}
    />
  )
}

function InputOTPSlot({
  index,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  index: number
}) {
  const inputOTPContext = React.useContext(OTPInputContext)
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {}

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        "relative flex h-9 w-9 items-center justify-center border-y border-r border-input text-sm shadow-xs transition-all outline-none first:rounded-l-md first:border-l last:rounded-r-md aria-invalid:border-destructive data-[active=true]:z-10 data-[active=true]:border-ring data-[active=true]:ring-[3px] data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid:border-destructive data-[active=true]:aria-invalid:ring-destructive/20 dark:bg-input/30 dark:data-[active=true]:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
        </div>
      )}
    </div>
  )
}

function InputOTPSeparator({ ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="input-otp-separator" role="separator" {...props}>
      <MinusIcon />
    </div>
  )
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
``````

## `components/ui/input.tsx`

``````tsx
import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }
``````

## `components/ui/item.tsx`

``````tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

function ItemGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="list"
      data-slot="item-group"
      className={cn("group/item-group flex flex-col", className)}
      {...props}
    />
  )
}

function ItemSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="item-separator"
      orientation="horizontal"
      className={cn("my-0", className)}
      {...props}
    />
  )
}

const itemVariants = cva(
  "group/item flex flex-wrap items-center rounded-md border border-transparent text-sm transition-colors duration-100 outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [a]:transition-colors [a]:hover:bg-accent/50",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: "border-border",
        muted: "bg-muted/50",
      },
      size: {
        default: "gap-4 p-4",
        sm: "gap-2.5 px-4 py-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Item({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof itemVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "div"
  return (
    <Comp
      data-slot="item"
      data-variant={variant}
      data-size={size}
      className={cn(itemVariants({ variant, size, className }))}
      {...props}
    />
  )
}

const itemMediaVariants = cva(
  "flex shrink-0 items-center justify-center gap-2 group-has-[[data-slot=item-description]]/item:translate-y-0.5 group-has-[[data-slot=item-description]]/item:self-start [&_svg]:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "size-8 rounded-sm border bg-muted [&_svg:not([class*='size-'])]:size-4",
        image:
          "size-10 overflow-hidden rounded-sm [&_img]:size-full [&_img]:object-cover",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function ItemMedia({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof itemMediaVariants>) {
  return (
    <div
      data-slot="item-media"
      data-variant={variant}
      className={cn(itemMediaVariants({ variant, className }))}
      {...props}
    />
  )
}

function ItemContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-content"
      className={cn(
        "flex flex-1 flex-col gap-1 [&+[data-slot=item-content]]:flex-none",
        className
      )}
      {...props}
    />
  )
}

function ItemTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-title"
      className={cn(
        "flex w-fit items-center gap-2 text-sm leading-snug font-medium",
        className
      )}
      {...props}
    />
  )
}

function ItemDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="item-description"
      className={cn(
        "line-clamp-2 text-sm leading-normal font-normal text-balance text-muted-foreground",
        "[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
        className
      )}
      {...props}
    />
  )
}

function ItemActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-actions"
      className={cn("flex items-center gap-2", className)}
      {...props}
    />
  )
}

function ItemHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-header"
      className={cn(
        "flex basis-full items-center justify-between gap-2",
        className
      )}
      {...props}
    />
  )
}

function ItemFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-footer"
      className={cn(
        "flex basis-full items-center justify-between gap-2",
        className
      )}
      {...props}
    />
  )
}

export {
  Item,
  ItemMedia,
  ItemContent,
  ItemActions,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
  ItemDescription,
  ItemHeader,
  ItemFooter,
}
``````

## `components/ui/kbd.tsx`

``````tsx
import { cn } from "@/lib/utils"

function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "pointer-events-none inline-flex h-5 w-fit min-w-5 items-center justify-center gap-1 rounded-sm bg-muted px-1 font-sans text-xs font-medium text-muted-foreground select-none",
        "[&_svg:not([class*='size-'])]:size-3",
        "[[data-slot=tooltip-content]_&]:bg-background/20 [[data-slot=tooltip-content]_&]:text-background dark:[[data-slot=tooltip-content]_&]:bg-background/10",
        className
      )}
      {...props}
    />
  )
}

function KbdGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <kbd
      data-slot="kbd-group"
      className={cn("inline-flex items-center gap-1", className)}
      {...props}
    />
  )
}

export { Kbd, KbdGroup }
``````

## `components/ui/label.tsx`

``````tsx
"use client"

import * as React from "react"
import { Label as LabelPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Label }
``````

## `components/ui/marker.tsx`

``````tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const markerVariants = cva(
  "group/marker relative flex min-h-4 w-full items-center gap-2 text-left text-sm text-muted-foreground [&_svg:not([class*='size-'])]:size-4 [a]:underline [a]:underline-offset-3 [a]:hover:text-foreground",
  {
    variants: {
      variant: {
        default: "",
        separator:
          "before:mr-1 before:h-px before:min-w-0 before:flex-1 before:bg-border after:ml-1 after:h-px after:min-w-0 after:flex-1 after:bg-border",
        border: "border-b border-border pb-2",
      },
    },
  }
)

function Marker({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof markerVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "div"

  return (
    <Comp
      data-slot="marker"
      data-variant={variant}
      className={cn(markerVariants({ variant, className }))}
      {...props}
    />
  )
}

function MarkerIcon({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="marker-icon"
      aria-hidden="true"
      className={cn(
        "size-4 shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function MarkerContent({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="marker-content"
      className={cn(
        "min-w-0 wrap-break-word group-data-[variant=separator]/marker:flex-none group-data-[variant=separator]/marker:text-center *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export { Marker, MarkerIcon, MarkerContent, markerVariants }
``````

## `components/ui/menubar.tsx`

``````tsx
"use client"

import * as React from "react"
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react"
import { Menubar as MenubarPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Menubar({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Root>) {
  return (
    <MenubarPrimitive.Root
      data-slot="menubar"
      className={cn(
        "flex h-9 items-center gap-1 rounded-md border bg-background p-1 shadow-xs",
        className
      )}
      {...props}
    />
  )
}

function MenubarMenu({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Menu>) {
  return <MenubarPrimitive.Menu data-slot="menubar-menu" {...props} />
}

function MenubarGroup({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Group>) {
  return <MenubarPrimitive.Group data-slot="menubar-group" {...props} />
}

function MenubarPortal({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Portal>) {
  return <MenubarPrimitive.Portal data-slot="menubar-portal" {...props} />
}

function MenubarRadioGroup({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.RadioGroup>) {
  return (
    <MenubarPrimitive.RadioGroup data-slot="menubar-radio-group" {...props} />
  )
}

function MenubarTrigger({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Trigger>) {
  return (
    <MenubarPrimitive.Trigger
      data-slot="menubar-trigger"
      className={cn(
        "flex items-center rounded-sm px-2 py-1 text-sm font-medium outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
        className
      )}
      {...props}
    />
  )
}

function MenubarContent({
  className,
  align = "start",
  alignOffset = -4,
  sideOffset = 8,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Content>) {
  return (
    <MenubarPortal>
      <MenubarPrimitive.Content
        data-slot="menubar-content"
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        className={cn(
          "z-50 min-w-[12rem] origin-(--radix-menubar-content-transform-origin) overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          className
        )}
        {...props}
      />
    </MenubarPortal>
  )
}

function MenubarItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Item> & {
  inset?: boolean
  variant?: "default" | "destructive"
}) {
  return (
    <MenubarPrimitive.Item
      data-slot="menubar-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground data-[variant=destructive]:*:[svg]:text-destructive!",
        className
      )}
      {...props}
    />
  )
}

function MenubarCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.CheckboxItem>) {
  return (
    <MenubarPrimitive.CheckboxItem
      data-slot="menubar-checkbox-item"
      className={cn(
        "relative flex cursor-default items-center gap-2 rounded-xs py-1.5 pr-2 pl-8 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <MenubarPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.CheckboxItem>
  )
}

function MenubarRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.RadioItem>) {
  return (
    <MenubarPrimitive.RadioItem
      data-slot="menubar-radio-item"
      className={cn(
        "relative flex cursor-default items-center gap-2 rounded-xs py-1.5 pr-2 pl-8 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <MenubarPrimitive.ItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.RadioItem>
  )
}

function MenubarLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Label> & {
  inset?: boolean
}) {
  return (
    <MenubarPrimitive.Label
      data-slot="menubar-label"
      data-inset={inset}
      className={cn(
        "px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
        className
      )}
      {...props}
    />
  )
}

function MenubarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Separator>) {
  return (
    <MenubarPrimitive.Separator
      data-slot="menubar-separator"
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

function MenubarShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="menubar-shortcut"
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function MenubarSub({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Sub>) {
  return <MenubarPrimitive.Sub data-slot="menubar-sub" {...props} />
}

function MenubarSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.SubTrigger> & {
  inset?: boolean
}) {
  return (
    <MenubarPrimitive.SubTrigger
      data-slot="menubar-sub-trigger"
      data-inset={inset}
      className={cn(
        "flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none focus:bg-accent focus:text-accent-foreground data-[inset]:pl-8 data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto h-4 w-4" />
    </MenubarPrimitive.SubTrigger>
  )
}

function MenubarSubContent({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.SubContent>) {
  return (
    <MenubarPrimitive.SubContent
      data-slot="menubar-sub-content"
      className={cn(
        "z-50 min-w-[8rem] origin-(--radix-menubar-content-transform-origin) overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
        className
      )}
      {...props}
    />
  )
}

export {
  Menubar,
  MenubarPortal,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarGroup,
  MenubarSeparator,
  MenubarLabel,
  MenubarItem,
  MenubarShortcut,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
}
``````

## `components/ui/message-scroller.tsx`

``````tsx
"use client"

import * as React from "react"
import {
  MessageScroller as MessageScrollerPrimitive,
  useMessageScroller,
  useMessageScrollerScrollable,
  useMessageScrollerVisibility,
} from "@shadcn/react/message-scroller"
import { ArrowDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

function MessageScrollerProvider(
  props: React.ComponentProps<typeof MessageScrollerPrimitive.Provider>
) {
  return <MessageScrollerPrimitive.Provider {...props} />
}

function MessageScroller({
  className,
  ...props
}: React.ComponentProps<typeof MessageScrollerPrimitive.Root>) {
  return (
    <MessageScrollerPrimitive.Root
      data-slot="message-scroller"
      className={cn(
        "group/message-scroller relative flex size-full min-h-0 flex-col overflow-hidden",
        className
      )}
      {...props}
    />
  )
}

function MessageScrollerViewport({
  className,
  ...props
}: React.ComponentProps<typeof MessageScrollerPrimitive.Viewport>) {
  return (
    <MessageScrollerPrimitive.Viewport
      data-slot="message-scroller-viewport"
      className={cn(
        "size-full min-h-0 min-w-0 scroll-fade-b scrollbar-thin scrollbar-gutter-stable overflow-y-auto overscroll-contain contain-content data-autoscrolling:scrollbar-none",
        className
      )}
      {...props}
    />
  )
}

function MessageScrollerContent({
  className,
  ...props
}: React.ComponentProps<typeof MessageScrollerPrimitive.Content>) {
  return (
    <MessageScrollerPrimitive.Content
      data-slot="message-scroller-content"
      className={cn("flex h-max min-h-full flex-col gap-8", className)}
      {...props}
    />
  )
}

function MessageScrollerItem({
  className,
  scrollAnchor = false,
  ...props
}: React.ComponentProps<typeof MessageScrollerPrimitive.Item>) {
  return (
    <MessageScrollerPrimitive.Item
      data-slot="message-scroller-item"
      scrollAnchor={scrollAnchor}
      className={cn(
        "min-w-0 shrink-0 [contain-intrinsic-size:auto_10rem] [content-visibility:auto]",
        className
      )}
      {...props}
    />
  )
}

function MessageScrollerButton({
  direction = "end",
  className,
  children,
  render,
  variant = "secondary",
  size = "icon-sm",
  ...props
}: React.ComponentProps<typeof MessageScrollerPrimitive.Button> &
  Pick<React.ComponentProps<typeof Button>, "variant" | "size">) {
  return (
    <MessageScrollerPrimitive.Button
      data-slot="message-scroller-button"
      data-direction={direction}
      data-variant={variant}
      data-size={size}
      direction={direction}
      className={cn(
        "absolute inset-s-1/2 -translate-x-1/2 border-border bg-background text-foreground transition-[translate,scale,opacity] duration-200 hover:bg-muted hover:text-foreground data-[active=false]:pointer-events-none data-[active=false]:scale-95 data-[active=false]:opacity-0 data-[active=false]:duration-400 data-[active=false]:ease-[cubic-bezier(0.7,0,0.84,0)] data-[active=true]:translate-y-0 data-[active=true]:scale-100 data-[active=true]:opacity-100 data-[active=true]:ease-[cubic-bezier(0.23,1,0.32,1)] data-[direction=end]:bottom-4 data-[direction=end]:data-[active=false]:translate-y-full data-[direction=start]:top-4 data-[direction=start]:data-[active=false]:-translate-y-full rtl:translate-x-1/2 data-[direction=start]:[&_svg]:rotate-180",
        className
      )}
      render={render ?? <Button variant={variant} size={size} />}
      {...props}
    >
      {children ?? (
        <>
          <ArrowDownIcon />
          <span className="sr-only">
            {direction === "end" ? "Scroll to end" : "Scroll to start"}
          </span>
        </>
      )}
    </MessageScrollerPrimitive.Button>
  )
}

export {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerButton,
  useMessageScroller,
  useMessageScrollerScrollable,
  useMessageScrollerVisibility,
}
``````

## `components/ui/message.tsx`

``````tsx
import * as React from "react"

import { cn } from "@/lib/utils"

function MessageGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="message-group"
      className={cn("flex min-w-0 flex-col gap-2", className)}
      {...props}
    />
  )
}

function Message({
  className,
  align = "start",
  ...props
}: React.ComponentProps<"div"> & { align?: "start" | "end" }) {
  return (
    <div
      data-slot="message"
      data-align={align}
      className={cn(
        "group/message relative flex w-full min-w-0 gap-2 text-sm data-[align=end]:flex-row-reverse",
        className
      )}
      {...props}
    />
  )
}

function MessageAvatar({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="message-avatar"
      className={cn(
        "flex w-fit min-w-8 shrink-0 items-center justify-center self-end overflow-hidden rounded-full bg-muted group-has-data-[slot=message-footer]/message:-translate-y-8",
        className
      )}
      {...props}
    />
  )
}

function MessageContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="message-content"
      className={cn(
        "flex w-full min-w-0 flex-col gap-2.5 wrap-break-word group-data-[align=end]/message:*:data-slot:self-end",
        className
      )}
      {...props}
    />
  )
}

function MessageHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="message-header"
      className={cn(
        "flex max-w-full min-w-0 items-center px-3 text-xs font-medium text-muted-foreground group-has-data-[variant=ghost]/message:px-0",
        className
      )}
      {...props}
    />
  )
}

function MessageFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="message-footer"
      className={cn(
        "flex max-w-full min-w-0 items-center px-3 text-xs font-medium text-muted-foreground group-has-data-[variant=ghost]/message:px-0 group-data-[align=end]/message:justify-end",
        className
      )}
      {...props}
    />
  )
}

export {
  MessageGroup,
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageHeader,
}
``````

## `components/ui/native-select.tsx`

``````tsx
import * as React from "react"
import { ChevronDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function NativeSelect({
  className,
  size = "default",
  ...props
}: Omit<React.ComponentProps<"select">, "size"> & { size?: "sm" | "default" }) {
  return (
    <div
      className="group/native-select relative w-fit has-[select:disabled]:opacity-50"
      data-slot="native-select-wrapper"
    >
      <select
        data-slot="native-select"
        data-size={size}
        className={cn(
          "h-9 w-full min-w-0 appearance-none rounded-md border border-input bg-transparent px-3 py-2 pr-9 text-sm shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed data-[size=sm]:h-8 data-[size=sm]:py-1 dark:bg-input/30 dark:hover:bg-input/50",
          "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
          "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
          className
        )}
        {...props}
      />
      <ChevronDownIcon
        className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-muted-foreground opacity-50 select-none"
        aria-hidden="true"
        data-slot="native-select-icon"
      />
    </div>
  )
}

function NativeSelectOption({
  className,
  ...props
}: React.ComponentProps<"option">) {
  return (
    <option
      data-slot="native-select-option"
      className={cn("bg-[Canvas] text-[CanvasText]", className)}
      {...props}
    />
  )
}

function NativeSelectOptGroup({
  className,
  ...props
}: React.ComponentProps<"optgroup">) {
  return (
    <optgroup
      data-slot="native-select-optgroup"
      className={cn("bg-[Canvas] text-[CanvasText]", className)}
      {...props}
    />
  )
}

export { NativeSelect, NativeSelectOptGroup, NativeSelectOption }
``````

## `components/ui/navigation-menu.tsx`

``````tsx
import * as React from "react"
import { cva } from "class-variance-authority"
import { ChevronDownIcon } from "lucide-react"
import { NavigationMenu as NavigationMenuPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function NavigationMenu({
  className,
  children,
  viewport = true,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Root> & {
  viewport?: boolean
}) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      data-viewport={viewport}
      className={cn(
        "group/navigation-menu relative flex max-w-max flex-1 items-center justify-center",
        className
      )}
      {...props}
    >
      {children}
      {viewport && <NavigationMenuViewport />}
    </NavigationMenuPrimitive.Root>
  )
}

function NavigationMenuList({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.List>) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn(
        "group flex flex-1 list-none items-center justify-center gap-1",
        className
      )}
      {...props}
    />
  )
}

function NavigationMenuItem({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Item>) {
  return (
    <NavigationMenuPrimitive.Item
      data-slot="navigation-menu-item"
      className={cn("relative", className)}
      {...props}
    />
  )
}

const navigationMenuTriggerStyle = cva(
  "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-[color,box-shadow] outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-accent/50 data-[state=open]:text-accent-foreground data-[state=open]:hover:bg-accent data-[state=open]:focus:bg-accent"
)

function NavigationMenuTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>) {
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      className={cn(navigationMenuTriggerStyle(), "group", className)}
      {...props}
    >
      {children}{" "}
      <ChevronDownIcon
        className="relative top-[1px] ml-1 size-3 transition duration-300 group-data-[state=open]:rotate-180"
        aria-hidden="true"
      />
    </NavigationMenuPrimitive.Trigger>
  )
}

function NavigationMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Content>) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        "top-0 left-0 w-full p-2 pr-2.5 data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 data-[motion^=from-]:animate-in data-[motion^=from-]:fade-in data-[motion^=to-]:animate-out data-[motion^=to-]:fade-out md:absolute md:w-auto",
        "group-data-[viewport=false]/navigation-menu:top-full group-data-[viewport=false]/navigation-menu:mt-1.5 group-data-[viewport=false]/navigation-menu:overflow-hidden group-data-[viewport=false]/navigation-menu:rounded-md group-data-[viewport=false]/navigation-menu:border group-data-[viewport=false]/navigation-menu:bg-popover group-data-[viewport=false]/navigation-menu:text-popover-foreground group-data-[viewport=false]/navigation-menu:shadow group-data-[viewport=false]/navigation-menu:duration-200 **:data-[slot=navigation-menu-link]:focus:ring-0 **:data-[slot=navigation-menu-link]:focus:outline-none group-data-[viewport=false]/navigation-menu:data-[state=closed]:animate-out group-data-[viewport=false]/navigation-menu:data-[state=closed]:fade-out-0 group-data-[viewport=false]/navigation-menu:data-[state=closed]:zoom-out-95 group-data-[viewport=false]/navigation-menu:data-[state=open]:animate-in group-data-[viewport=false]/navigation-menu:data-[state=open]:fade-in-0 group-data-[viewport=false]/navigation-menu:data-[state=open]:zoom-in-95",
        className
      )}
      {...props}
    />
  )
}

function NavigationMenuViewport({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Viewport>) {
  return (
    <div
      className={cn(
        "absolute top-full left-0 isolate z-50 flex justify-center"
      )}
    >
      <NavigationMenuPrimitive.Viewport
        data-slot="navigation-menu-viewport"
        className={cn(
          "origin-top-center relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:zoom-in-90 md:w-[var(--radix-navigation-menu-viewport-width)]",
          className
        )}
        {...props}
      />
    </div>
  )
}

function NavigationMenuLink({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Link>) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn(
        "flex flex-col gap-1 rounded-sm p-2 text-sm transition-all outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 data-[active=true]:bg-accent/50 data-[active=true]:text-accent-foreground data-[active=true]:hover:bg-accent data-[active=true]:focus:bg-accent [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function NavigationMenuIndicator({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Indicator>) {
  return (
    <NavigationMenuPrimitive.Indicator
      data-slot="navigation-menu-indicator"
      className={cn(
        "top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:animate-in data-[state=visible]:fade-in",
        className
      )}
      {...props}
    >
      <div className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-border shadow-md" />
    </NavigationMenuPrimitive.Indicator>
  )
}

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
}
``````

## `components/ui/pagination.tsx`

``````tsx
import * as React from "react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { buttonVariants, type Button } from "@/components/ui/button"

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  )
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  )
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<React.ComponentProps<typeof Button>, "size"> &
  React.ComponentProps<"a">

function PaginationLink({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        buttonVariants({
          variant: isActive ? "outline" : "ghost",
          size,
        }),
        className
      )}
      {...props}
    />
  )
}

function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={cn("gap-1 px-2.5 sm:pl-2.5", className)}
      {...props}
    >
      <ChevronLeftIcon />
      <span className="hidden sm:block">Previous</span>
    </PaginationLink>
  )
}

function PaginationNext({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn("gap-1 px-2.5 sm:pr-2.5", className)}
      {...props}
    >
      <span className="hidden sm:block">Next</span>
      <ChevronRightIcon />
    </PaginationLink>
  )
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontalIcon className="size-4" />
      <span className="sr-only">More pages</span>
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
}
``````

## `components/ui/popover.tsx`

``````tsx
"use client"

import * as React from "react"
import { Popover as PopoverPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Popover({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

function PopoverTrigger({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-hidden data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
}

function PopoverAnchor({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />
}

function PopoverHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="popover-header"
      className={cn("flex flex-col gap-1 text-sm", className)}
      {...props}
    />
  )
}

function PopoverTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <div
      data-slot="popover-title"
      className={cn("font-medium", className)}
      {...props}
    />
  )
}

function PopoverDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="popover-description"
      className={cn("text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
}
``````

## `components/ui/progress.tsx`

``````tsx
"use client"

import * as React from "react"
import { Progress as ProgressPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      value={value}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-primary/20",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="h-full w-full flex-1 bg-primary transition-all"
        style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
``````

## `components/ui/radio-group.tsx`

``````tsx
"use client"

import * as React from "react"
import { CircleIcon } from "lucide-react"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid gap-3", className)}
      {...props}
    />
  )
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "aspect-square size-4 shrink-0 rounded-full border border-input text-primary shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="relative flex items-center justify-center"
      >
        <CircleIcon className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 fill-primary" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}

export { RadioGroup, RadioGroupItem }
``````

## `components/ui/resizable.tsx`

``````tsx
"use client"

import { GripVerticalIcon } from "lucide-react"
import * as ResizablePrimitive from "react-resizable-panels"

import { cn } from "@/lib/utils"

function ResizablePanelGroup({
  className,
  ...props
}: ResizablePrimitive.GroupProps) {
  return (
    <ResizablePrimitive.Group
      data-slot="resizable-panel-group"
      className={cn(
        "flex h-full w-full aria-[orientation=vertical]:flex-col",
        className
      )}
      {...props}
    />
  )
}

function ResizablePanel({ ...props }: ResizablePrimitive.PanelProps) {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />
}

function ResizableHandle({
  withHandle,
  className,
  ...props
}: ResizablePrimitive.SeparatorProps & {
  withHandle?: boolean
}) {
  return (
    <ResizablePrimitive.Separator
      data-slot="resizable-handle"
      className={cn(
        "relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:outline-hidden aria-[orientation=horizontal]:h-px aria-[orientation=horizontal]:w-full aria-[orientation=horizontal]:after:left-0 aria-[orientation=horizontal]:after:h-1 aria-[orientation=horizontal]:after:w-full aria-[orientation=horizontal]:after:translate-x-0 aria-[orientation=horizontal]:after:-translate-y-1/2 [&[aria-orientation=horizontal]>div]:rotate-90",
        className
      )}
      {...props}
    >
      {withHandle && (
        <div className="z-10 flex h-4 w-3 items-center justify-center rounded-xs border bg-border">
          <GripVerticalIcon className="size-2.5" />
        </div>
      )}
    </ResizablePrimitive.Separator>
  )
}

export { ResizableHandle, ResizablePanel, ResizablePanelGroup }
``````

## `components/ui/scroll-area.tsx`

``````tsx
"use client"

import * as React from "react"
import { ScrollArea as ScrollAreaPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function ScrollArea({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Root>) {
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn("relative", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        className="size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1"
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
}

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn(
        "flex touch-none p-px transition-colors select-none",
        orientation === "vertical" &&
          "h-full w-2.5 border-l border-l-transparent",
        orientation === "horizontal" &&
          "h-2.5 flex-col border-t border-t-transparent",
        className
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"
        className="relative flex-1 rounded-full bg-border"
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  )
}

export { ScrollArea, ScrollBar }
``````

## `components/ui/select.tsx`

``````tsx
"use client"

import * as React from "react"
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react"
import { Select as SelectPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default"
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "flex w-fit items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[placeholder]:text-muted-foreground data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="size-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  position = "item-aligned",
  align = "center",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          "relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        align={align}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("px-2 py-1.5 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className
      )}
      {...props}
    >
      <span
        data-slot="select-item-indicator"
        className="absolute right-2 flex size-3.5 items-center justify-center"
      >
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("pointer-events-none -mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
``````

## `components/ui/separator.tsx`

``````tsx
"use client"

import * as React from "react"
import { Separator as SeparatorPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className
      )}
      {...props}
    />
  )
}

export { Separator }
``````

## `components/ui/sheet.tsx`

``````tsx
"use client"

import * as React from "react"
import { XIcon } from "lucide-react"
import { Dialog as SheetPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    />
  )
}

function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left"
  showCloseButton?: boolean
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          "fixed z-50 flex flex-col gap-4 bg-background shadow-lg transition ease-in-out data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:animate-in data-[state=open]:duration-500",
          side === "right" &&
            "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
          side === "left" &&
            "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
          side === "top" &&
            "inset-x-0 top-0 h-auto border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
          side === "bottom" &&
            "inset-x-0 bottom-0 h-auto border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close className="absolute top-4 right-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none data-[state=open]:bg-secondary">
            <XIcon className="size-4" />
            <span className="sr-only">Close</span>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Content>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  )
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("font-semibold text-foreground", className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
``````

## `components/ui/sidebar.tsx`

``````tsx
"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { PanelLeftIcon } from "lucide-react"
import { Slot } from "radix-ui"

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_MOBILE = "18rem"
const SIDEBAR_WIDTH_ICON = "3rem"
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

type SidebarContextProps = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContextProps | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }

  return context
}

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const isMobile = useIsMobile()
  const [openMobile, setOpenMobile] = React.useState(false)

  // This is the internal state of the sidebar.
  // We use openProp and setOpenProp for control from outside the component.
  const [_open, _setOpen] = React.useState(defaultOpen)
  const open = openProp ?? _open
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value
      if (setOpenProp) {
        setOpenProp(openState)
      } else {
        _setOpen(openState)
      }

      // This sets the cookie to keep the sidebar state.
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
    },
    [setOpenProp, open]
  )

  // Helper to toggle the sidebar.
  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open)
  }, [isMobile, setOpen, setOpenMobile])

  // Adds a keyboard shortcut to toggle the sidebar.
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault()
        toggleSidebar()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggleSidebar])

  // We add a state so that we can do data-state="expanded" or "collapsed".
  // This makes it easier to style the sidebar with Tailwind classes.
  const state = open ? "expanded" : "collapsed"

  const contextValue = React.useMemo<SidebarContextProps>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
  )

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          data-slot="sidebar-wrapper"
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH,
              "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
              ...style,
            } as React.CSSProperties
          }
          className={cn(
            "group/sidebar-wrapper flex min-h-svh w-full has-data-[variant=inset]:bg-sidebar",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  )
}

function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  side?: "left" | "right"
  variant?: "sidebar" | "floating" | "inset"
  collapsible?: "offcanvas" | "icon" | "none"
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

  if (collapsible === "none") {
    return (
      <div
        data-slot="sidebar"
        className={cn(
          "flex h-full w-(--sidebar-width) flex-col bg-sidebar text-sidebar-foreground",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
        <SheetContent
          data-sidebar="sidebar"
          data-slot="sidebar"
          data-mobile="true"
          className="w-(--sidebar-width) bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
            } as React.CSSProperties
          }
          side={side}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Sidebar</SheetTitle>
            <SheetDescription>Displays the mobile sidebar.</SheetDescription>
          </SheetHeader>
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div
      className="group peer hidden text-sidebar-foreground md:block"
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-variant={variant}
      data-side={side}
      data-slot="sidebar"
    >
      {/* This is what handles the sidebar gap on desktop */}
      <div
        data-slot="sidebar-gap"
        className={cn(
          "relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear",
          "group-data-[collapsible=offcanvas]:w-0",
          "group-data-[side=right]:rotate-180",
          variant === "floating" || variant === "inset"
            ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)"
        )}
      />
      <div
        data-slot="sidebar-container"
        className={cn(
          "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex",
          side === "left"
            ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
            : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
          // Adjust the padding for floating and inset variants.
          variant === "floating" || variant === "inset"
            ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l",
          className
        )}
        {...props}
      >
        <div
          data-sidebar="sidebar"
          data-slot="sidebar-inner"
          className="flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow-sm"
        >
          {children}
        </div>
      </div>
    </div>
  )
}

function SidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar()

  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon"
      className={cn("size-7", className)}
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}
    >
      <PanelLeftIcon />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
}

function SidebarRail({ className, ...props }: React.ComponentProps<"button">) {
  const { toggleSidebar } = useSidebar()

  return (
    <button
      data-sidebar="rail"
      data-slot="sidebar-rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      className={cn(
        "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border sm:flex",
        "in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize",
        "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full hover:group-data-[collapsible=offcanvas]:bg-sidebar",
        "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
        "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
        className
      )}
      {...props}
    />
  )
}

function SidebarInset({ className, ...props }: React.ComponentProps<"main">) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn(
        "relative flex w-full flex-1 flex-col bg-background",
        "md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2",
        className
      )}
      {...props}
    />
  )
}

function SidebarInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <Input
      data-slot="sidebar-input"
      data-sidebar="input"
      className={cn("h-8 w-full bg-background shadow-none", className)}
      {...props}
    />
  )
}

function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-header"
      data-sidebar="header"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  )
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-footer"
      data-sidebar="footer"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  )
}

function SidebarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="sidebar-separator"
      data-sidebar="separator"
      className={cn("mx-2 w-auto bg-sidebar-border", className)}
      {...props}
    />
  )
}

function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-content"
      data-sidebar="content"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        className
      )}
      {...props}
    />
  )
}

function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group"
      data-sidebar="group"
      className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
      {...props}
    />
  )
}

function SidebarGroupLabel({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "div"

  return (
    <Comp
      data-slot="sidebar-group-label"
      data-sidebar="group-label"
      className={cn(
        "flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 ring-sidebar-ring outline-hidden transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
        className
      )}
      {...props}
    />
  )
}

function SidebarGroupAction({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="sidebar-group-action"
      data-sidebar="group-action"
      className={cn(
        "absolute top-3.5 right-3 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground ring-sidebar-ring outline-hidden transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 md:after:hidden",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
}

function SidebarGroupContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group-content"
      data-sidebar="group-content"
      className={cn("w-full text-sm", className)}
      {...props}
    />
  )
}

function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu"
      data-sidebar="menu"
      className={cn("flex w-full min-w-0 flex-col gap-1", className)}
      {...props}
    />
  )
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-item"
      data-sidebar="menu-item"
      className={cn("group/menu-item relative", className)}
      {...props}
    />
  )
}

const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm ring-sidebar-ring outline-hidden transition-[width,height,padding] group-has-data-[sidebar=menu-action]/menu-item:pr-8 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline:
          "bg-background shadow-[0_0_0_1px_var(--sidebar-border)] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_var(--sidebar-accent)]",
      },
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm group-data-[collapsible=icon]:p-0!",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function SidebarMenuButton({
  asChild = false,
  isActive = false,
  variant = "default",
  size = "default",
  tooltip,
  className,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean
  isActive?: boolean
  tooltip?: string | React.ComponentProps<typeof TooltipContent>
} & VariantProps<typeof sidebarMenuButtonVariants>) {
  const Comp = asChild ? Slot.Root : "button"
  const { isMobile, state } = useSidebar()

  const button = (
    <Comp
      data-slot="sidebar-menu-button"
      data-sidebar="menu-button"
      data-size={size}
      data-active={isActive}
      className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
      {...props}
    />
  )

  if (!tooltip) {
    return button
  }

  if (typeof tooltip === "string") {
    tooltip = {
      children: tooltip,
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        side="right"
        align="center"
        hidden={state !== "collapsed" || isMobile}
        {...tooltip}
      />
    </Tooltip>
  )
}

function SidebarMenuAction({
  className,
  asChild = false,
  showOnHover = false,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean
  showOnHover?: boolean
}) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="sidebar-menu-action"
      data-sidebar="menu-action"
      className={cn(
        "absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground ring-sidebar-ring outline-hidden transition-transform peer-hover/menu-button:text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 md:after:hidden",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        showOnHover &&
          "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground data-[state=open]:opacity-100 md:opacity-0",
        className
      )}
      {...props}
    />
  )
}

function SidebarMenuBadge({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-menu-badge"
      data-sidebar="menu-badge"
      className={cn(
        "pointer-events-none absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium text-sidebar-foreground tabular-nums select-none",
        "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
}

function SidebarMenuSkeleton({
  className,
  showIcon = false,
  ...props
}: React.ComponentProps<"div"> & {
  showIcon?: boolean
}) {
  const width = "70%"

  return (
    <div
      data-slot="sidebar-menu-skeleton"
      data-sidebar="menu-skeleton"
      className={cn("flex h-8 items-center gap-2 rounded-md px-2", className)}
      {...props}
    >
      {showIcon && (
        <Skeleton
          className="size-4 rounded-md"
          data-sidebar="menu-skeleton-icon"
        />
      )}
      <Skeleton
        className="h-4 max-w-(--skeleton-width) flex-1"
        data-sidebar="menu-skeleton-text"
        style={
          {
            "--skeleton-width": width,
          } as React.CSSProperties
        }
      />
    </div>
  )
}

function SidebarMenuSub({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu-sub"
      data-sidebar="menu-sub"
      className={cn(
        "mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
}

function SidebarMenuSubItem({
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-sub-item"
      data-sidebar="menu-sub-item"
      className={cn("group/menu-sub-item relative", className)}
      {...props}
    />
  )
}

function SidebarMenuSubButton({
  asChild = false,
  size = "md",
  isActive = false,
  className,
  ...props
}: React.ComponentProps<"a"> & {
  asChild?: boolean
  size?: "sm" | "md"
  isActive?: boolean
}) {
  const Comp = asChild ? Slot.Root : "a"

  return (
    <Comp
      data-slot="sidebar-menu-sub-button"
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        "flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground ring-sidebar-ring outline-hidden hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground",
        "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
}
``````

## `components/ui/skeleton.tsx`

``````tsx
import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-accent", className)}
      {...props}
    />
  )
}

export { Skeleton }
``````

## `components/ui/slider.tsx`

``````tsx
"use client"

import * as React from "react"
import { Slider as SliderPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max]
  )

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          "relative grow overflow-hidden rounded-full bg-muted data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5"
        )}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            "absolute bg-primary data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
          )}
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className="block size-4 shrink-0 rounded-full border border-primary bg-white shadow-sm ring-ring/50 transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
        />
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider }
``````

## `components/ui/sonner.tsx`

``````tsx
"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
``````

## `components/ui/spinner.tsx`

``````tsx
import { Loader2Icon } from "lucide-react"

import { cn } from "@/lib/utils"

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  )
}

export { Spinner }
``````

## `components/ui/switch.tsx`

``````tsx
"use client"

import * as React from "react"
import { Switch as SwitchPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-[1.15rem] data-[size=default]:w-8 data-[size=sm]:h-3.5 data-[size=sm]:w-6 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block rounded-full bg-background ring-0 transition-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0 dark:data-[state=checked]:bg-primary-foreground dark:data-[state=unchecked]:bg-foreground"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
``````

## `components/ui/table.tsx`

``````tsx
"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted",
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
``````

## `components/ui/tabs.tsx`

``````tsx
"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Tabs as TabsPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      orientation={orientation}
      className={cn(
        "group/tabs flex gap-2 data-[orientation=horizontal]:flex-col",
        className
      )}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit items-center justify-center rounded-lg p-[3px] text-muted-foreground group-data-[orientation=horizontal]/tabs:h-9 group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col data-[variant=line]:rounded-none",
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-1 bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function TabsList({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap text-foreground/60 transition-all group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 group-data-[variant=default]/tabs-list:data-[state=active]:shadow-sm group-data-[variant=line]/tabs-list:data-[state=active]:shadow-none dark:text-muted-foreground dark:hover:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent dark:group-data-[variant=line]/tabs-list:data-[state=active]:border-transparent dark:group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent",
        "data-[state=active]:bg-background data-[state=active]:text-foreground dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 dark:data-[state=active]:text-foreground",
        "after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-[orientation=horizontal]/tabs:after:inset-x-0 group-data-[orientation=horizontal]/tabs:after:bottom-[-5px] group-data-[orientation=horizontal]/tabs:after:h-0.5 group-data-[orientation=vertical]/tabs:after:inset-y-0 group-data-[orientation=vertical]/tabs:after:-right-1 group-data-[orientation=vertical]/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-[state=active]:after:opacity-100",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
``````

## `components/ui/textarea.tsx`

``````tsx
import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
``````

## `components/ui/toggle-group.tsx`

``````tsx
"use client"

import * as React from "react"
import { type VariantProps } from "class-variance-authority"
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { toggleVariants } from "@/components/ui/toggle"

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants> & {
    spacing?: number
  }
>({
  size: "default",
  variant: "default",
  spacing: 0,
})

function ToggleGroup({
  className,
  variant,
  size,
  spacing = 0,
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleVariants> & {
    spacing?: number
  }) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      data-spacing={spacing}
      style={{ "--gap": spacing } as React.CSSProperties}
      className={cn(
        "group/toggle-group flex w-fit items-center gap-[--spacing(var(--gap))] rounded-md data-[spacing=default]:data-[variant=outline]:shadow-xs",
        className
      )}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size, spacing }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  )
}

function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> &
  VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext)

  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-variant={context.variant || variant}
      data-size={context.size || size}
      data-spacing={context.spacing}
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        "w-auto min-w-0 shrink-0 px-3 focus:z-10 focus-visible:z-10",
        "data-[spacing=0]:rounded-none data-[spacing=0]:shadow-none data-[spacing=0]:first:rounded-l-md data-[spacing=0]:last:rounded-r-md data-[spacing=0]:data-[variant=outline]:border-l-0 data-[spacing=0]:data-[variant=outline]:first:border-l",
        className
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  )
}

export { ToggleGroup, ToggleGroupItem }
``````

## `components/ui/toggle.tsx`

``````tsx
"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Toggle as TogglePrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-[color,box-shadow] outline-none hover:bg-muted hover:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border border-input bg-transparent shadow-xs hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-9 min-w-9 px-2",
        sm: "h-8 min-w-8 px-1.5",
        lg: "h-10 min-w-10 px-2.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Toggle({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Toggle, toggleVariants }
``````

## `components/ui/tooltip.tsx`

``````tsx
"use client"

import * as React from "react"
import { Tooltip as TooltipPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  )
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "z-50 w-fit origin-(--radix-tooltip-content-transform-origin) animate-in rounded-md bg-foreground px-3 py-1.5 text-xs text-balance text-background fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          className
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px] bg-foreground fill-foreground" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
``````

## `components.json`

``````json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "registries": {}
}
``````

## `db/index.ts`

``````typescript
import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export function getDb() {
  if (!env.DB) {
    throw new Error(
      "Cloudflare D1 binding `DB` is unavailable. Set the `d1` field in .openai/hosting.json to `DB` or let your control plane inject the real binding values before using the database."
    );
  }

  return drizzle(env.DB, { schema });
}
``````

## `db/schema.ts`

``````typescript
// Intentionally empty by default.
// Add Drizzle tables here when the site actually needs a database.
// See examples/d1/db/schema.ts for an opt-in example.
export {};
``````

## `drizzle/meta/_journal.json`

``````json
{
  "version": "7",
  "dialect": "sqlite",
  "entries": []
}
``````

## `drizzle.config.ts`

``````typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./db/schema.ts",
  dialect: "sqlite",
});
``````

## `eslint.config.mjs`

``````javascript
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    files: ["components/ui/**/*.{ts,tsx}", "hooks/use-mobile.ts"],
    rules: {
      // These files are vendored verbatim from shadcn@4.17.0. Keep the
      // registry source intact while applying the stricter rules to Site code.
      "@typescript-eslint/no-unused-vars": "off",
      "react-hooks/purity": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
``````

## `examples/d1/app/api/notes/route.ts`

``````typescript
import { desc } from "drizzle-orm";
import { getDb } from "../../../../../db";
import { notes } from "../../../db/schema";

function toRouteErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "Unexpected error";
  const detail =
    error instanceof Error && error.cause instanceof Error ? error.cause.message : "";
  const combined = `${message}\n${detail}`;

  if (combined.includes("no such table") || combined.includes('from "notes"')) {
    return "The notes table is unavailable. Generate the migration locally with `npm run db:generate`, then deploy so the platform can apply the generated SQL to the real D1 database.";
  }

  return message;
}

export async function GET() {
  try {
    const db = getDb();
    const rows = await db
      .select()
      .from(notes)
      .orderBy(desc(notes.createdAt), desc(notes.id))
      .limit(20);

    return Response.json({ notes: rows });
  } catch (error) {
    return Response.json(
      { error: toRouteErrorMessage(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      title?: string;
      content?: string;
    };
    const title = payload.title?.trim() ?? "";
    const content = payload.content?.trim() ?? "";

    if (!title) {
      return Response.json({ error: "title is required" }, { status: 400 });
    }

    const db = getDb();
    const [note] = await db.insert(notes).values({ title, content }).returning();
    return Response.json({ note }, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: toRouteErrorMessage(error) },
      { status: 500 }
    );
  }
}
``````

## `examples/d1/db/schema.ts`

``````typescript
import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const notes = sqliteTable("notes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  content: text("content").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
``````

## `hooks/use-mobile.ts`

``````typescript
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
``````

## `lib/utils.ts`

``````typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
``````

## `next.config.ts`

``````typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
``````

## `package.json`

``````json
{
  "name": "site-creator-vinext-starter",
  "version": "0.1.0",
  "private": true,
  "engines": {
    "node": ">=22.13.0"
  },
  "scripts": {
    "install:ci": "bash scripts/install-pnpm.sh",
    "dev": "node scripts/run-framework.mjs dev",
    "build": "node scripts/run-framework.mjs build",
    "start": "node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js dev --config dist/server/wrangler.json --local --persist-to .wrangler/state --ip 127.0.0.1 --inspector-port 0",
    "lint": "eslint . --ignore-pattern dist --ignore-pattern .next",
    "db:generate": "drizzle-kit generate"
  },
  "dependencies": {
    "@base-ui/react": "^1.7.0",
    "@hookform/resolvers": "^5.7.1",
    "@shadcn/react": "^0.3.0",
    "class-variance-authority": "0.7.1",
    "clsx": "2.1.1",
    "cmdk": "^1.1.1",
    "date-fns": "^4.4.0",
    "drizzle-orm": "0.45.2",
    "embla-carousel-react": "^8.6.0",
    "input-otp": "^1.4.2",
    "leaflet": "^1.9.4",
    "lucide-react": "^1.31.0",
    "next": "16.3.4",
    "next-themes": "^0.4.6",
    "radix-ui": "^1.6.7",
    "react": "19.2.6",
    "react-day-picker": "^10.0.1",
    "react-dom": "19.2.6",
    "react-hook-form": "^7.85.0",
    "react-resizable-panels": "^4.12.2",
    "recharts": "^3.8.0",
    "sonner": "^2.0.8",
    "tailwind-merge": "3.6.0",
    "vaul": "^1.1.2",
    "zod": "^3.25.76"
  },
  "devDependencies": {
    "@cloudflare/vite-plugin": "1.37.1",
    "@cloudflare/workers-types": "4.20260515.1",
    "@tailwindcss/postcss": "4.2.1",
    "@types/leaflet": "^1.9.22",
    "@types/node": "22.19.19",
    "@types/react": "19.2.14",
    "@types/react-dom": "19.2.3",
    "@vitejs/plugin-react": "6.0.2",
    "@vitejs/plugin-rsc": "0.5.26",
    "drizzle-kit": "0.31.10",
    "eslint": "9.39.4",
    "eslint-config-next": "16.3.4",
    "react-server-dom-webpack": "19.2.6",
    "tailwindcss": "4.2.1",
    "tw-animate-css": "^1.4.0",
    "typescript": "5.9.3",
    "vinext": "1.0.0-beta.5",
    "vite": "8.0.13",
    "wrangler": "4.92.0"
  },
  "type": "module",
  "overrides": {
    "miniflare": {
      "sharp": "0.35.4"
    }
  },
  "packageManager": "pnpm@11.25.0"
}
``````

## `pnpm-lock.yaml`

``````yaml
lockfileVersion: '9.0'

settings:
  autoInstallPeers: true
  excludeLinksFromLockfile: false

overrides:
  miniflare>sharp: 0.35.4

importers:

  .:
    dependencies:
      '@base-ui/react':
        specifier: ^1.7.0
        version: 1.7.0(@date-fns/tz@1.5.0)(@types/react@19.2.14)(date-fns@4.4.0)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@hookform/resolvers':
        specifier: ^5.7.1
        version: 5.7.1(@standard-schema/spec@1.1.0)(ajv-formats@2.1.1(ajv@8.20.0))(ajv@8.20.0)(react-hook-form@7.85.0(react@19.2.6))(zod@3.25.76)
      '@shadcn/react':
        specifier: ^0.3.0
        version: 0.3.0(@types/react@19.2.14)(react@19.2.6)
      class-variance-authority:
        specifier: 0.7.1
        version: 0.7.1
      clsx:
        specifier: 2.1.1
        version: 2.1.1
      cmdk:
        specifier: ^1.1.1
        version: 1.1.1(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      date-fns:
        specifier: ^4.4.0
        version: 4.4.0
      drizzle-orm:
        specifier: 0.45.2
        version: 0.45.2(@cloudflare/workers-types@4.20260515.1)
      embla-carousel-react:
        specifier: ^8.6.0
        version: 8.6.0(react@19.2.6)
      input-otp:
        specifier: ^1.4.2
        version: 1.4.2(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      leaflet:
        specifier: ^1.9.4
        version: 1.9.4
      lucide-react:
        specifier: ^1.31.0
        version: 1.31.0(react@19.2.6)
      next:
        specifier: 16.3.4
        version: 16.3.4(@babel/core@7.29.0(supports-color@10.2.2))(@types/node@22.19.19)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      next-themes:
        specifier: ^0.4.6
        version: 0.4.6(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      radix-ui:
        specifier: ^1.6.7
        version: 1.6.7(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      react:
        specifier: 19.2.6
        version: 19.2.6
      react-day-picker:
        specifier: ^10.0.1
        version: 10.0.1(@types/react@19.2.14)(react@19.2.6)
      react-dom:
        specifier: 19.2.6
        version: 19.2.6(react@19.2.6)
      react-hook-form:
        specifier: ^7.85.0
        version: 7.85.0(react@19.2.6)
      react-resizable-panels:
        specifier: ^4.12.2
        version: 4.12.2(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      recharts:
        specifier: ^3.8.0
        version: 3.8.0(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react-is@16.13.1)(react@19.2.6)(redux@5.0.1)
      sonner:
        specifier: ^2.0.8
        version: 2.0.8(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      tailwind-merge:
        specifier: 3.6.0
        version: 3.6.0
      vaul:
        specifier: ^1.1.2
        version: 1.1.2(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      zod:
        specifier: ^3.25.76
        version: 3.25.76
    devDependencies:
      '@cloudflare/vite-plugin':
        specifier: 1.37.1
        version: 1.37.1(@types/node@22.19.19)(vite@8.0.13(@types/node@22.19.19)(esbuild@0.28.0)(jiti@2.7.0)(terser@5.47.1)(tsx@4.22.1))(workerd@1.20260515.1)(wrangler@4.92.0(@cloudflare/workers-types@4.20260515.1)(@types/node@22.19.19))
      '@cloudflare/workers-types':
        specifier: 4.20260515.1
        version: 4.20260515.1
      '@tailwindcss/postcss':
        specifier: 4.2.1
        version: 4.2.1
      '@types/leaflet':
        specifier: ^1.9.22
        version: 1.9.22
      '@types/node':
        specifier: 22.19.19
        version: 22.19.19
      '@types/react':
        specifier: 19.2.14
        version: 19.2.14
      '@types/react-dom':
        specifier: 19.2.3
        version: 19.2.3(@types/react@19.2.14)
      '@vitejs/plugin-react':
        specifier: 6.0.2
        version: 6.0.2(vite@8.0.13(@types/node@22.19.19)(esbuild@0.28.0)(jiti@2.7.0)(terser@5.47.1)(tsx@4.22.1))
      '@vitejs/plugin-rsc':
        specifier: 0.5.26
        version: 0.5.26(react-dom@19.2.6(react@19.2.6))(react-server-dom-webpack@19.2.6(react-dom@19.2.6(react@19.2.6))(react@19.2.6)(webpack@5.106.2(esbuild@0.28.0)(lightningcss@1.32.0)(postcss@8.5.23)))(react@19.2.6)(vite@8.0.13(@types/node@22.19.19)(esbuild@0.28.0)(jiti@2.7.0)(terser@5.47.1)(tsx@4.22.1))
      drizzle-kit:
        specifier: 0.31.10
        version: 0.31.10
      eslint:
        specifier: 9.39.4
        version: 9.39.4(jiti@2.7.0)(supports-color@10.2.2)
      eslint-config-next:
        specifier: 16.3.4
        version: 16.3.4(@typescript-eslint/parser@8.59.3(eslint@9.39.4(jiti@2.7.0)(supports-color@10.2.2))(supports-color@10.2.2)(typescript@5.9.3))(eslint@9.39.4(jiti@2.7.0)(supports-color@10.2.2))(supports-color@10.2.2)(typescript@5.9.3)
      react-server-dom-webpack:
        specifier: 19.2.6
        version: 19.2.6(react-dom@19.2.6(react@19.2.6))(react@19.2.6)(webpack@5.106.2(esbuild@0.28.0)(lightningcss@1.32.0)(postcss@8.5.23))
      tailwindcss:
        specifier: 4.2.1
        version: 4.2.1
      tw-animate-css:
        specifier: ^1.4.0
        version: 1.4.0
      typescript:
        specifier: 5.9.3
        version: 5.9.3
      vinext:
        specifier: 1.0.0-beta.5
        version: 1.0.0-beta.5(@vitejs/plugin-react@6.0.2(vite@8.0.13(@types/node@22.19.19)(esbuild@0.28.0)(jiti@2.7.0)(terser@5.47.1)(tsx@4.22.1)))(@vitejs/plugin-rsc@0.5.26(react-dom@19.2.6(react@19.2.6))(react-server-dom-webpack@19.2.6(react-dom@19.2.6(react@19.2.6))(react@19.2.6)(webpack@5.106.2(esbuild@0.28.0)(lightningcss@1.32.0)(postcss@8.5.23)))(react@19.2.6)(vite@8.0.13(@types/node@22.19.19)(esbuild@0.28.0)(jiti@2.7.0)(terser@5.47.1)(tsx@4.22.1)))(next@16.3.4(@babel/core@7.29.0(supports-color@10.2.2))(@types/node@22.19.19)(react-dom@19.2.6(react@19.2.6))(react@19.2.6))(react-dom@19.2.6(react@19.2.6))(react-server-dom-webpack@19.2.6(react-dom@19.2.6(react@19.2.6))(react@19.2.6)(webpack@5.106.2(esbuild@0.28.0)(lightningcss@1.32.0)(postcss@8.5.23)))(react@19.2.6)(vite@8.0.13(@types/node@22.19.19)(esbuild@0.28.0)(jiti@2.7.0)(terser@5.47.1)(tsx@4.22.1))
      vite:
        specifier: 8.0.13
        version: 8.0.13(@types/node@22.19.19)(esbuild@0.28.0)(jiti@2.7.0)(terser@5.47.1)(tsx@4.22.1)
      wrangler:
        specifier: 4.92.0
        version: 4.92.0(@cloudflare/workers-types@4.20260515.1)(@types/node@22.19.19)

packages:

  '@alloc/quick-lru@5.2.0':
    resolution: {integrity: sha512-UrcABB+4bUrFABwbluTIBErXwvbsU/V7TZWfmbgJfbkwiBuziS9gxdODUyuiecfdGQ85jglMW6juS3+z5TsKLw==}
    engines: {node: '>=10'}

  '@babel/code-frame@7.29.0':
    resolution: {integrity: sha512-9NhCeYjq9+3uxgdtp20LSiJXJvN0FeCtNGpJxuMFZ1Kv3cWUNb6DOhJwUvcVCzKGR66cw4njwM6hrJLqgOwbcw==}
    engines: {node: '>=6.9.0'}

  '@babel/compat-data@7.29.3':
    resolution: {integrity: sha512-LIVqM46zQWZhj17qA8wb4nW/ixr2y1Nw+r1etiAWgRM6U1IqP+LNhL1yg440jYZR72jCWcWbLWzIosH+uP1fqg==}
    engines: {node: '>=6.9.0'}

  '@babel/core@7.29.0':
    resolution: {integrity: sha512-CGOfOJqWjg2qW/Mb6zNsDm+u5vFQ8DxXfbM09z69p5Z6+mE1ikP2jUXw+j42Pf1XTYED2Rni5f95npYeuwMDQA==}
    engines: {node: '>=6.9.0'}

  '@babel/generator@7.29.1':
    resolution: {integrity: sha512-qsaF+9Qcm2Qv8SRIMMscAvG4O3lJ0F1GuMo5HR/Bp02LopNgnZBC/EkbevHFeGs4ls/oPz9v+Bsmzbkbe+0dUw==}
    engines: {node: '>=6.9.0'}

  '@babel/helper-compilation-targets@7.28.6':
    resolution: {integrity: sha512-JYtls3hqi15fcx5GaSNL7SCTJ2MNmjrkHXg4FSpOA/grxK8KwyZ5bubHsCq8FXCkua6xhuaaBit+3b7+VZRfcA==}
    engines: {node: '>=6.9.0'}

  '@babel/helper-globals@7.28.0':
    resolution: {integrity: sha512-+W6cISkXFa1jXsDEdYA8HeevQT/FULhxzR99pxphltZcVaugps53THCeiWA8SguxxpSp3gKPiuYfSWopkLQ4hw==}
    engines: {node: '>=6.9.0'}

  '@babel/helper-module-imports@7.28.6':
    resolution: {integrity: sha512-l5XkZK7r7wa9LucGw9LwZyyCUscb4x37JWTPz7swwFE/0FMQAGpiWUZn8u9DzkSBWEcK25jmvubfpw2dnAMdbw==}
    engines: {node: '>=6.9.0'}

  '@babel/helper-module-transforms@7.28.6':
    resolution: {integrity: sha512-67oXFAYr2cDLDVGLXTEABjdBJZ6drElUSI7WKp70NrpyISso3plG9SAGEF6y7zbha/wOzUByWWTJvEDVNIUGcA==}
    engines: {node: '>=6.9.0'}
    peerDependencies:
      '@babel/core': ^7.0.0

  '@babel/helper-string-parser@7.27.1':
    resolution: {integrity: sha512-qMlSxKbpRlAridDExk92nSobyDdpPijUq2DW6oDnUqd0iOGxmQjyqhMIihI9+zv4LPyZdRje2cavWPbCbWm3eA==}
    engines: {node: '>=6.9.0'}

  '@babel/helper-validator-identifier@7.28.5':
    resolution: {integrity: sha512-qSs4ifwzKJSV39ucNjsvc6WVHs6b7S03sOh2OcHF9UHfVPqWWALUsNUVzhSBiItjRZoLHx7nIarVjqKVusUZ1Q==}
    engines: {node: '>=6.9.0'}

  '@babel/helper-validator-option@7.27.1':
    resolution: {integrity: sha512-YvjJow9FxbhFFKDSuFnVCe2WxXk1zWc22fFePVNEaWJEu8IrZVlda6N0uHwzZrUM1il7NC9Mlp4MaJYbYd9JSg==}
    engines: {node: '>=6.9.0'}

  '@babel/helpers@7.29.2':
    resolution: {integrity: sha512-HoGuUs4sCZNezVEKdVcwqmZN8GoHirLUcLaYVNBK2J0DadGtdcqgr3BCbvH8+XUo4NGjNl3VOtSjEKNzqfFgKw==}
    engines: {node: '>=6.9.0'}

  '@babel/parser@7.29.3':
    resolution: {integrity: sha512-b3ctpQwp+PROvU/cttc4OYl4MzfJUWy6FZg+PMXfzmt/+39iHVF0sDfqay8TQM3JA2EUOyKcFZt75jWriQijsA==}
    engines: {node: '>=6.0.0'}
    hasBin: true

  '@babel/runtime@7.29.7':
    resolution: {integrity: sha512-Nq8OhGWiZIZGV6hLHoyAKLLcJihP/xFeBMGJoUrxTX2psI8dCifzLhZISFb+VWS3wFMRDmCGw5R+dOySCqPLhw==}
    engines: {node: '>=6.9.0'}

  '@babel/template@7.28.6':
    resolution: {integrity: sha512-YA6Ma2KsCdGb+WC6UpBVFJGXL58MDA6oyONbjyF/+5sBgxY/dwkhLogbMT2GXXyU84/IhRw/2D1Os1B/giz+BQ==}
    engines: {node: '>=6.9.0'}

  '@babel/traverse@7.29.0':
    resolution: {integrity: sha512-4HPiQr0X7+waHfyXPZpWPfWL/J7dcN1mx9gL6WdQVMbPnF3+ZhSMs8tCxN7oHddJE9fhNE7+lxdnlyemKfJRuA==}
    engines: {node: '>=6.9.0'}

  '@babel/types@7.29.0':
    resolution: {integrity: sha512-LwdZHpScM4Qz8Xw2iKSzS+cfglZzJGvofQICy7W7v4caru4EaAmyUuO6BGrbyQ2mYV11W0U8j5mBhd14dd3B0A==}
    engines: {node: '>=6.9.0'}

  '@base-ui/react@1.7.0':
    resolution: {integrity: sha512-j+8QjX44C32jrXD/qyEAGpFr70FRpGL2CY61mQd9nBPWN737CK0xxD1ceJ055rW4RtdvFDT1e7otzdlfxvsYug==}
    engines: {node: '>=14.0.0'}
    peerDependencies:
      '@date-fns/tz': ^1.2.0
      '@types/react': ^17 || ^18 || ^19
      date-fns: ^4.0.0
      react: ^17 || ^18 || ^19
      react-dom: ^17 || ^18 || ^19
    peerDependenciesMeta:
      '@date-fns/tz':
        optional: true
      '@types/react':
        optional: true
      date-fns:
        optional: true

  '@base-ui/utils@0.3.2':
    resolution: {integrity: sha512-oWy1aq/I2GmYjpl4PhEAhzflF8VPGKgZeq0xAWTbfD5KBWyxcN0ZP2+WHSUm/5Z6lVMBDLReLcoXwSYoRc/zNQ==}
    peerDependencies:
      '@types/react': ^17 || ^18 || ^19
      react: ^17 || ^18 || ^19
      react-dom: ^17 || ^18 || ^19
    peerDependenciesMeta:
      '@types/react':
        optional: true

  '@cloudflare/kv-asset-handler@0.5.0':
    resolution: {integrity: sha512-jxQYkj8dSIzc0cD6cMMNdOc1UVjqSqu8BZdor5s8cGjW2I8BjODt/kWPVdY+u9zj3ms75Q5qaZgnxUad83+eAg==}
    engines: {node: '>=22.0.0'}

  '@cloudflare/unenv-preset@2.16.1':
    resolution: {integrity: sha512-ECxObrMfyTl5bhQf/lZCXwo5G6xX9IAUo+nDMKK4SZ8m4Jvvxp52vilxyySSWh2YTZz8+HQ07qGH/2rEom1vDw==}
    peerDependencies:
      unenv: 2.0.0-rc.24
      workerd: '>1.20260305.0 <2.0.0-0'
    peerDependenciesMeta:
      workerd:
        optional: true

  '@cloudflare/vite-plugin@1.37.1':
    resolution: {integrity: sha512-FldhsmkXyLsX3yI+p0aJDo/kGyY69pDdynz2JjcuH3eCiQ+G9XaY3CrN+UYEfCbWv8CiR2wL95lNg0fT/HfwWA==}
    peerDependencies:
      vite: ^6.1.0 || ^7.0.0 || ^8.0.0
      wrangler: ^4.92.0

  '@cloudflare/workerd-darwin-64@1.20260515.1':
    resolution: {integrity: sha512-Wtw44el2pNbzixvTkWdfeBDTrQwQbJRz7/JUvPKV27I0pQWXbhNJPpM8cstq/pbrU5AGcA/HjFH6yPMRTIRKig==}
    engines: {node: '>=16'}
    cpu: [x64]
    os: [darwin]

  '@cloudflare/workerd-darwin-arm64@1.20260515.1':
    resolution: {integrity: sha512-X8EqkZej6FfmhF9AVAQ3FhyQRr9acS4RcDunMU2YiuxKHF1IU8zzH3vY30/POaG+rUu9vGDp/VgUl49VPenHJQ==}
    engines: {node: '>=16'}
    cpu: [arm64]
    os: [darwin]

  '@cloudflare/workerd-linux-64@1.20260515.1':
    resolution: {integrity: sha512-CDC89QxQ7Y7t7RG1Jd9vj/qolE1sQRkI2OSEuV5BMJi0vW/gV4OVG6xjpdK3b1OYnSWDzF7NpvlR5Yg86q7k4g==}
    engines: {node: '>=16'}
    cpu: [x64]
    os: [linux]

  '@cloudflare/workerd-linux-arm64@1.20260515.1':
    resolution: {integrity: sha512-WxbW/PToYES4fvHXzsr/5qOiETQs/Z9iZ0mjSZAiEwq5cMLZemzGN0COx+uFb9OvQwzh6Pg159qPFnw3+i9FuA==}
    engines: {node: '>=16'}
    cpu: [arm64]
    os: [linux]

  '@cloudflare/workerd-windows-64@1.20260515.1':
    resolution: {integrity: sha512-WmV/iv+MHjYsvkcMVzpM2B5/mf06UUkdpVhZrtMfV9graWjBGPYFvE/eab8748RPVGKh1Xe1vXofLzDSwc08lA==}
    engines: {node: '>=16'}
    cpu: [x64]
    os: [win32]

  '@cloudflare/workers-types@4.20260515.1':
    resolution: {integrity: sha512-ruz+9tcG2iIKq5mXU2F00lL6KF5d4QfbAk7fNgvvqf5BelxDXaieyZmSnvA4sQBuemUstt4AEDN9CmJKmfCsDw==}

  '@cspotcode/source-map-support@0.8.1':
    resolution: {integrity: sha512-IchNf6dN4tHoMFIn/7OE8LWZ19Y6q/67Bmf6vnGREv8RSbBVb9LPJxEcnwrcwX6ixSvaiGoomAUvu4YSxXrVgw==}
    engines: {node: '>=12'}

  '@date-fns/tz@1.5.0':
    resolution: {integrity: sha512-lwYN/vDPeNRULcepoE/LO2Pgx+7/RV+S9ARfbc9lr2DtGkOD7pAiruHvbR1RX3Qyf6ja47EWJDMsNK5vK08DJg==}

  '@drizzle-team/brocli@0.10.2':
    resolution: {integrity: sha512-z33Il7l5dKjUgGULTqBsQBQwckHh5AbIuxhdsIxDDiZAzBOrZO6q9ogcWC65kU382AfynTfgNumVcNIjuIua6w==}

  '@emnapi/core@1.10.0':
    resolution: {integrity: sha512-yq6OkJ4p82CAfPl0u9mQebQHKPJkY7WrIuk205cTYnYe+k2Z8YBh11FrbRG/H6ihirqcacOgl2BIO8oyMQLeXw==}

  '@emnapi/runtime@1.10.0':
    resolution: {integrity: sha512-ewvYlk86xUoGI0zQRNq/mC+16R1QeDlKQy21Ki3oSYXNgLb45GV1P6A0M+/s6nyCuNDqe5VpaY84BzXGwVbwFA==}

  '@emnapi/runtime@1.11.3':
    resolution: {integrity: sha512-Xz4Tpyki7XyrpbUK1jR1AhdAdaXyhhY4lZ3neLodmhpuWfy2PAQN5B46sAiU4liOXGLkHypn/qU+jvfWSCYYLA==}

  '@emnapi/wasi-threads@1.2.1':
    resolution: {integrity: sha512-uTII7OYF+/Mes/MrcIOYp5yOtSMLBWSIoLPpcgwipoiKbli6k322tcoFsxoIIxPDqW01SQGAgko4EzZi2BNv2w==}

  '@esbuild-kit/core-utils@3.3.2':
    resolution: {integrity: sha512-sPRAnw9CdSsRmEtnsl2WXWdyquogVpB3yZ3dgwJfe8zrOzTsV7cJvmwrKVa+0ma5BoiGJ+BoqkMvawbayKUsqQ==}
    deprecated: 'Merged into tsx: https://tsx.hirok.io'

  '@esbuild-kit/esm-loader@2.6.5':
    resolution: {integrity: sha512-FxEMIkJKnodyA1OaCUoEvbYRkoZlLZ4d/eXFu9Fh8CbBBgP5EmZxrfTRyN0qpXZ4vOvqnE5YdRdcrmUUXuU+dA==}
    deprecated: 'Merged into tsx: https://tsx.hirok.io'

  '@esbuild/aix-ppc64@0.25.12':
    resolution: {integrity: sha512-Hhmwd6CInZ3dwpuGTF8fJG6yoWmsToE+vYgD4nytZVxcu1ulHpUQRAB1UJ8+N1Am3Mz4+xOByoQoSZf4D+CpkA==}
    engines: {node: '>=18'}
    cpu: [ppc64]
    os: [aix]

  '@esbuild/aix-ppc64@0.27.3':
    resolution: {integrity: sha512-9fJMTNFTWZMh5qwrBItuziu834eOCUcEqymSH7pY+zoMVEZg3gcPuBNxH1EvfVYe9h0x/Ptw8KBzv7qxb7l8dg==}
    engines: {node: '>=18'}
    cpu: [ppc64]
    os: [aix]

  '@esbuild/aix-ppc64@0.28.0':
    resolution: {integrity: sha512-lhRUCeuOyJQURhTxl4WkpFTjIsbDayJHih5kZC1giwE+MhIzAb7mEsQMqMf18rHLsrb5qI1tafG20mLxEWcWlA==}
    engines: {node: '>=18'}
    cpu: [ppc64]
    os: [aix]

  '@esbuild/android-arm64@0.18.20':
    resolution: {integrity: sha512-Nz4rJcchGDtENV0eMKUNa6L12zz2zBDXuhj/Vjh18zGqB44Bi7MBMSXjgunJgjRhCmKOjnPuZp4Mb6OKqtMHLQ==}
    engines: {node: '>=12'}
    cpu: [arm64]
    os: [android]

  '@esbuild/android-arm64@0.25.12':
    resolution: {integrity: sha512-6AAmLG7zwD1Z159jCKPvAxZd4y/VTO0VkprYy+3N2FtJ8+BQWFXU+OxARIwA46c5tdD9SsKGZ/1ocqBS/gAKHg==}
    engines: {node: '>=18'}
    cpu: [arm64]
    os: [android]

  '@esbuild/android-arm64@0.27.3':
    resolution: {integrity: sha512-YdghPYUmj/FX2SYKJ0OZxf+iaKgMsKHVPF1MAq/P8WirnSpCStzKJFjOjzsW0QQ7oIAiccHdcqjbHmJxRb/dmg==}
    engines: {node: '>=18'}
    cpu: [arm64]
    os: [android]

  '@esbuild/android-arm64@0.28.0':
    resolution: {integrity: sha512-+WzIXQOSaGs33tLEgYPYe/yQHf0WTU0X42Jca3y8NWMbUVhp7rUnw+vAsRC/QiDrdD31IszMrZy+qwPOPjd+rw==}
    engines: {node: '>=18'}
    cpu: [arm64]
    os: [android]

  '@esbuild/android-arm@0.18.20':
    resolution: {integrity: sha512-fyi7TDI/ijKKNZTUJAQqiG5T7YjJXgnzkURqmGj13C6dCqckZBLdl4h7bkhHt/t0WP+zO9/zwroDvANaOqO5Sw==}
    engines: {node: '>=12'}
    cpu: [arm]
    os: [android]

  '@esbuild/android-arm@0.25.12':
    resolution: {integrity: sha512-VJ+sKvNA/GE7Ccacc9Cha7bpS8nyzVv0jdVgwNDaR4gDMC/2TTRc33Ip8qrNYUcpkOHUT5OZ0bUcNNVZQ9RLlg==}
    engines: {node: '>=18'}
    cpu: [arm]
    os: [android]

  '@esbuild/android-arm@0.27.3':
    resolution: {integrity: sha512-i5D1hPY7GIQmXlXhs2w8AWHhenb00+GxjxRncS2ZM7YNVGNfaMxgzSGuO8o8SJzRc/oZwU2bcScvVERk03QhzA==}
    engines: {node: '>=18'}
    cpu: [arm]
    os: [android]

  '@esbuild/android-arm@0.28.0':
    resolution: {integrity: sha512-wqh0ByljabXLKHeWXYLqoJ5jKC4XBaw6Hk08OfMrCRd2nP2ZQ5eleDZC41XHyCNgktBGYMbqnrJKq/K/lzPMSQ==}
    engines: {node: '>=18'}
    cpu: [arm]
    os: [android]

  '@esbuild/android-x64@0.18.20':
    resolution: {integrity: sha512-8GDdlePJA8D6zlZYJV/jnrRAi6rOiNaCC/JclcXpB+KIuvfBN4owLtgzY2bsxnx666XjJx2kDPUmnTtR8qKQUg==}
    engines: {node: '>=12'}
    cpu: [x64]
    os: [android]

  '@esbuild/android-x64@0.25.12':
    resolution: {integrity: sha512-5jbb+2hhDHx5phYR2By8GTWEzn6I9UqR11Kwf22iKbNpYrsmRB18aX/9ivc5cabcUiAT/wM+YIZ6SG9QO6a8kg==}
    engines: {node: '>=18'}
    cpu: [x64]
    os: [android]

  '@esbuild/android-x64@0.27.3':
    resolution: {integrity: sha512-IN/0BNTkHtk8lkOM8JWAYFg4ORxBkZQf9zXiEOfERX/CzxW3Vg1ewAhU7QSWQpVIzTW+b8Xy+lGzdYXV6UZObQ==}
    engines: {node: '>=18'}
    cpu: [x64]
    os: [android]

  '@esbuild/android-x64@0.28.0':
    resolution: {integrity: sha512-+VJggoaKhk2VNNqVL7f6S189UzShHC/mR9EE8rDdSkdpN0KflSwWY/gWjDrNxxisg8Fp1ZCD9jLMo4m0OUfeUA==}
    engines: {node: '>=18'}
    cpu: [x64]
    os: [android]

  '@esbuild/darwin-arm64@0.18.20':
    resolution: {integrity: sha512-bxRHW5kHU38zS2lPTPOyuyTm+S+eobPUnTNkdJEfAddYgEcll4xkT8DB9d2008DtTbl7uJag2HuE5NZAZgnNEA==}
    engines: {node: '>=12'}
    cpu: [arm64]
    os: [darwin]

  '@esbuild/darwin-arm64@0.25.12':
    resolution: {integrity: sha512-N3zl+lxHCifgIlcMUP5016ESkeQjLj/959RxxNYIthIg+CQHInujFuXeWbWMgnTo4cp5XVHqFPmpyu9J65C1Yg==}
    engines: {node: '>=18'}
    cpu: [arm64]
    os: [darwin]

  '@esbuild/darwin-arm64@0.27.3':
    resolution: {integrity: sha512-Re491k7ByTVRy0t3EKWajdLIr0gz2kKKfzafkth4Q8A5n1xTHrkqZgLLjFEHVD+AXdUGgQMq+Godfq45mGpCKg==}
    engines: {node: '>=18'}
    cpu: [arm64]
    os: [darwin]

  '@esbuild/darwin-arm64@0.28.0':
    resolution: {integrity: sha512-0T+A9WZm+bZ84nZBtk1ckYsOvyA3x7e2Acj1KdVfV4/2tdG4fzUp91YHx+GArWLtwqp77pBXVCPn2We7Letr0Q==}
    engines: {node: '>=18'}
    cpu: [arm64]
    os: [darwin]

  '@esbuild/darwin-x64@0.18.20':
    resolution: {integrity: sha512-pc5gxlMDxzm513qPGbCbDukOdsGtKhfxD1zJKXjCCcU7ju50O7MeAZ8c4krSJcOIJGFR+qx21yMMVYwiQvyTyQ==}
    engines: {node: '>=12'}
    cpu: [x64]
    os: [darwin]

  '@esbuild/darwin-x64@0.25.12':
    resolution: {integrity: sha512-HQ9ka4Kx21qHXwtlTUVbKJOAnmG1ipXhdWTmNXiPzPfWKpXqASVcWdnf2bnL73wgjNrFXAa3yYvBSd9pzfEIpA==}
    engines: {node: '>=18'}
    cpu: [x64]
    os: [darwin]

  '@esbuild/darwin-x64@0.27.3':
    resolution: {integrity: sha512-vHk/hA7/1AckjGzRqi6wbo+jaShzRowYip6rt6q7VYEDX4LEy1pZfDpdxCBnGtl+A5zq8iXDcyuxwtv3hNtHFg==}
    engines: {node: '>=18'}
    cpu: [x64]
    os: [darwin]

  '@esbuild/darwin-x64@0.28.0':
    resolution: {integrity: sha512-fyzLm/DLDl/84OCfp2f/XQ4flmORsjU7VKt8HLjvIXChJoFFOIL6pLJPH4Yhd1n1gGFF9mPwtlN5Wf82DZs+LQ==}
    engines: {node: '>=18'}
    cpu: [x64]
    os: [darwin]

  '@esbuild/freebsd-arm64@0.18.20':
    resolution: {integrity: sha512-yqDQHy4QHevpMAaxhhIwYPMv1NECwOvIpGCZkECn8w2WFHXjEwrBn3CeNIYsibZ/iZEUemj++M26W3cNR5h+Tw==}
    engines: {node: '>=12'}
    cpu: [arm64]
    os: [freebsd]

  '@esbuild/freebsd-arm64@0.25.12':
    resolution: {integrity: sha512-gA0Bx759+7Jve03K1S0vkOu5Lg/85dou3EseOGUes8flVOGxbhDDh/iZaoek11Y8mtyKPGF3vP8XhnkDEAmzeg==}
    engines: {node: '>=18'}
    cpu: [arm64]
    os: [freebsd]

  '@esbuild/freebsd-arm64@0.27.3':
    resolution: {integrity: sha512-ipTYM2fjt3kQAYOvo6vcxJx3nBYAzPjgTCk7QEgZG8AUO3ydUhvelmhrbOheMnGOlaSFUoHXB6un+A7q4ygY9w==}
    engines: {node: '>=18'}
    cpu: [arm64]
    os: [freebsd]

  '@esbuild/freebsd-arm64@0.28.0':
    resolution: {integrity: sha512-l9GeW5UZBT9k9brBYI+0WDffcRxgHQD8ShN2Ur4xWq/NFzUKm3k5lsH4PdaRgb2w7mI9u61nr2gI2mLI27Nh3Q==}
    engines: {node: '>=18'}
    cpu: [arm64]
    os: [freebsd]

  '@esbuild/freebsd-x64@0.18.20':
    resolution: {integrity: sha512-tgWRPPuQsd3RmBZwarGVHZQvtzfEBOreNuxEMKFcd5DaDn2PbBxfwLcj4+aenoh7ctXcbXmOQIn8HI6mCSw5MQ==}
    engines: {node: '>=12'}
    cpu: [x64]
    os: [freebsd]

  '@esbuild/freebsd-x64@0.25.12':
    resolution: {integrity: sha512-TGbO26Yw2xsHzxtbVFGEXBFH0FRAP7gtcPE7P5yP7wGy7cXK2oO7RyOhL5NLiqTlBh47XhmIUXuGciXEqYFfBQ==}
    engines: {node: '>=18'}
    cpu: [x64]
    os: [freebsd]

  '@esbuild/freebsd-x64@0.27.3':
    resolution: {integrity: sha512-dDk0X87T7mI6U3K9VjWtHOXqwAMJBNN2r7bejDsc+j03SEjtD9HrOl8gVFByeM0aJksoUuUVU9TBaZa2rgj0oA==}
    engines: {node: '>=18'}
    cpu: [x64]
    os: [freebsd]

  '@esbuild/freebsd-x64@0.28.0':
    resolution: {integrity: sha512-BXoQai/A0wPO6Es3yFJ7APCiKGc1tdAEOgeTNy3SsB491S3aHn4S4r3e976eUnPdU+NbdtmBuLncYir2tMU9Nw==}
    engines: {node: '>=18'}
    cpu: [x64]
    os: [freebsd]

  '@esbuild/linux-arm64@0.18.20':
    resolution: {integrity: sha512-2YbscF+UL7SQAVIpnWvYwM+3LskyDmPhe31pE7/aoTMFKKzIc9lLbyGUpmmb8a8AixOL61sQ/mFh3jEjHYFvdA==}
    engines: {node: '>=12'}
    cpu: [arm64]
    os: [linux]

  '@esbuild/linux-arm64@0.25.12':
    resolution: {integrity: sha512-8bwX7a8FghIgrupcxb4aUmYDLp8pX06rGh5HqDT7bB+8Rdells6mHvrFHHW2JAOPZUbnjUpKTLg6ECyzvas2AQ==}
    engines: {node: '>=18'}
    cpu: [arm64]
    os: [linux]

  '@esbuild/linux-arm64@0.27.3':
    resolution: {integrity: sha512-sZOuFz/xWnZ4KH3YfFrKCf1WyPZHakVzTiqji3WDc0BCl2kBwiJLCXpzLzUBLgmp4veFZdvN5ChW4Eq/8Fc2Fg==}
    engines: {node: '>=18'}
    cpu: [arm64]
    os: [linux]

  '@esbuild/linux-arm64@0.28.0':
    resolution: {integrity: sha512-RVyzfb3FWsGA55n6WY0MEIEPURL1FcbhFE6BffZEMEekfCzCIMtB5yyDcFnVbTnwk+CLAgTujmV/Lgvih56W+A==}
    engines: {node: '>=18'}
    cpu: [arm64]
    os: [linux]

  '@esbuild/linux-arm@0.18.20':
    resolution: {integrity: sha512-/5bHkMWnq1EgKr1V+Ybz3s1hWXok7mDFUMQ4cG10AfW3wL02PSZi5kFpYKrptDsgb2WAJIvRcDm+qIvXf/apvg==}
    engines: {node: '>=12'}
    cpu: [arm]
    os: [linux]

  '@esbuild/linux-arm@0.25.12':
    resolution: {integrity: sha512-lPDGyC1JPDou8kGcywY0YILzWlhhnRjdof3UlcoqYmS9El818LLfJJc3PXXgZHrHCAKs/Z2SeZtDJr5MrkxtOw==}
    engines: {node: '>=18'}
    cpu: [arm]
    os: [linux]

  '@esbuild/linux-arm@0.27.3':
    resolution: {integrity: sha512-s6nPv2QkSupJwLYyfS+gwdirm0ukyTFNl3KTgZEAiJDd+iHZcbTPPcWCcRYH+WlNbwChgH2QkE9NSlNrMT8Gfw==}
    engines: {node: '>=18'}
    cpu: [arm]
    os: [linux]

  '@esbuild/linux-arm@0.28.0':
    resolution: {integrity: sha512-CjaaREJagqJp7iTaNQjjidaNbCKYcd4IDkzbwwxtSvjI7NZm79qiHc8HqciMddQ6CKvJT6aBd8lO9kN/ZudLlw==}
    engines: {node: '>=18'}
    cpu: [arm]
    os: [linux]

  '@esbuild/linux-ia32@0.18.20':
    resolution: {integrity: sha512-P4etWwq6IsReT0E1KHU40bOnzMHoH73aXp96Fs8TIT6z9Hu8G6+0SHSw9i2isWrD2nbx2qo5yUqACgdfVGx7TA==}
    engines: {node: '>=12'}
    cpu: [ia32]
    os: [linux]

  '@esbuild/linux-ia32@0.25.12':
    resolution: {integrity: sha512-0y9KrdVnbMM2/vG8KfU0byhUN+EFCny9+8g202gYqSSVMonbsCfLjUO+rCci7pM0WBEtz+oK/PIwHkzxkyharA==}
    engines: {node: '>=18'}
    cpu: [ia32]
    os: [linux]

  '@esbuild/linux-ia32@0.27.3':
    resolution: {integrity: sha512-yGlQYjdxtLdh0a3jHjuwOrxQjOZYD/C9PfdbgJJF3TIZWnm/tMd/RcNiLngiu4iwcBAOezdnSLAwQDPqTmtTYg==}
    engines: {node: '>=18'}
    cpu: [ia32]
    os: [linux]

  '@esbuild/linux-ia32@0.28.0':
    resolution: {integrity: sha512-KBnSTt1kxl9x70q+ydterVdl+Cn0H18ngRMRCEQfrbqdUuntQQ0LoMZv47uB97NljZFzY6HcfqEZ2SAyIUTQBQ==}
    engines: {node: '>=18'}
    cpu: [ia32]
    os: [linux]

  '@esbuild/linux-loong64@0.18.20':
    resolution: {integrity: sha512-nXW8nqBTrOpDLPgPY9uV+/1DjxoQ7DoB2N8eocyq8I9XuqJ7BiAMDMf9n1xZM9TgW0J8zrquIb/A7s3BJv7rjg==}
    engines: {node: '>=12'}
    cpu: [loong64]
    os: [linux]

  '@esbuild/linux-loong64@0.25.12':
    resolution: {integrity: sha512-h///Lr5a9rib/v1GGqXVGzjL4TMvVTv+s1DPoxQdz7l/AYv6LDSxdIwzxkrPW438oUXiDtwM10o9PmwS/6Z0Ng==}
    engines: {node: '>=18'}
    cpu: [loong64]
    os: [linux]

  '@esbuild/linux-loong64@0.27.3':
    resolution: {integrity: sha512-WO60Sn8ly3gtzhyjATDgieJNet/KqsDlX5nRC5Y3oTFcS1l0KWba+SEa9Ja1GfDqSF1z6hif/SkpQJbL63cgOA==}
    engines: {node: '>=18'}
    cpu: [loong64]
    os: [linux]

  '@esbuild/linux-loong64@0.28.0':
    resolution: {integrity: sha512-zpSlUce1mnxzgBADvxKXX5sl8aYQHo2ezvMNI8I0lbblJtp8V4odlm3Yzlj7gPyt3T8ReksE6bK+pT3WD+aJRg==}
    engines: {node: '>=18'}
    cpu: [loong64]
    os: [linux]

  '@esbuild/linux-mips64el@0.18.20':
    resolution: {integrity: sha512-d5NeaXZcHp8PzYy5VnXV3VSd2D328Zb+9dEq5HE6bw6+N86JVPExrA6O68OPwobntbNJ0pzCpUFZTo3w0GyetQ==}
    engines: {node: '>=12'}
    cpu: [mips64el]
    os: [linux]

  '@esbuild/linux-mips64el@0.25.12':
    resolution: {integrity: sha512-iyRrM1Pzy9GFMDLsXn1iHUm18nhKnNMWscjmp4+hpafcZjrr2WbT//d20xaGljXDBYHqRcl8HnxbX6uaA/eGVw==}
    engines: {node: '>=18'}
    cpu: [mips64el]
    os: [linux]

  '@esbuild/linux-mips64el@0.27.3':
    resolution: {integrity: sha512-APsymYA6sGcZ4pD6k+UxbDjOFSvPWyZhjaiPyl/f79xKxwTnrn5QUnXR5prvetuaSMsb4jgeHewIDCIWljrSxw==}
    engines: {node: '>=18'}
    cpu: [mips64el]
    os: [linux]

  '@esbuild/linux-mips64el@0.28.0':
    resolution: {integrity: sha512-2jIfP6mmjkdmeTlsX/9vmdmhBmKADrWqN7zcdtHIeNSCH1SqIoNI63cYsjQR8J+wGa4Y5izRcSHSm8K3QWmk3w==}
    engines: {node: '>=18'}
    cpu: [mips64el]
    os: [linux]

  '@esbuild/linux-ppc64@0.18.20':
    resolution: {integrity: sha512-WHPyeScRNcmANnLQkq6AfyXRFr5D6N2sKgkFo2FqguP44Nw2eyDlbTdZwd9GYk98DZG9QItIiTlFLHJHjxP3FA==}
    engines: {node: '>=12'}
    cpu: [ppc64]
    os: [linux]

  '@esbuild/linux-ppc64@0.25.12':
    resolution: {integrity: sha512-9meM/lRXxMi5PSUqEXRCtVjEZBGwB7P/D4yT8UG/mwIdze2aV4Vo6U5gD3+RsoHXKkHCfSxZKzmDssVlRj1QQA==}
    engines: {node: '>=18'}
    cpu: [ppc64]
    os: [linux]

  '@esbuild/linux-ppc64@0.27.3':
    resolution: {integrity: sha512-eizBnTeBefojtDb9nSh4vvVQ3V9Qf9Df01PfawPcRzJH4gFSgrObw+LveUyDoKU3kxi5+9RJTCWlj4FjYXVPEA==}
    engines: {node: '>=18'}
    cpu: [ppc64]
    os: [linux]

  '@esbuild/linux-ppc64@0.28.0':
    resolution: {integrity: sha512-bc0FE9wWeC0WBm49IQMPSPILRocGTQt3j5KPCA8os6VprfuJ7KD+5PzESSrJ6GmPIPJK965ZJHTUlSA6GNYEhg==}
    engines: {node: '>=18'}
    cpu: [ppc64]
    os: [linux]

  '@esbuild/linux-riscv64@0.18.20':
    resolution: {integrity: sha512-WSxo6h5ecI5XH34KC7w5veNnKkju3zBRLEQNY7mv5mtBmrP/MjNBCAlsM2u5hDBlS3NGcTQpoBvRzqBcRtpq1A==}
    engines: {node: '>=12'}
    cpu: [riscv64]
    os: [linux]

  '@esbuild/linux-riscv64@0.25.12':
    resolution: {integrity: sha512-Zr7KR4hgKUpWAwb1f3o5ygT04MzqVrGEGXGLnj15YQDJErYu/BGg+wmFlIDOdJp0PmB0lLvxFIOXZgFRrdjR0w==}
    engines: {node: '>=18'}
    cpu: [riscv64]
    os: [linux]

  '@esbuild/linux-riscv64@0.27.3':
    resolution: {integrity: sha512-3Emwh0r5wmfm3ssTWRQSyVhbOHvqegUDRd0WhmXKX2mkHJe1SFCMJhagUleMq+Uci34wLSipf8Lagt4LlpRFWQ==}
    engines: {node: '>=18'}
    cpu: [riscv64]
    os: [linux]

  '@esbuild/linux-riscv64@0.28.0':
    resolution: {integrity: sha512-SQPZOwoTTT/HXFXQJG/vBX8sOFagGqvZyXcgLA3NhIqcBv1BJU1d46c0rGcrij2B56Z2rNiSLaZOYW5cUk7yLQ==}
    engines: {node: '>=18'}
    cpu: [riscv64]
    os: [linux]

  '@esbuild/linux-s390x@0.18.20':
    resolution: {integrity: sha512-+8231GMs3mAEth6Ja1iK0a1sQ3ohfcpzpRLH8uuc5/KVDFneH6jtAJLFGafpzpMRO6DzJ6AvXKze9LfFMrIHVQ==}
    engines: {node: '>=12'}
    cpu: [s390x]
    os: [linux]

  '@esbuild/linux-s390x@0.25.12':
    resolution: {integrity: sha512-MsKncOcgTNvdtiISc/jZs/Zf8d0cl/t3gYWX8J9ubBnVOwlk65UIEEvgBORTiljloIWnBzLs4qhzPkJcitIzIg==}
    engines: {node: '>=18'}
    cpu: [s390x]
    os: [linux]

  '@esbuild/linux-s390x@0.27.3':
    resolution: {integrity: sha512-pBHUx9LzXWBc7MFIEEL0yD/ZVtNgLytvx60gES28GcWMqil8ElCYR4kvbV2BDqsHOvVDRrOxGySBM9Fcv744hw==}
    engines: {node: '>=18'}
    cpu: [s390x]
    os: [linux]

  '@esbuild/linux-s390x@0.28.0':
    resolution: {integrity: sha512-SCfR0HN8CEEjnYnySJTd2cw0k9OHB/YFzt5zgJEwa+wL/T/raGWYMBqwDNAC6dqFKmJYZoQBRfHjgwLHGSrn3Q==}
    engines: {node: '>=18'}
    cpu: [s390x]
    os: [linux]

  '@esbuild/linux-x64@0.18.20':
    resolution: {integrity: sha512-UYqiqemphJcNsFEskc73jQ7B9jgwjWrSayxawS6UVFZGWrAAtkzjxSqnoclCXxWtfwLdzU+vTpcNYhpn43uP1w==}
    engines: {node: '>=12'}
    cpu: [x64]
    os: [linux]

  '@esbuild/linux-x64@0.25.12':
    resolution: {integrity: sha512-uqZMTLr/zR/ed4jIGnwSLkaHmPjOjJvnm6TVVitAa08SLS9Z0VM8wIRx7gWbJB5/J54YuIMInDquWyYvQLZkgw==}
    engines: {node: '>=18'}
    cpu: [x64]
    os: [linux]

  '@esbuild/linux-x64@0.27.3':
    resolution: {integrity: sha512-Czi8yzXUWIQYAtL/2y6vogER8pvcsOsk5cpwL4Gk5nJqH5UZiVByIY8Eorm5R13gq+DQKYg0+JyQoytLQas4dA==}
    engines: {node: '>=18'}
    cpu: [x64]
    os: [linux]

  '@esbuild/linux-x64@0.28.0':
    resolution: {integrity: sha512-us0dSb9iFxIi8srnpl931Nvs65it/Jd2a2K3qs7fz2WfGPHqzfzZTfec7oxZJRNPXPnNYZtanmRc4AL/JwVzHQ==}
    engines: {node: '>=18'}
    cpu: [x64]
    os: [linux]

  '@esbuild/netbsd-arm64@0.25.12':
    resolution: {integrity: sha512-xXwcTq4GhRM7J9A8Gv5boanHhRa/Q9KLVmcyXHCTaM4wKfIpWkdXiMog/KsnxzJ0A1+nD+zoecuzqPmCRyBGjg==}
    engines: {node: '>=18'}
    cpu: [arm64]
    os: [netbsd]

  '@esbuild/netbsd-arm64@0.27.3':
    resolution: {integrity: sha512-sDpk0RgmTCR/5HguIZa9n9u+HVKf40fbEUt+iTzSnCaGvY9kFP0YKBWZtJaraonFnqef5SlJ8/TiPAxzyS+UoA==}
    engines: {node: '>=18'}
    cpu: [arm64]
    os: [netbsd]

  '@esbuild/netbsd-arm64@0.28.0':
    resolution: {integrity: sha512-CR/RYotgtCKwtftMwJlUU7xCVNg3lMYZ0RzTmAHSfLCXw3NtZtNpswLEj/Kkf6kEL3Gw+BpOekRX0BYCtklhUw==}
    engines: {node: '>=18'}
    cpu: [arm64]
    os: [netbsd]

  '@esbuild/netbsd-x64@0.18.20':
    resolution: {integrity: sha512-iO1c++VP6xUBUmltHZoMtCUdPlnPGdBom6IrO4gyKPFFVBKioIImVooR5I83nTew5UOYrk3gIJhbZh8X44y06A==}
    engines: {node: '>=12'}
    cpu: [x64]
    os: [netbsd]

  '@esbuild/netbsd-x64@0.25.12':
    resolution: {integrity: sha512-Ld5pTlzPy3YwGec4OuHh1aCVCRvOXdH8DgRjfDy/oumVovmuSzWfnSJg+VtakB9Cm0gxNO9BzWkj6mtO1FMXkQ==}
    engines: {node: '>=18'}
    cpu: [x64]
    os: [netbsd]

  '@esbuild/netbsd-x64@0.27.3':
    resolution: {integrity: sha512-P14lFKJl/DdaE00LItAukUdZO5iqNH7+PjoBm+fLQjtxfcfFE20Xf5CrLsmZdq5LFFZzb5JMZ9grUwvtVYzjiA==}
    engines: {node: '>=18'}
    cpu: [x64]
    os: [netbsd]

  '@esbuild/netbsd-x64@0.28.0':
    resolution: {integrity: sha512-nU1yhmYutL+fQ71Kxnhg8uEOdC0pwEW9entHykTgEbna2pw2dkbFSMeqjjyHZoCmt8SBkOSvV+yNmm94aUrrqw==}
    engines: {node: '>=18'}
    cpu: [x64]
    os: [netbsd]

  '@esbuild/openbsd-arm64@0.25.12':
    resolution: {integrity: sha512-fF96T6KsBo/pkQI950FARU9apGNTSlZGsv1jZBAlcLL1MLjLNIWPBkj5NlSz8aAzYKg+eNqknrUJ24QBybeR5A==}
    engines: {node: '>=18'}
    cpu: [arm64]
    os: [openbsd]

  '@esbuild/openbsd-arm64@0.27.3':
    resolution: {integrity: sha512-AIcMP77AvirGbRl/UZFTq5hjXK+2wC7qFRGoHSDrZ5v5b8DK/GYpXW3CPRL53NkvDqb9D+alBiC/dV0Fb7eJcw==}
    engines: {node: '>=18'}
    cpu: [arm64]
    os: [openbsd]

  '@esbuild/openbsd-arm64@0.28.0':
    resolution: {integrity: sha512-cXb5vApOsRsxsEl4mcZ1XY3D4DzcoMxR/nnc4IyqYs0rTI8ZKmW6kyyg+11Z8yvgMfAEldKzP7AdP64HnSC/6g==}
    engines: {node: '>=18'}
    cpu: [arm64]
    os: [openbsd]

  '@esbuild/openbsd-x64@0.18.20':
    resolution: {integrity: sha512-e5e4YSsuQfX4cxcygw/UCPIEP6wbIL+se3sxPdCiMbFLBWu0eiZOJ7WoD+ptCLrmjZBK1Wk7I6D/I3NglUGOxg==}
    engines: {node: '>=12'}
    cpu: [x64]
    os: [openbsd]

  '@esbuild/openbsd-x64@0.25.12':
    resolution: {integrity: sha512-MZyXUkZHjQxUvzK7rN8DJ3SRmrVrke8ZyRusHlP+kuwqTcfWLyqMOE3sScPPyeIXN/mDJIfGXvcMqCgYKekoQw==}
    engines: {node: '>=18'}
    cpu: [x64]
    os: [openbsd]

  '@esbuild/openbsd-x64@0.27.3':
    resolution: {integrity: sha512-DnW2sRrBzA+YnE70LKqnM3P+z8vehfJWHXECbwBmH/CU51z6FiqTQTHFenPlHmo3a8UgpLyH3PT+87OViOh1AQ==}
    engines: {node: '>=18'}
    cpu: [x64]
    os: [openbsd]

  '@esbuild/openbsd-x64@0.28.0':
    resolution: {integrity: sha512-8wZM2qqtv9UP3mzy7HiGYNH/zjTA355mpeuA+859TyR+e+Tc08IHYpLJuMsfpDJwoLo1ikIJI8jC3GFjnRClzA==}
    engines: {node: '>=18'}
    cpu: [x64]
    os: [openbsd]

  '@esbuild/openharmony-arm64@0.25.12':
    resolution: {integrity: sha512-rm0YWsqUSRrjncSXGA7Zv78Nbnw4XL6/dzr20cyrQf7ZmRcsovpcRBdhD43Nuk3y7XIoW2OxMVvwuRvk9XdASg==}
    engines: {node: '>=18'}
    cpu: [arm64]
    os: [openharmony]

  '@esbuild/openharmony-arm64@0.27.3':
    resolution: {integrity: sha512-NinAEgr/etERPTsZJ7aEZQvvg/A6IsZG/LgZy+81wON2huV7SrK3e63dU0XhyZP4RKGyTm7aOgmQk0bGp0fy2g==}
    engines: {node: '>=18'}
    cpu: [arm64]
    os: [openharmony]

  '@esbuild/openharmony-arm64@0.28.0':
    resolution: {integrity: sha512-FLGfyizszcef5C3YtoyQDACyg95+dndv79i2EekILBofh5wpCa1KuBqOWKrEHZg3zrL3t5ouE5jgr94vA+Wb2w==}
    engines: {node: '>=18'}
    cpu: [arm64]
    os: [openharmony]

  '@esbuild/sunos-x64@0.18.20':
    resolution: {integrity: sha512-kDbFRFp0YpTQVVrqUd5FTYmWo45zGaXe0X8E1G/LKFC0v8x0vWrhOWSLITcCn63lmZIxfOMXtCfti/RxN/0wnQ==}
    engines: {node: '>=12'}
    cpu: [x64]
    os: [sunos]

  '@esbuild/sunos-x64@0.25.12':
    resolution: {integrity: sha512-3wGSCDyuTHQUzt0nV7bocDy72r2lI33QL3gkDNGkod22EsYl04sMf0qLb8luNKTOmgF/eDEDP5BFNwoBKH441w==}
    engines: {node: '>=18'}
    cpu: [x64]
    os: [sunos]

  '@esbuild/sunos-x64@0.27.3':
    resolution: {integrity: sha512-PanZ+nEz+eWoBJ8/f8HKxTTD172SKwdXebZ0ndd953gt1HRBbhMsaNqjTyYLGLPdoWHy4zLU7bDVJztF5f3BHA==}
    engines: {node: '>=18'}
    cpu: [x64]
    os: [sunos]

  '@esbuild/sunos-x64@0.28.0':
    resolution: {integrity: sha512-1ZgjUoEdHZZl/YlV76TSCz9Hqj9h9YmMGAgAPYd+q4SicWNX3G5GCyx9uhQWSLcbvPW8Ni7lj4gDa1T40akdlw==}
    engines: {node: '>=18'}
    cpu: [x64]
    os: [sunos]

  '@esbuild/win32-arm64@0.18.20':
    resolution: {integrity: sha512-ddYFR6ItYgoaq4v4JmQQaAI5s7npztfV4Ag6NrhiaW0RrnOXqBkgwZLofVTlq1daVTQNhtI5oieTvkRPfZrePg==}
    engines: {node: '>=12'}
    cpu: [arm64]
    os: [win32]

  '@esbuild/win32-arm64@0.25.12':
    resolution: {integrity: sha512-rMmLrur64A7+DKlnSuwqUdRKyd3UE7oPJZmnljqEptesKM8wx9J8gx5u0+9Pq0fQQW8vqeKebwNXdfOyP+8Bsg==}
    engines: {node: '>=18'}
    cpu: [arm64]
    os: [win32]

  '@esbuild/win32-arm64@0.27.3':
    resolution: {integrity: sha512-B2t59lWWYrbRDw/tjiWOuzSsFh1Y/E95ofKz7rIVYSQkUYBjfSgf6oeYPNWHToFRr2zx52JKApIcAS/D5TUBnA==}
    engines: {node: '>=18'}
    cpu: [arm64]
    os: [win32]

  '@esbuild/win32-arm64@0.28.0':
    resolution: {integrity: sha512-Q9StnDmQ/enxnpxCCLSg0oo4+34B9TdXpuyPeTedN/6+iXBJ4J+zwfQI28u/Jl40nOYAxGoNi7mFP40RUtkmUA==}
    engines: {node: '>=18'}
    cpu: [arm64]
    os: [win32]

  '@esbuild/win32-ia32@0.18.20':
    resolution: {integrity: sha512-Wv7QBi3ID/rROT08SABTS7eV4hX26sVduqDOTe1MvGMjNd3EjOz4b7zeexIR62GTIEKrfJXKL9LFxTYgkyeu7g==}
    engines: {node: '>=12'}
    cpu: [ia32]
    os: [win32]

  '@esbuild/win32-ia32@0.25.12':
    resolution: {integrity: sha512-HkqnmmBoCbCwxUKKNPBixiWDGCpQGVsrQfJoVGYLPT41XWF8lHuE5N6WhVia2n4o5QK5M4tYr21827fNhi4byQ==}
    engines: {node: '>=18'}
    cpu: [ia32]
    os: [win32]

  '@esbuild/win32-ia32@0.27.3':
    resolution: {integrity: sha512-QLKSFeXNS8+tHW7tZpMtjlNb7HKau0QDpwm49u0vUp9y1WOF+PEzkU84y9GqYaAVW8aH8f3GcBck26jh54cX4Q==}
    engines: {node: '>=18'}
    cpu: [ia32]
    os: [win32]

  '@esbuild/win32-ia32@0.28.0':
    resolution: {integrity: sha512-zF3ag/gfiCe6U2iczcRzSYJKH1DCI+ByzSENHlM2FcDbEeo5Zd2C86Aq0tKUYAJJ1obRP84ymxIAksZUcdztHA==}
    engines: {node: '>=18'}
    cpu: [ia32]
    os: [win32]

  '@esbuild/win32-x64@0.18.20':
    resolution: {integrity: sha512-kTdfRcSiDfQca/y9QIkng02avJ+NCaQvrMejlsB3RRv5sE9rRoeBPISaZpKxHELzRxZyLvNts1P27W3wV+8geQ==}
    engines: {node: '>=12'}
    cpu: [x64]
    os: [win32]

  '@esbuild/win32-x64@0.25.12':
    resolution: {integrity: sha512-alJC0uCZpTFrSL0CCDjcgleBXPnCrEAhTBILpeAp7M/OFgoqtAetfBzX0xM00MUsVVPpVjlPuMbREqnZCXaTnA==}
    engines: {node: '>=18'}
    cpu: [x64]
    os: [win32]

  '@esbuild/win32-x64@0.27.3':
    resolution: {integrity: sha512-4uJGhsxuptu3OcpVAzli+/gWusVGwZZHTlS63hh++ehExkVT8SgiEf7/uC/PclrPPkLhZqGgCTjd0VWLo6xMqA==}
    engines: {node: '>=18'}
    cpu: [x64]
    os: [win32]

  '@esbuild/win32-x64@0.28.0':
    resolution: {integrity: sha512-pEl1bO9mfAmIC+tW5btTmrKaujg3zGtUmWNdCw/xs70FBjwAL3o9OEKNHvNmnyylD6ubxUERiEhdsL0xBQ9efw==}
    engines: {node: '>=18'}
    cpu: [x64]
    os: [win32]

  '@eslint-community/eslint-utils@4.9.1':
    resolution: {integrity: sha512-phrYmNiYppR7znFEdqgfWHXR6NCkZEK7hwWDHZUjit/2/U0r6XvkDl0SYnoM51Hq7FhCGdLDT6zxCCOY1hexsQ==}
    engines: {node: ^12.22.0 || ^14.17.0 || >=16.0.0}
    peerDependencies:
      eslint: ^6.0.0 || ^7.0.0 || >=8.0.0

  '@eslint-community/regexpp@4.12.2':
    resolution: {integrity: sha512-EriSTlt5OC9/7SXkRSCAhfSxxoSUgBm33OH+IkwbdpgoqsSsUg7y3uh+IICI/Qg4BBWr3U2i39RpmycbxMq4ew==}
    engines: {node: ^12.0.0 || ^14.0.0 || >=16.0.0}

  '@eslint/config-array@0.21.2':
    resolution: {integrity: sha512-nJl2KGTlrf9GjLimgIru+V/mzgSK0ABCDQRvxw5BjURL7WfH5uoWmizbH7QB6MmnMBd8cIC9uceWnezL1VZWWw==}
    engines: {node: ^18.18.0 || ^20.9.0 || >=21.1.0}

  '@eslint/config-helpers@0.4.2':
    resolution: {integrity: sha512-gBrxN88gOIf3R7ja5K9slwNayVcZgK6SOUORm2uBzTeIEfeVaIhOpCtTox3P6R7o2jLFwLFTLnC7kU/RGcYEgw==}
    engines: {node: ^18.18.0 || ^20.9.0 || >=21.1.0}

  '@eslint/core@0.17.0':
    resolution: {integrity: sha512-yL/sLrpmtDaFEiUj1osRP4TI2MDz1AddJL+jZ7KSqvBuliN4xqYY54IfdN8qD8Toa6g1iloph1fxQNkjOxrrpQ==}
    engines: {node: ^18.18.0 || ^20.9.0 || >=21.1.0}

  '@eslint/eslintrc@3.3.5':
    resolution: {integrity: sha512-4IlJx0X0qftVsN5E+/vGujTRIFtwuLbNsVUe7TO6zYPDR1O6nFwvwhIKEKSrl6dZchmYBITazxKoUYOjdtjlRg==}
    engines: {node: ^18.18.0 || ^20.9.0 || >=21.1.0}

  '@eslint/js@9.39.4':
    resolution: {integrity: sha512-nE7DEIchvtiFTwBw4Lfbu59PG+kCofhjsKaCWzxTpt4lfRjRMqG6uMBzKXuEcyXhOHoUp9riAm7/aWYGhXZ9cw==}
    engines: {node: ^18.18.0 || ^20.9.0 || >=21.1.0}

  '@eslint/object-schema@2.1.7':
    resolution: {integrity: sha512-VtAOaymWVfZcmZbp6E2mympDIHvyjXs/12LqWYjVw6qjrfF+VK+fyG33kChz3nnK+SU5/NeHOqrTEHS8sXO3OA==}
    engines: {node: ^18.18.0 || ^20.9.0 || >=21.1.0}

  '@eslint/plugin-kit@0.4.1':
    resolution: {integrity: sha512-43/qtrDUokr7LJqoF2c3+RInu/t4zfrpYdoSDfYyhg52rwLV6TnOvdG4fXm7IkSB3wErkcmJS9iEhjVtOSEjjA==}
    engines: {node: ^18.18.0 || ^20.9.0 || >=21.1.0}

  '@floating-ui/core@1.8.0':
    resolution: {integrity: sha512-0CIZ5itps/8x7BG8dEIhs53BvCUH2PCoogtakwRTut+Arm58sJooJ0AuZhLw2HJYIR5cMLNPBSS728sPho2khQ==}

  '@floating-ui/dom@1.8.0':
    resolution: {integrity: sha512-yXSrzeHZBTZadLOlfyhCkJHNeLJnHRnRInwdZ40L7ZiaAtrBwoYlsDrX3v5zB1Utk7CLfzcOVnVVWoXEky7Ceg==}

  '@floating-ui/react-dom@2.1.9':
    resolution: {integrity: sha512-JDjEFGCpImxDCA7JJKviA0M9+RtmJdj0m/NVU5IMgBK+AmZouAQQ7/+2GLH0GXXY0YMw9oXPB8hKdbPYg5QLYg==}
    peerDependencies:
      react: '>=16.8.0'
      react-dom: '>=16.8.0'

  '@floating-ui/utils@0.2.12':
    resolution: {integrity: sha512-HpCo8tmWzLVad5s2d19EhAz5zqrrQ6s69qd6moPMQvkOuSwDT1YgRfWSVuc4ennqrgv3OHppiOGMQ7oC13yIww==}

  '@hookform/resolvers@5.7.1':
    resolution: {integrity: sha512-8wS/P4UDr5sQDe4nFaV51TVyfDPrWgNIXweqG0Bs9Z5LSuzKLb+RQNPvkN2oHM5SRrJyWrVH/F+LOUcFjUyvwQ==}
    peerDependencies:
      '@sinclair/typebox': '>=0.25.24'
      '@standard-schema/spec': ^1.0.0
      '@typeschema/main': '>=0.13.7'
      '@vinejs/vine': ^2.0.0 || ^3.0.0 || ^4.0.0
      ajv: ^8.12.0
      ajv-errors: ^3.0.0
      ajv-formats: ^2.1.1
      arktype: ^2.0.0
      ata-validator: ^1.2.0
      class-transformer: '>=0.4.0'
      class-validator: '>=0.12.0'
      computed-types: ^1.0.0
      effect: ^3.10.3
      fluentvalidation-ts: ^3.0.0
      fp-ts: ^2.7.0
      io-ts: ^2.0.0
      joi: ^17.0.0
      nope-validator: '>=0.12.0'
      react-hook-form: ^7.55.0
      superstruct: '>=0.12.0'
      typanion: ^3.3.2
      valibot: '>=0.31.0 || ^1.0.0-beta.4 || ^1.0.0-rc'
      vest: '>=3.0.0'
      yup: ^1.0.0
      zod: ^3.25.0 || ^4.0.0
    peerDependenciesMeta:
      '@sinclair/typebox':
        optional: true
      '@standard-schema/spec':
        optional: true
      '@typeschema/main':
        optional: true
      '@vinejs/vine':
        optional: true
      ajv:
        optional: true
      ajv-errors:
        optional: true
      ajv-formats:
        optional: true
      arktype:
        optional: true
      ata-validator:
        optional: true
      class-transformer:
        optional: true
      class-validator:
        optional: true
      computed-types:
        optional: true
      effect:
        optional: true
      fluentvalidation-ts:
        optional: true
      fp-ts:
        optional: true
      io-ts:
        optional: true
      joi:
        optional: true
      nope-validator:
        optional: true
      superstruct:
        optional: true
      typanion:
        optional: true
      valibot:
        optional: true
      vest:
        optional: true
      yup:
        optional: true
      zod:
        optional: true

  '@humanfs/core@0.19.2':
    resolution: {integrity: sha512-UhXNm+CFMWcbChXywFwkmhqjs3PRCmcSa/hfBgLIb7oQ5HNb1wS0icWsGtSAUNgefHeI+eBrA8I1fxmbHsGdvA==}
    engines: {node: '>=18.18.0'}

  '@humanfs/node@0.16.8':
    resolution: {integrity: sha512-gE1eQNZ3R++kTzFUpdGlpmy8kDZD/MLyHqDwqjkVQI0JMdI1D51sy1H958PNXYkM2rAac7e5/CnIKZrHtPh3BQ==}
    engines: {node: '>=18.18.0'}

  '@humanfs/types@0.15.0':
    resolution: {integrity: sha512-ZZ1w0aoQkwuUuC7Yf+7sdeaNfqQiiLcSRbfI08oAxqLtpXQr9AIVX7Ay7HLDuiLYAaFPu8oBYNq/QIi9URHJ3Q==}
    engines: {node: '>=18.18.0'}

  '@humanwhocodes/module-importer@1.0.1':
    resolution: {integrity: sha512-bxveV4V8v5Yb4ncFTT3rPSgZBOpCkjfK0y4oVVVJwIuDVBRMDXrPyXRL988i5ap9m9bnyEEjWfm5WkBmtffLfA==}
    engines: {node: '>=12.22'}

  '@humanwhocodes/retry@0.4.3':
    resolution: {integrity: sha512-bV0Tgo9K4hfPCek+aMAn81RppFKv2ySDQeMoSZuvTASywNTnVJCArCZE2FWqpvIatKu7VMRLWlR1EazvVhDyhQ==}
    engines: {node: '>=18.18'}

  '@img/colour@1.1.0':
    resolution: {integrity: sha512-Td76q7j57o/tLVdgS746cYARfSyxk8iEfRxewL9h4OMzYhbW4TAcppl0mT4eyqXddh6L/jwoM75mo7ixa/pCeQ==}
    engines: {node: '>=18'}

  '@img/sharp-darwin-arm64@0.35.4':
    resolution: {integrity: sha512-Uhfl4V4lhP2nbUVF9+hyH1+luj86f1gUFeo8ALYxFoULoU+G87D43BfeMP8XHsk9boxAnCY/bf2EHwhA7MuGsA==}
    engines: {node: '>=20.9.0'}
    cpu: [arm64]
    os: [darwin]

  '@img/sharp-darwin-x64@0.35.4':
    resolution: {integrity: sha512-hWniXY3bG5qKpkKrAwPe4y+VTPmf086YQAnkxWh7uA1YrlRouWGa0M0Mxj3ZjnXFkv7/TD1bTy9lGUK26vRvWw==}
    engines: {node: '>=20.9.0'}
    cpu: [x64]
    os: [darwin]

  '@img/sharp-freebsd-wasm32@0.35.4':
    resolution: {integrity: sha512-lIsKw/BU+kjB4eZjxrYrZmwOJYi3Ajrv66iAlBmUPyKc3HpnloevB1g3wxGD9P/5BbQ1brBGl65VRRrCvQDEqA==}
    engines: {node: '>=20.9.0'}
    os: [freebsd]

  '@img/sharp-libvips-darwin-arm64@1.3.3':
    resolution: {integrity: sha512-suTBPTDGrI9WodccaDdwZItTSaBYASlBk1NSfElSHrUfzu3szG6lvIF58+WiFvnfzuK8ZBFS5zE00PxqxnRiPg==}
    cpu: [arm64]
    os: [darwin]

  '@img/sharp-libvips-darwin-x64@1.3.3':
    resolution: {integrity: sha512-FVJZ5mITMobmXIz/hPDTw0EintTW5H3WfrxwLqEqjiIihlu+hVRyGrFQ60xl0Lxn7Bt3zdpevPaQi0HEzqz9fw==}
    cpu: [x64]
    os: [darwin]

  '@img/sharp-libvips-linux-arm64@1.3.3':
    resolution: {integrity: sha512-0DaL0A6Xu6sQSQFwe4iVCrKWU2cCTItnRsYsCdxAMm9NF6twAA9BKnoqy4hqz4+azQ0JHuA26qiUKsf1XJ/v5A==}
    cpu: [arm64]
    os: [linux]
    libc: [glibc]

  '@img/sharp-libvips-linux-arm@1.3.3':
    resolution: {integrity: sha512-3rbU4vqXXc3hY/OiXdl52xZvT0F1yEngWfvqudtPJg/KkyiaQw2DRsFrNzpmLvfavbwOq3qXn36GP8obHRULQA==}
    cpu: [arm]
    os: [linux]
    libc: [glibc]

  '@img/sharp-libvips-linux-ppc64@1.3.3':
    resolution: {integrity: sha512-cdn1OvUBwsXhbC0zSzJnNzf5MZ/mTrobawDvNXBTxe8VtqKAm0sRuEY2Evzovb/w9JMk4TvRxqt1mekSuJz64w==}
    cpu: [ppc64]
    os: [linux]
    libc: [glibc]

  '@img/sharp-libvips-linux-riscv64@1.3.3':
    resolution: {integrity: sha512-HjPVx7yKz+0lqdhDlTw1tt90wamBoxhiXpvl1XZpJLiHH4RCJ5yDTqH+VlYPv2fwFs89JFw4c1IexYOcQUi4IQ==}
    cpu: [riscv64]
    os: [linux]
    libc: [glibc]

  '@img/sharp-libvips-linux-s390x@1.3.3':
    resolution: {integrity: sha512-neWLh+3yCNThxnfy3c4BbVBeGgt9aftno+XbT56iK28RgeDs3UOFWviLWlUu0bArYVYJaFDK+RRohbicUNCm8Q==}
    cpu: [s390x]
    os: [linux]
    libc: [glibc]

  '@img/sharp-libvips-linux-x64@1.3.3':
    resolution: {integrity: sha512-4vKmvAst9nrowcqquKFAyZJUDolUaIp8uRiN0mWFguJ1IplC9/pitXtlnnlU4aa/eJw3J7i67V+pwUL+wZGdsA==}
    cpu: [x64]
    os: [linux]
    libc: [glibc]

  '@img/sharp-libvips-linuxmusl-arm64@1.3.3':
    resolution: {integrity: sha512-Y9kQaLMuNoB0bPYOOdcZMaseNrFpPodIWWMrx+CZyydf2xn68j9WYc6sWWRrDwNkzCQjKYfc68L7jKjGlHMibw==}
    cpu: [arm64]
    os: [linux]
    libc: [musl]

  '@img/sharp-libvips-linuxmusl-x64@1.3.3':
    resolution: {integrity: sha512-fj8Mv0HHfD1Rr+4I68+3agJynxDWtBFgicTbSOb9Bke6pIwzGcJ+RX/yHjmiEGFMCavY/dxvem7MyNaJF+wDiw==}
    cpu: [x64]
    os: [linux]
    libc: [musl]

  '@img/sharp-linux-arm64@0.35.4':
    resolution: {integrity: sha512-De4jpEnAU8Hd5oT0j1G3uL4ZvTuipVMn7YC6vPaJhy6/7EwEae0SVAoBrUMYQbkLGDm85taVWwuPc1a44LTzCQ==}
    engines: {node: '>=20.9.0'}
    cpu: [arm64]
    os: [linux]
    libc: [glibc]

  '@img/sharp-linux-arm@0.35.4':
    resolution: {integrity: sha512-7OAS8gI0EReKGVN2HssHlM6umJgxF5VI3xN0p9FA91p/YO+ou5hiNghLdZ5BEHztwaaK5+bLKRf8x/o2L2nk9A==}
    engines: {node: '>=20.9.0'}
    cpu: [arm]
    os: [linux]
    libc: [glibc]

  '@img/sharp-linux-ppc64@0.35.4':
    resolution: {integrity: sha512-2oYZJeIl4kCcMGk4ouZVjnkCtFrpQFlNEtJ6GbxzhHQchwH0NH/qEb9ykmOl29dqwMq+JhFdZn+1ak2FKhI9fQ==}
    engines: {node: '>=20.9.0'}
    cpu: [ppc64]
    os: [linux]
    libc: [glibc]

  '@img/sharp-linux-riscv64@0.35.4':
    resolution: {integrity: sha512-cPbNChoRURAWdebDIHSenxRpgEdy7JkPydSnUxRm9VvKD7m0/xVaR/8Fzlu81pk5nHEvHH87UZUA7cTtwnbJSA==}
    engines: {node: '>=20.9.0'}
    cpu: [riscv64]
    os: [linux]
    libc: [glibc]

  '@img/sharp-linux-s390x@0.35.4':
    resolution: {integrity: sha512-RY0JFY8Fd6RonCBtHz+DvadaPkXDSI1AUn6yWL9TipqkZ1vY8w8evqdgyDFnkm4/K1ve1TvZiaePP5oSd4+WVQ==}
    engines: {node: '>=20.9.0'}
    cpu: [s390x]
    os: [linux]
    libc: [glibc]

  '@img/sharp-linux-x64@0.35.4':
    resolution: {integrity: sha512-9qvvEAuk8k89TfWUoX2htWjbAMX8p+NxCppjpcg5k6xMsjhBQPTsoIh36h9Qde4WRuGpJeYnOjdosDn/cnv+OA==}
    engines: {node: '>=20.9.0'}
    cpu: [x64]
    os: [linux]
    libc: [glibc]

  '@img/sharp-linuxmusl-arm64@0.35.4':
    resolution: {integrity: sha512-KB5jxpfWQTr0nc3xdHtWChdbifHrBGsd2SM62Eyxrl8afikm+f5qGBU75SJIZBT/S1MC8XyacdlXBMSWq6OURA==}
    engines: {node: '>=20.9.0'}
    cpu: [arm64]
    os: [linux]
    libc: [musl]

  '@img/sharp-linuxmusl-x64@0.35.4':
    resolution: {integrity: sha512-f+eZJZIQNEEd26RPSW+76chwOf1XtA2Y/O+5ocVyLliHkeih3e+jhLVBdNTd2rS3IbNXK8+ug93Vf5ZXtF5Lxg==}
    engines: {node: '>=20.9.0'}
    cpu: [x64]
    os: [linux]
    libc: [musl]

  '@img/sharp-wasm32@0.35.4':
    resolution: {integrity: sha512-zQnl4Kwp7Q6NHsENtU2T/00Zi+w3AQNwz3+UaTyVBy2FpXrzXzGjndpK61onhZjRtRpQXxCTeqw19bVyXOh7jA==}
    engines: {node: '>=20.9.0'}

  '@img/sharp-webcontainers-wasm32@0.35.4':
    resolution: {integrity: sha512-ESfNkywmCfPNyaZjxooddJQiQ+l/nTpGEOGthxiLnIHXC/CmcBixnfwUleX9mCz9ovrUUvKMap/pm8RYbzfwaA==}
    engines: {node: '>=20.9.0'}
    cpu: [wasm32]

  '@img/sharp-win32-arm64@0.35.4':
    resolution: {integrity: sha512-iNdlBX9gLVvqe2I3uIJSIKTq6wckP/DYxZtcqxm09x5Gi24DnFBmPAWZmr60ZyYMG0xlzo6goG3670ar+RXvRw==}
    engines: {node: '>=20.9.0'}
    cpu: [arm64]
    os: [win32]

  '@img/sharp-win32-ia32@0.35.4':
    resolution: {integrity: sha512-kqRsbaa5CS6KHlpxnN7WhE6vAAugXyZButpRdvDWetlv6Qv4N9WTcrWzF7tXfB9T7MsoadqdI8hmwLq6UlLvtw==}
    engines: {node: ^20.9.0}
    cpu: [ia32]
    os: [win32]

  '@img/sharp-win32-x64@0.35.4':
    resolution: {integrity: sha512-XtmnYhBcrORsJ4XJngyzr/EWP0hRZLAZRFaApdKuviyqF78+ylxh2y06ZmtULAMOnObJ3ucpN0AcwSWnMowTRg==}
    engines: {node: '>=20.9.0'}
    cpu: [x64]
    os: [win32]

  '@jridgewell/gen-mapping@0.3.13':
    resolution: {integrity: sha512-2kkt/7niJ6MgEPxF0bYdQ6etZaA+fQvDcLKckhy1yIQOzaoKjBBjSj63/aLVjYE3qhRt5dvM+uUyfCg6UKCBbA==}

  '@jridgewell/remapping@2.3.5':
    resolution: {integrity: sha512-LI9u/+laYG4Ds1TDKSJW2YPrIlcVYOwi2fUC6xB43lueCjgxV4lffOCZCtYFiH6TNOX+tQKXx97T4IKHbhyHEQ==}

  '@jridgewell/resolve-uri@3.1.2':
    resolution: {integrity: sha512-bRISgCIjP20/tbWSPWMEi54QVPRZExkuD9lJL+UIxUKtwVJA8wW1Trb1jMs1RFXo1CBTNZ/5hpC9QvmKWdopKw==}
    engines: {node: '>=6.0.0'}

  '@jridgewell/source-map@0.3.11':
    resolution: {integrity: sha512-ZMp1V8ZFcPG5dIWnQLr3NSI1MiCU7UETdS/A0G8V/XWHvJv3ZsFqutJn1Y5RPmAPX6F3BiE397OqveU/9NCuIA==}

  '@jridgewell/sourcemap-codec@1.5.5':
    resolution: {integrity: sha512-cYQ9310grqxueWbl+WuIUIaiUaDcj7WOq5fVhEljNVgRfOUhY9fy2zTvfoqWsnebh8Sl70VScFbICvJnLKB0Og==}

  '@jridgewell/trace-mapping@0.3.31':
    resolution: {integrity: sha512-zzNR+SdQSDJzc8joaeP8QQoCQr8NuYx2dIIytl1QeBEZHJ9uW6hebsrYgbz8hJwUQao3TWCMtmfV8Nu1twOLAw==}

  '@jridgewell/trace-mapping@0.3.9':
    resolution: {integrity: sha512-3Belt6tdc8bPgAtbcmdtNJlirVoTmEb5e2gC94PnkwEW9jI6CAHUeoG85tjWP5WquqfavoMtMwiG4P926ZKKuQ==}

  '@napi-rs/wasm-runtime@0.2.12':
    resolution: {integrity: sha512-ZVWUcfwY4E/yPitQJl481FjFo3K22D6qF0DuFH6Y/nbnE11GY5uguDxZMGXPQ8WQ0128MXQD7TnfHyK4oWoIJQ==}

  '@napi-rs/wasm-runtime@1.1.4':
    resolution: {integrity: sha512-3NQNNgA1YSlJb/kMH1ildASP9HW7/7kYnRI2szWJaofaS1hWmbGI4H+d3+22aGzXXN9IJ+n+GiFVcGipJP18ow==}
    peerDependencies:
      '@emnapi/core': ^1.7.1
      '@emnapi/runtime': ^1.7.1

  '@next/env@16.3.4':
    resolution: {integrity: sha512-cjWZnUUa6jZq2kFaNe/ZyJdZonOZ/QoN0Zka2nz/FLOrfx14pQuM9c5RaSVkWMqgdt4ksgPAMWPyHSs/CyV48Q==}

  '@next/eslint-plugin-next@16.3.4':
    resolution: {integrity: sha512-szW9y2Aumu4z88YXfTzcFsgUAg2k64uzbtcO5L9f1AKS4w/GUKJcbFllRflROVyNPgJtGOnvNxiyp3v6b+prIA==}

  '@next/swc-darwin-arm64@16.3.4':
    resolution: {integrity: sha512-iBr3I5LZNk5/bgl5//iTgD2tcym14MX0Xo7fD//u9dYAEgGzza1y9oywluPtf74YnOswVdH1908aK9xVz7zQTw==}
    engines: {node: '>= 10'}
    cpu: [arm64]
    os: [darwin]

  '@next/swc-darwin-x64@16.3.4':
    resolution: {integrity: sha512-2dpiSyl2Jw/NrBPaU2MAKGSa+2MR82pJIn4Sm5Rjr+gxAeuh0z158Su3Z2O8zn7UNNq+ej4bToed6RcRN/Lydg==}
    engines: {node: '>= 10'}
    cpu: [x64]
    os: [darwin]

  '@next/swc-linux-arm64-gnu@16.3.4':
    resolution: {integrity: sha512-+t+U8HZT+fApePCS5h89CSH3datz29MkzyfCn+6fpsZBG/oiEOhINcb9rtkv6sdpToLGFn2e6146NzaKCXkqrA==}
    engines: {node: '>= 10'}
    cpu: [arm64]
    os: [linux]
    libc: [glibc]

  '@next/swc-linux-arm64-musl@16.3.4':
    resolution: {integrity: sha512-mx03GNs1ocQA5JQ4FxDMmIsNkdrZh8cuezKCrId28e5/gIPU/l7Kcy2+vmCCzdjnnmXJy+iOAu+7K0QppO6Urg==}
    engines: {node: '>= 10'}
    cpu: [arm64]
    os: [linux]
    libc: [musl]

  '@next/swc-linux-x64-gnu@16.3.4':
    resolution: {integrity: sha512-YIhGY6fSMfha52bnVxnzc9zaVBzJg+cqQTOD8tXIBSx4fuv0pVMxQTE0PaS59YhnMOiYiG09IMwxJAf/CFm/Dw==}
    engines: {node: '>= 10'}
    cpu: [x64]
    os: [linux]
    libc: [glibc]

  '@next/swc-linux-x64-musl@16.3.4':
    resolution: {integrity: sha512-+eaaX6axpDb0yF1GCpiERe6njplvdC+nks/fKfcHu3XPGRrald8P3/X7yv7QLdjA51knnxwl9pxdIJsg+w1L+Q==}
    engines: {node: '>= 10'}
    cpu: [x64]
    os: [linux]
    libc: [musl]

  '@next/swc-win32-arm64-msvc@16.3.4':
    resolution: {integrity: sha512-0jcXW7Xs/uzICrmgV3MhDYDeRy++1CqnpDIerlPIqYO4bhzB4WNbX/aRnQclustsAyTkFKB0z6rbcjmNg5tR8A==}
    engines: {node: '>= 10'}
    cpu: [arm64]
    os: [win32]

  '@next/swc-win32-x64-msvc@16.3.4':
    resolution: {integrity: sha512-vvBzwu1pYQCp92maZCFCIw/XgOTMR5tur9GjakwIo2cmwRTMKajRZZDS9+e4KsUZWKu1E007WUeAFXRRjZeuzw==}
    engines: {node: '>= 10'}
    cpu: [x64]
    os: [win32]

  '@nodelib/fs.scandir@2.1.5':
    resolution: {integrity: sha512-vq24Bq3ym5HEQm2NKCr3yXDwjc7vTsEThRDnkp2DK9p1uqLR+DHurm/NOTo0KG7HYHU7eppKZj3MyqYuMBf62g==}
    engines: {node: '>= 8'}

  '@nodelib/fs.stat@2.0.5':
    resolution: {integrity: sha512-RkhPPp2zrqDAQA/2jNhnztcPAlv64XdhIp7a7454A5ovI7Bukxgt7MX7udwAu3zg1DcpPU0rz3VV1SeaqvY4+A==}
    engines: {node: '>= 8'}

  '@nodelib/fs.walk@1.2.8':
    resolution: {integrity: sha512-oGB+UxlgWcgQkgwo8GcEGwemoTFt3FIO9ababBmaGwXIoBKZ+GTy0pP185beGg7Llih/NSHSV2XAs1lnznocSg==}
    engines: {node: '>= 8'}

  '@nolyfill/is-core-module@1.0.39':
    resolution: {integrity: sha512-nn5ozdjYQpUCZlWGuxcJY/KpxkWQs4DcbMCmKojjyrYDEAGy4Ce19NN4v5MduafTwJlbKc99UA8YhSVqq9yPZA==}
    engines: {node: '>=12.4.0'}

  '@oxc-project/types@0.130.0':
    resolution: {integrity: sha512-ibD2usx9JRu7f5pu2tMKMI4cpA4NgXJQoYRP4pQ7Pxmn1l6k/53qWtQWZayhYy3X4QZkt90Ot+mJEaeXouio6Q==}

  '@poppinss/colors@4.1.6':
    resolution: {integrity: sha512-H9xkIdFswbS8n1d6vmRd8+c10t2Qe+rZITbbDHHkQixH5+2x1FDGmi/0K+WgWiqQFKPSlIYB7jlH6Kpfn6Fleg==}

  '@poppinss/dumper@0.6.5':
    resolution: {integrity: sha512-NBdYIb90J7LfOI32dOewKI1r7wnkiH6m920puQ3qHUeZkxNkQiFnXVWoE6YtFSv6QOiPPf7ys6i+HWWecDz7sw==}

  '@poppinss/exception@1.2.3':
    resolution: {integrity: sha512-dCED+QRChTVatE9ibtoaxc+WkdzOSjYTKi/+uacHWIsfodVfpsueo3+DKpgU5Px8qXjgmXkSvhXvSCz3fnP9lw==}

  '@radix-ui/number@1.1.3':
    resolution: {integrity: sha512-Road2bidD0uu/1BGDOWNdPI06g0lIRy6IF9GZcIrDK2KGItfor8IQwQa+yM2ERgHM1MmHxaxpTzk0/Jp42lNfA==}

  '@radix-ui/primitive@1.1.7':
    resolution: {integrity: sha512-rqWnm76nYT8HoNNqEjpgJ7Pw/DrBj5iBTrmEPo6HTX5+VJyBNOqTdv4g89G63HuR5g0AaENoAcH7Is5fF2kZ8Q==}

  '@radix-ui/react-accessible-icon@1.1.15':
    resolution: {integrity: sha512-WTQwcAvQf5sOcuUyi90lKPbhwcvQ+j55cjrSmeaN+L2vKU3DooOvlKw2MDeiJ5IkV5N905KW0/fGojKOBhD11A==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-accordion@1.2.20':
    resolution: {integrity: sha512-jDhG9FvAEnlhnjrsINbNXcUa4G+L1KqSkJSunkbKEzFRcAb52jvM0PjPxPRvhe1HNc5F5yc0yzzWeeqlH4yBIg==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-alert-dialog@1.1.23':
    resolution: {integrity: sha512-VAYOiQRqj3GPpYJE0I9J+X8Ip05cyVlNdKOFeiGS2Ou1HHGfpl0BxOyZm6nmVDyU+W+NF3/XLzmjHmVGydhwgA==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-arrow@1.1.15':
    resolution: {integrity: sha512-v4zggRcjadnI+ClKDuijlQEW4tw3NoaeHc/PwpKnLoLLKNUG4InLegkstooLcRIUWCs+8L22dGURCVuFfOKfnA==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-aspect-ratio@1.1.15':
    resolution: {integrity: sha512-fy+dyVR+90nelK8rqIznFlxzx7uPcGbhxH8Nfr2bHb4UfSe+e3hklOC0luK0hDwVwnRX7xTRySpsrQVeW+/oNQ==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-avatar@1.2.6':
    resolution: {integrity: sha512-4ULOTJ/mqy2hT9GlWa/MFHxHSvH3nJzHnZM1waNsc5Bonv7i70aNenghXmD97S6OJ81ekXONGGt4nT1r0PfEdA==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-checkbox@1.3.11':
    resolution: {integrity: sha512-Gnptr9pDDQxD3hgq2dtPbtrp/c2qH1mBwIzw3X/ivrMb2e1t0jMTi606fVEqFPaQR1ggXIVQWKj3P2WW9v7zGQ==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-collapsible@1.1.20':
    resolution: {integrity: sha512-mcGesGplBnzN2sbvJETzpCNfSMyPnb29q1GRLU+Ib7bJrpIG2ywmRoh2V5VbA2uNvKikKUlVbAPks7JDjz4A8Q==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-collection@1.1.15':
    resolution: {integrity: sha512-9W+B9NPF0NaaPh/1NJd3+KqsnlLqU9H7T2rvww+fp+T/evVXdNAyYcnfRQZFOjkR1ajQp3yORlqnI8soawLvNA==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-compose-refs@1.1.5':
    resolution: {integrity: sha512-+48PbAAbq3didjJxa+OaWY2ZwgAKsNiRGyeHKszblZMQ+kcpd9pAaT11cMkGEie0vsOi3QdeTE6d5Fe3Gn61kA==}
    peerDependencies:
      '@types/react': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true

  '@radix-ui/react-context-menu@2.3.7':
    resolution: {integrity: sha512-CtXP35dxaB5T3zXSd+E3uHe/QpXcpYnZmxp6OaIbfthtfW4wyb77M23BG+bwIJDtsMwEP/YssdsmNyZu7jhWew==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-context@1.2.2':
    resolution: {integrity: sha512-RHCUGwKHDr0hDGg4X7ma4JG4/+12qxw8rkh5QKdDldlCvtja6nUx1Ef/8HVrJze81lEsgLQlqjzjGNHantgnQA==}
    peerDependencies:
      '@types/react': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true

  '@radix-ui/react-dialog@1.1.23':
    resolution: {integrity: sha512-Ksw4WeROkO4rC9k/onilX/Ao2Cr1ku1unMNH+XSCcP4jSXYu7HDsg9n4ojMjVb22XpYjAQ9qfrFlVbru1vXDUA==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-direction@1.1.4':
    resolution: {integrity: sha512-5pzg4FGQNpExhnhT2zlrP1wZFaYCd1K0nYWoFAdcYoYK868IEigqMX3B3f8yIoRlAhAeDWciLI6ZdCKHF9P4Vg==}
    peerDependencies:
      '@types/react': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true

  '@radix-ui/react-dismissable-layer@1.1.19':
    resolution: {integrity: sha512-8g4pfOL9HoKKLWGiypT+dphVqjFfmcXO5GBnhsG6zI+lxAx/8feQpr+1LSN8Re3hiZ+XkLNS4O9ztK11/LzQ6w==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-dropdown-menu@2.1.24':
    resolution: {integrity: sha512-geq8l2rJkxvkXsT9RMgtUE3P8pITFpTsvYpbySi1IH4fZEABD/Gp85myayFgxk0ktljGMJnCbeFkyTusvSvv7g==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-focus-guards@1.1.6':
    resolution: {integrity: sha512-RNOJjfZMTyBM6xYmV3IVGXkPjIhcBAuv48POevAXwrGJhkWZ9p1rFoIS1JFooPuT193AZmRsCPhpoVJxx6OPoQ==}
    peerDependencies:
      '@types/react': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true

  '@radix-ui/react-focus-scope@1.1.16':
    resolution: {integrity: sha512-wmRZ2WWLvmt6KHy2rNPOdPUjwq5xOHY02+m+udwJTn0aNIox/rkskAvJTyTLGhPK6KgrUjlJUJpgmx/+wFiFIQ==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-form@0.1.16':
    resolution: {integrity: sha512-Q4TLEn2A7TAypxwmd6R9EwrlXDvkfYSDMrq9/887AXAGh+G1rH+kYJKSTv+Si9Y0JPKTwKYv6PviAJosysNimA==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-hover-card@1.1.23':
    resolution: {integrity: sha512-H8qONfZd3ltrU3+jHCIgITbWo6e1iTKvP9DHdrvYbX48ooRM5FjEDTn16AMwdfuOGkWdZEhpl3PLL/Wk/AnHDQ==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-id@1.1.4':
    resolution: {integrity: sha512-TMQp2llA+RYn7JcjnrMnz7wN4pcVttPZnRZo52PLQsoLVKzNlVwUeHmfePgTgRluXFvlD3GD5g5MOVVTJCO0qA==}
    peerDependencies:
      '@types/react': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true

  '@radix-ui/react-label@2.1.15':
    resolution: {integrity: sha512-o/rdYEwZTTo5tjknnPeyQFU45kUC4i/XyeDPP+HGyi6XqpOP6Zf5Ya5vh/Yfe9Id5JiuWnnAx2XqIeD3UYZt0g==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-menu@2.1.24':
    resolution: {integrity: sha512-uW7RVuU6Lp/ZtfeY4b3kL32zccgEWvPv1+cf17ubYzHa9cL8AHokmk36cG/XEiH/smbQvumnieXX9j/e9RqJWA==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-menubar@1.1.24':
    resolution: {integrity: sha512-eeVs0vf7cuqXaM0qLQCPcufImiJNVBXdJDLu7ZGYl2732UH23Qat/foNGrr6vYV3/DdTsBqASoggUFgH14OcZA==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-navigation-menu@1.2.22':
    resolution: {integrity: sha512-ou7iLEJ+yrhQndkkA4U21XIdS/CS45F4iXIkTZcb6/Ne9EMsOuDudVmCwmDnfFZZ+y1FZqXRNSIgBy+YMvZVZg==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-one-time-password-field@0.1.16':
    resolution: {integrity: sha512-Tj9P6ntAJEw52oq/F0AGknXR4XncxEt7XU47O3xJQOiWfLzEy3d9gtgKfvjSzGxzHkfL+VzvxGu2KTFsloJqXw==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-password-toggle-field@0.1.11':
    resolution: {integrity: sha512-4gvFnmDXu3dgj21CqsufzIameRvlRd4SBqaWhcrlrNhRo0Y5i/49AmRJYe1fdAM3G2VNBbmin4b0D6cdQocwgw==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-popover@1.1.23':
    resolution: {integrity: sha512-mw58MrBlyHWFisTOYignD0vf/3gdcgAR+9of1s9G/38CbFiUwH1nCDkc0AUM9IrXFgN5Ue8n45j9WCgyM1sbiQ==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-popper@1.3.7':
    resolution: {integrity: sha512-UsJrrd7w4wuKKTdvd/DNERVlwSlUcyXzjhyDwBk+3aPOsCjOY6ZSbxuw8E6lZTjjfP8Cpd0J8VVkrYUWyGYXyg==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-portal@1.1.17':
    resolution: {integrity: sha512-vKQLcWypUnwZVvfV7UkGahH2g6ySe8M8R+zYBwPrv5byZ9QAW6cQVvNKo7GgmD+p8aYb6D9JBuvy8/WhOno2wQ==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-presence@1.1.10':
    resolution: {integrity: sha512-3wyzCQ6+ubRA+D4uv9m95JYLXxmOHp05qjrkjeA7uKHHtjpPggQzc6DAb0URl7j67oR0K2foO4ip27TiX037Bw==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-primitive@2.1.10':
    resolution: {integrity: sha512-MucOnzh6hR5mid6VpkbglRAMYMjKLqRnGBbjXkzjK52fuQDd1qbkx78a5P40mkcnVXJdEVxm26E9OPAiUq7nBg==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-progress@1.1.16':
    resolution: {integrity: sha512-5XnomAsoZZCY+KNTxbIghpGqPruZvKFNlvcAljVAOdDRDsH4/OZQxhtwo5wdtoDM5R6MhJBb2sPnDuRFep3lzg==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-radio-group@1.4.7':
    resolution: {integrity: sha512-cgYFEkntCxppHZgtSZ+7vh0wbZQ+IC7PPMw8DSnRG27B6kDd32/Zw0OJt7dGDigCoprMuWHjg2PvUn3PYvPFoQ==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-roving-focus@1.1.19':
    resolution: {integrity: sha512-V9jI6hDjT7l3jsCQD9bLNvDLM3tH/gdbOTp7Tefp3hbbgCGQoK7tUvrWiRlcoBHIZ809ElXwNQwVo0B98LuTXQ==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-scroll-area@1.2.18':
    resolution: {integrity: sha512-Zn5Cd171wxsO3Dfg8HaW6RifTb9CYTKQJHs/G4+LN1GfmJpaQMZQyQxMprVPHpaz7QY4l9BxK2JwQuzHsXC8nA==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-select@2.3.7':
    resolution: {integrity: sha512-WFGImkmbzcfxeIwq/+4HvRN0pizBwbwQUED4I13ezQsDdfl38ZntN6TmR8XaSzPBqoCToe8rF75j6NPNDSzhbg==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-separator@1.1.15':
    resolution: {integrity: sha512-jOLO4lssEzWpoDu7G+Ze4VjwMRUBt291pnZD0gmalREZipnTX3wadQo7Fy48GCTfe14/YRN6rw/rOJqrE85Wxw==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-slider@1.4.7':
    resolution: {integrity: sha512-mTSLf1GC/C0moWjTbvCM6Qn/gBjvlFt1azuWF2v7MN5C3Zq2U2J2lN3ZEYkpujuOU5Ro7A28wkviSxaKnG0BYg==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-slot@1.3.3':
    resolution: {integrity: sha512-qx7oqnYbxnK9kYI9m317qmFmEgo6ywqWvbTogdj7cL9p3/yx4M48p7Rnw5z3H890cL/ow/EeWJsuTykeZVXP5Q==}
    peerDependencies:
      '@types/react': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true

  '@radix-ui/react-switch@1.3.7':
    resolution: {integrity: sha512-48tB/4dn2UVLBCYhTu9AuR63IHl73l/qLbLgxd86noTUor4/K4LFDAcYjK+isP5313qxaFpjPVogE7+Y0/V3Kw==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-tabs@1.1.21':
    resolution: {integrity: sha512-UKxJlZid7FVtsk/WTxj4i4uSEgj2Au+KBbS7SQyTlzMhhn+86Cz3tISZdTa87bfEfcuvZezf2ZsxD4xuEKtkog==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-toast@1.2.23':
    resolution: {integrity: sha512-ofhyAsYaocRGOs/n0XWdUOSVzEAG6BfrMVM8z0c0kLEWY38w/0WuMFPTJP/HVaZPYkMvHZoKIIhNcjbTCBILPg==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-toggle-group@1.1.19':
    resolution: {integrity: sha512-OtnwuSVjd1Ofi+AdnvhsjQdyuhCDwYs1w9RyB5BN/OavXOVQo42SYqQjwUnbPnaiPFBpQ9aX70dWeee+v2oBLA==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-toggle@1.1.18':
    resolution: {integrity: sha512-7lonPlKfSacd20GlOBx2ltuVKz9oqWYZz+oMQyOltw6t1y2nyftj2ZmwwUHYn49kqfDWcp8dNZm5NgV+5Z+mug==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-toolbar@1.1.19':
    resolution: {integrity: sha512-Ph0IvtYw4VB12ZnZg+YtrGs8yJQsnizwo/zu0R4Y/nWugtJzA7Pg1eWeuDR9+LSqn+xjamss+UOSOJJJ4gx8jw==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-tooltip@1.2.16':
    resolution: {integrity: sha512-6EamKFRRnlpdadndbZ6LMwycfwkwPte1B42hs6QA0gYhjaOKqW4PZ4pjaW9UrlDX5eVt/OjncE7BFTPL5nmZhg==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-use-callback-ref@1.1.4':
    resolution: {integrity: sha512-R6OUY2e2fA6Yn6s+VSx5KBV6Nx8LQEhu+cz7LCej18rQ1HLyg9PSC9jP/ZNx0o6FAIK9c0F1kHylzSxKsdlkrQ==}
    peerDependencies:
      '@types/react': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true

  '@radix-ui/react-use-controllable-state@1.2.6':
    resolution: {integrity: sha512-uEQJGT97ZA/TgP/Hydw47lHu+/vQj6z/0jA+WeTbK1o9Rx45GImjpD0tc3W5ad3D6XTSR6e1yEO0FvGq6WQfVQ==}
    peerDependencies:
      '@types/react': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true

  '@radix-ui/react-use-effect-event@0.0.5':
    resolution: {integrity: sha512-7cshFL8HGS/7HEiHH+9kL9HBwp2sa9yX18Knwek6KYWmXwM7pegMgta2AXMQKI+rq3JnfSj9x8wYqFMTdG1Jgg==}
    peerDependencies:
      '@types/react': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true

  '@radix-ui/react-use-escape-keydown@1.1.5':
    resolution: {integrity: sha512-ge3ipobwSXTj4JyVtswQ7qZj0ZHdtbGuOno/LrgAAeSxtsJ6Vs4Gz5IkPH2bmqpjcLUFoqGhA/mueuIf63UXlA==}
    peerDependencies:
      '@types/react': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true

  '@radix-ui/react-use-is-hydrated@0.1.3':
    resolution: {integrity: sha512-umO/aJ+82CpOnhDZUTbILCQf7kU/g0iv+oGs/Q8jw7IkhWBzaEP4sA268PhFAJTFetbwp3ICc6ktpI4TqtxcIw==}
    peerDependencies:
      '@types/react': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true

  '@radix-ui/react-use-layout-effect@1.1.4':
    resolution: {integrity: sha512-K20DkRkUwDnxEYMBPcg3Y6voLkEy5p5QQmszZgLngKKiC7dzBR/aEuK3w1qlx2JWDUNH6FluahYdgR3BP+QbYw==}
    peerDependencies:
      '@types/react': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true

  '@radix-ui/react-use-previous@1.1.4':
    resolution: {integrity: sha512-XoSLhbRbqxFtgJoi2fNHA3C6pDlY34x508vUpUGoFZfvePfHXHbE1lC4FYFMnJWgiCRroSTw6fOsXQoVS9RwZg==}
    peerDependencies:
      '@types/react': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true

  '@radix-ui/react-use-rect@1.1.4':
    resolution: {integrity: sha512-cSOCh6JlkmfjLyNcLiu2nB4v+nm+dkZ+Q5KHWk/soo4U7ZLiEQFKHK9/YmtBHjfCEaU43IBKQOc4/uJmCaiCTQ==}
    peerDependencies:
      '@types/react': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true

  '@radix-ui/react-use-size@1.1.4':
    resolution: {integrity: sha512-D3anSY15EJoxrihpsXI6SMrmmonnQtR2ni7arO+Lfdg3O95b9hNXxONk8jA5C8ANdF/h5HMAxejgs8PWJ6rlhw==}
    peerDependencies:
      '@types/react': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true

  '@radix-ui/react-visually-hidden@1.2.11':
    resolution: {integrity: sha512-NFS86RYYZb4/exihaESBGOpMJFz8MGLAfu3mOBSGByVnVPC9JPASfYubxd/8KbkQK0sYAv8lVQDEQukDX/qXvQ==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/rect@1.1.3':
    resolution: {integrity: sha512-JtyZR+mqgBibTo8xea3B6ZRmzZiM/YeVBtUkas6zMuXjAlfIFIW2FgqeM9eLyvEaYX66vr6DJMK+4U6LV0KhNw==}

  '@reduxjs/toolkit@2.12.0':
    resolution: {integrity: sha512-KiT+RzZbp6mQET+Mg+h2c97+9j1sNflUxQkIHI7Yuzf6Peu+OYpmkn6nbHWmLLWj+1ZODUJFwGZ7gx3L9R9EOw==}
    peerDependencies:
      react: ^16.9.0 || ^17.0.0 || ^18 || ^19
      react-redux: ^7.2.1 || ^8.1.3 || ^9.0.0
    peerDependenciesMeta:
      react:
        optional: true
      react-redux:
        optional: true

  '@resvg/resvg-wasm@2.4.0':
    resolution: {integrity: sha512-C7c51Nn4yTxXFKvgh2txJFNweaVcfUPQxwEUFw4aWsCmfiBDJsTSwviIF8EcwjQ6k8bPyMWCl1vw4BdxE569Cg==}
    engines: {node: '>= 10'}

  '@rolldown/binding-android-arm64@1.0.1':
    resolution: {integrity: sha512-fJI3I0r3C3Oj/zdBCpaCmBRZYf07xpaq4yCfDDoSFm+beWNzbIl26puW8RraUdugoJw/95zerNOn6jasAhzSmg==}
    engines: {node: ^20.19.0 || >=22.12.0}
    cpu: [arm64]
    os: [android]

  '@rolldown/binding-darwin-arm64@1.0.1':
    resolution: {integrity: sha512-cKnAhWEsV7TPcA/5EAteDp6KcJZBQ2G+BqE7zayMMi7kMvwRsbv7WT9aOnn0WNl4SKEIf43vjS31iUPu80nzXg==}
    engines: {node: ^20.19.0 || >=22.12.0}
    cpu: [arm64]
    os: [darwin]

  '@rolldown/binding-darwin-x64@1.0.1':
    resolution: {integrity: sha512-YKrVwQjIRBPo+5G/u03wGjbdy4q7pyzCe93DK9VJ7zkVmeg8LJ7GbgsiHWdR4xSoe4CAXRD7Bcjgbtr64bkXNg==}
    engines: {node: ^20.19.0 || >=22.12.0}
    cpu: [x64]
    os: [darwin]

  '@rolldown/binding-freebsd-x64@1.0.1':
    resolution: {integrity: sha512-z/oBsREo46SsFqBwYtFe0kpJeBijAT48O/WXLI4suiCLBkr03RTtTJMCzSdDd2znlh8VJizL09XVkQgk8IZonw==}
    engines: {node: ^20.19.0 || >=22.12.0}
    cpu: [x64]
    os: [freebsd]

  '@rolldown/binding-linux-arm-gnueabihf@1.0.1':
    resolution: {integrity: sha512-ik8q7GM11zxvYxFc2PeDcT6TBvhCQMaUxfph/M5l9sKuTs/Sjg3L+Byw0F7w0ZVLBZmx30P+gG0ECzzN+MFcmQ==}
    engines: {node: ^20.19.0 || >=22.12.0}
    cpu: [arm]
    os: [linux]

  '@rolldown/binding-linux-arm64-gnu@1.0.1':
    resolution: {integrity: sha512-QoSx2EkyrrdZ6kcyE8stqZ62t0Yra8Fs5ia9lOxJrh6TMQJK7gQKmscdTHf7pOXKREKrVwOtJcQG3qVSfc866A==}
    engines: {node: ^20.19.0 || >=22.12.0}
    cpu: [arm64]
    os: [linux]
    libc: [glibc]

  '@rolldown/binding-linux-arm64-musl@1.0.1':
    resolution: {integrity: sha512-uwNwFpwKeNiZawfAWBgg0VIztPTV3ihhh1vV334h9ivnNLorxnQMU6Fz8wG1Zb4Qh9LC1/MkcyT3YlDXG3Rsgg==}
    engines: {node: ^20.19.0 || >=22.12.0}
    cpu: [arm64]
    os: [linux]
    libc: [musl]

  '@rolldown/binding-linux-ppc64-gnu@1.0.1':
    resolution: {integrity: sha512-zY1bul7OWr7DFBiJ++wofXvnr8B45ce3QsQUhKrIhXsygAh7bTkwyeM1bi1a2g5C/yC/N8TZyGDEoMfm/l9mpg==}
    engines: {node: ^20.19.0 || >=22.12.0}
    cpu: [ppc64]
    os: [linux]
    libc: [glibc]

  '@rolldown/binding-linux-s390x-gnu@1.0.1':
    resolution: {integrity: sha512-0frlsT/f4Ft6I7SMESTKnF3cZsdicQn1dCMkF/jT9wDLE+gGoiQfv1nmT9e+s7s/fekvvy6tZM2jHvI2tkbJDQ==}
    engines: {node: ^20.19.0 || >=22.12.0}
    cpu: [s390x]
    os: [linux]
    libc: [glibc]

  '@rolldown/binding-linux-x64-gnu@1.0.1':
    resolution: {integrity: sha512-XABVmGp9Tg0WspTVvwduTc4fpqy6JnAUrSQe6OuyqD/03nI7r0O9OWUkMIwFrjKAIqolvqoA4ZrJppgwE0Gxmw==}
    engines: {node: ^20.19.0 || >=22.12.0}
    cpu: [x64]
    os: [linux]
    libc: [glibc]

  '@rolldown/binding-linux-x64-musl@1.0.1':
    resolution: {integrity: sha512-bV4fzswuzVcKD90o/VM6QqKxnxlDq0g2BISDLNVmxrnhpv1DDbyPhCIjYfvzYLV+MvkKKnQt2Q6AO86SEBULUQ==}
    engines: {node: ^20.19.0 || >=22.12.0}
    cpu: [x64]
    os: [linux]
    libc: [musl]

  '@rolldown/binding-openharmony-arm64@1.0.1':
    resolution: {integrity: sha512-/Mh0Zhq3OP7fVs0kcQHZP6lZEthMGTaSf8UBQYSFEZDWGXXlEC+nJ6EqenaK2t4LBXMe3A+K/G2BVXXdtOr4PQ==}
    engines: {node: ^20.19.0 || >=22.12.0}
    cpu: [arm64]
    os: [openharmony]

  '@rolldown/binding-wasm32-wasi@1.0.1':
    resolution: {integrity: sha512-+1xc9X45l8ufsBAm6Gjvx2qDRIY9lTVt0cgWNcJ+1gdhXvkbxePA60yRTwSTuXL09CMhyJmjpV7E3NoyxbqFQQ==}
    engines: {node: ^20.19.0 || >=22.12.0}
    cpu: [wasm32]

  '@rolldown/binding-win32-arm64-msvc@1.0.1':
    resolution: {integrity: sha512-1D+UqZdfnuR+Jy1GgMJwi85bD40H21uNmOPRWQhw4oRSuolZ/B5rixZ45DK2KXOTCvmVCecauWgEhbw8bI7tOw==}
    engines: {node: ^20.19.0 || >=22.12.0}
    cpu: [arm64]
    os: [win32]

  '@rolldown/binding-win32-x64-msvc@1.0.1':
    resolution: {integrity: sha512-INAycaWuhlOK3wk4mRHGsdgwYWmd9cChdPdE9bwWmy6rn9VqVNYNFGhOdXrofXUxwHIncSiPNb8tNm8knDVIeQ==}
    engines: {node: ^20.19.0 || >=22.12.0}
    cpu: [x64]
    os: [win32]

  '@rolldown/pluginutils@1.0.0-rc.18':
    resolution: {integrity: sha512-CUY5Mnhe64xQBGZEEXQ5WyZwsc1JU3vAZLIxtrsBt3LO6UOb+C8GunVKqe9sT8NeWb4lqSaoJtp2xo6GxT1MNw==}

  '@rolldown/pluginutils@1.0.1':
    resolution: {integrity: sha512-2j9bGt5Jh8hj+vPtgzPtl72j0yRxHAyumoo6TNfAjsLB04UtpSvPbPcDcBMxz7n+9CYB0c1GxQFxYRg2jimqGw==}

  '@rtsao/scc@1.1.0':
    resolution: {integrity: sha512-zt6OdqaDoOnJ1ZYsCYGt9YmWzDXl4vQdKTyJev62gFhRGKdx7mcT54V9KIjg+d2wi9EXsPvAPKe7i7WjfVWB8g==}

  '@shadcn/react@0.3.0':
    resolution: {integrity: sha512-iKN0NuYe850VDHlxEfvppFrpa7CMV3zArTHusXlaSmeFeQhohGbIqclv6WwPTs/44I8EkXQpcuRt6sXEVKkWqQ==}
    peerDependencies:
      '@types/react': '>=19'
      react: '>=19'
    peerDependenciesMeta:
      '@types/react':
        optional: true
      react:
        optional: true

  '@shuding/opentype.js@1.4.0-beta.0':
    resolution: {integrity: sha512-3NgmNyH3l/Hv6EvsWJbsvpcpUba6R8IREQ83nH83cyakCw7uM1arZKNfHwv1Wz6jgqrF/j4x5ELvR6PnK9nTcA==}
    engines: {node: '>= 8.0.0'}
    hasBin: true

  '@sindresorhus/is@7.2.0':
    resolution: {integrity: sha512-P1Cz1dWaFfR4IR+U13mqqiGsLFf1KbayybWwdd2vfctdV6hDpUkgCY0nKOLLTMSoRd/jJNjtbqzf13K8DCCXQw==}
    engines: {node: '>=18'}

  '@speed-highlight/core@1.2.15':
    resolution: {integrity: sha512-BMq1K3DsElxDWawkX6eLg9+CKJrTVGCBAWVuHXVUV2u0s2711qiChLSId6ikYPfxhdYocLNt3wWwSvDiTvFabw==}

  '@standard-schema/spec@1.1.0':
    resolution: {integrity: sha512-l2aFy5jALhniG5HgqrD6jXLi/rUWrKvqN/qJx6yoJsgKhblVd+iqqU4RCXavm/jPityDo5TCvKMnpjKnOriy0w==}

  '@standard-schema/utils@0.3.0':
    resolution: {integrity: sha512-e7Mew686owMaPJVNNLs55PUvgz371nKgwsc4vxE49zsODpJEnxgxRo2y/OKrqueavXgZNMDVj3DdHFlaSAeU8g==}

  '@swc/helpers@0.5.23':
    resolution: {integrity: sha512-5lSsMOTXURePglDfvuAQUqkGek9Hg2kksOYay2m0+XR++b2NWYL/4sWyuvVBIs8oKnJaxkdi9whaL/sqN13afw==}

  '@tailwindcss/node@4.2.1':
    resolution: {integrity: sha512-jlx6sLk4EOwO6hHe1oCGm1Q4AN/s0rSrTTPBGPM0/RQ6Uylwq17FuU8IeJJKEjtc6K6O07zsvP+gDO6MMWo7pg==}

  '@tailwindcss/oxide-android-arm64@4.2.1':
    resolution: {integrity: sha512-eZ7G1Zm5EC8OOKaesIKuw77jw++QJ2lL9N+dDpdQiAB/c/B2wDh0QPFHbkBVrXnwNugvrbJFk1gK2SsVjwWReg==}
    engines: {node: '>= 20'}
    cpu: [arm64]
    os: [android]

  '@tailwindcss/oxide-darwin-arm64@4.2.1':
    resolution: {integrity: sha512-q/LHkOstoJ7pI1J0q6djesLzRvQSIfEto148ppAd+BVQK0JYjQIFSK3JgYZJa+Yzi0DDa52ZsQx2rqytBnf8Hw==}
    engines: {node: '>= 20'}
    cpu: [arm64]
    os: [darwin]

  '@tailwindcss/oxide-darwin-x64@4.2.1':
    resolution: {integrity: sha512-/f/ozlaXGY6QLbpvd/kFTro2l18f7dHKpB+ieXz+Cijl4Mt9AI2rTrpq7V+t04nK+j9XBQHnSMdeQRhbGyt6fw==}
    engines: {node: '>= 20'}
    cpu: [x64]
    os: [darwin]

  '@tailwindcss/oxide-freebsd-x64@4.2.1':
    resolution: {integrity: sha512-5e/AkgYJT/cpbkys/OU2Ei2jdETCLlifwm7ogMC7/hksI2fC3iiq6OcXwjibcIjPung0kRtR3TxEITkqgn0TcA==}
    engines: {node: '>= 20'}
    cpu: [x64]
    os: [freebsd]

  '@tailwindcss/oxide-linux-arm-gnueabihf@4.2.1':
    resolution: {integrity: sha512-Uny1EcVTTmerCKt/1ZuKTkb0x8ZaiuYucg2/kImO5A5Y/kBz41/+j0gxUZl+hTF3xkWpDmHX+TaWhOtba2Fyuw==}
    engines: {node: '>= 20'}
    cpu: [arm]
    os: [linux]

  '@tailwindcss/oxide-linux-arm64-gnu@4.2.1':
    resolution: {integrity: sha512-CTrwomI+c7n6aSSQlsPL0roRiNMDQ/YzMD9EjcR+H4f0I1SQ8QqIuPnsVp7QgMkC1Qi8rtkekLkOFjo7OlEFRQ==}
    engines: {node: '>= 20'}
    cpu: [arm64]
    os: [linux]
    libc: [glibc]

  '@tailwindcss/oxide-linux-arm64-musl@4.2.1':
    resolution: {integrity: sha512-WZA0CHRL/SP1TRbA5mp9htsppSEkWuQ4KsSUumYQnyl8ZdT39ntwqmz4IUHGN6p4XdSlYfJwM4rRzZLShHsGAQ==}
    engines: {node: '>= 20'}
    cpu: [arm64]
    os: [linux]
    libc: [musl]

  '@tailwindcss/oxide-linux-x64-gnu@4.2.1':
    resolution: {integrity: sha512-qMFzxI2YlBOLW5PhblzuSWlWfwLHaneBE0xHzLrBgNtqN6mWfs+qYbhryGSXQjFYB1Dzf5w+LN5qbUTPhW7Y5g==}
    engines: {node: '>= 20'}
    cpu: [x64]
    os: [linux]
    libc: [glibc]

  '@tailwindcss/oxide-linux-x64-musl@4.2.1':
    resolution: {integrity: sha512-5r1X2FKnCMUPlXTWRYpHdPYUY6a1Ar/t7P24OuiEdEOmms5lyqjDRvVY1yy9Rmioh+AunQ0rWiOTPE8F9A3v5g==}
    engines: {node: '>= 20'}
    cpu: [x64]
    os: [linux]
    libc: [musl]

  '@tailwindcss/oxide-wasm32-wasi@4.2.1':
    resolution: {integrity: sha512-MGFB5cVPvshR85MTJkEvqDUnuNoysrsRxd6vnk1Lf2tbiqNlXpHYZqkqOQalydienEWOHHFyyuTSYRsLfxFJ2Q==}
    engines: {node: '>=14.0.0'}
    cpu: [wasm32]
    bundledDependencies:
      - '@napi-rs/wasm-runtime'
      - '@emnapi/core'
      - '@emnapi/runtime'
      - '@tybys/wasm-util'
      - '@emnapi/wasi-threads'
      - tslib

  '@tailwindcss/oxide-win32-arm64-msvc@4.2.1':
    resolution: {integrity: sha512-YlUEHRHBGnCMh4Nj4GnqQyBtsshUPdiNroZj8VPkvTZSoHsilRCwXcVKnG9kyi0ZFAS/3u+qKHBdDc81SADTRA==}
    engines: {node: '>= 20'}
    cpu: [arm64]
    os: [win32]

  '@tailwindcss/oxide-win32-x64-msvc@4.2.1':
    resolution: {integrity: sha512-rbO34G5sMWWyrN/idLeVxAZgAKWrn5LiR3/I90Q9MkA67s6T1oB0xtTe+0heoBvHSpbU9Mk7i6uwJnpo4u21XQ==}
    engines: {node: '>= 20'}
    cpu: [x64]
    os: [win32]

  '@tailwindcss/oxide@4.2.1':
    resolution: {integrity: sha512-yv9jeEFWnjKCI6/T3Oq50yQEOqmpmpfzG1hcZsAOaXFQPfzWprWrlHSdGPEF3WQTi8zu8ohC9Mh9J470nT5pUw==}
    engines: {node: '>= 20'}

  '@tailwindcss/postcss@4.2.1':
    resolution: {integrity: sha512-OEwGIBnXnj7zJeonOh6ZG9woofIjGrd2BORfvE5p9USYKDCZoQmfqLcfNiRWoJlRWLdNPn2IgVZuWAOM4iTYMw==}

  '@tybys/wasm-util@0.10.2':
    resolution: {integrity: sha512-RoBvJ2X0wuKlWFIjrwffGw1IqZHKQqzIchKaadZZfnNpsAYp2mM0h36JtPCjNDAHGgYez/15uMBpfGwchhiMgg==}

  '@types/d3-array@3.2.2':
    resolution: {integrity: sha512-hOLWVbm7uRza0BYXpIIW5pxfrKe0W+D5lrFiAEYR+pb6w3N2SwSMaJbXdUfSEv+dT4MfHBLtn5js0LAWaO6otw==}

  '@types/d3-color@3.1.3':
    resolution: {integrity: sha512-iO90scth9WAbmgv7ogoq57O9YpKmFBbmoEoCHDB2xMBY0+/KVrqAaCDyCE16dUspeOvIxFFRI+0sEtqDqy2b4A==}

  '@types/d3-ease@3.0.2':
    resolution: {integrity: sha512-NcV1JjO5oDzoK26oMzbILE6HW7uVXOHLQvHshBUW4UMdZGfiY6v5BeQwh9a9tCzv+CeefZQHJt5SRgK154RtiA==}

  '@types/d3-interpolate@3.0.4':
    resolution: {integrity: sha512-mgLPETlrpVV1YRJIglr4Ez47g7Yxjl1lj7YKsiMCb27VJH9W8NVM6Bb9d8kkpG/uAQS5AmbA48q2IAolKKo1MA==}

  '@types/d3-path@3.1.1':
    resolution: {integrity: sha512-VMZBYyQvbGmWyWVea0EHs/BwLgxc+MKi1zLDCONksozI4YJMcTt8ZEuIR4Sb1MMTE8MMW49v0IwI5+b7RmfWlg==}

  '@types/d3-scale@4.0.9':
    resolution: {integrity: sha512-dLmtwB8zkAeO/juAMfnV+sItKjlsw2lKdZVVy6LRr0cBmegxSABiLEpGVmSJJ8O08i4+sGR6qQtb6WtuwJdvVw==}

  '@types/d3-shape@3.1.8':
    resolution: {integrity: sha512-lae0iWfcDeR7qt7rA88BNiqdvPS5pFVPpo5OfjElwNaT2yyekbM0C9vK+yqBqEmHr6lDkRnYNoTBYlAgJa7a4w==}

  '@types/d3-time@3.0.4':
    resolution: {integrity: sha512-yuzZug1nkAAaBlBBikKZTgzCeA+k1uy4ZFwWANOfKw5z5LRhV0gNA7gNkKm7HoK+HRN0wX3EkxGk0fpbWhmB7g==}

  '@types/d3-timer@3.0.2':
    resolution: {integrity: sha512-Ps3T8E8dZDam6fUyNiMkekK3XUsaUEik+idO9/YjPtfj2qruF8tFBXS7XhtE4iIXBLxhmLjP3SXpLhVf21I9Lw==}

  '@types/eslint-scope@3.7.7':
    resolution: {integrity: sha512-MzMFlSLBqNF2gcHWO0G1vP/YQyfvrxZ0bF+u7mzUdZ1/xK4A4sru+nraZz5i3iEIk1l1uyicaDVTB4QbbEkAYg==}

  '@types/eslint@9.6.1':
    resolution: {integrity: sha512-FXx2pKgId/WyYo2jXw63kk7/+TY7u7AziEJxJAnSFzHlqTAS3Ync6SvgYAN/k4/PQpnnVuzoMuVnByKK2qp0ag==}

  '@types/estree@1.0.9':
    resolution: {integrity: sha512-GhdPgy1el4/ImP05X05Uw4cw2/M93BCUmnEvWZNStlCzEKME4Fkk+YpoA5OiHNQmoS7Cafb8Xa3Pya8m1Qrzeg==}

  '@types/geojson@7946.0.16':
    resolution: {integrity: sha512-6C8nqWur3j98U6+lXDfTUWIfgvZU+EumvpHKcYjujKH7woYyLj2sUmff0tRhrqM7BohUw7Pz3ZB1jj2gW9Fvmg==}

  '@types/json-schema@7.0.15':
    resolution: {integrity: sha512-5+fP8P8MFNC+AyZCDxrB2pkZFPGzqQWUzpSeuuVLvm8VMcorNYavBqoFcxK8bQz4Qsbn4oUEEem4wDLfcysGHA==}

  '@types/json5@0.0.29':
    resolution: {integrity: sha512-dRLjCWHYg4oaA77cxO64oO+7JwCwnIzkZPdrrC71jQmQtlhM556pwKo5bUzqvZndkVbeFLIIi+9TC40JNF5hNQ==}

  '@types/leaflet@1.9.22':
    resolution: {integrity: sha512-h3lhECYEKDasG7LFHu+GiHqAvsgLuQvlJvVZzJDGONo3sEL+wUOqSFLnwkZlK0qVxnxbuGFW8iBlJNYs5wgndA==}

  '@types/node@22.19.19':
    resolution: {integrity: sha512-dyh/xO2Fh5bYrfWaaqGrRQQGkNdmYw6AmaAUvYeUMNTWQtvb796ikLdmTchRmOlOiIJ1TDXfWgVx1QkUlQ6Hew==}

  '@types/react-dom@19.2.3':
    resolution: {integrity: sha512-jp2L/eY6fn+KgVVQAOqYItbF0VY/YApe5Mz2F0aykSO8gx31bYCZyvSeYxCHKvzHG5eZjc+zyaS5BrBWya2+kQ==}
    peerDependencies:
      '@types/react': ^19.2.0

  '@types/react@19.2.14':
    resolution: {integrity: sha512-ilcTH/UniCkMdtexkoCN0bI7pMcJDvmQFPvuPvmEaYA/NSfFTAgdUSLAoVjaRJm7+6PvcM+q1zYOwS4wTYMF9w==}

  '@types/use-sync-external-store@0.0.6':
    resolution: {integrity: sha512-zFDAD+tlpf2r4asuHEj0XH6pY6i0g5NeAHPn+15wk3BV6JA69eERFXC1gyGThDkVa1zCyKr5jox1+2LbV/AMLg==}

  '@typescript-eslint/eslint-plugin@8.59.3':
    resolution: {integrity: sha512-PwFvSKsXGShKGW6n5bZOhGHEcCZXM8HofLK9fNsEwZXzFRjoY+XT1Vsf1zgyXdwTr0ZYz1/2tkZ0DBTT9jZjhw==}
    engines: {node: ^18.18.0 || ^20.9.0 || >=21.1.0}
    peerDependencies:
      '@typescript-eslint/parser': ^8.59.3
      eslint: ^8.57.0 || ^9.0.0 || ^10.0.0
      typescript: '>=4.8.4 <6.1.0'

  '@typescript-eslint/parser@8.59.3':
    resolution: {integrity: sha512-HPwA+hVkfcriajbNvTmZv4VRauibay+cWArYUYq7u7W7PmGShMxbPxLvrwDme55a6d5alG3nrYfhyJ/G28XlLg==}
    engines: {node: ^18.18.0 || ^20.9.0 || >=21.1.0}
    peerDependencies:
      eslint: ^8.57.0 || ^9.0.0 || ^10.0.0
      typescript: '>=4.8.4 <6.1.0'

  '@typescript-eslint/project-service@8.59.3':
    resolution: {integrity: sha512-ECiUWa/KYRGDFUqTNehaRgzDshnJfkTABJxVemHk4ko22gcr0ukloKjWvyQ64g8YCV/UI47kN1dbmjf/GaQYng==}
    engines: {node: ^18.18.0 || ^20.9.0 || >=21.1.0}
    peerDependencies:
      typescript: '>=4.8.4 <6.1.0'

  '@typescript-eslint/scope-manager@8.59.3':
    resolution: {integrity: sha512-t2LvZnoEfzKtnPjgeEu41xw5gxq9mQVfYy4OoZ4Vlt0sk3JwxmhCca/AR7DwOiHrjWgjAj6as4AhRLKSDfvZIA==}
    engines: {node: ^18.18.0 || ^20.9.0 || >=21.1.0}

  '@typescript-eslint/tsconfig-utils@8.59.3':
    resolution: {integrity: sha512-PcIJHjmaREXLgIAIzLnSY9VucEzz8FKXsRgFa1DmdGCK/5tJpW03TKJF01Q6VZd1lLdz2sIKPWaDUZN9dp//dw==}
    engines: {node: ^18.18.0 || ^20.9.0 || >=21.1.0}
    peerDependencies:
      typescript: '>=4.8.4 <6.1.0'

  '@typescript-eslint/type-utils@8.59.3':
    resolution: {integrity: sha512-g71d8QD8UaiHGvrJwyIS1hCX5r63w6Jll+4VEYhEAHXTDIqX1JgxhTAbEHtKntL9kuc4jRo7/GWw5xfCepSccQ==}
    engines: {node: ^18.18.0 || ^20.9.0 || >=21.1.0}
    peerDependencies:
      eslint: ^8.57.0 || ^9.0.0 || ^10.0.0
      typescript: '>=4.8.4 <6.1.0'

  '@typescript-eslint/types@8.59.3':
    resolution: {integrity: sha512-ePFoH0g4ludssdRFqqDxQePCxU4WQyRa9+XVwjm7yLn0FKhMeoetC+qBEEI1Eyb1pGSDveTIT09Bvw2WhlGayg==}
    engines: {node: ^18.18.0 || ^20.9.0 || >=21.1.0}

  '@typescript-eslint/typescript-estree@8.59.3':
    resolution: {integrity: sha512-CbRjVRAf7Lr9Kr8RopKcbY45p2VfmmHrm0ygOCYFi7oU8q19m0Fs/6iHS7kNOmwpp+ob07ZVcAqlxUod9lYdmg==}
    engines: {node: ^18.18.0 || ^20.9.0 || >=21.1.0}
    peerDependencies:
      typescript: '>=4.8.4 <6.1.0'

  '@typescript-eslint/utils@8.59.3':
    resolution: {integrity: sha512-JAvT14goBzRzzzZyqq3P9BLArIxTtQURUtFgQ/V7FO+eU+Gg6ES+5ymOPP1wRxXcxAYeivCk4uS3jCKWI1K8Zg==}
    engines: {node: ^18.18.0 || ^20.9.0 || >=21.1.0}
    peerDependencies:
      eslint: ^8.57.0 || ^9.0.0 || ^10.0.0
      typescript: '>=4.8.4 <6.1.0'

  '@typescript-eslint/visitor-keys@8.59.3':
    resolution: {integrity: sha512-f1UQF7ggd42YiwI5wGrRaPsa+P0CINBlrkLPmGfpq/u/I/oVtecoEIfFR9ag/oa1sLOsRNZ6xehf6qMZhQGBDg==}
    engines: {node: ^18.18.0 || ^20.9.0 || >=21.1.0}

  '@unpic/core@1.0.3':
    resolution: {integrity: sha512-aum9YNVUGso7MjGLD0Rp/08kywCGLqZ03/q6VQBFFakDBOXWEc8D4kPGcZ8v5wEnGRex3lE+++bOuucBp3KJ/w==}

  '@unpic/react@1.0.2':
    resolution: {integrity: sha512-5RmRfELwTF8w+4zjtQGqjpvX+RU2VLvis3xDCS1O2uWk0PZN2cvatL+3/KAR3mshAuRrkFGTX1XwyAezSXaoCA==}
    peerDependencies:
      next: ^13.0.0 || ^14.0.0 || ^15.0.0 || ^16.0.0
      react: ^17.0.0 || ^18.0.0 || ^19.0.0
      react-dom: ^17.0.0 || ^18.0.0 || ^19.0.0
    peerDependenciesMeta:
      next:
        optional: true

  '@unrs/resolver-binding-android-arm-eabi@1.11.1':
    resolution: {integrity: sha512-ppLRUgHVaGRWUx0R0Ut06Mjo9gBaBkg3v/8AxusGLhsIotbBLuRk51rAzqLC8gq6NyyAojEXglNjzf6R948DNw==}
    cpu: [arm]
    os: [android]

  '@unrs/resolver-binding-android-arm64@1.11.1':
    resolution: {integrity: sha512-lCxkVtb4wp1v+EoN+HjIG9cIIzPkX5OtM03pQYkG+U5O/wL53LC4QbIeazgiKqluGeVEeBlZahHalCaBvU1a2g==}
    cpu: [arm64]
    os: [android]

  '@unrs/resolver-binding-darwin-arm64@1.11.1':
    resolution: {integrity: sha512-gPVA1UjRu1Y/IsB/dQEsp2V1pm44Of6+LWvbLc9SDk1c2KhhDRDBUkQCYVWe6f26uJb3fOK8saWMgtX8IrMk3g==}
    cpu: [arm64]
    os: [darwin]

  '@unrs/resolver-binding-darwin-x64@1.11.1':
    resolution: {integrity: sha512-cFzP7rWKd3lZaCsDze07QX1SC24lO8mPty9vdP+YVa3MGdVgPmFc59317b2ioXtgCMKGiCLxJ4HQs62oz6GfRQ==}
    cpu: [x64]
    os: [darwin]

  '@unrs/resolver-binding-freebsd-x64@1.11.1':
    resolution: {integrity: sha512-fqtGgak3zX4DCB6PFpsH5+Kmt/8CIi4Bry4rb1ho6Av2QHTREM+47y282Uqiu3ZRF5IQioJQ5qWRV6jduA+iGw==}
    cpu: [x64]
    os: [freebsd]

  '@unrs/resolver-binding-linux-arm-gnueabihf@1.11.1':
    resolution: {integrity: sha512-u92mvlcYtp9MRKmP+ZvMmtPN34+/3lMHlyMj7wXJDeXxuM0Vgzz0+PPJNsro1m3IZPYChIkn944wW8TYgGKFHw==}
    cpu: [arm]
    os: [linux]

  '@unrs/resolver-binding-linux-arm-musleabihf@1.11.1':
    resolution: {integrity: sha512-cINaoY2z7LVCrfHkIcmvj7osTOtm6VVT16b5oQdS4beibX2SYBwgYLmqhBjA1t51CarSaBuX5YNsWLjsqfW5Cw==}
    cpu: [arm]
    os: [linux]

  '@unrs/resolver-binding-linux-arm64-gnu@1.11.1':
    resolution: {integrity: sha512-34gw7PjDGB9JgePJEmhEqBhWvCiiWCuXsL9hYphDF7crW7UgI05gyBAi6MF58uGcMOiOqSJ2ybEeCvHcq0BCmQ==}
    cpu: [arm64]
    os: [linux]
    libc: [glibc]

  '@unrs/resolver-binding-linux-arm64-musl@1.11.1':
    resolution: {integrity: sha512-RyMIx6Uf53hhOtJDIamSbTskA99sPHS96wxVE/bJtePJJtpdKGXO1wY90oRdXuYOGOTuqjT8ACccMc4K6QmT3w==}
    cpu: [arm64]
    os: [linux]
    libc: [musl]

  '@unrs/resolver-binding-linux-ppc64-gnu@1.11.1':
    resolution: {integrity: sha512-D8Vae74A4/a+mZH0FbOkFJL9DSK2R6TFPC9M+jCWYia/q2einCubX10pecpDiTmkJVUH+y8K3BZClycD8nCShA==}
    cpu: [ppc64]
    os: [linux]
    libc: [glibc]

  '@unrs/resolver-binding-linux-riscv64-gnu@1.11.1':
    resolution: {integrity: sha512-frxL4OrzOWVVsOc96+V3aqTIQl1O2TjgExV4EKgRY09AJ9leZpEg8Ak9phadbuX0BA4k8U5qtvMSQQGGmaJqcQ==}
    cpu: [riscv64]
    os: [linux]
    libc: [glibc]

  '@unrs/resolver-binding-linux-riscv64-musl@1.11.1':
    resolution: {integrity: sha512-mJ5vuDaIZ+l/acv01sHoXfpnyrNKOk/3aDoEdLO/Xtn9HuZlDD6jKxHlkN8ZhWyLJsRBxfv9GYM2utQ1SChKew==}
    cpu: [riscv64]
    os: [linux]
    libc: [musl]

  '@unrs/resolver-binding-linux-s390x-gnu@1.11.1':
    resolution: {integrity: sha512-kELo8ebBVtb9sA7rMe1Cph4QHreByhaZ2QEADd9NzIQsYNQpt9UkM9iqr2lhGr5afh885d/cB5QeTXSbZHTYPg==}
    cpu: [s390x]
    os: [linux]
    libc: [glibc]

  '@unrs/resolver-binding-linux-x64-gnu@1.11.1':
    resolution: {integrity: sha512-C3ZAHugKgovV5YvAMsxhq0gtXuwESUKc5MhEtjBpLoHPLYM+iuwSj3lflFwK3DPm68660rZ7G8BMcwSro7hD5w==}
    cpu: [x64]
    os: [linux]
    libc: [glibc]

  '@unrs/resolver-binding-linux-x64-musl@1.11.1':
    resolution: {integrity: sha512-rV0YSoyhK2nZ4vEswT/QwqzqQXw5I6CjoaYMOX0TqBlWhojUf8P94mvI7nuJTeaCkkds3QE4+zS8Ko+GdXuZtA==}
    cpu: [x64]
    os: [linux]
    libc: [musl]

  '@unrs/resolver-binding-wasm32-wasi@1.11.1':
    resolution: {integrity: sha512-5u4RkfxJm+Ng7IWgkzi3qrFOvLvQYnPBmjmZQ8+szTK/b31fQCnleNl1GgEt7nIsZRIf5PLhPwT0WM+q45x/UQ==}
    engines: {node: '>=14.0.0'}
    cpu: [wasm32]

  '@unrs/resolver-binding-win32-arm64-msvc@1.11.1':
    resolution: {integrity: sha512-nRcz5Il4ln0kMhfL8S3hLkxI85BXs3o8EYoattsJNdsX4YUU89iOkVn7g0VHSRxFuVMdM4Q1jEpIId1Ihim/Uw==}
    cpu: [arm64]
    os: [win32]

  '@unrs/resolver-binding-win32-ia32-msvc@1.11.1':
    resolution: {integrity: sha512-DCEI6t5i1NmAZp6pFonpD5m7i6aFrpofcp4LA2i8IIq60Jyo28hamKBxNrZcyOwVOZkgsRp9O2sXWBWP8MnvIQ==}
    cpu: [ia32]
    os: [win32]

  '@unrs/resolver-binding-win32-x64-msvc@1.11.1':
    resolution: {integrity: sha512-lrW200hZdbfRtztbygyaq/6jP6AKE8qQN2KvPcJ+x7wiD038YtnYtZ82IMNJ69GJibV7bwL3y9FgK+5w/pYt6g==}
    cpu: [x64]
    os: [win32]

  '@vercel/og@0.8.6':
    resolution: {integrity: sha512-hBcWIOppZV14bi+eAmCZj8Elj8hVSUZJTpf1lgGBhVD85pervzQ1poM/qYfFUlPraYSZYP+ASg6To5BwYmUSGQ==}
    engines: {node: '>=16'}

  '@vinext/types@1.0.0-beta.2':
    resolution: {integrity: sha512-kbKY/H1RWlf7yox4G6Vwk1JeM6x0Tv1EAv28f3tDYkK3brq+89vp5eZHbdw3L/pZMbAhG4oFyhT9C976y+jkhQ==}
    engines: {node: '>=22'}

  '@vitejs/plugin-react@6.0.2':
    resolution: {integrity: sha512-DlSMqo4WhThw4vB8Mpn0Woe9J+Jfq1geJ61AKW0QEgLzGMNwtIMdxbDUzLxcun8W7NbJO0e2Jg/Nxm3cCSVzzg==}
    engines: {node: ^20.19.0 || >=22.12.0}
    peerDependencies:
      '@rolldown/plugin-babel': ^0.1.7 || ^0.2.0
      babel-plugin-react-compiler: ^1.0.0
      vite: ^8.0.0
    peerDependenciesMeta:
      '@rolldown/plugin-babel':
        optional: true
      babel-plugin-react-compiler:
        optional: true

  '@vitejs/plugin-rsc@0.5.26':
    resolution: {integrity: sha512-T8W8ODEutblw9qXQB512LDPyv1tAbJRD/Gf0QEGsAoydl4nxEtIrghnhoI9oLY9R+7aw+cLk1ZEltxWHWf4aHw==}
    peerDependencies:
      react: '*'
      react-dom: '*'
      react-server-dom-webpack: '*'
      vite: '*'
    peerDependenciesMeta:
      react-server-dom-webpack:
        optional: true

  '@webassemblyjs/ast@1.14.1':
    resolution: {integrity: sha512-nuBEDgQfm1ccRp/8bCQrx1frohyufl4JlbMMZ4P1wpeOfDhF6FQkxZJ1b/e+PLwr6X1Nhw6OLme5usuBWYBvuQ==}

  '@webassemblyjs/floating-point-hex-parser@1.13.2':
    resolution: {integrity: sha512-6oXyTOzbKxGH4steLbLNOu71Oj+C8Lg34n6CqRvqfS2O71BxY6ByfMDRhBytzknj9yGUPVJ1qIKhRlAwO1AovA==}

  '@webassemblyjs/helper-api-error@1.13.2':
    resolution: {integrity: sha512-U56GMYxy4ZQCbDZd6JuvvNV/WFildOjsaWD3Tzzvmw/mas3cXzRJPMjP83JqEsgSbyrmaGjBfDtV7KDXV9UzFQ==}

  '@webassemblyjs/helper-buffer@1.14.1':
    resolution: {integrity: sha512-jyH7wtcHiKssDtFPRB+iQdxlDf96m0E39yb0k5uJVhFGleZFoNw1c4aeIcVUPPbXUVJ94wwnMOAqUHyzoEPVMA==}

  '@webassemblyjs/helper-numbers@1.13.2':
    resolution: {integrity: sha512-FE8aCmS5Q6eQYcV3gI35O4J789wlQA+7JrqTTpJqn5emA4U2hvwJmvFRC0HODS+3Ye6WioDklgd6scJ3+PLnEA==}

  '@webassemblyjs/helper-wasm-bytecode@1.13.2':
    resolution: {integrity: sha512-3QbLKy93F0EAIXLh0ogEVR6rOubA9AoZ+WRYhNbFyuB70j3dRdwH9g+qXhLAO0kiYGlg3TxDV+I4rQTr/YNXkA==}

  '@webassemblyjs/helper-wasm-section@1.14.1':
    resolution: {integrity: sha512-ds5mXEqTJ6oxRoqjhWDU83OgzAYjwsCV8Lo/N+oRsNDmx/ZDpqalmrtgOMkHwxsG0iI//3BwWAErYRHtgn0dZw==}

  '@webassemblyjs/ieee754@1.13.2':
    resolution: {integrity: sha512-4LtOzh58S/5lX4ITKxnAK2USuNEvpdVV9AlgGQb8rJDHaLeHciwG4zlGr0j/SNWlr7x3vO1lDEsuePvtcDNCkw==}

  '@webassemblyjs/leb128@1.13.2':
    resolution: {integrity: sha512-Lde1oNoIdzVzdkNEAWZ1dZ5orIbff80YPdHx20mrHwHrVNNTjNr8E3xz9BdpcGqRQbAEa+fkrCb+fRFTl/6sQw==}

  '@webassemblyjs/utf8@1.13.2':
    resolution: {integrity: sha512-3NQWGjKTASY1xV5m7Hr0iPeXD9+RDobLll3T9d2AO+g3my8xy5peVyjSag4I50mR1bBSN/Ct12lo+R9tJk0NZQ==}

  '@webassemblyjs/wasm-edit@1.14.1':
    resolution: {integrity: sha512-RNJUIQH/J8iA/1NzlE4N7KtyZNHi3w7at7hDjvRNm5rcUXa00z1vRz3glZoULfJ5mpvYhLybmVcwcjGrC1pRrQ==}

  '@webassemblyjs/wasm-gen@1.14.1':
    resolution: {integrity: sha512-AmomSIjP8ZbfGQhumkNvgC33AY7qtMCXnN6bL2u2Js4gVCg8fp735aEiMSBbDR7UQIj90n4wKAFUSEd0QN2Ukg==}

  '@webassemblyjs/wasm-opt@1.14.1':
    resolution: {integrity: sha512-PTcKLUNvBqnY2U6E5bdOQcSM+oVP/PmrDY9NzowJjislEjwP/C4an2303MCVS2Mg9d3AJpIGdUFIQQWbPds0Sw==}

  '@webassemblyjs/wasm-parser@1.14.1':
    resolution: {integrity: sha512-JLBl+KZ0R5qB7mCnud/yyX08jWFw5MsoalJ1pQ4EdFlgj9VdXKGuENGsiCIjegI1W7p91rUlcB/LB5yRJKNTcQ==}

  '@webassemblyjs/wast-printer@1.14.1':
    resolution: {integrity: sha512-kPSSXE6De1XOR820C90RIo2ogvZG+c3KiHzqUoO/F34Y2shGzesfqv7o57xrxovZJH/MetF5UjroJ/R/3isoiw==}

  '@xtuc/ieee754@1.2.0':
    resolution: {integrity: sha512-DX8nKgqcGwsc0eJSqYt5lwP4DH5FlHnmuWWBRy7X0NcaGR0ZtuyeESgMwTYVEtxmsNGY+qit4QYT/MIYTOTPeA==}

  '@xtuc/long@4.2.2':
    resolution: {integrity: sha512-NuHqBY1PB/D8xU6s/thBgOAiAP7HOYDQ32+BFZILJ8ivkUkAHQnWfn6WhL79Owj1qmUnoN/YPhktdIoucipkAQ==}

  acorn-import-phases@1.0.4:
    resolution: {integrity: sha512-wKmbr/DDiIXzEOiWrTTUcDm24kQ2vGfZQvM2fwg2vXqR5uW6aapr7ObPtj1th32b9u90/Pf4AItvdTh42fBmVQ==}
    engines: {node: '>=10.13.0'}
    peerDependencies:
      acorn: ^8.14.0

  acorn-jsx@5.3.2:
    resolution: {integrity: sha512-rq9s+JNhf0IChjtDXxllJ7g41oZk5SlXtp0LHwyA5cejwn7vKmKp4pPri6YEePv2PU65sAsegbXtIinmDFDXgQ==}
    peerDependencies:
      acorn: ^6.0.0 || ^7.0.0 || ^8.0.0

  acorn-loose@8.5.2:
    resolution: {integrity: sha512-PPvV6g8UGMGgjrMu+n/f9E/tCSkNQ2Y97eFvuVdJfG11+xdIeDcLyNdC8SHcrHbRqkfwLASdplyR6B6sKM1U4A==}
    engines: {node: '>=0.4.0'}

  acorn@8.16.0:
    resolution: {integrity: sha512-UVJyE9MttOsBQIDKw1skb9nAwQuR5wuGD3+82K6JgJlm/Y+KI92oNsMNGZCYdDsVtRHSak0pcV5Dno5+4jh9sw==}
    engines: {node: '>=0.4.0'}
    hasBin: true

  ajv-formats@2.1.1:
    resolution: {integrity: sha512-Wx0Kx52hxE7C18hkMEggYlEifqWZtYaRgouJor+WMdPnQyEK13vgEWyVNup7SoeeoLMsr4kf5h6dOW11I15MUA==}
    peerDependencies:
      ajv: ^8.0.0
    peerDependenciesMeta:
      ajv:
        optional: true

  ajv-keywords@5.1.0:
    resolution: {integrity: sha512-YCS/JNFAUyr5vAuhk1DWm1CBxRHW9LbJ2ozWeemrIqpbsqKjHVxYPyi5GC0rjZIT5JxJ3virVTS8wk4i/Z+krw==}
    peerDependencies:
      ajv: ^8.8.2

  ajv@6.15.0:
    resolution: {integrity: sha512-fgFx7Hfoq60ytK2c7DhnF8jIvzYgOMxfugjLOSMHjLIPgenqa7S7oaagATUq99mV6IYvN2tRmC0wnTYX6iPbMw==}

  ajv@8.20.0:
    resolution: {integrity: sha512-Thbli+OlOj+iMPYFBVBfJ3OmCAnaSyNn4M1vz9T6Gka5Jt9ba/HIR56joy65tY6kx/FCF5VXNB819Y7/GUrBGA==}

  ansi-styles@4.3.0:
    resolution: {integrity: sha512-zbB9rCJAT1rbjiVDb2hqKFHNYLxgtk8NURxZ3IZwD3F6NtxbXZQCnnSi1Lkx+IDohdPlFp222wVALIheZJQSEg==}
    engines: {node: '>=8'}

  argparse@2.0.1:
    resolution: {integrity: sha512-8+9WqebbFzpX9OR+Wa6O29asIogeRMzcGtAINdpMHHyAg10f05aSFVBbcEqGf/PXw1EjAZ+q2/bEBg3DvurK3Q==}

  aria-hidden@1.2.6:
    resolution: {integrity: sha512-ik3ZgC9dY/lYVVM++OISsaYDeg1tb0VtP5uL3ouh1koGOaUMDPpbFIei4JkFimWUFPn90sbMNMXQAIVOlnYKJA==}
    engines: {node: '>=10'}

  aria-query@5.3.2:
    resolution: {integrity: sha512-COROpnaoap1E2F000S62r6A60uHZnmlvomhfyT2DlTcrY1OrBKn2UhH7qn5wTC9zMvD0AY7csdPSNwKP+7WiQw==}
    engines: {node: '>= 0.4'}

  array-buffer-byte-length@1.0.2:
    resolution: {integrity: sha512-LHE+8BuR7RYGDKvnrmcuSq3tDcKv9OFEXQt/HpbZhY7V6h0zlUXutnAD82GiFx9rdieCMjkvtcsPqBwgUl1Iiw==}
    engines: {node: '>= 0.4'}

  array-includes@3.1.9:
    resolution: {integrity: sha512-FmeCCAenzH0KH381SPT5FZmiA/TmpndpcaShhfgEN9eCVjnFBqq3l1xrI42y8+PPLI6hypzou4GXw00WHmPBLQ==}
    engines: {node: '>= 0.4'}

  array.prototype.findlast@1.2.5:
    resolution: {integrity: sha512-CVvd6FHg1Z3POpBLxO6E6zr+rSKEQ9L6rZHAaY7lLfhKsWYUBBOuMs0e9o24oopj6H+geRCX0YJ+TJLBK2eHyQ==}
    engines: {node: '>= 0.4'}

  array.prototype.findlastindex@1.2.6:
    resolution: {integrity: sha512-F/TKATkzseUExPlfvmwQKGITM3DGTK+vkAsCZoDc5daVygbJBnjEUCbgkAvVFsgfXfX4YIqZ/27G3k3tdXrTxQ==}
    engines: {node: '>= 0.4'}

  array.prototype.flat@1.3.3:
    resolution: {integrity: sha512-rwG/ja1neyLqCuGZ5YYrznA62D4mZXg0i1cIskIUKSiqF3Cje9/wXAls9B9s1Wa2fomMsIv8czB8jZcPmxCXFg==}
    engines: {node: '>= 0.4'}

  array.prototype.flatmap@1.3.3:
    resolution: {integrity: sha512-Y7Wt51eKJSyi80hFrJCePGGNo5ktJCslFuboqJsbf57CCPcm5zztluPlc4/aD8sWsKvlwatezpV4U1efk8kpjg==}
    engines: {node: '>= 0.4'}

  array.prototype.tosorted@1.1.4:
    resolution: {integrity: sha512-p6Fx8B7b7ZhL/gmUsAy0D15WhvDccw3mnGNbZpi3pmeJdxtWsj2jEaI4Y6oo3XiHfzuSgPwKc04MYt6KgvC/wA==}
    engines: {node: '>= 0.4'}

  arraybuffer.prototype.slice@1.0.4:
    resolution: {integrity: sha512-BNoCY6SXXPQ7gF2opIP4GBE+Xw7U+pHMYKuzjgCN3GwiaIR09UUeKfheyIry77QtrCBlC0KK0q5/TER/tYh3PQ==}
    engines: {node: '>= 0.4'}

  ast-types-flow@0.0.8:
    resolution: {integrity: sha512-OH/2E5Fg20h2aPrbe+QL8JZQFko0YZaF+j4mnQ7BGhfavO7OpSLa8a0y9sBwomHdSbkhTS8TQNayBfnW5DwbvQ==}

  async-function@1.0.0:
    resolution: {integrity: sha512-hsU18Ae8CDTR6Kgu9DYf0EbCr/a5iGL0rytQDobUcdpYOKokk8LEjVphnXkDkgpi0wYVsqrXuP0bZxJaTqdgoA==}
    engines: {node: '>= 0.4'}

  available-typed-arrays@1.0.7:
    resolution: {integrity: sha512-wvUjBtSGN7+7SjNpq/9M2Tg350UZD3q62IFZLbRAR1bSMlCo1ZaeW+BJ+D090e4hIIZLBcTDWe4Mh4jvUDajzQ==}
    engines: {node: '>= 0.4'}

  axe-core@4.11.4:
    resolution: {integrity: sha512-KunSNx+TVpkAw/6ULfhnx+HWRecjqZGTOyquAoWHYLRSdK1tB5Ihce1ZW+UY3fj33bYAFWPu7W/GRSmmrCGuxA==}
    engines: {node: '>=4'}

  axobject-query@4.1.0:
    resolution: {integrity: sha512-qIj0G9wZbMGNLjLmg1PT6v2mE9AH2zlnADJD/2tC6E00hgmhUOfEB6greHPAfLRSufHqROIUTkw6E+M3lH0PTQ==}
    engines: {node: '>= 0.4'}

  balanced-match@1.0.2:
    resolution: {integrity: sha512-3oSeUO0TMV67hN1AmbXsK4yaqU7tjiHlbxRDZOpH0KW9+CeX4bRAaX0Anxt0tx2MrpRpWwQaPwIlISEJhYU5Pw==}

  balanced-match@4.0.4:
    resolution: {integrity: sha512-BLrgEcRTwX2o6gGxGOCNyMvGSp35YofuYzw9h1IMTRmKqttAZZVU67bdb9Pr2vUHA8+j3i2tJfjO6C6+4myGTA==}
    engines: {node: 18 || 20 || >=22}

  base64-js@0.0.8:
    resolution: {integrity: sha512-3XSA2cR/h/73EzlXXdU6YNycmYI7+kicTxks4eJg2g39biHR84slg2+des+p7iHYhbRg/udIS4TD53WabcOUkw==}
    engines: {node: '>= 0.4'}

  baseline-browser-mapping@2.10.30:
    resolution: {integrity: sha512-xjOFN16Ha1+Rz4nFYKqHU/LSB+gx/Vi3yQLX7r7sAW+Wa+8hhF2h4pvqTrTMc8+WcDBEunnUurr46Jvv0jk3Vg==}
    engines: {node: '>=6.0.0'}
    hasBin: true

  blake3-wasm@2.1.5:
    resolution: {integrity: sha512-F1+K8EbfOZE49dtoPtmxUQrpXaBIl3ICvasLh+nJta0xkz+9kF/7uet9fLnwKqhDrmj6g+6K3Tw9yQPUg2ka5g==}

  brace-expansion@1.1.14:
    resolution: {integrity: sha512-MWPGfDxnyzKU7rNOW9SP/c50vi3xrmrua/+6hfPbCS2ABNWfx24vPidzvC7krjU/RTo235sV776ymlsMtGKj8g==}

  brace-expansion@5.0.6:
    resolution: {integrity: sha512-kLpxurY4Z4r9sgMsyG0Z9uzsBlgiU/EFKhj/h91/8yHu0edo7XuixOIH3VcJ8kkxs6/jPzoI6U9Vj3WqbMQ94g==}
    engines: {node: 18 || 20 || >=22}

  braces@3.0.3:
    resolution: {integrity: sha512-yQbXgO/OSZVD2IsiLlro+7Hf6Q18EJrKSEsdoMzKePKXct3gvD8oLcOQdIzGupr5Fj+EDe8gO/lxc1BzfMpxvA==}
    engines: {node: '>=8'}

  browserslist@4.28.2:
    resolution: {integrity: sha512-48xSriZYYg+8qXna9kwqjIVzuQxi+KYWp2+5nCYnYKPTr0LvD89Jqk2Or5ogxz0NUMfIjhh2lIUX/LyX9B4oIg==}
    engines: {node: ^6 || ^7 || ^8 || ^9 || ^10 || ^11 || ^12 || >=13.7}
    hasBin: true

  buffer-from@1.1.2:
    resolution: {integrity: sha512-E+XQCRwSbaaiChtv6k6Dwgc+bx+Bs6vuKJHHl5kox/BaKbhiXzqQOwK4cO22yElGp2OCmjwVhT3HmxgyPGnJfQ==}

  call-bind-apply-helpers@1.0.2:
    resolution: {integrity: sha512-Sp1ablJ0ivDkSzjcaJdxEunN5/XvksFJ2sMBFfq6x0ryhQV/2b/KwFe21cMpmHtPOSij8K99/wSfoEuTObmuMQ==}
    engines: {node: '>= 0.4'}

  call-bind@1.0.9:
    resolution: {integrity: sha512-a/hy+pNsFUTR+Iz8TCJvXudKVLAnz/DyeSUo10I5yvFDQJBFU2s9uqQpoSrJlroHUKoKqzg+epxyP9lqFdzfBQ==}
    engines: {node: '>= 0.4'}

  call-bound@1.0.4:
    resolution: {integrity: sha512-+ys997U96po4Kx/ABpBCqhA9EuxJaQWDQg7295H4hBphv3IZg0boBKuwYpt4YXp6MZ5AmZQnU/tyMTlRpaSejg==}
    engines: {node: '>= 0.4'}

  callsites@3.1.0:
    resolution: {integrity: sha512-P8BjAsXvZS+VIDUI11hHCQEv74YT67YUi5JJFNWIqL235sBmjX4+qx9Muvls5ivyNENctx46xQLQ3aTuE7ssaQ==}
    engines: {node: '>=6'}

  camelize@1.0.1:
    resolution: {integrity: sha512-dU+Tx2fsypxTgtLoE36npi3UqcjSSMNYfkqgmoEhtZrraP5VWq0K7FkWVTYa8eMPtnU/G2txVsfdCJTn9uzpuQ==}

  caniuse-lite@1.0.30001793:
    resolution: {integrity: sha512-iwSsYWaCOoh26cV8NwNRViHlrfUvYsHDfRVcbtmw0Kg6PJIZZXwMkj1442FYLBGkeUf1juAsU3DTfxW579mrPA==}

  chalk@4.1.2:
    resolution: {integrity: sha512-oKnbhFyRIXpUuez8iBMmyEa4nbj4IOQyuhc/wy9kY7/WVPcwIO9VA668Pu8RkO7+0G76SLROeyw9CpQ061i4mA==}
    engines: {node: '>=10'}

  chrome-trace-event@1.0.4:
    resolution: {integrity: sha512-rNjApaLzuwaOTjCiT8lSDdGN1APCiqkChLMJxJPWLunPAt5fy8xgU9/jNOchV84wfIxrA0lRQB7oCT8jrn/wrQ==}
    engines: {node: '>=6.0'}

  class-variance-authority@0.7.1:
    resolution: {integrity: sha512-Ka+9Trutv7G8M6WT6SeiRWz792K5qEqIGEGzXKhAE6xOWAY6pPH8U+9IY3oCMv6kqTmLsv7Xh/2w2RigkePMsg==}

  client-only@0.0.1:
    resolution: {integrity: sha512-IV3Ou0jSMzZrd3pZ48nLkT9DA7Ag1pnPzaiQhpW7c3RbcqqzvzzVu+L8gfqMp/8IM2MQtSiqaCxrrcfu8I8rMA==}

  clsx@2.1.1:
    resolution: {integrity: sha512-eYm0QWBtUrBWZWG0d386OGAw16Z995PiOVo2B7bjWSbHedGl5e0ZWaq65kOGgUSNesEIDkB9ISbTg/JK9dhCZA==}
    engines: {node: '>=6'}

  cmdk@1.1.1:
    resolution: {integrity: sha512-Vsv7kFaXm+ptHDMZ7izaRsP70GgrW9NBNGswt9OZaVBLlE0SNpDq8eu/VGXyF9r7M0azK3Wy7OlYXsuyYLFzHg==}
    peerDependencies:
      react: ^18 || ^19 || ^19.0.0-rc
      react-dom: ^18 || ^19 || ^19.0.0-rc

  color-convert@2.0.1:
    resolution: {integrity: sha512-RRECPsj7iu/xb5oKYcsFHSppFNnsj/52OVTRKb4zP5onXwVF3zVmmToNcOfGC+CRDpfK/U584fMg38ZHCaElKQ==}
    engines: {node: '>=7.0.0'}

  color-name@1.1.4:
    resolution: {integrity: sha512-dOy+3AuW3a2wNbZHIuMZpTcgjGuLU/uBL/ubcZF9OXbDo8ff4O8yVp5Bf0efS8uEoYo5q4Fx7dY9OgQGXgAsQA==}

  commander@2.20.3:
    resolution: {integrity: sha512-GpVkmM8vF2vQUkj2LvZmD35JxeJOLCwJ9cUkugyk2nuhbv3+mJvpLYYt+0+USMxE+oj+ey/lJEnhZw75x/OMcQ==}

  concat-map@0.0.1:
    resolution: {integrity: sha512-/Srv4dswyQNBfohGpz9o6Yb3Gz3SrUDqBH5rTuhGR7ahtlbYKnVxw2bCFMRljaA7EXHaXZ8wsHdodFvbkhKmqg==}

  convert-source-map@2.0.0:
    resolution: {integrity: sha512-Kvp459HrV2FEJ1CAsi1Ku+MY3kasH19TFykTz2xWmMeq6bk2NU3XXvfJ+Q61m0xktWwt+1HSYf3JZsTms3aRJg==}

  cookie@1.1.1:
    resolution: {integrity: sha512-ei8Aos7ja0weRpFzJnEA9UHJ/7XQmqglbRwnf2ATjcB9Wq874VKH9kfjjirM6UhU2/E5fFYadylyhFldcqSidQ==}
    engines: {node: '>=18'}

  cross-spawn@7.0.6:
    resolution: {integrity: sha512-uV2QOWP2nWzsy2aMp8aRibhi9dlzF5Hgh5SHaB9OiTGEyDTiJJyx0uy51QXdyWbtAHNua4XJzUKca3OzKUd3vA==}
    engines: {node: '>= 8'}

  css-background-parser@0.1.0:
    resolution: {integrity: sha512-2EZLisiZQ+7m4wwur/qiYJRniHX4K5Tc9w93MT3AS0WS1u5kaZ4FKXlOTBhOjc+CgEgPiGY+fX1yWD8UwpEqUA==}

  css-box-shadow@1.0.0-3:
    resolution: {integrity: sha512-9jaqR6e7Ohds+aWwmhe6wILJ99xYQbfmK9QQB9CcMjDbTxPZjwEmUQpU91OG05Xgm8BahT5fW+svbsQGjS/zPg==}

  css-color-keywords@1.0.0:
    resolution: {integrity: sha512-FyyrDHZKEjXDpNJYvVsV960FiqQyXc/LlYmsxl2BcdMb2WPx0OGRVgTg55rPSyLSNMqP52R9r8geSp7apN3Ofg==}
    engines: {node: '>=4'}

  css-gradient-parser@0.0.16:
    resolution: {integrity: sha512-3O5QdqgFRUbXvK1x5INf1YkBz1UKSWqrd63vWsum8MNHDBYD5urm3QtxZbKU259OrEXNM26lP/MPY3d1IGkBgA==}
    engines: {node: '>=16'}

  css-to-react-native@3.2.0:
    resolution: {integrity: sha512-e8RKaLXMOFii+02mOlqwjbD00KSEKqblnpO9e++1aXS1fPQOpS1YoqdVHBqPjHNoxeF2mimzVqawm2KCbEdtHQ==}

  csstype@3.2.3:
    resolution: {integrity: sha512-z1HGKcYy2xA8AGQfwrn0PAy+PB7X/GSj3UVJW9qKyn43xWa+gl5nXmU4qqLMRzWVLFC8KusUX8T/0kCiOYpAIQ==}

  d3-array@3.2.4:
    resolution: {integrity: sha512-tdQAmyA18i4J7wprpYq8ClcxZy3SC31QMeByyCFyRt7BVHdREQZ5lpzoe5mFEYZUWe+oq8HBvk9JjpibyEV4Jg==}
    engines: {node: '>=12'}

  d3-color@3.1.0:
    resolution: {integrity: sha512-zg/chbXyeBtMQ1LbD/WSoW2DpC3I0mpmPdW+ynRTj/x2DAWYrIY7qeZIHidozwV24m4iavr15lNwIwLxRmOxhA==}
    engines: {node: '>=12'}

  d3-ease@3.0.1:
    resolution: {integrity: sha512-wR/XK3D3XcLIZwpbvQwQ5fK+8Ykds1ip7A2Txe0yxncXSdq1L9skcG7blcedkOX+ZcgxGAmLX1FrRGbADwzi0w==}
    engines: {node: '>=12'}

  d3-format@3.1.2:
    resolution: {integrity: sha512-AJDdYOdnyRDV5b6ArilzCPPwc1ejkHcoyFarqlPqT7zRYjhavcT3uSrqcMvsgh2CgoPbK3RCwyHaVyxYcP2Arg==}
    engines: {node: '>=12'}

  d3-interpolate@3.0.1:
    resolution: {integrity: sha512-3bYs1rOD33uo8aqJfKP3JWPAibgw8Zm2+L9vBKEHJ2Rg+viTR7o5Mmv5mZcieN+FRYaAOWX5SJATX6k1PWz72g==}
    engines: {node: '>=12'}

  d3-path@3.1.0:
    resolution: {integrity: sha512-p3KP5HCf/bvjBSSKuXid6Zqijx7wIfNW+J/maPs+iwR35at5JCbLUT0LzF1cnjbCHWhqzQTIN2Jpe8pRebIEFQ==}
    engines: {node: '>=12'}

  d3-scale@4.0.2:
    resolution: {integrity: sha512-GZW464g1SH7ag3Y7hXjf8RoUuAFIqklOAq3MRl4OaWabTFJY9PN/E1YklhXLh+OQ3fM9yS2nOkCoS+WLZ6kvxQ==}
    engines: {node: '>=12'}

  d3-shape@3.2.0:
    resolution: {integrity: sha512-SaLBuwGm3MOViRq2ABk3eLoxwZELpH6zhl3FbAoJ7Vm1gofKx6El1Ib5z23NUEhF9AsGl7y+dzLe5Cw2AArGTA==}
    engines: {node: '>=12'}

  d3-time-format@4.1.0:
    resolution: {integrity: sha512-dJxPBlzC7NugB2PDLwo9Q8JiTR3M3e4/XANkreKSUxF8vvXKqm1Yfq4Q5dl8budlunRVlUUaDUgFt7eA8D6NLg==}
    engines: {node: '>=12'}

  d3-time@3.1.0:
    resolution: {integrity: sha512-VqKjzBLejbSMT4IgbmVgDjpkYrNWUYJnbCGo874u7MMKIWsILRX+OpX/gTk8MqjpT1A/c6HY2dCA77ZN0lkQ2Q==}
    engines: {node: '>=12'}

  d3-timer@3.0.1:
    resolution: {integrity: sha512-ndfJ/JxxMd3nw31uyKoY2naivF+r29V+Lc0svZxe1JvvIRmi8hUsrMvdOwgS1o6uBHmiz91geQ0ylPP0aj1VUA==}
    engines: {node: '>=12'}

  damerau-levenshtein@1.0.8:
    resolution: {integrity: sha512-sdQSFB7+llfUcQHUQO3+B8ERRj0Oa4w9POWMI/puGtuf7gFywGmkaLCElnudfTiKZV+NvHqL0ifzdrI8Ro7ESA==}

  data-view-buffer@1.0.2:
    resolution: {integrity: sha512-EmKO5V3OLXh1rtK2wgXRansaK1/mtVdTUEiEI0W8RkvgT05kfxaH29PliLnpLP73yYO6142Q72QNa8Wx/A5CqQ==}
    engines: {node: '>= 0.4'}

  data-view-byte-length@1.0.2:
    resolution: {integrity: sha512-tuhGbE6CfTM9+5ANGf+oQb72Ky/0+s3xKUpHvShfiz2RxMFgFPjsXuRLBVMtvMs15awe45SRb83D6wH4ew6wlQ==}
    engines: {node: '>= 0.4'}

  data-view-byte-offset@1.0.1:
    resolution: {integrity: sha512-BS8PfmtDGnrgYdOonGZQdLZslWIeCGFP9tpan0hi1Co2Zr2NKADsvGYA8XxuG/4UWgJ6Cjtv+YJnB6MM69QGlQ==}
    engines: {node: '>= 0.4'}

  date-fns@4.4.0:
    resolution: {integrity: sha512-+1UMbeh68lH1SegH83CGWwpb6OHHbpSgr3+s5Eww5M4CAgswBpoWS0AjTOfEJ33HiYKz1hdj/KTFprzXHmq/6w==}

  debug@3.2.7:
    resolution: {integrity: sha512-CFjzYYAi4ThfiQvizrFQevTTXHtnCqWfe7x1AhgEscTz6ZbLbfoLRLPugTQyBth6f8ZERVUSyWHFD/7Wu4t1XQ==}
    peerDependencies:
      supports-color: '*'
    peerDependenciesMeta:
      supports-color:
        optional: true

  debug@4.4.3:
    resolution: {integrity: sha512-RGwwWnwQvkVfavKVt22FGLw+xYSdzARwm0ru6DhTVA3umU5hZc28V3kO4stgYryrTlLpuvgI9GiijltAjNbcqA==}
    engines: {node: '>=6.0'}
    peerDependencies:
      supports-color: '*'
    peerDependenciesMeta:
      supports-color:
        optional: true

  decimal.js-light@2.5.1:
    resolution: {integrity: sha512-qIMFpTMZmny+MMIitAB6D7iVPEorVw6YQRWkvarTkT4tBeSLLiHzcwj6q0MmYSFCiVpiqPJTJEYIrpcPzVEIvg==}

  deep-is@0.1.4:
    resolution: {integrity: sha512-oIPzksmTg4/MriiaYGO+okXDT7ztn/w3Eptv/+gSIdMdKsJo0u4CfYNFJPy+4SKMuCqGw2wxnA+URMg3t8a/bQ==}

  define-data-property@1.1.4:
    resolution: {integrity: sha512-rBMvIzlpA8v6E+SJZoo++HAYqsLrkg7MSfIinMPFhmkorw7X+dOXVJQs+QT69zGkzMyfDnIMN2Wid1+NbL3T+A==}
    engines: {node: '>= 0.4'}

  define-properties@1.2.1:
    resolution: {integrity: sha512-8QmQKqEASLd5nx0U1B1okLElbUuuttJ/AnYmRXbbbGDWh6uS208EjD4Xqq/I9wK7u0v6O08XhTWnt5XtEbR6Dg==}
    engines: {node: '>= 0.4'}

  detect-libc@2.1.2:
    resolution: {integrity: sha512-Btj2BOOO83o3WyH59e8MgXsxEQVcarkUOpEYrubB0urwnN10yQ364rsiByU11nZlqWYZm05i/of7io4mzihBtQ==}
    engines: {node: '>=8'}

  detect-node-es@1.1.0:
    resolution: {integrity: sha512-ypdmJU/TbBby2Dxibuv7ZLW3Bs1QEmM7nHjEANfohJLvE0XVujisn1qPJcZxg+qDucsr+bP6fLD1rPS3AhJ7EQ==}

  doctrine@2.1.0:
    resolution: {integrity: sha512-35mSku4ZXK0vfCuHEDAwt55dg2jNajHZ1odvF+8SSr82EsZY4QmXfuWso8oEd8zRhVObSN18aM0CjSdoBX7zIw==}
    engines: {node: '>=0.10.0'}

  drizzle-kit@0.31.10:
    resolution: {integrity: sha512-7OZcmQUrdGI+DUNNsKBn1aW8qSoKuTH7d0mYgSP8bAzdFzKoovxEFnoGQp2dVs82EOJeYycqRtciopszwUf8bw==}
    hasBin: true

  drizzle-orm@0.45.2:
    resolution: {integrity: sha512-kY0BSaTNYWnoDMVoyY8uxmyHjpJW1geOmBMdSSicKo9CIIWkSxMIj2rkeSR51b8KAPB7m+qysjuHme5nKP+E5Q==}
    peerDependencies:
      '@aws-sdk/client-rds-data': '>=3'
      '@cloudflare/workers-types': '>=4'
      '@electric-sql/pglite': '>=0.2.0'
      '@libsql/client': '>=0.10.0'
      '@libsql/client-wasm': '>=0.10.0'
      '@neondatabase/serverless': '>=0.10.0'
      '@op-engineering/op-sqlite': '>=2'
      '@opentelemetry/api': ^1.4.1
      '@planetscale/database': '>=1.13'
      '@prisma/client': '*'
      '@tidbcloud/serverless': '*'
      '@types/better-sqlite3': '*'
      '@types/pg': '*'
      '@types/sql.js': '*'
      '@upstash/redis': '>=1.34.7'
      '@vercel/postgres': '>=0.8.0'
      '@xata.io/client': '*'
      better-sqlite3: '>=7'
      bun-types: '*'
      expo-sqlite: '>=14.0.0'
      gel: '>=2'
      knex: '*'
      kysely: '*'
      mysql2: '>=2'
      pg: '>=8'
      postgres: '>=3'
      prisma: '*'
      sql.js: '>=1'
      sqlite3: '>=5'
    peerDependenciesMeta:
      '@aws-sdk/client-rds-data':
        optional: true
      '@cloudflare/workers-types':
        optional: true
      '@electric-sql/pglite':
        optional: true
      '@libsql/client':
        optional: true
      '@libsql/client-wasm':
        optional: true
      '@neondatabase/serverless':
        optional: true
      '@op-engineering/op-sqlite':
        optional: true
      '@opentelemetry/api':
        optional: true
      '@planetscale/database':
        optional: true
      '@prisma/client':
        optional: true
      '@tidbcloud/serverless':
        optional: true
      '@types/better-sqlite3':
        optional: true
      '@types/pg':
        optional: true
      '@types/sql.js':
        optional: true
      '@upstash/redis':
        optional: true
      '@vercel/postgres':
        optional: true
      '@xata.io/client':
        optional: true
      better-sqlite3:
        optional: true
      bun-types:
        optional: true
      expo-sqlite:
        optional: true
      gel:
        optional: true
      knex:
        optional: true
      kysely:
        optional: true
      mysql2:
        optional: true
      pg:
        optional: true
      postgres:
        optional: true
      prisma:
        optional: true
      sql.js:
        optional: true
      sqlite3:
        optional: true

  dunder-proto@1.0.1:
    resolution: {integrity: sha512-KIN/nDJBQRcXw0MLVhZE9iQHmG68qAVIBg9CqmUYjmQIhgij9U5MFvrqkUL5FbtyyzZuOeOt0zdeRe4UY7ct+A==}
    engines: {node: '>= 0.4'}

  electron-to-chromium@1.5.358:
    resolution: {integrity: sha512-EO7tKm3QxRqTs1lSuPXzl6yRAwznehp0AH9OoMOIC+4mQzTFday8FJCO5KU6J/TFSQXEOahNq4vTKpz1jmCVOA==}

  embla-carousel-react@8.6.0:
    resolution: {integrity: sha512-0/PjqU7geVmo6F734pmPqpyHqiM99olvyecY7zdweCw+6tKEXnrE90pBiBbMMU8s5tICemzpQ3hi5EpxzGW+JA==}
    peerDependencies:
      react: ^16.8.0 || ^17.0.1 || ^18.0.0 || ^19.0.0 || ^19.0.0-rc

  embla-carousel-reactive-utils@8.6.0:
    resolution: {integrity: sha512-fMVUDUEx0/uIEDM0Mz3dHznDhfX+znCCDCeIophYb1QGVM7YThSWX+wz11zlYwWFOr74b4QLGg0hrGPJeG2s4A==}
    peerDependencies:
      embla-carousel: 8.6.0

  embla-carousel@8.6.0:
    resolution: {integrity: sha512-SjWyZBHJPbqxHOzckOfo8lHisEaJWmwd23XppYFYVh10bU66/Pn5tkVkbkCMZVdbUE5eTCI2nD8OyIP4Z+uwkA==}

  emoji-regex-xs@2.0.1:
    resolution: {integrity: sha512-1QFuh8l7LqUcKe24LsPUNzjrzJQ7pgRwp1QMcZ5MX6mFplk2zQ08NVCM84++1cveaUUYtcCYHmeFEuNg16sU4g==}
    engines: {node: '>=10.0.0'}

  emoji-regex@9.2.2:
    resolution: {integrity: sha512-L18DaJsXSUk2+42pv8mLs5jJT2hqFkFE4j21wOmgbUqsZ2hL72NsUU785g9RXgo3s0ZNgVl42TiHp3ZtOv/Vyg==}

  enhanced-resolve@5.21.3:
    resolution: {integrity: sha512-QyL119InA+XXEkNLNTPCXPugSvOfhwv0JOlGNzvxs0hZaiHLNvXSpudUWsOlsXGWJh8G6ckCScEkVHfX3kw/2Q==}
    engines: {node: '>=10.13.0'}

  error-stack-parser-es@1.0.5:
    resolution: {integrity: sha512-5qucVt2XcuGMcEGgWI7i+yZpmpByQ8J1lHhcL7PwqCwu9FPP3VUXzT4ltHe5i2z9dePwEHcDVOAfSnHsOlCXRA==}

  es-abstract@1.24.2:
    resolution: {integrity: sha512-2FpH9Q5i2RRwyEP1AylXe6nYLR5OhaJTZwmlcP0dL/+JCbgg7yyEo/sEK6HeGZRf3dFpWwThaRHVApXSkW3xeg==}
    engines: {node: '>= 0.4'}

  es-define-property@1.0.1:
    resolution: {integrity: sha512-e3nRfgfUZ4rNGL232gUgX06QNyyez04KdjFrF+LTRoOXmrOgFKDg4BCdsjW8EnT69eqdYGmRpJwiPVYNrCaW3g==}
    engines: {node: '>= 0.4'}

  es-errors@1.3.0:
    resolution: {integrity: sha512-Zf5H2Kxt2xjTvbJvP2ZWLEICxA6j+hAmMzIlypy4xcBg1vKVnx89Wy0GbS+kf5cwCVFFzdCFh2XSCFNULS6csw==}
    engines: {node: '>= 0.4'}

  es-iterator-helpers@1.3.2:
    resolution: {integrity: sha512-HVLACW1TppGYjJ8H6/jqH/pqOtKRw6wMlrB23xfExmFWxFquAIWCmwoLsOyN96K4a5KbmOf5At9ZUO3GZbetAw==}
    engines: {node: '>= 0.4'}

  es-module-lexer@1.7.0:
    resolution: {integrity: sha512-jEQoCwk8hyb2AZziIOLhDqpm5+2ww5uIE6lkO/6jcOCusfk6LhMHpXXfBLXTZ7Ydyt0j4VoUQv6uGNYbdW+kBA==}

  es-module-lexer@2.1.0:
    resolution: {integrity: sha512-n27zTYMjYu1aj4MjCWzSP7G9r75utsaoc8m61weK+W8JMBGGQybd43GstCXZ3WNmSFtGT9wi59qQTW6mhTR5LQ==}

  es-object-atoms@1.1.1:
    resolution: {integrity: sha512-FGgH2h8zKNim9ljj7dankFPcICIK9Cp5bm+c2gQSYePhpaG5+esrLODihIorn+Pe6FGJzWhXQotPv73jTaldXA==}
    engines: {node: '>= 0.4'}

  es-set-tostringtag@2.1.0:
    resolution: {integrity: sha512-j6vWzfrGVfyXxge+O0x5sh6cvxAog0a/4Rdd2K36zCMV5eJ+/+tOAngRO8cODMNWbVRdVlmGZQL2YS3yR8bIUA==}
    engines: {node: '>= 0.4'}

  es-shim-unscopables@1.1.0:
    resolution: {integrity: sha512-d9T8ucsEhh8Bi1woXCf+TIKDIROLG5WCkxg8geBCbvk22kzwC5G2OnXVMO6FUsvQlgUUXQ2itephWDLqDzbeCw==}
    engines: {node: '>= 0.4'}

  es-to-primitive@1.3.0:
    resolution: {integrity: sha512-w+5mJ3GuFL+NjVtJlvydShqE1eN3h3PbI7/5LAsYJP/2qtuMXjfL2LpHSRqo4b4eSF5K/DH1JXKUAHSB2UW50g==}
    engines: {node: '>= 0.4'}

  es-toolkit@1.50.0:
    resolution: {integrity: sha512-OyZKhUVvEep9ITEiwHn8GKnMRQIVqoSIX7WnRbkWgJkllCujilqP2rD0u979tkl8wqyc8ICwlc1UBVv/Sl1G6w==}

  esbuild@0.18.20:
    resolution: {integrity: sha512-ceqxoedUrcayh7Y7ZX6NdbbDzGROiyVBgC4PriJThBKSVPWnnFHZAkfI1lJT8QFkOwH4qOS2SJkS4wvpGl8BpA==}
    engines: {node: '>=12'}
    hasBin: true

  esbuild@0.25.12:
    resolution: {integrity: sha512-bbPBYYrtZbkt6Os6FiTLCTFxvq4tt3JKall1vRwshA3fdVztsLAatFaZobhkBC8/BrPetoa0oksYoKXoG4ryJg==}
    engines: {node: '>=18'}
    hasBin: true

  esbuild@0.27.3:
    resolution: {integrity: sha512-8VwMnyGCONIs6cWue2IdpHxHnAjzxnw2Zr7MkVxB2vjmQ2ivqGFb4LEG3SMnv0Gb2F/G/2yA8zUaiL1gywDCCg==}
    engines: {node: '>=18'}
    hasBin: true

  esbuild@0.28.0:
    resolution: {integrity: sha512-sNR9MHpXSUV/XB4zmsFKN+QgVG82Cc7+/aaxJ8Adi8hyOac+EXptIp45QBPaVyX3N70664wRbTcLTOemCAnyqw==}
    engines: {node: '>=18'}
    hasBin: true

  escalade@3.2.0:
    resolution: {integrity: sha512-WUj2qlxaQtO4g6Pq5c29GTcWGDyd8itL8zTlipgECz3JesAiiOKotd8JU6otB3PACgG6xkJUyVhboMS+bje/jA==}
    engines: {node: '>=6'}

  escape-html@1.0.3:
    resolution: {integrity: sha512-NiSupZ4OeuGwr68lGIeym/ksIZMJodUGOSCZ/FSnTxcrekbvqrgdUxlJOMpijaKZVjAJrWrGs/6Jy8OMuyj9ow==}

  escape-string-regexp@4.0.0:
    resolution: {integrity: sha512-TtpcNJ3XAzx3Gq8sWRzJaVajRs0uVxA2YAkdb1jm2YkPz4G6egUFAyA3n5vtEIZefPk5Wa4UXbKuS5fKkJWdgA==}
    engines: {node: '>=10'}

  eslint-config-next@16.3.4:
    resolution: {integrity: sha512-35/8RM10huEL9vlr8hUZMERMENHBrnyHN3ZZkF9efSgzGaqK34jIqry44A956//zriUhUAUW0XSkcolhrryqAA==}
    peerDependencies:
      eslint: '>=9.0.0'
      typescript: '>=3.3.1'
    peerDependenciesMeta:
      typescript:
        optional: true

  eslint-import-resolver-node@0.3.10:
    resolution: {integrity: sha512-tRrKqFyCaKict5hOd244sL6EQFNycnMQnBe+j8uqGNXYzsImGbGUU4ibtoaBmv5FLwJwcFJNeg1GeVjQfbMrDQ==}

  eslint-import-resolver-typescript@3.10.1:
    resolution: {integrity: sha512-A1rHYb06zjMGAxdLSkN2fXPBwuSaQ0iO5M/hdyS0Ajj1VBaRp0sPD3dn1FhME3c/JluGFbwSxyCfqdSbtQLAHQ==}
    engines: {node: ^14.18.0 || >=16.0.0}
    peerDependencies:
      eslint: '*'
      eslint-plugin-import: '*'
      eslint-plugin-import-x: '*'
    peerDependenciesMeta:
      eslint-plugin-import:
        optional: true
      eslint-plugin-import-x:
        optional: true

  eslint-module-utils@2.12.1:
    resolution: {integrity: sha512-L8jSWTze7K2mTg0vos/RuLRS5soomksDPoJLXIslC7c8Wmut3bx7CPpJijDcBZtxQ5lrbUdM+s0OlNbz0DCDNw==}
    engines: {node: '>=4'}
    peerDependencies:
      '@typescript-eslint/parser': '*'
      eslint: '*'
      eslint-import-resolver-node: '*'
      eslint-import-resolver-typescript: '*'
      eslint-import-resolver-webpack: '*'
    peerDependenciesMeta:
      '@typescript-eslint/parser':
        optional: true
      eslint:
        optional: true
      eslint-import-resolver-node:
        optional: true
      eslint-import-resolver-typescript:
        optional: true
      eslint-import-resolver-webpack:
        optional: true

  eslint-plugin-import@2.32.0:
    resolution: {integrity: sha512-whOE1HFo/qJDyX4SnXzP4N6zOWn79WhnCUY/iDR0mPfQZO8wcYE4JClzI2oZrhBnnMUCBCHZhO6VQyoBU95mZA==}
    engines: {node: '>=4'}
    peerDependencies:
      '@typescript-eslint/parser': '*'
      eslint: ^2 || ^3 || ^4 || ^5 || ^6 || ^7.2.0 || ^8 || ^9
    peerDependenciesMeta:
      '@typescript-eslint/parser':
        optional: true

  eslint-plugin-jsx-a11y@6.10.2:
    resolution: {integrity: sha512-scB3nz4WmG75pV8+3eRUQOHZlNSUhFNq37xnpgRkCCELU3XMvXAxLk1eqWWyE22Ki4Q01Fnsw9BA3cJHDPgn2Q==}
    engines: {node: '>=4.0'}
    peerDependencies:
      eslint: ^3 || ^4 || ^5 || ^6 || ^7 || ^8 || ^9

  eslint-plugin-react-hooks@7.1.1:
    resolution: {integrity: sha512-f2I7Gw6JbvCexzIInuSbZpfdQ44D7iqdWX01FKLvrPgqxoE7oMj8clOfto8U6vYiz4yd5oKu39rRSVOe1zRu0g==}
    engines: {node: '>=18'}
    peerDependencies:
      eslint: ^3.0.0 || ^4.0.0 || ^5.0.0 || ^6.0.0 || ^7.0.0 || ^8.0.0-0 || ^9.0.0 || ^10.0.0

  eslint-plugin-react@7.37.5:
    resolution: {integrity: sha512-Qteup0SqU15kdocexFNAJMvCJEfa2xUKNV4CC1xsVMrIIqEy3SQ/rqyxCWNzfrd3/ldy6HMlD2e0JDVpDg2qIA==}
    engines: {node: '>=4'}
    peerDependencies:
      eslint: ^3 || ^4 || ^5 || ^6 || ^7 || ^8 || ^9.7

  eslint-scope@5.1.1:
    resolution: {integrity: sha512-2NxwbF/hZ0KpepYN0cNbo+FN6XoK7GaHlQhgx/hIZl6Va0bF45RQOOwhLIy8lQDbuCiadSLCBnH2CFYquit5bw==}
    engines: {node: '>=8.0.0'}

  eslint-scope@8.4.0:
    resolution: {integrity: sha512-sNXOfKCn74rt8RICKMvJS7XKV/Xk9kA7DyJr8mJik3S7Cwgy3qlkkmyS2uQB3jiJg6VNdZd/pDBJu0nvG2NlTg==}
    engines: {node: ^18.18.0 || ^20.9.0 || >=21.1.0}

  eslint-visitor-keys@3.4.3:
    resolution: {integrity: sha512-wpc+LXeiyiisxPlEkUzU6svyS1frIO3Mgxj1fdy7Pm8Ygzguax2N3Fa/D/ag1WqbOprdI+uY6wMUl8/a2G+iag==}
    engines: {node: ^12.22.0 || ^14.17.0 || >=16.0.0}

  eslint-visitor-keys@4.2.1:
    resolution: {integrity: sha512-Uhdk5sfqcee/9H/rCOJikYz67o0a2Tw2hGRPOG2Y1R2dg7brRe1uG0yaNQDHu+TO/uQPF/5eCapvYSmHUjt7JQ==}
    engines: {node: ^18.18.0 || ^20.9.0 || >=21.1.0}

  eslint-visitor-keys@5.0.1:
    resolution: {integrity: sha512-tD40eHxA35h0PEIZNeIjkHoDR4YjjJp34biM0mDvplBe//mB+IHCqHDGV7pxF+7MklTvighcCPPZC7ynWyjdTA==}
    engines: {node: ^20.19.0 || ^22.13.0 || >=24}

  eslint@9.39.4:
    resolution: {integrity: sha512-XoMjdBOwe/esVgEvLmNsD3IRHkm7fbKIUGvrleloJXUZgDHig2IPWNniv+GwjyJXzuNqVjlr5+4yVUZjycJwfQ==}
    engines: {node: ^18.18.0 || ^20.9.0 || >=21.1.0}
    deprecated: This version is no longer supported. Please see https://eslint.org/version-support for other options.
    hasBin: true
    peerDependencies:
      jiti: '*'
    peerDependenciesMeta:
      jiti:
        optional: true

  espree@10.4.0:
    resolution: {integrity: sha512-j6PAQ2uUr79PZhBjP5C5fhl8e39FmRnOjsD5lGnWrFU8i2G776tBK7+nP8KuQUTTyAZUwfQqXAgrVH5MbH9CYQ==}
    engines: {node: ^18.18.0 || ^20.9.0 || >=21.1.0}

  esquery@1.7.0:
    resolution: {integrity: sha512-Ap6G0WQwcU/LHsvLwON1fAQX9Zp0A2Y6Y/cJBl9r/JbW90Zyg4/zbG6zzKa2OTALELarYHmKu0GhpM5EO+7T0g==}
    engines: {node: '>=0.10'}

  esrecurse@4.3.0:
    resolution: {integrity: sha512-KmfKL3b6G+RXvP8N1vr3Tq1kL/oCFgn2NYXEtqP8/L3pKapUA4G8cFVaoF3SU323CD4XypR/ffioHmkti6/Tag==}
    engines: {node: '>=4.0'}

  estraverse@4.3.0:
    resolution: {integrity: sha512-39nnKffWz8xN1BU/2c79n9nB9HDzo0niYUqx6xyqUnyoAnQyyWpOTdZEeiCch8BBu515t4wp9ZmgVfVhn9EBpw==}
    engines: {node: '>=4.0'}

  estraverse@5.3.0:
    resolution: {integrity: sha512-MMdARuVEQziNTeJD8DgMqmhwR11BRQ/cBP+pLtYdSTnf3MIO8fFeiINEbX36ZdNlfU/7A9f3gUw49B3oQsvwBA==}
    engines: {node: '>=4.0'}

  estree-walker@3.0.3:
    resolution: {integrity: sha512-7RUKfXgSMMkzt6ZuXmqapOurLGPPfgj6l9uRZ7lRGolvk0y2yocc35LdcxKC5PQZdn2DMqioAQ2NoWcrTKmm6g==}

  esutils@2.0.3:
    resolution: {integrity: sha512-kVscqXk4OCp68SZ0dkgEKVi6/8ij300KBWTJq32P/dYeWTSwK41WyTxalN1eRmA5Z9UU/LX9D7FWSmV9SAYx6g==}
    engines: {node: '>=0.10.0'}

  eventemitter3@5.0.4:
    resolution: {integrity: sha512-mlsTRyGaPBjPedk6Bvw+aqbsXDtoAyAzm5MO7JgU+yVRyMQ5O8bD4Kcci7BS85f93veegeCPkL8R4GLClnjLFw==}

  events@3.3.0:
    resolution: {integrity: sha512-mQw+2fkQbALzQ7V0MY0IqdnXNOeTtP4r0lN9z7AAawCXgqea7bDii20AYrIBrFd/Hx0M2Ocz6S111CaFkUcb0Q==}
    engines: {node: '>=0.8.x'}

  fast-deep-equal@3.1.3:
    resolution: {integrity: sha512-f3qQ9oQy9j2AhBe/H9VC91wLmKBCCU/gDOnKNAYG5hswO7BLKj09Hc5HYNz9cGI++xlpDCIgDaitVs03ATR84Q==}

  fast-glob@3.3.1:
    resolution: {integrity: sha512-kNFPyjhh5cKjrUltxs+wFx+ZkbRaxxmZ+X0ZU31SOsxCEtP9VPgtq2teZw1DebupL5GmDaNQ6yKMMVcM41iqDg==}
    engines: {node: '>=8.6.0'}

  fast-glob@3.3.3:
    resolution: {integrity: sha512-7MptL8U0cqcFdzIzwOTHoilX9x5BrNqye7Z/LuC7kCMRio1EMSyqRK3BEAUD7sXRq4iT4AzTVuZdhgQ2TCvYLg==}
    engines: {node: '>=8.6.0'}

  fast-json-stable-stringify@2.1.0:
    resolution: {integrity: sha512-lhd/wF+Lk98HZoTCtlVraHtfh5XYijIjalXck7saUtuanSDyLMxnHhSXEDJqHxD7msR8D0uCmqlkwjCV8xvwHw==}

  fast-levenshtein@2.0.6:
    resolution: {integrity: sha512-DCXu6Ifhqcks7TZKY3Hxp3y6qphY5SJZmrWMDrKcERSOXWQdMhU9Ig/PYrzyw/ul9jOIyh0N4M0tbC5hodg8dw==}

  fast-uri@3.1.7:
    resolution: {integrity: sha512-dOvZVzjdZdz7phd9v6jCbwxrBW3fK6n8Rc0CtdmM4bumzMnxywBYhuph6J819RRw/ku+rLbelwfMunktuzVVHg==}

  fastq@1.20.1:
    resolution: {integrity: sha512-GGToxJ/w1x32s/D2EKND7kTil4n8OVk/9mycTc4VDza13lOvpUZTGX3mFSCtV9ksdGBVzvsyAVLM6mHFThxXxw==}

  fdir@6.5.0:
    resolution: {integrity: sha512-tIbYtZbucOs0BRGqPJkshJUYdL+SDH7dVM8gjy+ERp3WAUjLEFJE+02kanyHtwjWOnwrKYBiwAmM0p4kLJAnXg==}
    engines: {node: '>=12.0.0'}
    peerDependencies:
      picomatch: ^3 || ^4
    peerDependenciesMeta:
      picomatch:
        optional: true

  fflate@0.7.4:
    resolution: {integrity: sha512-5u2V/CDW15QM1XbbgS+0DfPxVB+jUKhWEKuuFuHncbk3tEEqzmoXL+2KyOFuKGqOnmdIy0/davWF1CkuwtibCw==}

  file-entry-cache@8.0.0:
    resolution: {integrity: sha512-XXTUwCvisa5oacNGRP9SfNtYBNAMi+RPwBFmblZEF7N7swHYQS6/Zfk7SRwx4D5j3CH211YNRco1DEMNVfZCnQ==}
    engines: {node: '>=16.0.0'}

  fill-range@7.1.1:
    resolution: {integrity: sha512-YsGpe3WHLK8ZYi4tWDg2Jy3ebRz2rXowDxnld4bkQB00cc/1Zw9AWnC0i9ztDJitivtQvaI9KaLyKrc+hBW0yg==}
    engines: {node: '>=8'}

  find-up@5.0.0:
    resolution: {integrity: sha512-78/PXT1wlLLDgTzDs7sjq9hzz0vXD+zn+7wypEe4fXQxCmdmqfGsEPQxmiCSQI3ajFV91bVSsvNtrJRiW6nGng==}
    engines: {node: '>=10'}

  flat-cache@4.0.1:
    resolution: {integrity: sha512-f7ccFPK3SXFHpx15UIGyRJ/FJQctuKZ0zVuN3frBo4HnK3cay9VEW0R6yPYFHC0AgqhukPzKjq22t5DmAyqGyw==}
    engines: {node: '>=16'}

  flatted@3.4.2:
    resolution: {integrity: sha512-PjDse7RzhcPkIJwy5t7KPWQSZ9cAbzQXcafsetQoD7sOJRQlGikNbx7yZp2OotDnJyrDcbyRq3Ttb18iYOqkxA==}

  for-each@0.3.5:
    resolution: {integrity: sha512-dKx12eRCVIzqCxFGplyFKJMPvLEWgmNtUrpTiJIR5u97zEhRG8ySrtboPHZXx7daLxQVrl643cTzbab2tkQjxg==}
    engines: {node: '>= 0.4'}

  fsevents@2.3.3:
    resolution: {integrity: sha512-5xoDfX+fL7faATnagmWPpbFtwh/R77WmMMqqHGS65C3vvB0YHrgF+B1YmZ3441tMj5n63k0212XNoJwzlhffQw==}
    engines: {node: ^8.16.0 || ^10.6.0 || >=11.0.0}
    os: [darwin]

  function-bind@1.1.2:
    resolution: {integrity: sha512-7XHNxH7qX9xG5mIwxkhumTox/MIRNcOgDrxWsMt2pAr23WHp6MrRlN7FBSFpCpr+oVO0F744iUgR82nJMfG2SA==}

  function.prototype.name@1.1.8:
    resolution: {integrity: sha512-e5iwyodOHhbMr/yNrc7fDYG4qlbIvI5gajyzPnb5TCwyhjApznQh1BMFou9b30SevY43gCJKXycoCBjMbsuW0Q==}
    engines: {node: '>= 0.4'}

  functions-have-names@1.2.3:
    resolution: {integrity: sha512-xckBUXyTIqT97tq2x2AMb+g163b5JFysYk0x4qxNFwbfQkmNZoiRHb6sPzI9/QV33WeuvVYBUIiD4NzNIyqaRQ==}

  generator-function@2.0.1:
    resolution: {integrity: sha512-SFdFmIJi+ybC0vjlHN0ZGVGHc3lgE0DxPAT0djjVg+kjOnSqclqmj0KQ7ykTOLP6YxoqOvuAODGdcHJn+43q3g==}
    engines: {node: '>= 0.4'}

  gensync@1.0.0-beta.2:
    resolution: {integrity: sha512-3hN7NaskYvMDLQY55gnW3NQ+mesEAepTqlg+VEbj7zzqEMBVNhzcGYYeqFo/TlYz6eQiFcp1HcsCZO+nGgS8zg==}
    engines: {node: '>=6.9.0'}

  get-intrinsic@1.3.0:
    resolution: {integrity: sha512-9fSjSaos/fRIVIp+xSJlE6lfwhES7LNtKaCBIamHsjr2na1BiABJPo0mOjjz8GJDURarmCPGqaiVg5mfjb98CQ==}
    engines: {node: '>= 0.4'}

  get-nonce@1.0.1:
    resolution: {integrity: sha512-FJhYRoDaiatfEkUK8HKlicmu/3SGFD51q3itKDGoSTysQJBnfOcxU5GxnhE1E6soB76MbT0MBtnKJuXyAx+96Q==}
    engines: {node: '>=6'}

  get-proto@1.0.1:
    resolution: {integrity: sha512-sTSfBjoXBp89JvIKIefqw7U2CCebsc74kiY6awiGogKtoSGbgjYE/G/+l9sF3MWFPNc9IcoOC4ODfKHfxFmp0g==}
    engines: {node: '>= 0.4'}

  get-symbol-description@1.1.0:
    resolution: {integrity: sha512-w9UMqWwJxHNOvoNzSJ2oPF5wvYcvP7jUvYzhp67yEhTi17ZDBBC1z9pTdGuzjD+EFIqLSYRweZjqfiPzQ06Ebg==}
    engines: {node: '>= 0.4'}

  get-tsconfig@4.14.0:
    resolution: {integrity: sha512-yTb+8DXzDREzgvYmh6s9vHsSVCHeC0G3PI5bEXNBHtmshPnO+S5O7qgLEOn0I5QvMy6kpZN8K1NKGyilLb93wA==}

  glob-parent@5.1.2:
    resolution: {integrity: sha512-AOIgSQCepiJYwP3ARnGx+5VnTu2HBYdzbGP45eLw1vr3zB3vZLeyed1sC9hnbcOc9/SrMyM5RPQrkGz4aS9Zow==}
    engines: {node: '>= 6'}

  glob-parent@6.0.2:
    resolution: {integrity: sha512-XxwI8EOhVQgWp6iDL+3b0r86f4d6AX6zSU55HfB4ydCEuXLXc5FcYeOu+nnGftS4TEju/11rt4KJPTMgbfmv4A==}
    engines: {node: '>=10.13.0'}

  glob-to-regexp@0.4.1:
    resolution: {integrity: sha512-lkX1HJXwyMcprw/5YUZc2s7DrpAiHB21/V+E1rHUrVNokkvB6bqMzT0VfV6/86ZNabt1k14YOIaT7nDvOX3Iiw==}

  globals@14.0.0:
    resolution: {integrity: sha512-oahGvuMGQlPw/ivIYBjVSrWAfWLBeku5tpPE2fOPLi+WHffIWbuh2tCjhyQhTBPMf5E9jDEH4FOmTYgYwbKwtQ==}
    engines: {node: '>=18'}

  globals@16.4.0:
    resolution: {integrity: sha512-ob/2LcVVaVGCYN+r14cnwnoDPUufjiYgSqRhiFD0Q1iI4Odora5RE8Iv1D24hAz5oMophRGkGz+yuvQmmUMnMw==}
    engines: {node: '>=18'}

  globalthis@1.0.4:
    resolution: {integrity: sha512-DpLKbNU4WylpxJykQujfCcwYWiV/Jhm50Goo0wrVILAv5jOr9d+H+UR3PhSCD2rCCEIg0uc+G+muBTwD54JhDQ==}
    engines: {node: '>= 0.4'}

  gopd@1.2.0:
    resolution: {integrity: sha512-ZUKRh6/kUFoAiTAtTYPZJ3hw9wNxx+BIBOijnlG9PnrJsCcSjs1wyyD6vJpaYtgnzDrKYRSqf3OO6Rfa93xsRg==}
    engines: {node: '>= 0.4'}

  graceful-fs@4.2.11:
    resolution: {integrity: sha512-RbJ5/jmFcNNCcDV5o9eTnBLJ/HszWV0P73bc+Ff4nS/rJj+YaS6IGyiOL0VoBYX+l1Wrl3k63h/KrH+nhJ0XvQ==}

  has-bigints@1.1.0:
    resolution: {integrity: sha512-R3pbpkcIqv2Pm3dUwgjclDRVmWpTJW2DcMzcIhEXEx1oh/CEMObMm3KLmRJOdvhM7o4uQBnwr8pzRK2sJWIqfg==}
    engines: {node: '>= 0.4'}

  has-flag@4.0.0:
    resolution: {integrity: sha512-EykJT/Q1KjTWctppgIAgfSO0tKVuZUjhgMr17kqTumMl6Afv3EISleU7qZUzoXDFTAHTDC4NOoG/ZxU3EvlMPQ==}
    engines: {node: '>=8'}

  has-property-descriptors@1.0.2:
    resolution: {integrity: sha512-55JNKuIW+vq4Ke1BjOTjM2YctQIvCT7GFzHwmfZPGo5wnrgkid0YQtnAleFSqumZm4az3n2BS+erby5ipJdgrg==}

  has-proto@1.2.0:
    resolution: {integrity: sha512-KIL7eQPfHQRC8+XluaIw7BHUwwqL19bQn4hzNgdr+1wXoU0KKj6rufu47lhY7KbJR2C6T6+PfyN0Ea7wkSS+qQ==}
    engines: {node: '>= 0.4'}

  has-symbols@1.1.0:
    resolution: {integrity: sha512-1cDNdwJ2Jaohmb3sg4OmKaMBwuC48sYni5HUw2DvsC8LjGTLK9h+eb1X6RyuOHe4hT0ULCW68iomhjUoKUqlPQ==}
    engines: {node: '>= 0.4'}

  has-tostringtag@1.0.2:
    resolution: {integrity: sha512-NqADB8VjPFLM2V0VvHUewwwsw0ZWBaIdgo+ieHtK3hasLz4qeCRjYcqfB6AQrBggRKppKF8L52/VqdVsO47Dlw==}
    engines: {node: '>= 0.4'}

  hasown@2.0.3:
    resolution: {integrity: sha512-ej4AhfhfL2Q2zpMmLo7U1Uv9+PyhIZpgQLGT1F9miIGmiCJIoCgSmczFdrc97mWT4kVY72KA+WnnhJ5pghSvSg==}
    engines: {node: '>= 0.4'}

  hermes-estree@0.25.1:
    resolution: {integrity: sha512-0wUoCcLp+5Ev5pDW2OriHC2MJCbwLwuRx+gAqMTOkGKJJiBCLjtrvy4PWUGn6MIVefecRpzoOZ/UV6iGdOr+Cw==}

  hermes-parser@0.25.1:
    resolution: {integrity: sha512-6pEjquH3rqaI6cYAXYPcz9MS4rY6R4ngRgrgfDshRptUZIc3lw0MCIJIGDj9++mfySOuPTHB4nrSW99BCvOPIA==}

  hex-rgb@4.3.0:
    resolution: {integrity: sha512-Ox1pJVrDCyGHMG9CFg1tmrRUMRPRsAWYc/PinY0XzJU4K7y7vjNoLKIQ7BR5UJMCxNN8EM1MNDmHWA/B3aZUuw==}
    engines: {node: '>=6'}

  ignore@5.3.2:
    resolution: {integrity: sha512-hsBTNUqQTDwkWtcdYI2i06Y/nUBEsNEDJKjWdigLvegy8kDuJAS8uRlpkkcQpyEXL0Z/pjDy5HBmMjRCJ2gq+g==}
    engines: {node: '>= 4'}

  ignore@7.0.5:
    resolution: {integrity: sha512-Hs59xBNfUIunMFgWAbGX5cq6893IbWg4KnrjbYwX3tx0ztorVgTDA6B2sxf8ejHJ4wz8BqGUMYlnzNBer5NvGg==}
    engines: {node: '>= 4'}

  image-size@2.0.2:
    resolution: {integrity: sha512-IRqXKlaXwgSMAMtpNzZa1ZAe8m+Sa1770Dhk8VkSsP9LS+iHD62Zd8FQKs8fbPiagBE7BzoFX23cxFnwshpV6w==}
    engines: {node: '>=16.x'}
    hasBin: true

  immer@10.2.0:
    resolution: {integrity: sha512-d/+XTN3zfODyjr89gM3mPq1WNX2B8pYsu7eORitdwyA2sBubnTl3laYlBk4sXY5FUa5qTZGBDPJICVbvqzjlbw==}

  immer@11.1.16:
    resolution: {integrity: sha512-Xs7H9rBc+kti1J6RueUvbEBkmOz7jqj11XYgf+YMXAYzu8EeE7hwZ9poLXdVfVnGmJu7QAf41T7H2KuF6QoK6Q==}

  import-fresh@3.3.1:
    resolution: {integrity: sha512-TR3KfrTZTYLPB6jUjfx6MF9WcWrHL9su5TObK4ZkYgBdWKPOFoSoQIdEuTuR82pmtxH2spWG9h6etwfr1pLBqQ==}
    engines: {node: '>=6'}

  imurmurhash@0.1.4:
    resolution: {integrity: sha512-JmXMZ6wuvDmLiHEml9ykzqO6lwFbof0GG4IkcGaENdCRDDmMVnny7s5HsIgHCbaq0w2MyPhDqkhTUgS2LU2PHA==}
    engines: {node: '>=0.8.19'}

  input-otp@1.4.2:
    resolution: {integrity: sha512-l3jWwYNvrEa6NTCt7BECfCm48GvwuZzkoeG3gBL2w4CHeOXW3eKFmf9UNYkNfYc3mxMrthMnxjIE07MT0zLBQA==}
    peerDependencies:
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0.0 || ^19.0.0-rc

  internal-slot@1.1.0:
    resolution: {integrity: sha512-4gd7VpWNQNB4UKKCFFVcp1AVv+FMOgs9NKzjHKusc8jTMhd5eL1NqQqOpE0KzMds804/yHlglp3uxgluOqAPLw==}
    engines: {node: '>= 0.4'}

  internmap@2.0.3:
    resolution: {integrity: sha512-5Hh7Y1wQbvY5ooGgPbDaL5iYLAPzMTUrjMulskHLH6wnv/A+1q5rgEaiuqEjB+oxGXIVZs1FF+R/KPN3ZSQYYg==}
    engines: {node: '>=12'}

  ipaddr.js@2.4.0:
    resolution: {integrity: sha512-9VGk3HGanVE6JoZXHiCpnGy5X0jYDnN4EA4lntFPj+1vIWlFhIylq2CrrCOJH9EAhc5CYhq18F2Av2tgoAPsYQ==}
    engines: {node: '>= 10'}

  is-array-buffer@3.0.5:
    resolution: {integrity: sha512-DDfANUiiG2wC1qawP66qlTugJeL5HyzMpfr8lLK+jMQirGzNod0B12cFB/9q838Ru27sBwfw78/rdoU7RERz6A==}
    engines: {node: '>= 0.4'}

  is-async-function@2.1.1:
    resolution: {integrity: sha512-9dgM/cZBnNvjzaMYHVoxxfPj2QXt22Ev7SuuPrs+xav0ukGB0S6d4ydZdEiM48kLx5kDV+QBPrpVnFyefL8kkQ==}
    engines: {node: '>= 0.4'}

  is-bigint@1.1.0:
    resolution: {integrity: sha512-n4ZT37wG78iz03xPRKJrHTdZbe3IicyucEtdRsV5yglwc3GyUfbAfpSeD0FJ41NbUNSt5wbhqfp1fS+BgnvDFQ==}
    engines: {node: '>= 0.4'}

  is-boolean-object@1.2.2:
    resolution: {integrity: sha512-wa56o2/ElJMYqjCjGkXri7it5FbebW5usLw/nPmCMs5DeZ7eziSYZhSmPRn0txqeW4LnAmQQU7FgqLpsEFKM4A==}
    engines: {node: '>= 0.4'}

  is-bun-module@2.0.0:
    resolution: {integrity: sha512-gNCGbnnnnFAUGKeZ9PdbyeGYJqewpmc2aKHUEMO5nQPWU9lOmv7jcmQIv+qHD8fXW6W7qfuCwX4rY9LNRjXrkQ==}

  is-callable@1.2.7:
    resolution: {integrity: sha512-1BC0BVFhS/p0qtw6enp8e+8OD0UrK0oFLztSjNzhcKA3WDuJxxAPXzPuPtKkjEY9UUoEWlX/8fgKeu2S8i9JTA==}
    engines: {node: '>= 0.4'}

  is-core-module@2.16.2:
    resolution: {integrity: sha512-evOr8xfXKxE6qSR0hSXL2r3sd7ALj8+7jQEUvPYcm5sgZFdJ+AYzT6yNmJenvIYQBgIGwfwz08sL8zoL7yq2BA==}
    engines: {node: '>= 0.4'}

  is-data-view@1.0.2:
    resolution: {integrity: sha512-RKtWF8pGmS87i2D6gqQu/l7EYRlVdfzemCJN/P3UOs//x1QE7mfhvzHIApBTRf7axvT6DMGwSwBXYCT0nfB9xw==}
    engines: {node: '>= 0.4'}

  is-date-object@1.1.0:
    resolution: {integrity: sha512-PwwhEakHVKTdRNVOw+/Gyh0+MzlCl4R6qKvkhuvLtPMggI1WAHt9sOwZxQLSGpUaDnrdyDsomoRgNnCfKNSXXg==}
    engines: {node: '>= 0.4'}

  is-extglob@2.1.1:
    resolution: {integrity: sha512-SbKbANkN603Vi4jEZv49LeVJMn4yGwsbzZworEoyEiutsN3nJYdbO36zfhGJ6QEDpOZIFkDtnq5JRxmvl3jsoQ==}
    engines: {node: '>=0.10.0'}

  is-finalizationregistry@1.1.1:
    resolution: {integrity: sha512-1pC6N8qWJbWoPtEjgcL2xyhQOP491EQjeUo3qTKcmV8YSDDJrOepfG8pcC7h/QgnQHYSv0mJ3Z/ZWxmatVrysg==}
    engines: {node: '>= 0.4'}

  is-generator-function@1.1.2:
    resolution: {integrity: sha512-upqt1SkGkODW9tsGNG5mtXTXtECizwtS2kA161M+gJPc1xdb/Ax629af6YrTwcOeQHbewrPNlE5Dx7kzvXTizA==}
    engines: {node: '>= 0.4'}

  is-glob@4.0.3:
    resolution: {integrity: sha512-xelSayHH36ZgE7ZWhli7pW34hNbNl8Ojv5KVmkJD4hBdD3th8Tfk9vYasLM+mXWOZhFkgZfxhLSnrwRr4elSSg==}
    engines: {node: '>=0.10.0'}

  is-map@2.0.3:
    resolution: {integrity: sha512-1Qed0/Hr2m+YqxnM09CjA2d/i6YZNfF6R2oRAOj36eUdS6qIV/huPJNSEpKbupewFs+ZsJlxsjjPbc0/afW6Lw==}
    engines: {node: '>= 0.4'}

  is-negative-zero@2.0.3:
    resolution: {integrity: sha512-5KoIu2Ngpyek75jXodFvnafB6DJgr3u8uuK0LEZJjrU19DrMD3EVERaR8sjz8CCGgpZvxPl9SuE1GMVPFHx1mw==}
    engines: {node: '>= 0.4'}

  is-number-object@1.1.1:
    resolution: {integrity: sha512-lZhclumE1G6VYD8VHe35wFaIif+CTy5SJIi5+3y4psDgWu4wPDoBhF8NxUOinEc7pHgiTsT6MaBb92rKhhD+Xw==}
    engines: {node: '>= 0.4'}

  is-number@7.0.0:
    resolution: {integrity: sha512-41Cifkg6e8TylSpdtTpeLVMqvSBEVzTttHvERD741+pnZ8ANv0004MRL43QKPDlK9cGvNp6NZWZUBlbGXYxxng==}
    engines: {node: '>=0.12.0'}

  is-regex@1.2.1:
    resolution: {integrity: sha512-MjYsKHO5O7mCsmRGxWcLWheFqN9DJ/2TmngvjKXihe6efViPqc274+Fx/4fYj/r03+ESvBdTXK0V6tA3rgez1g==}
    engines: {node: '>= 0.4'}

  is-set@2.0.3:
    resolution: {integrity: sha512-iPAjerrse27/ygGLxw+EBR9agv9Y6uLeYVJMu+QNCoouJ1/1ri0mGrcWpfCqFZuzzx3WjtwxG098X+n4OuRkPg==}
    engines: {node: '>= 0.4'}

  is-shared-array-buffer@1.0.4:
    resolution: {integrity: sha512-ISWac8drv4ZGfwKl5slpHG9OwPNty4jOWPRIhBpxOoD+hqITiwuipOQ2bNthAzwA3B4fIjO4Nln74N0S9byq8A==}
    engines: {node: '>= 0.4'}

  is-string@1.1.1:
    resolution: {integrity: sha512-BtEeSsoaQjlSPBemMQIrY1MY0uM6vnS1g5fmufYOtnxLGUZM2178PKbhsk7Ffv58IX+ZtcvoGwccYsh0PglkAA==}
    engines: {node: '>= 0.4'}

  is-symbol@1.1.1:
    resolution: {integrity: sha512-9gGx6GTtCQM73BgmHQXfDmLtfjjTUDSyoxTCbp5WtoixAhfgsDirWIcVQ/IHpvI5Vgd5i/J5F7B9cN/WlVbC/w==}
    engines: {node: '>= 0.4'}

  is-typed-array@1.1.15:
    resolution: {integrity: sha512-p3EcsicXjit7SaskXHs1hA91QxgTw46Fv6EFKKGS5DRFLD8yKnohjF3hxoju94b/OcMZoQukzpPpBE9uLVKzgQ==}
    engines: {node: '>= 0.4'}

  is-weakmap@2.0.2:
    resolution: {integrity: sha512-K5pXYOm9wqY1RgjpL3YTkF39tni1XajUIkawTLUo9EZEVUFga5gSQJF8nNS7ZwJQ02y+1YCNYcMh+HIf1ZqE+w==}
    engines: {node: '>= 0.4'}

  is-weakref@1.1.1:
    resolution: {integrity: sha512-6i9mGWSlqzNMEqpCp93KwRS1uUOodk2OJ6b+sq7ZPDSy2WuI5NFIxp/254TytR8ftefexkWn5xNiHUNpPOfSew==}
    engines: {node: '>= 0.4'}

  is-weakset@2.0.4:
    resolution: {integrity: sha512-mfcwb6IzQyOKTs84CQMrOwW4gQcaTOAWJ0zzJCl2WSPDrWk/OzDaImWFH3djXhb24g4eudZfLRozAvPGw4d9hQ==}
    engines: {node: '>= 0.4'}

  isarray@2.0.5:
    resolution: {integrity: sha512-xHjhDr3cNBK0BzdUJSPXZntQUx/mwMS5Rw4A7lPJ90XGAO6ISP/ePDNuo0vhqOZU+UD5JoodwCAAoZQd3FeAKw==}

  isexe@2.0.0:
    resolution: {integrity: sha512-RHxMLp9lnKHGHRng9QFhRCMbYAcVpn69smSGcq3f36xjgVVWThj4qqLbTLlq7Ssj8B+fIQ1EuCEGI2lKsyQeIw==}

  iterator.prototype@1.1.5:
    resolution: {integrity: sha512-H0dkQoCa3b2VEeKQBOxFph+JAbcrQdE7KC0UkqwpLmv2EC4P41QXP+rqo9wYodACiG5/WM5s9oDApTU8utwj9g==}
    engines: {node: '>= 0.4'}

  jest-worker@27.5.1:
    resolution: {integrity: sha512-7vuh85V5cdDofPyxn58nrPjBktZo0u9x1g8WtjQol+jZDaE+fhN+cIvTj11GndBnMnyfrUOG1sZQxCdjKh+DKg==}
    engines: {node: '>= 10.13.0'}

  jiti@2.7.0:
    resolution: {integrity: sha512-AC/7JofJvZGrrneWNaEnJeOLUx+JlGt7tNa0wZiRPT4MY1wmfKjt2+6O2p2uz2+skll8OZZmJMNqeke7kKbNgQ==}
    hasBin: true

  js-tokens@4.0.0:
    resolution: {integrity: sha512-RdJUflcE3cUzKiMqQgsCu06FPu9UdIJO0beYbPhHN4k6apgJtifcoCtT9bcxOpYBtpD2kCM6Sbzg4CausW/PKQ==}

  js-tokens@9.0.1:
    resolution: {integrity: sha512-mxa9E9ITFOt0ban3j6L5MpjwegGz6lBQmM1IJkWeBZGcMxto50+eWdjC/52xDbS2vy0k7vIMK0Fe2wfL9OQSpQ==}

  js-yaml@4.1.1:
    resolution: {integrity: sha512-qQKT4zQxXl8lLwBtHMWwaTcGfFOZviOJet3Oy/xmGk2gZH677CJM9EvtfdSkgWcATZhj/55JZ0rmy3myCT5lsA==}
    hasBin: true

  jsesc@3.1.0:
    resolution: {integrity: sha512-/sM3dO2FOzXjKQhJuo0Q173wf2KOo8t4I8vHy6lF9poUp7bKT0/NHE8fPX23PwfhnykfqnC2xRxOnVw5XuGIaA==}
    engines: {node: '>=6'}
    hasBin: true

  json-buffer@3.0.1:
    resolution: {integrity: sha512-4bV5BfR2mqfQTJm+V5tPPdf+ZpuhiIvTuAB5g8kcrXOZpTT/QwwVRWBywX1ozr6lEuPdbHxwaJlm9G6mI2sfSQ==}

  json-schema-traverse@0.4.1:
    resolution: {integrity: sha512-xbbCH5dCYU5T8LcEhhuh7HJ88HXuW3qsI3Y0zOZFKfZEHcpWiHU/Jxzk629Brsab/mMiHQti9wMP+845RPe3Vg==}

  json-schema-traverse@1.0.0:
    resolution: {integrity: sha512-NM8/P9n3XjXhIZn1lLhkFaACTOURQXjWhV4BA/RnOv8xvgqtqpAX9IO4mRQxSx1Rlo4tqzeqb0sOlruaOy3dug==}

  json-stable-stringify-without-jsonify@1.0.1:
    resolution: {integrity: sha512-Bdboy+l7tA3OGW6FjyFHWkP5LuByj1Tk33Ljyq0axyzdk9//JSi2u3fP1QSmd1KNwq6VOKYGlAu87CisVir6Pw==}

  json5@1.0.2:
    resolution: {integrity: sha512-g1MWMLBiz8FKi1e4w0UyVL3w+iJceWAFBAaBnnGKOpNa5f8TLktkbre1+s6oICydWAm+HRUGTmI+//xv2hvXYA==}
    hasBin: true

  json5@2.2.3:
    resolution: {integrity: sha512-XmOWe7eyHYH14cLdVPoyg+GOH3rYX++KpzrylJwSW98t3Nk+U8XOl8FWKOgwtzdb8lXGf6zYwDUzeHMWfxasyg==}
    engines: {node: '>=6'}
    hasBin: true

  jsx-ast-utils@3.3.5:
    resolution: {integrity: sha512-ZZow9HBI5O6EPgSJLUb8n2NKgmVWTwCvHGwFuJlMjvLFqlGG6pjirPhtdsseaLZjSibD8eegzmYpUZwoIlj2cQ==}
    engines: {node: '>=4.0'}

  keyv@4.5.4:
    resolution: {integrity: sha512-oxVHkHR/EJf2CNXnWxRLW6mg7JyCCUcG0DtEGmL2ctUo1PNTin1PUil+r/+4r5MpVgC/fn1kjsx7mjSujKqIpw==}

  kleur@4.1.5:
    resolution: {integrity: sha512-o+NO+8WrRiQEE4/7nwRJhN1HWpVmJm511pBHUxPLtp0BUISzlBplORYSmTclCnJvQq2tKu/sgl3xVpkc7ZWuQQ==}
    engines: {node: '>=6'}

  language-subtag-registry@0.3.23:
    resolution: {integrity: sha512-0K65Lea881pHotoGEa5gDlMxt3pctLi2RplBb7Ezh4rRdLEOtgi7n4EwK9lamnUCkKBqaeKRVebTq6BAxSkpXQ==}

  language-tags@1.0.9:
    resolution: {integrity: sha512-MbjN408fEndfiQXbFQ1vnd+1NoLDsnQW41410oQBXiyXDMYH5z505juWa4KUE1LqxRC7DgOgZDbKLxHIwm27hA==}
    engines: {node: '>=0.10'}

  leaflet@1.9.4:
    resolution: {integrity: sha512-nxS1ynzJOmOlHp+iL3FyWqK89GtNL8U8rvlMOsQdTTssxZwCXh8N2NB3GDQOL+YR3XnWyZAxwQixURb+FA74PA==}

  levn@0.4.1:
    resolution: {integrity: sha512-+bT2uH4E5LGE7h/n3evcS/sQlJXCpIp6ym8OWJ5eV6+67Dsql/LaaT7qJBAt2rzfoa/5QBGBhxDix1dMt2kQKQ==}
    engines: {node: '>= 0.8.0'}

  lightningcss-android-arm64@1.31.1:
    resolution: {integrity: sha512-HXJF3x8w9nQ4jbXRiNppBCqeZPIAfUo8zE/kOEGbW5NZvGc/K7nMxbhIr+YlFlHW5mpbg/YFPdbnCh1wAXCKFg==}
    engines: {node: '>= 12.0.0'}
    cpu: [arm64]
    os: [android]

  lightningcss-android-arm64@1.32.0:
    resolution: {integrity: sha512-YK7/ClTt4kAK0vo6w3X+Pnm0D2cf2vPHbhOXdoNti1Ga0al1P4TBZhwjATvjNwLEBCnKvjJc2jQgHXH0NEwlAg==}
    engines: {node: '>= 12.0.0'}
    cpu: [arm64]
    os: [android]

  lightningcss-darwin-arm64@1.31.1:
    resolution: {integrity: sha512-02uTEqf3vIfNMq3h/z2cJfcOXnQ0GRwQrkmPafhueLb2h7mqEidiCzkE4gBMEH65abHRiQvhdcQ+aP0D0g67sg==}
    engines: {node: '>= 12.0.0'}
    cpu: [arm64]
    os: [darwin]

  lightningcss-darwin-arm64@1.32.0:
    resolution: {integrity: sha512-RzeG9Ju5bag2Bv1/lwlVJvBE3q6TtXskdZLLCyfg5pt+HLz9BqlICO7LZM7VHNTTn/5PRhHFBSjk5lc4cmscPQ==}
    engines: {node: '>= 12.0.0'}
    cpu: [arm64]
    os: [darwin]

  lightningcss-darwin-x64@1.31.1:
    resolution: {integrity: sha512-1ObhyoCY+tGxtsz1lSx5NXCj3nirk0Y0kB/g8B8DT+sSx4G9djitg9ejFnjb3gJNWo7qXH4DIy2SUHvpoFwfTA==}
    engines: {node: '>= 12.0.0'}
    cpu: [x64]
    os: [darwin]

  lightningcss-darwin-x64@1.32.0:
    resolution: {integrity: sha512-U+QsBp2m/s2wqpUYT/6wnlagdZbtZdndSmut/NJqlCcMLTWp5muCrID+K5UJ6jqD2BFshejCYXniPDbNh73V8w==}
    engines: {node: '>= 12.0.0'}
    cpu: [x64]
    os: [darwin]

  lightningcss-freebsd-x64@1.31.1:
    resolution: {integrity: sha512-1RINmQKAItO6ISxYgPwszQE1BrsVU5aB45ho6O42mu96UiZBxEXsuQ7cJW4zs4CEodPUioj/QrXW1r9pLUM74A==}
    engines: {node: '>= 12.0.0'}
    cpu: [x64]
    os: [freebsd]

  lightningcss-freebsd-x64@1.32.0:
    resolution: {integrity: sha512-JCTigedEksZk3tHTTthnMdVfGf61Fky8Ji2E4YjUTEQX14xiy/lTzXnu1vwiZe3bYe0q+SpsSH/CTeDXK6WHig==}
    engines: {node: '>= 12.0.0'}
    cpu: [x64]
    os: [freebsd]

  lightningcss-linux-arm-gnueabihf@1.31.1:
    resolution: {integrity: sha512-OOCm2//MZJ87CdDK62rZIu+aw9gBv4azMJuA8/KB74wmfS3lnC4yoPHm0uXZ/dvNNHmnZnB8XLAZzObeG0nS1g==}
    engines: {node: '>= 12.0.0'}
    cpu: [arm]
    os: [linux]

  lightningcss-linux-arm-gnueabihf@1.32.0:
    resolution: {integrity: sha512-x6rnnpRa2GL0zQOkt6rts3YDPzduLpWvwAF6EMhXFVZXD4tPrBkEFqzGowzCsIWsPjqSK+tyNEODUBXeeVHSkw==}
    engines: {node: '>= 12.0.0'}
    cpu: [arm]
    os: [linux]

  lightningcss-linux-arm64-gnu@1.31.1:
    resolution: {integrity: sha512-WKyLWztD71rTnou4xAD5kQT+982wvca7E6QoLpoawZ1gP9JM0GJj4Tp5jMUh9B3AitHbRZ2/H3W5xQmdEOUlLg==}
    engines: {node: '>= 12.0.0'}
    cpu: [arm64]
    os: [linux]
    libc: [glibc]

  lightningcss-linux-arm64-gnu@1.32.0:
    resolution: {integrity: sha512-0nnMyoyOLRJXfbMOilaSRcLH3Jw5z9HDNGfT/gwCPgaDjnx0i8w7vBzFLFR1f6CMLKF8gVbebmkUN3fa/kQJpQ==}
    engines: {node: '>= 12.0.0'}
    cpu: [arm64]
    os: [linux]
    libc: [glibc]

  lightningcss-linux-arm64-musl@1.31.1:
    resolution: {integrity: sha512-mVZ7Pg2zIbe3XlNbZJdjs86YViQFoJSpc41CbVmKBPiGmC4YrfeOyz65ms2qpAobVd7WQsbW4PdsSJEMymyIMg==}
    engines: {node: '>= 12.0.0'}
    cpu: [arm64]
    os: [linux]
    libc: [musl]

  lightningcss-linux-arm64-musl@1.32.0:
    resolution: {integrity: sha512-UpQkoenr4UJEzgVIYpI80lDFvRmPVg6oqboNHfoH4CQIfNA+HOrZ7Mo7KZP02dC6LjghPQJeBsvXhJod/wnIBg==}
    engines: {node: '>= 12.0.0'}
    cpu: [arm64]
    os: [linux]
    libc: [musl]

  lightningcss-linux-x64-gnu@1.31.1:
    resolution: {integrity: sha512-xGlFWRMl+0KvUhgySdIaReQdB4FNudfUTARn7q0hh/V67PVGCs3ADFjw+6++kG1RNd0zdGRlEKa+T13/tQjPMA==}
    engines: {node: '>= 12.0.0'}
    cpu: [x64]
    os: [linux]
    libc: [glibc]

  lightningcss-linux-x64-gnu@1.32.0:
    resolution: {integrity: sha512-V7Qr52IhZmdKPVr+Vtw8o+WLsQJYCTd8loIfpDaMRWGUZfBOYEJeyJIkqGIDMZPwPx24pUMfwSxxI8phr/MbOA==}
    engines: {node: '>= 12.0.0'}
    cpu: [x64]
    os: [linux]
    libc: [glibc]

  lightningcss-linux-x64-musl@1.31.1:
    resolution: {integrity: sha512-eowF8PrKHw9LpoZii5tdZwnBcYDxRw2rRCyvAXLi34iyeYfqCQNA9rmUM0ce62NlPhCvof1+9ivRaTY6pSKDaA==}
    engines: {node: '>= 12.0.0'}
    cpu: [x64]
    os: [linux]
    libc: [musl]

  lightningcss-linux-x64-musl@1.32.0:
    resolution: {integrity: sha512-bYcLp+Vb0awsiXg/80uCRezCYHNg1/l3mt0gzHnWV9XP1W5sKa5/TCdGWaR/zBM2PeF/HbsQv/j2URNOiVuxWg==}
    engines: {node: '>= 12.0.0'}
    cpu: [x64]
    os: [linux]
    libc: [musl]

  lightningcss-win32-arm64-msvc@1.31.1:
    resolution: {integrity: sha512-aJReEbSEQzx1uBlQizAOBSjcmr9dCdL3XuC/6HLXAxmtErsj2ICo5yYggg1qOODQMtnjNQv2UHb9NpOuFtYe4w==}
    engines: {node: '>= 12.0.0'}
    cpu: [arm64]
    os: [win32]

  lightningcss-win32-arm64-msvc@1.32.0:
    resolution: {integrity: sha512-8SbC8BR40pS6baCM8sbtYDSwEVQd4JlFTOlaD3gWGHfThTcABnNDBda6eTZeqbofalIJhFx0qKzgHJmcPTnGdw==}
    engines: {node: '>= 12.0.0'}
    cpu: [arm64]
    os: [win32]

  lightningcss-win32-x64-msvc@1.31.1:
    resolution: {integrity: sha512-I9aiFrbd7oYHwlnQDqr1Roz+fTz61oDDJX7n9tYF9FJymH1cIN1DtKw3iYt6b8WZgEjoNwVSncwF4wx/ZedMhw==}
    engines: {node: '>= 12.0.0'}
    cpu: [x64]
    os: [win32]

  lightningcss-win32-x64-msvc@1.32.0:
    resolution: {integrity: sha512-Amq9B/SoZYdDi1kFrojnoqPLxYhQ4Wo5XiL8EVJrVsB8ARoC1PWW6VGtT0WKCemjy8aC+louJnjS7U18x3b06Q==}
    engines: {node: '>= 12.0.0'}
    cpu: [x64]
    os: [win32]

  lightningcss@1.31.1:
    resolution: {integrity: sha512-l51N2r93WmGUye3WuFoN5k10zyvrVs0qfKBhyC5ogUQ6Ew6JUSswh78mbSO+IU3nTWsyOArqPCcShdQSadghBQ==}
    engines: {node: '>= 12.0.0'}

  lightningcss@1.32.0:
    resolution: {integrity: sha512-NXYBzinNrblfraPGyrbPoD19C1h9lfI/1mzgWYvXUTe414Gz/X1FD2XBZSZM7rRTrMA8JL3OtAaGifrIKhQ5yQ==}
    engines: {node: '>= 12.0.0'}

  linebreak@1.1.0:
    resolution: {integrity: sha512-MHp03UImeVhB7XZtjd0E4n6+3xr5Dq/9xI/5FptGk5FrbDR3zagPa2DS6U8ks/3HjbKWG9Q1M2ufOzxV2qLYSQ==}

  loader-runner@4.3.2:
    resolution: {integrity: sha512-DFEqQ3ihfS9blba08cLfYf1NRAIEm+dDjic073DRDc3/JspI/8wYmtDsHwd3+4hwvdxSK7PGaElfTmm0awWJ4w==}
    engines: {node: '>=6.11.5'}

  locate-path@6.0.0:
    resolution: {integrity: sha512-iPZK6eYjbxRu3uB4/WZ3EsEIMJFMqAoopl3R+zuq0UjcAm/MO6KCweDgPfP3elTztoKP3KtnVHxTn2NHBSDVUw==}
    engines: {node: '>=10'}

  lodash.merge@4.6.2:
    resolution: {integrity: sha512-0KpjqXRVvrYyCsX1swR/XTK0va6VQkQM6MNo7PqW77ByjAhoARA8EfrP1N4+KlKj8YS0ZUCtRT/YUuhyYDujIQ==}

  loose-envify@1.4.0:
    resolution: {integrity: sha512-lyuxPGr/Wfhrlem2CL/UcnUc1zcqKAImBDzukY7Y5F/yQiNdko6+fRLevlw1HgMySw7f611UIY408EtxRSoK3Q==}
    hasBin: true

  lru-cache@5.1.1:
    resolution: {integrity: sha512-KpNARQA3Iwv+jTA0utUVVbrh+Jlrr1Fv0e56GGzAFOXN7dk/FviaDW8LHmK52DlcH4WP2n6gI8vN1aesBFgo9w==}

  lucide-react@1.31.0:
    resolution: {integrity: sha512-G8u2eEtoHUnUa9f8lbvqDhCiORMnYLdUEo06EEG9MQvHQrInKcX3Pa2TH39MM5qyzRcWETxB0+aOwAPI1g1kEg==}
    peerDependencies:
      react: ^16.5.1 || ^17.0.0 || ^18.0.0 || ^19.0.0

  magic-string@0.30.21:
    resolution: {integrity: sha512-vd2F4YUyEXKGcLHoq+TEyCjxueSeHnFxyyjNp80yg0XV4vUhnDer/lvvlqM/arB5bXQN5K2/3oinyCRyx8T2CQ==}

  math-intrinsics@1.1.0:
    resolution: {integrity: sha512-/IXtbwEk5HTPyEwyKX6hGkYXxM9nbj64B+ilVJnC/R6B0pH5G4V3b0pVbL7DBj4tkhBAppbQUlf6F6Xl9LHu1g==}
    engines: {node: '>= 0.4'}

  merge-stream@2.0.0:
    resolution: {integrity: sha512-abv/qOcuPfk3URPfDzmZU1LKmuw8kT+0nIHvKrKgFrwifol/doWcdA4ZqsWQ8ENrFKkd67Mfpo/LovbIUsbt3w==}

  merge2@1.4.1:
    resolution: {integrity: sha512-8q7VEgMJW4J8tcfVPy8g09NcQwZdbwFEqhe/WZkoIzjn/3TGDwtOCYtXGxA3O8tPzpczCCDgv+P2P5y00ZJOOg==}
    engines: {node: '>= 8'}

  micromatch@4.0.8:
    resolution: {integrity: sha512-PXwfBhYu0hBCPw8Dn0E+WDYb7af3dSLVWKi3HGv84IdF4TyFoC0ysxFd0Goxw7nSv4T/PzEJQxsYsEiFCKo2BA==}
    engines: {node: '>=8.6'}

  mime-db@1.54.0:
    resolution: {integrity: sha512-aU5EJuIN2WDemCcAp2vFBfp/m4EAhWJnUNSSw0ixs7/kXbd6Pg64EmwJkNdFhB8aWt1sH2CTXrLxo/iAGV3oPQ==}
    engines: {node: '>= 0.6'}

  miniflare@4.20260515.0:
    resolution: {integrity: sha512-2j0oQWizk1Eu4Cm8tDX7Z+Nsjd0nebIj1TQcQ+Oy1QKeo0Ay9+bdn8wfLAtOj9znDCybDCUlnS1+nYvKXEdfNg==}
    engines: {node: '>=22.0.0'}
    hasBin: true

  minimatch@10.2.5:
    resolution: {integrity: sha512-MULkVLfKGYDFYejP07QOurDLLQpcjk7Fw+7jXS2R2czRQzR56yHRveU5NDJEOviH+hETZKSkIk5c+T23GjFUMg==}
    engines: {node: 18 || 20 || >=22}

  minimatch@3.1.5:
    resolution: {integrity: sha512-VgjWUsnnT6n+NUk6eZq77zeFdpW2LWDzP6zFGrCbHXiYNul5Dzqk2HHQ5uFH2DNW5Xbp8+jVzaeNt94ssEEl4w==}

  minimist@1.2.8:
    resolution: {integrity: sha512-2yyAR8qBkN3YuheJanUpWC5U3bb5osDywNB8RzDVlDwDHbocAJveqqj1u8+SVD7jkWT4yvsHCpWqqWqAxb0zCA==}

  ms@2.1.3:
    resolution: {integrity: sha512-6FlzubTLZG3J2a/NVCAleEhjzq5oxgHyaCU9yYXvcLsvoVaHJq/s5xXI6/XXP6tz7R9xAOtHnSO/tXtF3WRTlA==}

  nanoid@3.3.18:
    resolution: {integrity: sha512-DTg4MJbGMWkfi6VZFdNt2/caMbQy4Ou+Op/hJQvGEWcnVfoA1QA+xzRKAzw9jD6+GVOOeYr/mIcuDSdug6F6+w==}
    engines: {node: ^10 || ^12 || ^13.7 || ^14 || >=15.0.1}
    hasBin: true

  napi-postinstall@0.3.4:
    resolution: {integrity: sha512-PHI5f1O0EP5xJ9gQmFGMS6IZcrVvTjpXjz7Na41gTE7eE2hK11lg04CECCYEEjdc17EV4DO+fkGEtt7TpTaTiQ==}
    engines: {node: ^12.20.0 || ^14.18.0 || >=16.0.0}
    hasBin: true

  natural-compare@1.4.0:
    resolution: {integrity: sha512-OWND8ei3VtNC9h7V60qff3SVobHr996CTwgxubgyQYEpg290h9J0buyECNNJexkFm5sOajh5G116RYA1c8ZMSw==}

  neo-async@2.6.2:
    resolution: {integrity: sha512-Yd3UES5mWCSqR+qNT93S3UoYUkqAZ9lLg8a7g9rimsWmYGK8cVToA4/sF3RrshdyV3sAGMXVUmpMYOw+dLpOuw==}

  next-themes@0.4.6:
    resolution: {integrity: sha512-pZvgD5L0IEvX5/9GWyHMf3m8BKiVQwsCMHfoFosXtXBMnaS0ZnIJ9ST4b4NqLVKDEm8QBxoNNGNaBv2JNF6XNA==}
    peerDependencies:
      react: ^16.8 || ^17 || ^18 || ^19 || ^19.0.0-rc
      react-dom: ^16.8 || ^17 || ^18 || ^19 || ^19.0.0-rc

  next@16.3.4:
    resolution: {integrity: sha512-/Ztf6CeRH+ejEXUrYtqI4gkS66eFIHuSwqi60RgcpWKodxFZx2/dqVCMKBwILfAHXQ+F1b1vAudgj3mnxqtoIA==}
    engines: {node: '>=20.9.0'}
    hasBin: true
    peerDependencies:
      '@opentelemetry/api': ^1.1.0
      '@playwright/test': ^1.51.1
      babel-plugin-react-compiler: '*'
      react: ^18.2.0 || 19.0.0-rc-de68d2f4-20241204 || ^19.0.0
      react-dom: ^18.2.0 || 19.0.0-rc-de68d2f4-20241204 || ^19.0.0
      sass: ^1.3.0
    peerDependenciesMeta:
      '@opentelemetry/api':
        optional: true
      '@playwright/test':
        optional: true
      babel-plugin-react-compiler:
        optional: true
      sass:
        optional: true

  node-exports-info@1.6.0:
    resolution: {integrity: sha512-pyFS63ptit/P5WqUkt+UUfe+4oevH+bFeIiPPdfb0pFeYEu/1ELnJu5l+5EcTKYL5M7zaAa7S8ddywgXypqKCw==}
    engines: {node: '>= 0.4'}

  node-releases@2.0.44:
    resolution: {integrity: sha512-5WUyunoPMsvvEhS8AxHtRzP+oA8UCkJ7YRxatWKjngndhDGLiqEVAQKWjFAiAiuL8zMRGzGSJxFnLetoa43qGQ==}

  object-assign@4.1.1:
    resolution: {integrity: sha512-rJgTQnkUnH1sFw8yT6VSU3zD3sWmu6sZhIseY8VX+GRu3P6F7Fu+JNDoXfklElbLJSnc3FUQHVe4cU5hj+BcUg==}
    engines: {node: '>=0.10.0'}

  object-inspect@1.13.4:
    resolution: {integrity: sha512-W67iLl4J2EXEGTbfeHCffrjDfitvLANg0UlX3wFUUSTx92KXRFegMHUVgSqE+wvhAbi4WqjGg9czysTV2Epbew==}
    engines: {node: '>= 0.4'}

  object-keys@1.1.1:
    resolution: {integrity: sha512-NuAESUOUMrlIXOfHKzD6bpPu3tYt3xvjNdRIQ+FeT0lNb4K8WR70CaDxhuNguS2XG+GjkyMwOzsN5ZktImfhLA==}
    engines: {node: '>= 0.4'}

  object.assign@4.1.7:
    resolution: {integrity: sha512-nK28WOo+QIjBkDduTINE4JkF/UJJKyf2EJxvJKfblDpyg0Q+pkOHNTL0Qwy6NP6FhE/EnzV73BxxqcJaXY9anw==}
    engines: {node: '>= 0.4'}

  object.entries@1.1.9:
    resolution: {integrity: sha512-8u/hfXFRBD1O0hPUjioLhoWFHRmt6tKA4/vZPyckBr18l1KE9uHrFaFaUi8MDRTpi4uak2goyPTSNJLXX2k2Hw==}
    engines: {node: '>= 0.4'}

  object.fromentries@2.0.8:
    resolution: {integrity: sha512-k6E21FzySsSK5a21KRADBd/NGneRegFO5pLHfdQLpRDETUNJueLXs3WCzyQ3tFRDYgbq3KHGXfTbi2bs8WQ6rQ==}
    engines: {node: '>= 0.4'}

  object.groupby@1.0.3:
    resolution: {integrity: sha512-+Lhy3TQTuzXI5hevh8sBGqbmurHbbIjAi0Z4S63nthVLmLxfbj4T54a4CfZrXIrt9iP4mVAPYMo/v99taj3wjQ==}
    engines: {node: '>= 0.4'}

  object.values@1.2.1:
    resolution: {integrity: sha512-gXah6aZrcUxjWg2zR2MwouP2eHlCBzdV4pygudehaKXSGW4v2AsRQUK+lwwXhii6KFZcunEnmSUoYp5CXibxtA==}
    engines: {node: '>= 0.4'}

  optionator@0.9.4:
    resolution: {integrity: sha512-6IpQ7mKUxRcZNLIObR0hz7lxsapSSIYNZJwXPGeF0mTVqGKFIXj1DQcMoT22S3ROcLyY/rz0PWaWZ9ayWmad9g==}
    engines: {node: '>= 0.8.0'}

  own-keys@1.0.1:
    resolution: {integrity: sha512-qFOyK5PjiWZd+QQIh+1jhdb9LpxTF0qs7Pm8o5QHYZ0M3vKqSqzsZaEB6oWlxZ+q2sJBMI/Ktgd2N5ZwQoRHfg==}
    engines: {node: '>= 0.4'}

  p-limit@3.1.0:
    resolution: {integrity: sha512-TYOanM3wGwNGsZN2cVTYPArw454xnXj5qmWF1bEoAc4+cU/ol7GVh7odevjp1FNHduHc3KZMcFduxU5Xc6uJRQ==}
    engines: {node: '>=10'}

  p-locate@5.0.0:
    resolution: {integrity: sha512-LaNjtRWUBY++zB5nE/NwcaoMylSPk+S+ZHNB1TzdbMJMny6dynpAGt7X/tl/QYq3TIeE6nxHppbo2LGymrG5Pw==}
    engines: {node: '>=10'}

  pako@0.2.9:
    resolution: {integrity: sha512-NUcwaKxUxWrZLpDG+z/xZaCgQITkA/Dv4V/T6bw7VON6l1Xz/VnrBqrYjZQ12TamKHzITTfOEIYUj48y2KXImA==}

  parent-module@1.0.1:
    resolution: {integrity: sha512-GQ2EWRpQV8/o+Aw8YqtfZZPfNRWZYkbidE9k5rpl/hC3vtHHBfGm2Ifi6qWV+coDGkrUKZAxE3Lot5kcsRlh+g==}
    engines: {node: '>=6'}

  parse-css-color@0.2.1:
    resolution: {integrity: sha512-bwS/GGIFV3b6KS4uwpzCFj4w297Yl3uqnSgIPsoQkx7GMLROXfMnWvxfNkL0oh8HVhZA4hvJoEoEIqonfJ3BWg==}

  path-exists@4.0.0:
    resolution: {integrity: sha512-ak9Qy5Q7jYb2Wwcey5Fpvg2KoAc/ZIhLSLOSBmRmygPsGwkVVt0fZa0qrtMz+m6tJTAHfZQ8FnmB4MG4LWy7/w==}
    engines: {node: '>=8'}

  path-key@3.1.1:
    resolution: {integrity: sha512-ojmeN0qd+y0jszEtoY48r0Peq5dwMEkIlCOu6Q5f41lfkswXuKtYrhgoTpLnyIcHm24Uhqx+5Tqm2InSwLhE6Q==}
    engines: {node: '>=8'}

  path-parse@1.0.7:
    resolution: {integrity: sha512-LDJzPVEEEPR+y48z93A0Ed0yXb8pAByGWo/k5YYdYgpY2/2EsOsksJrq7lOHxryrVOn1ejG6oAp8ahvOIQD8sw==}

  path-to-regexp@6.3.0:
    resolution: {integrity: sha512-Yhpw4T9C6hPpgPeA28us07OJeqZ5EzQTkbfwuhsUg0c237RomFoETJgmp2sa3F/41gfLE6G5cqcYwznmeEeOlQ==}

  pathe@2.0.3:
    resolution: {integrity: sha512-WUjGcAqP1gQacoQe+OBJsFA7Ld4DyXuUIjZ5cc75cLHvJ7dtNsTugphxIADwspS+AraAUePCKrSVtPLFj/F88w==}

  picocolors@1.1.1:
    resolution: {integrity: sha512-xceH2snhtb5M9liqDsmEw56le376mTZkEX/jEb/RxNFyegNul7eNslCXP9FDj/Lcu0X8KEyMceP2ntpaHrDEVA==}

  picomatch@2.3.2:
    resolution: {integrity: sha512-V7+vQEJ06Z+c5tSye8S+nHUfI51xoXIXjHQ99cQtKUkQqqO1kO/KCJUfZXuB47h/YBlDhah2H3hdUGXn8ie0oA==}
    engines: {node: '>=8.6'}

  picomatch@4.0.4:
    resolution: {integrity: sha512-QP88BAKvMam/3NxH6vj2o21R6MjxZUAd6nlwAS/pnGvN9IVLocLHxGYIzFhg6fUQ+5th6P4dv4eW9jX3DSIj7A==}
    engines: {node: '>=12'}

  possible-typed-array-names@1.1.0:
    resolution: {integrity: sha512-/+5VFTchJDoVj3bhoqi6UeymcD00DAwb1nJwamzPvHEszJ4FpF6SNNbUbOS8yI56qHzdV8eK0qEfOSiodkTdxg==}
    engines: {node: '>= 0.4'}

  postcss-value-parser@4.2.0:
    resolution: {integrity: sha512-1NNCs6uurfkVbeXG4S8JFT9t19m45ICnif8zWLd5oPSZ50QnwMfK+H3jv408d4jw/7Bttv5axS5IiHoLaVNHeQ==}

  postcss@8.5.23:
    resolution: {integrity: sha512-g50586zr4bZmwFiTlflMu8E0bDTb5I5gertgwAKmsdUlTQIhZtunzUlD1WSzwcVWPoAVpsrA6vlfCD7oXvRwgg==}
    engines: {node: ^10 || ^12 || >=14}

  prelude-ls@1.2.1:
    resolution: {integrity: sha512-vkcDPrRZo1QZLbn5RLGPpg/WmIQ65qoWWhcGKf/b5eplkkarX0m9z8ppCat4mlOqUsWpyNuYgO3VRyrYHSzX5g==}
    engines: {node: '>= 0.8.0'}

  prop-types@15.8.1:
    resolution: {integrity: sha512-oj87CgZICdulUohogVAR7AjlC0327U4el4L6eAvOqCeudMDVU0NThNaV+b9Df4dXgSP1gXMTnPdhfe/2qDH5cg==}

  punycode@2.3.1:
    resolution: {integrity: sha512-vYt7UD1U9Wg6138shLtLOvdAu+8DsC/ilFtEVHcH+wydcSpNE20AfSOduf6MkRFahL5FY7X1oU7nKVZFtfq8Fg==}
    engines: {node: '>=6'}

  queue-microtask@1.2.3:
    resolution: {integrity: sha512-NuaNSa6flKT5JaSYQzJok04JzTL1CA6aGhv5rfLW3PgqA+M2ChpZQnAC8h8i4ZFkBS8X5RqkDBHA7r4hej3K9A==}

  radix-ui@1.6.7:
    resolution: {integrity: sha512-QBdhh1arIEUvPC0dQ5+nwWAxt7+N+oP/9jPwjJkGFoSk/sqxg32gJtSXGtFh8frAIcS6oC9cx2Q+7KYCQLOAeA==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  react-day-picker@10.0.1:
    resolution: {integrity: sha512-eNh6BlwcYInWaJtRv18mXQ06Ys/H6rdTZAnTaSdOYJuTpwP1JMCHNd1FDRadA+gbeinq+psdULN5Xnowy9mV8w==}
    engines: {node: '>=18'}
    peerDependencies:
      '@types/react': '>=16.8.0'
      react: '>=16.8.0'
    peerDependenciesMeta:
      '@types/react':
        optional: true

  react-dom@19.2.6:
    resolution: {integrity: sha512-0prMI+hvBbPjsWnxDLxlCGyM8PN6UuWjEUCYmZhO67xIV9Xasa/r/vDnq+Xyq4Lo27g8QSbO5YzARu0D1Sps3g==}
    peerDependencies:
      react: ^19.2.6

  react-hook-form@7.85.0:
    resolution: {integrity: sha512-U2MTriFXnclmV4rOE20p2DcRFv5WEg3FIcBFOKcOLFHDVvGIMPvLTkTWefUsonmlaVy23khVDxDWym6uJVGOzw==}
    engines: {node: '>=18.0.0'}
    peerDependencies:
      react: ^16.8.0 || ^17 || ^18 || ^19

  react-is@16.13.1:
    resolution: {integrity: sha512-24e6ynE2H+OKt4kqsOvNd8kBpV65zoxbA4BVsEOB3ARVWQki/DHzaUoC5KuON/BiccDaCCTZBuOcfZs70kR8bQ==}

  react-redux@9.3.0:
    resolution: {integrity: sha512-KQopgqFo/p/fgmAs5qz6p5RWaNAzq40WAu7fJIXnQpYxFPbJYtsJPWvGeF2rOBaY/kEuV77AVsX8TsQzKm+A/g==}
    peerDependencies:
      '@types/react': ^18.2.25 || ^19
      react: ^18.0 || ^19
      redux: ^5.0.0
    peerDependenciesMeta:
      '@types/react':
        optional: true
      redux:
        optional: true

  react-remove-scroll-bar@2.3.8:
    resolution: {integrity: sha512-9r+yi9+mgU33AKcj6IbT9oRCO78WriSj6t/cF8DWBZJ9aOGPOTEDvdUDz1FwKim7QXWwmHqtdHnRJfhAxEG46Q==}
    engines: {node: '>=10'}
    peerDependencies:
      '@types/react': '*'
      react: ^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0
    peerDependenciesMeta:
      '@types/react':
        optional: true

  react-remove-scroll@2.7.2:
    resolution: {integrity: sha512-Iqb9NjCCTt6Hf+vOdNIZGdTiH1QSqr27H/Ek9sv/a97gfueI/5h1s3yRi1nngzMUaOOToin5dI1dXKdXiF+u0Q==}
    engines: {node: '>=10'}
    peerDependencies:
      '@types/react': '*'
      react: ^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true

  react-resizable-panels@4.12.2:
    resolution: {integrity: sha512-NwY5LCo4WrxVvDh0xoMML6EMLPONP/8ckKcIdpnojxexoatZdjLiRqLJQjQK5CPkd4SYiB/2M5BVrjZBQtOO7Q==}
    peerDependencies:
      react: ^18.0.0 || ^19.0.0
      react-dom: ^18.0.0 || ^19.0.0

  react-server-dom-webpack@19.2.6:
    resolution: {integrity: sha512-762YXjBPc6hw2V16k4x1sdnw0mxghcSPzoiOhefGYjiTguJLCImGBUz6EjznPIfqKhWgLtpaQMlBhp66N8dKrw==}
    engines: {node: '>=0.10.0'}
    peerDependencies:
      react: ^19.2.6
      react-dom: ^19.2.6
      webpack: ^5.59.0

  react-style-singleton@2.2.3:
    resolution: {integrity: sha512-b6jSvxvVnyptAiLjbkWLE/lOnR4lfTtDAl+eUC7RZy+QQWc6wRzIV2CE6xBuMmDxc2qIihtDCZD5NPOFl7fRBQ==}
    engines: {node: '>=10'}
    peerDependencies:
      '@types/react': '*'
      react: ^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true

  react@19.2.6:
    resolution: {integrity: sha512-sfWGGfavi0xr8Pg0sVsyHMAOziVYKgPLNrS7ig+ivMNb3wbCBw3KxtflsGBAwD3gYQlE/AEZsTLgToRrSCjb0Q==}
    engines: {node: '>=0.10.0'}

  recharts@3.8.0:
    resolution: {integrity: sha512-Z/m38DX3L73ExO4Tpc9/iZWHmHnlzWG4njQbxsF5aSjwqmHNDDIm0rdEBArkwsBvR8U6EirlEHiQNYWCVh9sGQ==}
    engines: {node: '>=18'}
    peerDependencies:
      react: ^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0
      react-dom: ^16.0.0 || ^17.0.0 || ^18.0.0 || ^19.0.0
      react-is: ^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0

  redux-thunk@3.1.0:
    resolution: {integrity: sha512-NW2r5T6ksUKXCabzhL9z+h206HQw/NJkcLm1GPImRQ8IzfXwRGqjVhKJGauHirT0DAuyy6hjdnMZaRoAcy0Klw==}
    peerDependencies:
      redux: ^5.0.0

  redux@5.0.1:
    resolution: {integrity: sha512-M9/ELqF6fy8FwmkpnF0S3YKOqMyoWJ4+CS5Efg2ct3oY9daQvd/Pc71FpGZsVsbl3Cpb+IIcjBDUnnyBdQbq4w==}

  reflect.getprototypeof@1.0.10:
    resolution: {integrity: sha512-00o4I+DVrefhv+nX0ulyi3biSHCPDe+yLv5o/p6d/UVlirijB8E16FtfwSAi4g3tcqrQ4lRAqQSoFEZJehYEcw==}
    engines: {node: '>= 0.4'}

  regexp.prototype.flags@1.5.4:
    resolution: {integrity: sha512-dYqgNSZbDwkaJ2ceRd9ojCGjBq+mOm9LmtXnAnEGyHhN/5R7iDW2TRw3h+o/jCFxus3P2LfWIIiwowAjANm7IA==}
    engines: {node: '>= 0.4'}

  require-from-string@2.0.2:
    resolution: {integrity: sha512-Xf0nWe6RseziFMu+Ap9biiUbmplq6S9/p+7w7YXP/JBHhrUDDUhwa+vANyubuqfZWTveU//DYVGsDG7RKL/vEw==}
    engines: {node: '>=0.10.0'}

  reselect@5.1.1:
    resolution: {integrity: sha512-K/BG6eIky/SBpzfHZv/dd+9JBFiS4SWV7FIujVyJRux6e45+73RaUHXLmIR1f7WOMaQ0U1km6qwklRQxpJJY0w==}

  reselect@5.2.0:
    resolution: {integrity: sha512-AgZ3UOZm3YndfrJ4OYjgrT7bmCm/1iqkjvEfH/oYjzh6PD2qw4QuT3jjnXIrpdt4MTpMXclMT3lXbmRY+XRakw==}

  resolve-from@4.0.0:
    resolution: {integrity: sha512-pb/MYmXstAkysRFx8piNI1tGFNQIFA3vkE3Gq4EuA1dF6gHp/+vgZqsCGJapvy8N3Q+4o7FwvquPJcnZ7RYy4g==}
    engines: {node: '>=4'}

  resolve-pkg-maps@1.0.0:
    resolution: {integrity: sha512-seS2Tj26TBVOC2NIc2rOe2y2ZO7efxITtLZcGSOnHHNOQ7CkiUBfw0Iw2ck6xkIhPwLhKNLS8BO+hEpngQlqzw==}

  resolve@2.0.0-next.7:
    resolution: {integrity: sha512-tqt+NBWwyaMgw3zDsnygx4CByWjQEJHOPMdslYhppaQSJUtL/D4JO9CcBBlhPoI8lz9oJIDXkwXfhF4aWqP8xQ==}
    engines: {node: '>= 0.4'}
    hasBin: true

  reusify@1.1.0:
    resolution: {integrity: sha512-g6QUff04oZpHs0eG5p83rFLhHeV00ug/Yf9nZM6fLeUrPguBTkTQOdpAWWspMh55TZfVQDPaN3NQJfbVRAxdIw==}
    engines: {iojs: '>=1.0.0', node: '>=0.10.0'}

  rolldown@1.0.1:
    resolution: {integrity: sha512-X0KQHljNnEkWNqqiz9zJrGunh1B0HgOxLXvnFpCOcadzcy5qohZ3tqMEUg00vncoRovXuK3ZqCT9KnnKzoInFQ==}
    engines: {node: ^20.19.0 || >=22.12.0}
    hasBin: true

  run-parallel@1.2.0:
    resolution: {integrity: sha512-5l4VyZR86LZ/lDxZTR6jqL8AFE2S0IFLMP26AbjsLVADxHdhB/c0GUsH+y39UfCi3dzz8OlQuPmnaJOMoDHQBA==}

  safe-array-concat@1.1.4:
    resolution: {integrity: sha512-wtZlHyOje6OZTGqAoaDKxFkgRtkF9CnHAVnCHKfuj200wAgL+bSJhdsCD2l0Qx/2ekEXjPWcyKkfGb5CPboslg==}
    engines: {node: '>=0.4'}

  safe-push-apply@1.0.0:
    resolution: {integrity: sha512-iKE9w/Z7xCzUMIZqdBsp6pEQvwuEebH4vdpjcDWnyzaI6yl6O9FHvVpmGelvEHNsoY6wGblkxR6Zty/h00WiSA==}
    engines: {node: '>= 0.4'}

  safe-regex-test@1.1.0:
    resolution: {integrity: sha512-x/+Cz4YrimQxQccJf5mKEbIa1NzeCRNI5Ecl/ekmlYaampdNLPalVyIcCZNNH3MvmqBugV5TMYZXv0ljslUlaw==}
    engines: {node: '>= 0.4'}

  satori@0.16.0:
    resolution: {integrity: sha512-ZvHN3ygzZ8FuxjSNB+mKBiF/NIoqHzlBGbD0MJiT+MvSsFOvotnWOhdTjxKzhHRT2wPC1QbhLzx2q/Y83VhfYQ==}
    engines: {node: '>=16'}

  scheduler@0.27.0:
    resolution: {integrity: sha512-eNv+WrVbKu1f3vbYJT/xtiF5syA5HPIMtf9IgY/nKg0sWqzAUEvqY/xm7OcZc/qafLx/iO9FgOmeSAp4v5ti/Q==}

  schema-utils@4.3.3:
    resolution: {integrity: sha512-eflK8wEtyOE6+hsaRVPxvUKYCpRgzLqDTb8krvAsRIwOGlHoSgYLgBXoubGgLd2fT41/OUYdb48v4k4WWHQurA==}
    engines: {node: '>= 10.13.0'}

  semver@6.3.1:
    resolution: {integrity: sha512-BR7VvDCVHO+q2xBEWskxS6DJE1qRnb7DxzUrogb71CWoSficBxYsiAGd+Kl0mmq/MprG9yArRkyrQxTO6XjMzA==}
    hasBin: true

  semver@7.8.5:
    resolution: {integrity: sha512-Y7/KDsb8LjooZpwaqGyulO6DQlksgCncchHGk+sZIY4SBvUocMBEFH5Ur1fI4dV+Jvl0w6cjvucaIi40puRioA==}
    engines: {node: '>=10'}
    hasBin: true

  set-function-length@1.2.2:
    resolution: {integrity: sha512-pgRc4hJ4/sNjWCSS9AmnS40x3bNMDTknHgL5UaMBTMyJnU90EgWh1Rz+MC9eFu4BuN/UwZjKQuY/1v3rM7HMfg==}
    engines: {node: '>= 0.4'}

  set-function-name@2.0.2:
    resolution: {integrity: sha512-7PGFlmtwsEADb0WYyvCMa1t+yke6daIG4Wirafur5kcf+MhUnPms1UeR0CKQdTZD81yESwMHbtn+TR+dMviakQ==}
    engines: {node: '>= 0.4'}

  set-proto@1.0.0:
    resolution: {integrity: sha512-RJRdvCo6IAnPdsvP/7m6bsQqNnn1FCBX5ZNtFL98MmFF/4xAIJTIg1YbHW5DC2W5SKZanrC6i4HsJqlajw/dZw==}
    engines: {node: '>= 0.4'}

  sharp@0.35.4:
    resolution: {integrity: sha512-n++8XWcj+jCOr2IOl7h8LbKnGBDY4aPbmprMONBNFdn0ImXqpGVv5zliDs0V9HbmbCQLpbuo2ej9rAoOQTvMDA==}
    engines: {node: '>=20.9.0'}
    peerDependencies:
      '@types/node': '*'
    peerDependenciesMeta:
      '@types/node':
        optional: true

  shebang-command@2.0.0:
    resolution: {integrity: sha512-kHxr2zZpYtdmrN1qDjrrX/Z1rR1kG8Dx+gkpK1G4eXmvXswmcE1hTWBWYUzlraYw1/yZp6YuDY77YtvbN0dmDA==}
    engines: {node: '>=8'}

  shebang-regex@3.0.0:
    resolution: {integrity: sha512-7++dFhtcx3353uBaq8DDR4NuxBetBzC7ZQOhmTQInHEd6bSrXdiEyzCvG07Z44UYdLShWUyXt5M/yhz8ekcb1A==}
    engines: {node: '>=8'}

  side-channel-list@1.0.1:
    resolution: {integrity: sha512-mjn/0bi/oUURjc5Xl7IaWi/OJJJumuoJFQJfDDyO46+hBWsfaVM65TBHq2eoZBhzl9EchxOijpkbRC8SVBQU0w==}
    engines: {node: '>= 0.4'}

  side-channel-map@1.0.1:
    resolution: {integrity: sha512-VCjCNfgMsby3tTdo02nbjtM/ewra6jPHmpThenkTYh8pG9ucZ/1P8So4u4FGBek/BjpOVsDCMoLA/iuBKIFXRA==}
    engines: {node: '>= 0.4'}

  side-channel-weakmap@1.0.2:
    resolution: {integrity: sha512-WPS/HvHQTYnHisLo9McqBHOJk2FkHO/tlpvldyrnem4aeQp4hai3gythswg6p01oSoTl58rcpiFAjF2br2Ak2A==}
    engines: {node: '>= 0.4'}

  side-channel@1.1.0:
    resolution: {integrity: sha512-ZX99e6tRweoUXqR+VBrslhda51Nh5MTQwou5tnUDgbtyM0dBgmhEDtWGP/xbKn6hqfPRHujUNwz5fy/wbbhnpw==}
    engines: {node: '>= 0.4'}

  sonner@2.0.8:
    resolution: {integrity: sha512-UM/ByIoFra8yzV75n1o0Puu0bw5U/9UNnDacrJNspekBewIfsQ3D6ez1nvlWpt7aTsO6rujQtifBpycwIivqlg==}
    peerDependencies:
      '@types/react': ^18.0.0 || ^19.0.0
      react: ^18.0.0 || ^19.0.0 || ^19.0.0-rc
      react-dom: ^18.0.0 || ^19.0.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true

  source-map-js@1.2.1:
    resolution: {integrity: sha512-UXWMKhLOwVKb728IUtQPXxfYU+usdybtUrK/8uGE8CQMvrhOpwvzDBwj0QhSL7MQc7vIsISBG8VQ8+IDQxpfQA==}
    engines: {node: '>=0.10.0'}

  source-map-support@0.5.21:
    resolution: {integrity: sha512-uBHU3L3czsIyYXKX88fdrGovxdSCoTGDRZ6SYXtSRxLZUzHg5P/66Ht6uoUlHu9EZod+inXhKo3qQgwXUT/y1w==}

  source-map@0.6.1:
    resolution: {integrity: sha512-UjgapumWlbMhkBgzT7Ykc5YXUT46F0iKu8SGXq0bcwP5dz/h0Plj6enJqjz1Zbq2l5WaqYnrVbwWOWMyF3F47g==}
    engines: {node: '>=0.10.0'}

  srvx@0.11.15:
    resolution: {integrity: sha512-iXsux0UcOjdvs0LCMa2Ws3WwcDUozA3JN3BquNXkaFPP7TpRqgunKdEgoZ/uwb1J6xaYHfxtz9Twlh6yzwM6Tg==}
    engines: {node: '>=20.16.0'}
    hasBin: true

  stable-hash@0.0.5:
    resolution: {integrity: sha512-+L3ccpzibovGXFK+Ap/f8LOS0ahMrHTf3xu7mMLSpEGU0EO9ucaysSylKo9eRDFNhWve/y275iPmIZ4z39a9iA==}

  stop-iteration-iterator@1.1.0:
    resolution: {integrity: sha512-eLoXW/DHyl62zxY4SCaIgnRhuMr6ri4juEYARS8E6sCEqzKpOiE521Ucofdx+KnDZl5xmvGYaaKCk5FEOxJCoQ==}
    engines: {node: '>= 0.4'}

  string.prototype.codepointat@0.2.1:
    resolution: {integrity: sha512-2cBVCj6I4IOvEnjgO/hWqXjqBGsY+zwPmHl12Srk9IXSZ56Jwwmy+66XO5Iut/oQVR7t5ihYdLB0GMa4alEUcg==}

  string.prototype.includes@2.0.1:
    resolution: {integrity: sha512-o7+c9bW6zpAdJHTtujeePODAhkuicdAryFsfVKwA+wGw89wJ4GTY484WTucM9hLtDEOpOvI+aHnzqnC5lHp4Rg==}
    engines: {node: '>= 0.4'}

  string.prototype.matchall@4.0.12:
    resolution: {integrity: sha512-6CC9uyBL+/48dYizRf7H7VAYCMCNTBeM78x/VTUe9bFEaxBepPJDa1Ow99LqI/1yF7kuy7Q3cQsYMrcjGUcskA==}
    engines: {node: '>= 0.4'}

  string.prototype.repeat@1.0.0:
    resolution: {integrity: sha512-0u/TldDbKD8bFCQ/4f5+mNRrXwZ8hg2w7ZR8wa16e8z9XpePWl3eGEcUD0OXpEH/VJH/2G3gjUtR3ZOiBe2S/w==}

  string.prototype.trim@1.2.10:
    resolution: {integrity: sha512-Rs66F0P/1kedk5lyYyH9uBzuiI/kNRmwJAR9quK6VOtIpZ2G+hMZd+HQbbv25MgCA6gEffoMZYxlTod4WcdrKA==}
    engines: {node: '>= 0.4'}

  string.prototype.trimend@1.0.9:
    resolution: {integrity: sha512-G7Ok5C6E/j4SGfyLCloXTrngQIQU3PWtXGst3yM7Bea9FRURf1S42ZHlZZtsNque2FN2PoUhfZXYLNWwEr4dLQ==}
    engines: {node: '>= 0.4'}

  string.prototype.trimstart@1.0.8:
    resolution: {integrity: sha512-UXSH262CSZY1tfu3G3Secr6uGLCFVPMhIqHjlgCUtCCcgihYc/xKs9djMTMUOb2j1mVSeU8EU6NWc/iQKU6Gfg==}
    engines: {node: '>= 0.4'}

  strip-bom@3.0.0:
    resolution: {integrity: sha512-vavAMRXOgBVNF6nyEEmL3DBK19iRpDcoIwW+swQ+CbGiu7lju6t+JklA1MHweoWtadgt4ISVUsXLyDq34ddcwA==}
    engines: {node: '>=4'}

  strip-json-comments@3.1.1:
    resolution: {integrity: sha512-6fPc+R4ihwqP6N/aIv2f1gMH8lOVtWQHoqC4yK6oSDVVocumAsfCqjkXnqiYMhmMwS/mEHLp7Vehlt3ql6lEig==}
    engines: {node: '>=8'}

  strip-literal@3.1.0:
    resolution: {integrity: sha512-8r3mkIM/2+PpjHoOtiAW8Rg3jJLHaV7xPwG+YRGrv6FP0wwk/toTpATxWYOW0BKdWwl82VT2tFYi5DlROa0Mxg==}

  styled-jsx@5.1.6:
    resolution: {integrity: sha512-qSVyDTeMotdvQYoHWLNGwRFJHC+i+ZvdBRYosOFgC+Wg1vx4frN2/RG/NA7SYqqvKNLf39P2LSRA2pu6n0XYZA==}
    engines: {node: '>= 12.0.0'}
    peerDependencies:
      '@babel/core': '*'
      babel-plugin-macros: '*'
      react: '>= 16.8.0 || 17.x.x || ^18.0.0-0 || ^19.0.0-0'
    peerDependenciesMeta:
      '@babel/core':
        optional: true
      babel-plugin-macros:
        optional: true

  supports-color@10.2.2:
    resolution: {integrity: sha512-SS+jx45GF1QjgEXQx4NJZV9ImqmO2NPz5FNsIHrsDjh2YsHnawpan7SNQ1o8NuhrbHZy9AZhIoCUiCeaW/C80g==}
    engines: {node: '>=18'}

  supports-color@7.2.0:
    resolution: {integrity: sha512-qpCAvRl9stuOHveKsn7HncJRvv501qIacKzQlO/+Lwxc9+0q2wLyv4Dfvt80/DPn2pqOBsJdDiogXGR9+OvwRw==}
    engines: {node: '>=8'}

  supports-color@8.1.1:
    resolution: {integrity: sha512-MpUEN2OodtUzxvKQl72cUF7RQ5EiHsGvSsVG0ia9c5RbWGL2CI4C7EpPS8UTBIplnlzZiNuV56w+FuNxy3ty2Q==}
    engines: {node: '>=10'}

  supports-preserve-symlinks-flag@1.0.0:
    resolution: {integrity: sha512-ot0WnXS9fgdkgIcePe6RHNk1WA8+muPa6cSjeR3V8K27q9BB1rTE3R1p7Hv0z1ZyAc8s6Vvv8DIyWf681MAt0w==}
    engines: {node: '>= 0.4'}

  tailwind-merge@3.6.0:
    resolution: {integrity: sha512-uxL7qAVQriqRQPAyK3pj66VqskWqoZ37PW94jwOTwNfq/z9oyu1V+eqrZqtR2+fCiXdYOZe/Modt8GtvqNzu+w==}

  tailwindcss@4.2.1:
    resolution: {integrity: sha512-/tBrSQ36vCleJkAOsy9kbNTgaxvGbyOamC30PRePTQe/o1MFwEKHQk4Cn7BNGaPtjp+PuUrByJehM1hgxfq4sw==}

  tapable@2.3.3:
    resolution: {integrity: sha512-uxc/zpqFg6x7C8vOE7lh6Lbda8eEL9zmVm/PLeTPBRhh1xCgdWaQ+J1CUieGpIfm2HdtsUpRv+HshiasBMcc6A==}
    engines: {node: '>=6'}

  terser-webpack-plugin@5.6.0:
    resolution: {integrity: sha512-Eum+5ajkaOhf5KbM26osvv21kLD7BaGqQ1UA4Ami4arYwylmGUQTgHFpHDdmJod1q4QXa66p0to/FBKID+J1vA==}
    engines: {node: '>= 10.13.0'}
    peerDependencies:
      '@minify-html/node': '*'
      '@swc/core': '*'
      '@swc/css': '*'
      '@swc/html': '*'
      clean-css: '*'
      cssnano: '*'
      csso: '*'
      esbuild: '*'
      html-minifier-terser: '*'
      lightningcss: '*'
      postcss: '*'
      uglify-js: '*'
      webpack: ^5.1.0
    peerDependenciesMeta:
      '@minify-html/node':
        optional: true
      '@swc/core':
        optional: true
      '@swc/css':
        optional: true
      '@swc/html':
        optional: true
      clean-css:
        optional: true
      cssnano:
        optional: true
      csso:
        optional: true
      esbuild:
        optional: true
      html-minifier-terser:
        optional: true
      lightningcss:
        optional: true
      postcss:
        optional: true
      uglify-js:
        optional: true

  terser@5.47.1:
    resolution: {integrity: sha512-tPbLXTI6ohPASb/1YViL428oEHu6/qv1OxqYnfaonVCFHqx4+wCd95pHrQWsL5X4pl90CTyW9piSAsS2L0VoMw==}
    engines: {node: '>=10'}
    hasBin: true

  tiny-inflate@1.0.3:
    resolution: {integrity: sha512-pkY1fj1cKHb2seWDy0B16HeWyczlJA9/WW3u3c4z/NiWDsO3DOU5D7nhTLE9CF0yXv/QZFY7sEJmj24dK+Rrqw==}

  tiny-invariant@1.3.3:
    resolution: {integrity: sha512-+FbBPE1o9QAYvviau/qC5SE3caw21q3xkvWKBtja5vgqOWIHHJ3ioaq1VPfn/Szqctz2bU/oYeKd9/z5BL+PVg==}

  tinyglobby@0.2.16:
    resolution: {integrity: sha512-pn99VhoACYR8nFHhxqix+uvsbXineAasWm5ojXoN8xEwK5Kd3/TrhNn1wByuD52UxWRLy8pu+kRMniEi6Eq9Zg==}
    engines: {node: '>=12.0.0'}

  to-regex-range@5.0.1:
    resolution: {integrity: sha512-65P7iz6X5yEr1cwcgvQxbbIw7Uk3gOy5dIdtZ4rDveLqhrdJP+Li/Hx6tyK0NEb+2GCyneCMJiGqrADCSNk8sQ==}
    engines: {node: '>=8.0'}

  ts-api-utils@2.5.0:
    resolution: {integrity: sha512-OJ/ibxhPlqrMM0UiNHJ/0CKQkoKF243/AEmplt3qpRgkW8VG7IfOS41h7V8TjITqdByHzrjcS/2si+y4lIh8NA==}
    engines: {node: '>=18.12'}
    peerDependencies:
      typescript: '>=4.8.4'

  tsconfig-paths@3.15.0:
    resolution: {integrity: sha512-2Ac2RgzDe/cn48GvOe3M+o82pEFewD3UPbyoUHHdKasHwJKjds4fLXWf/Ux5kATBKN20oaFGu+jbElp1pos0mg==}

  tslib@2.8.1:
    resolution: {integrity: sha512-oJFu94HQb+KVduSUQL7wnpmqnfmLsOA/nAh6b6EH0wCEoK0/mPeXU6c3wKDV83MkOuHPRHtSXKKU99IBazS/2w==}

  tsx@4.22.1:
    resolution: {integrity: sha512-TvncJykhxAzFCk0VQZKBTClall4Pm7qXDSodb6uxi8QFa8X8mT6ABjxxsQ2opDRYxG7AzcRWXaFtruz5HJKuWg==}
    engines: {node: '>=18.0.0'}
    hasBin: true

  turbo-stream@3.2.0:
    resolution: {integrity: sha512-EK+bZ9UVrVh7JLslVFOV0GEMsociOqVOvEMTAd4ixMyffN5YNIEdLZWXUx5PJqDbTxSIBWw04HS9gCY4frYQDQ==}

  tw-animate-css@1.4.0:
    resolution: {integrity: sha512-7bziOlRqH0hJx80h/3mbicLW7o8qLsH5+RaLR2t+OHM3D0JlWGODQKQ4cxbK7WlvmUxpcj6Kgu6EKqjrGFe3QQ==}

  type-check@0.4.0:
    resolution: {integrity: sha512-XleUoc9uwGXqjWwXaUTZAmzMcFZ5858QA2vvx1Ur5xIcixXIP+8LnFDgRplU30us6teqdlskFfu+ae4K79Ooew==}
    engines: {node: '>= 0.8.0'}

  typed-array-buffer@1.0.3:
    resolution: {integrity: sha512-nAYYwfY3qnzX30IkA6AQZjVbtK6duGontcQm1WSG1MD94YLqK0515GNApXkoxKOWMusVssAHWLh9SeaoefYFGw==}
    engines: {node: '>= 0.4'}

  typed-array-byte-length@1.0.3:
    resolution: {integrity: sha512-BaXgOuIxz8n8pIq3e7Atg/7s+DpiYrxn4vdot3w9KbnBhcRQq6o3xemQdIfynqSeXeDrF32x+WvfzmOjPiY9lg==}
    engines: {node: '>= 0.4'}

  typed-array-byte-offset@1.0.4:
    resolution: {integrity: sha512-bTlAFB/FBYMcuX81gbL4OcpH5PmlFHqlCCpAl8AlEzMz5k53oNDvN8p1PNOWLEmI2x4orp3raOFB51tv9X+MFQ==}
    engines: {node: '>= 0.4'}

  typed-array-length@1.0.7:
    resolution: {integrity: sha512-3KS2b+kL7fsuk/eJZ7EQdnEmQoaho/r6KUef7hxvltNA5DR8NAUM+8wJMbJyZ4G9/7i3v5zPBIMN5aybAh2/Jg==}
    engines: {node: '>= 0.4'}

  typescript-eslint@8.59.3:
    resolution: {integrity: sha512-KgusgyDgG4LI8Ih/sWaCtZ06tckLAS5CvT5A4D1Q7bYVoAAyzwiZvE4BmwDHkhRVkvhRBepKeASoFzQetha7Fg==}
    engines: {node: ^18.18.0 || ^20.9.0 || >=21.1.0}
    peerDependencies:
      eslint: ^8.57.0 || ^9.0.0 || ^10.0.0
      typescript: '>=4.8.4 <6.1.0'

  typescript@5.9.3:
    resolution: {integrity: sha512-jl1vZzPDinLr9eUt3J/t7V6FgNEw9QjvBPdysz9KfQDD41fQrC2Y4vKQdiaUpFT4bXlb1RHhLpp8wtm6M5TgSw==}
    engines: {node: '>=14.17'}
    hasBin: true

  unbox-primitive@1.1.0:
    resolution: {integrity: sha512-nWJ91DjeOkej/TA8pXQ3myruKpKEYgqvpw9lz4OPHj/NWFNluYrjbz9j01CJ8yKQd2g4jFoOkINCTW2I5LEEyw==}
    engines: {node: '>= 0.4'}

  undici-types@6.21.0:
    resolution: {integrity: sha512-iwDZqg0QAGrg9Rav5H4n0M64c3mkR59cJ6wQp+7C4nI0gsmExaedaYLNO44eT4AtBBwjbTiGPMlt2Md0T9H9JQ==}

  undici@7.24.8:
    resolution: {integrity: sha512-6KQ/+QxK49Z/p3HO6E5ZCZWNnCasyZLa5ExaVYyvPxUwKtbCPMKELJOqh7EqOle0t9cH/7d2TaaTRRa6Nhs4YQ==}
    engines: {node: '>=20.18.1'}

  unenv@2.0.0-rc.24:
    resolution: {integrity: sha512-i7qRCmY42zmCwnYlh9H2SvLEypEFGye5iRmEMKjcGi7zk9UquigRjFtTLz0TYqr0ZGLZhaMHl/foy1bZR+Cwlw==}

  unicode-trie@2.0.0:
    resolution: {integrity: sha512-x7bc76x0bm4prf1VLg79uhAzKw8DVboClSN5VxJuQ+LKDOVEW9CdH+VY7SP+vX7xCYQqzzgQpFqz15zeLvAtZQ==}

  unpic@4.2.2:
    resolution: {integrity: sha512-z6T2ScMgRV2y2H8MwwhY5xHZWXhUx/YxtOCGJwfURSl7ypVy4HpLIMWoIZKnnxQa/RKzM0kg8hUh0paIrpLfvw==}

  unrs-resolver@1.11.1:
    resolution: {integrity: sha512-bSjt9pjaEBnNiGgc9rUiHGKv5l4/TGzDmYw3RhnkJGtLhbnnA/5qJj7x3dNDCRx/PJxu774LlH8lCOlB4hEfKg==}

  update-browserslist-db@1.2.3:
    resolution: {integrity: sha512-Js0m9cx+qOgDxo0eMiFGEueWztz+d4+M3rGlmKPT+T4IS/jP4ylw3Nwpu6cpTTP8R1MAC1kF4VbdLt3ARf209w==}
    hasBin: true
    peerDependencies:
      browserslist: '>= 4.21.0'

  uri-js@4.4.1:
    resolution: {integrity: sha512-7rKUyy33Q1yc98pQ1DAmLtwX109F7TIfWlW1Ydo8Wl1ii1SeHieeh0HHfPeL2fMXK6z0s8ecKs9frCuLJvndBg==}

  use-callback-ref@1.3.3:
    resolution: {integrity: sha512-jQL3lRnocaFtu3V00JToYz/4QkNWswxijDaCVNZRiRTO3HQDLsdu1ZtmIUvV4yPp+rvWm5j0y0TG/S61cuijTg==}
    engines: {node: '>=10'}
    peerDependencies:
      '@types/react': '*'
      react: ^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true

  use-sidecar@1.1.3:
    resolution: {integrity: sha512-Fedw0aZvkhynoPYlA5WXrMCAMm+nSWdZt6lzJQ7Ok8S6Q+VsHmHpRWndVRJ8Be0ZbkfPc5LRYH+5XrzXcEeLRQ==}
    engines: {node: '>=10'}
    peerDependencies:
      '@types/react': '*'
      react: ^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true

  use-sync-external-store@1.6.0:
    resolution: {integrity: sha512-Pp6GSwGP/NrPIrxVFAIkOQeyw8lFenOHijQWkUTrDvrF4ALqylP2C/KCkeS9dpUM3KvYRQhna5vt7IL95+ZQ9w==}
    peerDependencies:
      react: ^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0

  vaul@1.1.2:
    resolution: {integrity: sha512-ZFkClGpWyI2WUQjdLJ/BaGuV6AVQiJ3uELGk3OYtP+B6yCO7Cmn9vPFXVJkRaGkOJu3m8bQMgtyzNHixULceQA==}
    peerDependencies:
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0.0 || ^19.0.0-rc

  victory-vendor@37.3.6:
    resolution: {integrity: sha512-SbPDPdDBYp+5MJHhBCAyI7wKM3d5ivekigc2Dk2s7pgbZ9wIgIBYGVw4zGHBml/qTFbexrofXW6Gu4noGxrOwQ==}

  vinext@1.0.0-beta.5:
    resolution: {integrity: sha512-c0I1UB70/pGwD9y4/iXWrGfz/LnowSbkQpUw+lK9t08tes5WHX7Vl0sZAY4MIzGaVCyvrD4/xZo7HWpMje6SwA==}
    engines: {node: '>=22'}
    hasBin: true
    peerDependencies:
      '@mdx-js/rollup': ^3.0.0
      '@vitejs/plugin-react': ^5.1.4 || ^6.0.0
      '@vitejs/plugin-rsc': ^0.5.26
      react: ^19.2.6
      react-dom: ^19.2.6
      react-server-dom-webpack: ^19.2.6
      vite: ^8.0.0
    peerDependenciesMeta:
      '@mdx-js/rollup':
        optional: true
      '@vitejs/plugin-rsc':
        optional: true
      react-server-dom-webpack:
        optional: true

  vite-plugin-commonjs@0.10.4:
    resolution: {integrity: sha512-eWQuvQKCcx0QYB5e5xfxBNjQKyrjEWZIR9UOkOV6JAgxVhtbZvCOF+FNC2ZijBJ3U3Px04ZMMyyMyFBVWIJ5+g==}

  vite-plugin-dynamic-import@1.6.0:
    resolution: {integrity: sha512-TM0sz70wfzTIo9YCxVFwS8OA9lNREsh+0vMHGSkWDTZ7bgd1Yjs5RV8EgB634l/91IsXJReg0xtmuQqP0mf+rg==}

  vite@8.0.13:
    resolution: {integrity: sha512-MFtjBYgzmSxmgA4RAfjIyXWpGe1oALnjgUTzzV7QLx/TKxCzjtMH6Fd9/eVK+5Fg1qNoz5VAwsmMs/NofrmJvw==}
    engines: {node: ^20.19.0 || >=22.12.0}
    hasBin: true
    peerDependencies:
      '@types/node': ^20.19.0 || >=22.12.0
      '@vitejs/devtools': ^0.1.18
      esbuild: ^0.27.0 || ^0.28.0
      jiti: '>=1.21.0'
      less: ^4.0.0
      sass: ^1.70.0
      sass-embedded: ^1.70.0
      stylus: '>=0.54.8'
      sugarss: ^5.0.0
      terser: ^5.16.0
      tsx: ^4.8.1
      yaml: ^2.4.2
    peerDependenciesMeta:
      '@types/node':
        optional: true
      '@vitejs/devtools':
        optional: true
      esbuild:
        optional: true
      jiti:
        optional: true
      less:
        optional: true
      sass:
        optional: true
      sass-embedded:
        optional: true
      stylus:
        optional: true
      sugarss:
        optional: true
      terser:
        optional: true
      tsx:
        optional: true
      yaml:
        optional: true

  vitefu@1.1.3:
    resolution: {integrity: sha512-ub4okH7Z5KLjb6hDyjqrGXqWtWvoYdU3IGm/NorpgHncKoLTCfRIbvlhBm7r0YstIaQRYlp4yEbFqDcKSzXSSg==}
    peerDependencies:
      vite: ^3.0.0 || ^4.0.0 || ^5.0.0 || ^6.0.0 || ^7.0.0 || ^8.0.0
    peerDependenciesMeta:
      vite:
        optional: true

  watchpack@2.5.1:
    resolution: {integrity: sha512-Zn5uXdcFNIA1+1Ei5McRd+iRzfhENPCe7LeABkJtNulSxjma+l7ltNx55BWZkRlwRnpOgHqxnjyaDgJnNXnqzg==}
    engines: {node: '>=10.13.0'}

  web-vitals@4.2.4:
    resolution: {integrity: sha512-r4DIlprAGwJ7YM11VZp4R884m0Vmgr6EAKe3P+kO0PPj3Unqyvv59rczf6UiGcb9Z8QxZVcqKNwv/g0WNdWwsw==}

  webpack-sources@3.4.1:
    resolution: {integrity: sha512-eACpxRN02yaawnt+uUNIF7Qje6A9zArxBbcAJjK1PK3S9Ycg5jIuJ8pW4q8EMnwNZCEGltcjkRx1QzOxOkKD8A==}
    engines: {node: '>=10.13.0'}

  webpack@5.106.2:
    resolution: {integrity: sha512-wGN3qcrBQIFmQ/c0AiOAQBvrZ5lmY8vbbMv4Mxfgzqd/B6+9pXtLo73WuS1dSGXM5QYY3hZnIbvx+K1xxe6FyA==}
    engines: {node: '>=10.13.0'}
    hasBin: true
    peerDependencies:
      webpack-cli: '*'
    peerDependenciesMeta:
      webpack-cli:
        optional: true

  which-boxed-primitive@1.1.1:
    resolution: {integrity: sha512-TbX3mj8n0odCBFVlY8AxkqcHASw3L60jIuF8jFP78az3C2YhmGvqbHBpAjTRH2/xqYunrJ9g1jSyjCjpoWzIAA==}
    engines: {node: '>= 0.4'}

  which-builtin-type@1.2.1:
    resolution: {integrity: sha512-6iBczoX+kDQ7a3+YJBnh3T+KZRxM/iYNPXicqk66/Qfm1b93iu+yOImkg0zHbj5LNOcNv1TEADiZ0xa34B4q6Q==}
    engines: {node: '>= 0.4'}

  which-collection@1.0.2:
    resolution: {integrity: sha512-K4jVyjnBdgvc86Y6BkaLZEN933SwYOuBFkdmBu9ZfkcAbdVbpITnDmjvZ/aQjRXQrv5EPkTnD1s39GiiqbngCw==}
    engines: {node: '>= 0.4'}

  which-typed-array@1.1.20:
    resolution: {integrity: sha512-LYfpUkmqwl0h9A2HL09Mms427Q1RZWuOHsukfVcKRq9q95iQxdw0ix1JQrqbcDR9PH1QDwf5Qo8OZb5lksZ8Xg==}
    engines: {node: '>= 0.4'}

  which@2.0.2:
    resolution: {integrity: sha512-BLI3Tl1TW3Pvl70l3yq3Y64i+awpwXqsGBYWkkqMtnbXgrMD+yj7rhW0kuEDxzJaYXGjEW5ogapKNMEKNMjibA==}
    engines: {node: '>= 8'}
    hasBin: true

  word-wrap@1.2.5:
    resolution: {integrity: sha512-BN22B5eaMMI9UMtjrGd5g5eCYPpCPDUy0FJXbYsaT5zYxjFOckS53SQDE3pWkVoWpHXVb3BrYcEN4Twa55B5cA==}
    engines: {node: '>=0.10.0'}

  workerd@1.20260515.1:
    resolution: {integrity: sha512-MjKOJLcvU45xXedQowvuiHtJTxu4WTHYQeIlF7YmjuqhiI6dImTFxWCEoRQHiskztxuVSNEmdO7/0UfDu6OMnQ==}
    engines: {node: '>=16'}
    hasBin: true

  wrangler@4.92.0:
    resolution: {integrity: sha512-/DKpQHPxkuZbQsO9dFW2700VTD/4DSZMHjy92fO/frNoDRi/zQsFCAd2ONCV6TGqcUoXcP3D8Bo2gj/L4M0qQQ==}
    engines: {node: '>=22.0.0'}
    hasBin: true
    peerDependencies:
      '@cloudflare/workers-types': ^4.20260515.1
    peerDependenciesMeta:
      '@cloudflare/workers-types':
        optional: true

  ws@8.18.0:
    resolution: {integrity: sha512-8VbfWfHLbbwu3+N6OKsOMpBdT4kXPDDB9cJk2bJ6mh9ucxdlnNvH1e+roYkKmN9Nxw2yjz7VzeO9oOz2zJ04Pw==}
    engines: {node: '>=10.0.0'}
    peerDependencies:
      bufferutil: ^4.0.1
      utf-8-validate: '>=5.0.2'
    peerDependenciesMeta:
      bufferutil:
        optional: true
      utf-8-validate:
        optional: true

  yallist@3.1.1:
    resolution: {integrity: sha512-a4UGQaWPH59mOXUYnAG2ewncQS4i4F43Tv3JoAM+s2VDAmS9NsK8GpDMLrCHPksFT7h3K6TOoUNn2pb7RoXx4g==}

  yocto-queue@0.1.0:
    resolution: {integrity: sha512-rVksvsnNCdJ/ohGc6xgPwyN8eheCxsiLM8mxuE/t/mOVqJewPuO1miLpTHQiRgTKCLexL4MeAFVagts7HmNZ2Q==}
    engines: {node: '>=10'}

  yoga-layout@3.2.1:
    resolution: {integrity: sha512-0LPOt3AxKqMdFBZA3HBAt/t/8vIKq7VaQYbuA8WxCgung+p9TVyKRYdpvCb80HcdTN2NkbIKbhNwKUfm3tQywQ==}

  youch-core@0.3.3:
    resolution: {integrity: sha512-ho7XuGjLaJ2hWHoK8yFnsUGy2Y5uDpqSTq1FkHLK4/oqKtyUU1AFbOOxY4IpC9f0fTLjwYbslUz0Po5BpD1wrA==}

  youch@4.1.0-beta.10:
    resolution: {integrity: sha512-rLfVLB4FgQneDr0dv1oddCVZmKjcJ6yX6mS4pU82Mq/Dt9a3cLZQ62pDBL4AUO+uVrCvtWz3ZFUL2HFAFJ/BXQ==}

  zod-validation-error@4.0.2:
    resolution: {integrity: sha512-Q6/nZLe6jxuU80qb/4uJ4t5v2VEZ44lzQjPDhYJNztRQ4wyWc6VF3D3Kb/fAuPetZQnhS3hnajCf9CsWesghLQ==}
    engines: {node: '>=18.0.0'}
    peerDependencies:
      zod: ^3.25.0 || ^4.0.0

  zod@3.25.76:
    resolution: {integrity: sha512-gzUt/qt81nXsFGKIFcC3YnfEAx5NkunCfnDlvuBSSFS02bcXu4Lmea0AFIUwbLWxWPx3d9p8S5QoaujKcNQxcQ==}

snapshots:

  '@alloc/quick-lru@5.2.0': {}

  '@babel/code-frame@7.29.0':
    dependencies:
      '@babel/helper-validator-identifier': 7.28.5
      js-tokens: 4.0.0
      picocolors: 1.1.1

  '@babel/compat-data@7.29.3': {}

  '@babel/core@7.29.0(supports-color@10.2.2)':
    dependencies:
      '@babel/code-frame': 7.29.0
      '@babel/generator': 7.29.1
      '@babel/helper-compilation-targets': 7.28.6
      '@babel/helper-module-transforms': 7.28.6(@babel/core@7.29.0(supports-color@10.2.2))(supports-color@10.2.2)
      '@babel/helpers': 7.29.2
      '@babel/parser': 7.29.3
      '@babel/template': 7.28.6
      '@babel/traverse': 7.29.0(supports-color@10.2.2)
      '@babel/types': 7.29.0
      '@jridgewell/remapping': 2.3.5
      convert-source-map: 2.0.0
      debug: 4.4.3(supports-color@10.2.2)
      gensync: 1.0.0-beta.2
      json5: 2.2.3
      semver: 6.3.1
    transitivePeerDependencies:
      - supports-color

  '@babel/generator@7.29.1':
    dependencies:
      '@babel/parser': 7.29.3
      '@babel/types': 7.29.0
      '@jridgewell/gen-mapping': 0.3.13
      '@jridgewell/trace-mapping': 0.3.31
      jsesc: 3.1.0

  '@babel/helper-compilation-targets@7.28.6':
    dependencies:
      '@babel/compat-data': 7.29.3
      '@babel/helper-validator-option': 7.27.1
      browserslist: 4.28.2
      lru-cache: 5.1.1
      semver: 6.3.1

  '@babel/helper-globals@7.28.0': {}

  '@babel/helper-module-imports@7.28.6(supports-color@10.2.2)':
    dependencies:
      '@babel/traverse': 7.29.0(supports-color@10.2.2)
      '@babel/types': 7.29.0
    transitivePeerDependencies:
      - supports-color

  '@babel/helper-module-transforms@7.28.6(@babel/core@7.29.0(supports-color@10.2.2))(supports-color@10.2.2)':
    dependencies:
      '@babel/core': 7.29.0(supports-color@10.2.2)
      '@babel/helper-module-imports': 7.28.6(supports-color@10.2.2)
      '@babel/helper-validator-identifier': 7.28.5
      '@babel/traverse': 7.29.0(supports-color@10.2.2)
    transitivePeerDependencies:
      - supports-color

  '@babel/helper-string-parser@7.27.1': {}

  '@babel/helper-validator-identifier@7.28.5': {}

  '@babel/helper-validator-option@7.27.1': {}

  '@babel/helpers@7.29.2':
    dependencies:
      '@babel/template': 7.28.6
      '@babel/types': 7.29.0

  '@babel/parser@7.29.3':
    dependencies:
      '@babel/types': 7.29.0

  '@babel/runtime@7.29.7': {}

  '@babel/template@7.28.6':
    dependencies:
      '@babel/code-frame': 7.29.0
      '@babel/parser': 7.29.3
      '@babel/types': 7.29.0

  '@babel/traverse@7.29.0(supports-color@10.2.2)':
    dependencies:
      '@babel/code-frame': 7.29.0
      '@babel/generator': 7.29.1
      '@babel/helper-globals': 7.28.0
      '@babel/parser': 7.29.3
      '@babel/template': 7.28.6
      '@babel/types': 7.29.0
      debug: 4.4.3(supports-color@10.2.2)
    transitivePeerDependencies:
      - supports-color

  '@babel/types@7.29.0':
    dependencies:
      '@babel/helper-string-parser': 7.27.1
      '@babel/helper-validator-identifier': 7.28.5

  '@base-ui/react@1.7.0(@date-fns/tz@1.5.0)(@types/react@19.2.14)(date-fns@4.4.0)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)':
    dependencies:
      '@babel/runtime': 7.29.7
      '@base-ui/utils': 0.3.2(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@floating-ui/react-dom': 2.1.9(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@floating-ui/utils': 0.2.12
      react: 19.2.6
      react-dom: 19.2.6(react@19.2.6)
      use-sync-external-store: 1.6.0(react@19.2.6)
    optionalDependencies:
      '@date-fns/tz': 1.5.0
      '@types/react': 19.2.14
      date-fns: 4.4.0

  '@base-ui/utils@0.3.2(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)':
    dependencies:
      '@babel/runtime': 7.29.7
      '@floating-ui/utils': 0.2.12
      react: 19.2.6
      react-dom: 19.2.6(react@19.2.6)
      reselect: 5.2.0
      use-sync-external-store: 1.6.0(react@19.2.6)
    optionalDependencies:
      '@types/react': 19.2.14

  '@cloudflare/kv-asset-handler@0.5.0': {}

  '@cloudflare/unenv-preset@2.16.1(unenv@2.0.0-rc.24)(workerd@1.20260515.1)':
    dependencies:
      unenv: 2.0.0-rc.24
    optionalDependencies:
      workerd: 1.20260515.1

  '@cloudflare/vite-plugin@1.37.1(@types/node@22.19.19)(vite@8.0.13(@types/node@22.19.19)(esbuild@0.28.0)(jiti@2.7.0)(terser@5.47.1)(tsx@4.22.1))(workerd@1.20260515.1)(wrangler@4.92.0(@cloudflare/workers-types@4.20260515.1)(@types/node@22.19.19))':
    dependencies:
      '@cloudflare/unenv-preset': 2.16.1(unenv@2.0.0-rc.24)(workerd@1.20260515.1)
      miniflare: 4.20260515.0(@types/node@22.19.19)
      unenv: 2.0.0-rc.24
      vite: 8.0.13(@types/node@22.19.19)(esbuild@0.28.0)(jiti@2.7.0)(terser@5.47.1)(tsx@4.22.1)
      wrangler: 4.92.0(@cloudflare/workers-types@4.20260515.1)(@types/node@22.19.19)
      ws: 8.18.0
    transitivePeerDependencies:
      - '@types/node'
      - bufferutil
      - utf-8-validate
      - workerd

  '@cloudflare/workerd-darwin-64@1.20260515.1':
    optional: true

  '@cloudflare/workerd-darwin-arm64@1.20260515.1':
    optional: true

  '@cloudflare/workerd-linux-64@1.20260515.1':
    optional: true

  '@cloudflare/workerd-linux-arm64@1.20260515.1':
    optional: true

  '@cloudflare/workerd-windows-64@1.20260515.1':
    optional: true

  '@cloudflare/workers-types@4.20260515.1': {}

  '@cspotcode/source-map-support@0.8.1':
    dependencies:
      '@jridgewell/trace-mapping': 0.3.9

  '@date-fns/tz@1.5.0': {}

  '@drizzle-team/brocli@0.10.2': {}

  '@emnapi/core@1.10.0':
    dependencies:
      '@emnapi/wasi-threads': 1.2.1
      tslib: 2.8.1
    optional: true

  '@emnapi/runtime@1.10.0':
    dependencies:
      tslib: 2.8.1
    optional: true

  '@emnapi/runtime@1.11.3':
    dependencies:
      tslib: 2.8.1
    optional: true

  '@emnapi/wasi-threads@1.2.1':
    dependencies:
      tslib: 2.8.1
    optional: true

  '@esbuild-kit/core-utils@3.3.2':
    dependencies:
      esbuild: 0.18.20
      source-map-support: 0.5.21

  '@esbuild-kit/esm-loader@2.6.5':
    dependencies:
      '@esbuild-kit/core-utils': 3.3.2
      get-tsconfig: 4.14.0

  '@esbuild/aix-ppc64@0.25.12':
    optional: true

  '@esbuild/aix-ppc64@0.27.3':
    optional: true

  '@esbuild/aix-ppc64@0.28.0':
    optional: true

  '@esbuild/android-arm64@0.18.20':
    optional: true

  '@esbuild/android-arm64@0.25.12':
    optional: true

  '@esbuild/android-arm64@0.27.3':
    optional: true

  '@esbuild/android-arm64@0.28.0':
    optional: true

  '@esbuild/android-arm@0.18.20':
    optional: true

  '@esbuild/android-arm@0.25.12':
    optional: true

  '@esbuild/android-arm@0.27.3':
    optional: true

  '@esbuild/android-arm@0.28.0':
    optional: true

  '@esbuild/android-x64@0.18.20':
    optional: true

  '@esbuild/android-x64@0.25.12':
    optional: true

  '@esbuild/android-x64@0.27.3':
    optional: true

  '@esbuild/android-x64@0.28.0':
    optional: true

  '@esbuild/darwin-arm64@0.18.20':
    optional: true

  '@esbuild/darwin-arm64@0.25.12':
    optional: true

  '@esbuild/darwin-arm64@0.27.3':
    optional: true

  '@esbuild/darwin-arm64@0.28.0':
    optional: true

  '@esbuild/darwin-x64@0.18.20':
    optional: true

  '@esbuild/darwin-x64@0.25.12':
    optional: true

  '@esbuild/darwin-x64@0.27.3':
    optional: true

  '@esbuild/darwin-x64@0.28.0':
    optional: true

  '@esbuild/freebsd-arm64@0.18.20':
    optional: true

  '@esbuild/freebsd-arm64@0.25.12':
    optional: true

  '@esbuild/freebsd-arm64@0.27.3':
    optional: true

  '@esbuild/freebsd-arm64@0.28.0':
    optional: true

  '@esbuild/freebsd-x64@0.18.20':
    optional: true

  '@esbuild/freebsd-x64@0.25.12':
    optional: true

  '@esbuild/freebsd-x64@0.27.3':
    optional: true

  '@esbuild/freebsd-x64@0.28.0':
    optional: true

  '@esbuild/linux-arm64@0.18.20':
    optional: true

  '@esbuild/linux-arm64@0.25.12':
    optional: true

  '@esbuild/linux-arm64@0.27.3':
    optional: true

  '@esbuild/linux-arm64@0.28.0':
    optional: true

  '@esbuild/linux-arm@0.18.20':
    optional: true

  '@esbuild/linux-arm@0.25.12':
    optional: true

  '@esbuild/linux-arm@0.27.3':
    optional: true

  '@esbuild/linux-arm@0.28.0':
    optional: true

  '@esbuild/linux-ia32@0.18.20':
    optional: true

  '@esbuild/linux-ia32@0.25.12':
    optional: true

  '@esbuild/linux-ia32@0.27.3':
    optional: true

  '@esbuild/linux-ia32@0.28.0':
    optional: true

  '@esbuild/linux-loong64@0.18.20':
    optional: true

  '@esbuild/linux-loong64@0.25.12':
    optional: true

  '@esbuild/linux-loong64@0.27.3':
    optional: true

  '@esbuild/linux-loong64@0.28.0':
    optional: true

  '@esbuild/linux-mips64el@0.18.20':
    optional: true

  '@esbuild/linux-mips64el@0.25.12':
    optional: true

  '@esbuild/linux-mips64el@0.27.3':
    optional: true

  '@esbuild/linux-mips64el@0.28.0':
    optional: true

  '@esbuild/linux-ppc64@0.18.20':
    optional: true

  '@esbuild/linux-ppc64@0.25.12':
    optional: true

  '@esbuild/linux-ppc64@0.27.3':
    optional: true

  '@esbuild/linux-ppc64@0.28.0':
    optional: true

  '@esbuild/linux-riscv64@0.18.20':
    optional: true

  '@esbuild/linux-riscv64@0.25.12':
    optional: true

  '@esbuild/linux-riscv64@0.27.3':
    optional: true

  '@esbuild/linux-riscv64@0.28.0':
    optional: true

  '@esbuild/linux-s390x@0.18.20':
    optional: true

  '@esbuild/linux-s390x@0.25.12':
    optional: true

  '@esbuild/linux-s390x@0.27.3':
    optional: true

  '@esbuild/linux-s390x@0.28.0':
    optional: true

  '@esbuild/linux-x64@0.18.20':
    optional: true

  '@esbuild/linux-x64@0.25.12':
    optional: true

  '@esbuild/linux-x64@0.27.3':
    optional: true

  '@esbuild/linux-x64@0.28.0':
    optional: true

  '@esbuild/netbsd-arm64@0.25.12':
    optional: true

  '@esbuild/netbsd-arm64@0.27.3':
    optional: true

  '@esbuild/netbsd-arm64@0.28.0':
    optional: true

  '@esbuild/netbsd-x64@0.18.20':
    optional: true

  '@esbuild/netbsd-x64@0.25.12':
    optional: true

  '@esbuild/netbsd-x64@0.27.3':
    optional: true

  '@esbuild/netbsd-x64@0.28.0':
    optional: true

  '@esbuild/openbsd-arm64@0.25.12':
    optional: true

  '@esbuild/openbsd-arm64@0.27.3':
    optional: true

  '@esbuild/openbsd-arm64@0.28.0':
    optional: true

  '@esbuild/openbsd-x64@0.18.20':
    optional: true

  '@esbuild/openbsd-x64@0.25.12':
    optional: true

  '@esbuild/openbsd-x64@0.27.3':
    optional: true

  '@esbuild/openbsd-x64@0.28.0':
    optional: true

  '@esbuild/openharmony-arm64@0.25.12':
    optional: true

  '@esbuild/openharmony-arm64@0.27.3':
    optional: true

  '@esbuild/openharmony-arm64@0.28.0':
    optional: true

  '@esbuild/sunos-x64@0.18.20':
    optional: true

  '@esbuild/sunos-x64@0.25.12':
    optional: true

  '@esbuild/sunos-x64@0.27.3':
    optional: true

  '@esbuild/sunos-x64@0.28.0':
    optional: true

  '@esbuild/win32-arm64@0.18.20':
    optional: true

  '@esbuild/win32-arm64@0.25.12':
    optional: true

  '@esbuild/win32-arm64@0.27.3':
    optional: true

  '@esbuild/win32-arm64@0.28.0':
    optional: true

  '@esbuild/win32-ia32@0.18.20':
    optional: true

  '@esbuild/win32-ia32@0.25.12':
    optional: true

  '@esbuild/win32-ia32@0.27.3':
    optional: true

  '@esbuild/win32-ia32@0.28.0':
    optional: true

  '@esbuild/win32-x64@0.18.20':
    optional: true

  '@esbuild/win32-x64@0.25.12':
    optional: true

  '@esbuild/win32-x64@0.27.3':
    optional: true

  '@esbuild/win32-x64@0.28.0':
    optional: true

  '@eslint-community/eslint-utils@4.9.1(eslint@9.39.4(jiti@2.7.0)(supports-color@10.2.2))':
    dependencies:
      eslint: 9.39.4(jiti@2.7.0)(supports-color@10.2.2)
      eslint-visitor-keys: 3.4.3

  '@eslint-community/regexpp@4.12.2': {}

  '@eslint/config-array@0.21.2(supports-color@10.2.2)':
    dependencies:
      '@eslint/object-schema': 2.1.7
      debug: 4.4.3(supports-color@10.2.2)
      minimatch: 3.1.5
    transitivePeerDependencies:
      - supports-color

  '@eslint/config-helpers@0.4.2':
    dependencies:
      '@eslint/core': 0.17.0

  '@eslint/core@0.17.0':
    dependencies:
      '@types/json-schema': 7.0.15

  '@eslint/eslintrc@3.3.5(supports-color@10.2.2)':
    dependencies:
      ajv: 6.15.0
      debug: 4.4.3(supports-color@10.2.2)
      espree: 10.4.0
      globals: 14.0.0
      ignore: 5.3.2
      import-fresh: 3.3.1
      js-yaml: 4.1.1
      minimatch: 3.1.5
      strip-json-comments: 3.1.1
    transitivePeerDependencies:
      - supports-color

  '@eslint/js@9.39.4': {}

  '@eslint/object-schema@2.1.7': {}

  '@eslint/plugin-kit@0.4.1':
    dependencies:
      '@eslint/core': 0.17.0
      levn: 0.4.1

  '@floating-ui/core@1.8.0':
    dependencies:
      '@floating-ui/utils': 0.2.12

  '@floating-ui/dom@1.8.0':
    dependencies:
      '@floating-ui/core': 1.8.0
      '@floating-ui/utils': 0.2.12

  '@floating-ui/react-dom@2.1.9(react-dom@19.2.6(react@19.2.6))(react@19.2.6)':
    dependencies:
      '@floating-ui/dom': 1.8.0
      react: 19.2.6
      react-dom: 19.2.6(react@19.2.6)

  '@floating-ui/utils@0.2.12': {}

  '@hookform/resolvers@5.7.1(@standard-schema/spec@1.1.0)(ajv-formats@2.1.1(ajv@8.20.0))(ajv@8.20.0)(react-hook-form@7.85.0(react@19.2.6))(zod@3.25.76)':
    dependencies:
      '@standard-schema/utils': 0.3.0
      react-hook-form: 7.85.0(react@19.2.6)
    optionalDependencies:
      '@standard-schema/spec': 1.1.0
      ajv: 8.20.0
      ajv-formats: 2.1.1(ajv@8.20.0)
      zod: 3.25.76

  '@humanfs/core@0.19.2':
    dependencies:
      '@humanfs/types': 0.15.0

  '@humanfs/node@0.16.8':
    dependencies:
      '@humanfs/core': 0.19.2
      '@humanfs/types': 0.15.0
      '@humanwhocodes/retry': 0.4.3

  '@humanfs/types@0.15.0': {}

  '@humanwhocodes/module-importer@1.0.1': {}

  '@humanwhocodes/retry@0.4.3': {}

  '@img/colour@1.1.0': {}

  '@img/sharp-darwin-arm64@0.35.4':
    optionalDependencies:
      '@img/sharp-libvips-darwin-arm64': 1.3.3
    optional: true

  '@img/sharp-darwin-x64@0.35.4':
    optionalDependencies:
      '@img/sharp-libvips-darwin-x64': 1.3.3
    optional: true

  '@img/sharp-freebsd-wasm32@0.35.4':
    dependencies:
      '@img/sharp-wasm32': 0.35.4
    optional: true

  '@img/sharp-libvips-darwin-arm64@1.3.3':
    optional: true

  '@img/sharp-libvips-darwin-x64@1.3.3':
    optional: true

  '@img/sharp-libvips-linux-arm64@1.3.3':
    optional: true

  '@img/sharp-libvips-linux-arm@1.3.3':
    optional: true

  '@img/sharp-libvips-linux-ppc64@1.3.3':
    optional: true

  '@img/sharp-libvips-linux-riscv64@1.3.3':
    optional: true

  '@img/sharp-libvips-linux-s390x@1.3.3':
    optional: true

  '@img/sharp-libvips-linux-x64@1.3.3':
    optional: true

  '@img/sharp-libvips-linuxmusl-arm64@1.3.3':
    optional: true

  '@img/sharp-libvips-linuxmusl-x64@1.3.3':
    optional: true

  '@img/sharp-linux-arm64@0.35.4':
    optionalDependencies:
      '@img/sharp-libvips-linux-arm64': 1.3.3
    optional: true

  '@img/sharp-linux-arm@0.35.4':
    optionalDependencies:
      '@img/sharp-libvips-linux-arm': 1.3.3
    optional: true

  '@img/sharp-linux-ppc64@0.35.4':
    optionalDependencies:
      '@img/sharp-libvips-linux-ppc64': 1.3.3
    optional: true

  '@img/sharp-linux-riscv64@0.35.4':
    optionalDependencies:
      '@img/sharp-libvips-linux-riscv64': 1.3.3
    optional: true

  '@img/sharp-linux-s390x@0.35.4':
    optionalDependencies:
      '@img/sharp-libvips-linux-s390x': 1.3.3
    optional: true

  '@img/sharp-linux-x64@0.35.4':
    optionalDependencies:
      '@img/sharp-libvips-linux-x64': 1.3.3
    optional: true

  '@img/sharp-linuxmusl-arm64@0.35.4':
    optionalDependencies:
      '@img/sharp-libvips-linuxmusl-arm64': 1.3.3
    optional: true

  '@img/sharp-linuxmusl-x64@0.35.4':
    optionalDependencies:
      '@img/sharp-libvips-linuxmusl-x64': 1.3.3
    optional: true

  '@img/sharp-wasm32@0.35.4':
    dependencies:
      '@emnapi/runtime': 1.11.3
    optional: true

  '@img/sharp-webcontainers-wasm32@0.35.4':
    dependencies:
      '@img/sharp-wasm32': 0.35.4
    optional: true

  '@img/sharp-win32-arm64@0.35.4':
    optional: true

  '@img/sharp-win32-ia32@0.35.4':
    optional: true

  '@img/sharp-win32-x64@0.35.4':
    optional: true

  '@jridgewell/gen-mapping@0.3.13':
    dependencies:
      '@jridgewell/sourcemap-codec': 1.5.5
      '@jridgewell/trace-mapping': 0.3.31

  '@jridgewell/remapping@2.3.5':
    dependencies:
      '@jridgewell/gen-mapping': 0.3.13
      '@jridgewell/trace-mapping': 0.3.31

  '@jridgewell/resolve-uri@3.1.2': {}

  '@jridgewell/source-map@0.3.11':
    dependencies:
      '@jridgewell/gen-mapping': 0.3.13
      '@jridgewell/trace-mapping': 0.3.31

  '@jridgewell/sourcemap-codec@1.5.5': {}

  '@jridgewell/trace-mapping@0.3.31':
    dependencies:
      '@jridgewell/resolve-uri': 3.1.2
      '@jridgewell/sourcemap-codec': 1.5.5

  '@jridgewell/trace-mapping@0.3.9':
    dependencies:
      '@jridgewell/resolve-uri': 3.1.2
      '@jridgewell/sourcemap-codec': 1.5.5

  '@napi-rs/wasm-runtime@0.2.12':
    dependencies:
      '@emnapi/core': 1.10.0
      '@emnapi/runtime': 1.11.3
      '@tybys/wasm-util': 0.10.2
    optional: true

  '@napi-rs/wasm-runtime@1.1.4(@emnapi/core@1.10.0)(@emnapi/runtime@1.10.0)':
    dependencies:
      '@emnapi/core': 1.10.0
      '@emnapi/runtime': 1.10.0
      '@tybys/wasm-util': 0.10.2
    optional: true

  '@next/env@16.3.4': {}

  '@next/eslint-plugin-next@16.3.4(eslint@9.39.4(jiti@2.7.0)(supports-color@10.2.2))':
    dependencies:
      '@eslint-community/eslint-utils': 4.9.1(eslint@9.39.4(jiti@2.7.0)(supports-color@10.2.2))
      fast-glob: 3.3.1
    transitivePeerDependencies:
      - eslint

  '@next/swc-darwin-arm64@16.3.4':
    optional: true

  '@next/swc-darwin-x64@16.3.4':
    optional: true

  '@next/swc-linux-arm64-gnu@16.3.4':
    optional: true

  '@next/swc-linux-arm64-musl@16.3.4':
    optional: true

  '@next/swc-linux-x64-gnu@16.3.4':
    optional: true

  '@next/swc-linux-x64-musl@16.3.4':
    optional: true

  '@next/swc-win32-arm64-msvc@16.3.4':
    optional: true

  '@next/swc-win32-x64-msvc@16.3.4':
    optional: true

  '@nodelib/fs.scandir@2.1.5':
    dependencies:
      '@nodelib/fs.stat': 2.0.5
      run-parallel: 1.2.0

  '@nodelib/fs.stat@2.0.5': {}

  '@nodelib/fs.walk@1.2.8':
    dependencies:
      '@nodelib/fs.scandir': 2.1.5
      fastq: 1.20.1

  '@nolyfill/is-core-module@1.0.39': {}

  '@oxc-project/types@0.130.0': {}

  '@poppinss/colors@4.1.6':
    dependencies:
      kleur: 4.1.5

  '@poppinss/dumper@0.6.5':
    dependencies:
      '@poppinss/colors': 4.1.6
      '@sindresorhus/is': 7.2.0
      supports-color: 10.2.2

  '@poppinss/exception@1.2.3': {}

  '@radix-ui/number@1.1.3': {}

  '@radix-ui/primitive@1.1.7': {}

  '@radix-ui/react-accessible-icon@1.1.15(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)':
    dependencies:
      '@radix-ui/react-visually-hidden': 1.2.11(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      react: 19.2.6
      react-dom: 19.2.6(react@19.2.6)
    optionalDependencies:
      '@types/react': 19.2.14
      '@types/react-dom': 19.2.3(@types/react@19.2.14)

  '@radix-ui/react-accordion@1.2.20(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)':
    dependencies:
      '@radix-ui/primitive': 1.1.7
      '@radix-ui/react-collapsible': 1.1.20(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-collection': 1.1.15(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-compose-refs': 1.1.5(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-context': 1.2.2(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-direction': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-id': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-use-controllable-state': 1.2.6(@types/react@19.2.14)(react@19.2.6)
      react: 19.2.6
      react-dom: 19.2.6(react@19.2.6)
    optionalDependencies:
      '@types/react': 19.2.14
      '@types/react-dom': 19.2.3(@types/react@19.2.14)

  '@radix-ui/react-alert-dialog@1.1.23(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)':
    dependencies:
      '@radix-ui/primitive': 1.1.7
      '@radix-ui/react-compose-refs': 1.1.5(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-context': 1.2.2(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-dialog': 1.1.23(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      react: 19.2.6
      react-dom: 19.2.6(react@19.2.6)
    optionalDependencies:
      '@types/react': 19.2.14
      '@types/react-dom': 19.2.3(@types/react@19.2.14)

  '@radix-ui/react-arrow@1.1.15(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)':
    dependencies:
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      react: 19.2.6
      react-dom: 19.2.6(react@19.2.6)
    optionalDependencies:
      '@types/react': 19.2.14
      '@types/react-dom': 19.2.3(@types/react@19.2.14)

  '@radix-ui/react-aspect-ratio@1.1.15(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)':
    dependencies:
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      react: 19.2.6
      react-dom: 19.2.6(react@19.2.6)
    optionalDependencies:
      '@types/react': 19.2.14
      '@types/react-dom': 19.2.3(@types/react@19.2.14)

  '@radix-ui/react-avatar@1.2.6(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)':
    dependencies:
      '@radix-ui/primitive': 1.1.7
      '@radix-ui/react-context': 1.2.2(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-use-callback-ref': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-use-is-hydrated': 0.1.3(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-use-layout-effect': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      react: 19.2.6
      react-dom: 19.2.6(react@19.2.6)
    optionalDependencies:
      '@types/react': 19.2.14
      '@types/react-dom': 19.2.3(@types/react@19.2.14)

  '@radix-ui/react-checkbox@1.3.11(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)':
    dependencies:
      '@radix-ui/primitive': 1.1.7
      '@radix-ui/react-compose-refs': 1.1.5(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-context': 1.2.2(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-presence': 1.1.10(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-use-controllable-state': 1.2.6(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-use-size': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      react: 19.2.6
      react-dom: 19.2.6(react@19.2.6)
    optionalDependencies:
      '@types/react': 19.2.14
      '@types/react-dom': 19.2.3(@types/react@19.2.14)

  '@radix-ui/react-collapsible@1.1.20(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)':
    dependencies:
      '@radix-ui/primitive': 1.1.7
      '@radix-ui/react-compose-refs': 1.1.5(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-context': 1.2.2(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-id': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-presence': 1.1.10(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-use-controllable-state': 1.2.6(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-use-layout-effect': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      react: 19.2.6
      react-dom: 19.2.6(react@19.2.6)
    optionalDependencies:
      '@types/react': 19.2.14
      '@types/react-dom': 19.2.3(@types/react@19.2.14)

  '@radix-ui/react-collection@1.1.15(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)':
    dependencies:
      '@radix-ui/react-compose-refs': 1.1.5(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-context': 1.2.2(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-slot': 1.3.3(@types/react@19.2.14)(react@19.2.6)
      react: 19.2.6
      react-dom: 19.2.6(react@19.2.6)
    optionalDependencies:
      '@types/react': 19.2.14
      '@types/react-dom': 19.2.3(@types/react@19.2.14)

  '@radix-ui/react-compose-refs@1.1.5(@types/react@19.2.14)(react@19.2.6)':
    dependencies:
      react: 19.2.6
    optionalDependencies:
      '@types/react': 19.2.14

  '@radix-ui/react-context-menu@2.3.7(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)':
    dependencies:
      '@radix-ui/primitive': 1.1.7
      '@radix-ui/react-context': 1.2.2(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-menu': 2.1.24(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-use-controllable-state': 1.2.6(@types/react@19.2.14)(react@19.2.6)
      react: 19.2.6
      react-dom: 19.2.6(react@19.2.6)
    optionalDependencies:
      '@types/react': 19.2.14
      '@types/react-dom': 19.2.3(@types/react@19.2.14)

  '@radix-ui/react-context@1.2.2(@types/react@19.2.14)(react@19.2.6)':
    dependencies:
      react: 19.2.6
    optionalDependencies:
      '@types/react': 19.2.14

  '@radix-ui/react-dialog@1.1.23(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)':
    dependencies:
      '@radix-ui/primitive': 1.1.7
      '@radix-ui/react-compose-refs': 1.1.5(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-context': 1.2.2(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-dismissable-layer': 1.1.19(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-focus-guards': 1.1.6(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-focus-scope': 1.1.16(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-id': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-portal': 1.1.17(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-presence': 1.1.10(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-slot': 1.3.3(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-use-controllable-state': 1.2.6(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-use-layout-effect': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      aria-hidden: 1.2.6
      react: 19.2.6
      react-dom: 19.2.6(react@19.2.6)
      react-remove-scroll: 2.7.2(@types/react@19.2.14)(react@19.2.6)
    optionalDependencies:
      '@types/react': 19.2.14
      '@types/react-dom': 19.2.3(@types/react@19.2.14)

  '@radix-ui/react-direction@1.1.4(@types/react@19.2.14)(react@19.2.6)':
    dependencies:
      react: 19.2.6
    optionalDependencies:
      '@types/react': 19.2.14

  '@radix-ui/react-dismissable-layer@1.1.19(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)':
    dependencies:
      '@radix-ui/primitive': 1.1.7
      '@radix-ui/react-compose-refs': 1.1.5(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-use-callback-ref': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-use-effect-event': 0.0.5(@types/react@19.2.14)(react@19.2.6)
      react: 19.2.6
      react-dom: 19.2.6(react@19.2.6)
    optionalDependencies:
      '@types/react': 19.2.14
      '@types/react-dom': 19.2.3(@types/react@19.2.14)

  '@radix-ui/react-dropdown-menu@2.1.24(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)':
    dependencies:
      '@radix-ui/primitive': 1.1.7
      '@radix-ui/react-compose-refs': 1.1.5(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-context': 1.2.2(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-id': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-menu': 2.1.24(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-use-controllable-state': 1.2.6(@types/react@19.2.14)(react@19.2.6)
      react: 19.2.6
      react-dom: 19.2.6(react@19.2.6)
    optionalDependencies:
      '@types/react': 19.2.14
      '@types/react-dom': 19.2.3(@types/react@19.2.14)

  '@radix-ui/react-focus-guards@1.1.6(@types/react@19.2.14)(react@19.2.6)':
    dependencies:
      react: 19.2.6
    optionalDependencies:
      '@types/react': 19.2.14

  '@radix-ui/react-focus-scope@1.1.16(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)':
    dependencies:
      '@radix-ui/react-compose-refs': 1.1.5(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-use-callback-ref': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      react: 19.2.6
      react-dom: 19.2.6(react@19.2.6)
    optionalDependencies:
      '@types/react': 19.2.14
      '@types/react-dom': 19.2.3(@types/react@19.2.14)

  '@radix-ui/react-form@0.1.16(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)':
    dependencies:
      '@radix-ui/primitive': 1.1.7
      '@radix-ui/react-compose-refs': 1.1.5(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-context': 1.2.2(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-id': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-label': 2.1.15(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      react: 19.2.6
      react-dom: 19.2.6(react@19.2.6)
    optionalDependencies:
      '@types/react': 19.2.14
      '@types/react-dom': 19.2.3(@types/react@19.2.14)

  '@radix-ui/react-hover-card@1.1.23(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)':
    dependencies:
      '@radix-ui/primitive': 1.1.7
      '@radix-ui/react-compose-refs': 1.1.5(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-context': 1.2.2(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-dismissable-layer': 1.1.19(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-popper': 1.3.7(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-portal': 1.1.17(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-presence': 1.1.10(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-use-controllable-state': 1.2.6(@types/react@19.2.14)(react@19.2.6)
      react: 19.2.6
      react-dom: 19.2.6(react@19.2.6)
    optionalDependencies:
      '@types/react': 19.2.14
      '@types/react-dom': 19.2.3(@types/react@19.2.14)

  '@radix-ui/react-id@1.1.4(@types/react@19.2.14)(react@19.2.6)':
    dependencies:
      '@radix-ui/react-use-layout-effect': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      react: 19.2.6
    optionalDependencies:
      '@types/react': 19.2.14

  '@radix-ui/react-label@2.1.15(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)':
    dependencies:
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      react: 19.2.6
      react-dom: 19.2.6(react@19.2.6)
    optionalDependencies:
      '@types/react': 19.2.14
      '@types/react-dom': 19.2.3(@types/react@19.2.14)

  '@radix-ui/react-menu@2.1.24(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)':
    dependencies:
      '@radix-ui/primitive': 1.1.7
      '@radix-ui/react-collection': 1.1.15(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-compose-refs': 1.1.5(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-context': 1.2.2(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-direction': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-dismissable-layer': 1.1.19(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-focus-guards': 1.1.6(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-focus-scope': 1.1.16(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-id': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-popper': 1.3.7(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-portal': 1.1.17(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-presence': 1.1.10(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-roving-focus': 1.1.19(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-slot': 1.3.3(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-use-callback-ref': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      aria-hidden: 1.2.6
      react: 19.2.6
      react-dom: 19.2.6(react@19.2.6)
      react-remove-scroll: 2.7.2(@types/react@19.2.14)(react@19.2.6)
    optionalDependencies:
      '@types/react': 19.2.14
      '@types/react-dom': 19.2.3(@types/react@19.2.14)

  '@radix-ui/react-menubar@1.1.24(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)':
    dependencies:
      '@radix-ui/primitive': 1.1.7
      '@radix-ui/react-collection': 1.1.15(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-compose-refs': 1.1.5(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-context': 1.2.2(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-direction': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-id': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-menu': 2.1.24(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-roving-focus': 1.1.19(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-use-controllable-state': 1.2.6(@types/react@19.2.14)(react@19.2.6)
      react: 19.2.6
      react-dom: 19.2.6(react@19.2.6)
    optionalDependencies:
      '@types/react': 19.2.14
      '@types/react-dom': 19.2.3(@types/react@19.2.14)

  '@radix-ui/react-navigation-menu@1.2.22(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)':
    dependencies:
      '@radix-ui/primitive': 1.1.7
      '@radix-ui/react-collection': 1.1.15(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-compose-refs': 1.1.5(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-context': 1.2.2(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-direction': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-dismissable-layer': 1.1.19(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-id': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-presence': 1.1.10(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-use-callback-ref': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-use-controllable-state': 1.2.6(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-use-layout-effect': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-use-previous': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-visually-hidden': 1.2.11(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      react: 19.2.6
      react-dom: 19.2.6(react@19.2.6)
    optionalDependencies:
      '@types/react': 19.2.14
      '@types/react-dom': 19.2.3(@types/react@19.2.14)

  '@radix-ui/react-one-time-password-field@0.1.16(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)':
    dependencies:
      '@radix-ui/number': 1.1.3
      '@radix-ui/primitive': 1.1.7
      '@radix-ui/react-collection': 1.1.15(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-compose-refs': 1.1.5(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-context': 1.2.2(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-direction': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-roving-focus': 1.1.19(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-use-controllable-state': 1.2.6(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-use-effect-event': 0.0.5(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-use-is-hydrated': 0.1.3(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-use-layout-effect': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      react: 19.2.6
      react-dom: 19.2.6(react@19.2.6)
    optionalDependencies:
      '@types/react': 19.2.14
      '@types/react-dom': 19.2.3(@types/react@19.2.14)

  '@radix-ui/react-password-toggle-field@0.1.11(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)':
    dependencies:
      '@radix-ui/primitive': 1.1.7
      '@radix-ui/react-compose-refs': 1.1.5(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-context': 1.2.2(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-id': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-use-controllable-state': 1.2.6(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-use-effect-event': 0.0.5(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-use-is-hydrated': 0.1.3(@types/react@19.2.14)(react@19.2.6)
      react: 19.2.6
      react-dom: 19.2.6(react@19.2.6)
    optionalDependencies:
      '@types/react': 19.2.14
      '@types/react-dom': 19.2.3(@types/react@19.2.14)

  '@radix-ui/react-popover@1.1.23(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)':
    dependencies:
      '@radix-ui/primitive': 1.1.7
      '@radix-ui/react-compose-refs': 1.1.5(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-context': 1.2.2(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-dismissable-layer': 1.1.19(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-focus-guards': 1.1.6(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-focus-scope': 1.1.16(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-id': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-popper': 1.3.7(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-portal': 1.1.17(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-presence': 1.1.10(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-slot': 1.3.3(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-use-controllable-state': 1.2.6(@types/react@19.2.14)(react@19.2.6)
      aria-hidden: 1.2.6
      react: 19.2.6
      react-dom: 19.2.6(react@19.2.6)
      react-remove-scroll: 2.7.2(@types/react@19.2.14)(react@19.2.6)
    optionalDependencies:
      '@types/react': 19.2.14
      '@types/react-dom': 19.2.3(@types/react@19.2.14)

  '@radix-ui/react-popper@1.3.7(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)':
    dependencies:
      '@floating-ui/react-dom': 2.1.9(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-arrow': 1.1.15(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-compose-refs': 1.1.5(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-context': 1.2.2(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-use-callback-ref': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-use-layout-effect': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-use-rect': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-use-size': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/rect': 1.1.3
      react: 19.2.6
      react-dom: 19.2.6(react@19.2.6)
    optionalDependencies:
      '@types/react': 19.2.14
      '@types/react-dom': 19.2.3(@types/react@19.2.14)

  '@radix-ui/react-portal@1.1.17(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)':
    dependencies:
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-use-layout-effect': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      react: 19.2.6
      react-dom: 19.2.6(react@19.2.6)
    optionalDependencies:
      '@types/react': 19.2.14
      '@types/react-dom': 19.2.3(@types/react@19.2.14)

  '@radix-ui/react-presence@1.1.10(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)':
    dependencies:
      '@radix-ui/react-use-layout-effect': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      react: 19.2.6
      react-dom: 19.2.6(react@19.2.6)
    optionalDependencies:
      '@types/react': 19.2.14
      '@types/react-dom': 19.2.3(@types/react@19.2.14)

  '@radix-ui/react-primitive@2.1.10(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)':
    dependencies:
      '@radix-ui/react-slot': 1.3.3(@types/react@19.2.14)(react@19.2.6)
      react: 19.2.6
      react-dom: 19.2.6(react@19.2.6)
    optionalDependencies:
      '@types/react': 19.2.14
      '@types/react-dom': 19.2.3(@types/react@19.2.14)

  '@radix-ui/react-progress@1.1.16(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)':
    dependencies:
      '@radix-ui/react-context': 1.2.2(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      react: 19.2.6
      react-dom: 19.2.6(react@19.2.6)
    optionalDependencies:
      '@types/react': 19.2.14
      '@types/react-dom': 19.2.3(@types/react@19.2.14)

  '@radix-ui/react-radio-group@1.4.7(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)':
    dependencies:
      '@radix-ui/primitive': 1.1.7
      '@radix-ui/react-compose-refs': 1.1.5(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-context': 1.2.2(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-direction': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-presence': 1.1.10(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-roving-focus': 1.1.19(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-use-controllable-state': 1.2.6(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-use-size': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      react: 19.2.6
      react-dom: 19.2.6(react@19.2.6)
    optionalDependencies:
      '@types/react': 19.2.14
      '@types/react-dom': 19.2.3(@types/react@19.2.14)

  '@radix-ui/react-roving-focus@1.1.19(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)':
    dependencies:
      '@radix-ui/primitive': 1.1.7
      '@radix-ui/react-collection': 1.1.15(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-compose-refs': 1.1.5(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-context': 1.2.2(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-direction': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-id': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-use-callback-ref': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-use-controllable-state': 1.2.6(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-use-is-hydrated': 0.1.3(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-use-layout-effect': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      react: 19.2.6
      react-dom: 19.2.6(react@19.2.6)
    optionalDependencies:
      '@types/react': 19.2.14
      '@types/react-dom': 19.2.3(@types/react@19.2.14)

  '@radix-ui/react-scroll-area@1.2.18(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)':
    dependencies:
      '@radix-ui/number': 1.1.3
      '@radix-ui/primitive': 1.1.7
      '@radix-ui/react-compose-refs': 1.1.5(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-context': 1.2.2(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-direction': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-presence': 1.1.10(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-use-callback-ref': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-use-layout-effect': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      react: 19.2.6
      react-dom: 19.2.6(react@19.2.6)
    optionalDependencies:
      '@types/react': 19.2.14
      '@types/react-dom': 19.2.3(@types/react@19.2.14)

  '@radix-ui/react-select@2.3.7(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)':
    dependencies:
      '@radix-ui/number': 1.1.3
      '@radix-ui/primitive': 1.1.7
      '@radix-ui/react-collection': 1.1.15(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-compose-refs': 1.1.5(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-context': 1.2.2(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-direction': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-dismissable-layer': 1.1.19(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-focus-guards': 1.1.6(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-focus-scope': 1.1.16(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-id': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-popper': 1.3.7(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-portal': 1.1.17(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-presence': 1.1.10(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-slot': 1.3.3(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-use-callback-ref': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-use-controllable-state': 1.2.6(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-use-layout-effect': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-use-previous': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-visually-hidden': 1.2.11(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      aria-hidden: 1.2.6
      react: 19.2.6
      react-dom: 19.2.6(react@19.2.6)
      react-remove-scroll: 2.7.2(@types/react@19.2.14)(react@19.2.6)
    optionalDependencies:
      '@types/react': 19.2.14
      '@types/react-dom': 19.2.3(@types/react@19.2.14)

  '@radix-ui/react-separator@1.1.15(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)':
    dependencies:
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      react: 19.2.6
      react-dom: 19.2.6(react@19.2.6)
    optionalDependencies:
      '@types/react': 19.2.14
      '@types/react-dom': 19.2.3(@types/react@19.2.14)

  '@radix-ui/react-slider@1.4.7(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)':
    dependencies:
      '@radix-ui/number': 1.1.3
      '@radix-ui/primitive': 1.1.7
      '@radix-ui/react-collection': 1.1.15(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-compose-refs': 1.1.5(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-context': 1.2.2(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-direction': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-use-controllable-state': 1.2.6(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-use-layout-effect': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-use-previous': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-use-size': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      react: 19.2.6
      react-dom: 19.2.6(react@19.2.6)
    optionalDependencies:
      '@types/react': 19.2.14
      '@types/react-dom': 19.2.3(@types/react@19.2.14)

  '@radix-ui/react-slot@1.3.3(@types/react@19.2.14)(react@19.2.6)':
    dependencies:
      '@radix-ui/react-compose-refs': 1.1.5(@types/react@19.2.14)(react@19.2.6)
      react: 19.2.6
    optionalDependencies:
      '@types/react': 19.2.14

  '@radix-ui/react-switch@1.3.7(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)':
    dependencies:
      '@radix-ui/primitive': 1.1.7
      '@radix-ui/react-compose-refs': 1.1.5(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-context': 1.2.2(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-use-controllable-state': 1.2.6(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-use-size': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      react: 19.2.6
      react-dom: 19.2.6(react@19.2.6)
    optionalDependencies:
      '@types/react': 19.2.14
      '@types/react-dom': 19.2.3(@types/react@19.2.14)

  '@radix-ui/react-tabs@1.1.21(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)':
    dependencies:
      '@radix-ui/primitive': 1.1.7
      '@radix-ui/react-context': 1.2.2(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-direction': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-id': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-presence': 1.1.10(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-roving-focus': 1.1.19(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-use-controllable-state': 1.2.6(@types/react@19.2.14)(react@19.2.6)
      react: 19.2.6
      react-dom: 19.2.6(react@19.2.6)
    optionalDependencies:
      '@types/react': 19.2.14
      '@types/react-dom': 19.2.3(@types/react@19.2.14)

  '@radix-ui/react-toast@1.2.23(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)':
    dependencies:
      '@radix-ui/primitive': 1.1.7
      '@radix-ui/react-collection': 1.1.15(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-compose-refs': 1.1.5(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-context': 1.2.2(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-dismissable-layer': 1.1.19(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-portal': 1.1.17(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-presence': 1.1.10(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-use-callback-ref': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-use-controllable-state': 1.2.6(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-use-layout-effect': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-visually-hidden': 1.2.11(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      react: 19.2.6
      react-dom: 19.2.6(react@19.2.6)
    optionalDependencies:
      '@types/react': 19.2.14
      '@types/react-dom': 19.2.3(@types/react@19.2.14)

  '@radix-ui/react-toggle-group@1.1.19(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)':
    dependencies:
      '@radix-ui/primitive': 1.1.7
      '@radix-ui/react-context': 1.2.2(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-direction': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-roving-focus': 1.1.19(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-toggle': 1.1.18(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-use-controllable-state': 1.2.6(@types/react@19.2.14)(react@19.2.6)
      react: 19.2.6
      react-dom: 19.2.6(react@19.2.6)
    optionalDependencies:
      '@types/react': 19.2.14
      '@types/react-dom': 19.2.3(@types/react@19.2.14)

  '@radix-ui/react-toggle@1.1.18(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)':
    dependencies:
      '@radix-ui/primitive': 1.1.7
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-use-controllable-state': 1.2.6(@types/react@19.2.14)(react@19.2.6)
      react: 19.2.6
      react-dom: 19.2.6(react@19.2.6)
    optionalDependencies:
      '@types/react': 19.2.14
      '@types/react-dom': 19.2.3(@types/react@19.2.14)

  '@radix-ui/react-toolbar@1.1.19(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)':
    dependencies:
      '@radix-ui/primitive': 1.1.7
      '@radix-ui/react-context': 1.2.2(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-direction': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-roving-focus': 1.1.19(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-separator': 1.1.15(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-toggle-group': 1.1.19(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      react: 19.2.6
      react-dom: 19.2.6(react@19.2.6)
    optionalDependencies:
      '@types/react': 19.2.14
      '@types/react-dom': 19.2.3(@types/react@19.2.14)

  '@radix-ui/react-tooltip@1.2.16(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)':
    dependencies:
      '@radix-ui/primitive': 1.1.7
      '@radix-ui/react-compose-refs': 1.1.5(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-context': 1.2.2(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-dismissable-layer': 1.1.19(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-id': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-popper': 1.3.7(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-portal': 1.1.17(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-presence': 1.1.10(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-slot': 1.3.3(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-use-controllable-state': 1.2.6(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-use-layout-effect': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-visually-hidden': 1.2.11(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      react: 19.2.6
      react-dom: 19.2.6(react@19.2.6)
    optionalDependencies:
      '@types/react': 19.2.14
      '@types/react-dom': 19.2.3(@types/react@19.2.14)

  '@radix-ui/react-use-callback-ref@1.1.4(@types/react@19.2.14)(react@19.2.6)':
    dependencies:
      react: 19.2.6
    optionalDependencies:
      '@types/react': 19.2.14

  '@radix-ui/react-use-controllable-state@1.2.6(@types/react@19.2.14)(react@19.2.6)':
    dependencies:
      '@radix-ui/primitive': 1.1.7
      '@radix-ui/react-use-effect-event': 0.0.5(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-use-layout-effect': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      react: 19.2.6
    optionalDependencies:
      '@types/react': 19.2.14

  '@radix-ui/react-use-effect-event@0.0.5(@types/react@19.2.14)(react@19.2.6)':
    dependencies:
      '@radix-ui/react-use-layout-effect': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      react: 19.2.6
    optionalDependencies:
      '@types/react': 19.2.14

  '@radix-ui/react-use-escape-keydown@1.1.5(@types/react@19.2.14)(react@19.2.6)':
    dependencies:
      '@radix-ui/react-use-callback-ref': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      react: 19.2.6
    optionalDependencies:
      '@types/react': 19.2.14

  '@radix-ui/react-use-is-hydrated@0.1.3(@types/react@19.2.14)(react@19.2.6)':
    dependencies:
      react: 19.2.6
    optionalDependencies:
      '@types/react': 19.2.14

  '@radix-ui/react-use-layout-effect@1.1.4(@types/react@19.2.14)(react@19.2.6)':
    dependencies:
      react: 19.2.6
    optionalDependencies:
      '@types/react': 19.2.14

  '@radix-ui/react-use-previous@1.1.4(@types/react@19.2.14)(react@19.2.6)':
    dependencies:
      react: 19.2.6
    optionalDependencies:
      '@types/react': 19.2.14

  '@radix-ui/react-use-rect@1.1.4(@types/react@19.2.14)(react@19.2.6)':
    dependencies:
      '@radix-ui/rect': 1.1.3
      react: 19.2.6
    optionalDependencies:
      '@types/react': 19.2.14

  '@radix-ui/react-use-size@1.1.4(@types/react@19.2.14)(react@19.2.6)':
    dependencies:
      '@radix-ui/react-use-layout-effect': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      react: 19.2.6
    optionalDependencies:
      '@types/react': 19.2.14

  '@radix-ui/react-visually-hidden@1.2.11(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)':
    dependencies:
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      react: 19.2.6
      react-dom: 19.2.6(react@19.2.6)
    optionalDependencies:
      '@types/react': 19.2.14
      '@types/react-dom': 19.2.3(@types/react@19.2.14)

  '@radix-ui/rect@1.1.3': {}

  '@reduxjs/toolkit@2.12.0(react-redux@9.3.0(@types/react@19.2.14)(react@19.2.6)(redux@5.0.1))(react@19.2.6)':
    dependencies:
      '@standard-schema/spec': 1.1.0
      '@standard-schema/utils': 0.3.0
      immer: 11.1.16
      redux: 5.0.1
      redux-thunk: 3.1.0(redux@5.0.1)
      reselect: 5.2.0
    optionalDependencies:
      react: 19.2.6
      react-redux: 9.3.0(@types/react@19.2.14)(react@19.2.6)(redux@5.0.1)

  '@resvg/resvg-wasm@2.4.0': {}

  '@rolldown/binding-android-arm64@1.0.1':
    optional: true

  '@rolldown/binding-darwin-arm64@1.0.1':
    optional: true

  '@rolldown/binding-darwin-x64@1.0.1':
    optional: true

  '@rolldown/binding-freebsd-x64@1.0.1':
    optional: true

  '@rolldown/binding-linux-arm-gnueabihf@1.0.1':
    optional: true

  '@rolldown/binding-linux-arm64-gnu@1.0.1':
    optional: true

  '@rolldown/binding-linux-arm64-musl@1.0.1':
    optional: true

  '@rolldown/binding-linux-ppc64-gnu@1.0.1':
    optional: true

  '@rolldown/binding-linux-s390x-gnu@1.0.1':
    optional: true

  '@rolldown/binding-linux-x64-gnu@1.0.1':
    optional: true

  '@rolldown/binding-linux-x64-musl@1.0.1':
    optional: true

  '@rolldown/binding-openharmony-arm64@1.0.1':
    optional: true

  '@rolldown/binding-wasm32-wasi@1.0.1':
    dependencies:
      '@emnapi/core': 1.10.0
      '@emnapi/runtime': 1.10.0
      '@napi-rs/wasm-runtime': 1.1.4(@emnapi/core@1.10.0)(@emnapi/runtime@1.10.0)
    optional: true

  '@rolldown/binding-win32-arm64-msvc@1.0.1':
    optional: true

  '@rolldown/binding-win32-x64-msvc@1.0.1':
    optional: true

  '@rolldown/pluginutils@1.0.0-rc.18': {}

  '@rolldown/pluginutils@1.0.1': {}

  '@rtsao/scc@1.1.0': {}

  '@shadcn/react@0.3.0(@types/react@19.2.14)(react@19.2.6)':
    optionalDependencies:
      '@types/react': 19.2.14
      react: 19.2.6

  '@shuding/opentype.js@1.4.0-beta.0':
    dependencies:
      fflate: 0.7.4
      string.prototype.codepointat: 0.2.1

  '@sindresorhus/is@7.2.0': {}

  '@speed-highlight/core@1.2.15': {}

  '@standard-schema/spec@1.1.0': {}

  '@standard-schema/utils@0.3.0': {}

  '@swc/helpers@0.5.23':
    dependencies:
      tslib: 2.8.1

  '@tailwindcss/node@4.2.1':
    dependencies:
      '@jridgewell/remapping': 2.3.5
      enhanced-resolve: 5.21.3
      jiti: 2.7.0
      lightningcss: 1.31.1
      magic-string: 0.30.21
      source-map-js: 1.2.1
      tailwindcss: 4.2.1

  '@tailwindcss/oxide-android-arm64@4.2.1':
    optional: true

  '@tailwindcss/oxide-darwin-arm64@4.2.1':
    optional: true

  '@tailwindcss/oxide-darwin-x64@4.2.1':
    optional: true

  '@tailwindcss/oxide-freebsd-x64@4.2.1':
    optional: true

  '@tailwindcss/oxide-linux-arm-gnueabihf@4.2.1':
    optional: true

  '@tailwindcss/oxide-linux-arm64-gnu@4.2.1':
    optional: true

  '@tailwindcss/oxide-linux-arm64-musl@4.2.1':
    optional: true

  '@tailwindcss/oxide-linux-x64-gnu@4.2.1':
    optional: true

  '@tailwindcss/oxide-linux-x64-musl@4.2.1':
    optional: true

  '@tailwindcss/oxide-wasm32-wasi@4.2.1':
    optional: true

  '@tailwindcss/oxide-win32-arm64-msvc@4.2.1':
    optional: true

  '@tailwindcss/oxide-win32-x64-msvc@4.2.1':
    optional: true

  '@tailwindcss/oxide@4.2.1':
    optionalDependencies:
      '@tailwindcss/oxide-android-arm64': 4.2.1
      '@tailwindcss/oxide-darwin-arm64': 4.2.1
      '@tailwindcss/oxide-darwin-x64': 4.2.1
      '@tailwindcss/oxide-freebsd-x64': 4.2.1
      '@tailwindcss/oxide-linux-arm-gnueabihf': 4.2.1
      '@tailwindcss/oxide-linux-arm64-gnu': 4.2.1
      '@tailwindcss/oxide-linux-arm64-musl': 4.2.1
      '@tailwindcss/oxide-linux-x64-gnu': 4.2.1
      '@tailwindcss/oxide-linux-x64-musl': 4.2.1
      '@tailwindcss/oxide-wasm32-wasi': 4.2.1
      '@tailwindcss/oxide-win32-arm64-msvc': 4.2.1
      '@tailwindcss/oxide-win32-x64-msvc': 4.2.1

  '@tailwindcss/postcss@4.2.1':
    dependencies:
      '@alloc/quick-lru': 5.2.0
      '@tailwindcss/node': 4.2.1
      '@tailwindcss/oxide': 4.2.1
      postcss: 8.5.23
      tailwindcss: 4.2.1

  '@tybys/wasm-util@0.10.2':
    dependencies:
      tslib: 2.8.1
    optional: true

  '@types/d3-array@3.2.2': {}

  '@types/d3-color@3.1.3': {}

  '@types/d3-ease@3.0.2': {}

  '@types/d3-interpolate@3.0.4':
    dependencies:
      '@types/d3-color': 3.1.3

  '@types/d3-path@3.1.1': {}

  '@types/d3-scale@4.0.9':
    dependencies:
      '@types/d3-time': 3.0.4

  '@types/d3-shape@3.1.8':
    dependencies:
      '@types/d3-path': 3.1.1

  '@types/d3-time@3.0.4': {}

  '@types/d3-timer@3.0.2': {}

  '@types/eslint-scope@3.7.7':
    dependencies:
      '@types/eslint': 9.6.1
      '@types/estree': 1.0.9

  '@types/eslint@9.6.1':
    dependencies:
      '@types/estree': 1.0.9
      '@types/json-schema': 7.0.15

  '@types/estree@1.0.9': {}

  '@types/geojson@7946.0.16': {}

  '@types/json-schema@7.0.15': {}

  '@types/json5@0.0.29': {}

  '@types/leaflet@1.9.22':
    dependencies:
      '@types/geojson': 7946.0.16

  '@types/node@22.19.19':
    dependencies:
      undici-types: 6.21.0

  '@types/react-dom@19.2.3(@types/react@19.2.14)':
    dependencies:
      '@types/react': 19.2.14

  '@types/react@19.2.14':
    dependencies:
      csstype: 3.2.3

  '@types/use-sync-external-store@0.0.6': {}

  '@typescript-eslint/eslint-plugin@8.59.3(@typescript-eslint/parser@8.59.3(eslint@9.39.4(jiti@2.7.0)(supports-color@10.2.2))(supports-color@10.2.2)(typescript@5.9.3))(eslint@9.39.4(jiti@2.7.0)(supports-color@10.2.2))(supports-color@10.2.2)(typescript@5.9.3)':
    dependencies:
      '@eslint-community/regexpp': 4.12.2
      '@typescript-eslint/parser': 8.59.3(eslint@9.39.4(jiti@2.7.0)(supports-color@10.2.2))(supports-color@10.2.2)(typescript@5.9.3)
      '@typescript-eslint/scope-manager': 8.59.3
      '@typescript-eslint/type-utils': 8.59.3(eslint@9.39.4(jiti@2.7.0)(supports-color@10.2.2))(supports-color@10.2.2)(typescript@5.9.3)
      '@typescript-eslint/utils': 8.59.3(eslint@9.39.4(jiti@2.7.0)(supports-color@10.2.2))(supports-color@10.2.2)(typescript@5.9.3)
      '@typescript-eslint/visitor-keys': 8.59.3
      eslint: 9.39.4(jiti@2.7.0)(supports-color@10.2.2)
      ignore: 7.0.5
      natural-compare: 1.4.0
      ts-api-utils: 2.5.0(typescript@5.9.3)
      typescript: 5.9.3
    transitivePeerDependencies:
      - supports-color

  '@typescript-eslint/parser@8.59.3(eslint@9.39.4(jiti@2.7.0)(supports-color@10.2.2))(supports-color@10.2.2)(typescript@5.9.3)':
    dependencies:
      '@typescript-eslint/scope-manager': 8.59.3
      '@typescript-eslint/types': 8.59.3
      '@typescript-eslint/typescript-estree': 8.59.3(supports-color@10.2.2)(typescript@5.9.3)
      '@typescript-eslint/visitor-keys': 8.59.3
      debug: 4.4.3(supports-color@10.2.2)
      eslint: 9.39.4(jiti@2.7.0)(supports-color@10.2.2)
      typescript: 5.9.3
    transitivePeerDependencies:
      - supports-color

  '@typescript-eslint/project-service@8.59.3(supports-color@10.2.2)(typescript@5.9.3)':
    dependencies:
      '@typescript-eslint/tsconfig-utils': 8.59.3(typescript@5.9.3)
      '@typescript-eslint/types': 8.59.3
      debug: 4.4.3(supports-color@10.2.2)
      typescript: 5.9.3
    transitivePeerDependencies:
      - supports-color

  '@typescript-eslint/scope-manager@8.59.3':
    dependencies:
      '@typescript-eslint/types': 8.59.3
      '@typescript-eslint/visitor-keys': 8.59.3

  '@typescript-eslint/tsconfig-utils@8.59.3(typescript@5.9.3)':
    dependencies:
      typescript: 5.9.3

  '@typescript-eslint/type-utils@8.59.3(eslint@9.39.4(jiti@2.7.0)(supports-color@10.2.2))(supports-color@10.2.2)(typescript@5.9.3)':
    dependencies:
      '@typescript-eslint/types': 8.59.3
      '@typescript-eslint/typescript-estree': 8.59.3(supports-color@10.2.2)(typescript@5.9.3)
      '@typescript-eslint/utils': 8.59.3(eslint@9.39.4(jiti@2.7.0)(supports-color@10.2.2))(supports-color@10.2.2)(typescript@5.9.3)
      debug: 4.4.3(supports-color@10.2.2)
      eslint: 9.39.4(jiti@2.7.0)(supports-color@10.2.2)
      ts-api-utils: 2.5.0(typescript@5.9.3)
      typescript: 5.9.3
    transitivePeerDependencies:
      - supports-color

  '@typescript-eslint/types@8.59.3': {}

  '@typescript-eslint/typescript-estree@8.59.3(supports-color@10.2.2)(typescript@5.9.3)':
    dependencies:
      '@typescript-eslint/project-service': 8.59.3(supports-color@10.2.2)(typescript@5.9.3)
      '@typescript-eslint/tsconfig-utils': 8.59.3(typescript@5.9.3)
      '@typescript-eslint/types': 8.59.3
      '@typescript-eslint/visitor-keys': 8.59.3
      debug: 4.4.3(supports-color@10.2.2)
      minimatch: 10.2.5
      semver: 7.8.5
      tinyglobby: 0.2.16
      ts-api-utils: 2.5.0(typescript@5.9.3)
      typescript: 5.9.3
    transitivePeerDependencies:
      - supports-color

  '@typescript-eslint/utils@8.59.3(eslint@9.39.4(jiti@2.7.0)(supports-color@10.2.2))(supports-color@10.2.2)(typescript@5.9.3)':
    dependencies:
      '@eslint-community/eslint-utils': 4.9.1(eslint@9.39.4(jiti@2.7.0)(supports-color@10.2.2))
      '@typescript-eslint/scope-manager': 8.59.3
      '@typescript-eslint/types': 8.59.3
      '@typescript-eslint/typescript-estree': 8.59.3(supports-color@10.2.2)(typescript@5.9.3)
      eslint: 9.39.4(jiti@2.7.0)(supports-color@10.2.2)
      typescript: 5.9.3
    transitivePeerDependencies:
      - supports-color

  '@typescript-eslint/visitor-keys@8.59.3':
    dependencies:
      '@typescript-eslint/types': 8.59.3
      eslint-visitor-keys: 5.0.1

  '@unpic/core@1.0.3':
    dependencies:
      unpic: 4.2.2

  '@unpic/react@1.0.2(next@16.3.4(@babel/core@7.29.0(supports-color@10.2.2))(@types/node@22.19.19)(react-dom@19.2.6(react@19.2.6))(react@19.2.6))(react-dom@19.2.6(react@19.2.6))(react@19.2.6)':
    dependencies:
      '@unpic/core': 1.0.3
      react: 19.2.6
      react-dom: 19.2.6(react@19.2.6)
    optionalDependencies:
      next: 16.3.4(@babel/core@7.29.0(supports-color@10.2.2))(@types/node@22.19.19)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)

  '@unrs/resolver-binding-android-arm-eabi@1.11.1':
    optional: true

  '@unrs/resolver-binding-android-arm64@1.11.1':
    optional: true

  '@unrs/resolver-binding-darwin-arm64@1.11.1':
    optional: true

  '@unrs/resolver-binding-darwin-x64@1.11.1':
    optional: true

  '@unrs/resolver-binding-freebsd-x64@1.11.1':
    optional: true

  '@unrs/resolver-binding-linux-arm-gnueabihf@1.11.1':
    optional: true

  '@unrs/resolver-binding-linux-arm-musleabihf@1.11.1':
    optional: true

  '@unrs/resolver-binding-linux-arm64-gnu@1.11.1':
    optional: true

  '@unrs/resolver-binding-linux-arm64-musl@1.11.1':
    optional: true

  '@unrs/resolver-binding-linux-ppc64-gnu@1.11.1':
    optional: true

  '@unrs/resolver-binding-linux-riscv64-gnu@1.11.1':
    optional: true

  '@unrs/resolver-binding-linux-riscv64-musl@1.11.1':
    optional: true

  '@unrs/resolver-binding-linux-s390x-gnu@1.11.1':
    optional: true

  '@unrs/resolver-binding-linux-x64-gnu@1.11.1':
    optional: true

  '@unrs/resolver-binding-linux-x64-musl@1.11.1':
    optional: true

  '@unrs/resolver-binding-wasm32-wasi@1.11.1':
    dependencies:
      '@napi-rs/wasm-runtime': 0.2.12
    optional: true

  '@unrs/resolver-binding-win32-arm64-msvc@1.11.1':
    optional: true

  '@unrs/resolver-binding-win32-ia32-msvc@1.11.1':
    optional: true

  '@unrs/resolver-binding-win32-x64-msvc@1.11.1':
    optional: true

  '@vercel/og@0.8.6':
    dependencies:
      '@resvg/resvg-wasm': 2.4.0
      satori: 0.16.0

  '@vinext/types@1.0.0-beta.2': {}

  '@vitejs/plugin-react@6.0.2(vite@8.0.13(@types/node@22.19.19)(esbuild@0.28.0)(jiti@2.7.0)(terser@5.47.1)(tsx@4.22.1))':
    dependencies:
      '@rolldown/pluginutils': 1.0.1
      vite: 8.0.13(@types/node@22.19.19)(esbuild@0.28.0)(jiti@2.7.0)(terser@5.47.1)(tsx@4.22.1)

  '@vitejs/plugin-rsc@0.5.26(react-dom@19.2.6(react@19.2.6))(react-server-dom-webpack@19.2.6(react-dom@19.2.6(react@19.2.6))(react@19.2.6)(webpack@5.106.2(esbuild@0.28.0)(lightningcss@1.32.0)(postcss@8.5.23)))(react@19.2.6)(vite@8.0.13(@types/node@22.19.19)(esbuild@0.28.0)(jiti@2.7.0)(terser@5.47.1)(tsx@4.22.1))':
    dependencies:
      '@rolldown/pluginutils': 1.0.0-rc.18
      es-module-lexer: 2.1.0
      estree-walker: 3.0.3
      magic-string: 0.30.21
      react: 19.2.6
      react-dom: 19.2.6(react@19.2.6)
      srvx: 0.11.15
      strip-literal: 3.1.0
      turbo-stream: 3.2.0
      vite: 8.0.13(@types/node@22.19.19)(esbuild@0.28.0)(jiti@2.7.0)(terser@5.47.1)(tsx@4.22.1)
      vitefu: 1.1.3(vite@8.0.13(@types/node@22.19.19)(esbuild@0.28.0)(jiti@2.7.0)(terser@5.47.1)(tsx@4.22.1))
    optionalDependencies:
      react-server-dom-webpack: 19.2.6(react-dom@19.2.6(react@19.2.6))(react@19.2.6)(webpack@5.106.2(esbuild@0.28.0)(lightningcss@1.32.0)(postcss@8.5.23))

  '@webassemblyjs/ast@1.14.1':
    dependencies:
      '@webassemblyjs/helper-numbers': 1.13.2
      '@webassemblyjs/helper-wasm-bytecode': 1.13.2

  '@webassemblyjs/floating-point-hex-parser@1.13.2': {}

  '@webassemblyjs/helper-api-error@1.13.2': {}

  '@webassemblyjs/helper-buffer@1.14.1': {}

  '@webassemblyjs/helper-numbers@1.13.2':
    dependencies:
      '@webassemblyjs/floating-point-hex-parser': 1.13.2
      '@webassemblyjs/helper-api-error': 1.13.2
      '@xtuc/long': 4.2.2

  '@webassemblyjs/helper-wasm-bytecode@1.13.2': {}

  '@webassemblyjs/helper-wasm-section@1.14.1':
    dependencies:
      '@webassemblyjs/ast': 1.14.1
      '@webassemblyjs/helper-buffer': 1.14.1
      '@webassemblyjs/helper-wasm-bytecode': 1.13.2
      '@webassemblyjs/wasm-gen': 1.14.1

  '@webassemblyjs/ieee754@1.13.2':
    dependencies:
      '@xtuc/ieee754': 1.2.0

  '@webassemblyjs/leb128@1.13.2':
    dependencies:
      '@xtuc/long': 4.2.2

  '@webassemblyjs/utf8@1.13.2': {}

  '@webassemblyjs/wasm-edit@1.14.1':
    dependencies:
      '@webassemblyjs/ast': 1.14.1
      '@webassemblyjs/helper-buffer': 1.14.1
      '@webassemblyjs/helper-wasm-bytecode': 1.13.2
      '@webassemblyjs/helper-wasm-section': 1.14.1
      '@webassemblyjs/wasm-gen': 1.14.1
      '@webassemblyjs/wasm-opt': 1.14.1
      '@webassemblyjs/wasm-parser': 1.14.1
      '@webassemblyjs/wast-printer': 1.14.1

  '@webassemblyjs/wasm-gen@1.14.1':
    dependencies:
      '@webassemblyjs/ast': 1.14.1
      '@webassemblyjs/helper-wasm-bytecode': 1.13.2
      '@webassemblyjs/ieee754': 1.13.2
      '@webassemblyjs/leb128': 1.13.2
      '@webassemblyjs/utf8': 1.13.2

  '@webassemblyjs/wasm-opt@1.14.1':
    dependencies:
      '@webassemblyjs/ast': 1.14.1
      '@webassemblyjs/helper-buffer': 1.14.1
      '@webassemblyjs/wasm-gen': 1.14.1
      '@webassemblyjs/wasm-parser': 1.14.1

  '@webassemblyjs/wasm-parser@1.14.1':
    dependencies:
      '@webassemblyjs/ast': 1.14.1
      '@webassemblyjs/helper-api-error': 1.13.2
      '@webassemblyjs/helper-wasm-bytecode': 1.13.2
      '@webassemblyjs/ieee754': 1.13.2
      '@webassemblyjs/leb128': 1.13.2
      '@webassemblyjs/utf8': 1.13.2

  '@webassemblyjs/wast-printer@1.14.1':
    dependencies:
      '@webassemblyjs/ast': 1.14.1
      '@xtuc/long': 4.2.2

  '@xtuc/ieee754@1.2.0': {}

  '@xtuc/long@4.2.2': {}

  acorn-import-phases@1.0.4(acorn@8.16.0):
    dependencies:
      acorn: 8.16.0

  acorn-jsx@5.3.2(acorn@8.16.0):
    dependencies:
      acorn: 8.16.0

  acorn-loose@8.5.2:
    dependencies:
      acorn: 8.16.0

  acorn@8.16.0: {}

  ajv-formats@2.1.1(ajv@8.20.0):
    optionalDependencies:
      ajv: 8.20.0

  ajv-keywords@5.1.0(ajv@8.20.0):
    dependencies:
      ajv: 8.20.0
      fast-deep-equal: 3.1.3

  ajv@6.15.0:
    dependencies:
      fast-deep-equal: 3.1.3
      fast-json-stable-stringify: 2.1.0
      json-schema-traverse: 0.4.1
      uri-js: 4.4.1

  ajv@8.20.0:
    dependencies:
      fast-deep-equal: 3.1.3
      fast-uri: 3.1.7
      json-schema-traverse: 1.0.0
      require-from-string: 2.0.2

  ansi-styles@4.3.0:
    dependencies:
      color-convert: 2.0.1

  argparse@2.0.1: {}

  aria-hidden@1.2.6:
    dependencies:
      tslib: 2.8.1

  aria-query@5.3.2: {}

  array-buffer-byte-length@1.0.2:
    dependencies:
      call-bound: 1.0.4
      is-array-buffer: 3.0.5

  array-includes@3.1.9:
    dependencies:
      call-bind: 1.0.9
      call-bound: 1.0.4
      define-properties: 1.2.1
      es-abstract: 1.24.2
      es-object-atoms: 1.1.1
      get-intrinsic: 1.3.0
      is-string: 1.1.1
      math-intrinsics: 1.1.0

  array.prototype.findlast@1.2.5:
    dependencies:
      call-bind: 1.0.9
      define-properties: 1.2.1
      es-abstract: 1.24.2
      es-errors: 1.3.0
      es-object-atoms: 1.1.1
      es-shim-unscopables: 1.1.0

  array.prototype.findlastindex@1.2.6:
    dependencies:
      call-bind: 1.0.9
      call-bound: 1.0.4
      define-properties: 1.2.1
      es-abstract: 1.24.2
      es-errors: 1.3.0
      es-object-atoms: 1.1.1
      es-shim-unscopables: 1.1.0

  array.prototype.flat@1.3.3:
    dependencies:
      call-bind: 1.0.9
      define-properties: 1.2.1
      es-abstract: 1.24.2
      es-shim-unscopables: 1.1.0

  array.prototype.flatmap@1.3.3:
    dependencies:
      call-bind: 1.0.9
      define-properties: 1.2.1
      es-abstract: 1.24.2
      es-shim-unscopables: 1.1.0

  array.prototype.tosorted@1.1.4:
    dependencies:
      call-bind: 1.0.9
      define-properties: 1.2.1
      es-abstract: 1.24.2
      es-errors: 1.3.0
      es-shim-unscopables: 1.1.0

  arraybuffer.prototype.slice@1.0.4:
    dependencies:
      array-buffer-byte-length: 1.0.2
      call-bind: 1.0.9
      define-properties: 1.2.1
      es-abstract: 1.24.2
      es-errors: 1.3.0
      get-intrinsic: 1.3.0
      is-array-buffer: 3.0.5

  ast-types-flow@0.0.8: {}

  async-function@1.0.0: {}

  available-typed-arrays@1.0.7:
    dependencies:
      possible-typed-array-names: 1.1.0

  axe-core@4.11.4: {}

  axobject-query@4.1.0: {}

  balanced-match@1.0.2: {}

  balanced-match@4.0.4: {}

  base64-js@0.0.8: {}

  baseline-browser-mapping@2.10.30: {}

  blake3-wasm@2.1.5: {}

  brace-expansion@1.1.14:
    dependencies:
      balanced-match: 1.0.2
      concat-map: 0.0.1

  brace-expansion@5.0.6:
    dependencies:
      balanced-match: 4.0.4

  braces@3.0.3:
    dependencies:
      fill-range: 7.1.1

  browserslist@4.28.2:
    dependencies:
      baseline-browser-mapping: 2.10.30
      caniuse-lite: 1.0.30001793
      electron-to-chromium: 1.5.358
      node-releases: 2.0.44
      update-browserslist-db: 1.2.3(browserslist@4.28.2)

  buffer-from@1.1.2: {}

  call-bind-apply-helpers@1.0.2:
    dependencies:
      es-errors: 1.3.0
      function-bind: 1.1.2

  call-bind@1.0.9:
    dependencies:
      call-bind-apply-helpers: 1.0.2
      es-define-property: 1.0.1
      get-intrinsic: 1.3.0
      set-function-length: 1.2.2

  call-bound@1.0.4:
    dependencies:
      call-bind-apply-helpers: 1.0.2
      get-intrinsic: 1.3.0

  callsites@3.1.0: {}

  camelize@1.0.1: {}

  caniuse-lite@1.0.30001793: {}

  chalk@4.1.2:
    dependencies:
      ansi-styles: 4.3.0
      supports-color: 7.2.0

  chrome-trace-event@1.0.4: {}

  class-variance-authority@0.7.1:
    dependencies:
      clsx: 2.1.1

  client-only@0.0.1: {}

  clsx@2.1.1: {}

  cmdk@1.1.1(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6):
    dependencies:
      '@radix-ui/react-compose-refs': 1.1.5(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-dialog': 1.1.23(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-id': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      react: 19.2.6
      react-dom: 19.2.6(react@19.2.6)
    transitivePeerDependencies:
      - '@types/react'
      - '@types/react-dom'

  color-convert@2.0.1:
    dependencies:
      color-name: 1.1.4

  color-name@1.1.4: {}

  commander@2.20.3: {}

  concat-map@0.0.1: {}

  convert-source-map@2.0.0: {}

  cookie@1.1.1: {}

  cross-spawn@7.0.6:
    dependencies:
      path-key: 3.1.1
      shebang-command: 2.0.0
      which: 2.0.2

  css-background-parser@0.1.0: {}

  css-box-shadow@1.0.0-3: {}

  css-color-keywords@1.0.0: {}

  css-gradient-parser@0.0.16: {}

  css-to-react-native@3.2.0:
    dependencies:
      camelize: 1.0.1
      css-color-keywords: 1.0.0
      postcss-value-parser: 4.2.0

  csstype@3.2.3: {}

  d3-array@3.2.4:
    dependencies:
      internmap: 2.0.3

  d3-color@3.1.0: {}

  d3-ease@3.0.1: {}

  d3-format@3.1.2: {}

  d3-interpolate@3.0.1:
    dependencies:
      d3-color: 3.1.0

  d3-path@3.1.0: {}

  d3-scale@4.0.2:
    dependencies:
      d3-array: 3.2.4
      d3-format: 3.1.2
      d3-interpolate: 3.0.1
      d3-time: 3.1.0
      d3-time-format: 4.1.0

  d3-shape@3.2.0:
    dependencies:
      d3-path: 3.1.0

  d3-time-format@4.1.0:
    dependencies:
      d3-time: 3.1.0

  d3-time@3.1.0:
    dependencies:
      d3-array: 3.2.4

  d3-timer@3.0.1: {}

  damerau-levenshtein@1.0.8: {}

  data-view-buffer@1.0.2:
    dependencies:
      call-bound: 1.0.4
      es-errors: 1.3.0
      is-data-view: 1.0.2

  data-view-byte-length@1.0.2:
    dependencies:
      call-bound: 1.0.4
      es-errors: 1.3.0
      is-data-view: 1.0.2

  data-view-byte-offset@1.0.1:
    dependencies:
      call-bound: 1.0.4
      es-errors: 1.3.0
      is-data-view: 1.0.2

  date-fns@4.4.0: {}

  debug@3.2.7(supports-color@10.2.2):
    dependencies:
      ms: 2.1.3
    optionalDependencies:
      supports-color: 10.2.2

  debug@4.4.3(supports-color@10.2.2):
    dependencies:
      ms: 2.1.3
    optionalDependencies:
      supports-color: 10.2.2

  decimal.js-light@2.5.1: {}

  deep-is@0.1.4: {}

  define-data-property@1.1.4:
    dependencies:
      es-define-property: 1.0.1
      es-errors: 1.3.0
      gopd: 1.2.0

  define-properties@1.2.1:
    dependencies:
      define-data-property: 1.1.4
      has-property-descriptors: 1.0.2
      object-keys: 1.1.1

  detect-libc@2.1.2: {}

  detect-node-es@1.1.0: {}

  doctrine@2.1.0:
    dependencies:
      esutils: 2.0.3

  drizzle-kit@0.31.10:
    dependencies:
      '@drizzle-team/brocli': 0.10.2
      '@esbuild-kit/esm-loader': 2.6.5
      esbuild: 0.25.12
      tsx: 4.22.1

  drizzle-orm@0.45.2(@cloudflare/workers-types@4.20260515.1):
    optionalDependencies:
      '@cloudflare/workers-types': 4.20260515.1

  dunder-proto@1.0.1:
    dependencies:
      call-bind-apply-helpers: 1.0.2
      es-errors: 1.3.0
      gopd: 1.2.0

  electron-to-chromium@1.5.358: {}

  embla-carousel-react@8.6.0(react@19.2.6):
    dependencies:
      embla-carousel: 8.6.0
      embla-carousel-reactive-utils: 8.6.0(embla-carousel@8.6.0)
      react: 19.2.6

  embla-carousel-reactive-utils@8.6.0(embla-carousel@8.6.0):
    dependencies:
      embla-carousel: 8.6.0

  embla-carousel@8.6.0: {}

  emoji-regex-xs@2.0.1: {}

  emoji-regex@9.2.2: {}

  enhanced-resolve@5.21.3:
    dependencies:
      graceful-fs: 4.2.11
      tapable: 2.3.3

  error-stack-parser-es@1.0.5: {}

  es-abstract@1.24.2:
    dependencies:
      array-buffer-byte-length: 1.0.2
      arraybuffer.prototype.slice: 1.0.4
      available-typed-arrays: 1.0.7
      call-bind: 1.0.9
      call-bound: 1.0.4
      data-view-buffer: 1.0.2
      data-view-byte-length: 1.0.2
      data-view-byte-offset: 1.0.1
      es-define-property: 1.0.1
      es-errors: 1.3.0
      es-object-atoms: 1.1.1
      es-set-tostringtag: 2.1.0
      es-to-primitive: 1.3.0
      function.prototype.name: 1.1.8
      get-intrinsic: 1.3.0
      get-proto: 1.0.1
      get-symbol-description: 1.1.0
      globalthis: 1.0.4
      gopd: 1.2.0
      has-property-descriptors: 1.0.2
      has-proto: 1.2.0
      has-symbols: 1.1.0
      hasown: 2.0.3
      internal-slot: 1.1.0
      is-array-buffer: 3.0.5
      is-callable: 1.2.7
      is-data-view: 1.0.2
      is-negative-zero: 2.0.3
      is-regex: 1.2.1
      is-set: 2.0.3
      is-shared-array-buffer: 1.0.4
      is-string: 1.1.1
      is-typed-array: 1.1.15
      is-weakref: 1.1.1
      math-intrinsics: 1.1.0
      object-inspect: 1.13.4
      object-keys: 1.1.1
      object.assign: 4.1.7
      own-keys: 1.0.1
      regexp.prototype.flags: 1.5.4
      safe-array-concat: 1.1.4
      safe-push-apply: 1.0.0
      safe-regex-test: 1.1.0
      set-proto: 1.0.0
      stop-iteration-iterator: 1.1.0
      string.prototype.trim: 1.2.10
      string.prototype.trimend: 1.0.9
      string.prototype.trimstart: 1.0.8
      typed-array-buffer: 1.0.3
      typed-array-byte-length: 1.0.3
      typed-array-byte-offset: 1.0.4
      typed-array-length: 1.0.7
      unbox-primitive: 1.1.0
      which-typed-array: 1.1.20

  es-define-property@1.0.1: {}

  es-errors@1.3.0: {}

  es-iterator-helpers@1.3.2:
    dependencies:
      call-bind: 1.0.9
      call-bound: 1.0.4
      define-properties: 1.2.1
      es-abstract: 1.24.2
      es-errors: 1.3.0
      es-set-tostringtag: 2.1.0
      function-bind: 1.1.2
      get-intrinsic: 1.3.0
      globalthis: 1.0.4
      gopd: 1.2.0
      has-property-descriptors: 1.0.2
      has-proto: 1.2.0
      has-symbols: 1.1.0
      internal-slot: 1.1.0
      iterator.prototype: 1.1.5
      math-intrinsics: 1.1.0

  es-module-lexer@1.7.0: {}

  es-module-lexer@2.1.0: {}

  es-object-atoms@1.1.1:
    dependencies:
      es-errors: 1.3.0

  es-set-tostringtag@2.1.0:
    dependencies:
      es-errors: 1.3.0
      get-intrinsic: 1.3.0
      has-tostringtag: 1.0.2
      hasown: 2.0.3

  es-shim-unscopables@1.1.0:
    dependencies:
      hasown: 2.0.3

  es-to-primitive@1.3.0:
    dependencies:
      is-callable: 1.2.7
      is-date-object: 1.1.0
      is-symbol: 1.1.1

  es-toolkit@1.50.0: {}

  esbuild@0.18.20:
    optionalDependencies:
      '@esbuild/android-arm': 0.18.20
      '@esbuild/android-arm64': 0.18.20
      '@esbuild/android-x64': 0.18.20
      '@esbuild/darwin-arm64': 0.18.20
      '@esbuild/darwin-x64': 0.18.20
      '@esbuild/freebsd-arm64': 0.18.20
      '@esbuild/freebsd-x64': 0.18.20
      '@esbuild/linux-arm': 0.18.20
      '@esbuild/linux-arm64': 0.18.20
      '@esbuild/linux-ia32': 0.18.20
      '@esbuild/linux-loong64': 0.18.20
      '@esbuild/linux-mips64el': 0.18.20
      '@esbuild/linux-ppc64': 0.18.20
      '@esbuild/linux-riscv64': 0.18.20
      '@esbuild/linux-s390x': 0.18.20
      '@esbuild/linux-x64': 0.18.20
      '@esbuild/netbsd-x64': 0.18.20
      '@esbuild/openbsd-x64': 0.18.20
      '@esbuild/sunos-x64': 0.18.20
      '@esbuild/win32-arm64': 0.18.20
      '@esbuild/win32-ia32': 0.18.20
      '@esbuild/win32-x64': 0.18.20

  esbuild@0.25.12:
    optionalDependencies:
      '@esbuild/aix-ppc64': 0.25.12
      '@esbuild/android-arm': 0.25.12
      '@esbuild/android-arm64': 0.25.12
      '@esbuild/android-x64': 0.25.12
      '@esbuild/darwin-arm64': 0.25.12
      '@esbuild/darwin-x64': 0.25.12
      '@esbuild/freebsd-arm64': 0.25.12
      '@esbuild/freebsd-x64': 0.25.12
      '@esbuild/linux-arm': 0.25.12
      '@esbuild/linux-arm64': 0.25.12
      '@esbuild/linux-ia32': 0.25.12
      '@esbuild/linux-loong64': 0.25.12
      '@esbuild/linux-mips64el': 0.25.12
      '@esbuild/linux-ppc64': 0.25.12
      '@esbuild/linux-riscv64': 0.25.12
      '@esbuild/linux-s390x': 0.25.12
      '@esbuild/linux-x64': 0.25.12
      '@esbuild/netbsd-arm64': 0.25.12
      '@esbuild/netbsd-x64': 0.25.12
      '@esbuild/openbsd-arm64': 0.25.12
      '@esbuild/openbsd-x64': 0.25.12
      '@esbuild/openharmony-arm64': 0.25.12
      '@esbuild/sunos-x64': 0.25.12
      '@esbuild/win32-arm64': 0.25.12
      '@esbuild/win32-ia32': 0.25.12
      '@esbuild/win32-x64': 0.25.12

  esbuild@0.27.3:
    optionalDependencies:
      '@esbuild/aix-ppc64': 0.27.3
      '@esbuild/android-arm': 0.27.3
      '@esbuild/android-arm64': 0.27.3
      '@esbuild/android-x64': 0.27.3
      '@esbuild/darwin-arm64': 0.27.3
      '@esbuild/darwin-x64': 0.27.3
      '@esbuild/freebsd-arm64': 0.27.3
      '@esbuild/freebsd-x64': 0.27.3
      '@esbuild/linux-arm': 0.27.3
      '@esbuild/linux-arm64': 0.27.3
      '@esbuild/linux-ia32': 0.27.3
      '@esbuild/linux-loong64': 0.27.3
      '@esbuild/linux-mips64el': 0.27.3
      '@esbuild/linux-ppc64': 0.27.3
      '@esbuild/linux-riscv64': 0.27.3
      '@esbuild/linux-s390x': 0.27.3
      '@esbuild/linux-x64': 0.27.3
      '@esbuild/netbsd-arm64': 0.27.3
      '@esbuild/netbsd-x64': 0.27.3
      '@esbuild/openbsd-arm64': 0.27.3
      '@esbuild/openbsd-x64': 0.27.3
      '@esbuild/openharmony-arm64': 0.27.3
      '@esbuild/sunos-x64': 0.27.3
      '@esbuild/win32-arm64': 0.27.3
      '@esbuild/win32-ia32': 0.27.3
      '@esbuild/win32-x64': 0.27.3

  esbuild@0.28.0:
    optionalDependencies:
      '@esbuild/aix-ppc64': 0.28.0
      '@esbuild/android-arm': 0.28.0
      '@esbuild/android-arm64': 0.28.0
      '@esbuild/android-x64': 0.28.0
      '@esbuild/darwin-arm64': 0.28.0
      '@esbuild/darwin-x64': 0.28.0
      '@esbuild/freebsd-arm64': 0.28.0
      '@esbuild/freebsd-x64': 0.28.0
      '@esbuild/linux-arm': 0.28.0
      '@esbuild/linux-arm64': 0.28.0
      '@esbuild/linux-ia32': 0.28.0
      '@esbuild/linux-loong64': 0.28.0
      '@esbuild/linux-mips64el': 0.28.0
      '@esbuild/linux-ppc64': 0.28.0
      '@esbuild/linux-riscv64': 0.28.0
      '@esbuild/linux-s390x': 0.28.0
      '@esbuild/linux-x64': 0.28.0
      '@esbuild/netbsd-arm64': 0.28.0
      '@esbuild/netbsd-x64': 0.28.0
      '@esbuild/openbsd-arm64': 0.28.0
      '@esbuild/openbsd-x64': 0.28.0
      '@esbuild/openharmony-arm64': 0.28.0
      '@esbuild/sunos-x64': 0.28.0
      '@esbuild/win32-arm64': 0.28.0
      '@esbuild/win32-ia32': 0.28.0
      '@esbuild/win32-x64': 0.28.0

  escalade@3.2.0: {}

  escape-html@1.0.3: {}

  escape-string-regexp@4.0.0: {}

  eslint-config-next@16.3.4(@typescript-eslint/parser@8.59.3(eslint@9.39.4(jiti@2.7.0)(supports-color@10.2.2))(supports-color@10.2.2)(typescript@5.9.3))(eslint@9.39.4(jiti@2.7.0)(supports-color@10.2.2))(supports-color@10.2.2)(typescript@5.9.3):
    dependencies:
      '@next/eslint-plugin-next': 16.3.4(eslint@9.39.4(jiti@2.7.0)(supports-color@10.2.2))
      eslint: 9.39.4(jiti@2.7.0)(supports-color@10.2.2)
      eslint-import-resolver-node: 0.3.10(supports-color@10.2.2)
      eslint-import-resolver-typescript: 3.10.1(eslint-plugin-import@2.32.0)(eslint@9.39.4(jiti@2.7.0)(supports-color@10.2.2))(supports-color@10.2.2)
      eslint-plugin-import: 2.32.0(@typescript-eslint/parser@8.59.3(eslint@9.39.4(jiti@2.7.0)(supports-color@10.2.2))(supports-color@10.2.2)(typescript@5.9.3))(eslint-import-resolver-typescript@3.10.1)(eslint@9.39.4(jiti@2.7.0)(supports-color@10.2.2))(supports-color@10.2.2)
      eslint-plugin-jsx-a11y: 6.10.2(eslint@9.39.4(jiti@2.7.0)(supports-color@10.2.2))
      eslint-plugin-react: 7.37.5(eslint@9.39.4(jiti@2.7.0)(supports-color@10.2.2))
      eslint-plugin-react-hooks: 7.1.1(eslint@9.39.4(jiti@2.7.0)(supports-color@10.2.2))(supports-color@10.2.2)
      globals: 16.4.0
      typescript-eslint: 8.59.3(eslint@9.39.4(jiti@2.7.0)(supports-color@10.2.2))(supports-color@10.2.2)(typescript@5.9.3)
    optionalDependencies:
      typescript: 5.9.3
    transitivePeerDependencies:
      - '@typescript-eslint/parser'
      - eslint-import-resolver-webpack
      - eslint-plugin-import-x
      - supports-color

  eslint-import-resolver-node@0.3.10(supports-color@10.2.2):
    dependencies:
      debug: 3.2.7(supports-color@10.2.2)
      is-core-module: 2.16.2
      resolve: 2.0.0-next.7
    transitivePeerDependencies:
      - supports-color

  eslint-import-resolver-typescript@3.10.1(eslint-plugin-import@2.32.0)(eslint@9.39.4(jiti@2.7.0)(supports-color@10.2.2))(supports-color@10.2.2):
    dependencies:
      '@nolyfill/is-core-module': 1.0.39
      debug: 4.4.3(supports-color@10.2.2)
      eslint: 9.39.4(jiti@2.7.0)(supports-color@10.2.2)
      get-tsconfig: 4.14.0
      is-bun-module: 2.0.0
      stable-hash: 0.0.5
      tinyglobby: 0.2.16
      unrs-resolver: 1.11.1
    optionalDependencies:
      eslint-plugin-import: 2.32.0(@typescript-eslint/parser@8.59.3(eslint@9.39.4(jiti@2.7.0)(supports-color@10.2.2))(supports-color@10.2.2)(typescript@5.9.3))(eslint-import-resolver-typescript@3.10.1)(eslint@9.39.4(jiti@2.7.0)(supports-color@10.2.2))(supports-color@10.2.2)
    transitivePeerDependencies:
      - supports-color

  eslint-module-utils@2.12.1(@typescript-eslint/parser@8.59.3(eslint@9.39.4(jiti@2.7.0)(supports-color@10.2.2))(supports-color@10.2.2)(typescript@5.9.3))(eslint-import-resolver-node@0.3.10(supports-color@10.2.2))(eslint-import-resolver-typescript@3.10.1)(eslint@9.39.4(jiti@2.7.0)(supports-color@10.2.2))(supports-color@10.2.2):
    dependencies:
      debug: 3.2.7(supports-color@10.2.2)
    optionalDependencies:
      '@typescript-eslint/parser': 8.59.3(eslint@9.39.4(jiti@2.7.0)(supports-color@10.2.2))(supports-color@10.2.2)(typescript@5.9.3)
      eslint: 9.39.4(jiti@2.7.0)(supports-color@10.2.2)
      eslint-import-resolver-node: 0.3.10(supports-color@10.2.2)
      eslint-import-resolver-typescript: 3.10.1(eslint-plugin-import@2.32.0)(eslint@9.39.4(jiti@2.7.0)(supports-color@10.2.2))(supports-color@10.2.2)
    transitivePeerDependencies:
      - supports-color

  eslint-plugin-import@2.32.0(@typescript-eslint/parser@8.59.3(eslint@9.39.4(jiti@2.7.0)(supports-color@10.2.2))(supports-color@10.2.2)(typescript@5.9.3))(eslint-import-resolver-typescript@3.10.1)(eslint@9.39.4(jiti@2.7.0)(supports-color@10.2.2))(supports-color@10.2.2):
    dependencies:
      '@rtsao/scc': 1.1.0
      array-includes: 3.1.9
      array.prototype.findlastindex: 1.2.6
      array.prototype.flat: 1.3.3
      array.prototype.flatmap: 1.3.3
      debug: 3.2.7(supports-color@10.2.2)
      doctrine: 2.1.0
      eslint: 9.39.4(jiti@2.7.0)(supports-color@10.2.2)
      eslint-import-resolver-node: 0.3.10(supports-color@10.2.2)
      eslint-module-utils: 2.12.1(@typescript-eslint/parser@8.59.3(eslint@9.39.4(jiti@2.7.0)(supports-color@10.2.2))(supports-color@10.2.2)(typescript@5.9.3))(eslint-import-resolver-node@0.3.10(supports-color@10.2.2))(eslint-import-resolver-typescript@3.10.1)(eslint@9.39.4(jiti@2.7.0)(supports-color@10.2.2))(supports-color@10.2.2)
      hasown: 2.0.3
      is-core-module: 2.16.2
      is-glob: 4.0.3
      minimatch: 3.1.5
      object.fromentries: 2.0.8
      object.groupby: 1.0.3
      object.values: 1.2.1
      semver: 6.3.1
      string.prototype.trimend: 1.0.9
      tsconfig-paths: 3.15.0
    optionalDependencies:
      '@typescript-eslint/parser': 8.59.3(eslint@9.39.4(jiti@2.7.0)(supports-color@10.2.2))(supports-color@10.2.2)(typescript@5.9.3)
    transitivePeerDependencies:
      - eslint-import-resolver-typescript
      - eslint-import-resolver-webpack
      - supports-color

  eslint-plugin-jsx-a11y@6.10.2(eslint@9.39.4(jiti@2.7.0)(supports-color@10.2.2)):
    dependencies:
      aria-query: 5.3.2
      array-includes: 3.1.9
      array.prototype.flatmap: 1.3.3
      ast-types-flow: 0.0.8
      axe-core: 4.11.4
      axobject-query: 4.1.0
      damerau-levenshtein: 1.0.8
      emoji-regex: 9.2.2
      eslint: 9.39.4(jiti@2.7.0)(supports-color@10.2.2)
      hasown: 2.0.3
      jsx-ast-utils: 3.3.5
      language-tags: 1.0.9
      minimatch: 3.1.5
      object.fromentries: 2.0.8
      safe-regex-test: 1.1.0
      string.prototype.includes: 2.0.1

  eslint-plugin-react-hooks@7.1.1(eslint@9.39.4(jiti@2.7.0)(supports-color@10.2.2))(supports-color@10.2.2):
    dependencies:
      '@babel/core': 7.29.0(supports-color@10.2.2)
      '@babel/parser': 7.29.3
      eslint: 9.39.4(jiti@2.7.0)(supports-color@10.2.2)
      hermes-parser: 0.25.1
      zod: 3.25.76
      zod-validation-error: 4.0.2(zod@3.25.76)
    transitivePeerDependencies:
      - supports-color

  eslint-plugin-react@7.37.5(eslint@9.39.4(jiti@2.7.0)(supports-color@10.2.2)):
    dependencies:
      array-includes: 3.1.9
      array.prototype.findlast: 1.2.5
      array.prototype.flatmap: 1.3.3
      array.prototype.tosorted: 1.1.4
      doctrine: 2.1.0
      es-iterator-helpers: 1.3.2
      eslint: 9.39.4(jiti@2.7.0)(supports-color@10.2.2)
      estraverse: 5.3.0
      hasown: 2.0.3
      jsx-ast-utils: 3.3.5
      minimatch: 3.1.5
      object.entries: 1.1.9
      object.fromentries: 2.0.8
      object.values: 1.2.1
      prop-types: 15.8.1
      resolve: 2.0.0-next.7
      semver: 6.3.1
      string.prototype.matchall: 4.0.12
      string.prototype.repeat: 1.0.0

  eslint-scope@5.1.1:
    dependencies:
      esrecurse: 4.3.0
      estraverse: 4.3.0

  eslint-scope@8.4.0:
    dependencies:
      esrecurse: 4.3.0
      estraverse: 5.3.0

  eslint-visitor-keys@3.4.3: {}

  eslint-visitor-keys@4.2.1: {}

  eslint-visitor-keys@5.0.1: {}

  eslint@9.39.4(jiti@2.7.0)(supports-color@10.2.2):
    dependencies:
      '@eslint-community/eslint-utils': 4.9.1(eslint@9.39.4(jiti@2.7.0)(supports-color@10.2.2))
      '@eslint-community/regexpp': 4.12.2
      '@eslint/config-array': 0.21.2(supports-color@10.2.2)
      '@eslint/config-helpers': 0.4.2
      '@eslint/core': 0.17.0
      '@eslint/eslintrc': 3.3.5(supports-color@10.2.2)
      '@eslint/js': 9.39.4
      '@eslint/plugin-kit': 0.4.1
      '@humanfs/node': 0.16.8
      '@humanwhocodes/module-importer': 1.0.1
      '@humanwhocodes/retry': 0.4.3
      '@types/estree': 1.0.9
      ajv: 6.15.0
      chalk: 4.1.2
      cross-spawn: 7.0.6
      debug: 4.4.3(supports-color@10.2.2)
      escape-string-regexp: 4.0.0
      eslint-scope: 8.4.0
      eslint-visitor-keys: 4.2.1
      espree: 10.4.0
      esquery: 1.7.0
      esutils: 2.0.3
      fast-deep-equal: 3.1.3
      file-entry-cache: 8.0.0
      find-up: 5.0.0
      glob-parent: 6.0.2
      ignore: 5.3.2
      imurmurhash: 0.1.4
      is-glob: 4.0.3
      json-stable-stringify-without-jsonify: 1.0.1
      lodash.merge: 4.6.2
      minimatch: 3.1.5
      natural-compare: 1.4.0
      optionator: 0.9.4
    optionalDependencies:
      jiti: 2.7.0
    transitivePeerDependencies:
      - supports-color

  espree@10.4.0:
    dependencies:
      acorn: 8.16.0
      acorn-jsx: 5.3.2(acorn@8.16.0)
      eslint-visitor-keys: 4.2.1

  esquery@1.7.0:
    dependencies:
      estraverse: 5.3.0

  esrecurse@4.3.0:
    dependencies:
      estraverse: 5.3.0

  estraverse@4.3.0: {}

  estraverse@5.3.0: {}

  estree-walker@3.0.3:
    dependencies:
      '@types/estree': 1.0.9

  esutils@2.0.3: {}

  eventemitter3@5.0.4: {}

  events@3.3.0: {}

  fast-deep-equal@3.1.3: {}

  fast-glob@3.3.1:
    dependencies:
      '@nodelib/fs.stat': 2.0.5
      '@nodelib/fs.walk': 1.2.8
      glob-parent: 5.1.2
      merge2: 1.4.1
      micromatch: 4.0.8

  fast-glob@3.3.3:
    dependencies:
      '@nodelib/fs.stat': 2.0.5
      '@nodelib/fs.walk': 1.2.8
      glob-parent: 5.1.2
      merge2: 1.4.1
      micromatch: 4.0.8

  fast-json-stable-stringify@2.1.0: {}

  fast-levenshtein@2.0.6: {}

  fast-uri@3.1.7: {}

  fastq@1.20.1:
    dependencies:
      reusify: 1.1.0

  fdir@6.5.0(picomatch@4.0.4):
    optionalDependencies:
      picomatch: 4.0.4

  fflate@0.7.4: {}

  file-entry-cache@8.0.0:
    dependencies:
      flat-cache: 4.0.1

  fill-range@7.1.1:
    dependencies:
      to-regex-range: 5.0.1

  find-up@5.0.0:
    dependencies:
      locate-path: 6.0.0
      path-exists: 4.0.0

  flat-cache@4.0.1:
    dependencies:
      flatted: 3.4.2
      keyv: 4.5.4

  flatted@3.4.2: {}

  for-each@0.3.5:
    dependencies:
      is-callable: 1.2.7

  fsevents@2.3.3:
    optional: true

  function-bind@1.1.2: {}

  function.prototype.name@1.1.8:
    dependencies:
      call-bind: 1.0.9
      call-bound: 1.0.4
      define-properties: 1.2.1
      functions-have-names: 1.2.3
      hasown: 2.0.3
      is-callable: 1.2.7

  functions-have-names@1.2.3: {}

  generator-function@2.0.1: {}

  gensync@1.0.0-beta.2: {}

  get-intrinsic@1.3.0:
    dependencies:
      call-bind-apply-helpers: 1.0.2
      es-define-property: 1.0.1
      es-errors: 1.3.0
      es-object-atoms: 1.1.1
      function-bind: 1.1.2
      get-proto: 1.0.1
      gopd: 1.2.0
      has-symbols: 1.1.0
      hasown: 2.0.3
      math-intrinsics: 1.1.0

  get-nonce@1.0.1: {}

  get-proto@1.0.1:
    dependencies:
      dunder-proto: 1.0.1
      es-object-atoms: 1.1.1

  get-symbol-description@1.1.0:
    dependencies:
      call-bound: 1.0.4
      es-errors: 1.3.0
      get-intrinsic: 1.3.0

  get-tsconfig@4.14.0:
    dependencies:
      resolve-pkg-maps: 1.0.0

  glob-parent@5.1.2:
    dependencies:
      is-glob: 4.0.3

  glob-parent@6.0.2:
    dependencies:
      is-glob: 4.0.3

  glob-to-regexp@0.4.1: {}

  globals@14.0.0: {}

  globals@16.4.0: {}

  globalthis@1.0.4:
    dependencies:
      define-properties: 1.2.1
      gopd: 1.2.0

  gopd@1.2.0: {}

  graceful-fs@4.2.11: {}

  has-bigints@1.1.0: {}

  has-flag@4.0.0: {}

  has-property-descriptors@1.0.2:
    dependencies:
      es-define-property: 1.0.1

  has-proto@1.2.0:
    dependencies:
      dunder-proto: 1.0.1

  has-symbols@1.1.0: {}

  has-tostringtag@1.0.2:
    dependencies:
      has-symbols: 1.1.0

  hasown@2.0.3:
    dependencies:
      function-bind: 1.1.2

  hermes-estree@0.25.1: {}

  hermes-parser@0.25.1:
    dependencies:
      hermes-estree: 0.25.1

  hex-rgb@4.3.0: {}

  ignore@5.3.2: {}

  ignore@7.0.5: {}

  image-size@2.0.2: {}

  immer@10.2.0: {}

  immer@11.1.16: {}

  import-fresh@3.3.1:
    dependencies:
      parent-module: 1.0.1
      resolve-from: 4.0.0

  imurmurhash@0.1.4: {}

  input-otp@1.4.2(react-dom@19.2.6(react@19.2.6))(react@19.2.6):
    dependencies:
      react: 19.2.6
      react-dom: 19.2.6(react@19.2.6)

  internal-slot@1.1.0:
    dependencies:
      es-errors: 1.3.0
      hasown: 2.0.3
      side-channel: 1.1.0

  internmap@2.0.3: {}

  ipaddr.js@2.4.0: {}

  is-array-buffer@3.0.5:
    dependencies:
      call-bind: 1.0.9
      call-bound: 1.0.4
      get-intrinsic: 1.3.0

  is-async-function@2.1.1:
    dependencies:
      async-function: 1.0.0
      call-bound: 1.0.4
      get-proto: 1.0.1
      has-tostringtag: 1.0.2
      safe-regex-test: 1.1.0

  is-bigint@1.1.0:
    dependencies:
      has-bigints: 1.1.0

  is-boolean-object@1.2.2:
    dependencies:
      call-bound: 1.0.4
      has-tostringtag: 1.0.2

  is-bun-module@2.0.0:
    dependencies:
      semver: 7.8.5

  is-callable@1.2.7: {}

  is-core-module@2.16.2:
    dependencies:
      hasown: 2.0.3

  is-data-view@1.0.2:
    dependencies:
      call-bound: 1.0.4
      get-intrinsic: 1.3.0
      is-typed-array: 1.1.15

  is-date-object@1.1.0:
    dependencies:
      call-bound: 1.0.4
      has-tostringtag: 1.0.2

  is-extglob@2.1.1: {}

  is-finalizationregistry@1.1.1:
    dependencies:
      call-bound: 1.0.4

  is-generator-function@1.1.2:
    dependencies:
      call-bound: 1.0.4
      generator-function: 2.0.1
      get-proto: 1.0.1
      has-tostringtag: 1.0.2
      safe-regex-test: 1.1.0

  is-glob@4.0.3:
    dependencies:
      is-extglob: 2.1.1

  is-map@2.0.3: {}

  is-negative-zero@2.0.3: {}

  is-number-object@1.1.1:
    dependencies:
      call-bound: 1.0.4
      has-tostringtag: 1.0.2

  is-number@7.0.0: {}

  is-regex@1.2.1:
    dependencies:
      call-bound: 1.0.4
      gopd: 1.2.0
      has-tostringtag: 1.0.2
      hasown: 2.0.3

  is-set@2.0.3: {}

  is-shared-array-buffer@1.0.4:
    dependencies:
      call-bound: 1.0.4

  is-string@1.1.1:
    dependencies:
      call-bound: 1.0.4
      has-tostringtag: 1.0.2

  is-symbol@1.1.1:
    dependencies:
      call-bound: 1.0.4
      has-symbols: 1.1.0
      safe-regex-test: 1.1.0

  is-typed-array@1.1.15:
    dependencies:
      which-typed-array: 1.1.20

  is-weakmap@2.0.2: {}

  is-weakref@1.1.1:
    dependencies:
      call-bound: 1.0.4

  is-weakset@2.0.4:
    dependencies:
      call-bound: 1.0.4
      get-intrinsic: 1.3.0

  isarray@2.0.5: {}

  isexe@2.0.0: {}

  iterator.prototype@1.1.5:
    dependencies:
      define-data-property: 1.1.4
      es-object-atoms: 1.1.1
      get-intrinsic: 1.3.0
      get-proto: 1.0.1
      has-symbols: 1.1.0
      set-function-name: 2.0.2

  jest-worker@27.5.1:
    dependencies:
      '@types/node': 22.19.19
      merge-stream: 2.0.0
      supports-color: 8.1.1

  jiti@2.7.0: {}

  js-tokens@4.0.0: {}

  js-tokens@9.0.1: {}

  js-yaml@4.1.1:
    dependencies:
      argparse: 2.0.1

  jsesc@3.1.0: {}

  json-buffer@3.0.1: {}

  json-schema-traverse@0.4.1: {}

  json-schema-traverse@1.0.0: {}

  json-stable-stringify-without-jsonify@1.0.1: {}

  json5@1.0.2:
    dependencies:
      minimist: 1.2.8

  json5@2.2.3: {}

  jsx-ast-utils@3.3.5:
    dependencies:
      array-includes: 3.1.9
      array.prototype.flat: 1.3.3
      object.assign: 4.1.7
      object.values: 1.2.1

  keyv@4.5.4:
    dependencies:
      json-buffer: 3.0.1

  kleur@4.1.5: {}

  language-subtag-registry@0.3.23: {}

  language-tags@1.0.9:
    dependencies:
      language-subtag-registry: 0.3.23

  leaflet@1.9.4: {}

  levn@0.4.1:
    dependencies:
      prelude-ls: 1.2.1
      type-check: 0.4.0

  lightningcss-android-arm64@1.31.1:
    optional: true

  lightningcss-android-arm64@1.32.0:
    optional: true

  lightningcss-darwin-arm64@1.31.1:
    optional: true

  lightningcss-darwin-arm64@1.32.0:
    optional: true

  lightningcss-darwin-x64@1.31.1:
    optional: true

  lightningcss-darwin-x64@1.32.0:
    optional: true

  lightningcss-freebsd-x64@1.31.1:
    optional: true

  lightningcss-freebsd-x64@1.32.0:
    optional: true

  lightningcss-linux-arm-gnueabihf@1.31.1:
    optional: true

  lightningcss-linux-arm-gnueabihf@1.32.0:
    optional: true

  lightningcss-linux-arm64-gnu@1.31.1:
    optional: true

  lightningcss-linux-arm64-gnu@1.32.0:
    optional: true

  lightningcss-linux-arm64-musl@1.31.1:
    optional: true

  lightningcss-linux-arm64-musl@1.32.0:
    optional: true

  lightningcss-linux-x64-gnu@1.31.1:
    optional: true

  lightningcss-linux-x64-gnu@1.32.0:
    optional: true

  lightningcss-linux-x64-musl@1.31.1:
    optional: true

  lightningcss-linux-x64-musl@1.32.0:
    optional: true

  lightningcss-win32-arm64-msvc@1.31.1:
    optional: true

  lightningcss-win32-arm64-msvc@1.32.0:
    optional: true

  lightningcss-win32-x64-msvc@1.31.1:
    optional: true

  lightningcss-win32-x64-msvc@1.32.0:
    optional: true

  lightningcss@1.31.1:
    dependencies:
      detect-libc: 2.1.2
    optionalDependencies:
      lightningcss-android-arm64: 1.31.1
      lightningcss-darwin-arm64: 1.31.1
      lightningcss-darwin-x64: 1.31.1
      lightningcss-freebsd-x64: 1.31.1
      lightningcss-linux-arm-gnueabihf: 1.31.1
      lightningcss-linux-arm64-gnu: 1.31.1
      lightningcss-linux-arm64-musl: 1.31.1
      lightningcss-linux-x64-gnu: 1.31.1
      lightningcss-linux-x64-musl: 1.31.1
      lightningcss-win32-arm64-msvc: 1.31.1
      lightningcss-win32-x64-msvc: 1.31.1

  lightningcss@1.32.0:
    dependencies:
      detect-libc: 2.1.2
    optionalDependencies:
      lightningcss-android-arm64: 1.32.0
      lightningcss-darwin-arm64: 1.32.0
      lightningcss-darwin-x64: 1.32.0
      lightningcss-freebsd-x64: 1.32.0
      lightningcss-linux-arm-gnueabihf: 1.32.0
      lightningcss-linux-arm64-gnu: 1.32.0
      lightningcss-linux-arm64-musl: 1.32.0
      lightningcss-linux-x64-gnu: 1.32.0
      lightningcss-linux-x64-musl: 1.32.0
      lightningcss-win32-arm64-msvc: 1.32.0
      lightningcss-win32-x64-msvc: 1.32.0

  linebreak@1.1.0:
    dependencies:
      base64-js: 0.0.8
      unicode-trie: 2.0.0

  loader-runner@4.3.2: {}

  locate-path@6.0.0:
    dependencies:
      p-locate: 5.0.0

  lodash.merge@4.6.2: {}

  loose-envify@1.4.0:
    dependencies:
      js-tokens: 4.0.0

  lru-cache@5.1.1:
    dependencies:
      yallist: 3.1.1

  lucide-react@1.31.0(react@19.2.6):
    dependencies:
      react: 19.2.6

  magic-string@0.30.21:
    dependencies:
      '@jridgewell/sourcemap-codec': 1.5.5

  math-intrinsics@1.1.0: {}

  merge-stream@2.0.0: {}

  merge2@1.4.1: {}

  micromatch@4.0.8:
    dependencies:
      braces: 3.0.3
      picomatch: 2.3.2

  mime-db@1.54.0: {}

  miniflare@4.20260515.0(@types/node@22.19.19):
    dependencies:
      '@cspotcode/source-map-support': 0.8.1
      sharp: 0.35.4(@types/node@22.19.19)
      undici: 7.24.8
      workerd: 1.20260515.1
      ws: 8.18.0
      youch: 4.1.0-beta.10
    transitivePeerDependencies:
      - '@types/node'
      - bufferutil
      - utf-8-validate

  minimatch@10.2.5:
    dependencies:
      brace-expansion: 5.0.6

  minimatch@3.1.5:
    dependencies:
      brace-expansion: 1.1.14

  minimist@1.2.8: {}

  ms@2.1.3: {}

  nanoid@3.3.18: {}

  napi-postinstall@0.3.4: {}

  natural-compare@1.4.0: {}

  neo-async@2.6.2: {}

  next-themes@0.4.6(react-dom@19.2.6(react@19.2.6))(react@19.2.6):
    dependencies:
      react: 19.2.6
      react-dom: 19.2.6(react@19.2.6)

  next@16.3.4(@babel/core@7.29.0(supports-color@10.2.2))(@types/node@22.19.19)(react-dom@19.2.6(react@19.2.6))(react@19.2.6):
    dependencies:
      '@next/env': 16.3.4
      '@swc/helpers': 0.5.23
      baseline-browser-mapping: 2.10.30
      caniuse-lite: 1.0.30001793
      postcss: 8.5.23
      react: 19.2.6
      react-dom: 19.2.6(react@19.2.6)
      styled-jsx: 5.1.6(@babel/core@7.29.0(supports-color@10.2.2))(react@19.2.6)
    optionalDependencies:
      '@next/swc-darwin-arm64': 16.3.4
      '@next/swc-darwin-x64': 16.3.4
      '@next/swc-linux-arm64-gnu': 16.3.4
      '@next/swc-linux-arm64-musl': 16.3.4
      '@next/swc-linux-x64-gnu': 16.3.4
      '@next/swc-linux-x64-musl': 16.3.4
      '@next/swc-win32-arm64-msvc': 16.3.4
      '@next/swc-win32-x64-msvc': 16.3.4
      sharp: 0.35.4(@types/node@22.19.19)
    transitivePeerDependencies:
      - '@babel/core'
      - '@types/node'
      - babel-plugin-macros

  node-exports-info@1.6.0:
    dependencies:
      array.prototype.flatmap: 1.3.3
      es-errors: 1.3.0
      object.entries: 1.1.9
      semver: 6.3.1

  node-releases@2.0.44: {}

  object-assign@4.1.1: {}

  object-inspect@1.13.4: {}

  object-keys@1.1.1: {}

  object.assign@4.1.7:
    dependencies:
      call-bind: 1.0.9
      call-bound: 1.0.4
      define-properties: 1.2.1
      es-object-atoms: 1.1.1
      has-symbols: 1.1.0
      object-keys: 1.1.1

  object.entries@1.1.9:
    dependencies:
      call-bind: 1.0.9
      call-bound: 1.0.4
      define-properties: 1.2.1
      es-object-atoms: 1.1.1

  object.fromentries@2.0.8:
    dependencies:
      call-bind: 1.0.9
      define-properties: 1.2.1
      es-abstract: 1.24.2
      es-object-atoms: 1.1.1

  object.groupby@1.0.3:
    dependencies:
      call-bind: 1.0.9
      define-properties: 1.2.1
      es-abstract: 1.24.2

  object.values@1.2.1:
    dependencies:
      call-bind: 1.0.9
      call-bound: 1.0.4
      define-properties: 1.2.1
      es-object-atoms: 1.1.1

  optionator@0.9.4:
    dependencies:
      deep-is: 0.1.4
      fast-levenshtein: 2.0.6
      levn: 0.4.1
      prelude-ls: 1.2.1
      type-check: 0.4.0
      word-wrap: 1.2.5

  own-keys@1.0.1:
    dependencies:
      get-intrinsic: 1.3.0
      object-keys: 1.1.1
      safe-push-apply: 1.0.0

  p-limit@3.1.0:
    dependencies:
      yocto-queue: 0.1.0

  p-locate@5.0.0:
    dependencies:
      p-limit: 3.1.0

  pako@0.2.9: {}

  parent-module@1.0.1:
    dependencies:
      callsites: 3.1.0

  parse-css-color@0.2.1:
    dependencies:
      color-name: 1.1.4
      hex-rgb: 4.3.0

  path-exists@4.0.0: {}

  path-key@3.1.1: {}

  path-parse@1.0.7: {}

  path-to-regexp@6.3.0: {}

  pathe@2.0.3: {}

  picocolors@1.1.1: {}

  picomatch@2.3.2: {}

  picomatch@4.0.4: {}

  possible-typed-array-names@1.1.0: {}

  postcss-value-parser@4.2.0: {}

  postcss@8.5.23:
    dependencies:
      nanoid: 3.3.18
      picocolors: 1.1.1
      source-map-js: 1.2.1

  prelude-ls@1.2.1: {}

  prop-types@15.8.1:
    dependencies:
      loose-envify: 1.4.0
      object-assign: 4.1.1
      react-is: 16.13.1

  punycode@2.3.1: {}

  queue-microtask@1.2.3: {}

  radix-ui@1.6.7(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6):
    dependencies:
      '@radix-ui/primitive': 1.1.7
      '@radix-ui/react-accessible-icon': 1.1.15(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-accordion': 1.2.20(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-alert-dialog': 1.1.23(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-arrow': 1.1.15(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-aspect-ratio': 1.1.15(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-avatar': 1.2.6(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-checkbox': 1.3.11(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-collapsible': 1.1.20(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-collection': 1.1.15(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-compose-refs': 1.1.5(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-context': 1.2.2(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-context-menu': 2.3.7(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-dialog': 1.1.23(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-direction': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-dismissable-layer': 1.1.19(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-dropdown-menu': 2.1.24(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-focus-guards': 1.1.6(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-focus-scope': 1.1.16(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-form': 0.1.16(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-hover-card': 1.1.23(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-label': 2.1.15(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-menu': 2.1.24(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-menubar': 1.1.24(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-navigation-menu': 1.2.22(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-one-time-password-field': 0.1.16(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-password-toggle-field': 0.1.11(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-popover': 1.1.23(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-popper': 1.3.7(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-portal': 1.1.17(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-presence': 1.1.10(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-progress': 1.1.16(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-radio-group': 1.4.7(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-roving-focus': 1.1.19(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-scroll-area': 1.2.18(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-select': 2.3.7(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-separator': 1.1.15(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-slider': 1.4.7(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-slot': 1.3.3(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-switch': 1.3.7(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-tabs': 1.1.21(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-toast': 1.2.23(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-toggle': 1.1.18(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-toggle-group': 1.1.19(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-toolbar': 1.1.19(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-tooltip': 1.2.16(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@radix-ui/react-use-callback-ref': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-use-controllable-state': 1.2.6(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-use-effect-event': 0.0.5(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-use-escape-keydown': 1.1.5(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-use-is-hydrated': 0.1.3(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-use-layout-effect': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-use-size': 1.1.4(@types/react@19.2.14)(react@19.2.6)
      '@radix-ui/react-visually-hidden': 1.2.11(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      react: 19.2.6
      react-dom: 19.2.6(react@19.2.6)
    optionalDependencies:
      '@types/react': 19.2.14
      '@types/react-dom': 19.2.3(@types/react@19.2.14)

  react-day-picker@10.0.1(@types/react@19.2.14)(react@19.2.6):
    dependencies:
      '@date-fns/tz': 1.5.0
      date-fns: 4.4.0
      react: 19.2.6
    optionalDependencies:
      '@types/react': 19.2.14

  react-dom@19.2.6(react@19.2.6):
    dependencies:
      react: 19.2.6
      scheduler: 0.27.0

  react-hook-form@7.85.0(react@19.2.6):
    dependencies:
      react: 19.2.6

  react-is@16.13.1: {}

  react-redux@9.3.0(@types/react@19.2.14)(react@19.2.6)(redux@5.0.1):
    dependencies:
      '@types/use-sync-external-store': 0.0.6
      react: 19.2.6
      use-sync-external-store: 1.6.0(react@19.2.6)
    optionalDependencies:
      '@types/react': 19.2.14
      redux: 5.0.1

  react-remove-scroll-bar@2.3.8(@types/react@19.2.14)(react@19.2.6):
    dependencies:
      react: 19.2.6
      react-style-singleton: 2.2.3(@types/react@19.2.14)(react@19.2.6)
      tslib: 2.8.1
    optionalDependencies:
      '@types/react': 19.2.14

  react-remove-scroll@2.7.2(@types/react@19.2.14)(react@19.2.6):
    dependencies:
      react: 19.2.6
      react-remove-scroll-bar: 2.3.8(@types/react@19.2.14)(react@19.2.6)
      react-style-singleton: 2.2.3(@types/react@19.2.14)(react@19.2.6)
      tslib: 2.8.1
      use-callback-ref: 1.3.3(@types/react@19.2.14)(react@19.2.6)
      use-sidecar: 1.1.3(@types/react@19.2.14)(react@19.2.6)
    optionalDependencies:
      '@types/react': 19.2.14

  react-resizable-panels@4.12.2(react-dom@19.2.6(react@19.2.6))(react@19.2.6):
    dependencies:
      react: 19.2.6
      react-dom: 19.2.6(react@19.2.6)

  react-server-dom-webpack@19.2.6(react-dom@19.2.6(react@19.2.6))(react@19.2.6)(webpack@5.106.2(esbuild@0.28.0)(lightningcss@1.32.0)(postcss@8.5.23)):
    dependencies:
      acorn-loose: 8.5.2
      neo-async: 2.6.2
      react: 19.2.6
      react-dom: 19.2.6(react@19.2.6)
      webpack: 5.106.2(esbuild@0.28.0)(lightningcss@1.32.0)(postcss@8.5.23)
      webpack-sources: 3.4.1

  react-style-singleton@2.2.3(@types/react@19.2.14)(react@19.2.6):
    dependencies:
      get-nonce: 1.0.1
      react: 19.2.6
      tslib: 2.8.1
    optionalDependencies:
      '@types/react': 19.2.14

  react@19.2.6: {}

  recharts@3.8.0(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react-is@16.13.1)(react@19.2.6)(redux@5.0.1):
    dependencies:
      '@reduxjs/toolkit': 2.12.0(react-redux@9.3.0(@types/react@19.2.14)(react@19.2.6)(redux@5.0.1))(react@19.2.6)
      clsx: 2.1.1
      decimal.js-light: 2.5.1
      es-toolkit: 1.50.0
      eventemitter3: 5.0.4
      immer: 10.2.0
      react: 19.2.6
      react-dom: 19.2.6(react@19.2.6)
      react-is: 16.13.1
      react-redux: 9.3.0(@types/react@19.2.14)(react@19.2.6)(redux@5.0.1)
      reselect: 5.1.1
      tiny-invariant: 1.3.3
      use-sync-external-store: 1.6.0(react@19.2.6)
      victory-vendor: 37.3.6
    transitivePeerDependencies:
      - '@types/react'
      - redux

  redux-thunk@3.1.0(redux@5.0.1):
    dependencies:
      redux: 5.0.1

  redux@5.0.1: {}

  reflect.getprototypeof@1.0.10:
    dependencies:
      call-bind: 1.0.9
      define-properties: 1.2.1
      es-abstract: 1.24.2
      es-errors: 1.3.0
      es-object-atoms: 1.1.1
      get-intrinsic: 1.3.0
      get-proto: 1.0.1
      which-builtin-type: 1.2.1

  regexp.prototype.flags@1.5.4:
    dependencies:
      call-bind: 1.0.9
      define-properties: 1.2.1
      es-errors: 1.3.0
      get-proto: 1.0.1
      gopd: 1.2.0
      set-function-name: 2.0.2

  require-from-string@2.0.2: {}

  reselect@5.1.1: {}

  reselect@5.2.0: {}

  resolve-from@4.0.0: {}

  resolve-pkg-maps@1.0.0: {}

  resolve@2.0.0-next.7:
    dependencies:
      es-errors: 1.3.0
      is-core-module: 2.16.2
      node-exports-info: 1.6.0
      object-keys: 1.1.1
      path-parse: 1.0.7
      supports-preserve-symlinks-flag: 1.0.0

  reusify@1.1.0: {}

  rolldown@1.0.1:
    dependencies:
      '@oxc-project/types': 0.130.0
      '@rolldown/pluginutils': 1.0.1
    optionalDependencies:
      '@rolldown/binding-android-arm64': 1.0.1
      '@rolldown/binding-darwin-arm64': 1.0.1
      '@rolldown/binding-darwin-x64': 1.0.1
      '@rolldown/binding-freebsd-x64': 1.0.1
      '@rolldown/binding-linux-arm-gnueabihf': 1.0.1
      '@rolldown/binding-linux-arm64-gnu': 1.0.1
      '@rolldown/binding-linux-arm64-musl': 1.0.1
      '@rolldown/binding-linux-ppc64-gnu': 1.0.1
      '@rolldown/binding-linux-s390x-gnu': 1.0.1
      '@rolldown/binding-linux-x64-gnu': 1.0.1
      '@rolldown/binding-linux-x64-musl': 1.0.1
      '@rolldown/binding-openharmony-arm64': 1.0.1
      '@rolldown/binding-wasm32-wasi': 1.0.1
      '@rolldown/binding-win32-arm64-msvc': 1.0.1
      '@rolldown/binding-win32-x64-msvc': 1.0.1

  run-parallel@1.2.0:
    dependencies:
      queue-microtask: 1.2.3

  safe-array-concat@1.1.4:
    dependencies:
      call-bind: 1.0.9
      call-bound: 1.0.4
      get-intrinsic: 1.3.0
      has-symbols: 1.1.0
      isarray: 2.0.5

  safe-push-apply@1.0.0:
    dependencies:
      es-errors: 1.3.0
      isarray: 2.0.5

  safe-regex-test@1.1.0:
    dependencies:
      call-bound: 1.0.4
      es-errors: 1.3.0
      is-regex: 1.2.1

  satori@0.16.0:
    dependencies:
      '@shuding/opentype.js': 1.4.0-beta.0
      css-background-parser: 0.1.0
      css-box-shadow: 1.0.0-3
      css-gradient-parser: 0.0.16
      css-to-react-native: 3.2.0
      emoji-regex-xs: 2.0.1
      escape-html: 1.0.3
      linebreak: 1.1.0
      parse-css-color: 0.2.1
      postcss-value-parser: 4.2.0
      yoga-layout: 3.2.1

  scheduler@0.27.0: {}

  schema-utils@4.3.3:
    dependencies:
      '@types/json-schema': 7.0.15
      ajv: 8.20.0
      ajv-formats: 2.1.1(ajv@8.20.0)
      ajv-keywords: 5.1.0(ajv@8.20.0)

  semver@6.3.1: {}

  semver@7.8.5: {}

  set-function-length@1.2.2:
    dependencies:
      define-data-property: 1.1.4
      es-errors: 1.3.0
      function-bind: 1.1.2
      get-intrinsic: 1.3.0
      gopd: 1.2.0
      has-property-descriptors: 1.0.2

  set-function-name@2.0.2:
    dependencies:
      define-data-property: 1.1.4
      es-errors: 1.3.0
      functions-have-names: 1.2.3
      has-property-descriptors: 1.0.2

  set-proto@1.0.0:
    dependencies:
      dunder-proto: 1.0.1
      es-errors: 1.3.0
      es-object-atoms: 1.1.1

  sharp@0.35.4(@types/node@22.19.19):
    dependencies:
      '@img/colour': 1.1.0
      detect-libc: 2.1.2
      semver: 7.8.5
    optionalDependencies:
      '@img/sharp-darwin-arm64': 0.35.4
      '@img/sharp-darwin-x64': 0.35.4
      '@img/sharp-freebsd-wasm32': 0.35.4
      '@img/sharp-libvips-darwin-arm64': 1.3.3
      '@img/sharp-libvips-darwin-x64': 1.3.3
      '@img/sharp-libvips-linux-arm': 1.3.3
      '@img/sharp-libvips-linux-arm64': 1.3.3
      '@img/sharp-libvips-linux-ppc64': 1.3.3
      '@img/sharp-libvips-linux-riscv64': 1.3.3
      '@img/sharp-libvips-linux-s390x': 1.3.3
      '@img/sharp-libvips-linux-x64': 1.3.3
      '@img/sharp-libvips-linuxmusl-arm64': 1.3.3
      '@img/sharp-libvips-linuxmusl-x64': 1.3.3
      '@img/sharp-linux-arm': 0.35.4
      '@img/sharp-linux-arm64': 0.35.4
      '@img/sharp-linux-ppc64': 0.35.4
      '@img/sharp-linux-riscv64': 0.35.4
      '@img/sharp-linux-s390x': 0.35.4
      '@img/sharp-linux-x64': 0.35.4
      '@img/sharp-linuxmusl-arm64': 0.35.4
      '@img/sharp-linuxmusl-x64': 0.35.4
      '@img/sharp-webcontainers-wasm32': 0.35.4
      '@img/sharp-win32-arm64': 0.35.4
      '@img/sharp-win32-ia32': 0.35.4
      '@img/sharp-win32-x64': 0.35.4
      '@types/node': 22.19.19

  shebang-command@2.0.0:
    dependencies:
      shebang-regex: 3.0.0

  shebang-regex@3.0.0: {}

  side-channel-list@1.0.1:
    dependencies:
      es-errors: 1.3.0
      object-inspect: 1.13.4

  side-channel-map@1.0.1:
    dependencies:
      call-bound: 1.0.4
      es-errors: 1.3.0
      get-intrinsic: 1.3.0
      object-inspect: 1.13.4

  side-channel-weakmap@1.0.2:
    dependencies:
      call-bound: 1.0.4
      es-errors: 1.3.0
      get-intrinsic: 1.3.0
      object-inspect: 1.13.4
      side-channel-map: 1.0.1

  side-channel@1.1.0:
    dependencies:
      es-errors: 1.3.0
      object-inspect: 1.13.4
      side-channel-list: 1.0.1
      side-channel-map: 1.0.1
      side-channel-weakmap: 1.0.2

  sonner@2.0.8(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6):
    dependencies:
      react: 19.2.6
      react-dom: 19.2.6(react@19.2.6)
    optionalDependencies:
      '@types/react': 19.2.14

  source-map-js@1.2.1: {}

  source-map-support@0.5.21:
    dependencies:
      buffer-from: 1.1.2
      source-map: 0.6.1

  source-map@0.6.1: {}

  srvx@0.11.15: {}

  stable-hash@0.0.5: {}

  stop-iteration-iterator@1.1.0:
    dependencies:
      es-errors: 1.3.0
      internal-slot: 1.1.0

  string.prototype.codepointat@0.2.1: {}

  string.prototype.includes@2.0.1:
    dependencies:
      call-bind: 1.0.9
      define-properties: 1.2.1
      es-abstract: 1.24.2

  string.prototype.matchall@4.0.12:
    dependencies:
      call-bind: 1.0.9
      call-bound: 1.0.4
      define-properties: 1.2.1
      es-abstract: 1.24.2
      es-errors: 1.3.0
      es-object-atoms: 1.1.1
      get-intrinsic: 1.3.0
      gopd: 1.2.0
      has-symbols: 1.1.0
      internal-slot: 1.1.0
      regexp.prototype.flags: 1.5.4
      set-function-name: 2.0.2
      side-channel: 1.1.0

  string.prototype.repeat@1.0.0:
    dependencies:
      define-properties: 1.2.1
      es-abstract: 1.24.2

  string.prototype.trim@1.2.10:
    dependencies:
      call-bind: 1.0.9
      call-bound: 1.0.4
      define-data-property: 1.1.4
      define-properties: 1.2.1
      es-abstract: 1.24.2
      es-object-atoms: 1.1.1
      has-property-descriptors: 1.0.2

  string.prototype.trimend@1.0.9:
    dependencies:
      call-bind: 1.0.9
      call-bound: 1.0.4
      define-properties: 1.2.1
      es-object-atoms: 1.1.1

  string.prototype.trimstart@1.0.8:
    dependencies:
      call-bind: 1.0.9
      define-properties: 1.2.1
      es-object-atoms: 1.1.1

  strip-bom@3.0.0: {}

  strip-json-comments@3.1.1: {}

  strip-literal@3.1.0:
    dependencies:
      js-tokens: 9.0.1

  styled-jsx@5.1.6(@babel/core@7.29.0(supports-color@10.2.2))(react@19.2.6):
    dependencies:
      client-only: 0.0.1
      react: 19.2.6
    optionalDependencies:
      '@babel/core': 7.29.0(supports-color@10.2.2)

  supports-color@10.2.2: {}

  supports-color@7.2.0:
    dependencies:
      has-flag: 4.0.0

  supports-color@8.1.1:
    dependencies:
      has-flag: 4.0.0

  supports-preserve-symlinks-flag@1.0.0: {}

  tailwind-merge@3.6.0: {}

  tailwindcss@4.2.1: {}

  tapable@2.3.3: {}

  terser-webpack-plugin@5.6.0(esbuild@0.28.0)(lightningcss@1.32.0)(postcss@8.5.23)(webpack@5.106.2(esbuild@0.28.0)(lightningcss@1.32.0)(postcss@8.5.23)):
    dependencies:
      '@jridgewell/trace-mapping': 0.3.31
      jest-worker: 27.5.1
      schema-utils: 4.3.3
      terser: 5.47.1
      webpack: 5.106.2(esbuild@0.28.0)(lightningcss@1.32.0)(postcss@8.5.23)
    optionalDependencies:
      esbuild: 0.28.0
      lightningcss: 1.32.0
      postcss: 8.5.23

  terser@5.47.1:
    dependencies:
      '@jridgewell/source-map': 0.3.11
      acorn: 8.16.0
      commander: 2.20.3
      source-map-support: 0.5.21

  tiny-inflate@1.0.3: {}

  tiny-invariant@1.3.3: {}

  tinyglobby@0.2.16:
    dependencies:
      fdir: 6.5.0(picomatch@4.0.4)
      picomatch: 4.0.4

  to-regex-range@5.0.1:
    dependencies:
      is-number: 7.0.0

  ts-api-utils@2.5.0(typescript@5.9.3):
    dependencies:
      typescript: 5.9.3

  tsconfig-paths@3.15.0:
    dependencies:
      '@types/json5': 0.0.29
      json5: 1.0.2
      minimist: 1.2.8
      strip-bom: 3.0.0

  tslib@2.8.1: {}

  tsx@4.22.1:
    dependencies:
      esbuild: 0.28.0
    optionalDependencies:
      fsevents: 2.3.3

  turbo-stream@3.2.0: {}

  tw-animate-css@1.4.0: {}

  type-check@0.4.0:
    dependencies:
      prelude-ls: 1.2.1

  typed-array-buffer@1.0.3:
    dependencies:
      call-bound: 1.0.4
      es-errors: 1.3.0
      is-typed-array: 1.1.15

  typed-array-byte-length@1.0.3:
    dependencies:
      call-bind: 1.0.9
      for-each: 0.3.5
      gopd: 1.2.0
      has-proto: 1.2.0
      is-typed-array: 1.1.15

  typed-array-byte-offset@1.0.4:
    dependencies:
      available-typed-arrays: 1.0.7
      call-bind: 1.0.9
      for-each: 0.3.5
      gopd: 1.2.0
      has-proto: 1.2.0
      is-typed-array: 1.1.15
      reflect.getprototypeof: 1.0.10

  typed-array-length@1.0.7:
    dependencies:
      call-bind: 1.0.9
      for-each: 0.3.5
      gopd: 1.2.0
      is-typed-array: 1.1.15
      possible-typed-array-names: 1.1.0
      reflect.getprototypeof: 1.0.10

  typescript-eslint@8.59.3(eslint@9.39.4(jiti@2.7.0)(supports-color@10.2.2))(supports-color@10.2.2)(typescript@5.9.3):
    dependencies:
      '@typescript-eslint/eslint-plugin': 8.59.3(@typescript-eslint/parser@8.59.3(eslint@9.39.4(jiti@2.7.0)(supports-color@10.2.2))(supports-color@10.2.2)(typescript@5.9.3))(eslint@9.39.4(jiti@2.7.0)(supports-color@10.2.2))(supports-color@10.2.2)(typescript@5.9.3)
      '@typescript-eslint/parser': 8.59.3(eslint@9.39.4(jiti@2.7.0)(supports-color@10.2.2))(supports-color@10.2.2)(typescript@5.9.3)
      '@typescript-eslint/typescript-estree': 8.59.3(supports-color@10.2.2)(typescript@5.9.3)
      '@typescript-eslint/utils': 8.59.3(eslint@9.39.4(jiti@2.7.0)(supports-color@10.2.2))(supports-color@10.2.2)(typescript@5.9.3)
      eslint: 9.39.4(jiti@2.7.0)(supports-color@10.2.2)
      typescript: 5.9.3
    transitivePeerDependencies:
      - supports-color

  typescript@5.9.3: {}

  unbox-primitive@1.1.0:
    dependencies:
      call-bound: 1.0.4
      has-bigints: 1.1.0
      has-symbols: 1.1.0
      which-boxed-primitive: 1.1.1

  undici-types@6.21.0: {}

  undici@7.24.8: {}

  unenv@2.0.0-rc.24:
    dependencies:
      pathe: 2.0.3

  unicode-trie@2.0.0:
    dependencies:
      pako: 0.2.9
      tiny-inflate: 1.0.3

  unpic@4.2.2: {}

  unrs-resolver@1.11.1:
    dependencies:
      napi-postinstall: 0.3.4
    optionalDependencies:
      '@unrs/resolver-binding-android-arm-eabi': 1.11.1
      '@unrs/resolver-binding-android-arm64': 1.11.1
      '@unrs/resolver-binding-darwin-arm64': 1.11.1
      '@unrs/resolver-binding-darwin-x64': 1.11.1
      '@unrs/resolver-binding-freebsd-x64': 1.11.1
      '@unrs/resolver-binding-linux-arm-gnueabihf': 1.11.1
      '@unrs/resolver-binding-linux-arm-musleabihf': 1.11.1
      '@unrs/resolver-binding-linux-arm64-gnu': 1.11.1
      '@unrs/resolver-binding-linux-arm64-musl': 1.11.1
      '@unrs/resolver-binding-linux-ppc64-gnu': 1.11.1
      '@unrs/resolver-binding-linux-riscv64-gnu': 1.11.1
      '@unrs/resolver-binding-linux-riscv64-musl': 1.11.1
      '@unrs/resolver-binding-linux-s390x-gnu': 1.11.1
      '@unrs/resolver-binding-linux-x64-gnu': 1.11.1
      '@unrs/resolver-binding-linux-x64-musl': 1.11.1
      '@unrs/resolver-binding-wasm32-wasi': 1.11.1
      '@unrs/resolver-binding-win32-arm64-msvc': 1.11.1
      '@unrs/resolver-binding-win32-ia32-msvc': 1.11.1
      '@unrs/resolver-binding-win32-x64-msvc': 1.11.1

  update-browserslist-db@1.2.3(browserslist@4.28.2):
    dependencies:
      browserslist: 4.28.2
      escalade: 3.2.0
      picocolors: 1.1.1

  uri-js@4.4.1:
    dependencies:
      punycode: 2.3.1

  use-callback-ref@1.3.3(@types/react@19.2.14)(react@19.2.6):
    dependencies:
      react: 19.2.6
      tslib: 2.8.1
    optionalDependencies:
      '@types/react': 19.2.14

  use-sidecar@1.1.3(@types/react@19.2.14)(react@19.2.6):
    dependencies:
      detect-node-es: 1.1.0
      react: 19.2.6
      tslib: 2.8.1
    optionalDependencies:
      '@types/react': 19.2.14

  use-sync-external-store@1.6.0(react@19.2.6):
    dependencies:
      react: 19.2.6

  vaul@1.1.2(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6):
    dependencies:
      '@radix-ui/react-dialog': 1.1.23(@types/react-dom@19.2.3(@types/react@19.2.14))(@types/react@19.2.14)(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      react: 19.2.6
      react-dom: 19.2.6(react@19.2.6)
    transitivePeerDependencies:
      - '@types/react'
      - '@types/react-dom'

  victory-vendor@37.3.6:
    dependencies:
      '@types/d3-array': 3.2.2
      '@types/d3-ease': 3.0.2
      '@types/d3-interpolate': 3.0.4
      '@types/d3-scale': 4.0.9
      '@types/d3-shape': 3.1.8
      '@types/d3-time': 3.0.4
      '@types/d3-timer': 3.0.2
      d3-array: 3.2.4
      d3-ease: 3.0.1
      d3-interpolate: 3.0.1
      d3-scale: 4.0.2
      d3-shape: 3.2.0
      d3-time: 3.1.0
      d3-timer: 3.0.1

  vinext@1.0.0-beta.5(@vitejs/plugin-react@6.0.2(vite@8.0.13(@types/node@22.19.19)(esbuild@0.28.0)(jiti@2.7.0)(terser@5.47.1)(tsx@4.22.1)))(@vitejs/plugin-rsc@0.5.26(react-dom@19.2.6(react@19.2.6))(react-server-dom-webpack@19.2.6(react-dom@19.2.6(react@19.2.6))(react@19.2.6)(webpack@5.106.2(esbuild@0.28.0)(lightningcss@1.32.0)(postcss@8.5.23)))(react@19.2.6)(vite@8.0.13(@types/node@22.19.19)(esbuild@0.28.0)(jiti@2.7.0)(terser@5.47.1)(tsx@4.22.1)))(next@16.3.4(@babel/core@7.29.0(supports-color@10.2.2))(@types/node@22.19.19)(react-dom@19.2.6(react@19.2.6))(react@19.2.6))(react-dom@19.2.6(react@19.2.6))(react-server-dom-webpack@19.2.6(react-dom@19.2.6(react@19.2.6))(react@19.2.6)(webpack@5.106.2(esbuild@0.28.0)(lightningcss@1.32.0)(postcss@8.5.23)))(react@19.2.6)(vite@8.0.13(@types/node@22.19.19)(esbuild@0.28.0)(jiti@2.7.0)(terser@5.47.1)(tsx@4.22.1)):
    dependencies:
      '@unpic/react': 1.0.2(next@16.3.4(@babel/core@7.29.0(supports-color@10.2.2))(@types/node@22.19.19)(react-dom@19.2.6(react@19.2.6))(react@19.2.6))(react-dom@19.2.6(react@19.2.6))(react@19.2.6)
      '@vercel/og': 0.8.6
      '@vinext/types': 1.0.0-beta.2
      '@vitejs/plugin-react': 6.0.2(vite@8.0.13(@types/node@22.19.19)(esbuild@0.28.0)(jiti@2.7.0)(terser@5.47.1)(tsx@4.22.1))
      image-size: 2.0.2
      ipaddr.js: 2.4.0
      magic-string: 0.30.21
      react: 19.2.6
      react-dom: 19.2.6(react@19.2.6)
      vite: 8.0.13(@types/node@22.19.19)(esbuild@0.28.0)(jiti@2.7.0)(terser@5.47.1)(tsx@4.22.1)
      vite-plugin-commonjs: 0.10.4
      web-vitals: 4.2.4
    optionalDependencies:
      '@vitejs/plugin-rsc': 0.5.26(react-dom@19.2.6(react@19.2.6))(react-server-dom-webpack@19.2.6(react-dom@19.2.6(react@19.2.6))(react@19.2.6)(webpack@5.106.2(esbuild@0.28.0)(lightningcss@1.32.0)(postcss@8.5.23)))(react@19.2.6)(vite@8.0.13(@types/node@22.19.19)(esbuild@0.28.0)(jiti@2.7.0)(terser@5.47.1)(tsx@4.22.1))
      react-server-dom-webpack: 19.2.6(react-dom@19.2.6(react@19.2.6))(react@19.2.6)(webpack@5.106.2(esbuild@0.28.0)(lightningcss@1.32.0)(postcss@8.5.23))
    transitivePeerDependencies:
      - next

  vite-plugin-commonjs@0.10.4:
    dependencies:
      acorn: 8.16.0
      magic-string: 0.30.21
      vite-plugin-dynamic-import: 1.6.0

  vite-plugin-dynamic-import@1.6.0:
    dependencies:
      acorn: 8.16.0
      es-module-lexer: 1.7.0
      fast-glob: 3.3.3
      magic-string: 0.30.21

  vite@8.0.13(@types/node@22.19.19)(esbuild@0.28.0)(jiti@2.7.0)(terser@5.47.1)(tsx@4.22.1):
    dependencies:
      lightningcss: 1.32.0
      picomatch: 4.0.4
      postcss: 8.5.23
      rolldown: 1.0.1
      tinyglobby: 0.2.16
    optionalDependencies:
      '@types/node': 22.19.19
      esbuild: 0.28.0
      fsevents: 2.3.3
      jiti: 2.7.0
      terser: 5.47.1
      tsx: 4.22.1

  vitefu@1.1.3(vite@8.0.13(@types/node@22.19.19)(esbuild@0.28.0)(jiti@2.7.0)(terser@5.47.1)(tsx@4.22.1)):
    optionalDependencies:
      vite: 8.0.13(@types/node@22.19.19)(esbuild@0.28.0)(jiti@2.7.0)(terser@5.47.1)(tsx@4.22.1)

  watchpack@2.5.1:
    dependencies:
      glob-to-regexp: 0.4.1
      graceful-fs: 4.2.11

  web-vitals@4.2.4: {}

  webpack-sources@3.4.1: {}

  webpack@5.106.2(esbuild@0.28.0)(lightningcss@1.32.0)(postcss@8.5.23):
    dependencies:
      '@types/eslint-scope': 3.7.7
      '@types/estree': 1.0.9
      '@types/json-schema': 7.0.15
      '@webassemblyjs/ast': 1.14.1
      '@webassemblyjs/wasm-edit': 1.14.1
      '@webassemblyjs/wasm-parser': 1.14.1
      acorn: 8.16.0
      acorn-import-phases: 1.0.4(acorn@8.16.0)
      browserslist: 4.28.2
      chrome-trace-event: 1.0.4
      enhanced-resolve: 5.21.3
      es-module-lexer: 2.1.0
      eslint-scope: 5.1.1
      events: 3.3.0
      glob-to-regexp: 0.4.1
      graceful-fs: 4.2.11
      loader-runner: 4.3.2
      mime-db: 1.54.0
      neo-async: 2.6.2
      schema-utils: 4.3.3
      tapable: 2.3.3
      terser-webpack-plugin: 5.6.0(esbuild@0.28.0)(lightningcss@1.32.0)(postcss@8.5.23)(webpack@5.106.2(esbuild@0.28.0)(lightningcss@1.32.0)(postcss@8.5.23))
      watchpack: 2.5.1
      webpack-sources: 3.4.1
    transitivePeerDependencies:
      - '@minify-html/node'
      - '@swc/core'
      - '@swc/css'
      - '@swc/html'
      - clean-css
      - cssnano
      - csso
      - esbuild
      - html-minifier-terser
      - lightningcss
      - postcss
      - uglify-js

  which-boxed-primitive@1.1.1:
    dependencies:
      is-bigint: 1.1.0
      is-boolean-object: 1.2.2
      is-number-object: 1.1.1
      is-string: 1.1.1
      is-symbol: 1.1.1

  which-builtin-type@1.2.1:
    dependencies:
      call-bound: 1.0.4
      function.prototype.name: 1.1.8
      has-tostringtag: 1.0.2
      is-async-function: 2.1.1
      is-date-object: 1.1.0
      is-finalizationregistry: 1.1.1
      is-generator-function: 1.1.2
      is-regex: 1.2.1
      is-weakref: 1.1.1
      isarray: 2.0.5
      which-boxed-primitive: 1.1.1
      which-collection: 1.0.2
      which-typed-array: 1.1.20

  which-collection@1.0.2:
    dependencies:
      is-map: 2.0.3
      is-set: 2.0.3
      is-weakmap: 2.0.2
      is-weakset: 2.0.4

  which-typed-array@1.1.20:
    dependencies:
      available-typed-arrays: 1.0.7
      call-bind: 1.0.9
      call-bound: 1.0.4
      for-each: 0.3.5
      get-proto: 1.0.1
      gopd: 1.2.0
      has-tostringtag: 1.0.2

  which@2.0.2:
    dependencies:
      isexe: 2.0.0

  word-wrap@1.2.5: {}

  workerd@1.20260515.1:
    optionalDependencies:
      '@cloudflare/workerd-darwin-64': 1.20260515.1
      '@cloudflare/workerd-darwin-arm64': 1.20260515.1
      '@cloudflare/workerd-linux-64': 1.20260515.1
      '@cloudflare/workerd-linux-arm64': 1.20260515.1
      '@cloudflare/workerd-windows-64': 1.20260515.1

  wrangler@4.92.0(@cloudflare/workers-types@4.20260515.1)(@types/node@22.19.19):
    dependencies:
      '@cloudflare/kv-asset-handler': 0.5.0
      '@cloudflare/unenv-preset': 2.16.1(unenv@2.0.0-rc.24)(workerd@1.20260515.1)
      blake3-wasm: 2.1.5
      esbuild: 0.27.3
      miniflare: 4.20260515.0(@types/node@22.19.19)
      path-to-regexp: 6.3.0
      unenv: 2.0.0-rc.24
      workerd: 1.20260515.1
    optionalDependencies:
      '@cloudflare/workers-types': 4.20260515.1
      fsevents: 2.3.3
    transitivePeerDependencies:
      - '@types/node'
      - bufferutil
      - utf-8-validate

  ws@8.18.0: {}

  yallist@3.1.1: {}

  yocto-queue@0.1.0: {}

  yoga-layout@3.2.1: {}

  youch-core@0.3.3:
    dependencies:
      '@poppinss/exception': 1.2.3
      error-stack-parser-es: 1.0.5

  youch@4.1.0-beta.10:
    dependencies:
      '@poppinss/colors': 4.1.6
      '@poppinss/dumper': 0.6.5
      '@speed-highlight/core': 1.2.15
      cookie: 1.1.1
      youch-core: 0.3.3

  zod-validation-error@4.0.2(zod@3.25.76):
    dependencies:
      zod: 3.25.76

  zod@3.25.76: {}
``````

## `pnpm-workspace.yaml`

``````yaml
# Copied Sites are standalone projects and cannot inherit the monorepo policy.
minimumReleaseAge: 10080
minimumReleaseAgeIgnoreMissingTime: false
trustLockfile: false
strictDepBuilds: true
allowBuilds:
  esbuild: true
  fsevents: true
  sharp: true
  unrs-resolver: true
  workerd: true
storeDir: ${SITES_PNPM_SHARED_STORE:-.sites-runtime/pnpm-store}
cacheDir: ${SITES_PNPM_SHARED_STORE:-.sites-runtime/pnpm-store}/policy-cache
enableGlobalVirtualStore: false
# A later project-only session must not mutate a shared-store inode through node_modules.
packageImportMethod: clone-or-copy
# The explicit installer owns dependency setup, including restored workspaces.
verifyDepsBeforeRun: false
optimisticRepeatInstall: false
overrides:
  miniflare>sharp: 0.35.4
``````

## `postcss.config.mjs`

``````javascript
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
``````

## `public/favicon.svg`

``````xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="30" fill="#005A46"/>
  <path d="M18 25c2.8-4 7.2-4 10 0M36 25c2.8-4 7.2-4 10 0" fill="none" stroke="#A9D253" stroke-width="5" stroke-linecap="round"/>
  <path d="M17 37c8 11 22 11 30 0" fill="none" stroke="#A9D253" stroke-width="6" stroke-linecap="round"/>
  <path d="M49 5l1.6 4.1L55 11l-4.4 1.9L49 17l-1.6-4.1L43 11l4.4-1.9z" fill="#A9D253"/>
</svg>
``````

## `public/file.svg`

``````xml
<svg fill="none" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M14.5 13.5V5.41a1 1 0 0 0-.3-.7L9.8.29A1 1 0 0 0 9.08 0H1.5v13.5A2.5 2.5 0 0 0 4 16h8a2.5 2.5 0 0 0 2.5-2.5m-1.5 0v-7H8v-5H3v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1M9.5 5V2.12L12.38 5zM5.13 5h-.62v1.25h2.12V5zm-.62 3h7.12v1.25H4.5zm.62 3h-.62v1.25h7.12V11z" clip-rule="evenodd" fill="#666" fill-rule="evenodd"/></svg>
``````

## `public/globe.svg`

``````xml
<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><g clip-path="url(#a)"><path fill-rule="evenodd" clip-rule="evenodd" d="M10.27 14.1a6.5 6.5 0 0 0 3.67-3.45q-1.24.21-2.7.34-.31 1.83-.97 3.1M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m.48-1.52a7 7 0 0 1-.96 0H7.5a4 4 0 0 1-.84-1.32q-.38-.89-.63-2.08a40 40 0 0 0 3.92 0q-.25 1.2-.63 2.08a4 4 0 0 1-.84 1.31zm2.94-4.76q1.66-.15 2.95-.43a7 7 0 0 0 0-2.58q-1.3-.27-2.95-.43a18 18 0 0 1 0 3.44m-1.27-3.54a17 17 0 0 1 0 3.64 39 39 0 0 1-4.3 0 17 17 0 0 1 0-3.64 39 39 0 0 1 4.3 0m1.1-1.17q1.45.13 2.69.34a6.5 6.5 0 0 0-3.67-3.44q.65 1.26.98 3.1M8.48 1.5l.01.02q.41.37.84 1.31.38.89.63 2.08a40 40 0 0 0-3.92 0q.25-1.2.63-2.08a4 4 0 0 1 .85-1.32 7 7 0 0 1 .96 0m-2.75.4a6.5 6.5 0 0 0-3.67 3.44 29 29 0 0 1 2.7-.34q.31-1.83.97-3.1M4.58 6.28q-1.66.16-2.95.43a7 7 0 0 0 0 2.58q1.3.27 2.95.43a18 18 0 0 1 0-3.44m.17 4.71q-1.45-.12-2.69-.34a6.5 6.5 0 0 0 3.67 3.44q-.65-1.27-.98-3.1" fill="#666"/></g><defs><clipPath id="a"><path fill="#fff" d="M0 0h16v16H0z"/></clipPath></defs></svg>
``````

## `public/window.svg`

``````xml
<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill-rule="evenodd" clip-rule="evenodd" d="M1.5 2.5h13v10a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1zM0 1h16v11.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 0 12.5zm3.75 4.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5M7 4.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0m1.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5" fill="#666"/></svg>
``````

## `README.md`

``````markdown
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
``````

## `scripts/build-verified.sh`

``````bash
#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ "${SITES_ENV_READY:-}" != "1" ]]; then
  exec "${script_dir}/sites-env.sh" -- "$0" "$@"
fi

command -v timeout || {
  echo "build-verified.sh requires GNU timeout." >&2
  exit 69
}

vinext="${SITES_PROJECT_ROOT}/node_modules/.bin/vinext"
if [[ ! -x "${vinext}" ]]; then
  echo "vinext is unavailable. Run npm run install:ci and wait for it to finish before building." >&2
  exit 69
fi

echo "Running bounded vinext build..."
timeout \
  --signal=TERM \
  --kill-after="${SITES_BUILD_KILL_AFTER:-10s}" \
  "${SITES_BUILD_TIMEOUT:-3m}" \
  "${vinext}" build
``````

## `scripts/crear-iconos-sociales.cjs`

``````javascript
const sharp = require('sharp');

const source = '/workspace/scratch/78b83c4a3310/upload/1371a1aa-f71c-4449-aeea-d633d13e8f8d.png';
const outputDir = '/workspace/scratch/78b83c4a3310/inolvidable-kids-site/public';

const icons = [
  { name: 'facebook', cx: 191, cy: 214 },
  { name: 'instagram', cx: 447, cy: 214 },
  { name: 'youtube', cx: 831, cy: 214 },
  { name: 'whatsapp', cx: 1728, cy: 214 },
  { name: 'tiktok', cx: 704, cy: 391 },
];

async function createIcon({ name, cx, cy }) {
  const size = 76;
  const { data, info } = await sharp(source)
    .extract({ left: cx - size / 2, top: cy - size / 2, width: size, height: size })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const rgba = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0, j = 0; i < data.length; i += 3, j += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const distanceFromWhite = 255 - Math.min(r, g, b);
    const alpha = Math.max(0, Math.min(255, (distanceFromWhite - 7) * 8));
    rgba[j] = 53;
    rgba[j + 1] = 168;
    rgba[j + 2] = 121;
    rgba[j + 3] = alpha;
  }

  await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } })
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .resize({ width: 64, height: 64, fit: 'contain' })
    .png()
    .toFile(`${outputDir}/social-${name}.png`);
}

Promise.all(icons.map(createIcon)).catch((error) => {
  console.error(error);
  process.exit(1);
});
``````

## `scripts/execution-profile.mjs`

``````javascript
import { readFileSync } from "node:fs";

export function readExecutionProfile() {
  let settings;
  try {
    settings = JSON.parse(readFileSync(new URL("../.sites-runtime/execution-profile.json", import.meta.url), "utf8"));
  } catch (error) {
    // Clean clones and remote builds have no checkout-local selection.
    if (error.code === "ENOENT") return "portable";
    throw error;
  }
  if (!["managed-linux", "portable"].includes(settings?.executionProfile)) {
    throw new Error("Invalid local execution profile; rerun the Sites plugin's configure-execution-profile.mjs.");
  }
  return settings.executionProfile;
}
``````

## `scripts/install-ci.mjs`

``````javascript
import { spawnSync } from "node:child_process";
import { accessSync, constants } from "node:fs";
import path from "node:path";
import { projectRoot } from "./sites-env.mjs";
import { readExecutionProfile } from "./execution-profile.mjs";

if (!process.env.npm_execpath) {
  throw new Error("Run this installer with npm run install:ci.");
}

if (![
  "SHARP_IGNORE_GLOBAL_LIBVIPS",
  "SHARP_FORCE_GLOBAL_LIBVIPS",
  "npm_config_build_from_source",
  "NPM_CONFIG_BUILD_FROM_SOURCE",
].some((key) => key in process.env)) {
  process.env.SHARP_IGNORE_GLOBAL_LIBVIPS = "1";
}

if (readExecutionProfile() === "managed-linux") {
  const result = spawnSync("bash", [path.join(projectRoot, "scripts/install-ci.sh")], {
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  process.exit(result.status ?? 1);
}

// Invoke npm's JavaScript entrypoint, avoiding platform-specific shell shims.
const installed = spawnSync(
  process.execPath,
  [
    process.env.npm_execpath, "ci", "--prefix", projectRoot, "--workspaces=false",
    "--include=dev", "--include=optional", "--prefer-offline", "--no-audit", "--no-fund",
  ],
  { stdio: "inherit" },
);
if (installed.error) throw installed.error;
if (installed.status !== 0) process.exit(installed.status ?? 1);

try {
  accessSync(
    path.join(
      projectRoot, "node_modules", ".bin",
      process.platform === "win32" ? "vinext.cmd" : "vinext",
    ),
    process.platform === "win32" ? constants.F_OK : constants.X_OK,
  );
} catch {
  console.error("npm ci exited successfully but the local vinext executable is unavailable.");
  process.exitCode = 69;
}
``````

## `scripts/install-ci.sh`

``````bash
#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ "${SITES_ENV_READY:-}" != "1" ]]; then
  exec "${script_dir}/sites-env.sh" -- "$0" "$@"
fi

command -v flock || {
  echo "install-ci.sh requires Linux flock." >&2
  exit 69
}
command -v timeout || {
  echo "install-ci.sh requires GNU timeout." >&2
  exit 69
}
command -v curl || {
  echo "install-ci.sh requires curl for the locked-tarball preflight." >&2
  exit 69
}
command -v sha256sum || {
  echo "install-ci.sh requires sha256sum for cache and install verification." >&2
  exit 69
}

runtime_root="${SITES_RUNTIME_ROOT:-${SITES_PROJECT_ROOT}/.sites-runtime}"
expected_home="${runtime_root}/home"
expected_cache="${runtime_root}/npm-cache"

echo "[sites] validating writable install environment"
if [[ "${HOME}" != "${expected_home}" ]]; then
  echo "Expected HOME=${expected_home}, got HOME=${HOME}." >&2
  exit 78
fi
actual_cache="$(npm --prefix "${SITES_PROJECT_ROOT}" --workspaces=false config get cache)"
if [[ "${actual_cache}" != "${expected_cache}" ]]; then
  echo "Expected npm cache ${expected_cache}, got ${actual_cache}." >&2
  exit 78
fi
touch "${HOME}/.sites-write-test" "${expected_cache}/.sites-write-test"
rm -f "${HOME}/.sites-write-test" "${expected_cache}/.sites-write-test"
echo "[sites] environment passed: HOME=${HOME}, cache=${expected_cache}"

lock_file="${runtime_root}/install.lock"
exec 9>"${lock_file}"
if ! flock -n 9; then
  echo "Another dependency install is already running for ${SITES_PROJECT_ROOT}." >&2
  exit 75
fi

# Catch an installer started outside this helper. Linux exposes both its command
# line and working directory through /proc, so avoid broad process-name matches.
for process in /proc/[0-9]*; do
  pid="${process##*/}"
  [[ "${pid}" != "$$" && "${pid}" != "${PPID}" ]] || continue
  process_cwd="$(readlink -f "${process}/cwd" || true)"
  [[ "${process_cwd}" == "${SITES_PROJECT_ROOT}" ]] || continue
  process_command="$(tr '\0' ' ' <"${process}/cmdline" || true)"
  if [[ "${process_command}" == *"npm ci"* ]]; then
    echo "Another npm ci is visible in ${SITES_PROJECT_ROOT}; refusing to overlap installs." >&2
    exit 75
  fi
done

lockfile_sha256="$(sha256sum "${SITES_PROJECT_ROOT}/package-lock.json" | awk '{print $1}')"
use_seeded_cache=0
# Report seed selection separately from package cache hits or downloads.
cache_seed_result=seed_unavailable
seed_cache="${SITES_NPM_CACHE_SEED:-}"
if [[ -n "${seed_cache}" && -d "${seed_cache}" ]]; then
  seed_lockfile_sha256="$(cat "${seed_cache}/.sites-lockfile-sha256" || true)"
  if [[ "${seed_lockfile_sha256}" == "${lockfile_sha256}" ]]; then
    echo "[sites] restoring image-seeded npm cache"
    cp -a "${seed_cache}/." "${expected_cache}/"
    use_seeded_cache=1
    cache_seed_result=seed_used
    echo "[sites] image cache seed matched; registry fallback remains available"
  else
    cache_seed_result=seed_lockfile_mismatch
    echo "[sites] image cache seed does not match this lockfile; using the network path"
  fi
fi

locked_vinext_output="$({ node --input-type=module - "${SITES_PROJECT_ROOT}/package-lock.json" <<'NODE'
import { readFile } from "node:fs/promises";

const lock = JSON.parse(await readFile(process.argv[2], "utf8"));
const vinext = lock.packages?.["node_modules/vinext"];
if (!vinext?.resolved || !vinext?.integrity) {
  throw new Error("package-lock.json does not contain a resolved, integrity-pinned vinext tarball");
}
console.log(vinext.resolved);
console.log(vinext.integrity);
NODE
})" || {
  echo "Could not read the integrity-pinned vinext tarball from package-lock.json." >&2
  exit 65
}
mapfile -t locked_vinext <<<"${locked_vinext_output}"
if [[ "${#locked_vinext[@]}" -ne 2 ]]; then
  echo "Expected exactly one Vinext URL and integrity value from package-lock.json." >&2
  exit 65
fi

locked_tarball="${locked_vinext[0]}"
locked_integrity="${locked_vinext[1]}"

if [[ "${use_seeded_cache}" == "0" ]]; then
  registry="$(npm --prefix "${SITES_PROJECT_ROOT}" --workspaces=false config get registry)"
  preflight_url="$({ node --input-type=module - "${locked_tarball}" "${registry}" <<'NODE'
const locked = new URL(process.argv[2]);
const registry = new URL(process.argv[3]);
if (locked.hostname === "registry.npmjs.org") {
  locked.protocol = registry.protocol;
  locked.host = registry.host;
  locked.pathname = `${registry.pathname.replace(/\/$/, "")}${locked.pathname}`;
}
process.stdout.write(locked.href);
NODE
})" || {
  echo "Could not construct the locked-tarball preflight URL." >&2
  exit 65
  }

  preflight_dir="${runtime_root}/preflight"
  preflight_tarball="${preflight_dir}/vinext.tgz"
  mkdir -p "${preflight_dir}"

  echo "[sites] downloading the complete locked vinext tarball"
  curl \
    --fail \
    --location \
    --silent \
    --show-error \
    --retry 0 \
    --connect-timeout 15 \
    --max-time 120 \
    --output "${preflight_tarball}" \
    "${preflight_url}"

  echo "[sites] verifying locked vinext tarball integrity"
  node --input-type=module - "${preflight_tarball}" "${locked_integrity}" <<'NODE'
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const [algorithm, expected] = process.argv[3].split("-", 2);
if (!algorithm || !expected) {
  throw new Error(`unsupported integrity value: ${process.argv[3]}`);
}
const actual = createHash(algorithm)
  .update(await readFile(process.argv[2]))
  .digest("base64");
if (actual !== expected) {
  throw new Error(`vinext tarball integrity mismatch for ${algorithm}`);
}
NODE
  echo "[sites] network and integrity preflight passed"
fi

echo "[sites] running exactly one bounded npm ci"
export NPM_CONFIG_MAXSOCKETS=1
export NPM_CONFIG_FETCH_RETRIES=0
export NPM_CONFIG_FETCH_TIMEOUT=30000
npm_ci_args=(ci --prefix "${SITES_PROJECT_ROOT}" --workspaces=false --include=dev --include=optional --cache "${expected_cache}")
if [[ "${use_seeded_cache}" == "1" ]]; then
  npm_ci_args+=(--prefer-offline)
fi
timeout \
  --signal=TERM \
  --kill-after="${SITES_INSTALL_KILL_AFTER:-15s}" \
  "${SITES_INSTALL_TIMEOUT:-8m}" \
  npm "${npm_ci_args[@]}"

vinext="${SITES_PROJECT_ROOT}/node_modules/.bin/vinext"
if [[ ! -x "${vinext}" ]]; then
  echo "npm ci exited successfully but node_modules/.bin/vinext is unavailable." >&2
  exit 69
fi

node --input-type=module - "${SITES_PROJECT_ROOT}/node_modules/.sites-install.json" "${lockfile_sha256}" "${cache_seed_result}" <<'NODE'
import { constants } from "node:fs";
import { open, writeFile } from "node:fs/promises";

await writeFile(
  process.argv[2],
  `${JSON.stringify({
    lockfile_sha256: process.argv[3],
    node: process.version,
    platform: `${process.platform}-${process.arch}`,
  }, null, 2)}\n`,
);
// The measured plugin wrapper supplies an existing private file for this attempt.
// Cache telemetry must not change the install result or create arbitrary files.
const reportPath = process.env.SITES_INSTALL_REPORT_PATH;
if (reportPath) {
  let report;
  try {
    report = await open(reportPath, constants.O_WRONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
    if ((await report.stat()).isFile()) {
      await report.truncate(0);
      await report.writeFile(`${JSON.stringify({ version: 1, cache_seed: process.argv[4] })}\n`);
    }
  } catch {
    // Leave the decision unavailable rather than inventing seed use or failing setup.
  } finally {
    await report?.close().catch(() => {});
  }
}
NODE
echo "[sites] npm ci passed and vinext is available"
``````

## `scripts/install-pnpm.sh`

``````bash
#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [[ "${SITES_ENV_READY:-}" != "1" ]]; then
  exec "${script_dir}/sites-env.sh" -- "$0" "$@"
fi

require_shared=0
prepare_only=0
for argument in "$@"; do
  case "${argument}" in
    --require-shared) require_shared=1 ;;
    --prepare-store) prepare_only=1 ;;
    *) echo "Unknown pnpm installation option: ${argument}" >&2; exit 64 ;;
  esac
done

for tool in flock timeout node; do
  command -v "${tool}" >/dev/null || { echo "pnpm setup requires Linux flock, GNU timeout, and Node.js." >&2; exit 69; }
done
cache_seed=decision_unavailable
store_scope=unknown
store_state=unavailable
report_store() {
  node "${script_dir}/pnpm-install.mjs" --report-store "${cache_seed}" "${store_scope}" "${store_state}" "${prepare_only}"
}
# Publish preparation failures too; the optional report never decides success.
trap 'report_store || true' EXIT

if [[ -n "${SITES_PNPM_BIN:-}" && -f "${SITES_PNPM_BIN}" && -r "${SITES_PNPM_BIN}" ]]; then
  pnpm_command=(node "${SITES_PNPM_BIN}")
elif [[ "${require_shared}" == 1 ]]; then
  echo "[sites] the image-pinned pnpm is unavailable" >&2
  exit 69
elif command -v corepack >/dev/null; then
  # Corepack honors the established project's pin even when PATH has a different
  # pnpm version. A bare pnpm is used only if Corepack is absent, then verified.
  pnpm_command=(corepack pnpm)
elif command -v pnpm >/dev/null; then
  pnpm_command=(pnpm)
else
  echo "This pnpm project requires pnpm 11.25.0 or Corepack." >&2
  exit 69
fi

runtime_root="${SITES_RUNTIME_ROOT:-${SITES_PROJECT_ROOT}/.sites-runtime}"
private_store="${runtime_root}/pnpm-store"
if [[ "${HOME}" != "${runtime_root}/home" || -L "${private_store}" ]]; then
  echo "Dependency setup requires a project-owned writable home and pnpm store." >&2
  exit 78
fi
# A single Node process owns the regular-file descriptors for both leases.
# Closing its input (including this shell exiting) releases the project lock.
coproc SITES_INSTALL_LOCKS {
  node "${script_dir}/pnpm-install.mjs" --hold-install-locks \
    "${runtime_root}/install.lock" "${SITES_PNPM_SHARED_STORE:-}.seed.lock" \
    "${SITES_PNPM_STORE_LOCK_TIMEOUT:-30}"
}
install_lock_pid="${SITES_INSTALL_LOCKS_PID}"
install_lock_output="${SITES_INSTALL_LOCKS[0]}"
install_lock_input="${SITES_INSTALL_LOCKS[1]}"
lock_status=unavailable
read -r lock_status <&"${install_lock_output}" || true
if [[ "${lock_status}" != locked ]]; then
  exec {install_lock_input}>&-
  exec {install_lock_output}<&-
  wait "${install_lock_pid}" || true
  if [[ "${lock_status}" == busy ]]; then
    echo "Another dependency install is already running for ${SITES_PROJECT_ROOT}." >&2
    exit 75
  fi
  echo "Dependency setup requires a regular, writable project install lock." >&2
  exit 78
fi
export XDG_CACHE_HOME="${runtime_root}/xdg-cache" XDG_DATA_HOME="${runtime_root}/xdg-data"
mkdir -p "${XDG_CACHE_HOME}" "${XDG_DATA_HOME}" || exit 70
pnpm_version="$(timeout --signal=TERM --kill-after="${SITES_INSTALL_KILL_AFTER:-15s}" \
  "${SITES_PNPM_BOOTSTRAP_TIMEOUT:-30s}" "${pnpm_command[@]}" --version)"
if [[ "${pnpm_version}" != "11.25.0" ]]; then
  echo "This project requires pnpm 11.25.0 and its v11 store format." >&2
  exit 69
fi

can_write_directory() {
  local probe
  # access()/test -w can succeed even when a kernel sandbox denies a write.
  probe="$(mktemp "${1}/.sites-store-probe.XXXXXX" 2>/dev/null)" || return 1
  rm -f -- "${probe}" 2>/dev/null
}

release_shared_lock() {
  if [[ "${shared_lock_held:-}" == 1 ]]; then
    printf '%s\n' release-shared >&"${install_lock_input}"
    local status
    read -r status <&"${install_lock_output}" && [[ "${status}" == released ]] || return 70
    shared_lock_held=0
  fi
}

acquire_shared_lock() {
  # The Node holder opens this workspace-controlled entry with no-follow and
  # nonblocking flags, then verifies a regular file before bounded flock.
  printf '%s\n' shared >&"${install_lock_input}"
  local status
  if read -r status <&"${install_lock_output}" && [[ "${status}" == locked ]]; then
    shared_lock_held=1
    return 0
  fi
  return 1
}

writable_store="${private_store}"
shared_store="${SITES_PNPM_SHARED_STORE:-}"
if [[ "${shared_store}" == "/workspace/.sites-runtime/pnpm-store" &&
      ! -L "${shared_store}" && ! -L "${shared_store%/*}" &&
      -d "${shared_store%/*/*}" ]]; then
  # Normal Work already writes this owner's workspace. Narrower profiles must
  # pass the actual create probe, without widening their permissions.
  if mkdir -p "${shared_store%/*}" 2>/dev/null &&
      can_write_directory "${shared_store%/*}" &&
      acquire_shared_lock; then
    if [[ ! -L "${shared_store}" && ! -L "${shared_store%/*}" &&
          ( ! -e "${shared_store}" || ( -d "${shared_store}" && ! -L "${shared_store}" && -w "${shared_store}" ) ) ]] &&
        { [[ ! -d "${shared_store}" ]] || can_write_directory "${shared_store}"; }; then
      writable_store="${shared_store}"
      store_scope=workspace
    else
      release_shared_lock
    fi
  else
    release_shared_lock
  fi
fi
if [[ "${store_scope}" != workspace ]]; then
  if [[ "${require_shared}" == 1 ]]; then
    echo "[sites] the workspace pnpm store is unavailable" >&2
    exit 69
  fi
  store_scope=project
fi

seed="${SITES_PNPM_CACHE_SEED:-}"
cache_seed=seed_unavailable
if [[ -d "${writable_store}" ]]; then
  # Never merge a newer image seed into an existing mutable store.
  store_state=reused
  cache_seed=not_applicable
  if [[ -f "${writable_store}/.sites-pnpm-seed-applied.json" ]]; then cache_seed=seed_used; fi
else
  seed_compatible=0
  if [[ -n "${seed}" && -d "${seed}/v11" ]] && node --input-type=module - "${seed}/.sites-pnpm-seed.json" <<'NODE'
import { readFileSync, statSync } from "node:fs";
try {
  const filename = process.argv[2];
  if (statSync(filename).size > 4096) process.exit(1);
  const seed = JSON.parse(readFileSync(filename, "utf8"));
  process.exit(seed.version === 1 && seed.pnpm_version === "11.25.0" &&
    seed.store_version === "v11" && /^[a-f0-9]{64}$/.test(seed.lockfile_sha256) ? 0 : 1);
} catch { process.exit(1); }
NODE
  then seed_compatible=1; fi
  if [[ "${seed_compatible}" == 1 ]]; then
    if [[ "${prepare_only}" == 1 ]]; then
      echo "[sites] copying the image seed into the writable ${store_scope} pnpm store" >&2
    else
      echo "[sites] copying the image seed into the writable ${store_scope} pnpm store"
    fi
    seed_stage="$(mktemp -d "${writable_store}.seed.XXXXXX")" || exit 70
    trap 'if [[ -n "${seed_stage:-}" ]]; then rm -rf -- "${seed_stage}"; fi; report_store || true' EXIT
    timeout --signal=TERM --kill-after="${SITES_INSTALL_KILL_AFTER:-15s}" \
      "${SITES_PNPM_STORE_PREPARE_TIMEOUT:-60s}" bash -c \
      'cp -a --no-preserve=ownership "$1/." "$2/" && chmod -R u+rwX "$2"' _ "${seed}" "${seed_stage}" || exit 70
    cp "${seed}/.sites-pnpm-seed.json" "${seed_stage}/.sites-pnpm-seed-applied.json" || exit 70
    # An ordinary pnpm command can initialize the store without our seed lock.
    # Publish without replacing even an empty directory created by that command.
    mv -T --update=none "${seed_stage}" "${writable_store}" || exit 70
    if [[ -d "${seed_stage}" ]]; then
      if [[ -L "${writable_store}" || ! -d "${writable_store}" ]]; then exit 78; fi
      rm -rf -- "${seed_stage}" || exit 70
      store_state=reused
      cache_seed=not_applicable
      if [[ -f "${writable_store}/.sites-pnpm-seed-applied.json" ]]; then cache_seed=seed_used; fi
    else
      store_state=seeded
      cache_seed=seed_used
    fi
    seed_stage=""
  else
    mkdir -p "${writable_store}" || exit 70
    store_state=created
  fi
fi
if ! can_write_directory "${writable_store}"; then store_state=unavailable; exit 70; fi
release_shared_lock
report_store
trap - EXIT
if [[ "${prepare_only}" == 1 ]]; then exit 0; fi

# Configuration travels with source without embedding an absolute machine path.
# A later restricted session selects a private store before its frozen repair.
configured_store=.sites-runtime/pnpm-store
if [[ "${store_scope}" == workspace ]]; then
  configured_store='${SITES_PNPM_SHARED_STORE:-.sites-runtime/pnpm-store}'
elif [[ "${runtime_root}" != "${SITES_PROJECT_ROOT}/.sites-runtime" ]]; then
  configured_store='${SITES_RUNTIME_ROOT:-.sites-runtime}/pnpm-store'
fi
"${pnpm_command[@]}" config set package-import-method clone-or-copy --location project
"${pnpm_command[@]}" config set store-dir "${configured_store}" --location project
"${pnpm_command[@]}" config set cache-dir "${configured_store}/policy-cache" --location project

# CI=true lets native pnpm install rebuild modules whose store moved, without a
# prompt, --force, changing the lockfile, or translating the project into npm.
CI=true timeout --signal=TERM --kill-after="${SITES_INSTALL_KILL_AFTER:-15s}" \
  "${SITES_INSTALL_TIMEOUT:-8m}" node "${script_dir}/pnpm-install.mjs" \
  "${cache_seed}" "${store_scope}" "${store_state}" "${writable_store}" "${pnpm_command[@]}"
``````

## `scripts/pnpm-install.mjs`

``````javascript
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import {
  accessSync,
  closeSync,
  constants,
  fstatSync,
  ftruncateSync,
  openSync,
  readFileSync,
  writeFileSync,
  writeSync,
} from "node:fs";
import { constants as osConstants } from "node:os";
import path from "node:path";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";

const MAX_PACKAGES = 100_000;
const CACHE_SEEDS = new Set(["seed_used", "seed_unavailable", "seed_lockfile_mismatch", "decision_unavailable", "not_applicable"]);
const STORE_STATES = new Set(["created", "seeded", "reused", "unavailable"]);
// The caller may use operational status only for
// initial-setup fallback; an established project always retains pnpm. Broad
// fetch failures can include TLS/auth errors and stay fatal.
const OPERATIONAL_FAILURE_CODES = new Set([
  "ERR_PNPM_UNEXPECTED_STORE",
  "ERR_PNPM_UNEXPECTED_VIRTUAL_STORE",
  "ERR_PNPM_OUTDATED_LOCKFILE",
  "ERR_PNPM_FROZEN_LOCKFILE_WITH_OUTDATED_LOCKFILE",
  "ERR_PNPM_NO_LOCKFILE",
  "ERR_PNPM_FETCH_408",
  "ERR_PNPM_FETCH_429",
  "ERR_PNPM_FETCH_500",
  "ERR_PNPM_FETCH_502",
  "ERR_PNPM_FETCH_503",
  "ERR_PNPM_FETCH_504",
]);

// These are pnpm-reported package IDs, not an assertion about network bytes or
// image-cache provenance. Do not interpret an installed-tree no-op as 100% reuse.
export class InstallProgress {
  constructor(project) {
    this.project = path.resolve(project);
    this.reused = new Set();
    this.downloaded = new Set();
    this.complete = false;
    this.added = undefined;
    this.invalid = false;
  }

  accept(event) {
    if (event?.name === "pnpm:stats" && event.prefix === this.project &&
        Number.isSafeInteger(event.added) && event.added >= 0) this.added = event.added;
    if (event?.name === "pnpm:stage" && event.stage === "importing_done" &&
        event.prefix === this.project) this.complete = true;
    if (event?.name !== "pnpm:progress" || event.requester !== this.project ||
        !["fetched", "found_in_store"].includes(event.status)) return;
    if (typeof event.packageId !== "string" || !event.packageId || event.packageId.length > 4096 ||
        this.reused.size + this.downloaded.size >= MAX_PACKAGES) {
      this.invalid = true;
      return;
    }
    if (event.status === "fetched") {
      this.reused.delete(event.packageId);
      this.downloaded.add(event.packageId);
    } else if (!this.downloaded.has(event.packageId)) {
      this.reused.add(event.packageId);
    }
  }

  counts(success) {
    if (!success || !this.complete || !(this.added > 0) || this.invalid ||
        this.reused.size + this.downloaded.size === 0) return {};
    return { packages_reused: this.reused.size, packages_downloaded: this.downloaded.size };
  }
}

function openReport() {
  const report = process.env.SITES_INSTALL_REPORT_PATH;
  if (!report || !constants.O_NOFOLLOW) return undefined;
  let fd;
  try {
    fd = openSync(report, constants.O_WRONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
    if (fstatSync(fd).isFile()) return fd;
  } catch {}
  if (fd !== undefined) closeSync(fd);
  return undefined;
}

function writeReport(fd, report) {
  if (fd === undefined) return;
  try {
    const body = `${JSON.stringify(report)}\n`;
    writeSync(fd, body, 0, "utf8");
    ftruncateSync(fd, Buffer.byteLength(body));
  } catch {
    // Optional telemetry must not change installation behavior or expose its path.
  }
}

function showLine(line, progress, failure) {
  let event;
  try {
    event = JSON.parse(line);
  } catch {
    process.stdout.write(`${line}\n`);
    return;
  }
  progress.accept(event);
  if (event?.level === "error" && failure.code !== 65) {
    failure.code = event.name === "pnpm" && OPERATIONAL_FAILURE_CODES.has(event.err?.code)
      ? 70 : 65;
  }
  const message = event?.message ?? event?.err?.message;
  if (event?.name === "pnpm:lifecycle" && typeof event.line === "string") {
    process.stdout.write(`${event.line}\n`);
  } else if (typeof message === "string" && ["warn", "error", "info"].includes(event.level)) {
    const output = event.level === "error" ? process.stderr : process.stdout;
    output.write(`${message}\n`);
  }
}

async function openLock(filename, waitSeconds) {
  let fd;
  try {
    if (!filename || !constants.O_NOFOLLOW || !constants.O_NONBLOCK) throw new Error("Unsupported lock");
    fd = openSync(filename, constants.O_CREAT | constants.O_RDWR | constants.O_NOFOLLOW | constants.O_NONBLOCK, 0o600);
    if (!fstatSync(fd).isFile()) throw new Error("Expected a regular lock file");
    const child = spawn("flock", ["-w", waitSeconds, "3"], { stdio: ["ignore", "ignore", "ignore", fd] });
    const code = await new Promise((resolve) => {
      child.once("error", () => resolve(undefined));
      child.once("close", resolve);
    });
    if (code === 0) return { status: "locked", fd };
    closeSync(fd);
    return { status: code === undefined ? "unavailable" : "busy" };
  } catch {
    if (fd !== undefined) closeSync(fd);
    return { status: "unavailable" };
  }
}

async function holdInstallLocks(projectLock, sharedLock, waitSeconds) {
  // The shell holds both leases through stdin. EOF (including caller exit)
  // releases the same open file descriptions that flock locked in its child.
  const requests = createInterface({ input: process.stdin, crlfDelay: Infinity });
  const project = await openLock(projectLock, "0");
  let shared;
  try {
    process.stdout.write(`${project.status}\n`);
    for await (const request of requests) {
      if (request === "shared" && project.fd !== undefined) {
        shared ??= await openLock(sharedLock, waitSeconds);
        process.stdout.write(`${shared.status}\n`);
      } else if (request === "release-shared") {
        if (shared?.fd !== undefined) closeSync(shared.fd);
        shared = undefined;
        process.stdout.write("released\n");
      } else {
        process.stdout.write("unavailable\n");
      }
    }
  } finally {
    if (shared?.fd !== undefined) closeSync(shared.fd);
    if (project.fd !== undefined) closeSync(project.fd);
    requests.close();
  }
}

async function main() {
  const argsIn = process.argv.slice(2);
  if (argsIn[0] === "--hold-install-locks") {
    await holdInstallLocks(argsIn[1], argsIn[2], argsIn[3]);
    return;
  }
  if (argsIn[0] === "--report-store") {
    const [, cacheSeed, storeScope, storeState, stdout] = argsIn;
    if (!CACHE_SEEDS.has(cacheSeed) || !["project", "workspace", "unknown"].includes(storeScope) ||
        !STORE_STATES.has(storeState)) { process.exitCode = 64; return; }
    const report = { version: 1, cache_seed: cacheSeed, store_scope: storeScope, store_state: storeState };
    const fd = openReport();
    writeReport(fd, report);
    if (fd !== undefined) closeSync(fd);
    if (stdout === "1") process.stdout.write(`${JSON.stringify(report)}\n`);
    return;
  }
  const [cacheSeed, storeScope, storeState, store, executable, ...prefix] = argsIn;
  if (!CACHE_SEEDS.has(cacheSeed) || !["project", "workspace"].includes(storeScope) ||
      !STORE_STATES.has(storeState) || storeState === "unavailable" ||
      !store || !path.isAbsolute(store) || !executable) {
    process.stderr.write("Invalid pnpm installation arguments.\n");
    process.exitCode = 64;
    return;
  }
  const fd = openReport();
  const report = { version: 1, cache_seed: cacheSeed, store_scope: storeScope, store_state: storeState };
  writeReport(fd, report);
  const progress = new InstallProgress(process.cwd());
  const failure = {};
  const env = { ...process.env };
  delete env.SITES_INSTALL_REPORT_PATH;
  const args = [...prefix, "install", "--prod=false", "--ignore-scripts=false",
    "--frozen-lockfile", "--prefer-offline", "--store-dir", store,
    "--cache-dir", path.join(store, "policy-cache"), "--fetch-retries=0",
    "--fetch-timeout=30000", "--network-concurrency=1", "--reporter=ndjson",
    "--package-import-method=clone-or-copy"];
  let result = { code: 1, signal: null };
  let receivedSignal;
  try {
    const child = spawn(executable, args, { env, stdio: ["inherit", "pipe", "inherit"] });
    const lines = createInterface({ input: child.stdout, crlfDelay: Infinity });
    lines.on("line", (line) => showLine(line, progress, failure));
    // timeout/exec owns the inherited group. Relaying would deliver signals twice.
    const signalHandlers = ["SIGINT", "SIGHUP", "SIGTERM"].map((signal) => {
      const handler = () => { receivedSignal ??= signal; };
      process.on(signal, handler);
      return [signal, handler];
    });
    let spawnError;
    child.once("error", (error) => { spawnError = error; });
    result = await new Promise((resolve) => child.once("close", (code, signal) => {
      resolve({ code: spawnError ? (spawnError.code === "ENOENT" ? 127 : 1) : code, signal });
    }));
    for (const [signal, handler] of signalHandlers) process.removeListener(signal, handler);
    lines.close();
    result.signal ??= receivedSignal;
    if (spawnError) {
      process.stderr.write("Unable to start pnpm.\n");
      result.code = spawnError.code === "ENOENT" ? 127 : 65;
    } else if (result.code !== 0 && !result.signal) {
      result.code = failure.code ?? 65;
    }
    if (result.code === 0 && !result.signal) {
      accessSync("node_modules/.bin/vinext", constants.X_OK);
      const lock = readFileSync("pnpm-lock.yaml");
      writeFileSync("node_modules/.sites-install.json", `${JSON.stringify({
        package_manager: "pnpm@11.25.0",
        lockfile_sha256: createHash("sha256").update(lock).digest("hex"),
        node: process.version,
        platform: `${process.platform}-${process.arch}`,
      }, null, 2)}\n`);
    }
  } catch {
    process.stderr.write("Dependency setup did not produce a usable Vinext installation.\n");
    result = { code: 65, signal: receivedSignal ?? null };
  } finally {
    Object.assign(report, progress.counts(result.code === 0 && !result.signal));
    writeReport(fd, report);
    if (fd !== undefined) closeSync(fd);
  }
  if (report.packages_reused !== undefined) {
    process.stdout.write(`[sites] pnpm reused ${report.packages_reused} packages and downloaded ${report.packages_downloaded}\n`);
  }
  if (result.code === 0 && !result.signal) process.stdout.write("[sites] dependency setup passed\n");
  process.exitCode = result.signal ? 128 + (osConstants.signals[result.signal] ?? 0) : result.code ?? 1;
  if (result.signal) {
    try { process.kill(process.pid, result.signal); } catch {}
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
``````

## `scripts/preparar-logos-sociales-hd.cjs`

``````javascript
const sharp = require('sharp');

const upload = '/workspace/scratch/78b83c4a3310/upload';
const publicDir = '/workspace/scratch/78b83c4a3310/inolvidable-kids-site/public';

const logos = [
  ['Youtube Logo.png', 'social-youtube.png', '#005a46'],
  ['Facebook Logo.png', 'social-facebook.png', '#005a46'],
  ['WhatsApp Logo.png', 'social-whatsapp.png', '#005a46'],
  ['WhatsApp Logo.png', 'social-whatsapp-light.png', '#a9d253'],
  ['TikTok Logo.png', 'social-tiktok.png', '#005a46'],
  ['Instagram Logo.png', 'social-instagram.png', '#005a46'],
];

function hexToRgb(hex) {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
}

async function cleanLogo([source, target, color]) {
  const { data, info } = await sharp(`${upload}/${source}`)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const maskBuffer = Buffer.alloc(info.width * info.height);
  const targetRgb = hexToRgb(color);

  let minX = info.width;
  let minY = info.height;
  let maxX = -1;
  let maxY = -1;

  for (let i = 0; i < data.length; i += 4) {
    const sourceAlpha = data[i + 3] / 255;
    // The supplied PNGs contain solid black pixels around and inside the mark.
    // Only the colored brand shape contributes to this mask.
    const colorStrength = Math.max(data[i], data[i + 1], data[i + 2]);
    const mask = Math.max(0, Math.min(1, (colorStrength - 3) / 90));
    const alpha = Math.round(255 * sourceAlpha * mask);
    const pixel = i / 4;
    maskBuffer[pixel] = alpha;

    if (alpha > 0) {
      const x = pixel % info.width;
      const y = Math.floor(pixel / info.width);
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (maxX < minX || maxY < minY) throw new Error(`No se detectó el ícono en ${source}`);

  const resizedMask = await sharp(maskBuffer, {
    raw: { width: info.width, height: info.height, channels: 1 },
  })
    .extract({ left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 })
    .resize({ width: 192, height: 192, fit: 'contain', background: '#000000' })
    .greyscale()
    .raw()
    .toBuffer();

  // Apply the requested color only after resizing the alpha mask. This keeps
  // antialiased edges clean instead of introducing black RGB fringe pixels.
  await sharp({
    create: {
      width: 192,
      height: 192,
      channels: 3,
      background: targetRgb,
    },
  })
    .joinChannel(resizedMask, { raw: { width: 192, height: 192, channels: 1 } })
    .png({ compressionLevel: 9 })
    .toFile(`${publicDir}/${target}`);
}

Promise.all(logos.map(cleanLogo)).catch((error) => {
  console.error(error);
  process.exit(1);
});
``````

## `scripts/run-framework.mjs`

``````javascript
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { readExecutionProfile } from "./execution-profile.mjs";

const [command, ...args] = process.argv.slice(2);
if (!["dev", "build"].includes(command)) throw new Error("Expected dev or build.");
const managedLinux = readExecutionProfile() === "managed-linux";

if (managedLinux && command === "build") {
  const result = spawnSync("bash", [
    fileURLToPath(new URL("./build-verified.sh", import.meta.url)), ...args,
  ], { stdio: "inherit" });
  if (result.error) throw result.error;
  process.exit(result.status ?? 1);
}

// Import in this process so the preview owner retains its PID and signals.
const cli = new URL(managedLinux
  ? "../node_modules/vite/bin/vite.js"
  : "../node_modules/vinext/dist/cli.js", import.meta.url);
process.argv = [process.execPath, fileURLToPath(cli), command,
  ...(!managedLinux && command === "dev" ? ["--port", "5173"] : []), ...args];
await import(cli.href);
``````

## `scripts/sites-env.mjs`

``````javascript
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const runtimeRoot = process.env.SITES_RUNTIME_ROOT || path.join(projectRoot, ".sites-runtime");

process.env.CLOUDFLARE_CF_FETCH_ENABLED ||= "false";
process.env.WRANGLER_SEND_METRICS ||= "false";
process.env.WRANGLER_WRITE_LOGS ||= "false";
process.env.WRANGLER_LOG_PATH ||= path.join(runtimeRoot, "wrangler/logs");
process.env.WRANGLER_REGISTRY_PATH ||= path.join(runtimeRoot, "wrangler/dev-registry");
process.env.MINIFLARE_REGISTRY_PATH ||= path.join(runtimeRoot, "wrangler/registry");

process.chdir(projectRoot);
for (const directory of [
  path.dirname(process.env.WRANGLER_LOG_PATH),
  process.env.WRANGLER_REGISTRY_PATH,
  process.env.MINIFLARE_REGISTRY_PATH,
]) {
  mkdirSync(directory, { recursive: true });
}
``````

## `scripts/sites-env.sh`

``````bash
#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
runtime_root="${SITES_RUNTIME_ROOT:-${project_root}/.sites-runtime}"

mkdir -p \
  "${runtime_root}/home" \
  "${runtime_root}/npm-cache" \
  "${runtime_root}/xdg-config" \
  "${runtime_root}/tmp" \
  "${runtime_root}/wrangler/logs"

export SITES_ENV_READY=1
export SITES_PROJECT_ROOT="${project_root}"
export HOME="${runtime_root}/home"
export XDG_CONFIG_HOME="${runtime_root}/xdg-config"
export TMPDIR="${runtime_root}/tmp"
export WRANGLER_WRITE_LOGS=false
export WRANGLER_LOG_PATH="${runtime_root}/wrangler/logs"
export MINIFLARE_REGISTRY_PATH="${runtime_root}/wrangler/registry"

# The runtime may provide a global npm cache. Keep the image's read-only Sites
# seed separate and make this project's writable cache authoritative.
unset NPM_CONFIG_CACHE npm_config_cache || true
export npm_config_cache="${runtime_root}/npm-cache"
export npm_config_audit=false
export npm_config_fund=false
export npm_config_update_notifier=false

# The runtime already supplies the standard HTTP(S)_PROXY variables. Remove
# npm-specific aliases so npm 11 does not reinterpret or warn about them.
unset \
  npm_config_proxy \
  npm_config_http_proxy \
  npm_config_https_proxy \
  NPM_CONFIG_PROXY \
  NPM_CONFIG_HTTP_PROXY \
  NPM_CONFIG_HTTPS_PROXY \
  || true

if [[ "${1:-}" == "--" ]]; then
  shift
fi

if [[ "$#" -eq 0 ]]; then
  echo "usage: scripts/sites-env.sh -- command [args...]" >&2
  exit 64
fi

cd "${project_root}"
exec "$@"
``````

## `tsconfig.json`

``````json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": [
        "./*"
      ]
    },
    "types": [
      "node",
      "@cloudflare/workers-types"
    ]
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ],
  "exclude": [
    "node_modules",
    "examples"
  ]
}
``````

## `vendor/shadcn-tailwind-4.13.0.css`

``````css
@theme inline {
  @keyframes accordion-down {
    from {
      height: 0;
    }
    to {
      height: var(
        --radix-accordion-content-height,
        var(--accordion-panel-height, auto)
      );
    }
  }

  @keyframes accordion-up {
    from {
      height: var(
        --radix-accordion-content-height,
        var(--accordion-panel-height, auto)
      );
    }
    to {
      height: 0;
    }
  }
}

/* Custom variants */
@custom-variant data-open {
  &:where([data-state="open"]),
  &:where([data-open]:not([data-open="false"])) {
    @slot;
  }
}

@custom-variant data-closed {
  &:where([data-state="closed"]),
  &:where([data-closed]:not([data-closed="false"])) {
    @slot;
  }
}

@custom-variant data-checked {
  &:where([data-state="checked"]),
  &:where([data-checked]:not([data-checked="false"])) {
    @slot;
  }
}

@custom-variant data-unchecked {
  &:where([data-state="unchecked"]),
  &:where([data-unchecked]:not([data-unchecked="false"])) {
    @slot;
  }
}

@custom-variant data-selected {
  &:where([data-selected="true"]) {
    @slot;
  }
}

@custom-variant data-disabled {
  &:where([data-disabled="true"]),
  &:where([data-disabled]:not([data-disabled="false"])) {
    @slot;
  }
}

@custom-variant data-active {
  &:where([data-state="active"]),
  &:where([data-active]:not([data-active="false"])) {
    @slot;
  }
}

@custom-variant data-horizontal {
  &:where([data-orientation="horizontal"]) {
    @slot;
  }
}

@custom-variant data-vertical {
  &:where([data-orientation="vertical"]) {
    @slot;
  }
}

@utility no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

/* scroll-fade */
@property --scroll-fade-t {
  syntax: "<length-percentage>";
  inherits: false;
  initial-value: 0px;
}
@property --scroll-fade-b {
  syntax: "<length-percentage>";
  inherits: false;
  initial-value: 0px;
}
@property --scroll-fade-s {
  syntax: "<length-percentage>";
  inherits: false;
  initial-value: 0px;
}
@property --scroll-fade-e {
  syntax: "<length-percentage>";
  inherits: false;
  initial-value: 0px;
}
@property --scroll-fade-mask {
  syntax: "*";
  inherits: false;
}

@theme inline {
  @keyframes scroll-fade-reveal-t {
    from {
      --scroll-fade-t: 0px;
    }
    to {
      --scroll-fade-t: var(--_scroll-fade-size-t, var(--scroll-fade-size, min(12%, calc(var(--spacing) * 10))));
    }
  }
  @keyframes scroll-fade-reveal-b {
    from {
      --scroll-fade-b: var(--_scroll-fade-size-b, var(--scroll-fade-size, min(12%, calc(var(--spacing) * 10))));
    }
    to {
      --scroll-fade-b: 0px;
    }
  }
  @keyframes scroll-fade-reveal-s {
    from {
      --scroll-fade-s: 0px;
    }
    to {
      --scroll-fade-s: var(--_scroll-fade-size-s, var(--scroll-fade-size, min(12%, calc(var(--spacing) * 10))));
    }
  }
  @keyframes scroll-fade-reveal-e {
    from {
      --scroll-fade-e: var(--_scroll-fade-size-e, var(--scroll-fade-size, min(12%, calc(var(--spacing) * 10))));
    }
    to {
      --scroll-fade-e: 0px;
    }
  }
}

@utility scroll-fade {
  --_scroll-fade-size-t: var(
    --scroll-fade-t-size,
    var(--scroll-fade-size, min(12%, calc(var(--spacing) * 10)))
  );
  --_scroll-fade-size-b: var(
    --scroll-fade-b-size,
    var(--scroll-fade-size, min(12%, calc(var(--spacing) * 10)))
  );
  --scroll-fade-block: linear-gradient(
    to bottom,
    transparent 0,
    #000 var(--scroll-fade-t, 0px),
    #000 calc(100% - var(--scroll-fade-b, 0px)),
    transparent 100%
  );
  -webkit-mask-image: var(--scroll-fade-mask, var(--scroll-fade-block));
  mask-image: var(--scroll-fade-mask, var(--scroll-fade-block));
  -webkit-mask-composite: source-in;
  mask-composite: intersect;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;

  @supports (animation-timeline: scroll()) {
    animation:
      scroll-fade-reveal-t 1ms ease-in-out,
      scroll-fade-reveal-b 1ms ease-in-out;
    animation-timeline: scroll(self y), scroll(self y);
    animation-range:
      0 var(--scroll-fade-reveal, calc(var(--spacing) * 24)),
      calc(100% - var(--scroll-fade-reveal, calc(var(--spacing) * 24))) 100%;
    animation-fill-mode: both;
  }

  @supports not (animation-timeline: scroll()) {
    --scroll-fade-t: var(--_scroll-fade-size-t);
    --scroll-fade-b: var(--_scroll-fade-size-b);
  }
}

@utility scroll-fade-y {
  --_scroll-fade-size-t: var(
    --scroll-fade-t-size,
    var(--scroll-fade-size, min(12%, calc(var(--spacing) * 10)))
  );
  --_scroll-fade-size-b: var(
    --scroll-fade-b-size,
    var(--scroll-fade-size, min(12%, calc(var(--spacing) * 10)))
  );
  --scroll-fade-block: linear-gradient(
    to bottom,
    transparent 0,
    #000 var(--scroll-fade-t, 0px),
    #000 calc(100% - var(--scroll-fade-b, 0px)),
    transparent 100%
  );
  -webkit-mask-image: var(--scroll-fade-mask, var(--scroll-fade-block));
  mask-image: var(--scroll-fade-mask, var(--scroll-fade-block));
  -webkit-mask-composite: source-in;
  mask-composite: intersect;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;

  @supports (animation-timeline: scroll()) {
    animation:
      scroll-fade-reveal-t 1ms ease-in-out,
      scroll-fade-reveal-b 1ms ease-in-out;
    animation-timeline: scroll(self y), scroll(self y);
    animation-range:
      0 var(--scroll-fade-reveal, calc(var(--spacing) * 24)),
      calc(100% - var(--scroll-fade-reveal, calc(var(--spacing) * 24))) 100%;
    animation-fill-mode: both;
  }

  @supports not (animation-timeline: scroll()) {
    --scroll-fade-t: var(--_scroll-fade-size-t);
    --scroll-fade-b: var(--_scroll-fade-size-b);
  }
}

@utility scroll-fade-x {
  --_scroll-fade-size-s: var(
    --scroll-fade-s-size,
    var(--scroll-fade-size, min(12%, calc(var(--spacing) * 10)))
  );
  --_scroll-fade-size-e: var(
    --scroll-fade-e-size,
    var(--scroll-fade-size, min(12%, calc(var(--spacing) * 10)))
  );
  --scroll-fade-inline: linear-gradient(
    to right,
    transparent 0,
    #000 var(--scroll-fade-s, 0px),
    #000 calc(100% - var(--scroll-fade-e, 0px)),
    transparent 100%
  );
  &:where([dir="rtl"], [dir="rtl"] *) {
    --scroll-fade-inline: linear-gradient(
      to left,
      transparent 0,
      #000 var(--scroll-fade-s, 0px),
      #000 calc(100% - var(--scroll-fade-e, 0px)),
      transparent 100%
    );
  }
  -webkit-mask-image: var(--scroll-fade-mask, var(--scroll-fade-inline));
  mask-image: var(--scroll-fade-mask, var(--scroll-fade-inline));
  -webkit-mask-composite: source-in;
  mask-composite: intersect;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;

  @supports (animation-timeline: scroll()) {
    animation:
      scroll-fade-reveal-s 1ms ease-in-out,
      scroll-fade-reveal-e 1ms ease-in-out;
    animation-timeline: scroll(self inline), scroll(self inline);
    animation-range:
      0 var(--scroll-fade-reveal, calc(var(--spacing) * 24)),
      calc(100% - var(--scroll-fade-reveal, calc(var(--spacing) * 24))) 100%;
    animation-fill-mode: both;
  }

  @supports not (animation-timeline: scroll()) {
    --scroll-fade-s: var(--_scroll-fade-size-s);
    --scroll-fade-e: var(--_scroll-fade-size-e);
  }
}

@utility scroll-fade-t {
  --_scroll-fade-size-t: var(
    --scroll-fade-t-size,
    var(--scroll-fade-size, min(12%, calc(var(--spacing) * 10)))
  );
  --scroll-fade-mask: linear-gradient(
    to bottom,
    transparent 0,
    #000 var(--scroll-fade-t, 0px),
    #000 100%
  );
  -webkit-mask-image: var(--scroll-fade-mask);
  mask-image: var(--scroll-fade-mask);
  -webkit-mask-composite: source-in;
  mask-composite: intersect;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;

  @supports (animation-timeline: scroll()) {
    animation: scroll-fade-reveal-t 1ms ease-in-out;
    animation-timeline: scroll(self y);
    animation-range: 0 var(--scroll-fade-reveal, calc(var(--spacing) * 24));
    animation-fill-mode: both;
  }

  @supports not (animation-timeline: scroll()) {
    --scroll-fade-t: var(--_scroll-fade-size-t);
  }
}

@utility scroll-fade-b {
  --_scroll-fade-size-b: var(
    --scroll-fade-b-size,
    var(--scroll-fade-size, min(12%, calc(var(--spacing) * 10)))
  );
  --scroll-fade-mask: linear-gradient(
    to bottom,
    #000 0,
    #000 calc(100% - var(--scroll-fade-b, 0px)),
    transparent 100%
  );
  -webkit-mask-image: var(--scroll-fade-mask);
  mask-image: var(--scroll-fade-mask);
  -webkit-mask-composite: source-in;
  mask-composite: intersect;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;

  @supports (animation-timeline: scroll()) {
    animation: scroll-fade-reveal-b 1ms ease-in-out;
    animation-timeline: scroll(self y);
    animation-range: calc(
        100% - var(--scroll-fade-reveal, calc(var(--spacing) * 24))
      )
      100%;
    animation-fill-mode: both;
  }

  @supports not (animation-timeline: scroll()) {
    --scroll-fade-b: var(--_scroll-fade-size-b);
  }
}

@utility scroll-fade-l {
  --_scroll-fade-size-s: var(
    --scroll-fade-s-size,
    var(--scroll-fade-size, min(12%, calc(var(--spacing) * 10)))
  );
  --scroll-fade-mask: linear-gradient(
    to right,
    transparent 0,
    #000 var(--scroll-fade-s, 0px),
    #000 100%
  );
  -webkit-mask-image: var(--scroll-fade-mask);
  mask-image: var(--scroll-fade-mask);
  -webkit-mask-composite: source-in;
  mask-composite: intersect;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;

  @supports (animation-timeline: scroll()) {
    animation: scroll-fade-reveal-s 1ms ease-in-out;
    animation-timeline: scroll(self x);
    animation-range: 0 var(--scroll-fade-reveal, calc(var(--spacing) * 24));
    animation-fill-mode: both;
  }

  @supports not (animation-timeline: scroll()) {
    --scroll-fade-s: var(--_scroll-fade-size-s);
  }
}

@utility scroll-fade-r {
  --_scroll-fade-size-e: var(
    --scroll-fade-e-size,
    var(--scroll-fade-size, min(12%, calc(var(--spacing) * 10)))
  );
  --scroll-fade-mask: linear-gradient(
    to right,
    #000 0,
    #000 calc(100% - var(--scroll-fade-e, 0px)),
    transparent 100%
  );
  -webkit-mask-image: var(--scroll-fade-mask);
  mask-image: var(--scroll-fade-mask);
  -webkit-mask-composite: source-in;
  mask-composite: intersect;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;

  @supports (animation-timeline: scroll()) {
    animation: scroll-fade-reveal-e 1ms ease-in-out;
    animation-timeline: scroll(self x);
    animation-range: calc(
        100% - var(--scroll-fade-reveal, calc(var(--spacing) * 24))
      )
      100%;
    animation-fill-mode: both;
  }

  @supports not (animation-timeline: scroll()) {
    --scroll-fade-e: var(--_scroll-fade-size-e);
  }
}

@utility scroll-fade-s {
  --_scroll-fade-size-s: var(
    --scroll-fade-s-size,
    var(--scroll-fade-size, min(12%, calc(var(--spacing) * 10)))
  );
  --scroll-fade-mask: linear-gradient(
    to right,
    transparent 0,
    #000 var(--scroll-fade-s, 0px),
    #000 100%
  );
  &:where([dir="rtl"], [dir="rtl"] *) {
    --scroll-fade-mask: linear-gradient(
      to left,
      transparent 0,
      #000 var(--scroll-fade-s, 0px),
      #000 100%
    );
  }
  -webkit-mask-image: var(--scroll-fade-mask);
  mask-image: var(--scroll-fade-mask);
  -webkit-mask-composite: source-in;
  mask-composite: intersect;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;

  @supports (animation-timeline: scroll()) {
    animation: scroll-fade-reveal-s 1ms ease-in-out;
    animation-timeline: scroll(self inline);
    animation-range: 0 var(--scroll-fade-reveal, calc(var(--spacing) * 24));
    animation-fill-mode: both;
  }

  @supports not (animation-timeline: scroll()) {
    --scroll-fade-s: var(--_scroll-fade-size-s);
  }
}

@utility scroll-fade-e {
  --_scroll-fade-size-e: var(
    --scroll-fade-e-size,
    var(--scroll-fade-size, min(12%, calc(var(--spacing) * 10)))
  );
  --scroll-fade-mask: linear-gradient(
    to right,
    #000 0,
    #000 calc(100% - var(--scroll-fade-e, 0px)),
    transparent 100%
  );
  &:where([dir="rtl"], [dir="rtl"] *) {
    --scroll-fade-mask: linear-gradient(
      to left,
      #000 0,
      #000 calc(100% - var(--scroll-fade-e, 0px)),
      transparent 100%
    );
  }
  -webkit-mask-image: var(--scroll-fade-mask);
  mask-image: var(--scroll-fade-mask);
  -webkit-mask-composite: source-in;
  mask-composite: intersect;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;

  @supports (animation-timeline: scroll()) {
    animation: scroll-fade-reveal-e 1ms ease-in-out;
    animation-timeline: scroll(self inline);
    animation-range: calc(
        100% - var(--scroll-fade-reveal, calc(var(--spacing) * 24))
      )
      100%;
    animation-fill-mode: both;
  }

  @supports not (animation-timeline: scroll()) {
    --scroll-fade-e: var(--_scroll-fade-size-e);
  }
}

@utility scroll-fade-* {
  --scroll-fade-size: calc(var(--spacing) * --value(integer));
  --scroll-fade-size: --value([length], [percentage]);
}

@utility scroll-fade-t-* {
  --scroll-fade-t-size: calc(var(--spacing) * --value(integer));
  --scroll-fade-t-size: --value([length], [percentage]);
}

@utility scroll-fade-b-* {
  --scroll-fade-b-size: calc(var(--spacing) * --value(integer));
  --scroll-fade-b-size: --value([length], [percentage]);
}

@utility scroll-fade-s-* {
  --scroll-fade-s-size: calc(var(--spacing) * --value(integer));
  --scroll-fade-s-size: --value([length], [percentage]);
}

@utility scroll-fade-e-* {
  --scroll-fade-e-size: calc(var(--spacing) * --value(integer));
  --scroll-fade-e-size: --value([length], [percentage]);
}

@utility scroll-fade-none {
  --scroll-fade-mask: none;
}

/* shimmer */
@property --shimmer-angle {
  syntax: "<angle>";
  inherits: true;
  initial-value: 20deg;
}
@property --shimmer-image {
  syntax: "*";
  inherits: false;
}
@property --shimmer-text-fill {
  syntax: "*";
  inherits: false;
}

@theme inline {
  @keyframes tw-shimmer {
    from {
      background-position: 100% 0;
    }
    to {
      background-position: 0 0;
    }
  }
}

@utility shimmer {
  --_spread: var(--shimmer-spread, calc(3ch + 40px));
  --_base: currentColor;
  --_highlight: var(
    --shimmer-color,
    oklch(from currentColor l c h / calc(alpha* 0.2))
  );

  background-image: var(
    --shimmer-image,
    linear-gradient(
      calc(90deg + var(--shimmer-angle)),
      var(--_base) calc(50% - var(--_spread)),
      color-mix(in oklch, var(--_highlight), var(--_base) 50%)
        calc(50% - var(--_spread) * 0.5),
      var(--_highlight) 50%,
      color-mix(in oklch, var(--_highlight), var(--_base) 50%)
        calc(50% + var(--_spread) * 0.5),
      var(--_base) calc(50% + var(--_spread))
    )
  );
  background-repeat: no-repeat;
  background-size: calc(200% + var(--_spread) * 2) 100%;
  background-position: 0 0;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: var(--shimmer-text-fill, transparent);
  animation: tw-shimmer var(--shimmer-duration, 2s) linear infinite;

  @variant dark {
    --_highlight: var(
      --shimmer-color,
      oklch(from currentColor max(0.8, calc(l + 0.4)) c h / calc(alpha + 0.4))
    );
  }

  &:where([dir="rtl"], [dir="rtl"] *) {
    animation-direction: reverse;
  }
}

@utility shimmer-once {
  animation-iteration-count: 1;
}

@utility shimmer-reverse {
  animation-direction: reverse;
}

@utility shimmer-none {
  --shimmer-image: none;
  --shimmer-text-fill: currentColor;
}

@utility shimmer-color-* {
  --shimmer-color: --value(--color, [color]);
  --shimmer-color: color-mix(
    in oklch,
    --value(--color, [color]) calc(--modifier(integer) * 1%),
    transparent
  );
}

@utility shimmer-duration-* {
  --shimmer-duration: calc(--value(integer) * 1ms);
}

@utility shimmer-spread-* {
  --shimmer-spread: calc(var(--spacing) * --value(integer));
  --shimmer-spread: --value([length], [percentage]);
}

@utility shimmer-angle-* {
  --shimmer-angle: calc(--value(integer) * 1deg);
}

@media (prefers-reduced-motion: reduce) {
  .shimmer {
    animation: none;
    background-image: none;
    -webkit-text-fill-color: currentColor;
  }
}
``````

## `vendor/shadcn-tailwind-4.13.0.LICENSE.md`

``````markdown
MIT License

Copyright (c) 2023 shadcn

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
``````

## `vite.config.ts`

``````typescript
import vinext from "vinext";
import { defineConfig } from "vite";
import hostingConfig from "./.openai/hosting.json";
import { readExecutionProfile } from "./scripts/execution-profile.mjs";
import { sites } from "./build/sites-vite-plugin";

const SITE_CREATOR_PLACEHOLDER_DATABASE_ID =
  "00000000-0000-4000-8000-000000000000";

const { d1, r2 } = hostingConfig;

// macOS Seatbelt blocks FSEvents, so Codex previews need polling for HMR.
const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === "seatbelt";
const managedLinux = readExecutionProfile() === "managed-linux";

const localBindingConfig = {
  main: "vinext/server/fetch-handler",
  compatibility_flags: ["nodejs_compat"],
  d1_databases: d1
    ? [
        {
          binding: d1,
          database_name: "site-creator-d1",
          database_id: SITE_CREATOR_PLACEHOLDER_DATABASE_ID,
        },
      ]
    : [],
  r2_buckets: r2
    ? [
        {
          binding: r2,
          bucket_name: "site-creator-r2",
        },
      ]
    : [],
};

export default defineConfig(async () => {
  // Use Miniflare's local Request.cf placeholder unless fetching is requested.
  process.env.CLOUDFLARE_CF_FETCH_ENABLED ??= "false";
  process.env.WRANGLER_SEND_METRICS ??= "false";

  // Keep Wrangler and Miniflare state project-local. These are non-secret tool
  // settings; application environment belongs in ignored `.env*` files.
  process.env.WRANGLER_WRITE_LOGS ??= "false";
  process.env.WRANGLER_LOG_PATH ??= ".wrangler/logs";
  process.env.WRANGLER_REGISTRY_PATH ??= ".wrangler/dev-registry";
  process.env.MINIFLARE_REGISTRY_PATH ??= ".wrangler/registry";

  // Wrangler snapshots its log path while the Cloudflare plugin is imported.
  const { cloudflare } = await import("@cloudflare/vite-plugin");

  return {
    server: {
      ...(managedLinux ? { host: "0.0.0.0", allowedHosts: ["terminal.local"] } : {}),
      ...(isCodexSeatbeltSandbox ? { watch: { useFsEvents: false, usePolling: true } } : {}),
    },
    plugins: [
      vinext(),
      sites({ mockAuth: !managedLinux }),
      cloudflare({
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
        inspectorPort: false,
        config: localBindingConfig,
      }),
    ],
  };
});
``````

## Archivos binarios incluidos

- `public/inolvidable-icon.png`
- `public/juego-cama-elastica-cutout.png`
- `public/juego-cama-elastica.webp`
- `public/juego-metegol-detalle.webp`
- `public/juego-metegol-estadio-cutout.png`
- `public/juego-metegol-estadio.webp`
- `public/juego-metegol.webp`
- `public/juego-pelotero-cutout.png`
- `public/juego-pelotero.webp`
- `public/marca-estadio.png`
- `public/marca-fabrica-inflables.png`
- `public/marca-gadnic.png`
- `public/social-facebook.png`
- `public/social-instagram.png`
- `public/social-tiktok.png`
- `public/social-whatsapp-light.png`
- `public/social-whatsapp.png`
- `public/social-youtube.png`
- `public/testimonios-madres-muestra.png`
