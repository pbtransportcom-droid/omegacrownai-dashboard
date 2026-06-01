import fs from "fs";
import path from "path";

const JOURNAL_DIR = path.join(process.cwd(), "data", "trading-journal");
const DEFAULT_USER_ID = "default";

export type TradeJournalEntry = {
  id: string;
  userId: string;
  symbol: string;
  side: "long" | "short";
  entryPrice: number;
  exitPrice?: number;
  shares: number;
  riskDollars?: number;
  notes?: string;
  openedAt: string;
  closedAt?: string;
  status: "open" | "closed";
};

function ensureDir() {
  fs.mkdirSync(JOURNAL_DIR, { recursive: true });
}

function filePath(userId = DEFAULT_USER_ID) {
  return path.join(JOURNAL_DIR, `${userId}.json`);
}

export function getTradeJournal(userId = DEFAULT_USER_ID): TradeJournalEntry[] {
  ensureDir();
  const file = filePath(userId);

  if (!fs.existsSync(file)) return [];

  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function saveJournal(userId: string, entries: TradeJournalEntry[]) {
  ensureDir();
  fs.writeFileSync(filePath(userId), JSON.stringify(entries, null, 2));
  return entries;
}

export function saveTradeEntry(input: {
  userId?: string;
  symbol: string;
  side?: "long" | "short";
  entryPrice: number;
  shares: number;
  riskDollars?: number;
  notes?: string;
}) {
  const userId = input.userId || DEFAULT_USER_ID;
  const entries = getTradeJournal(userId);

  const entry: TradeJournalEntry = {
    id: "TRD-" + Math.random().toString(36).slice(2, 10).toUpperCase(),
    userId,
    symbol: input.symbol.toUpperCase(),
    side: input.side || "long",
    entryPrice: Number(input.entryPrice),
    shares: Number(input.shares),
    riskDollars: Number(input.riskDollars || 0),
    notes: input.notes || "",
    openedAt: new Date().toISOString(),
    status: "open",
  };

  return {
    entry,
    entries: saveJournal(userId, [entry, ...entries]),
  };
}

export function closeTradeEntry(input: {
  userId?: string;
  id: string;
  exitPrice: number;
  notes?: string;
}) {
  const userId = input.userId || DEFAULT_USER_ID;
  const entries = getTradeJournal(userId);

  const updated = entries.map((entry) =>
    entry.id === input.id
      ? {
          ...entry,
          exitPrice: Number(input.exitPrice),
          notes: input.notes || entry.notes,
          closedAt: new Date().toISOString(),
          status: "closed" as const,
        }
      : entry
  );

  return saveJournal(userId, updated);
}

export function getJournalStats(userId = DEFAULT_USER_ID) {
  const entries = getTradeJournal(userId);
  const closed = entries.filter((entry) => entry.status === "closed");

  const totalPnL = closed.reduce((sum, entry) => {
    const direction = entry.side === "short" ? -1 : 1;
    const pnl =
      ((Number(entry.exitPrice || 0) - Number(entry.entryPrice || 0)) *
        Number(entry.shares || 0)) *
      direction;

    return sum + pnl;
  }, 0);

  const wins = closed.filter((entry) => {
    const direction = entry.side === "short" ? -1 : 1;
    return (
      ((Number(entry.exitPrice || 0) - Number(entry.entryPrice || 0)) *
        Number(entry.shares || 0)) *
        direction >
      0
    );
  }).length;

  return {
    totalTrades: entries.length,
    openTrades: entries.filter((entry) => entry.status === "open").length,
    closedTrades: closed.length,
    wins,
    losses: closed.length - wins,
    winRate: closed.length ? Number(((wins / closed.length) * 100).toFixed(2)) : 0,
    totalPnL: Number(totalPnL.toFixed(2)),
  };
}
