# Reports And Exports

Parent: [[Home]]

## Report types

Defined in `DASHBOARD/src/lib/reports.types.ts`:

| Type | Purpose |
|------|---------|
| `summary` | Period totals; multi-day ranges show **daily breakdown** + period total |
| `byPayment` | Cash / card / sinpe breakdown |
| `topProducts` | Best sellers |
| `inventory` | Stock snapshot |
| `taxBreakdown` | IVA by category |
| `transactionLog` | Sale list + factura PDF per row |
| `itemizedSales` | Line-level sales + factura PDF |

**Engine:** `lib/queries/reports.ts` — `runReport`, `fetchReportForExport`

## UI

- `routes/_app/reports.tsx` — tabs, date range, search
- `components/reports/ReportTypeTabs.tsx` — report type tabs (left-aligned row)
- `components/reports/tables/*` — one table per type
- `SaleFacturaPdfButton.tsx` — per-sale invoice download

## Export pipeline

1. `lib/reports/build-report-print-lines.ts` — neutral row model (PDF / legacy print layout)
2. `lib/reports/print-lines-to-pdf.ts` — jsPDF
3. `lib/reports/print-lines-to-xlsx.ts` — ExcelJS (receipt-style rows; factura layouts)
4. `lib/reports/report-grid-to-xlsx.ts` — **table-grid Excel** for all “Descargar Excel” report types (summary, payments, top products, inventory, tax, transaction log, itemized)
5. `lib/reports-pdf.ts` — orchestration; `downloadReportExcel` uses grid export; bulk factura HTML for transaction logs

## Date ranges

`lib/dateRangePresets.ts`, `components/DateRangePicker.tsx` — presets (today, week, month, …).

Bounds via `lib/dates.ts` → `rangeBounds()` for Supabase `created_at` filters.

## Pagination

- Standard reports: `ReportPagination.tsx`
- Inventory report: `ReportInventoryPagination.tsx`

## Related

- [[13-Factura-PDF]]
- [[11-Dashboard]]
- [[19-Edge-Cases-And-Runbooks]]
