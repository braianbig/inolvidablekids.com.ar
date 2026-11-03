export const env: Cloudflare.Env = {};
export const jobs: Promise<unknown>[] = [];
export function waitUntil(job: Promise<unknown>) { jobs.push(job); }
