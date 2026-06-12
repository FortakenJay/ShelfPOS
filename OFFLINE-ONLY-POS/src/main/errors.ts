/** Error carrying an i18n key that the renderer can translate. */
export class AppError extends Error {
  constructor(public readonly key: string) {
    super(key)
    this.name = 'AppError'
  }
}
