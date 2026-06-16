import { useReducer, type Dispatch } from 'react'
import type { PaymentMethod } from '@shared/types'

export interface PaymentEntry {
  id: string
  method: PaymentMethod
  amount: string
  ref: string
}

export function newPaymentEntry(method: PaymentMethod, ref = ''): PaymentEntry {
  return { id: crypto.randomUUID(), method, amount: '', ref }
}

const METHODS: PaymentMethod[] = ['cash', 'card', 'sinpe']

export interface PaymentModalState {
  splitPayment: boolean
  singleMethod: PaymentMethod
  sinpeRef: string
  entries: PaymentEntry[]
  tendered: string
}

type PaymentModalAction =
  | { type: 'toggleSplit'; enabled: boolean; initialMethod: PaymentMethod }
  | { type: 'setSingleMethod'; value: PaymentMethod }
  | { type: 'setSinpeRef'; value: string }
  | { type: 'setTendered'; value: string | ((prev: string) => string) }
  | { type: 'updateEntry'; id: string; patch: Partial<PaymentEntry> }
  | { type: 'addEntry' }
  | { type: 'removeEntry'; id: string }

export function createInitialPaymentState(initialMethod: PaymentMethod): PaymentModalState {
  return {
    splitPayment: false,
    singleMethod: initialMethod,
    sinpeRef: '',
    entries: [newPaymentEntry(initialMethod)],
    tendered: ''
  }
}

function paymentModalReducer(
  state: PaymentModalState,
  action: PaymentModalAction
): PaymentModalState {
  switch (action.type) {
    case 'toggleSplit':
      if (action.enabled) {
        return {
          ...state,
          splitPayment: true,
          tendered: '',
          entries: [
            newPaymentEntry(
              state.singleMethod,
              state.singleMethod === 'sinpe' ? state.sinpeRef : ''
            )
          ]
        }
      }
      return {
        ...state,
        splitPayment: false,
        tendered: '',
        sinpeRef: state.entries.find((e) => e.method === 'sinpe')?.ref ?? state.sinpeRef,
        singleMethod: state.entries[0]?.method ?? action.initialMethod
      }
    case 'setSingleMethod':
      return { ...state, singleMethod: action.value }
    case 'setSinpeRef':
      return { ...state, sinpeRef: action.value }
    case 'setTendered':
      return {
        ...state,
        tendered:
          typeof action.value === 'function' ? action.value(state.tendered) : action.value
      }
    case 'updateEntry':
      return {
        ...state,
        entries: state.entries.map((e) =>
          e.id === action.id ? { ...e, ...action.patch } : e
        )
      }
    case 'addEntry': {
      const used = new Set(state.entries.map((e) => e.method))
      const next = METHODS.find((m) => !used.has(m)) ?? 'cash'
      return { ...state, entries: [...state.entries, newPaymentEntry(next)] }
    }
    case 'removeEntry':
      return { ...state, entries: state.entries.filter((e) => e.id !== action.id) }
    default:
      return state
  }
}

export function usePaymentModalState(initialMethod: PaymentMethod): {
  state: PaymentModalState
  dispatch: Dispatch<PaymentModalAction>
} {
  const [state, dispatch] = useReducer(
    paymentModalReducer,
    initialMethod,
    createInitialPaymentState
  )
  return { state, dispatch }
}
