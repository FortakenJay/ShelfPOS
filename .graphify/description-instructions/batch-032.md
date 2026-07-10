# Node Description Batch 33 of 42

Graphify is running in assistant/skill mode (no API key). You are the host
assistant (Claude Code / Codex / Gemini CLI). Read the prompt below and write
your JSON answer to the answer file.

## Prompt

You are documenting nodes in a knowledge graph.
For each entry below, write ONE concise factual plain-language sentence
describing what it is or does. Use only the provided context.
For a code symbol (kind=code-symbol — a function, class, or constant),
describe what the function/symbol does based on its name, source location
and neighbors — e.g. "Resolves the configured ontology profile from graphify.yaml.".
Write every description in English (en). Do not switch languages.
No marketing language.
Respond ONLY with a JSON object mapping each node id (as a string) to its
one-sentence description — no prose, no markdown fences.

- "ipc_products_productprintkind": "ProductPrintKind" | kind=code-symbol | source=shelfPos/src/main/ipc/products.ts:L95 | neighbors=[products.ts]
- "ipc_reports_validaterange": "validateRange()" | kind=code-symbol | source=shelfPos/src/main/ipc/reports.ts:L76 | neighbors=[reports.ts]
- "ipc_returns_salelinerow": "SaleLineRow" | kind=code-symbol | source=shelfPos/src/main/ipc/returns.ts:L12 | neighbors=[returns.ts]
- "ipc_sales_cleantext": "cleanText()" | kind=code-symbol | source=shelfPos/src/main/ipc/sales.ts:L69 | neighbors=[sales.ts]
- "ipc_sales_id_types": "ID_TYPES" | kind=code-symbol | source=shelfPos/src/main/ipc/sales.ts:L41 | neighbors=[sales.ts]
- "ipc_sales_ismiscsaleline": "isMiscSaleLine()" | kind=code-symbol | source=shelfPos/src/main/ipc/sales.ts:L74 | neighbors=[sales.ts]
- "ipc_sales_nextconsecutivo": "nextConsecutivo()" | kind=code-symbol | source=shelfPos/src/main/ipc/sales.ts:L52 | neighbors=[sales.ts]
- "ipc_sales_payment_methods": "PAYMENT_METHODS" | kind=code-symbol | source=shelfPos/src/main/ipc/sales.ts:L42 | neighbors=[sales.ts]
- "ipc_sales_pricedsaleline": "PricedSaleLine" | kind=code-symbol | source=shelfPos/src/main/ipc/sales.ts:L78 | neighbors=[sales.ts]
- "ipc_sales_sales_or_admin": "SALES_OR_ADMIN" | kind=code-symbol | source=shelfPos/src/main/ipc/sales.ts:L40 | neighbors=[sales.ts]
- "ipc_sales_sell": "SELL" | kind=code-symbol | source=shelfPos/src/main/ipc/sales.ts:L39 | neighbors=[sales.ts]
- "ipc_settings_id_types": "ID_TYPES" | kind=code-symbol | source=shelfPos/src/main/ipc/settings.ts:L21 | neighbors=[settings.ts]
- "ipc_settings_shortcut_keys": "SHORTCUT_KEYS" | kind=code-symbol | source=shelfPos/src/main/ipc/settings.ts:L22 | neighbors=[settings.ts]
- "ipc_syncsetup_syncsetupstatus": "syncSetupStatus()" | kind=code-symbol | source=shelfPos/src/main/ipc/syncSetup.ts:L13 | neighbors=[syncSetup.ts]
- "ipc_users_admin": "ADMIN" | kind=code-symbol | source=shelfPos/src/main/ipc/users.ts:L20 | neighbors=[users.ts]
- "ipc_users_assertnotlastadmin": "assertNotLastAdmin()" | kind=code-symbol | source=shelfPos/src/main/ipc/users.ts:L22 | neighbors=[users.ts]
- "lib_api_apierror_constructor": ".constructor()" | kind=code-symbol | source=shelfPos/src/renderer/src/lib/api.ts:L70 | neighbors=[ApiError]
- "lib_cartline_cartlinebarcode": "cartLineBarcode()" | kind=code-symbol | source=shelfPos/src/renderer/src/lib/cartLine.ts:L52 | neighbors=[cartLine.ts]
- "lib_cartline_cartlinedisplayname": "cartLineDisplayName()" | kind=code-symbol | source=shelfPos/src/renderer/src/lib/cartLine.ts:L44 | neighbors=[cartLine.ts]
- "lib_cartline_cartlinehascustomprice": "cartLineHasCustomPrice()" | kind=code-symbol | source=shelfPos/src/renderer/src/lib/cartLine.ts:L40 | neighbors=[cartLine.ts]
- "lib_cartline_cartlinekey": "cartLineKey()" | kind=code-symbol | source=shelfPos/src/renderer/src/lib/cartLine.ts:L5 | neighbors=[cartLine.ts]
- "lib_cartline_cartlineshowsbulk": "cartLineShowsBulk()" | kind=code-symbol | source=shelfPos/src/renderer/src/lib/cartLine.ts:L32 | neighbors=[cartLine.ts]
- "lib_carttabsnapshot_carttabsnapshot": "CartTabSnapshot" | kind=code-symbol | source=shelfPos/src/renderer/src/lib/cartTabSnapshot.ts:L10 | neighbors=[cartTabSnapshot.ts]
- "lib_carttabsnapshot_empty_cart_tab_snapshot": "EMPTY_CART_TAB_SNAPSHOT" | kind=code-symbol | source=shelfPos/src/renderer/src/lib/cartTabSnapshot.ts:L16 | neighbors=[cartTabSnapshot.ts]
- "lib_carttabsnapshot_livesaletotal": "liveSaleTotal()" | kind=code-symbol | source=shelfPos/src/renderer/src/lib/cartTabSnapshot.ts:L44 | neighbors=[cartTabSnapshot.ts]
- "lib_carttabsnapshot_parsecarttabsnapshot": "parseCartTabSnapshot()" | kind=code-symbol | source=shelfPos/src/renderer/src/lib/cartTabSnapshot.ts:L22 | neighbors=[cartTabSnapshot.ts]
- "lib_errors_stockallows": "stockAllows()" | kind=code-symbol | source=shelfPos/src/renderer/src/lib/errors.ts:L15 | neighbors=[errors.ts]
- "lib_errors_toastapierror": "toastApiError()" | kind=code-symbol | source=shelfPos/src/renderer/src/lib/errors.ts:L6 | neighbors=[errors.ts]
- "lib_errors_toasts": "Toasts" | kind=code-symbol | source=shelfPos/src/renderer/src/lib/errors.ts:L4 | neighbors=[errors.ts]
- "lib_format_formatdate": "formatDate()" | kind=code-symbol | source=shelfPos/src/renderer/src/lib/format.ts:L12 | neighbors=[format.ts]
- "lib_format_parsecolonesinput": "parseColonesInput()" | kind=code-symbol | source=shelfPos/src/renderer/src/lib/format.ts:L28 | neighbors=[format.ts]
- "lib_format_todaystr": "todayStr()" | kind=code-symbol | source=shelfPos/src/renderer/src/lib/format.ts:L21 | neighbors=[format.ts]
- "lib_printtoasts_notifyprintfailure": "notifyPrintFailure()" | kind=code-symbol | source=shelfPos/src/renderer/src/lib/printToasts.ts:L4 | neighbors=[printToasts.ts]
- "lib_session_useinvalidatesession": "useInvalidateSession()" | kind=code-symbol | source=shelfPos/src/renderer/src/lib/session.ts:L14 | neighbors=[session.ts]
- "lib_shortcuts_eventtoshortcutkey": "eventToShortcutKey()" | kind=code-symbol | source=shelfPos/src/renderer/src/lib/shortcuts.ts:L3 | neighbors=[shortcuts.ts]
- "lib_toast_kind_bar": "KIND_BAR" | kind=code-symbol | source=shelfPos/src/renderer/src/lib/toast.tsx:L104 | neighbors=[toast.tsx]
- "lib_toast_kind_styles": "KIND_STYLES" | kind=code-symbol | source=shelfPos/src/renderer/src/lib/toast.tsx:L96 | neighbors=[toast.tsx]
- "lib_toast_no_op_toast_api": "NO_OP_TOAST_API" | kind=code-symbol | source=shelfPos/src/renderer/src/lib/toast.tsx:L35 | neighbors=[toast.tsx]
- "lib_toast_toast": "Toast" | kind=code-symbol | source=shelfPos/src/renderer/src/lib/toast.tsx:L13 | neighbors=[toast.tsx]
- "lib_toast_toastaction": "ToastAction" | kind=code-symbol | source=shelfPos/src/renderer/src/lib/toast.tsx:L8 | neighbors=[toast.tsx]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\Jay\Desktop\ShelfPOS\.graphify\description-instructions\batch-032.json

Keep each description factual and concise (one sentence). No markdown, no prose
outside the JSON object. It is acceptable to omit a node if context is
insufficient — but include every node you can ground confidently.

Example answer format:
```json
{
  "node_id_1": "Resolves the configured ontology profile from graphify.yaml.",
  "node_id_2": "Colonel James Barclay, an antagonist in The Crooked Man."
}
```
