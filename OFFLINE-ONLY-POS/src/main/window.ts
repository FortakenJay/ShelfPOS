import { BrowserWindow, dialog } from 'electron'
import type { SaveDialogOptions, SaveDialogReturnValue } from 'electron'

/** Focused app window, or the first open window — for modal dialogs. */
export function appBrowserWindow(): BrowserWindow | undefined {
  const focused = BrowserWindow.getFocusedWindow()
  if (focused && !focused.isDestroyed()) return focused
  return BrowserWindow.getAllWindows().find((w) => !w.isDestroyed())
}

export async function showSaveDialog(options: SaveDialogOptions): Promise<SaveDialogReturnValue> {
  const parent = appBrowserWindow()
  parent?.focus()
  return parent ? dialog.showSaveDialog(parent, options) : dialog.showSaveDialog(options)
}
