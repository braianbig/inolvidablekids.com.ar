import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const configPath = fileURLToPath(new URL("../dist/server/wrangler.json", import.meta.url));
const config = JSON.parse(readFileSync(configPath, "utf8"));
config.name = "inolvidablekids-com-ar";
const binding = {
  binding: "DB",
  database_name: "inolvidable-kids-solicitudes",
  database_id: "7449ae61-4a46-478b-ab12-ddfd38ec7904",
};

// Vinext recrea este archivo en cada build; the deployed Worker must use
// the existing production database instead of its preview placeholder.
config.d1_databases = [binding];
// Preserve dashboard-managed variables without publishing private file IDs.
config.keep_vars = true;
// Runtime secret GOOGLE_SERVICE_ACCOUNT_JSON is kept in Cloudflare, never here.
config.triggers = { ...config.triggers, crons: ["*/5 * * * *"] };
writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n");
console.log("Configured the D1 binding for the production Worker.");
