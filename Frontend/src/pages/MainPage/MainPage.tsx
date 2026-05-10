import { useMemo, useState } from 'react'
import { HeroSection } from '../../components/hero/HeroSection'
import { PaperTradingPanel } from '../../components/paperTrading/PaperTradingPanel'
import { SymbolTabs } from '../../components/symbolTabs/SymbolTabs'
import { TradingChart } from '../../components/chart/TradingChart'
import { dashboardData, symbols } from '../../features/market/mockMarketData'
import type { SymbolCode } from '../../features/market/marketTypes'
import './MainPage.scss'

export function MainPage() {
  const [activeSymbol, setActiveSymbol] = useState<SymbolCode>('BTCUSDT')
  const activeData = useMemo(() => dashboardData[activeSymbol], [activeSymbol])

  return (
    <main className="main-page">
      <HeroSection activeData={activeData} />
      <SymbolTabs
        symbols={symbols}
        activeSymbol={activeSymbol}
        dataBySymbol={dashboardData}
        onSymbolChange={setActiveSymbol}
      />
      <div className="main-page__content">
        <TradingChart data={activeData} />
        <PaperTradingPanel data={activeData} />
      </div>
    </main>
  )
}
