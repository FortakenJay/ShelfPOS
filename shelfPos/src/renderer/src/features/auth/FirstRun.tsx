import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import i18n from 'i18next'
import { api } from '@/lib/api'
import { AccountsStep } from './AccountsStep'
import { LanguagePicker } from './LanguagePicker'
import type { Language } from '@shared/types'

type Step = 'language' | 'accounts'

export function FirstRunWizard(): React.JSX.Element {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('language')
  const { data: status } = useQuery({ queryKey: ['firstRunStatus'], queryFn: api.firstRun.status })

  useEffect(() => {
    if (status && !status.needed) void navigate({ to: '/', replace: true })
  }, [status, navigate])

  const chooseLanguage = async (language: Language): Promise<void> => {
    await api.firstRun.setLanguage(language)
    await i18n.changeLanguage(language)
    setStep('accounts')
  }

  return (
    <div className="flex h-full flex-col items-center justify-center bg-chrome p-6">
      <div className="mb-8 text-4xl font-extrabold text-white">
        Shelf<span className="text-primary">POS</span>
      </div>
      {step === 'language' && <LanguagePicker onChoose={chooseLanguage} />}
      {step === 'accounts' && <AccountsStep backupPath={status?.backupDir ?? ''} />}
    </div>
  )
}
