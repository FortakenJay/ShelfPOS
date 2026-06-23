import { createFileRoute, Link } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StorePairingList } from '#/components/StorePairingList'
import { Button, Field, Input } from '#/components/ui'
import { createStorePairing, listPendingPairings } from '#/lib/queries/store-claims'
import { useToast } from '#/lib/toast'

export const Route = createFileRoute('/_app/link-pos')({
  component: LinkPosPage,
})

function LinkPosPage() {
  const { t } = useTranslation()
  const { show } = useToast()
  const queryClient = useQueryClient()
  const [label, setLabel] = useState('')

  const copyPairingCode = async (code: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(code)
      show(t('linkPos.copied'))
    } catch {
      /* optional */
    }
  }

  const {
    data: pairings = [],
    isPending: listLoading,
    error: listError,
  } = useQuery({
    queryKey: ['store-pairings'],
    queryFn: listPendingPairings,
    staleTime: 30_000,
  })

  const addLabeled = useMutation({
    mutationFn: () => createStorePairing(label.trim() || undefined),
    onSuccess: () => {
      setLabel('')
      void queryClient.invalidateQueries({ queryKey: ['store-pairings'] })
    },
  })

  return (
    <div className="p-6">
      <div className="mx-auto w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-slate-900">{t('linkPos.title')}</h1>
        <p className="mt-2 text-[15px] text-slate-600">{t('linkPos.description')}</p>

        <ol className="mt-6 list-decimal space-y-3 pl-5 text-[15px] text-slate-700">
          <li>{t('linkPos.stepCopy')}</li>
          <li>{t('linkPos.stepInstaller')}</li>
          <li>{t('linkPos.stepRefresh')}</li>
        </ol>

        <div className="mt-8 rounded-xl border-2 border-line bg-white p-6">
          {listError instanceof Error ? (
            <p className="mb-4 font-semibold text-danger">{listError.message}</p>
          ) : null}

          <StorePairingList
            pairings={pairings}
            loading={listLoading}
            onCopy={(c) => void copyPairingCode(c)}
          />

          <div className="mt-6 border-t border-line pt-5">
            <p className="mb-3 text-[14px] font-semibold text-slate-800">{t('linkPos.labeledTitle')}</p>
            <div className="flex flex-wrap items-end gap-3">
              <Field label={t('linkPos.labelOptional')} className="min-w-[200px] flex-1">
                <Input
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder={t('linkPos.labelPlaceholder')}
                />
              </Field>
              <Button
                type="button"
                variant="outline"
                disabled={addLabeled.isPending}
                onClick={() => addLabeled.mutate()}
              >
                {addLabeled.isPending ? t('linkPos.generating') : t('linkPos.addLabeled')}
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Link
            to="/dashboard"
            className="inline-flex min-h-10 items-center rounded-md border-2 border-line bg-white px-4 py-2 text-[15px] font-semibold text-slate-800 hover:border-primary"
            onClick={() => {
              void queryClient.invalidateQueries({ queryKey: ['stores'] })
            }}
          >
            {t('linkPos.goDashboard')}
          </Link>
        </div>
      </div>
    </div>
  )
}
