# Hacienda factura electrónica — implementation TODO

Parent: [[22-Hacienda-Factura-Electronica-Architecture]]  
Toolkit: `disect-Hacienda/`  
Status: **Backlog**

---

## Phase 0 — Compliance and sandbox access

- [ ] Confirm target stores are **Régimen Tradicional** (or obligado), not RTS-only
- [ ] Obtain ATV / TRIBU-CR sandbox credentials for test jurídica
- [ ] Obtain test `.p12` signing certificate + PIN
- [ ] Register test sucursal `001` and terminals `00001`–`00005` in internal runbook
- [ ] Document CIIU `codigoActividad` per pilot store (lookup via `lookupTaxpayer`)
- [ ] Legal review: emission vs transmission timing for offline / situación `3`

**Official refs:** [Anexos v4.4](https://atv.hacienda.go.cr/ATV/ComprobanteElectronico/docs/esquemas/2024/v4.4/ANEXOS%20Y%20ESTRUCTURAS_V4.4.pdf), [DGT-R-000-2024](https://www.hacienda.go.cr/docs/DGT-R-000-2024DisposicionesTecnicasDeComprobantesElectronicosCP.pdf)

---

## Phase 1 — Vendor SDK into ShelfPOS

- [ ] Add build step to vendor `@dojocoding/hacienda-sdk` + `shared` into POS main (mirror `sync-vendor.mjs` pattern)
- [ ] Pin SDK version; CI builds `disect-Hacienda` on release
- [ ] Wire `HACIENDA_PASSWORD` / `HACIENDA_P12_PIN` via DPAPI (never `settings` table plaintext)
- [ ] Settings UI: environment (`sandbox` | `production`), p12 path picker, test connection button
- [ ] Hub-only signing in [[20-Multi-Store-Hub-Architecture]] mode (centralized sequences)

---

## Phase 2 — Catalog prerequisites (CABYS + emisor)

- [ ] DB migration: `products.cabys` (`TEXT`, 13 digits, nullable → required for e-sale)
- [ ] Product form: CABYS field + validation + i18n
- [ ] Bulk import: CABYS column on CSV / eFactura / supplier PDF mapping
- [ ] Settings: full emisor block per v4.4 (`codigoActividad`, provincia, cantón, distrito, barrio, teléfono, email)
- [ ] Expose `tax_regime` change in admin (with accountant warning) — see [[24-Tax-Compliance]]
- [ ] Wire `taxBreakdown` on thermal receipt when `tax_regime === 'tradicional'`
- [ ] Validate emisor on first FE/TE submission (`validateFacturaInput` / emisor schema)
- [ ] Block electronic sale if product missing CABYS (clear `AppError` + toast)

---

## Phase 3 — Tiquete Electrónico (default checkout)

- [ ] Map `sales:create` → `LineItemInput[]` (IVA 13%, `round5`, discounts)
- [ ] Use `buildTiqueteXml` + `buildClave` (`DocumentType.TIQUETE_ELECTRONICO`, `Situation.NORMAL`)
- [ ] Align `nextConsecutivo()` with SDK `getNextSequence` (branch + terminal + `04`)
- [ ] `signAndEncode` → `submitAndWait` (timeout + retry policy)
- [ ] Persist `fe_comprobantes` row linked to `sales.id`
- [ ] Update `sales` with `fe_clave`, `fe_status` (`pending` | `accepted` | `rejected`)
- [ ] Thermal receipt: print **clave numérica** + Hacienda acceptance indicator (or “pendiente” if async)
- [ ] Handle rejection: cashier message, admin retry / void path, audit log

---

## Phase 4 — Factura Electrónica (identified customer)

- [ ] Payment flow: when customer requests factura → require receptor (tipo cédula, número, nombre, email optional)
- [ ] `buildFacturaXml` with full `receptor` node
- [ ] Map `IdType` fisica/juridica/dimex/nite → Hacienda codes `01`–`04`
- [ ] Reuse / extend `PaymentInvoiceCustomerSection`
- [ ] Sequence doc type `01` separate from tiquete `04`
- [ ] Dashboard + PDF export show FE vs TE

---

## Phase 5 — Offline and contingency

- [ ] Detect connectivity (`checkConnectivity` from SDK)
- [ ] If offline at sale: build XML + sign locally, `Situation.SIN_INTERNET` (`3`), queue in `fe_outbox`
- [ ] Background worker (hub or standalone): submit outbox when online
- [ ] Align with multi-store hub **sale outbox** ([[21-Multi-Store-Hub-TODO]]) — order: replay sale → submit FE
- [ ] Contingency `Situation.CONTINGENCIA` (`2`) — document when Hacienda API down but LAN up
- [ ] Admin UI: outbox depth, failed submissions, rejection reasons (`extractRejectionReason`)

---

## Phase 6 — Notas de crédito (returns)

- [ ] Link return to original sale `fe_clave`
- [ ] `buildNotaCreditoXml` with reference document
- [ ] Sequence type `03`; submit + store status
- [ ] Block return if original never accepted (policy + UI)
- [ ] Restock rules unchanged; electronic NC is additional step

---

## Phase 7 — Supplier / importer (inbound)

- [ ] Parse inbound FE XML from importer shipments (if XML provided)
- [ ] **Mensaje Receptor** — `buildMensajeReceptorXml` accept/reject within regulatory window
- [ ] Optional: `buildFacturaCompraXml` when buying from RTS non-emitter (paper backup → FEC)
- [ ] Tie to existing `productSupplierInvoicePdf` / receive flow ([[RELEASE_NOTES]] supplier PDF)

---

## Phase 8 — Sync and dashboard

- [ ] Add `fe_comprobantes` (or columns on `sales`) to `SYNC_TABLES` if owners need cloud visibility
- [ ] Dashboard: comprobante status per sale, filter rejected/pending
- [ ] Do **not** sync P12, passwords, or raw XML with secrets
- [ ] Reports: TE vs FE counts, rejection rate

---

## Phase 9 — Testing and certification

- [ ] Sandbox E2E: TE + FE + NC happy path (`disect-Hacienda` `e2e-pipeline.spec.ts` as reference)
- [ ] Sandbox rejection cases (bad CABYS, bad receptor, wrong totals)
- [ ] CLI regression: `hacienda validate` / `submit --dry-run` on fixture sales exported from POS
- [ ] Pilot on one tradicional store before importer network rollout
- [ ] Runbook: certificate expiry, password rotation, p12 replacement

---

## Phase 10 — RTS / simplified flag

- [ ] Settings: `tax_regime: traditional | rts`
- [ ] RTS: hide/disable electronic submission; keep thermal + paper PDF
- [ ] Installer question or accountant-driven setup
- [ ] Document FEC buyer obligation when purchasing from RTS vendors

---

## `disect-Hacienda` maintenance TODO

- [ ] Track upstream `DojoCodingLabs/hacienda-cr` releases vs local fork
- [ ] Fill missing `MASTER_PLAN.md` referenced in `.env.example` (credential setup guide)
- [ ] MCP server: use for dev QA only, not production POS path
- [ ] Keep Node 22+ alignment with POS Electron Node version

---

## Dependency graph

```
Phase 0 (credentials)
  → Phase 1 (vendor SDK)
    → Phase 2 (CABYS + emisor)
      → Phase 3 (TE) ──→ Phase 5 (offline)
      → Phase 4 (FE)
      → Phase 6 (NC)
    → Phase 7 (inbound) — parallel after Phase 1
  → Phase 8 (sync) after Phase 3+
  → Phase 9 (pilot)
```

**Parallel with hub:** Phase 3+ should target **store hub** as submission authority when [[20-Multi-Store-Hub-Architecture]] lands.

---

## Success criteria (pilot)

- [ ] 100 sandbox TE submitted and **accepted** from POS checkout
- [ ] 10 sandbox FE with real cédula validation
- [ ] 5 sandbox NC from returns
- [ ] Offline queue: 20 sales submitted after reconnect with 0 duplicate claves
- [ ] Accountant sign-off on tradicional compliance
