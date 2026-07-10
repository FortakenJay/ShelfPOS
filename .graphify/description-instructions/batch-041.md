# Node Description Batch 42 of 42

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

- "src_router_usersroute": "usersRoute" | kind=code-symbol | source=shelfPos/src/renderer/src/router.tsx:L214 | neighbors=[router.tsx]
- "src_vite_env_d_importmeta": "ImportMeta" | kind=code-symbol | source=shelfPos/src/renderer/src/vite-env.d.ts:L7 | neighbors=[vite-env.d.ts]
- "src_vite_env_d_importmetaenv": "ImportMetaEnv" | kind=code-symbol | source=shelfPos/src/renderer/src/vite-env.d.ts:L3 | neighbors=[vite-env.d.ts]
- "sync_setup_syncsetuppage_syncsetuppage": "SyncSetupPage()" | kind=code-symbol | source=shelfPos/src/renderer/src/features/sync-setup/SyncSetupPage.tsx:L10 | neighbors=[SyncSetupPage.tsx]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\Jay\Desktop\ShelfPOS\.graphify\description-instructions\batch-041.json

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
