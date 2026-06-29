# Bleeps — Project Strategy Document

**Version:** 1.0  
**Date:** 2026-05-30  
**Agent:** Bleeps  
**Platform:** Cloudflare Workers + Project Think  
**Live URL:** https://bleeps-agent.buildaflare.workers.dev  

---

## 1. Executive Summary

Bleeps is a personal AI agent built to demonstrate and explore Cloudflare's **Project Think** — the bleeding-edge "agent as infrastructure" paradigm. It is not a chatbot; it is a durable, persistent, serverless entity that hibernates at zero cost, wakes on message, remembers across sessions, and operates its own filesystem.

This document serves as the single source of truth for the project's architecture, current capabilities, strategic roadmap, and learning objectives. It is designed to be read by collaborators, future maintainers, and anyone evaluating Cloudflare's agent platform.

**Current Stage:** Stage 1 (Complete) — A minimal, production-quality Think agent with streaming chat, persistent memory, workspace filesystem, and a three-layer test framework.

**Strategic Goal:** Progress through 8 additive stages to build the most complete public demonstration of Project Think's capabilities, touching every major Cloudflare AI/edge primitive along the way.

---

## 2. Project Identity & Vision

### 2.1 What Bleeps Is
- A **single Durable Object** (named `"miles"`) that holds the entire agent state
- A **friend, not a tool** — warm, conversational, slightly cheeky personality
- **Infrastructure, not software** — it persists, sleeps, wakes, and self-improves
- A **learning vehicle** — every stage introduces at least one new Cloudflare binding or service

### 2.2 What Bleeps Is Not (Yet)
- Multi-user (no auth — anyone with the URL shares the same agent)
- A coding agent (no code execution — yet)
- Connected to the live web (no browser, no APIs — yet)
- Proactive (only responds when spoken to — yet)

### 2.3 The Vision
> By Stage 8, Bleeps will be a multi-user, self-improving, proactive AI assistant that writes its own tools, browses the web, delegates to sub-agents, and operates as a reference architecture for "agent as infrastructure" on Cloudflare.

---

## 3. Complete Repository Structure

```
bleeps-agent/
│
├── 📁 .wrangler/                          # Wrangler local dev state
│   └── state/v3/                          # Local SQLite, DO storage, cache
│       ├── do/miles-gpt-MilesGPT/         # Legacy DO state (v1 migration)
│       ├── d1/miniflare-D1DatabaseObject/ # Legacy D1 state (v1 only)
│       └── cache/miniflare-CacheObject/   # Local cache metadata
│
├── 📁 dist/                               # Build output (gitignored, generated)
│   ├── client/                            # Vite-bundled React SPA
│   │   ├── index.html                     # Entry HTML with bundled assets
│   │   └── assets/                        # Hashed JS/CSS chunks
│   ├── bleeps_agent/                      # Worker bundle (current)
│   │   ├── index.js                       # Entry point
│   │   ├── wrangler.json                  # Generated config
│   │   └── assets/                        # Bundled dependencies
│   └── miles_gpt/                         # Worker bundle (legacy, pre-rename)
│
├── 📁 docs/                               # Project documentation
│   ├── journal/                           # Build history & decision logs
│   │   └── 2026-05-20-stage-1.md          # Stage 1 retrospective (Nimbus → Bleeps)
│   └── PROJECT_STRATEGY.md                # ← This document
│
├── 📁 scripts/                            # Operational scripts
│   └── smoke.mjs                          # Live HTTP + WebSocket smoke tests
│                                          #   - HTTP mode: ~2s, $0
│                                          #   - WS mode: tests actual AI round-trip
│
├── 📁 src/                                # Source code
│   ├── server.ts                          # 🧠 THE AGENT — Bleeps extends Think
│   │                                      #   - DO class definition
│   │                                      #   - Model configuration (kimi-k2.6)
│   │                                      #   - Context blocks (soul + memory)
│   │                                      #   - Custom RPC methods (readNote, writeNote)
│   │                                      #   - routeAgentRequest entrypoint
│   │
│   └── client/                            # React frontend
│       ├── main.tsx                       # React root (StrictMode, createRoot)
│       ├── App.tsx                        # Chat UI (useAgent + useAgentChat)
│       │                                  #   - Message list with auto-scroll
│       │                                  #   - Input composer
│       │                                  #   - Status indicators
│       │                                  #   - Bleeps avatar
│       └── styles.css                     # Cloudflare orange/amber terminal theme
│                                          #   - Dark charcoal bg (#1a1410)
│                                          #   - Orange (#F38020) + amber (#FAAD3F) accents
│                                          #   - Monospace, sharp corners, no rounded UI
│
├── 📁 test/                               # Testing framework (3 layers)
│   ├── tsconfig.json                      # Test-specific TypeScript config
│   ├── integration/                       # Layer 2: Real DO + SQLite in workerd
│   │   ├── _helpers.ts                    # Shared test utilities (bleepsStub())
│   │   ├── agent-boot.test.ts             # DO instantiation + persistence tests (2 tests)
│   │   └── agent-tools.test.ts            # Workspace filesystem tests (5 tests)
│   │                                      #   - Round-trip, missing file, overwrite
│   │                                      #   - Unicode/multiline, nested paths
│   └── unit/                              # Layer 1: Pure logic (placeholder, empty)
│
├── 📄 .editorconfig                       # Editor consistency (2-space indent)
├── 📄 .gitignore                          # Node modules, dist, .wrangler, .DS_Store
├── 📄 .prettierrc                         # Code formatting rules
├── 📄 env.d.ts                            # TypeScript declarations for Cloudflare.Env
│                                          #   - AI: Ai binding
│                                          #   - Bleeps: DurableObjectNamespace<Bleeps>
├── 📄 index.html                          # HTML entry point for Vite dev server
│                                          #   - Meta tags, viewport, favicon
│                                          #   - React root mount point (#root)
│                                          #   - Vite client script
├── 📄 package.json                        # Dependencies + npm scripts
├── 📄 package-lock.json                   # Locked dependency tree
├── 📄 README.md                           # User-facing documentation
├── 📄 tsconfig.json                       # TypeScript config (extends agents/tsconfig)
├── 📄 vite.config.ts                      # Vite build configuration
│                                          #   - agents/vite plugin (agents protocol)
│                                          #   - @vitejs/plugin-react (React support)
│                                          #   - @cloudflare/vite-plugin (Worker bundling)
├── 📄 vitest.config.ts                    # Vitest test configuration
│                                          #   - @cloudflare/vitest-pool-workers
│                                          #   - Real workerd, real DO, real SQLite
│                                          #   - Stubbed AI binding (no model calls in tests)
└── 📄 wrangler.jsonc                      # Cloudflare deployment configuration
    │                                      #   - Worker name: bleeps-agent
    │                                      #   - DO binding: Bleeps class
    │                                      #   - AI binding: Workers AI
    │                                      #   - Assets: SPA fallback + worker-first routes
    │                                      #   - Migrations: v1 → v2 → v3 (MilesGPT → Nimbus → Bleeps)
```

### 3.1 File Ownership Map

| File | Owner | Purpose | Changes Frequency |
|------|-------|---------|-------------------|
| `src/server.ts` | Agent logic | Core agent behavior, personality, tools | Rare (config, not logic) |
| `src/client/App.tsx` | UI/UX | Chat interface, user experience | Medium (new features) |
| `src/client/styles.css` | Design | Visual identity, theme | Low (stable) |
| `wrangler.jsonc` | Infrastructure | Bindings, migrations, routing | Low (new bindings per stage) |
| `env.d.ts` | Types | TypeScript declarations | Low (new bindings) |
| `test/integration/*.test.ts` | Quality | Regression prevention | Medium (new tests per feature) |
| `scripts/smoke.mjs` | Operations | Deploy validation | Low |
| `docs/journal/*.md` | History | Decision logs, learnings | Per stage |

---

## 4. Architecture Deep Dive

### 4.1 The Agent Class (`src/server.ts`)

```typescript
export class Bleeps extends Think<Env> {
  chatRecovery = true;                    // Durable execution via fibers

  getModel() {
    return createWorkersAI({ binding: this.env.AI })(
      "@cf/moonshotai/kimi-k2.6"         // Model choice: tuned for agentic loop
    );
  }

  configureSession(session: Session) {
    return session
      .withContext("soul", {              // Static personality block
        provider: { get: async () => BLEEPS_SOUL }
      })
      .withContext("memory", {            // Mutable memory (model writes via set_context)
        description: "Durable facts about Miles",
        maxTokens: 2000
      })
      .withCachedPrompt();                // Server-side prompt caching for perf
  }
}
```

**What Think provides (the framework handles this):**
- WebSocket chat protocol (`cf_agent_chat_*` frames)
- Message persistence in SQLite (tree-structured, forkable)
- Agentic loop (model call → tool calls → results → loop)
- Workspace filesystem tools (`read`, `write`, `edit`, `grep`, `find`, `list`, `delete`)
- `set_context` tool for model self-updating memory
- Stream resumption on reconnect
- Session compaction (non-destructive summarization)
- FTS5 full-text search

**What we added (our code):**
- `BLEEPS_SOUL` — personality and operating instructions
- `readNote()` / `writeNote()` — RPC methods for tests and debugging
- `chatRecovery = true` — crash recovery via fibers

### 4.2 Data Flow

```
User types message
        ↓
Browser: useAgentChat sends cf_agent_chat_messages frame
        ↓
WebSocket: /agents/bleeps/miles
        ↓
Worker: routeAgentRequest(request, env)
        ↓
Durable Object "miles" wakes up (or resumes)
        ↓
Think.assembleContext():
  - soul block (static)
  - memory block (persistent)
  - conversation history (Session tree)
  - tool descriptions (workspace tools)
        ↓
streamText() → kimi-k2.6
        ↓
Model decides: respond directly | call tool(s)
        ↓
If tool call:
  - execute tool (workspace operation)
  - append result to context
  - loop back to streamText()
        ↓
Stream tokens back to browser via WebSocket
        ↓
Persist final message in SQLite
        ↓
DO hibernates (zero cost)
```

### 4.3 Storage Model

Every Bleeps instance has three durable stores:

| Store | Type | Contents | Persistence |
|-------|------|----------|-------------|
| **Session** | SQLite (tree) | Conversation messages, branches, forks | Forever (compacted) |
| **Workspace** | SQLite (filesystem) | Notes, files, code, data | Forever |
| **Context blocks** | SQLite (key-value) | `soul`, `memory`, extension contexts | Forever |

All three survive hibernation, restarts, and migrations (within the same class).

### 4.4 The Client (`src/client/App.tsx`)

```typescript
const agent = useAgent({
  agent: "Bleeps",    // DO class name
  name: "miles"       // DO instance name (single global instance)
});

const { messages, sendMessage, status } = useAgentChat({ agent });
```

**Client responsibilities:**
- Render message list (auto-scroll)
- Capture user input
- Display streaming status
- Handle WebSocket connect/disconnect

**Client does NOT handle:**
- Message persistence (server-side)
- Tool execution (server-side)
- State management (server-side)
- Error recovery (handled by `chatRecovery`)

---

## 5. Technology Stack

### 5.1 Runtime & Framework

| Layer | Package | Version | Role |
|-------|---------|---------|------|
| Agent framework | `@cloudflare/think` | ^0.7.1 | Opinionated base class (Think) |
| Agents protocol | `agents` | ^0.13.1 | WebSocket routing, sub-agents, MCP |
| AI SDK | `ai` | ^6.0.185 | streamText, tool definitions, types |
| Workers AI provider | `workers-ai-provider` | ^3.1.14 | Cloudflare Workers AI adapter |
| Shell/workspace | `@cloudflare/shell` | ^0.3.8 | Workspace filesystem implementation |
| AI chat hooks | `@cloudflare/ai-chat` | ^0.7.1 | useAgentChat React hook |

### 5.2 Frontend

| Layer | Package | Version | Role |
|-------|---------|---------|------|
| Framework | `react` | ^19.2.6 | UI library |
| Renderer | `react-dom` | ^19.2.6 | DOM mounting |
| Build tool | `vite` | ^8.0.13 | Bundling, HMR, dev server |
| React plugin | `@vitejs/plugin-react` | ^6.0.2 | JSX transform, Fast Refresh |
| Cloudflare Vite | `@cloudflare/vite-plugin` | ^1.37.2 | Worker bundling in Vite |
| Agents Vite | `agents/vite` | ^0.13.1 | Agents protocol in dev |

### 5.3 Testing

| Layer | Package | Version | Role |
|-------|---------|---------|------|
| Test runner | `vitest` | ^4.1.7 | Unit + integration tests |
| Workers pool | `@cloudflare/vitest-pool-workers` | ^0.16.7 | Real workerd, real DO, real SQLite |

### 5.4 Infrastructure

| Service | Binding | Status | Stage Introduced |
|---------|---------|--------|------------------|
| Workers AI | `AI` | ✅ Active | Stage 1 |
| Durable Objects | `Bleeps` | ✅ Active | Stage 1 |
| Static Assets | `assets` | ✅ Active | Stage 1 |
| D1 | — | ❌ Removed (v1 only) | — |
| Vectorize | — | ❌ Not used | Stage 2 (planned) |
| R2 | — | ❌ Not used | Stage 2 (planned) |
| AI Gateway | — | ❌ Not used | Stage 3 (planned) |
| Dynamic Workers | `LOADER` | ❌ Not used | Stage 3 (planned) |
| Browser Run | `BROWSER` | ❌ Not used | Stage 4 (planned) |
| Cloudflare Sandbox | `SANDBOX` | ❌ Not used | Stage 5 (planned) |
| KV | — | ❌ Not used | Stage 7 (planned) |
| Queues | — | ❌ Not used | Stage 7 (planned) |
| Workflows | — | ❌ Not used | Stage 7 (planned) |

---

## 6. Capability Inventory

### 6.1 What We Use (Stage 1)

| Capability | Implementation | Evidence |
|------------|---------------|----------|
| Durable execution | `chatRecovery = true` | `src/server.ts:43` |
| Streaming chat | `useAgentChat` + WebSocket | `src/client/App.tsx:15` |
| Persistent memory | `memory` context block | `src/server.ts:59-64` |
| Workspace filesystem | Built-in tools (read/write/grep/etc) | Provided by Think |
| Session storage | Tree-structured messages | Provided by Think |
| Prompt caching | `.withCachedPrompt()` | `src/server.ts:66` |
| Model: kimi-k2.6 | `createWorkersAI` | `src/server.ts:48-50` |
| Personality injection | `soul` context block | `src/server.ts:55-58` |
| Crash recovery | Fibers + `chatRecovery` | `src/server.ts:43` |
| Integration testing | `vitest-pool-workers` | `test/integration/` |
| Live smoke testing | `scripts/smoke.mjs` | HTTP + WebSocket modes |
| SPA deployment | Vite + Wrangler assets | `wrangler.jsonc:10-15` |

### 6.2 What's Available But Unused

This is our **expansion surface** — every item here is a documented Think/Cloudflare primitive we can adopt.

#### Think Framework (High Priority)

| Feature | Docs | Impact | Effort |
|---------|------|--------|--------|
| `getTools()` — custom tools | [Think docs](https://developers.cloudflare.com/agents/api-reference/think/) | ⭐⭐⭐ High | 1-2 days |
| `beforeTurn` / lifecycle hooks | [Think docs](https://developers.cloudflare.com/agents/api-reference/think/) | ⭐⭐⭐ High | 1 day |
| Tool approval (`needsApproval`) | [Think docs](https://developers.cloudflare.com/agents/api-reference/think/) | ⭐⭐ Medium | 2-4 hours |
| `submitMessages()` — async turns | [Think docs](https://developers.cloudflare.com/agents/api-reference/think/) | ⭐⭐⭐ High | 1-2 days |
| Session FTS5 search | [Sessions docs](https://developers.cloudflare.com/agents/api-reference/sessions/) | ⭐⭐⭐ High | 1 day |
| Session forking | [Sessions docs](https://developers.cloudflare.com/agents/api-reference/sessions/) | ⭐⭐ Medium | 2-3 days |
| Dynamic config (`configure()`) | [Think docs](https://developers.cloudflare.com/agents/api-reference/think/) | ⭐⭐ Medium | 1 day |
| `@callable` RPC methods | [Think docs](https://developers.cloudflare.com/agents/api-reference/think/) | ⭐⭐ Medium | 1 day |
| `sendReasoning` | [Think docs](https://developers.cloudflare.com/agents/api-reference/think/) | ⭐ Low | 30 min |

#### Execution Ladder (Very High Priority)

| Feature | Docs | Impact | Effort | Stage |
|---------|------|--------|--------|-------|
| **Codemode** (`createExecuteTool`) | [Codemode](https://github.com/cloudflare/agents/tree/main/packages/codemode) | ⭐⭐⭐⭐ Critical | 2-3 days | 3 |
| **Dynamic Workers** (`worker_loaders`) | [Dynamic Workers](https://blog.cloudflare.com/dynamic-workers/) | ⭐⭐⭐⭐ Critical | 2-3 days | 3 |
| **npm bundler** (`@cloudflare/worker-bundler`) | [Worker Bundler](https://github.com/cloudflare/agents/tree/main/packages/worker-bundler) | ⭐⭐⭐ High | 1-2 days | 3-4 |
| **Browser Run** (`createBrowserTools`) | [Browser Run](https://developers.cloudflare.com/browser-rendering/) | ⭐⭐⭐ High | 2-3 days | 4 |
| **Cloudflare Sandbox** | [Sandboxes](https://developers.cloudflare.com/sandbox/) | ⭐⭐⭐ High | 3-5 days | 5 |

#### Sub-Agents & Orchestration (High Priority)

| Feature | Docs | Impact | Effort | Stage |
|---------|------|--------|--------|-------|
| **Sub-agents** (`subAgent()`) | [Sub-agents](https://developers.cloudflare.com/agents/api-reference/sub-agents/) | ⭐⭐⭐ High | 2-3 days | 5 |
| **Facets** | [Facets](https://blog.cloudflare.com/durable-object-facets-dynamic-workers/) | ⭐⭐⭐ High | 2-3 days | 5 |
| **Agent tools** (`agentTool()`) | [Agent tools](https://developers.cloudflare.com/agents/api-reference/agent-tools/) | ⭐⭐⭐ High | 1-2 days | 5 |
| **Parent-child RPC** (`chat()`) | [Think docs](https://developers.cloudflare.com/agents/api-reference/think/) | ⭐⭐⭐ High | 1-2 days | 5 |

#### Self-Improvement (Very High Priority)

| Feature | Docs | Impact | Effort | Stage |
|---------|------|--------|--------|-------|
| **Extensions** (`ExtensionManager`) | [Think docs](https://developers.cloudflare.com/agents/api-reference/think/) | ⭐⭐⭐⭐ Critical | 3-5 days | 6 |
| **LLM-driven extensions** (`createExtensionTools`) | [Think docs](https://developers.cloudflare.com/agents/api-reference/think/) | ⭐⭐⭐⭐ Critical | 3-5 days | 6 |
| **Static extensions** | [Think docs](https://developers.cloudflare.com/agents/api-reference/think/) | ⭐⭐⭐ High | 2 days | 6 |

#### Platform Services (Medium Priority)

| Feature | Docs | Impact | Effort | Stage |
|---------|------|--------|--------|-------|
| **AI Gateway** | [AI Gateway](https://developers.cloudflare.com/ai-gateway/) | ⭐⭐⭐ High | 1-2 days | 3 |
| **Vectorize** | [Vectorize](https://developers.cloudflare.com/vectorize/) | ⭐⭐ Medium | 1-2 days | 2 |
| **R2** (spillover) | [R2](https://developers.cloudflare.com/r2/) | ⭐⭐ Medium | 1 day | 2 |
| **D1** (structured data) | [D1](https://developers.cloudflare.com/d1/) | ⭐⭐ Medium | 1-2 days | 4 |
| **KV** (fast cache) | [KV](https://developers.cloudflare.com/kv/) | ⭐⭐ Medium | 1 day | 7 |
| **Queues** (async jobs) | [Queues](https://developers.cloudflare.com/queues/) | ⭐⭐⭐ High | 2-3 days | 7 |
| **Workflows** (orchestration) | [Workflows](https://developers.cloudflare.com/workflows/) | ⭐⭐⭐ High | 2-3 days | 7 |
| **DO Alarms** (scheduling) | [Alarms](https://developers.cloudflare.com/durable-objects/api/alarms/) | ⭐⭐⭐ High | 1-2 days | 7 |
| **MCP servers** | [MCP](https://developers.cloudflare.com/agents/api-reference/mcp/) | ⭐⭐⭐ High | 2-3 days | 4 |

#### Authentication & Multi-User (Medium Priority)

| Feature | Docs | Impact | Effort | Stage |
|---------|------|--------|--------|-------|
| **GitHub OAuth** | [OAuth](https://developers.cloudflare.com/workers/examples/auth-with-headers/) | ⭐⭐⭐ High | 2-3 days | 7 |
| **Per-user DO isolation** | [DO routing](https://developers.cloudflare.com/durable-objects/) | ⭐⭐⭐ High | 1-2 days | 7 |

---

## 7. Strategic Roadmap

### Guiding Principles

1. **Additive stages** — you can stop after any stage and still have a useful product
2. **One new binding per stage** — every stage introduces at least one Cloudflare service we haven't used
3. **Test everything** — every new feature gets integration tests before deploy
4. **Demo-first** — each stage should have a clear "wow" moment that demonstrates the capability

### Stage 1: Foundation ✅ COMPLETE

**Goal:** A minimal, production-quality Think agent that streams, remembers, and owns a filesystem.

**Deliverables:**
- ✅ `Bleeps extends Think<Env>` with `soul` + `memory` context blocks
- ✅ React chat UI with streaming over WebSocket
- ✅ Workspace filesystem (read/write/grep/find/list/delete)
- ✅ 7 integration tests + live smoke tests
- ✅ Deployed at `bleeps-agent.buildaflare.workers.dev`

**Wow moment:** "Bleeps remembers my name across sessions without me wiring any database."

**New bindings:** Workers AI, Durable Objects

---

### Stage 2: Smarter Workspace 🎯 NEXT

**Goal:** Make Bleeps feel like it actually remembers and can intelligently search its life.

**Deliverables:**
- [ ] **R2 spillover** — override `workspace` with `Workspace({ sql, r2 })` for large files
- [ ] **FTS5 session search** — enable `search_context` so Bleeps can search conversation history
- [ ] **Semantic search tool** — add Vectorize as optional search path; model decides grep vs semantic
- [ ] **Workspace organization** — coach model to use `/notes/`, `/projects/`, `/people/`, `/scratch/`
- [ ] **Tool approval** — require confirmation before `delete` or destructive `edit`
- [ ] **UI: tool-call indicators** — show "Bleeps is searching…" when tools run
- [ ] **UI: markdown rendering** — format responses with headings, lists, code blocks

**Wow moment:** "Find everything I've written about the React migration" → Bleeps searches files + conversation history, returns synthesized summary.

**New bindings:** R2, Vectorize  
**Estimated effort:** 3-5 days  
**Risk:** Low — all Think-native features

---

### Stage 3: Codemode — The Execution Ladder Begins

**Goal:** The biggest capability jump. Bleeps writes and runs code instead of chaining 20 tool calls.

**Deliverables:**
- [ ] **Add `worker_loaders` binding** to `wrangler.jsonc`
- [ ] **Install `@cloudflare/codemode`**
- [ ] **Add `createExecuteTool`** to `getTools()` with workspace tool access
- [ ] **Demo task:** "Write a script that finds all TODOs in my notes and returns a table"
- [ ] **AI Gateway integration** — route model calls through AI Gateway for caching + observability
- [ ] **Lifecycle hooks** — `beforeTurn` to log turns, switch models, limit tools
- [ ] **Dynamic config** — `configure()` for "fast" vs "capable" model tiers

**Wow moment:** "Analyze my notes and tell me which ones are outdated" → Bleeps writes a JS script, runs it in a sandbox, returns results in one shot instead of 50 tool calls.

**New bindings:** Dynamic Workers (`LOADER`), AI Gateway  
**Estimated effort:** 5-7 days  
**Risk:** Medium — codemode is bleeding-edge, may have edge cases

---

### Stage 4: Browser + The Outside World

**Goal:** Bleeps can interact with the live web and external APIs.

**Deliverables:**
- [ ] **Browser Run tools** (`createBrowserTools`) — CDP-based scraping, screenshots
- [ ] **Custom tools via `getTools()`:**
  - `getWeather` — HTTP fetch to weather API
  - `searchWeb` — DuckDuckGo instant answer API
  - `fetchUrl` — general web fetching with content extraction
- [ ] **MCP server connection** — connect to Cloudflare API MCP or custom server
- [ ] **Durable async turns** — `submitMessages()` for webhook-triggered tasks
- [ ] **D1 reintroduction** — structured data storage for API credentials, configs

**Wow moment:** "What's the weather in Lisbon?" → Bleeps fetches live weather data and answers. "Screenshot this page" → Bleeps opens a headless browser and returns an image.

**New bindings:** Browser Run (`BROWSER`), MCP, D1  
**Estimated effort:** 5-7 days  
**Risk:** Medium — external APIs can be flaky

---

### Stage 5: Sub-Agents + Parallel Execution

**Goal:** Bleeps delegates. Multiple agents work in parallel.

**Deliverables:**
- [ ] **Facet-based sub-agents:**
  - `Researcher` — deep web research specialist
  - `Coder` — code generation with own workspace
  - `Scribe` — note-taking and summarization
- [ ] **Parent orchestration** — Bleeps spawns children, collects results via `chat()`
- [ ] **Shared context** — pass `memory` block to children so they know user preferences
- [ ] **Parallel execution** — `Promise.all([researcher.chat(...), coder.chat(...)])`
- [ ] **Agent tools** — `agentTool()` for parent model to delegate to children

**Wow moment:** "Research the best React state management libraries and write a comparison note" → Bleeps spawns a Researcher (web search + summarize) and a Scribe (format into markdown), runs them in parallel, merges results.

**New bindings:** Sub-agents (Facets), `agentTool()`  
**Estimated effort:** 5-7 days  
**Risk:** Medium — coordination complexity

---

### Stage 6: Self-Authored Extensions

**Goal:** Bleeps writes its own tools at runtime and persists them.

**Deliverables:**
- [ ] **Enable `extensionLoader`** (`this.env.LOADER`) + `worker_loaders` binding
- [ ] **Add `createExtensionTools`** — `load_extension`, `list_extensions`
- [ ] **Demo flow:**
  1. "I want to track my GitHub issues"
  2. Bleeps writes a GitHub extension (TS, declares `network: ["api.github.com"]`)
  3. Loads it via `ExtensionManager`
  4. New tools (`github_list_issues`, `github_create_pr`) appear instantly
  5. Extension persists in DO SQLite
- [ ] **npm-enabled extensions** — use `@cloudflare/worker-bundler` for package imports
- [ ] **Extension context blocks** — extensions declare their own memory scratchpads

**Wow moment:** "I need to check my GitHub PRs" → Bleeps has never done this before. It writes a GitHub integration extension, loads it, and returns your open PRs. The extension now exists forever.

**New bindings:** Extensions, Worker Bundler  
**Estimated effort:** 7-10 days  
**Risk:** High — most bleeding-edge feature, limited docs

---

### Stage 7: Auth + Multi-User + Proactive Agents

**Goal:** Bleeps becomes a real product. Each user gets their own agent.

**Deliverables:**
- [ ] **GitHub OAuth** — gate the app, derive DO name from login
- [ ] **Per-user isolation** — each user gets own Bleeps DO (`name: "miles"`, `name: "alice"`)
- [ ] **DO Alarms** — scheduled wake-ups:
  - "Remind me every Friday to review notes"
  - "Check this URL every morning and alert me if it changed"
- [ ] **Workflows integration** — multi-step durable jobs
- [ ] **Queues** — async job processing for long-running tasks
- [ ] **KV** — fast caching for user sessions, config

**Wow moment:** "Remind me every Monday about my weekly goals" → Bleeps sets an alarm, wakes up every Monday, reads your goals note, and sends you a message.

**New bindings:** OAuth, DO Alarms, Workflows, Queues, KV  
**Estimated effort:** 7-10 days  
**Risk:** Medium — auth is well-understood, scheduling is new

---

### Stage 8: Observability + Polish + The Demo Layer

**Goal:** Make Bleeps the definitive Cloudflare Agents demo.

**Deliverables:**
- [ ] **AI Gateway advanced** — request caching, rate limiting, model fallbacks
- [ ] **Model switching** — runtime tier selection (fast vs capable)
- [ ] **Client tools** — browser exposes tools to agent (geolocation, clipboard)
- [ ] **Session forking UI** — users can branch conversations, compare paths
- [ ] **Admin dashboard** — `@callable` endpoints for viewing state, memory, files
- [ ] **Public landing page** — explains architecture, shows live examples
- [ ] **Open-source release** — clean repo, comprehensive README, contribution guide

**Wow moment:** A visitor opens the landing page, sees a live architecture diagram, clicks "Try it," and gets their own Bleeps instance in seconds.

**New bindings:** None (polish stage)  
**Estimated effort:** 5-7 days  
**Risk:** Low — mostly UI/UX work

---

## 8. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| `@cloudflare/think` API changes | Medium | High | Pin exact versions (`^0.7.1`), watch changelog, keep stages small |
| Codemode/Extensions too bleeding-edge | Medium | High | Stage 3/6 have fallback paths; if codemode breaks, we still have custom tools |
| Workers AI model deprecation | Low | High | AI Gateway fallback to other models; easy to swap `getModel()` |
| No auth = data exposure | High (currently) | Medium | Document clearly; Stage 7 is auth; keep URL private until then |
| Test flakiness in workerd | Low | Medium | `teardownTimeout` handles MCP hangs; retry logic in smoke tests |
| Single DO = scaling bottleneck | Low | Medium | Stage 7 adds per-user DOs; until then, personal use only |
| Cloudflare platform limits | Low | Medium | Stay within DO SQLite limits; R2 spillover for large files |

---

## 9. Success Metrics

### Per-Stage Definition of Done

Each stage is only complete when:

1. **Feature works locally** (`npm run dev`)
2. **Integration tests pass** (`npm test`)
3. **Deployed and smoke-tested** (`npm run deploy && npm run smoke -- --ws`)
4. **Journal entry written** (`docs/journal/YYYY-MM-DD-stage-N.md`)
5. **Strategy doc updated** (this file — mark stage complete, update bindings table)
6. **"Wow" moment documented** — a specific prompt/response pair that demonstrates the new capability

### Overall Project Health Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Test coverage | >80% | ~70% (integration only) |
| Deploy frequency | Per stage | Per stage |
| Smoke test pass rate | 100% | 100% |
| New Cloudflare services used | 15+ | 3 |
| Time to stage completion | <10 days | Stage 1: 1 day |
| Documentation completeness | Every decision logged | Stage 1 only |

---

## 10. Cloudflare Platform Learning Tracker

This is our **curriculum** — a checklist of every Cloudflare AI/edge primitive we aim to learn through this project.

### Compute & Runtime
- [x] Workers (the base)
- [x] Durable Objects (the agent container)
- [ ] Durable Objects Alarms (scheduling)
- [ ] Dynamic Workers (sandboxed code execution)
- [ ] Cloudflare Sandbox (full OS access)

### Storage
- [x] DO SQLite (agent state)
- [ ] R2 (large file spillover)
- [ ] D1 (structured relational data)
- [ ] KV (fast cache)

### AI & ML
- [x] Workers AI (kimi-k2.6)
- [ ] AI Gateway (routing, caching, observability)
- [ ] Vectorize (semantic search)
- [ ] Model switching (fast vs capable)

### Agents Framework
- [x] Think base class
- [x] Context blocks (soul, memory)
- [x] Workspace tools
- [x] Session persistence
- [ ] Session search (FTS5)
- [ ] Session forking
- [ ] Custom tools (`getTools()`)
- [ ] Lifecycle hooks (`beforeTurn`, etc.)
- [ ] Tool approval
- [ ] Codemode (`createExecuteTool`)
- [ ] Browser tools (`createBrowserTools`)
- [ ] Extensions (`ExtensionManager`)
- [ ] Sub-agents (`subAgent()`)
- [ ] Agent tools (`agentTool()`)
- [ ] MCP integration

### Networking & Integration
- [x] WebSocket streaming
- [ ] HTTP custom tools
- [ ] Browser Run (headless Chrome)
- [ ] External APIs
- [ ] MCP servers

### Orchestration
- [ ] Workflows (multi-step durable jobs)
- [ ] Queues (async processing)
- [ ] Scheduled jobs (DO Alarms)

### Security & Identity
- [ ] GitHub OAuth
- [ ] Per-user isolation
- [ ] Tool permissions (`needsApproval`)
- [ ] Extension permissions (network, workspace)

### Developer Experience
- [x] Vite plugin
- [x] Vitest pool workers
- [x] Wrangler deploy
- [ ] AI Gateway observability
- [ ] Client tools

---

## 11. Immediate Action Items

### This Sprint (Next 7 Days)

1. **Implement R2 spillover**
   - Create R2 bucket `bleeps-workspace`
   - Add binding to `wrangler.jsonc`
   - Override `workspace` in `Bleeps` class
   - Test: write a large file (>1MB), verify it spills to R2

2. **Add first custom tool: `getWeather`**
   - Override `getTools()` in `Bleeps`
   - Use Open-Meteo API (free, no key needed)
   - Test: "What's the weather in London?" → Bleeps calls tool, returns answer

3. **Enable FTS5 session search**
   - Add `search_context` to `configureSession`
   - Verify Bleeps can search its own conversation history

4. **UI: Show tool-call status**
   - When Bleeps calls a tool, show "🔍 Searching notes…" in the UI
   - Requires listening to tool call events from `useAgentChat`

5. **Write Stage 2 journal entry**
   - Document R2 spillover, custom tools, search, UI changes
   - Include the "wow" moment prompt/response

### Next Sprint (Days 8-14)

1. **Implement Codemode**
   - Add `worker_loaders` binding
   - Install `@cloudflare/codemode`
   - Add `createExecuteTool` with workspace access
   - Demo: "Count how many times I've mentioned 'React' in my notes"

2. **AI Gateway integration**
   - Create AI Gateway in Cloudflare dashboard
   - Route `getModel()` through gateway
   - Verify caching works (same prompt = cached response)

3. **Add `beforeTurn` hook**
   - Log every turn to console (later: to analytics)
   - Experiment with model switching for follow-up turns

---

## 12. Decision Log

| Date | Decision | Rationale | Reversible? |
|------|----------|-----------|-------------|
| 2026-05-20 | Rebuild on Project Think (not AIChatAgent) | Think gives us memory, workspace, compaction for free; AIChatAgent is lower-level | No (committed) |
| 2026-05-20 | Use kimi-k2.6 | Tuned for agentic loop and tool-calling; docs recommend it | Yes (swap in `getModel()`) |
| 2026-05-20 | Single global instance (`name: "miles"`) | Simplicity for Stage 1; auth comes later | Yes (Stage 7) |
| 2026-05-20 | Drop D1 + Vectorize | Workspace + context blocks replace both; simpler architecture | Yes (can re-add) |
| 2026-05-20 | Cloudflare orange terminal theme | Distinctive, on-brand, easy to maintain | Yes (CSS only) |
| 2026-05-20 | 3-layer testing (unit/integration/smoke) | Catches bugs at different levels; smoke validates deploy | No (best practice) |
| 2026-05-20 | Clean-slate migrations (v1→v2→v3) | Wiped test pollution; each rename = fresh start | No (historical) |
| 2026-05-30 | Add PROJECT_STRATEGY.md | Central decision log, roadmap, and learning tracker | Yes (living doc) |

---

## 13. Resources & References

### Official Documentation
- [Project Think announcement](https://blog.cloudflare.com/project-think/)
- [Think API reference](https://developers.cloudflare.com/agents/api-reference/think/)
- [Sessions API](https://developers.cloudflare.com/agents/api-reference/sessions/)
- [Sub-agents](https://developers.cloudflare.com/agents/api-reference/sub-agents/)
- [Agent tools](https://developers.cloudflare.com/agents/api-reference/agent-tools/)
- [Durable execution / fibers](https://developers.cloudflare.com/agents/api-reference/durable-execution/)
- [Browse the web (Browser Run)](https://developers.cloudflare.com/agents/api-reference/browse-the-web/)
- [MCP integration](https://developers.cloudflare.com/agents/api-reference/mcp/)
- [Vitest integration](https://developers.cloudflare.com/workers/testing/vitest-integration/)

### Source Code (Read When Docs Trail)
- [Think base class source](https://github.com/cloudflare/agents/blob/main/packages/think/src/think.ts)
- [Full assistant example](https://github.com/cloudflare/agents/tree/main/examples/assistant)
- [Codemode package](https://github.com/cloudflare/agents/tree/main/packages/codemode)
- [Worker bundler package](https://github.com/cloudflare/agents/tree/main/packages/worker-bundler)

### Learning Material
- [Dynamic Workers blog post](https://blog.cloudflare.com/dynamic-workers/)
- [Code mode blog post](https://blog.cloudflare.com/code-mode/)
- [Facets blog post](https://blog.cloudflare.com/durable-object-facets-dynamic-workers/)
- [Agents Week](https://blog.cloudflare.com/welcome-to-agents-week/)

---

## 14. How to Update This Document

This is a **living document**. Update it when:

1. **A stage completes** — mark it complete, add journal link, update metrics
2. **A new binding is added** — update the infrastructure table and learning tracker
3. **A decision is made** — add to the decision log
4. **A risk materializes** — update risk assessment with mitigation outcome
5. **The roadmap changes** — document the pivot and rationale

**Process:**
1. Make changes to `docs/PROJECT_STRATEGY.md`
2. Commit with message: `docs: update strategy — Stage N complete, added X binding`
3. The document is now the new source of truth

---

*Last updated: 2026-05-30*  
*Next review: After Stage 2 completion*
