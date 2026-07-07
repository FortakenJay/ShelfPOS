import { useMutation, useQueryClient } from '@tanstack/react-query'

export function usePinAuthorize<T>(options: {
  mutationFn: (pin: string) => Promise<T>
  onSuccess?: (data: T, pin: string) => void
  onError?: (err: unknown) => void
}): ReturnType<typeof useMutation<T, unknown, string>> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: options.mutationFn,
    onSuccess: (data, pin) => {
      options.onSuccess?.(data, pin)
      void queryClient.invalidateQueries({ queryKey: ['audit'] })
    },
    onError: options.onError
  })
}
