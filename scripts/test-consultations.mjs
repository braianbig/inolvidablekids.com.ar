import { createRequire } from "node:module";
import { mkdtempSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

// Use the bundler already shipped with the project's pinned Wrangler dependency.
const require = createRequire(realpathSync("node_modules/wrangler/package.json"));
const { build } = require("esbuild");
const directory = mkdtempSync(join(tmpdir(), "ik-consultations-"));
try {
  const outfile = join(directory, "consultation.test.mjs");
  await build({ entryPoints: ["tests/consultation.test.ts"], outfile, bundle: true, platform: "node", format: "esm", alias: { "cloudflare:workers": "./tests/cloudflare-stub.ts" } });
  const result = spawnSync(process.execPath, ["--test", outfile], { stdio: "inherit" });
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
} finally { rmSync(directory, { recursive: true, force: true }); }
