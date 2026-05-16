export function getTradingFileContentArtifact() {
  const files = [
    {
      path: "main.py",
      content: `from agents.market_data_agent import MarketDataAgent
from agents.analysis_agent import AnalysisAgent
from agents.risk_agent import RiskAgent
from agents.execution_agent import ExecutionAgent
from agents.portfolio_agent import PortfolioAgent
from agents.learning_agent import LearningAgent
from models import TradeSignal


PAPER_TRADING_MODE = True
LIVE_TRADING_ENABLED = False


def safety_boot_check():
    if not PAPER_TRADING_MODE:
        raise RuntimeError("Safety lock: paper trading mode must stay enabled by default.")
    if LIVE_TRADING_ENABLED:
        raise RuntimeError("Safety lock: live trading is disabled in this starter repository.")
    print("SAITS v1.0 safety check passed: paper trading only.")


def main():
    safety_boot_check()

    market_data = MarketDataAgent()
    analysis = AnalysisAgent()
    risk = RiskAgent()
    execution = ExecutionAgent(paper_trading=True)
    portfolio = PortfolioAgent()
    learning = LearningAgent()

    symbols = ["SPY", "QQQ", "AAPL", "BTC-USD", "ETH-USD", "SOL-USD"]
    market_snapshot = market_data.get_snapshot(symbols)

    signals = analysis.generate_signals(market_snapshot)

    for signal in signals:
        decision = risk.evaluate(signal=signal, account_equity=portfolio.equity)
        if decision.approved:
            order = execution.place_order(signal, decision.position_size)
            portfolio.record_order(order, decision)
        else:
            portfolio.record_rejection(signal, decision)

    learning.review_day(portfolio.trade_log)
    portfolio.print_summary()


if __name__ == "__main__":
    main()
`,
    },
    {
      path: "config.yaml",
      content: `system:
  name: "Sovereign Autonomous AI Trading System"
  version: "1.0"
  mode: "paper"
  live_trading_enabled: false

markets:
  stocks:
    enabled: true
    symbols: ["SPY", "QQQ", "AAPL", "MSFT", "NVDA"]
  crypto:
    enabled: true
    symbols: ["BTC-USD", "ETH-USD", "SOL-USD"]

risk:
  max_risk_per_trade_percent: 2
  daily_loss_limit_percent: 5
  max_drawdown_percent: 12
  allow_broker_withdrawal_permissions: false

indicators:
  rsi_period: 14
  ema_fast: 9
  ema_medium: 21
  ema_slow: 50
  ema_trend: 200
  macd_fast: 12
  macd_slow: 26
  macd_signal: 9
  bollinger_period: 20

brokers:
  alpaca:
    mode: "paper"
    api_key_env: "ALPACA_PAPER_API_KEY"
    api_secret_env: "ALPACA_PAPER_API_SECRET"
  coinbase:
    mode: "paper"
    api_key_env: "COINBASE_PAPER_API_KEY"
    api_secret_env: "COINBASE_PAPER_API_SECRET"
  binance:
    mode: "testnet"
    api_key_env: "BINANCE_TESTNET_API_KEY"
    api_secret_env: "BINANCE_TESTNET_API_SECRET"
`,
    },
    {
      path: "models.py",
      content: `from dataclasses import dataclass
from typing import Dict, Optional


@dataclass
class TradeSignal:
    symbol: str
    direction: str
    entry_price: float
    stop_loss: float
    take_profit: float
    confidence: float
    rationale: str


@dataclass
class RiskDecision:
    approved: bool
    reason: str
    position_size: float
    max_loss_amount: float


@dataclass
class PaperOrder:
    symbol: str
    direction: str
    quantity: float
    entry_price: float
    stop_loss: float
    take_profit: float
    status: str
    rationale: str


@dataclass
class Position:
    symbol: str
    quantity: float
    entry_price: float
    current_price: float
    unrealized_pnl: float
`,
    },
    {
      path: "agents/market_data_agent.py",
      content: `class MarketDataAgent:
    def get_snapshot(self, symbols):
        # Starter placeholder: replace with Alpaca, Polygon, Coinbase, Binance, or other providers.
        snapshot = {}
        for symbol in symbols:
            snapshot[symbol] = {
                "price": 100.0 if "USD" not in symbol else 50000.0,
                "volume": 1000000,
                "sentiment_score": 0.55,
                "rsi": 48,
                "ema_9": 101,
                "ema_21": 100,
                "ema_50": 98,
                "ema_200": 95,
                "macd": 1.2,
                "macd_signal": 0.9,
            }
        return snapshot
`,
    },
    {
      path: "agents/analysis_agent.py",
      content: `from models import TradeSignal


class AnalysisAgent:
    def generate_signals(self, market_snapshot):
        signals = []

        for symbol, data in market_snapshot.items():
            bullish = (
                data["ema_9"] > data["ema_21"]
                and data["macd"] > data["macd_signal"]
                and data["rsi"] < 70
                and data["sentiment_score"] >= 0.5
            )

            if bullish:
                entry = float(data["price"])
                stop = entry * 0.98
                target = entry * 1.04
                signals.append(
                    TradeSignal(
                        symbol=symbol,
                        direction="long",
                        entry_price=entry,
                        stop_loss=stop,
                        take_profit=target,
                        confidence=0.62,
                        rationale="EMA 9/21 bullish, MACD confirmation, RSI not overbought, sentiment acceptable.",
                    )
                )

        return signals
`,
    },
    {
      path: "agents/risk_agent.py",
      content: `from models import RiskDecision


class RiskAgent:
    def __init__(self):
        self.max_risk_per_trade_percent = 2
        self.daily_loss_limit_percent = 5
        self.max_drawdown_percent = 12

    def evaluate(self, signal, account_equity):
        risk_amount = account_equity * (self.max_risk_per_trade_percent / 100)
        price_risk = abs(signal.entry_price - signal.stop_loss)

        if price_risk <= 0:
            return RiskDecision(False, "Invalid stop loss distance.", 0, 0)

        position_size = risk_amount / price_risk

        if signal.confidence < 0.55:
            return RiskDecision(False, "Signal confidence below minimum threshold.", 0, risk_amount)

        return RiskDecision(
            approved=True,
            reason="Approved: within max risk per trade and confidence threshold.",
            position_size=round(position_size, 6),
            max_loss_amount=round(risk_amount, 2),
        )
`,
    },
    {
      path: "agents/execution_agent.py",
      content: `from models import PaperOrder


class ExecutionAgent:
    def __init__(self, paper_trading=True):
        self.paper_trading = paper_trading
        self.live_trading_enabled = False

    def place_order(self, signal, quantity):
        if not self.paper_trading or self.live_trading_enabled:
            raise RuntimeError("Live trading is disabled. This starter only supports paper orders.")

        return PaperOrder(
            symbol=signal.symbol,
            direction=signal.direction,
            quantity=quantity,
            entry_price=signal.entry_price,
            stop_loss=signal.stop_loss,
            take_profit=signal.take_profit,
            status="paper_filled",
            rationale=signal.rationale,
        )
`,
    },
    {
      path: "agents/portfolio_agent.py",
      content: `class PortfolioAgent:
    def __init__(self):
        self.equity = 100000.0
        self.trade_log = []
        self.rejections = []

    def record_order(self, order, decision):
        self.trade_log.append({"order": order, "risk": decision})
        print(f"Paper order recorded: {order.symbol} {order.direction} qty={order.quantity}")

    def record_rejection(self, signal, decision):
        self.rejections.append({"signal": signal, "risk": decision})
        print(f"Signal rejected: {signal.symbol} reason={decision.reason}")

    def print_summary(self):
        print("Portfolio Summary")
        print(f"Equity: {self.equity}")
        print(f"Paper trades: {len(self.trade_log)}")
        print(f"Rejected signals: {len(self.rejections)}")
`,
    },
    {
      path: "agents/learning_agent.py",
      content: `class LearningAgent:
    def review_day(self, trade_log):
        print("Learning Agent nightly review placeholder")
        print(f"Trades reviewed: {len(trade_log)}")
        print("Suggestion: collect more paper trading data before adjusting risk.")
`,
    },
    {
      path: "backtest_engine.py",
      content: `def run_backtest():
    # Starter placeholder. Replace with historical OHLCV loading and chronological simulation.
    return {
        "period": "2 years",
        "mode": "paper_simulation",
        "win_rate": 0.0,
        "profit_factor": 0.0,
        "sharpe_ratio": 0.0,
        "max_drawdown": 0.0,
        "note": "Backtest engine scaffold created. Add historical data provider before trusting metrics.",
    }


if __name__ == "__main__":
    print(run_backtest())
`,
    },
    {
      path: "dashboard.py",
      content: `import streamlit as st


st.set_page_config(page_title="SAITS v1.0 Dashboard", layout="wide")

st.title("Sovereign Autonomous AI Trading System")
st.caption("Paper trading only. Live trading is disabled by default.")

col1, col2, col3 = st.columns(3)
col1.metric("Mode", "Paper")
col2.metric("Max Risk / Trade", "2%")
col3.metric("Live Trading", "Disabled")

st.subheader("Open Positions")
st.info("No live positions. Connect paper execution logs to populate this table.")

st.subheader("Explainability")
st.write("Every signal, risk decision, and paper order should include a rationale.")
`,
    },
    {
      path: "requirements.txt",
      content: `pandas>=2.0.0
numpy>=1.24.0
streamlit>=1.30.0
pyyaml>=6.0.0
pytest>=7.0.0
`,
    },
    {
      path: "Dockerfile",
      content: `FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python", "main.py"]
`,
    },
    {
      path: "docker-compose.yml",
      content: `services:
  saits:
    build: .
    environment:
      PAPER_TRADING_MODE: "true"
      LIVE_TRADING_ENABLED: "false"
    command: python main.py

  dashboard:
    build: .
    ports:
      - "8501:8501"
    command: streamlit run dashboard.py --server.address=0.0.0.0
`,
    },
    {
      path: "tests/test_risk_agent.py",
      content: `from agents.risk_agent import RiskAgent
from models import TradeSignal


def test_risk_agent_approves_valid_signal():
    risk = RiskAgent()
    signal = TradeSignal("SPY", "long", 100, 98, 104, 0.7, "test")
    decision = risk.evaluate(signal, 100000)
    assert decision.approved is True
    assert decision.position_size > 0


def test_risk_agent_rejects_invalid_stop():
    risk = RiskAgent()
    signal = TradeSignal("SPY", "long", 100, 100, 104, 0.7, "test")
    decision = risk.evaluate(signal, 100000)
    assert decision.approved is False
`,
    },
    {
      path: "tests/test_signal_flow.py",
      content: `from agents.market_data_agent import MarketDataAgent
from agents.analysis_agent import AnalysisAgent


def test_signal_flow_generates_list():
    data = MarketDataAgent().get_snapshot(["SPY"])
    signals = AnalysisAgent().generate_signals(data)
    assert isinstance(signals, list)
`,
    },
    {
      path: "README.md",
      content: `# SAITS v1.0 — Sovereign Autonomous AI Trading System

Generated by OmegaCrownAI Trading Builder.

This repository is a **paper-trading starter system**. It is designed to help you test architecture, agent flow, risk controls, dashboard layout, and backtesting scaffolding before any real broker connection.

## Critical Safety Notice

This starter is **paper-trading only**.

Live trading is disabled by default.

This is educational software scaffolding, not financial advice, not a guarantee of profit, and not a complete live trading system.

Do **not** add real broker keys or connect live brokerage accounts until all of these are complete:

1. Code review
2. Paper-trading test period
3. Backtest review
4. Risk review
5. Security review
6. Manual live-trading approval

Broker API keys should never include withdrawal permissions.

## Default Risk Rules

- Max risk per trade: 2%
- Daily loss limit: 5%
- Max drawdown limit: 12%
- Broker withdrawal permissions: blocked
- Paper trading mode: enabled
- Live trading mode: disabled

## Included Files

\`\`\`text
main.py
config.yaml
models.py
backtest_engine.py
dashboard.py
requirements.txt
Dockerfile
docker-compose.yml
agents/market_data_agent.py
agents/analysis_agent.py
agents/risk_agent.py
agents/execution_agent.py
agents/portfolio_agent.py
agents/learning_agent.py
tests/test_risk_agent.py
tests/test_signal_flow.py
README.md
\`\`\`

## What Each Major File Does

| File | Purpose |
| --- | --- |
| main.py | Starts the paper-trading agent flow and runs the safety boot check. |
| config.yaml | Stores market, broker, indicator, and risk settings. |
| models.py | Defines TradeSignal, RiskDecision, PaperOrder, and Position models. |
| agents/market_data_agent.py | Provides starter market data snapshots. Replace with paper data providers later. |
| agents/analysis_agent.py | Generates starter signals using EMA, MACD, RSI, and sentiment placeholders. |
| agents/risk_agent.py | Enforces max risk per trade and vetoes invalid trades. |
| agents/execution_agent.py | Places paper orders only and blocks live trading. |
| agents/portfolio_agent.py | Tracks paper orders, rejections, and account summary. |
| agents/learning_agent.py | Reviews paper trades and suggests future improvements. |
| backtest_engine.py | Scaffold for historical strategy simulation. |
| dashboard.py | Streamlit dashboard starter. |
| tests/ | Starter validation tests for risk and signal flow. |

## Local Setup

Unzip the bundle:

\`\`\`bash
unzip saits-v1.zip
cd saits-v1
\`\`\`

Create and activate a Python environment:

\`\`\`bash
python -m venv .venv
source .venv/bin/activate
\`\`\`

Install dependencies:

\`\`\`bash
pip install -r requirements.txt
\`\`\`

## Run the Paper-Trading Starter

\`\`\`bash
python main.py
\`\`\`

Expected behavior:

- Safety boot check passes.
- Agents initialize.
- Paper signals are generated.
- Risk agent approves or rejects signals.
- Execution agent records paper orders only.
- Portfolio summary prints to the terminal.

## Run the Dashboard

\`\`\`bash
streamlit run dashboard.py
\`\`\`

Dashboard includes starter panels for:

- Mode
- Max risk per trade
- Live trading status
- Open positions placeholder
- Explainability placeholder

## Run Tests

\`\`\`bash
pytest
\`\`\`

Expected starter tests:

- Risk agent approves valid signal.
- Risk agent rejects invalid stop loss.
- Signal flow returns a list.

## Docker Run

\`\`\`bash
docker compose up --build
\`\`\`

This starts:

- SAITS paper-trading process
- Streamlit dashboard on port 8501

## Paper Trading Roadmap

1. Replace placeholder market data with paper/sandbox data providers.
2. Add historical OHLCV loader.
3. Expand the backtest engine.
4. Add paper broker adapters.
5. Add persistent trade logging.
6. Run 2–4 weeks of paper trading.
7. Review all rejected and approved trades.
8. Improve risk logic and signal quality.
9. Only then consider live-readiness review.

## Live Trading Warning

Do not turn this into live trading by simply adding real API keys.

Before live mode:

- Add proper secret management.
- Use paper keys first.
- Confirm withdrawal permissions are disabled.
- Add broker sandbox tests.
- Add order size caps.
- Add kill switch.
- Add manual approval gate.
- Review compliance, risk, and logs.
- Start with very small capital only after extended paper testing.

## Support Notes

This generated repository is a starting point. It is intentionally conservative and incomplete for live execution. The safest next step is to keep improving paper-mode testing, backtesting, monitoring, and risk validation.
`,
    },
  ];

  return {
    department: "trading",
    artifactType: "actual_file_content_bundle",
    safetyMode: "paper_trading_only",
    liveTradingEnabled: false,
    fileCount: files.length,
    files,
    warning:
      "Generated starter code is for paper trading only. It is educational scaffolding, not financial advice and not live trading software.",
  };
}
