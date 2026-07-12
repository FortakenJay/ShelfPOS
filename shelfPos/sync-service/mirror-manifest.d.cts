export interface MirrorTableDefinition {
  readonly table: string
  readonly localTable: string
  readonly columns: readonly string[]
}

export const MIRROR_MANIFEST: readonly MirrorTableDefinition[]
export const MIRROR_TABLES: readonly string[]
export function getMirrorDefinition(table: string): MirrorTableDefinition
export function buildTableSelect(definition: MirrorTableDefinition): string
