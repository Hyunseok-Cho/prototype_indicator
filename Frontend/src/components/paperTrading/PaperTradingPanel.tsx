import {
  CircleDollarSign,
  ShieldCheck,
  SlidersHorizontal,
  Target,
  WalletCards,
} from 'lucide-react'
import { Badge } from '../common/Badge'
import {
  formatCurrency,
  formatPercent,
  formatTime,
} from '../../features/market/formatters'
import type { SymbolDashboardData } from '../../features/market/marketTypes'
import './PaperTradingPanel.scss'

interface PaperTradingPanelProps {
  data: SymbolDashboardData
}

export function PaperTradingPanel({ data }: PaperTradingPanelProps) {
  const { paperAccount, openPosition, signalHistory, params, currentSignal } = data

  return (
    <section className="paper-panel">
      <div className="paper-panel__header">
        <div>
          <span className="paper-panel__kicker">
            <WalletCards size={16} aria-hidden="true" />
            Paper Trading
          </span>
          <h2>{openPosition.symbol} Position State</h2>
        </div>
        <Badge tone={currentSignal.signal}>{currentSignal.signal}</Badge>
      </div>

      <div className="paper-panel__grid">
        <article className="summary-card">
          <div className="summary-card__title">
            <CircleDollarSign size={18} aria-hidden="true" />
            Account Summary
          </div>
          <div className="summary-card__balance">
            {formatCurrency(paperAccount.currentBalance)}
          </div>
          <dl>
            <div>
              <dt>Initial</dt>
              <dd>{formatCurrency(paperAccount.initialBalance)}</dd>
            </div>
            <div>
              <dt>Total Return</dt>
              <dd className={paperAccount.totalReturn >= 0 ? 'is-up' : 'is-down'}>
                {formatPercent(paperAccount.totalReturn)}
              </dd>
            </div>
            <div>
              <dt>Realized PnL</dt>
              <dd>{formatCurrency(paperAccount.realizedPnl)}</dd>
            </div>
            <div>
              <dt>Unrealized PnL</dt>
              <dd>{formatCurrency(paperAccount.unrealizedPnl)}</dd>
            </div>
          </dl>
        </article>

        <article className="position-card">
          <div className="position-card__title">
            <Target size={18} aria-hidden="true" />
            Current Position
          </div>
          <div className={`position-card__headline position-card__headline--${openPosition.direction.toLowerCase()}`}>
            <strong>{openPosition.direction}</strong>
            <span>{openPosition.positionSize} {openPosition.symbol.replace('USDT', '')}</span>
          </div>
          <dl>
            <div>
              <dt>Average Entry</dt>
              <dd>{formatCurrency(openPosition.averageEntry)}</dd>
            </div>
            <div>
              <dt>Current Price</dt>
              <dd>{formatCurrency(openPosition.currentPrice)}</dd>
            </div>
            <div>
              <dt>Position Return</dt>
              <dd className={openPosition.positionReturn >= 0 ? 'is-up' : 'is-down'}>
                {formatPercent(openPosition.positionReturn)}
              </dd>
            </div>
            <div>
              <dt>DCA</dt>
              <dd>
                {openPosition.dcaCount} / {openPosition.maxDcaCount}
              </dd>
            </div>
            <div>
              <dt>TP</dt>
              <dd>{formatCurrency(openPosition.takeProfit)}</dd>
            </div>
            <div>
              <dt>SL</dt>
              <dd>{formatCurrency(openPosition.stopLoss)}</dd>
            </div>
          </dl>
        </article>

        <article className="history-card">
          <div className="history-card__title">
            <ShieldCheck size={18} aria-hidden="true" />
            Signal History
          </div>
          <ol>
            {signalHistory.map((signal) => (
              <li key={`${signal.time}-${signal.signal}`}>
                <time>{formatTime(signal.time)}</time>
                <Badge tone={signal.signal}>{signal.signal}</Badge>
                <span>L:{signal.longScore} / S:{signal.shortScore}</span>
                <Badge tone={signal.riskLevel}>{signal.riskLevel}</Badge>
              </li>
            ))}
          </ol>
        </article>

        <article className="params-card">
          <div className="params-card__title">
            <SlidersHorizontal size={18} aria-hidden="true" />
            Applied Params
          </div>
          <dl>
            <div>
              <dt>Timeframe</dt>
              <dd>{params.timeframe}</dd>
            </div>
            <div>
              <dt>Risk / Trade</dt>
              <dd>{params.riskPerTrade}%</dd>
            </div>
            <div>
              <dt>Score Threshold</dt>
              <dd>{params.scoreThreshold}</dd>
            </div>
            <div>
              <dt>Fee Rate</dt>
              <dd>{params.feeRate}%</dd>
            </div>
            <div>
              <dt>ATR Period</dt>
              <dd>{params.atrPeriod}</dd>
            </div>
          </dl>
        </article>
      </div>
    </section>
  )
}
