# Vibe Coding Workshop — Build a THINK Agent on Cloudflare

**Duration:** 90 minutes  
**Format:** Hands-on live build ("vibe coding" — code alongside an AI assistant)  
**Outcome:** Every attendee leaves with a deployed, streaming, persistent AI agent that can **write and run its own code** (Tier 0 → Tier 1 of the execution ladder)  
**Facilitator reference agent:** Bleeps — https://bleeps-agent.buildaflare.workers.dev  
**Source blog:** https://blog.cloudflare.com/project-think/

> This is the **facilitator's runsheet**. It contains timing, exact commands,
> code blocks, checkpoints, demo prompts, speaker notes, and troubleshooting.
> Everything an attendee needs to go from empty folder to a Tier-1 agent.

---

## The Big Idea (your opening framing)

Cloudflare's **Project Think** is built on one thesis: **agents are infrastructure.**

Three waves of AI:
1. **Chatbots** — stateless, reactive, fragile. Answer questions, forget everything.
2. **Coding agents** (Claude Code, Codex, etc.) — stateful, tool-using, powerful... but they run on *your laptop*, for *one user*, with *no durability*.
3. **Agents as infrastructure** — durable, distributed, serverless, safe by construction. Run on the Internet, survive failures, cost $0 when idle.

The **execution ladder** is how a Think agent grows in capability. Each tier is additive — the agent is useful at Tier 0 alone:

| Tier | Capability | Powered by | Workshop |
|------|-----------|------------|----------|
| **0** | Workspace — durable filesystem (read/write/grep/find) | `@cloudflare/shell` | ✅ **We build this** |
| **1** | Code execution — LLM writes JS, runs in a sandbox | `@cloudflare/codemode` + Dynamic Workers | ✅ **We build this** |
| **2** | npm — `import` any package at runtime | `@cloudflare/worker-bundler` | 🎨 Art of the possible |
| **3** | Browser — navigate, scrape, screenshot | Browser Run | 🎨 Art of the possible |
| **4** | Full OS — git, compilers, test runners | Cloudflare Sandbox | 🎨 Art of the possible |

**Today:** We build Tiers 0 and 1 live. We paint Tiers 2–4 as the art of the possible.

---

## Timing Breakdown (90 minutes)

| Time | Segment | What happens |
|------|---------|--------------|
| **0:00–0:10** | **Intro + "Here's one I made earlier"** | Framing, demo the live Bleeps agent |
| **0:10–0:20** | **Setup** | Scaffold the project, install deps, confirm login |
| **0:20–0:45** | **Tier 0 — The Agent** | 3-line agent → personality → memory → workspace → deploy |
| **0:45–1:10** | **Tier 1 — Code Execution** | Add codemode, the "write code not 50 tool calls" demo |
| **1:10–1:25** | **Art of the Possible** | Tiers 2/3/4 + extensions + sub-agents (talk + show) |
| **1:25–1:30** | **Wrap + Q&A** | Recap, resources, next steps |

---

## Prerequisites (send to attendees BEFORE the workshop)

> ⚠️ **CRITICAL: Attendees must be logged into wrangler before they arrive.**
> A Think agent uses **Workers AI**, which runs remotely. Local dev (`npm run dev`)
> establishes a remote proxy session at boot — **this fails if wrangler is not
> logged in.** (We learned this the hard way; see Troubleshooting.)

**Required:**
- Node 20+ (`node --version`)
- A Cloudflare account (free tier is fine)
- Wrangler logged in: `npx wrangler login` → complete the browser OAuth flow
- Verify with: `npx wrangler whoami` → should show your account, **not** an auth error
- A code editor with an AI assistant (Cursor, VS Code + Copilot, opencode, etc.) — this is "vibe coding"
- ~10 minutes of pre-reading: skim the [Project Think blog post](https://blog.cloudflare.com/project-think/)

**Pre-flight check (run this the morning of):**
```bash
node --version            # v20+
npx wrangler whoami       # shows your email/account, no 400 error
```

---

## Segment 1 — Intro + "Here's One I Made Earlier" (0:00–0:10)

### Talk track (3 min)
- Open with the three waves (above).
- "Today you'll build an agent that isn't a chatbot. It remembers. It owns a filesystem. And by the end, it writes and runs its own code in a sandbox."

### Live demo of Bleeps (5 min)
Open https://bleeps-agent.buildaflare.workers.dev and run these **in order**:

1. **Persistence:** Type `My name is [your name] and I'm running a workshop today.`
   → Then **refresh the page** → Type `What am I doing today?` → It remembers.

2. **Workspace:** Type `Make a note: the workshop has 20 attendees.`
   → Then `What did I note about attendees?` → It greps its own files.

3. **Tier 1 (the wow):** Type
   `Write and run a script that creates 5 notes named /demo/note-1.md through /demo/note-5.md, each containing its own number doubled. Then tell me the contents.`
   → Watch it **write a program and execute it in a sandbox** — one turn, not 5 tool calls.

### Transition (2 min)
"That agent is ~120 lines of code. The platform does the rest. Let's build it."

---

## Segment 2 — Setup (0:10–0:20)

### Scaffold the project
```bash
npm create cloudflare@latest think-agent -- --type=hello-world --ts --no-deploy
cd think-agent
```

> Or for speed, have attendees clone a starter. But scaffolding live reinforces
> that this is just a Worker.

### Install the Think stack
```bash
npm install @cloudflare/think @cloudflare/ai-chat agents ai @cloudflare/shell zod workers-ai-provider
npm install -D @cloudflare/vite-plugin @vitejs/plugin-react react react-dom @types/react @types/react-dom
```

### Configure `wrangler.jsonc`
```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "think-agent",
  "main": "src/server.ts",
  "compatibility_date": "2026-05-29",
  "compatibility_flags": ["nodejs_compat"],

  "ai": { "binding": "AI" },

  "durable_objects": {
    "bindings": [{ "class_name": "MyAgent", "name": "MyAgent" }]
  },

  "migrations": [
    { "tag": "v1", "new_sqlite_classes": ["MyAgent"] }
  ]
}
```

### Checkpoint ✅
By 0:20 everyone has: a folder, dependencies installed, a wrangler config, and `wrangler whoami` working.

---

## Segment 3 — Tier 0: The Agent (0:20–0:45)

### Step 1 — The 3-line agent (5 min)

`src/server.ts`:
```typescript
import { Think } from "@cloudflare/think";
import { createWorkersAI } from "workers-ai-provider";
import { routeAgentRequest } from "agents";

export class MyAgent extends Think<Env> {
  getModel() {
    return createWorkersAI({ binding: this.env.AI })(
      "@cf/moonshotai/kimi-k2.6"
    );
  }
}

export default {
  async fetch(request: Request, env: Env) {
    return (
      (await routeAgentRequest(request, env)) ||
      new Response("Not found", { status: 404 })
    );
  }
} satisfies ExportedHandler<Env>;
```

**Speaker note:** "That's a complete, working, streaming, persistent chat agent.
Three lines of real logic. Think handles the WebSocket protocol, message
persistence, the agentic loop, streaming, and crash recovery."

### Step 2 — Give it a personality + memory (8 min)

Add a soul and a self-writable memory block:
```typescript
const SOUL = `You are a friendly, concise workshop assistant. Be warm and
a little playful. You have a persistent memory — when you learn something
durable about the user, call set_context to remember it.`;

export class MyAgent extends Think<Env> {
  getModel() {
    return createWorkersAI({ binding: this.env.AI })("@cf/moonshotai/kimi-k2.6");
  }

  configureSession(session: Session) {
    return session
      .withContext("soul", { provider: { get: async () => SOUL } })
      .withContext("memory", {
        description: "Durable facts about the user. Update via set_context.",
        maxTokens: 2000
      })
      .withCachedPrompt();
  }
}
```
(Add `type Session` to the Think import.)

**Speaker note:** "Two context blocks. `soul` is static personality. `memory` is
a scratchpad **the model writes to itself**. This is long-term memory as durable
prompt sections — no vector DB, no RAG plumbing."

### Step 3 — The client (7 min)

`index.html`:
```html
<!doctype html>
<html lang="en">
  <head><meta charset="UTF-8" /><title>My Agent</title></head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/client/main.tsx"></script>
  </body>
</html>
```

`src/client/main.tsx`:
```typescript
import { createRoot } from "react-dom/client";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(<App />);
```

`src/client/App.tsx`:
```typescript
import { useAgent } from "agents/react";
import { useAgentChat } from "@cloudflare/ai-chat/react";
import { useState } from "react";

export function App() {
  const agent = useAgent({ agent: "MyAgent", name: "main" });
  const { messages, sendMessage, status } = useAgentChat({ agent });
  const [input, setInput] = useState("");

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", fontFamily: "monospace" }}>
      <h1>My Agent</h1>
      {messages.map((m) => (
        <div key={m.id}><b>{m.role}:</b> {m.parts.map((p, i) =>
          p.type === "text" ? <span key={i}>{p.text}</span> : null)}</div>
      ))}
      <form onSubmit={(e) => { e.preventDefault(); sendMessage({ text: input }); setInput(""); }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} autoFocus />
        <button disabled={status === "streaming"}>Send</button>
      </form>
    </div>
  );
}
```

`vite.config.ts`:
```typescript
import { cloudflare } from "@cloudflare/vite-plugin";
import react from "@vitejs/plugin-react";
import agents from "agents/vite";
import { defineConfig } from "vite";

export default defineConfig({ plugins: [agents(), react(), cloudflare()] });
```

### Step 4 — Run it (5 min)
```bash
npm run dev
```
Open http://localhost:5173.

**Demo prompts:**
- `My name is Alex.` → refresh → `What's my name?` → it remembers.
- `Remember a note that the demo went well.` → it writes to its workspace.

### Checkpoint ✅ (0:45)
Everyone has a streaming agent with personality, memory, and a workspace. **This is Tier 0.** The workspace tools (`read`/`write`/`edit`/`grep`/`find`/`list`/`delete`) are auto-exposed to the model — no code needed.

---

## Segment 4 — Tier 1: Code Execution (0:45–1:10)

### The pitch (3 min)
"Tool-calling has an awkward shape: call a tool, pull the result back through the
model, call another, pull it back. 100 files = 100 round-trips. **Models are
better at writing code than playing the tool-calling game.** Tier 1 lets the
model write ONE program that orchestrates everything — and it runs in a
sandboxed Dynamic Worker with **no network access by default.**"

### Step 1 — Add the loader binding (3 min)

In `wrangler.jsonc`, add:
```jsonc
"worker_loaders": [{ "binding": "LOADER" }],
```

And add to your `Env` type (or `env.d.ts`):
```typescript
LOADER: WorkerLoader;
```

### Step 2 — Wire the execute tool (7 min)

In `src/server.ts`:
```typescript
import { createExecuteTool } from "@cloudflare/think/tools/execute";
import { createWorkspaceTools } from "@cloudflare/think/tools/workspace";
import type { ToolSet } from "ai";

export class MyAgent extends Think<Env> {
  getModel() { /* ... unchanged ... */ }

  getTools(): ToolSet {
    return {
      execute: createExecuteTool({
        tools: createWorkspaceTools(this.workspace),
        loader: this.env.LOADER
        // globalOutbound defaults to null → sandbox has NO network access
      })
    };
  }

  configureSession(session: Session) { /* ... unchanged ... */ }
}
```

Update the soul so the model knows it can write code:
```typescript
const SOUL = `...
You have an EXECUTE tool that runs JavaScript in a secure sandbox. Inside it,
call your workspace tools as codemode.read(...), codemode.write(...),
codemode.grep(...), etc. Prefer ONE execute program over many tool calls
when counting, aggregating, or transforming across files.`;
```

### Step 3 — Restart and demo (10 min)
```bash
npm run dev
```

**The killer demo prompt:**
```
Create 10 notes in /numbers/ named 1.md through 10.md, each containing that
number squared. Then write a script that reads all of them and returns the
sum of every value.
```

**What attendees see:** The model writes a single JS program using
`codemode.write` and `codemode.read` in a loop, runs it in the sandbox, and
returns the sum — in one turn. Have them compare mentally to doing this as 20+
individual tool calls.

**Second demo (data work):**
```
I have notes scattered in my workspace. Write a script that finds every file
containing the word "TODO" and returns a table of filename → count of TODOs.
```

### Checkpoint ✅ (1:10)
Everyone has a **Tier 1 agent**. It writes and executes code in a sandbox. This is the single biggest capability jump in the ladder.

### Deploy it (if time / as homework)
```bash
npm run deploy
```
Gives each attendee their own `*.workers.dev` URL.

---

## Segment 5 — Art of the Possible (1:10–1:25)

Now **paint the vision.** You don't build these live — you show the code shape
and explain what each unlocks. Each is "one more binding + one more tool factory."

### Tier 2 — npm in the sandbox (3 min)
> "The agent writes `import { z } from 'zod'` and it just works."

`@cloudflare/worker-bundler` fetches packages from npm, bundles with esbuild,
loads into the Dynamic Worker. The agent can use real libraries — date parsing,
CSV, crypto — at runtime, no pre-bundling.

### Tier 3 — Browser Run (4 min)
```typescript
import { createBrowserTools } from "@cloudflare/think/tools/browser";

getTools() {
  return {
    ...createBrowserTools({ browser: this.env.BROWSER, loader: this.env.LOADER })
  };
}
```
> "Now the agent can navigate, click, scrape, and screenshot live web pages via
> the Chrome DevTools Protocol. Useful when a service has no API or MCP server."

**Demo idea (show on Bleeps roadmap, or live if you have BROWSER):**
"Screenshot example.com and tell me the headline."

### Tier 4 — Cloudflare Sandbox (3 min)
```typescript
import { createSandboxTools } from "@cloudflare/think/tools/sandbox";
// ...createSandboxTools(this.env.SANDBOX)
```
> "Full OS. `git clone`, `npm test`, `cargo build`. The agent gets a real
> machine, synced with its workspace. This is where it becomes a true coding
> agent."

### Beyond the ladder: two more "wow" primitives (5 min)

**Self-authored extensions** — the agent writes its OWN tools at runtime:
```typescript
import { createExtensionTools } from "@cloudflare/think/tools/extensions";

export class MyAgent extends Think<Env> {
  extensionLoader = this.env.LOADER;
  getTools() {
    return {
      ...createExtensionTools({ manager: this.extensionManager! }),
      ...this.extensionManager!.getTools()
    };
  }
}
```
> "Ask it to integrate GitHub. It writes a GitHub extension, declares
> `network: ['api.github.com']`, loads it, and now has a `github_create_pr`
> tool that didn't exist 30 seconds ago. It persists. The agent improves itself
> — through code, not fine-tuning."

**Sub-agents** — delegation via Facets:
```typescript
const researcher = await this.subAgent(ResearchAgent, "research");
const result = await researcher.chat(`Research: ${task}`, streamRelay);
```
> "A team of specialist agents, each with its own SQLite and memory, running in
> parallel. The orchestrator delegates and merges."

---

## Segment 6 — Wrap + Q&A (1:25–1:30)

### Recap
- You built a **Tier 0** agent (persistent, streaming, workspace) in ~30 min.
- You added **Tier 1** (sandboxed code execution) in ~25 min.
- You saw the path to **Tiers 2–4** + extensions + sub-agents.
- The whole agent is ~120 lines. **The capabilities live in the bindings, not the code.**

### The closing line
> "You didn't build a chatbot. You composed infrastructure that thinks,
> remembers, acts, and can write its own code — from primitives that were
> already on the edge. That's the third wave."

### Resources (share the slide / link)
- Project Think blog: https://blog.cloudflare.com/project-think/
- Think docs: https://developers.cloudflare.com/agents/api-reference/think/
- Codemode: https://github.com/cloudflare/agents/tree/main/packages/codemode
- Full assistant example: https://github.com/cloudflare/agents/tree/main/examples/assistant

---

## Troubleshooting (keep this open during the workshop)

### ❌ "You must be logged in to use wrangler dev in remote mode"
**Cause:** Not logged into wrangler. A Think agent's AI binding runs remotely;
the dev server starts a remote proxy session at boot.
**Fix:** `npx wrangler login`, complete the browser flow, verify with
`npx wrangler whoami`. This is the #1 issue — check it in pre-flight.

### ❌ Dev server won't boot after adding `worker_loaders`
**Cause:** Same as above — adding the loader binding makes the remote-proxy
requirement bite if you're logged out. The binding itself is fine locally.
**Fix:** Log in. (If you only want to show the UI offline, you *can* pass
`cloudflare({ remoteBindings: false })` in `vite.config.ts`, but then the model
won't respond — only do this for a UI-only preview.)

### ❌ Tests fail with remote proxy error
**Cause:** `@cloudflare/vitest-pool-workers` defaults `remoteBindings: true`.
With a `worker_loaders` binding it tries a remote session.
**Fix:** Add `remoteBindings: false` to the `cloudflareTest({ ... })` options.
Tests should run fully local anyway.

### ❌ `Cannot find name 'WorkerLoader'`
**Cause:** Missing experimental Workers types.
**Fix:** Ensure `@cloudflare/workers-types` is installed; the `WorkerLoader`
type lives in its `experimental` entry (pulled in by `agents/tsconfig`).

### ❌ Class name routing surprises (`/agents/<class>/<name>`)
**Cause:** `agents` kebab-cases class names per-capital. `MyAgent` → `my-agent`,
but `MilesGPT` → `miles-g-p-t`.
**Fix:** Prefer single-word class names. Check the WS URL matches the kebab form.

### ❌ Model is slow / no response
**Cause:** First Workers AI call cold-starts; or the account has no AI access.
**Fix:** Wait ~10s on first call. Confirm the `ai` binding is in wrangler.jsonc.

---

## Facilitator Pre-Flight Checklist (do this the night before)

- [ ] `npx wrangler login` and `npx wrangler whoami` both work
- [ ] The reference Bleeps agent is deployed and the 3 demo prompts work
- [ ] `npm run dev` boots cleanly on your machine
- [ ] Tier 1 demo prompt (squared numbers) works end-to-end
- [ ] Slides/diagram ready (the execution ladder + architecture)
- [ ] Starter repo pushed (in case scaffolding live runs long)
- [ ] This runsheet open on a second screen
- [ ] Backup: a deployed Tier-1 agent attendees can poke if their local stalls

---

## Appendix — The Complete Tier-1 `server.ts` (reference)

```typescript
import { Think, type Session } from "@cloudflare/think";
import { createExecuteTool } from "@cloudflare/think/tools/execute";
import { createWorkspaceTools } from "@cloudflare/think/tools/workspace";
import { routeAgentRequest } from "agents";
import type { ToolSet } from "ai";
import { createWorkersAI } from "workers-ai-provider";

const SOUL = `You are a friendly, concise workshop assistant. You have a
persistent workspace and memory. You also have an EXECUTE tool that runs
JavaScript in a sandbox — call workspace tools as codemode.read(...),
codemode.write(...), codemode.grep(...). Prefer one execute program over many
tool calls for multi-file work.`;

export class MyAgent extends Think<Env> {
  chatRecovery = true;

  getModel() {
    return createWorkersAI({ binding: this.env.AI })("@cf/moonshotai/kimi-k2.6");
  }

  getTools(): ToolSet {
    return {
      execute: createExecuteTool({
        tools: createWorkspaceTools(this.workspace),
        loader: this.env.LOADER
      })
    };
  }

  configureSession(session: Session) {
    return session
      .withContext("soul", { provider: { get: async () => SOUL } })
      .withContext("memory", {
        description: "Durable facts about the user. Update via set_context.",
        maxTokens: 2000
      })
      .withCachedPrompt();
  }
}

export default {
  async fetch(request: Request, env: Env) {
    return (
      (await routeAgentRequest(request, env)) ||
      new Response("Not found", { status: 404 })
    );
  }
} satisfies ExportedHandler<Env>;
```

---

*This workshop maps to Stages 1–3 of the Bleeps project roadmap. See
`docs/PROJECT_STRATEGY.md` for the full 8-stage plan and
`docs/journal/` for build history.*
