import type { SignalKind } from '../../features/market/marketTypes'
import './Badge.scss'

interface BadgeProps {
  children: string
  tone?: SignalKind | 'LOW' | 'MEDIUM' | 'HIGH' | 'neutral'
}

export function Badge({ children, tone = 'neutral' }: BadgeProps) {
  return <span className={`badge badge--${tone.toLowerCase()}`}>{children}</span>
}
