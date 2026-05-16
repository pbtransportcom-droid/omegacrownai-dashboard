export function getTradingRepoArtifact() {
  return {
    department: "trading",
    artifactType: "paper_trading_code_repository",
    safetyMode: "paper_trading_only",
    liveTradingEnabled: false,
    warning:
      "This artifact is for paper trading and educational market analysis only. Live trading requires manual review, real broker configuration, and explicit safety approval.",
    folderTree: [
      "saits-v1/",
      "saits-v1/main.py",
      "saits-v1/config.yaml",
      "saits-v1/requirements.txt",
      "saits-v1/Dockerfile",
      "saits-v1/docker-compose.yml",
      "saits-v1/README.md",
      "saits-v1/models.py",
      "saits-v1/backtest_engine.py",
      "saits-v1/dashboard.py",
      "saits-v1/agents/__init__.py",
      "saits-v1/agents/market_data_agent.py",
      "saits-v1/agents/analysis_agent.py",
      "saits-v1/agents/risk_agent.py",
      "saits-v1/agents/execution_agent.py",
      "saits-v1/agents/portfolio_agent.py",
      "saits-v1/agents/learning_agent.py",
      "saits-v1/tests/test_risk_agent.py",
      "saits-v1/tests/test_signal_flow.py",
    ],
    files: [
      {
        path: "main.py",
        purpose: "Entry point that starts the paper-trading agents and verifies live trading is disabled.",
      },
      {
        path: "config.yaml",
        purpose: "Central settings for assets, indicators, paper mode, risk limits, and provider placeholders.",
      },
      {
        path: "models.py",
        purpose: "Shared data models such as TradeSignal, Position, RiskDecision, and OrderIntent.",
      },
      {
        path: "agents/market_data_agent.py",
        purpose: "Fetches historical and simulated real-time market data for stocks, ETFs, and crypto.",
      },
      {
        path: "agents/analysis_agent.py",
        purpose: "Calculates RSI, MACD, EMA, Bollinger Bands, VWAP, sentiment placeholders, and signal rationale.",
      },
      {
        path: "agents/risk_agent.py",
        purpose: "Enforces max risk per trade, daily loss limit, drawdown limit, liquidity checks, and veto logic.",
      },
      {
        path: "agents/execution_agent.py",
        purpose: "Paper execution engine only; logs simulated orders and blocks live orders unless safety gate is passed.",
      },
      {
        path: "agents/portfolio_agent.py",
        purpose: "Tracks paper positions, P&L, equity curve, alerts, and explainability records.",
      },
      {
        path: "agents/learning_agent.py",
        purpose: "Runs nightly review placeholders and produces improvement suggestions.",
      },
      {
        path: "backtest_engine.py",
        purpose: "Runs a simplified two-year backtest workflow and reports win rate, profit factor, Sharpe, and drawdown.",
      },
      {
        path: "dashboard.py",
        purpose: "Streamlit dashboard starter for P&L, open positions, equity curve, alerts, and trade explanations.",
      },
      {
        path: "README.md",
        purpose: "Local setup, paper-trading instructions, safety warning, and live-key connection checklist.",
      },
    ],
    riskRules: {
      maxRiskPerTradePercent: 2,
      dailyLossLimitPercent: 5,
      maxDrawdownPercent: 12,
      paperTradingDefault: true,
      liveTradingRequiresManualOverride: true,
      brokerWithdrawalPermissionsAllowed: false,
    },
    nextActions: [
      "Generate repository files into the Trading workspace.",
      "Run paper-mode safety checks.",
      "Run the simplified backtest engine.",
      "Open dashboard starter.",
      "Review all risk gates before any live broker connection.",
    ],
  };
}
