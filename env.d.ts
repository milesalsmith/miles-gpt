/* eslint-disable */
// Hand-written. Regenerate with `npm run types` once `wrangler types` has
// been run against this project for the first time.
declare namespace Cloudflare {
  interface Env {
    AI: Ai;
    Bleeps: DurableObjectNamespace<import("./src/server").Bleeps>;
    // Tier 1 — Dynamic Worker loader for sandboxed code execution (codemode).
    LOADER: WorkerLoader;
  }
}
interface Env extends Cloudflare.Env {}
