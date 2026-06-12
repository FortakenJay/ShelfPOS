import './assets/main.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { api } from '@/lib/api'
import { initI18n } from '@/i18n'
import { ToastProvider } from '@/lib/toast'
import { router } from '@/router'
import type { Language } from '@shared/types'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 5_000
    },
    mutations: { retry: false }
  }
})

async function bootstrap(): Promise<void> {
  let language: Language | null = null
  try {
    language = (await api.settings.get()).language
  } catch (err) {
    console.error('Failed to load settings before render', err)
  }
  await initI18n(language)

  createRoot(document.getElementById('root') as HTMLElement).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </QueryClientProvider>
    </StrictMode>
  )
}

void bootstrap()
