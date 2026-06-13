/** Error carrying an i18n key (and optional interpolation vars) that the renderer can translate. */
export class AppError extends Error {
  constructor(
    public readonly key: string,
    public readonly vars?: Record<string, string | number>
  ) {
    super(key)
    this.name = 'AppError'
  }
}
