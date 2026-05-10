import type { CSSProperties } from 'react'
import { Bitcoin, CircleDollarSign, Zap } from 'lucide-react'
import { Badge } from '../common/Badge'
import { formatCurrency, formatPercent } from '../../features/market/formatters'
import type {
  SymbolCode,
  SymbolDashboardData,
  SymbolInfo,
} from '../../features/market/marketTypes'
import './SymbolTabs.scss'

const tabIcons = {
  BTCUSDT: Bitcoin,
  ETHUSDT: CircleDollarSign,
  SOLUSDT: Zap,
}

interface SymbolTabsProps {
  symbols: SymbolInfo[]
  activeSymbol: SymbolCode
  dataBySymbol: Record<SymbolCode, SymbolDashboardData>
  onSymbolChange: (symbol: SymbolCode) => void
}

export function SymbolTabs({
  symbols,
  activeSymbol,
  dataBySymbol,
  onSymbolChange,
}: SymbolTabsProps) {
  return (
    <nav className="symbol-tabs" aria-label="Symbols">
      {symbols.map((symbol) => {
        const Icon = tabIcons[symbol.symbol]
        const dashboard = dataBySymbol[symbol.symbol]
        const isActive = symbol.symbol === activeSymbol
        const style = { '--symbol-accent': symbol.accent } as CSSProperties

        return (
          <button
            type="button"
            className={`symbol-tabs__tab${isActive ? ' is-active' : ''}`}
            key={symbol.symbol}
            onClick={() => onSymbolChange(symbol.symbol)}
            style={style}
            aria-pressed={isActive}
          >
            <span className="symbol-tabs__icon">
              <Icon size={18} aria-hidden="true" />
            </span>
            <span className="symbol-tabs__copy">
              <strong>{symbol.name}</strong>
              <small>{symbol.symbol}</small>
            </span>
            <span className="symbol-tabs__market">
              <strong>{formatCurrency(symbol.price, symbol.price > 1000 ? 0 : 2)}</strong>
              <small className={symbol.changePercent >= 0 ? 'is-up' : 'is-down'}>
                {formatPercent(symbol.changePercent)}
              </small>
            </span>
            <Badge tone={dashboard.currentSignal.signal}>
              {dashboard.currentSignal.signal}
            </Badge>
          </button>
        )
      })}
    </nav>
  )
}
