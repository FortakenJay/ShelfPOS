# ShelfPOS Obsidian Wiki

Open this folder as an **Obsidian vault** (`File → Open folder as vault` → `docs/wiki`).

**Start at:** [[Home]]

## For Cursor / other AI tools

**Best single file for LLM context:**

- [`../shelfpos_context.md`](../shelfpos_context.md) — project overview, domain rules, architecture, DB, code index, known issues

**Structured LLM chapters:**

- [`../llm/README.md`](../llm/README.md) — overview, business rules, architecture, database, features, code index

**Editing rules + deep runbooks:**

- `docs/wiki/Home.md` — map of content
- `docs/wiki/17-Conventions-For-AI.md` — editing rules

**Architecture decisions:** [`../decisions/README.md`](../decisions/README.md)

## Pages

| File | Topic |
|------|-------|
| `Home.md` | Index + diagrams |
| `01-Repository-Overview.md` | Monorepo layout |
| `02-Architecture.md` | Layers, principles |
| `03-Data-Flow.md` | Sale → sync → dashboard |
| `04-Multi-Tenant-Security.md` | RLS, claims, owners |
| `05-SQLite-Schema.md` | Local DB v20 |
| `06-Supabase-Schema.md` | Mirror + RPCs |
| `07-POS-Main-Process.md` | Electron main |
| `08-POS-Renderer.md` | React UI |
| `09-IPC-Reference.md` | IPC channels |
| `10-Sync-Service.md` | Windows Service sync (architecture + ops) |
| `11-Dashboard.md` | Web panel |
| `12-Reports-And-Exports.md` | Reports + PDF/XLSX |
| `13-Factura-PDF.md` | Invoice PDF |
| `14-Environment-Variables.md` | Env reference |
| `15-Setup-And-Deployment.md` | Production + dev onboarding, claim flow, release updates |
| `16-Error-Handling.md` | AppError, i18n |
| `17-Conventions-For-AI.md` | Agent checklist |
| `18-Quality-And-Tooling.md` | Lint, React Doctor, graphify, Bugbot, pre-commit |
| `19-Edge-Cases-And-Runbooks.md` | Install, sync, dashboard pitfalls + symptom → action (incl. `StartPending` after install) |
