import { Activity, ChartCandlestick, Radio, ShieldCheck } from 'lucide-react'
import type { SymbolDashboardData } from '../../features/market/marketTypes'
import { formatTime } from '../../features/market/formatters'
import './HeroSection.scss'

interface HeroSectionProps {
  activeData: SymbolDashboardData
}

export function HeroSection({ activeData }: HeroSectionProps) {
  const { currentSignal, params } = activeData

  return (
    <header className="hero-section">
      <div className="hero-section__title">
        <div className="hero-section__eyebrow">
          <ChartCandlestick size={17} aria-hidden="true" />
          Prototype Indicator
        </div>
        <h1>Final Project Prototype</h1>
        <p>Prototype Indicator Monitoring & Paper Trading System</p>
      </div>

      <div className="hero-section__status" aria-label="System status">
        <div>
          <Radio size={18} aria-hidden="true" />
          <span>Mock Stream</span>
          <strong>Online</strong>
        </div>
        <div>
          <Activity size={18} aria-hidden="true" />
          <span>Timeframe</span>
          <strong>{params.timeframe}</strong>
        </div>
        <div>
          <ShieldCheck size={18} aria-hidden="true" />
          <span>Last Signal</span>
          <strong>{formatTime(currentSignal.time)}</strong>
        </div>
      </div>
    </header>
  )
}
