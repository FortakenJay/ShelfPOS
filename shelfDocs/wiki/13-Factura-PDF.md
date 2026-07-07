# Factura PDF

Parent: [[Home]]

Landscape **A4 grid invoice** (not thermal receipt / not cierre PDF).

## Columns

`# | Código | Código Barra | Detalle | Cant | Precio | Desc% | Total`

Footer on last page: Subtotal, Descuento, Total.

Header fields: `document_number`, `currency`, `issue_date`, `print_date`, `client`, `identification`, `page`.

## POS implementation

| Piece | Path |
|-------|------|
| Data builder | `src/main/db/repos/salesReceipt.ts` → `buildFacturaPdfData()` |
| PDF service | `src/main/services/facturaPdf.ts` |
| IPC | `sales:exportFacturaPdf` in `ipc/sales.ts` |
| UI | Admin transaction log + itemized sales tables |

**Barcode:** `COALESCE(barcode_snapshot, products.barcode)` — snapshot stored at checkout (schema v14).

**Código:** digits 6–12 of barcode.

## Dashboard implementation

| Piece | Path |
|-------|------|
| HTML template | `src/lib/factura-pdf.ts` |
| Browser PDF | `src/lib/download-factura-pdf.ts` (html2canvas + jsPDF) |
| Supabase fetch | `src/lib/queries/factura-pdf.ts` |
| Per-sale button | `components/reports/SaleFacturaPdfButton.tsx` |
| Bulk export | `lib/reports-pdf.ts` |

## Related

- [[05-SQLite-Schema]] — `barcode_snapshot`
- [[12-Reports-And-Exports]]
