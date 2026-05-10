import { useEffect, useRef } from 'react'
import {
  CandlestickSeries,
  ColorType,
  LineSeries,
  createChart,
  createSeriesMarkers,
  type CandlestickData,
  type LineData,
  type SeriesMarker,
  type UTCTimestamp,
} from 'lightweight-charts'
import { Activity, Clock3, Target, TrendingDown, TrendingUp } from 'lucide-react'
import { Badge } from '../common/Badge'
import {
  formatCompact,
  formatCurrency,
  formatTime,
} from '../../features/market/formatters'
import type { SymbolDashboardData } from '../../features/market/marketTypes'
import './TradingChart.scss'

interface TradingChartProps {
  data: SymbolDashboardData
}

function toTimestamp(time: number) {
  return time as UTCTimestamp
}

export function TradingChart({ data }: TradingChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const { candles, currentSignal, signalHistory, info } = data
  const latestCandle = candles[candles.length - 1]
  const totalVolume = candles.reduce((sum, candle) => sum + candle.volume, 0)

  useEffect(() => {
    const container = containerRef.current

    if (!container) {
      return
    }

    const chart = createChart(container, {
      autoSize: false,
      width: container.clientWidth,
      height: container.clientHeight,
      layout: {
        background: { type: ColorType.Solid, color: '#141411' },
        textColor: '#9f9a8f',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.04)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.055)' },
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        vertLine: { color: 'rgba(97, 213, 232, 0.32)' },
        horzLine: { color: 'rgba(97, 213, 232, 0.32)' },
      },
    })

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#38d996',
      downColor: '#ff6868',
      borderUpColor: '#38d996',
      borderDownColor: '#ff6868',
      wickUpColor: '#38d996',
      wickDownColor: '#ff6868',
    })

    const candleData: CandlestickData<UTCTimestamp>[] = candles.map((candle) => ({
      time: toTimestamp(candle.time),
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    }))

    candleSeries.setData(candleData)

    const lineData = (key: 'bbUpper' | 'bbMiddle' | 'bbLower' | 'ema20' | 'ema50' | 'ema200') =>
      candles.map<LineData<UTCTimestamp>>((candle) => ({
        time: toTimestamp(candle.time),
        value: candle[key],
      }))

    const overlayOptions = {
      priceLineVisible: false,
      lastValueVisible: false,
      lineWidth: 2 as const,
    }

    chart.addSeries(LineSeries, {
      ...overlayOptions,
      color: 'rgba(247, 199, 95, 0.65)',
    }).setData(lineData('bbUpper'))

    chart.addSeries(LineSeries, {
      ...overlayOptions,
      color: 'rgba(247, 199, 95, 0.28)',
      lineWidth: 1,
    }).setData(lineData('bbMiddle'))

    chart.addSeries(LineSeries, {
      ...overlayOptions,
      color: 'rgba(247, 199, 95, 0.65)',
    }).setData(lineData('bbLower'))

    chart.addSeries(LineSeries, {
      ...overlayOptions,
      color: '#61d5e8',
    }).setData(lineData('ema20'))

    chart.addSeries(LineSeries, {
      ...overlayOptions,
      color: '#ede9dd',
    }).setData(lineData('ema50'))

    chart.addSeries(LineSeries, {
      ...overlayOptions,
      color: 'rgba(172, 167, 155, 0.52)',
      lineWidth: 1,
    }).setData(lineData('ema200'))

    const markers = signalHistory
      .filter((signal) => signal.signal !== 'NO_TRADE')
      .map<SeriesMarker<UTCTimestamp>>((signal) => ({
        time: toTimestamp(signal.time),
        position: signal.signal === 'LONG' ? 'belowBar' : 'aboveBar',
        color: signal.signal === 'LONG' ? '#38d996' : '#ff6868',
        shape: signal.signal === 'LONG' ? 'arrowUp' : 'arrowDown',
        text: signal.signal,
        size: 1.4,
      }))

    createSeriesMarkers(candleSeries, markers)
    chart.timeScale().fitContent()

    const resizeObserver = new ResizeObserver(() => {
      chart.applyOptions({
        width: container.clientWidth,
        height: container.clientHeight,
      })
    })

    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
      chart.remove()
    }
  }, [candles, signalHistory])

  return (
    <section className="trading-chart">
      <div className="trading-chart__toolbar">
        <div>
          <span className="trading-chart__kicker">
            <Activity size={16} aria-hidden="true" />
            Market Monitor
          </span>
          <h2>{info.symbol} 5m Candles</h2>
        </div>
        <div className="trading-chart__stats" aria-label="Chart summary">
          <span>
            <Clock3 size={15} aria-hidden="true" />
            {formatTime(latestCandle.time)}
          </span>
          <span>Vol {formatCompact(totalVolume)}</span>
          <Badge tone={currentSignal.signal}>{currentSignal.signal}</Badge>
        </div>
      </div>

      <div className="trading-chart__body">
        <div className="trading-chart__canvas" ref={containerRef} />

        <aside className="signal-card" aria-label="Current signal">
          <div className="signal-card__header">
            <span>Current Signal</span>
            <Badge tone={currentSignal.riskLevel}>{currentSignal.riskLevel}</Badge>
          </div>
          <strong className={`signal-card__signal signal-card__signal--${currentSignal.signal.toLowerCase()}`}>
            {currentSignal.signal}
          </strong>

          <div className="score-meter">
            <div>
              <span>
                <TrendingUp size={15} aria-hidden="true" />
                Long Score
              </span>
              <strong>{currentSignal.longScore}</strong>
            </div>
            <span className="score-meter__track">
              <span style={{ width: `${currentSignal.longScore}%` }} />
            </span>
          </div>

          <div className="score-meter score-meter--short">
            <div>
              <span>
                <TrendingDown size={15} aria-hidden="true" />
                Short Score
              </span>
              <strong>{currentSignal.shortScore}</strong>
            </div>
            <span className="score-meter__track">
              <span style={{ width: `${currentSignal.shortScore}%` }} />
            </span>
          </div>

          <dl className="signal-card__meta">
            <div>
              <dt>Regime</dt>
              <dd>{currentSignal.marketRegime}</dd>
            </div>
            <div>
              <dt>DCA</dt>
              <dd>{currentSignal.dcaAllowed ? 'Allowed' : 'Blocked'}</dd>
            </div>
            <div>
              <dt>Take Profit</dt>
              <dd>{formatCurrency(currentSignal.takeProfit)}</dd>
            </div>
            <div>
              <dt>Stop Loss</dt>
              <dd>{formatCurrency(currentSignal.stopLoss)}</dd>
            </div>
          </dl>

          <div className="signal-card__reasons">
            <span>
              <Target size={15} aria-hidden="true" />
              Signal Reasons
            </span>
            <ul>
              {currentSignal.reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <div className="trading-chart__legend" aria-label="Indicators">
        <span className="legend-item legend-item--bb">Bollinger Bands</span>
        <span className="legend-item legend-item--ema20">EMA 20</span>
        <span className="legend-item legend-item--ema50">EMA 50</span>
        <span className="legend-item legend-item--ema200">EMA 200</span>
      </div>
    </section>
  )
}
