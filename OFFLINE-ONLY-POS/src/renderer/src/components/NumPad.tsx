interface NumPadProps {
  onDigit: (digit: string) => void
  onBackspace: () => void
  onClear: () => void
}

export function NumPad({ onDigit, onBackspace, onClear }: NumPadProps): React.JSX.Element {
  const keys = ['7', '8', '9', '4', '5', '6', '1', '2', '3', 'C', '0', '⌫']
  return (
    <div className="grid grid-cols-3 gap-2">
      {keys.map((key) => (
        <button
          key={key}
          type="button"
          tabIndex={-1}
          onClick={() => {
            if (key === 'C') onClear()
            else if (key === '⌫') onBackspace()
            else onDigit(key)
          }}
          className="min-h-[56px] rounded-md border-2 border-line bg-white text-2xl font-bold hover:border-primary hover:text-primary active:bg-slate-100"
        >
          {key}
        </button>
      ))}
    </div>
  )
}
