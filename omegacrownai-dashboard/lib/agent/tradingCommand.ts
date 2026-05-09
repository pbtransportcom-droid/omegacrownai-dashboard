import { analyzeSymbolV2, scanMarketV2, MarketType, Timeframe } from "@/lib/trading-v2/engine";
import { prisma } from "@/lib/db";
import { buildTradingStrategyDraft } from "./tradingDraft";

type TradingCommandResult = {
  ok: boolean;
  intent: string;
  plan: string[];
  reply: string;
  actions: any[];
  nextSuggestions: string[];
};

function normalizeQuestion(message: string) {
  return String(message || "").trim();
}

function extractTimeframe(message: string): Timeframe {
  const text = message.toLowerCase();

  if (text.includes("24h") || text.includes("24 hour") || text.includes("today")) return "24h";
  if (text.includes("7d") || text.includes("7 day") || text.includes("week")) return "7d";
  if (text.includes("30d") || text.includes("30 day") || text.includes("month")) return "30d";
  if (text.includes("40d") || text.includes("40 day")) return "40d";
  if (text.includes("90d") || text.includes("90 day")) return "90d";
  if (text.includes("1y") || text.includes("1 year") || text.includes("year")) return "1y";

  return "40d";
}

function extractMarketType(message: string): MarketType {
  const text = message.toLowerCase();

  if (
    text.includes("stock") ||
    text.includes("equity") ||
    text.includes("aapl") ||
    text.includes("tsla") ||
    text.includes("nvda") ||
    text.includes("poet") ||
    text.includes("msft")
  ) {
    return "stock";
  }

  return "crypto";
}

function cleanSymbol(raw: string, marketType: MarketType) {
  let symbol = raw
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "")
    .trim();

  if (!symbol) return "";

  if (marketType === "crypto") {
    symbol = symbol.replace("-USD", "").replace("USDT", "");
    return `${symbol}USDT`;
  }

  return symbol.replace("USDT", "").replace("-USD", "");
}

function extractSymbols(message: string, marketType: MarketType) {
  const upper = message.toUpperCase();

  const known = [
    "BTC", "ETH", "SOL", "LINK", "DOGE", "XRP", "ADA", "AVAX", "BNB", "LTC", "DOT", "MATIC",
    "AAPL", "TSLA", "NVDA", "POET", "MSFT", "META", "AMD", "GOOGL", "AMZN", "NFLX", "PLTR", "XOM", "WMT"
  ];

  const found = known.filter((symbol) => {
    const re = new RegExp(`\\b${symbol}(USDT|-USD)?\\b`, "i");
    return re.test(upper);
  });

  return [...new Set(found.map((symbol) => cleanSymbol(symbol, marketType)))].filter(Boolean);
}

function isTradingCommand(message: string) {
  const text = message.toLowerCase();

  return (
    text.includes("scan ") ||
    text.includes("analyze ") ||
    text.includes("compare ") ||
    text.includes("trading") ||
    text.includes("ticker") ||
    text.includes("crypto") ||
    text.includes("stock") ||
    text.includes("buy watch") ||
    text.includes("strongest setup") ||
    text.includes("strongest crypto") ||
    text.includes("safest entry")
  );
}

function formatMoney(value: any) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "N/A";
  return n < 1 ? n.toFixed(6) : n.toFixed(4);
}

function formatPercent(value: any) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "N/A";
  return `${n.toFixed(0)}%`;
}

function buildSingleAnalysisReply(analysis: any) {
  const profile = analysis.profile || {};
  const power = analysis.powerSummary || {};
  const plan = analysis.tradePlan || {};

  return [
    `King Trading AI Bot scanned ${analysis.symbol}.`,
    ``,
    `${profile.name || analysis.symbol} · ${profile.sector || analysis.marketType}`,
    profile.summary ? `Summary: ${profile.summary}` : "",
    ``,
    `Signal: ${analysis.signal}`,
    `Confidence: ${formatPercent(analysis.confidence)}`,
    `Risk: ${analysis.risk}`,
    `Price: ${formatMoney(analysis.price)}`,
    `Change: ${Number(analysis.changePercent || 0).toFixed(2)}%`,
    ``,
    `Power: Buy ${formatPercent(power.buyPower)} · Sell ${formatPercent(power.sellPower)} · Net ${power.netPower ?? "N/A"}`,
    `Pressure: ${power.pressure || "BALANCED"}`,
    ``,
    `Entry: ${Array.isArray(plan.entryZone) ? plan.entryZone.map(formatMoney).join(" - ") : "N/A"}`,
    `Stop: ${formatMoney(plan.stopLoss)}`,
    `Take Profit: ${Array.isArray(plan.takeProfit) ? plan.takeProfit.map(formatMoney).join(" / ") : "N/A"}`,
    `Support: ${formatMoney(plan.support)}`,
    `Resistance: ${formatMoney(plan.resistance)}`,
    ``,
    analysis.bestTiming ? `Best timing: ${analysis.bestTiming}` : "",
    analysis.verdict ? `Verdict: ${analysis.verdict}` : "",
    profile.riskNote ? `Risk note: ${profile.riskNote}` : "",
    ``,
    `Provider: ${analysis.provider}`,
    `Educational only — not financial advice.`
  ].filter(Boolean).join("\n");
}

function buildScanReply(scan: any) {
  const ranked = Array.isArray(scan.ranked) ? scan.ranked : [];
  const top = ranked.slice(0, 5);

  if (!top.length) {
    return "King Trading AI Bot scanned the market, but no ranked results were returned.";
  }

  return [
    `King Trading AI Bot scanned ${scan.marketType} market on ${scan.timeframe}.`,
    ``,
    `Top ranked setups:`,
    ...top.map((item: any, index: number) => {
      return `${index + 1}. ${item.symbol} — ${item.signal} · ${formatPercent(item.confidence)} confidence · ${item.risk || "unknown"} risk · ${item.pressure || "BALANCED"}`;
    }),
    ``,
    `Best setup: ${top[0].symbol} with ${formatPercent(top[0].confidence)} confidence.`,
    top[0].bestTiming ? `Best timing: ${top[0].bestTiming}` : "",
    ``,
    `Educational only — not financial advice.`
  ].filter(Boolean).join("\n");
}

async function findOrCreateTradingOwner(userId?: string, sessionId?: string) {
  const raw = String(userId || "").trim();

  const email =
    raw.includes("@") && raw !== "anonymous"
      ? raw.toLowerCase()
      : `guest-trading-${sessionId || Date.now()}@omegacrownai.local`;

  return prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: email.includes("omegacrownai.local") ? "Guest Trader" : null,
      passwordHash: "agent-created-user",
    },
  });
}

function shouldCreateTradingProject(message: string) {
  const text = message.toLowerCase();
  return (
    text.includes("create trading strategy") ||
    text.includes("build trading strategy") ||
    text.includes("save trading strategy") ||
    text.includes("create strategy") ||
    text.includes("build strategy")
  );
}

async function createTradingProjectBuild({
  userId,
  sessionId,
  message,
  marketType,
  timeframe,
  symbol,
  analysis,
  scan,
}: {
  userId?: string;
  sessionId?: string;
  message: string;
  marketType: MarketType;
  timeframe: Timeframe;
  symbol?: string;
  analysis?: any;
  scan?: any;
}) {
  const owner = await findOrCreateTradingOwner(userId, sessionId);
  const draft = buildTradingStrategyDraft({
    message,
    marketType,
    timeframe,
    symbol,
    analysis,
    scan,
  });

  const project = await prisma.project.create({
    data: {
      name: draft.name,
      ownerId: owner.id,
    },
  });

  const build = await prisma.projectBuild.create({
    data: {
      projectId: project.id,
      label: "Initial trading strategy",
      status: "draft",
      source: "king_trading_system",
      domain: "trading",
    },
  });

  const artifact = await prisma.projectBuildArtifact.create({
    data: {
      projectId: project.id,
      buildId: build.id,
      kind: "strategy_draft_v1",
      payload: draft,
    },
  });

  const execution = await prisma.agentExecution.create({
    data: {
      projectId: project.id,
      prompt: message,
      intents: {
        primary: "trading_strategy",
        marketType,
        timeframe,
      },
      agents: {
        creator: "King Trading System",
        builder: "Sugent Trading Builder",
      },
      execution: {
        type: "trading_strategy",
        buildId: build.id,
        artifactId: artifact.id,
        draftVersion: "strategy_draft_v1",
      },
      reply: `Created trading strategy draft for ${draft.symbol || draft.marketType}.`,
    },
  });

  return {
    project,
    build,
    artifact,
    execution,
    draft,
  };
}


export async function runTradingCommand(message: string, options?: { userId?: string; sessionId?: string }): Promise<TradingCommandResult | null> {
  const cleanMessage = normalizeQuestion(message);

  if (!isTradingCommand(cleanMessage)) {
    return null;
  }

  const timeframe = extractTimeframe(cleanMessage);
  const marketType = extractMarketType(cleanMessage);
  const symbols = extractSymbols(cleanMessage, marketType);
  const lower = cleanMessage.toLowerCase();

  if (
    lower.includes("strongest") ||
    lower.includes("top setup") ||
    lower.includes("best setup") ||
    lower.includes("scan market") ||
    lower.includes("scan crypto") ||
    lower.includes("scan stock")
  ) {
    const scan = await scanMarketV2({
      marketType,
      timeframe,
      symbols: symbols.length ? symbols : undefined,
    });

    return {
      ok: true,
      intent: "trading_scan",
      plan: [
        `Detect market type: ${marketType}`,
        `Use timeframe: ${timeframe}`,
        `Scan symbols directly from trading engine`,
        `Rank by signal, confidence, power, and risk`,
      ],
      reply: buildScanReply(scan),
      actions: [{ type: "trading_scan", result: scan }],
      nextSuggestions: [
        "Explain the strongest setup",
        "Which symbol should I avoid?",
        "Show me the safest entry plan",
      ],
    };
  }

  if (lower.includes("compare") || lower.includes(" vs ") || symbols.length > 1) {
    const scan = await scanMarketV2({
      marketType,
      timeframe,
      symbols: symbols.length ? symbols : undefined,
    });

    return {
      ok: true,
      intent: "trading_compare",
      plan: [
        `Compare symbols: ${symbols.join(", ") || "market list"}`,
        `Use timeframe: ${timeframe}`,
        `Rank by confidence, signal, power, and risk`,
      ],
      reply: buildScanReply(scan),
      actions: [{ type: "trading_compare", result: scan }],
      nextSuggestions: [
        "Explain the best ranked symbol",
        "Compare risk between these symbols",
        "Give me the safest entry plan",
      ],
    };
  }

  const symbol = symbols[0] || cleanSymbol(cleanMessage.split(/\s+/).find((w) => /^[A-Z]{2,6}(USDT|-USD)?$/i.test(w)) || "BTC", marketType);

  const analysis = await analyzeSymbolV2({
    symbol,
    marketType,
    timeframe,
  });

  const savedStrategy = shouldCreateTradingProject(cleanMessage)
    ? await createTradingProjectBuild({
        userId: options?.userId,
        sessionId: options?.sessionId,
        message: cleanMessage,
        marketType,
        timeframe,
        symbol,
        analysis,
      })
    : null;

  return {
    ok: true,
    intent: savedStrategy ? "trading_strategy" : "trading_analysis",
    plan: [
      `Detect symbol: ${symbol}`,
      `Detect market type: ${marketType}`,
      `Use timeframe: ${timeframe}`,
      `Analyze trend, power, confidence, risk, entry, stop, and take-profit`,
      ...(savedStrategy ? ["Create Sugent trading project", "Save strategy_draft_v1 artifact"] : []),
    ],
    reply: savedStrategy
      ? `${buildSingleAnalysisReply(analysis)}\n\nSaved as Sugent trading strategy.\nProject: /projects/${savedStrategy.project.id}\nBuilder: /build/trading/${savedStrategy.project.id}?buildId=${savedStrategy.build.id}`
      : buildSingleAnalysisReply(analysis),
    actions: [
      { type: "trading_analysis", result: analysis },
      ...(savedStrategy
        ? [
            {
              type: "trading_strategy_created",
              projectId: savedStrategy.project.id,
              buildId: savedStrategy.build.id,
              artifactId: savedStrategy.artifact.id,
              executionId: savedStrategy.execution.id,
              openUrl: `/projects/${savedStrategy.project.id}`,
              builderUrl: `/build/trading/${savedStrategy.project.id}?buildId=${savedStrategy.build.id}`,
              draft: savedStrategy.draft,
            },
          ]
        : []),
    ],
    nextSuggestions: [
      savedStrategy ? "Open trading builder" : `Explain ${analysis.symbol} power`,
      `Compare ${analysis.symbol} with BTC`,
      `Give me the safest entry plan`,
    ],
  };
}
