import logo from '@/assets/appSHELFPOS.png'

export function AppLogo({
  className = '',
  imgClassName = '',
  size = 'md',
  showWordmark = true
}: {
  className?: string
  imgClassName?: string
  size?: 'sm' | 'md' | 'lg'
  showWordmark?: boolean
}): React.JSX.Element {
  const height =
    size === 'lg' ? 'h-16' : size === 'sm' ? 'h-8' : 'h-10'
  const textSize =
    size === 'lg' ? 'text-3xl' : size === 'sm' ? 'text-lg' : 'text-xl'

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src={logo}
        alt=""
        className={`${height} w-auto max-w-full shrink-0 object-contain ${imgClassName}`}
      />
      {showWordmark && (
        <span className={`font-extrabold tracking-tight ${textSize}`} aria-label="ShelfPOS">
          <span className="text-white">Shelf</span>
          <span className="text-slate-400">POS</span>
        </span>
      )}
    </div>
  )
}
