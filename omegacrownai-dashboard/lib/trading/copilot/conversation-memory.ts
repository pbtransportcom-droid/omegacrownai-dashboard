import fs from "fs";
import path from "path";

const MEMORY_DIR = path.join(process.cwd(), "data", "trading-memory");
const DEFAULT_USER_ID = "default";

export type TradingMemory = {
  userId: string;
  accountSize: number;
  maxRiskPercent: number;
  watchlist: string[];
  portfolio: any[];
  favoriteSectors: string[];
  conversations: {
    message: string;
    intent?: string;
    answer?: string;
    createdAt: string;
  }[];
  updatedAt: string;
};

function ensureMemoryDir() {
  fs.mkdirSync(MEMORY_DIR, { recursive: true });
}

function memoryPath(userId = DEFAULT_USER_ID) {
  return path.join(MEMORY_DIR, `${userId}.json`);
}

export function getTradingMemory(userId = DEFAULT_USER_ID): TradingMemory {
  ensureMemoryDir();

  const file = memoryPath(userId);

  if (!fs.existsSync(file)) {
    return {
      userId,
      accountSize: 10000,
      maxRiskPercent: 1,
      watchlist: ["NVDA", "AVGO", "AMD", "PLTR", "MSFT"],
      portfolio: [],
      favoriteSectors: ["AI", "Semiconductors", "Cloud"],
      conversations: [],
      updatedAt: new Date().toISOString(),
    };
  }

  return JSON.parse(fs.readFileSync(file, "utf8"));
}

export function saveTradingMemory(memory: TradingMemory) {
  ensureMemoryDir();

  const updated = {
    ...memory,
    updatedAt: new Date().toISOString(),
    conversations: (memory.conversations || []).slice(0, 30),
  };

  fs.writeFileSync(memoryPath(updated.userId), JSON.stringify(updated, null, 2));
  return updated;
}

export function updateTradingMemory(
  userId: string,
  patch: Partial<TradingMemory>
) {
  const current = getTradingMemory(userId);

  return saveTradingMemory({
    ...current,
    ...patch,
    userId,
    watchlist: patch.watchlist || current.watchlist,
    portfolio: patch.portfolio || current.portfolio,
    favoriteSectors: patch.favoriteSectors || current.favoriteSectors,
    conversations: patch.conversations || current.conversations,
  });
}

export function rememberConversation(input: {
  userId?: string;
  message: string;
  intent?: string;
  answer?: string;
}) {
  const userId = input.userId || DEFAULT_USER_ID;
  const memory = getTradingMemory(userId);

  memory.conversations = [
    {
      message: input.message,
      intent: input.intent,
      answer: input.answer,
      createdAt: new Date().toISOString(),
    },
    ...(memory.conversations || []),
  ].slice(0, 30);

  return saveTradingMemory(memory);
}
