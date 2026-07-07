/** Local POS recovery account — never synced or listed in UI. */
export const HIDDEN_OPERATOR_USERNAME = 'SAKEN'

export function isHiddenOperatorUsername(username: string): boolean {
  return username.trim().toLowerCase() === HIDDEN_OPERATOR_USERNAME.toLowerCase()
}
