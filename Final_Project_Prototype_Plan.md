# Final Project Prototype — Project Plan

## 0. 문서 목적

이 문서는 `prototype_indicator` GitHub repository 안의 `Prototype` 폴더를 기준으로, 현재 개인 연습용 프로토타입과 초기 웹 앱, 그리고 추후 졸업작품으로 확장하는 방향을 정리한 계획서이다.

현재 프로젝트는 **졸업작품을 시작하기 전, 미리 개발하고 실험하기 위한 프로토타입**이다.  
최종 졸업작품의 이름과 정확한 논문 주제는 추후 promotor 교수님과 상의 후 결정한다.

---

## 1. 확정된 정정사항

### 1.1 프로젝트 이름

현재 프로토타입 이름:

```text
Final Project Prototype
```

GitHub repository 이름:

```text
prototype_indicator
```

현재 작업 폴더 이름:

```text
Prototype
```

인디케이터 임시 이름:

```text
prototype indicator
```

졸업작품용 이름:

```text
추후 교수님과 상의 후 결정
```

---

### 1.2 데이터 저장 방식

프로토타입 단계부터 데이터 저장은 PostgreSQL을 사용한다.

초기에는 CSV나 SQLite를 사용하지 않고, PostgreSQL을 기준으로 구조를 설계한다.  
이렇게 하면 나중에 졸업작품으로 확장할 때 데이터베이스 구조를 크게 바꾸지 않아도 된다.

다만 초기 개발 편의를 위해, 필요하다면 일시적인 CSV export/import 기능은 보조 기능으로만 둔다.

---

### 1.3 전체 구조 방향

`Prototype` 폴더 안에서 백엔드와 프론트엔드를 분리한다.

추천 구조:

```text
prototype_indicator/
  Prototype/
    Backend/
    Frontend/
    README.md
    PROJECT_PLAN.md
```

이 구조를 추천하는 이유는 다음과 같다.

```text
1. 백엔드와 프론트엔드 책임이 명확하게 분리된다.
2. 나중에 FastAPI backend와 React frontend를 독립적으로 개발, 실행, 배포할 수 있다.
3. 졸업작품으로 확장할 때도 구조를 그대로 가져가서 수정하기 쉽다.
4. PostgreSQL, indicator engine, backtest, paper trading 등 핵심 로직은 Backend에 모을 수 있다.
5. Frontend는 처음에는 단일 메인 페이지로 시작하고, 추후 여러 페이지로 확장할 수 있다.
```

---

# Section 1. Prototype 계획

## 1.1 Prototype의 목적

Prototype의 목적은 내가 실제로 사용하는 트레이딩 방식을 계산 가능한 로직으로 만들고, PostgreSQL에 데이터를 저장하며, 차트와 paper trading 상태를 웹에서 확인할 수 있는 최소 시스템을 만드는 것이다.

핵심 목표:

```text
1. BTC, ETH, SOL 데이터를 수집한다.
2. PostgreSQL에 OHLCV 데이터를 저장한다.
3. Bollinger Band, RSI, EMA, ATR 등을 계산한다.
4. prototype indicator를 구현한다.
5. LONG / SHORT / NO_TRADE 시그널을 생성한다.
6. 시그널을 기반으로 간단한 paper trading을 수행한다.
7. FastAPI로 데이터를 제공한다.
8. React frontend에서 차트, 시그널, paper trading 상태를 보여준다.
```

---

## 1.2 Prototype Indicator 개념

인디케이터 임시 이름:

```text
prototype indicator
```

이 인디케이터는 다음 요소를 결합한다.

```text
1. Bollinger Band
   - 상단 돌파 시 SHORT 후보
   - 하단 돌파 시 LONG 후보

2. Multi-period RSI
   - RSI 6
   - RSI 12
   - RSI 24
   - 과열/과매도 상태와 단기 반전 타이밍 확인

3. EMA Trend Filter
   - EMA 20
   - EMA 50
   - EMA 200
   - 강한 상승장에서는 무리한 SHORT 제한
   - 강한 하락장에서는 무리한 LONG 제한

4. Pattern Analysis
   - W pattern / double bottom
   - M pattern / double top
   - Higher High + Higher Low
   - Lower High + Lower Low

5. Risk Management
   - ATR 기반 TP/SL
   - DCA 허용 여부
   - 고변동성 구간 진입 제한
```

---

## 1.3 Prototype Indicator 출력값

인디케이터는 단순히 LONG/SHORT만 출력하지 않고, 설명 가능한 데이터를 함께 출력해야 한다.

```text
symbol
timeframe
timestamp
long_score
short_score
signal
market_regime
risk_level
dca_allowed
take_profit
stop_loss
signal_reasons
```

예시:

```json
{
  "symbol": "BTCUSDT",
  "timeframe": "5m",
  "signal": "LONG",
  "long_score": 78,
  "short_score": 22,
  "market_regime": "RANGE",
  "risk_level": "MEDIUM",
  "dca_allowed": true,
  "take_profit": 67200.0,
  "stop_loss": 65100.0,
  "signal_reasons": [
    "Price broke below lower Bollinger Band",
    "RSI12 and RSI24 were oversold",
    "RSI6 crossed above RSI12",
    "EMA trend is not strongly bearish"
  ]
}
```

이 구조는 나중에 웹에서 시그널 발생 이유를 보여주기 위해 중요하다.

---

## 1.4 Backend 기본 구조

추천 구조:

```text
Prototype/
  Backend/
    notebooks/
      01_data_collection.ipynb
      02_indicator_calculation.ipynb
      03_signal_generation.ipynb
      04_backtest.ipynb
      05_paper_trading.ipynb

    src/
      main.py

      config/
        settings.py
        symbols.py
        strategy_params.py
        database.py

      db/
        session.py
        init_db.py
        models/
          candle_model.py
          indicator_model.py
          signal_model.py
          backtest_model.py
          paper_trade_model.py
          strategy_param_model.py
        repositories/
          candle_repository.py
          indicator_repository.py
          signal_repository.py
          backtest_repository.py
          paper_trade_repository.py

      data/
        collectors/
          ccxt_collector.py
        providers/
          exchange_data_provider.py
          database_data_provider.py
        loaders/
          candle_loader.py

      indicators/
        bollinger.py
        rsi.py
        ema.py
        atr.py
        patterns.py
        prototype_indicator.py

      strategies/
        prototype_strategy.py
        risk_management.py
        dca_manager.py
        position_sizing.py

      backtest/
        backtester.py
        metrics.py
        trade_simulator.py

      paper_trading/
        paper_account.py
        paper_position.py
        paper_trading_engine.py

      services/
        market_service.py
        indicator_service.py
        signal_service.py
        backtest_service.py
        paper_trading_service.py

      api/
        routes/
          market_routes.py
          indicator_routes.py
          signal_routes.py
          backtest_routes.py
          paper_trading_routes.py
          strategy_routes.py

      schemas/
        candle_schema.py
        indicator_schema.py
        signal_schema.py
        backtest_schema.py
        paper_trading_schema.py
        strategy_schema.py

      models/
        candle.py
        signal.py
        trade.py
        strategy_params.py
        paper_position.py

      scripts/
        collect_candles.py
        calculate_indicators.py
        generate_signals.py
        run_backtest.py
        run_paper_trading.py

      tests/
        test_indicators.py
        test_signal_generator.py
        test_backtester.py

    requirements.txt
    pyproject.toml
    .env.example
    README.md
```

---

## 1.5 Backend 구조 설명

### notebooks

초기 실험용 공간이다.

```text
notebooks/
```

사용 목적:

```text
1. 데이터 수집 테스트
2. 인디케이터 계산 검증
3. 시그널 로직 실험
4. 백테스트 로직 실험
5. paper trading 로직 실험
```

노트북에서 검증된 코드는 `src/` 내부 모듈로 옮긴다.

---

### src/config

전체 파라미터를 한 곳에서 관리한다.

```text
src/config/
```

예시:

```python
SYMBOLS = ["BTCUSDT", "ETHUSDT", "SOLUSDT"]
TIMEFRAMES = ["5m", "15m"]

STRATEGY_PARAMS = {
    "bb_period": 20,
    "bb_std": 2.0,
    "rsi_fast": 6,
    "rsi_mid": 12,
    "rsi_slow": 24,
    "ema_fast": 20,
    "ema_mid": 50,
    "ema_slow": 200,
    "atr_period": 14,
    "score_threshold": 70,
    "max_dca_count": 3,
    "risk_per_trade": 0.01,
    "fee_rate": 0.001,
    "slippage": 0.0005
}
```

이 구조의 장점:

```text
1. 전략 파라미터를 한 곳에서 수정할 수 있다.
2. 여러 인디케이터나 전략을 추가해도 관리가 쉽다.
3. 나중에 frontend의 Strategy Settings와 연결하기 좋다.
```

---

### src/data

데이터 수집과 데이터 제공을 담당한다.

```text
src/data/
```

역할:

```text
1. 거래소에서 OHLCV 데이터 수집
2. PostgreSQL에 candle 저장
3. PostgreSQL에서 candle 조회
4. 추후 CoinGecko, Etherscan, The Graph 등 추가 데이터 소스 확장 가능
```

초기 수집 대상:

```text
BTCUSDT
ETHUSDT
SOLUSDT
```

초기 timeframe:

```text
5m
15m
```

추후 확장:

```text
1m
1h
4h
1d
```

---

### src/indicators

인디케이터 계산 모듈이다.

```text
src/indicators/
```

각 지표를 개별 파일로 분리한다.

```text
bollinger.py
rsi.py
ema.py
atr.py
patterns.py
prototype_indicator.py
```

`prototype_indicator.py`는 개별 지표 계산 결과를 합쳐서 최종 점수를 만든다.

출력:

```text
long_score
short_score
signal
signal_reasons
market_regime
risk_level
dca_allowed
```

---

### src/strategies

실제 전략 로직을 담당한다.

```text
src/strategies/
```

인디케이터는 시그널을 만들고, 전략은 진입/청산/포지션 관리를 결정한다.

전략에 포함될 내용:

```text
1. LONG 진입 조건
2. SHORT 진입 조건
3. NO_TRADE 조건
4. TP/SL 계산
5. DCA 허용 조건
6. position size 계산
7. cooldown 조건
```

---

### src/backtest

백테스트를 담당한다.

```text
src/backtest/
```

백테스트에 포함할 요소:

```text
1. 초기 자금
2. 진입/청산
3. 수수료
4. 슬리피지
5. TP/SL
6. DCA
7. 총 수익률
8. 포지션별 수익률
9. 최대 낙폭
10. 승률
11. profit factor
12. trade history
```

---

### src/paper_trading

paper trading을 담당한다.

```text
src/paper_trading/
```

목표:

```text
실제 돈을 사용하지 않고, 가상 자금으로 전략이 어떻게 작동하는지 확인한다.
```

paper trading 상태:

```text
initial_balance
current_balance
open_positions
closed_positions
current_signal
signal_history
total_return
position_return
take_profit
stop_loss
dca_count
```

---

### src/api

FastAPI route를 담당한다.

```text
src/api/
```

초기 API:

```text
GET /api/market/symbols
GET /api/market/candles
GET /api/indicators/latest
GET /api/signals/latest
GET /api/signals/history
GET /api/paper/account
GET /api/paper/positions
GET /api/paper/history
POST /api/backtest/run
GET /api/backtest/result
GET /api/strategy/params
POST /api/strategy/params
```

---

## 1.6 PostgreSQL 데이터베이스 구조 초안

초기 prototype에서는 너무 복잡한 data warehouse 구조를 바로 만들 필요는 없다.  
하지만 나중에 졸업작품으로 확장하기 쉽도록 테이블 이름과 역할을 명확히 한다.

### candles

```text
id
symbol
timeframe
timestamp
open
high
low
close
volume
created_at
```

### indicators

```text
id
symbol
timeframe
timestamp
bb_upper
bb_middle
bb_lower
bb_width
bb_position
rsi_6
rsi_12
rsi_24
ema_20
ema_50
ema_200
atr_14
atr_percent
created_at
```

### signals

```text
id
symbol
timeframe
timestamp
long_score
short_score
signal
market_regime
risk_level
dca_allowed
take_profit
stop_loss
signal_reasons
created_at
```

### strategy_params

```text
id
name
version
bb_period
bb_std
rsi_fast
rsi_mid
rsi_slow
ema_fast
ema_mid
ema_slow
atr_period
score_threshold
max_dca_count
risk_per_trade
fee_rate
slippage
created_at
```

### backtest_runs

```text
id
strategy_param_id
symbol
timeframe
start_time
end_time
initial_balance
final_balance
total_return
win_rate
max_drawdown
profit_factor
total_trades
created_at
```

### backtest_trades

```text
id
backtest_run_id
symbol
timeframe
direction
entry_time
exit_time
entry_price
exit_price
average_entry_price
position_size
dca_count
take_profit
stop_loss
pnl
pnl_percent
fee
slippage
result
created_at
```

### paper_accounts

```text
id
name
initial_balance
current_balance
realized_pnl
unrealized_pnl
total_return
created_at
updated_at
```

### paper_positions

```text
id
account_id
symbol
timeframe
direction
status
entry_time
entry_price
average_entry_price
current_price
position_size
dca_count
take_profit
stop_loss
unrealized_pnl
realized_pnl
position_return
created_at
updated_at
closed_at
```

### paper_signal_history

```text
id
account_id
symbol
timeframe
timestamp
signal
long_score
short_score
market_regime
risk_level
created_at
```

---

## 1.7 Prototype 개발 순서

### Step 1. Backend 기본 세팅

```text
1. Python 가상환경 생성
2. FastAPI 설치
3. PostgreSQL 연결
4. SQLAlchemy 설정
5. .env.example 작성
6. 기본 health check API 구현
```

---

### Step 2. 데이터 수집

```text
1. BTCUSDT, ETHUSDT, SOLUSDT 정의
2. CCXT 또는 거래소 API로 OHLCV 수집
3. candles 테이블에 저장
4. 중복 timestamp 저장 방지
5. 수집 스크립트 작성
```

---

### Step 3. 기본 인디케이터 계산

```text
1. Bollinger Bands 계산
2. RSI 6/12/24 계산
3. EMA 20/50/200 계산
4. ATR 14 계산
5. indicators 테이블에 저장
```

---

### Step 4. prototype indicator 구현

```text
1. long_score 계산
2. short_score 계산
3. signal 생성
4. signal_reasons 생성
5. risk_level 계산
6. dca_allowed 계산
7. signals 테이블에 저장
```

---

### Step 5. Backtest 구현

```text
1. 과거 candles + signals 조회
2. 진입/청산 로직 적용
3. TP/SL 적용
4. 수수료/슬리피지 반영
5. DCA 로직 적용
6. 결과를 backtest_runs, backtest_trades에 저장
```

---

### Step 6. Paper Trading 구현

```text
1. 초기 가상 자금 설정
2. 현재 시그널 기반 포지션 생성
3. open position 관리
4. TP/SL 적용
5. signal history 저장
6. paper trading 상태 API 제공
```

---

### Step 7. Frontend 연결

```text
1. market candles API 연결
2. latest signal API 연결
3. paper trading account API 연결
4. chart에 signal marker 표시
5. paper trading 상태 표시
```

---

# Section 2. Web 계획

## 2.1 Web의 목적

초기 웹은 복잡한 dashboard가 아니라, 하나의 메인 페이지에서 다음을 보여주는 것을 목표로 한다.

```text
1. 프로젝트 이름
2. Hero section
3. BTC / ETH / SOL 탭
4. 선택된 symbol의 차트
5. prototype indicator의 LONG/SHORT 시그널
6. 해당 symbol의 paper trading 상태
```

추후 확장 가능하지만, 초기에는 단일 페이지로 시작한다.

---

## 2.2 Frontend 기본 구조

추천 구조:

```text
Prototype/
  Frontend/
    src/
      app/
        App.tsx
        providers.tsx

      pages/
        MainPage/
          MainPage.tsx
          MainPage.scss

      components/
        layout/
          PageLayout.tsx
          PageLayout.scss

        hero/
          HeroSection.tsx
          HeroSection.scss

        symbolTabs/
          SymbolTabs.tsx
          SymbolTabs.scss

        chart/
          TradingChart.tsx
          TradingChart.scss
          SignalMarkers.tsx
          IndicatorLegend.tsx

        paperTrading/
          PaperTradingPanel.tsx
          PaperTradingPanel.scss
          AccountSummary.tsx
          CurrentPositionCard.tsx
          SignalHistoryList.tsx
          TradingParamsBox.tsx

        common/
          Badge.tsx
          Card.tsx
          LoadingState.tsx
          ErrorState.tsx

      features/
        market/
          marketApi.ts
          marketTypes.ts

        signals/
          signalApi.ts
          signalTypes.ts

        paperTrading/
          paperTradingApi.ts
          paperTradingTypes.ts

      styles/
        variables.scss
        mixins.scss
        global.scss

      main.tsx

    package.json
    vite.config.ts
    tsconfig.json
    README.md
```

---

## 2.3 초기 메인 페이지 구성

초기 웹은 다음 구조로 구성한다.

```text
MainPage
  ├── HeroSection
  ├── SymbolTabs
  ├── TradingChart
  └── PaperTradingPanel
```

---

## 2.4 Hero Section

Hero section에는 프로젝트 이름과 간단한 설명을 보여준다.

표시 내용:

```text
Final Project Prototype
Prototype Indicator Monitoring & Paper Trading System
```

설명 예시:

```text
A prototype system for monitoring cryptocurrency trading signals generated by a custom technical indicator.
```

또는 한국어 개발 중에는:

```text
커스텀 인디케이터 기반 암호화폐 시그널 모니터링 및 모의 트레이딩 프로토타입
```

---

## 2.5 Symbol Tabs

탭 목록:

```text
Bitcoin
Ethereum
Solana
```

내부 symbol 값:

```text
BTCUSDT
ETHUSDT
SOLUSDT
```

동작:

```text
1. 사용자가 Bitcoin 탭 선택
2. BTCUSDT candles 조회
3. BTCUSDT signals 조회
4. BTCUSDT paper trading 상태 조회
5. 차트와 paper trading panel 업데이트
```

---

## 2.6 Trading Chart

차트에서 보여줄 내용:

```text
1. Candlestick chart
2. Bollinger Bands
3. EMA 20 / EMA 50 / EMA 200
4. LONG marker
5. SHORT marker
6. 현재 시그널
```

초기 차트 목표:

```text
1. 캔들 데이터 표시
2. LONG/SHORT marker 표시
3. Bollinger Bands 표시
4. EMA 표시
```

추후 확장:

```text
1. RSI panel 추가
2. ATR 또는 volatility panel 추가
3. marker 클릭 시 signal reason 표시
4. timeframe 변경 기능 추가
5. backtest trade marker 추가
```

---

## 2.7 Signal 표시

차트 주변에 현재 시그널을 표시한다.

표시 항목:

```text
current_signal
long_score
short_score
market_regime
risk_level
last_signal_time
signal_reasons
```

예시:

```text
Current Signal: LONG
Long Score: 78
Short Score: 22
Market Regime: RANGE
Risk Level: MEDIUM

Reasons:
- Price broke below lower Bollinger Band
- RSI6 crossed above RSI12
- EMA trend is not strongly bearish
```

---

## 2.8 Paper Trading Panel

차트 아래에는 선택된 symbol에 대한 paper trading 진행 상태를 보여준다.

표시 항목:

```text
initial_balance
current_balance
current_signal
signal_history
total_return
open_position
position_return
take_profit
stop_loss
dca_count
applied_params
```

예시 UI 정보:

```text
Initial Balance: 10,000 USDT
Current Balance: 10,240 USDT
Total Return: +2.40%

Current Signal: LONG
Position: BTCUSDT LONG
Average Entry: 65,200
Current Price: 66,100
Position Return: +1.38%

TP: 67,000
SL: 64,300
DCA: 1 / 3
```

---

## 2.9 Signal History

paper trading panel 안에 최근 시그널 기록을 표시한다.

```text
timestamp
symbol
signal
long_score
short_score
risk_level
```

예시:

```text
2026-05-10 14:35 | BTCUSDT | LONG | L:78 / S:22 | MEDIUM
2026-05-10 13:50 | BTCUSDT | NO_TRADE | L:45 / S:38 | LOW
2026-05-10 12:10 | BTCUSDT | SHORT | L:20 / S:74 | HIGH
```

---

## 2.10 Frontend API 연결

초기 API 호출:

```text
GET /api/market/candles?symbol=BTCUSDT&timeframe=5m
GET /api/signals/latest?symbol=BTCUSDT&timeframe=5m
GET /api/signals/history?symbol=BTCUSDT&timeframe=5m
GET /api/paper/account?symbol=BTCUSDT
GET /api/paper/positions?symbol=BTCUSDT
```

---

## 2.11 Frontend 개발 순서

### Step 1. React 프로젝트 세팅

```text
1. Vite + React + TypeScript 생성
2. SCSS 설정
3. global.scss, variables.scss 작성
4. 기본 App 구조 생성
```

---

### Step 2. MainPage 구성

```text
1. HeroSection 생성
2. SymbolTabs 생성
3. 선택된 symbol 상태 관리
4. 임시 mock data로 UI 구성
```

---

### Step 3. Chart 연결

```text
1. 차트 라이브러리 설치
2. candlestick data 표시
3. LONG/SHORT marker 표시
4. Bollinger/EMA overlay 표시
```

---

### Step 4. PaperTradingPanel 구성

```text
1. AccountSummary
2. CurrentPositionCard
3. SignalHistoryList
4. TradingParamsBox
```

---

### Step 5. FastAPI 연결

```text
1. marketApi.ts 작성
2. signalApi.ts 작성
3. paperTradingApi.ts 작성
4. mock data 제거
5. 실제 API 연결
```

---

### Step 6. 초기 MVP 완성

초기 MVP 완성 기준:

```text
1. BTC/ETH/SOL 탭 전환 가능
2. 선택된 symbol의 차트 표시
3. LONG/SHORT marker 표시
4. 현재 시그널 표시
5. paper trading 상태 표시
6. PostgreSQL에 저장된 데이터를 기반으로 작동
```

---

# Section 3. Final Project 확장 계획

## 3.1 Final Project의 방향

Final Project가 시작되면 현재 prototype 구조를 그대로 가져가서 수정 및 업데이트한다.

핵심 방향:

```text
Prototype을 버리지 않고,
Prototype의 Backend/Frontend 구조를 기반으로
Data Warehouse, Data Mining, Thesis용 실험, 개선된 Paper Trading을 추가한다.
```

---

## 3.2 Final Project에서 확장할 부분

### 3.2.1 Data Warehouse 구조화

현재 prototype DB:

```text
candles
indicators
signals
strategy_params
backtest_runs
backtest_trades
paper_accounts
paper_positions
paper_signal_history
```

Final Project에서는 이를 data warehouse 관점으로 확장한다.

예시:

```text
Dim_Time
Dim_Symbol
Dim_Exchange
Dim_Timeframe
Dim_Strategy
Dim_Strategy_Params
Dim_Market_Regime

Fact_Candle
Fact_Indicator
Fact_Signal
Fact_Backtest_Run
Fact_Trade
Fact_Paper_Trading
```

목표:

```text
1. 데이터웨어하우스 과목과 직접 연결
2. 전략 결과를 분석 가능한 구조로 저장
3. 백테스트/시그널/거래 결과를 집계하기 쉽게 설계
```

---

### 3.2.2 Data Mining 추가

Final Project에서는 단순 시그널 생성뿐만 아니라 data mining 요소를 추가한다.

가능한 분석:

```text
1. Market Regime Classification
   - RANGE
   - BULL_TREND
   - BEAR_TREND
   - HIGH_VOLATILITY

2. Rule Analysis
   - 어떤 조건 조합에서 LONG 성공률이 높은가
   - 어떤 조건 조합에서 SHORT 실패율이 높은가

3. Parameter Optimization
   - Bollinger period
   - RSI threshold
   - EMA filter
   - score threshold
   - TP/SL multiplier

4. Feature Importance
   - Bollinger Band feature가 중요한가
   - RSI feature가 중요한가
   - EMA trend filter가 중요한가
   - pattern feature가 중요한가

5. Strategy Comparison
   - Bollinger only
   - Bollinger + RSI
   - Bollinger + RSI + EMA
   - Full prototype indicator
```

---

### 3.2.3 Backtesting 고도화

Prototype backtest는 기본적인 검증을 위한 것이다.

Final Project에서는 다음을 추가한다.

```text
1. 여러 symbol 비교
2. 여러 timeframe 비교
3. 여러 기간 비교
4. walk-forward validation
5. market regime별 성능 분석
6. baseline 전략과 proposed 전략 비교
7. 수수료/슬리피지 민감도 분석
```

저장할 metric:

```text
total_return
win_rate
max_drawdown
profit_factor
number_of_trades
average_win
average_loss
risk_reward_ratio
sharpe_ratio
fees_paid
slippage_cost
long_trade_result
short_trade_result
```

---

### 3.2.4 Paper Trading 고도화

Prototype에서는 단순 paper trading을 구현한다.

Final Project에서는 다음을 추가할 수 있다.

```text
1. 다중 symbol paper trading
2. 포지션별 상세 기록
3. DCA 기록
4. TP/SL hit 기록
5. signal reason 저장
6. paper trading performance 분석
7. strategy parameter별 paper trading 비교
```

---

### 3.2.5 Blockchain/Crypto 확장

promotor가 blockchain/crypto 분야와 관련되어 있으므로, Final Project에서 crypto context data를 선택적으로 추가할 수 있다.

가능한 확장:

```text
1. CoinGecko market data
   - market cap
   - volume
   - BTC dominance

2. Exchange data
   - OHLCV
   - order book snapshot, 선택 사항
   - funding rate, 선물 데이터 사용 시 선택 사항

3. On-chain data, 선택 사항
   - gas fee
   - transaction count
   - token transfer count
   - DEX volume
```

주의:

```text
처음부터 on-chain data를 핵심으로 잡으면 범위가 너무 커질 수 있다.
따라서 Final Project에서 optional extension으로 두는 것이 안전하다.
```

---

## 3.3 Final Project Backend 확장

Prototype Backend 구조를 유지하면서 다음 모듈을 추가한다.

```text
src/
  warehouse/
    dimensions/
    facts/
    etl_pipeline.py

  mining/
    market_regime_classifier.py
    rule_analyzer.py
    parameter_optimizer.py
    feature_importance.py

  experiments/
    baseline_runner.py
    strategy_comparison.py
    walk_forward_validation.py
    report_generator.py
```

---

## 3.4 Final Project Frontend 확장

초기 frontend는 하나의 MainPage만 가진다.

Final Project에서는 여러 페이지로 확장한다.

```text
pages/
  DashboardPage/
  ChartPage/
  BacktestPage/
  PaperTradingPage/
  StrategySettingsPage/
  DataMiningPage/
  ExperimentResultsPage/
```

추가 기능:

```text
1. symbol별 dashboard
2. timeframe 선택
3. strategy parameter editor
4. backtest run history
5. equity curve
6. trade history table
7. market regime별 성능 그래프
8. data mining 결과 시각화
```

---

## 3.5 Final Project 논문 연결

가능한 논문 주제 방향:

```text
데이터웨어하우스와 데이터마이닝 기법을 활용한 암호화폐 거래 시그널 분석 및 모니터링 시스템
```

또는:

```text
암호화폐 시장을 위한 하이브리드 기술적 지표 설계 및 모의거래 모니터링 시스템 구현
```

최종 제목은 교수님과 상의 후 결정한다.

---

## 3.6 Final Project 연구 질문 예시

```text
RQ1. Bollinger Band, RSI, EMA, pattern feature를 결합한 prototype indicator는
     단일 지표 기반 전략보다 안정적인 시그널을 생성하는가?

RQ2. prototype indicator는 횡보장, 상승 추세장, 하락 추세장, 고변동성 구간에서
     각각 어떤 성능 차이를 보이는가?

RQ3. Data Warehouse 구조는 시그널, 백테스트, paper trading 결과 분석에
     어떤 장점을 제공하는가?

RQ4. React 기반 모니터링 웹은 시그널 발생 이유와 paper trading 상태를
     이해하는 데 어떤 정보를 제공하는가?
```

---

## 3.7 Final Project 실험 설계

비교할 전략:

```text
Strategy A: Bollinger Band only
Strategy B: Bollinger Band + RSI
Strategy C: Bollinger Band + RSI + EMA
Strategy D: Bollinger Band + RSI + EMA + Pattern
Strategy E: Full prototype indicator + Risk Management
```

비교할 symbol:

```text
BTCUSDT
ETHUSDT
SOLUSDT
```

비교할 timeframe:

```text
5m
15m
1h
```

비교할 metric:

```text
total_return
win_rate
max_drawdown
profit_factor
number_of_trades
average_trade_return
average_trade_duration
fees_paid
slippage_cost
```

---

## 3.8 Prototype에서 Final Project로 전환하는 방법

현재 Prototype 구조:

```text
Prototype/
  Backend/
  Frontend/
```

Final Project 전환 시:

```text
1. Backend 구조는 유지한다.
2. PostgreSQL schema를 data warehouse 형태로 확장한다.
3. prototype indicator는 개선된 버전으로 업데이트한다.
4. paper trading engine을 고도화한다.
5. data mining module을 추가한다.
6. frontend를 단일 페이지에서 다중 페이지 dashboard로 확장한다.
7. 실험 결과와 논문용 report generator를 추가한다.
```

---

# 4. 현재 단계에서 하지 않을 것

현재 prototype 단계에서 하지 않아도 되는 것:

```text
1. 실제 자동매매
2. 실거래 API key 연결
3. 레버리지 선물 자동매매
4. 복잡한 딥러닝 모델
5. 완전한 data warehouse schema
6. 모든 on-chain data 수집
7. 완벽한 다중 페이지 dashboard
8. 실시간 WebSocket 완성
```

현재 집중할 것:

```text
1. PostgreSQL 기반 데이터 저장
2. prototype indicator 계산
3. LONG/SHORT 시그널 생성
4. paper trading 기본 상태 관리
5. 단일 메인 페이지 웹에서 차트와 상태 표시
6. 나중에 Final Project로 확장 가능한 구조
```

---

# 5. 최종 개발 우선순위

## Priority 1. Backend skeleton

```text
1. FastAPI 프로젝트 생성
2. PostgreSQL 연결
3. 기본 DB model 생성
4. health check API
```

## Priority 2. Data collection

```text
1. BTCUSDT / ETHUSDT / SOLUSDT 수집
2. 5m / 15m candle 저장
3. 중복 저장 방지
```

## Priority 3. Indicator engine

```text
1. Bollinger
2. RSI
3. EMA
4. ATR
5. prototype indicator score
```

## Priority 4. Signal + paper trading

```text
1. signal 생성
2. signal history 저장
3. paper account 생성
4. paper position 생성
5. TP/SL 표시
```

## Priority 5. Frontend main page

```text
1. Hero section
2. BTC/ETH/SOL tabs
3. chart
4. current signal
5. paper trading panel
```

## Priority 6. Backtest

```text
1. 기본 backtest
2. trade history
3. total return
4. win rate
5. max drawdown
```

---

# 6. 한 문장 요약

`Final Project Prototype`은 `prototype_indicator` repository의 `Prototype` 폴더 안에서 `Backend`와 `Frontend`를 분리해 개발하는 프로젝트이다. Backend에서는 PostgreSQL 기반으로 암호화폐 데이터를 수집하고, `prototype indicator`를 통해 LONG/SHORT 시그널과 paper trading 상태를 계산한다. Frontend에서는 React, TypeScript, SCSS로 단일 메인 페이지를 만들어 BTC/ETH/SOL 탭, 차트, 시그널, paper trading 진행 상태를 보여준다. 이후 졸업작품이 시작되면 이 구조를 그대로 가져와 Data Warehouse, Data Mining, 고도화된 Backtesting, Paper Trading, 논문용 실험 분석 시스템으로 확장한다.
