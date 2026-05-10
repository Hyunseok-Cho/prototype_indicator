export type SymbolCode = 'BTCUSDT' | 'ETHUSDT' | 'SOLUSDT'

export type SignalKind = 'LONG' | 'SHORT' | 'NO_TRADE'

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH'

export type MarketRegime =
  | 'RANGE'
  | 'BULL_TREND'
  | 'BEAR_TREND'
  | 'HIGH_VOLATILITY'

export interface SymbolInfo {
  symbol: SymbolCode
  name: string
  asset: string
  accent: string
  price: number
  changePercent: number
}

export interface CandleDatum {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
  bbUpper: number
  bbMiddle: number
  bbLower: number
  ema20: number
  ema50: number
  ema200: number
}

export interface SignalSnapshot {
  time: number
  signal: SignalKind
  longScore: number
  shortScore: number
  marketRegime: MarketRegime
  riskLevel: RiskLevel
  dcaAllowed: boolean
  takeProfit: number
  stopLoss: number
  reasons: string[]
}

export interface SignalHistoryItem {
  time: number
  signal: SignalKind
  longScore: number
  shortScore: number
  riskLevel: RiskLevel
}

export interface PaperAccount {
  initialBalance: number
  currentBalance: number
  totalReturn: number
  realizedPnl: number
  unrealizedPnl: number
}

export interface PaperPosition {
  symbol: SymbolCode
  direction: Extract<SignalKind, 'LONG' | 'SHORT'>
  averageEntry: number
  currentPrice: number
  positionSize: number
  positionReturn: number
  takeProfit: number
  stopLoss: number
  dcaCount: number
  maxDcaCount: number
}

export interface TradingParams {
  timeframe: string
  riskPerTrade: number
  scoreThreshold: number
  feeRate: number
  atrPeriod: number
}

export interface SymbolDashboardData {
  info: SymbolInfo
  candles: CandleDatum[]
  currentSignal: SignalSnapshot
  signalHistory: SignalHistoryItem[]
  paperAccount: PaperAccount
  openPosition: PaperPosition
  params: TradingParams
}
