import { useReducer, type Dispatch } from 'react'
import { formatMoneyInputFromNumber, roundColones } from '@shared/money'
import type { PaymentMethod } from '@shared/types'

function defaultCashTendered(total: number): string {
  return formatMoneyInputFromNumber(roundColones(total))
}

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
  | { type: 'toggleSplit'; enabled: boolean; initialMethod: PaymentMethod; total: number }
  | { type: 'setSingleMethod'; value: PaymentMethod; total: number }
  | { type: 'setSinpeRef'; value: string }
  | { type: 'setTendered'; value: string | ((prev: string) => string) }
  | { type: 'updateEntry'; id: string; patch: Partial<PaymentEntry> }
  | { type: 'addEntry' }
  | { type: 'removeEntry'; id: string }

export function createInitialPaymentState(
  initialMethod: PaymentMethod,
  total: number
): PaymentModalState {
  return {
    splitPayment: false,
    singleMethod: initialMethod,
    sinpeRef: '',
    entries: [newPaymentEntry(initialMethod)],
    tendered: initialMethod === 'cash' ? defaultCashTendered(total) : ''
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
      {
        const singleMethod = state.entries[0]?.method ?? action.initialMethod
        return {
          ...state,
          splitPayment: false,
          tendered: singleMethod === 'cash' ? defaultCashTendered(action.total) : '',
          sinpeRef: state.entries.find((e) => e.method === 'sinpe')?.ref ?? state.sinpeRef,
          singleMethod
        }
      }
    case 'setSingleMethod':
      return {
        ...state,
        singleMethod: action.value,
        tendered: action.value === 'cash' ? defaultCashTendered(action.total) : ''
      }
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

export function usePaymentModalState(
  initialMethod: PaymentMethod,
  total: number
): {
  state: PaymentModalState
  dispatch: Dispatch<PaymentModalAction>
} {
  const [state, dispatch] = useReducer(
    paymentModalReducer,
    { initialMethod, total },
    ({ initialMethod: method, total: saleTotal }) =>
      createInitialPaymentState(method, saleTotal)
  )
  return { state, dispatch }
}
