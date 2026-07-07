import { Navigate } from '@tanstack/react-router'

/** Legacy route — language is toggled from login / sidebar switcher. */
export function ChooseLanguagePage(): React.JSX.Element {
  return <Navigate to="/login" replace />
}
