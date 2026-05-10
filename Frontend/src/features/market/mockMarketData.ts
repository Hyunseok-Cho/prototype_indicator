import type {
  CandleDatum,
  SignalHistoryItem,
  SignalSnapshot,
  SymbolCode,
  SymbolDashboardData,
  SymbolInfo,
} from './marketTypes'

const fiveMinutes = 60 * 5
const latestTime = Date.UTC(2026, 4, 10, 12, 35, 0) / 1000

const symbolInfos: Record<SymbolCode, SymbolInfo> = {
  BTCUSDT: {
    symbol: 'BTCUSDT',
    name: 'Bitcoin',
    asset: 'BTC',
    accent: '#f7c75f',
    price: 66100,
    changePercent: 2.4,
  },
  ETHUSDT: {
    symbol: 'ETHUSDT',
    name: 'Ethereum',
    asset: 'ETH',
    accent: '#61d5e8',
    price: 3284,
    changePercent: -0.7,
  },
  SOLUSDT: {
    symbol: 'SOLUSDT',
    name: 'Solana',
    asset: 'SOL',
    accent: '#38d996',
    price: 154.8,
    changePercent: 4.1,
  },
}

const signalPlans: Record<SymbolCode, Array<[number, SignalSnapshot['signal']]>> = {
  BTCUSDT: [
    [18, 'SHORT'],
    [36, 'NO_TRADE'],
    [52, 'LONG'],
    [75, 'LONG'],
  ],
  ETHUSDT: [
    [15, 'LONG'],
    [34, 'NO_TRADE'],
    [58, 'SHORT'],
    [75, 'SHORT'],
  ],
  SOLUSDT: [
    [20, 'NO_TRADE'],
    [42, 'LONG'],
    [61, 'LONG'],
    [75, 'LONG'],
  ],
}

function calculateEma(values: number[], period: number) {
  const smoothing = 2 / (period + 1)
  const ema: number[] = []

  values.forEach((value, index) => {
    if (index === 0) {
      ema.push(value)
      return
    }

    ema.push(value * smoothing + ema[index - 1] * (1 - smoothing))
  })

  return ema
}

function withIndicators(candles: Omit<CandleDatum, 'bbUpper' | 'bbMiddle' | 'bbLower' | 'ema20' | 'ema50' | 'ema200'>[]) {
  const closes = candles.map((candle) => candle.close)
  const ema20 = calculateEma(closes, 20)
  const ema50 = calculateEma(closes, 50)
  const ema200 = calculateEma(closes, 200)

  return candles.map((candle, index) => {
    const window = closes.slice(Math.max(0, index - 19), index + 1)
    const mean = window.reduce((sum, value) => sum + value, 0) / window.length
    const variance =
      window.reduce((sum, value) => sum + (value - mean) ** 2, 0) / window.length
    const std = Math.sqrt(variance)

    return {
      ...candle,
      bbUpper: mean + std * 2,
      bbMiddle: mean,
      bbLower: mean - std * 2,
      ema20: ema20[index],
      ema50: ema50[index],
      ema200: ema200[index],
    }
  })
}

function createCandles(
  basePrice: number,
  volatility: number,
  trend: number,
  phase: number,
) {
  const candles: Omit<
    CandleDatum,
    'bbUpper' | 'bbMiddle' | 'bbLower' | 'ema20' | 'ema50' | 'ema200'
  >[] = []

  let previousClose = basePrice

  for (let index = 0; index < 80; index += 1) {
    const time = latestTime - (79 - index) * fiveMinutes
    const wave = Math.sin(index / 4 + phase) * volatility
    const slowerWave = Math.cos(index / 12 + phase) * volatility * 1.35
    const pulse = Math.sin(index / 2.7 + phase) * volatility * 0.26
    const close = basePrice + trend * index + wave + slowerWave + pulse
    const open = previousClose + Math.sin(index + phase) * volatility * 0.18
    const high = Math.max(open, close) + volatility * (0.65 + Math.abs(Math.sin(index)))
    const low = Math.min(open, close) - volatility * (0.58 + Math.abs(Math.cos(index)))

    candles.push({
      time,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume: Math.round(820 + Math.abs(Math.sin(index / 3 + phase)) * 540),
    })

    previousClose = close
  }

  return withIndicators(candles)
}

function createSignal(
  candles: CandleDatum[],
  index: number,
  signal: SignalSnapshot['signal'],
): SignalSnapshot {
  const candle = candles[index]
  const isLong = signal === 'LONG'
  const isShort = signal === 'SHORT'
  const longScore = isLong ? 78 : isShort ? 24 : 48
  const shortScore = isShort ? 74 : isLong ? 22 : 36
  const riskLevel = isShort ? 'HIGH' : isLong ? 'MEDIUM' : 'LOW'
  const marketRegime = isShort ? 'BEAR_TREND' : isLong ? 'RANGE' : 'HIGH_VOLATILITY'
  const range = Math.max(candle.high - candle.low, candle.close * 0.012)

  return {
    time: candle.time,
    signal,
    longScore,
    shortScore,
    marketRegime,
    riskLevel,
    dcaAllowed: signal !== 'NO_TRADE',
    takeProfit: Number((candle.close + (isShort ? -range * 1.8 : range * 1.8)).toFixed(2)),
    stopLoss: Number((candle.close + (isShort ? range * 1.15 : -range * 1.15)).toFixed(2)),
    reasons: isLong
      ? [
          'Price recovered near the lower Bollinger Band',
          'RSI6 crossed above RSI12 after oversold pressure',
          'EMA trend filter is not strongly bearish',
        ]
      : isShort
        ? [
            'Price rejected near the upper Bollinger Band',
            'RSI12 and RSI24 show overheated momentum',
            'EMA20 is rolling below EMA50',
          ]
        : [
            'Score threshold was not met',
            'Volatility filter is elevated',
            'Signal engine is waiting for cleaner confirmation',
          ],
  }
}

function createDashboard(symbol: SymbolCode, candles: CandleDatum[]): SymbolDashboardData {
  const signals = signalPlans[symbol].map(([index, signal]) =>
    createSignal(candles, index, signal),
  )
  const currentSignal = signals[signals.length - 1]
  const info = symbolInfos[symbol]

  const signalHistory: SignalHistoryItem[] = signals
    .slice()
    .reverse()
    .map(({ time, signal, longScore, shortScore, riskLevel }) => ({
      time,
      signal,
      longScore,
      shortScore,
      riskLevel,
    }))

  return {
    info,
    candles,
    currentSignal,
    signalHistory,
    paperAccount: {
      initialBalance: 10000,
      currentBalance: Number((10000 * (1 + info.changePercent / 100)).toFixed(2)),
      totalReturn: info.changePercent,
      realizedPnl: Number((info.changePercent * 42).toFixed(2)),
      unrealizedPnl: Number((info.changePercent * 58).toFixed(2)),
    },
    openPosition: {
      symbol,
      direction: currentSignal.signal === 'SHORT' ? 'SHORT' : 'LONG',
      averageEntry: Number((info.price * (1 - info.changePercent / 260)).toFixed(2)),
      currentPrice: info.price,
      positionSize: symbol === 'BTCUSDT' ? 0.18 : symbol === 'ETHUSDT' ? 2.2 : 48,
      positionReturn: Number((info.changePercent / 1.74).toFixed(2)),
      takeProfit: currentSignal.takeProfit,
      stopLoss: currentSignal.stopLoss,
      dcaCount: symbol === 'ETHUSDT' ? 2 : 1,
      maxDcaCount: 3,
    },
    params: {
      timeframe: '5m',
      riskPerTrade: 1,
      scoreThreshold: 70,
      feeRate: 0.1,
      atrPeriod: 14,
    },
  }
}

export const dashboardData: Record<SymbolCode, SymbolDashboardData> = {
  BTCUSDT: createDashboard('BTCUSDT', createCandles(65280, 335, 13.4, 0.2)),
  ETHUSDT: createDashboard('ETHUSDT', createCandles(3340, 24, -1.1, 1.1)),
  SOLUSDT: createDashboard('SOLUSDT', createCandles(143, 2.8, 0.14, 2.2)),
}

export const symbols = Object.values(symbolInfos)
