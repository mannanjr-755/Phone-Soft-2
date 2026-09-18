import Link from 'next/link'
import { cn } from '@/lib/utils'

const sizeClasses = {
  navbar: 'h-9 sm:h-10',
  sidebar: 'h-10 sm:h-11',
  auth: 'h-12 sm:h-14',
} as const

interface BrandLogoProps {
  href?: string | null
  size?: keyof typeof sizeClasses
  className?: string
  priority?: boolean
}

export function BrandLogo({
  href = '/dashboard',
  size = 'navbar',
  className,
}: BrandLogoProps) {
  const mark = (
    <div className={cn('flex shrink-0 items-center gap-2 py-1', sizeClasses[size], className)}>
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 via-amber-400 to-orange-600 text-base font-black uppercase tracking-[0.3em] text-white shadow-lg shadow-orange-500/20">
        CC
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-[0.72rem] font-black uppercase tracking-[0.3em] text-foreground sm:text-sm">
          Cell
        </span>
        <span className="text-[0.62rem] font-semibold uppercase tracking-[0.35em] text-muted-foreground sm:text-xs">
          Craft
        </span>
      </div>
    </div>
  )

  if (href) {
    return (
      <Link
        href={href}
        className="flex shrink-0 items-center"
        aria-label="Cell Craft — go to dashboard"
      >
        {mark}
      </Link>
    )
  }

  return <div className="flex shrink-0 items-center">{mark}</div>
}
