# Bleeps — Live Demo Runsheet (Print & Read From This)

> **Purpose:** A literal, step-by-step script to demo every Bleeps feature live.
> Print this. Read from it. Each demo has: what to type, what to do, what to
> watch for, and what to say.
>
> **Demo surface:** the deployed agent at
> **https://bleeps-agent.buildaflare.workers.dev**
> (Local fallback: `npm run dev` → http://localhost:5173)
>
> **Total demo time:** ~5 minutes of the 90. Everything is tested and working.

---

## ☑️ PRE-FLIGHT (LIVE) — Do this 15 minutes BEFORE you present

**1. Confirm you're logged into Cloudflare (only needed if running locally)**
```bash
cd /Users/miles/workers-projects/bleeps-agent
npx wrangler whoami
```
Expect: `miles@cloudflare.com`, account `Build-a-Flare`. **No 400 error.**

**2. Confirm the live agent is up**
```bash
npm run smoke
```
Expect: `All checks passed.`

**3. DO NOT pre-seed.** The agent starts as a blank slate (empty memory, empty
history) — that's intentional. You'll teach it everything **live** in Demo A,
and the close recalls what it learned during the session. Don't type anything
into the live URL before showtime.

**4. Open two browser tabs** on the live URL (one to demo in, one clean spare).

**5. Have this sheet + the live URL visible.** You're ready.

---

## 🧪 LOCAL REHEARSAL — Pre-flight (practice today)

> Use this to rehearse on your machine **without touching the live agent**.
> Local dev runs a *separate* SQLite instance, so production `"miles"` stays
> pristine for tomorrow. The demo body (A–D, Pro) below is **identical** — you
> just point at `localhost:5173` instead of the live URL.

**0. Confirm login** (Workers AI runs remotely even locally):
```bash
cd /Users/miles/workers-projects/bleeps-agent
npx wrangler whoami      # expect miles@cloudflare.com / Build-a-Flare
```

**1. Boot the local agent:**
```bash
npm run dev              # wait for http://localhost:5173/ , then open it
```
Leave this terminal running; `Ctrl+C` to stop later.

**2. ⚠️ Verify Tier 1 runs locally FIRST** — run **Demo C immediately**:
- Returns **385** via the execute tool → local sandbox works; rehearse freely.
- Errors → rehearse A/B/D/Pro locally and run **Demo C against the deployed
  URL** instead (then reset `/numbers/` — see Reset below).

**3. (Optional) clean slate** so Demo C's "watch it create" lands fresh:
```
Delete everything in /numbers/.
```

**4. Leave memory blank.** No pre-seed — you teach the agent live in Demo A and
the close recalls it. (If a rehearsal left facts behind, ask it to "clear your
memory with set_context" so you start blank.)

### ♻️ Reset (between rehearsal runs, or before going live)
- **Demo C only:** `Delete everything in /numbers/.` then re-run.
- **Full wipe:** `Ctrl+C` → delete `.wrangler/state` (local-only, gitignored) →
  `npm run dev` → re-seed (step 4).
- A, B, D, Pro are idempotent — safe to repeat without resetting.

---

## 🎬 OPENING LINE (say this before Demo A)

> "This is Bleeps. It's not a chatbot — it's a single Durable Object on
> Cloudflare's edge. It sleeps at zero cost, wakes on a message, remembers
> everything, owns its own filesystem, and — as you'll see — writes and runs
> its own code. The agent's brain is about 40 lines of code — the whole app,
> with its UI, around 135. Let me show you."

---

## ▶️ DEMO A — Persistence / Memory · ~20 sec

**STEP 1.** In the chat box, type exactly:
```
My name is Miles and I'm running a Cloudflare workshop today.
```
**STEP 2.** Wait for Bleeps to reply (it'll acknowledge warmly).

**STEP 3.** **Refresh the browser page** (Cmd+R). The chat reloads.

**STEP 4.** Type exactly:
```
What am I doing today?
```

**WATCH FOR:** It answers correctly *after a full page reload* — the memory survived.

**SAY THIS:**
> "I refreshed the page — new connection, new everything. It still knows. This
> is the **'memory it writes itself'** piece from the primitives slide: durable
> prompt state in the Durable Object's SQLite — no database, no RAG. It
> survives reloads, restarts, even hibernation."

---

## ▶️ DEMO B — The Workspace (Tier 0) · ~20 sec

**STEP 1.** Type exactly:
```
Make a note that the workshop has 20 attendees and covers Tiers 0 and 1.
```
**STEP 2.** Wait — Bleeps writes a file into its workspace (it'll confirm).

**STEP 3.** Type exactly:
```
What did I note about the workshop?
```

**WATCH FOR:** It retrieves the answer by searching its own files.

**SAY THIS:**
> "It just wrote a file to its own filesystem, then searched it to answer. I
> wired zero retrieval logic — no vector database, no RAG pipeline. That's the
> **'durable filesystem'** piece — Tier 0 of the execution ladder — the agent
> decides when to read, write, or grep, and operates it itself."

---

## ▶️ DEMO C — Code Execution (Tier 1) · ~40 sec  ⭐ THE WOW

**STEP 1.** Type exactly:
```
Use your execute tool to create 10 notes in /numbers/ named 1.md through
10.md, each containing that number squared. Then write a script that reads
all of them and returns the total sum.
```
**STEP 2.** Watch the response stream. You'll see it **reason**, then **write a
JavaScript program**, then return the result (the sum is **385**).

**WATCH FOR:** It writes ONE program using `codemode.write(...)` and
`codemode.read(...)` in a loop — not 20 separate tool calls.

**SAY THIS:**
> "Watch what it just did. Instead of calling a 'write file' tool twenty times
> and pulling each result back through the model, it wrote a single JavaScript
> program and ran it — in a sandboxed Dynamic Worker that spun up in
> milliseconds with no network access. That's the **'sandboxed execution'**
> piece — Tier 1 of the ladder: the jump from a chatbot that *calls* tools to a
> coding agent that *writes code*. Same insight as Claude Code or Codex —
> except this runs on the edge, not on my laptop."

> **(Optional follow-up to make it concrete):** type
> `Show me the contents of /numbers/7.md` → it reads back `49`.

---

## ▶️ DEMO D — Crash Recovery / Durability · ~20 sec

**STEP 1.** Type exactly:
```
Write me a long story about a robot who learns to code.
```
**STEP 2.** While it's **still streaming** the story, **refresh the page** (Cmd+R).

**STEP 3.** The page reconnects — the response **resumes / is still there**.

**SAY THIS:**
> "I crashed the page mid-thought and it recovered. This is the **'crash-proof
> turns'** piece: every turn runs in a durable fiber, so if the isolate is
> evicted or the connection drops, the work survives and resumes. And you often
> get it for free — it's the default in Think; Bleeps just makes it explicit
> with `chatRecovery = true`."

---

## ✨ THE CLOSE — Memory across the whole session

**STEP 1.** Type exactly:
```
What do you know about me and what I'm doing today?
```
**STEP 2.** Bleeps recalls everything from this session — your name + the
workshop (from Demo A's memory) and can pull the 20-attendees note (Demo B's
file).

**SAY THIS:**
> "Everything I've told it today — across a page refresh, across the whole
> session — it still has. Memory in its own SQLite, plus a filesystem it
> searches itself. That's the **'everything persists'** piece: remembering
> isn't a feature I bolted on — it's how the infrastructure works."

---

## 🎤 CLOSING LINE

> "That's about 40 lines for the agent itself — around 135 for the whole app
> with its UI. Streaming, persistence, the agentic loop, the sandbox — none of
> that is my code. It all comes from extending one base class and declaring
> three bindings. The capabilities live in the platform, not the logic.
> **That's what 'agent as infrastructure' means.**"

---

## 🆘 TROUBLESHOOTING CARD (if something misbehaves live)

| Symptom | Fix on the spot |
|---------|-----------------|
| Live URL slow / no reply | First call cold-starts (~10s). Wait, or switch to spare tab. |
| Local `npm run dev` won't boot | You're logged out → `npx wrangler login`. (Don't debug live — use the deployed URL.) |
| Demo C doesn't use the sandbox | Re-prompt: add "**Use ONLY your execute tool**" at the start. |
| Memory seems empty | The DO is shared/global; prior chats may have compacted. Just re-seed Demo A live. |
| Total panic | Fall back to narrative + slides. The deployed URL is your safety net; nothing to install. |

---

## 📋 ONE-GLANCE CHEAT STRIP (cut this out, keep it on the podium)

```
A  "My name is Miles and I'm running a Cloudflare workshop today."
    → REFRESH → "What am I doing today?"          [memory survives reload]

B  "Make a note that the workshop has 20 attendees and covers Tiers 0 and 1."
    → "What did I note about the workshop?"        [it greps its own files]

C  "Use your execute tool to create 10 notes in /numbers/ named 1.md through
    10.md, each containing that number squared. Then write a script that
    reads all of them and returns the total sum."  [writes code, sum = 385]

D  "Write me a long story about a robot who learns to code."
    → REFRESH MID-STREAM                           [response recovers]

PRO  "What do you know about me and what I'm doing today?" [recalls Demo A + B]
```

---

## 🛠️ APPENDIX — Commands (for the technical Q&A, if asked)

```bash
# Run locally (needs wrangler login — Workers AI is remote)
npm run dev                 # → http://localhost:5173

# Deploy
npm run deploy              # vite build + wrangler deploy

# Prove the deploy is alive
npm run smoke               # HTTP only, ~2s, $0
npm run smoke -- --ws       # also opens a WebSocket (connects; see note below)

# Tests
npm test                    # 7 integration tests, fully local, no AI credits
npm run typecheck           # tsc --noEmit
```

> **Honest caveat (only if a sharp attendee asks):** the `smoke -- --ws` check
> resolves on the first WebSocket frame, which is the conversation-history
> replay — so it proves the socket connects, not that the model ran. The real
> turn-trigger frame is `cf_agent_use_chat_request` (we verified the live
> execute tool end-to-end with it). For a true end-to-end check, demo in the
> browser.

---

*Companion docs: `docs/WORKSHOP.md` (full 90-min build runsheet),
`docs/PROJECT_STRATEGY.md` (8-stage roadmap). This sheet is the live-demo
script only.*
