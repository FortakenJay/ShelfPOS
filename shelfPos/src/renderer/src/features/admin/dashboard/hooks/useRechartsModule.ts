import { useEffect, useState } from 'react'

export type RechartsModule = typeof import('recharts')

let rechartsModulePromise: Promise<RechartsModule> | null = null

function loadRechartsModule(): Promise<RechartsModule> {
  rechartsModulePromise ??= import('recharts')
  return rechartsModulePromise
}

/** Loads recharts on demand (separate bundle chunk). Returns null until ready. */
export function useRechartsModule(): RechartsModule | null {
  const [module, setModule] = useState<RechartsModule | null>(null)

  useEffect(() => {
    let active = true
    void loadRechartsModule().then((loaded) => {
      if (active) setModule(loaded)
    })
    return () => {
      active = false
    }
  }, [])

  return module
}
