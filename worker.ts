import handler from "vinext/server/fetch-handler";
import { syncPendingConsultations } from "./lib/server/google-sheets";

export default {
  fetch: handler.fetch,
  async scheduled(_controller: ScheduledController, env: Cloudflare.Env) {
    await syncPendingConsultations(env);
  },
};
