/// <reference path="../../preload/index.d.ts" />

const ERROR_MESSAGES: Record<string, string> = {
  'errors.licenseInvalid': 'Licencia inválida o alterada.',
  'errors.licenseWrongDevice': 'Esta licencia es para otro equipo.',
  'errors.licenseExpired': 'Licencia vencida. Contacte soporte.',
  'errors.licenseMissing': 'No hay licencia activa.',
  'errors.invalidInput': 'Ingrese una clave de licencia.',
  'errors.unknown': 'Error inesperado. Intente de nuevo.'
}

const machineInput = document.getElementById('machine-id') as HTMLInputElement
const licenseInput = document.getElementById('license-key') as HTMLTextAreaElement
const feedback = document.getElementById('feedback') as HTMLParagraphElement
const activateBtn = document.getElementById('activate') as HTMLButtonElement

function showFeedback(message: string, kind: 'error' | 'success'): void {
  feedback.hidden = false
  feedback.textContent = message
  feedback.className = `feedback ${kind}`
}

async function loadStatus(): Promise<void> {
  const status = await window.license.getStatus()
  machineInput.value = status.machineId
  if (!status.valid && status.error) {
    showFeedback(ERROR_MESSAGES[status.error] ?? status.error, 'error')
  }
}

activateBtn.addEventListener('click', () => {
  void (async () => {
    const jwt = licenseInput.value.trim()
    if (!jwt) {
      showFeedback(ERROR_MESSAGES['errors.invalidInput'], 'error')
      return
    }

    activateBtn.disabled = true
    feedback.hidden = true

    const result = await window.license.activate(jwt)
    if (!result.ok) {
      showFeedback(ERROR_MESSAGES[result.error] ?? result.error, 'error')
      activateBtn.disabled = false
      return
    }

    showFeedback('Licencia activada correctamente.', 'success')
  })()
})

void loadStatus()
