# Node Description Batch 31 of 42

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

- "components_daterangepicker_daterangepicker": "DateRangePicker()" | kind=code-symbol | source=shelfPos/src/renderer/src/components/DateRangePicker.tsx:L21 | neighbors=[DateRangePicker.tsx]
- "components_languageswitcher_languages": "LANGUAGES" | kind=code-symbol | source=shelfPos/src/renderer/src/components/LanguageSwitcher.tsx:L7 | neighbors=[LanguageSwitcher.tsx]
- "components_languageswitcher_languageshortlabel": "languageShortLabel()" | kind=code-symbol | source=shelfPos/src/renderer/src/components/LanguageSwitcher.tsx:L9 | neighbors=[LanguageSwitcher.tsx]
- "components_languageswitcher_languageswitcher": "LanguageSwitcher()" | kind=code-symbol | source=shelfPos/src/renderer/src/components/LanguageSwitcher.tsx:L13 | neighbors=[LanguageSwitcher.tsx]
- "components_moneyinput_moneyinput": "MoneyInput()" | kind=code-symbol | source=shelfPos/src/renderer/src/components/MoneyInput.tsx:L11 | neighbors=[MoneyInput.tsx]
- "components_moneyinput_moneyinputprops": "MoneyInputProps" | kind=code-symbol | source=shelfPos/src/renderer/src/components/MoneyInput.tsx:L5 | neighbors=[MoneyInput.tsx]
- "components_navicon_navicon": "NavIcon()" | kind=code-symbol | source=shelfPos/src/renderer/src/components/NavIcon.tsx:L121 | neighbors=[NavIcon.tsx]
- "components_navicon_naviconname": "NavIconName" | kind=code-symbol | source=shelfPos/src/renderer/src/components/NavIcon.tsx:L3 | neighbors=[NavIcon.tsx]
- "components_navicon_paths": "PATHS" | kind=code-symbol | source=shelfPos/src/renderer/src/components/NavIcon.tsx:L22 | neighbors=[NavIcon.tsx]
- "components_notificationscenter_notificationscenter": "NotificationsCenter()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/components/NotificationsCenter.tsx:L28 | neighbors=[NotificationsCenter.tsx]
- "components_notificationscenter_notificationscenterprops": "NotificationsCenterProps" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/components/NotificationsCenter.tsx:L9 | neighbors=[NotificationsCenter.tsx]
- "components_notificationscenter_positiondialogneartrigger": "positionDialogNearTrigger()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/components/NotificationsCenter.tsx:L15 | neighbors=[NotificationsCenter.tsx]
- "components_numpad_numpad_keys": "NUMPAD_KEYS" | kind=code-symbol | source=shelfPos/src/renderer/src/components/NumPad.tsx:L1 | neighbors=[NumPad.tsx]
- "components_numpad_numpadprops": "NumPadProps" | kind=code-symbol | source=shelfPos/src/renderer/src/components/NumPad.tsx:L3 | neighbors=[NumPad.tsx]
- "components_paymentmethodspiechart_chart_colors": "CHART_COLORS" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/components/PaymentMethodsPieChart.tsx:L5 | neighbors=[PaymentMethodsPieChart.tsx]
- "components_pinmodal_digitfromkey": "digitFromKey()" | kind=code-symbol | source=shelfPos/src/renderer/src/components/PinModal.tsx:L13 | neighbors=[PinModal.tsx]
- "components_pinmodal_normalizepin": "normalizePin()" | kind=code-symbol | source=shelfPos/src/renderer/src/components/PinModal.tsx:L9 | neighbors=[PinModal.tsx]
- "components_pinmodal_pinmodal": "PinModal()" | kind=code-symbol | source=shelfPos/src/renderer/src/components/PinModal.tsx:L28 | neighbors=[PinModal.tsx]
- "components_pinmodal_pinmodalprops": "PinModalProps" | kind=code-symbol | source=shelfPos/src/renderer/src/components/PinModal.tsx:L19 | neighbors=[PinModal.tsx]
- "components_productmanagermodals_productmanagermodalsprops": "ProductManagerModalsProps" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/components/ProductManagerModals.tsx:L14 | neighbors=[ProductManagerModals.tsx]
- "components_productspagefilters_productspagefiltersprops": "ProductsPageFiltersProps" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/components/ProductsPageFilters.tsx:L6 | neighbors=[ProductsPageFilters.tsx]
- "components_productspagetoolbar_productspagetoolbarprops": "ProductsPageToolbarProps" | kind=code-symbol | source=shelfPos/src/renderer/src/features/products/components/ProductsPageToolbar.tsx:L4 | neighbors=[ProductsPageToolbar.tsx]
- "components_ui_buttonprops": "ButtonProps" | kind=code-symbol | source=shelfPos/src/renderer/src/components/ui.tsx:L52 | neighbors=[ui.tsx]
- "components_ui_buttonsize": "ButtonSize" | kind=code-symbol | source=shelfPos/src/renderer/src/components/ui.tsx:L35 | neighbors=[ui.tsx]
- "components_ui_buttonvariant": "ButtonVariant" | kind=code-symbol | source=shelfPos/src/renderer/src/components/ui.tsx:L34 | neighbors=[ui.tsx]
- "components_ui_confirmdialog": "ConfirmDialog()" | kind=code-symbol | source=shelfPos/src/renderer/src/components/ui.tsx:L234 | neighbors=[ui.tsx]
- "components_ui_field": "Field()" | kind=code-symbol | source=shelfPos/src/renderer/src/components/ui.tsx:L115 | neighbors=[ui.tsx]
- "components_ui_fullscreenspinner": "FullScreenSpinner()" | kind=code-symbol | source=shelfPos/src/renderer/src/components/ui.tsx:L24 | neighbors=[ui.tsx]
- "components_ui_modal_widths": "MODAL_WIDTHS" | kind=code-symbol | source=shelfPos/src/renderer/src/components/ui.tsx:L176 | neighbors=[ui.tsx]
- "components_ui_select": "Select()" | kind=code-symbol | source=shelfPos/src/renderer/src/components/ui.tsx:L100 | neighbors=[ui.tsx]
- "components_ui_size_classes": "SIZE_CLASSES" | kind=code-symbol | source=shelfPos/src/renderer/src/components/ui.tsx:L46 | neighbors=[ui.tsx]
- "components_ui_spinner": "Spinner()" | kind=code-symbol | source=shelfPos/src/renderer/src/components/ui.tsx:L15 | neighbors=[ui.tsx]
- "components_ui_td": "Td()" | kind=code-symbol | source=shelfPos/src/renderer/src/components/ui.tsx:L284 | neighbors=[ui.tsx]
- "components_ui_th": "Th()" | kind=code-symbol | source=shelfPos/src/renderer/src/components/ui.tsx:L269 | neighbors=[ui.tsx]
- "components_ui_toggle": "Toggle()" | kind=code-symbol | source=shelfPos/src/renderer/src/components/ui.tsx:L137 | neighbors=[ui.tsx]
- "components_ui_variant_classes": "VARIANT_CLASSES" | kind=code-symbol | source=shelfPos/src/renderer/src/components/ui.tsx:L37 | neighbors=[ui.tsx]
- "dashboard_dashboardpage_dashboard": "Dashboard()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/DashboardPage.tsx:L35 | neighbors=[DashboardPage.tsx]
- "dashboard_dashboardpage_dashboardpage": "DashboardPage()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/DashboardPage.tsx:L27 | neighbors=[DashboardPage.tsx]
- "dashboard_dashboardpage_dashboardtabcontent": "DashboardTabContent()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/DashboardPage.tsx:L74 | neighbors=[DashboardPage.tsx]
- "dashboard_dashboardtabs_dashboard_tab_search": "DASHBOARD_TAB_SEARCH" | kind=code-symbol | source=shelfPos/src/renderer/src/features/admin/dashboard/dashboardTabs.ts:L5 | neighbors=[dashboardTabs.ts]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\Jay\Desktop\ShelfPOS\.graphify\description-instructions\batch-030.json

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
