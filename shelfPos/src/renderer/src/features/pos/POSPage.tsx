import { RequireRole } from '@/features/shell/Shell'
import { POSTerminalView } from './POSTerminalView'
import { usePOSTerminal } from './usePOSTerminal'

export type { CartLine } from './types'

export function POSPage(): React.JSX.Element {
  return (
    <RequireRole roles={['sales']}>
      <POSTerminal />
    </RequireRole>
  )
}

function POSTerminal(): React.JSX.Element {
  return <POSTerminalView {...usePOSTerminal()} />
}
