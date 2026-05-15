import { getLiveMarketData } from "@/lib/trading/live-market-data";

type DiscoveryCandidate = {
  symbol: string;
  name: string;
  theme: string;
  sector: string;
};

const AI_STOCK_CANDIDATES: DiscoveryCandidate[] = [
  { symbol: "BBAI", name: "BigBear.ai Holdings", theme: "AI analytics / decision intelligence", sector: "ai" },
  { symbol: "SOUN", name: "SoundHound AI", theme: "Voice AI", sector: "ai" },
  { symbol: "REKR", name: "Rekor Systems", theme: "AI roadway intelligence", sector: "ai" },
  { symbol: "MVIS", name: "MicroVision", theme: "Lidar / AI perception for autonomy", sector: "ai" },
  { symbol: "INUV", name: "Inuvo", theme: "AI advertising / predictive consumer intelligence", sector: "ai" },
  { symbol: "MARK", name: "Remark Holdings", theme: "AI analytics / computer vision", sector: "ai" },
  { symbol: "IDAI", name: "T Stamp", theme: "AI identity verification", sector: "ai" },
  { symbol: "GFAI", name: "Guardforce AI", theme: "AI security / robotics", sector: "ai" },
  { symbol: "AITX", name: "Artificial Intelligence Technology Solutions", theme: "AI security robotics / OTC", sector: "ai" },
];

const MINERAL_STOCK_CANDIDATES: DiscoveryCandidate[] = [
  { symbol: "UUUU", name: "Energy Fuels", theme: "Uranium / rare earth processing", sector: "minerals" },
  { symbol: "URG", name: "Ur-Energy", theme: "Uranium mining", sector: "minerals" },
  { symbol: "LODE", name: "Comstock", theme: "Metals recycling / mining technology", sector: "minerals" },
  { symbol: "USAS", name: "Americas Gold and Silver", theme: "Silver / gold mining", sector: "minerals" },
  { symbol: "PLG", name: "Platinum Group Metals", theme: "Platinum group metals", sector: "minerals" },
  { symbol: "ASM", name: "Avino Silver & Gold Mines", theme: "Silver / gold mining", sector: "minerals" },
  { symbol: "TGB", name: "Taseko Mines", theme: "Copper mining", sector: "minerals" },
  { symbol: "REEMF", name: "Rare Element Resources", theme: "Rare earth minerals / OTC", sector: "minerals" },
];

const QUANTUM_STOCK_CANDIDATES: DiscoveryCandidate[] = [
  { symbol: "QUBT", name: "Quantum Computing Inc.", theme: "Quantum computing hardware/software", sector: "quantum" },
  { symbol: "QBTS", name: "D-Wave Quantum", theme: "Quantum annealing systems", sector: "quantum" },
  { symbol: "RGTI", name: "Rigetti Computing", theme: "Quantum processors / cloud quantum", sector: "quantum" },
  { symbol: "ARQQ", name: "Arqit Quantum", theme: "Quantum-safe cybersecurity", sector: "quantum" },
];

const SEMICONDUCTOR_STOCK_CANDIDATES: DiscoveryCandidate[] = [
  { symbol: "WOLF", name: "Wolfspeed", theme: "Silicon carbide semiconductors", sector: "semiconductor" },
  { symbol: "POET", name: "POET Technologies", theme: "Optical interposer / photonics chips", sector: "semiconductor" },
  { symbol: "ATOM", name: "Atomera", theme: "Semiconductor materials technology", sector: "semiconductor" },
  { symbol: "AEHR", name: "Aehr Test Systems", theme: "Semiconductor test systems", sector: "semiconductor" },
  { symbol: "KOPN", name: "Kopin", theme: "Microdisplays / semiconductor-adjacent components", sector: "semiconductor" },
  { symbol: "EMKR", name: "EMCORE", theme: "Optoelectronics / inertial sensors", sector: "semiconductor" },
];

function parseMaxPrice(query: string) {
  const match = query.match(/(?:under|below|less than)\s+\$?(\d+(?:\.\d+)?)/i);
  return match ? Number(match[1]) : null;
}

function inferSector(query: string) {
  const lower = query.toLowerCase();

  if (/mineral|mining|miner|gold|silver|uranium|lithium|copper|rare earth|metal|platinum/.test(lower)) {
    return "minerals";
  }

  if (/quantum|qantum|qubit|d-wave|rigetti/.test(lower)) {
    return "quantum";
  }

  if (/semiconductor|semi conductor|chip|chips|silicon|photonics|microchip/.test(lower)) {
    return "semiconductor";
  }

  if (/ai|artificial intelligence|machine learning|robotics|automation/.test(lower)) {
    return "ai";
  }

  return "general";
}

function universeForSector(sector: string) {
  if (sector === "minerals") return MINERAL_STOCK_CANDIDATES;
  if (sector === "quantum") return QUANTUM_STOCK_CANDIDATES;
  if (sector === "semiconductor") return SEMICONDUCTOR_STOCK_CANDIDATES;
  if (sector === "ai") return AI_STOCK_CANDIDATES;

  return [
    ...AI_STOCK_CANDIDATES,
    ...MINERAL_STOCK_CANDIDATES,
    ...QUANTUM_STOCK_CANDIDATES,
    ...SEMICONDUCTOR_STOCK_CANDIDATES,
  ];
}

function scoreCandidate(candidate: any, maxPrice: number | null) {
  let score = 50;

  if (candidate.price && maxPrice && candidate.price <= maxPrice) score += 30;
  if (candidate.price && maxPrice && candidate.price > maxPrice) score -= 40;
  if (candidate.candles >= 50) score += 10;
  if (candidate.providerErrors?.length) score -= 10;
  if (candidate.price && candidate.price < 1) score -= 5;

  return score;
}

export async function discoverTradingCandidates({
  query,
  maxPrice,
  limit = 12,
}: {
  query: string;
  maxPrice?: number | null;
  limit?: number;
}) {
  const cleanQuery = String(query || "").trim();
  const detectedMaxPrice = maxPrice ?? parseMaxPrice(cleanQuery);
  const sector = inferSector(cleanQuery);
  const baseUniverse = universeForSector(sector);

  const candidates = [];

  for (const item of baseUniverse.slice(0, limit)) {
    try {
      const live: any = await getLiveMarketData({
        symbol: item.symbol,
        marketType: "stock",
        timeframe: "1d",
      });

      const price = Number(live?.price || 0) || null;
      const candidate = {
        symbol: item.symbol,
        name: item.name,
        marketType: "stock",
        sector: item.sector,
        theme: item.theme,
        price,
        underMaxPrice: detectedMaxPrice ? Boolean(price && price <= detectedMaxPrice) : null,
        provider: live?.provider || null,
        providerChain: live?.providerChain || [],
        providerErrors: live?.providerErrors || [],
        candles: Array.isArray(live?.candles) ? live.candles.length : 0,
        whyMatched: `${item.theme}. Candidate selected from ${item.sector} discovery universe.`,
        risk: price && price < 5 ? "very_high" : "high",
      };

      candidates.push({
        ...candidate,
        score: scoreCandidate(candidate, detectedMaxPrice),
      });
    } catch (error: any) {
      candidates.push({
        symbol: item.symbol,
        name: item.name,
        marketType: "stock",
        sector: item.sector,
        theme: item.theme,
        price: null,
        underMaxPrice: detectedMaxPrice ? null : null,
        provider: null,
        providerChain: [],
        providerErrors: [error?.message || "Live verification failed."],
        candles: 0,
        whyMatched: `${item.theme}. Price verification failed with current providers.`,
        risk: "very_high",
        score: 10,
      });
    }
  }

  const filtered = detectedMaxPrice
    ? candidates.filter((candidate) => candidate.price && candidate.price <= detectedMaxPrice)
    : candidates;

  const ranked = filtered.sort((a, b) => b.score - a.score);

  const nearMisses = detectedMaxPrice
    ? candidates
        .filter((candidate) => candidate.price && candidate.price > detectedMaxPrice)
        .sort((a, b) => Number(a.price || 999999) - Number(b.price || 999999))
        .slice(0, 6)
    : [];

  return {
    ok: true,
    phase: "v10.7 Phase 127",
    service: "King Trading System Multi-Sector Discovery Search",
    query: cleanQuery,
    sector,
    maxPrice: detectedMaxPrice,
    ranked,
    nearMisses,
    searchedUniverse: baseUniverse.length,
    warning:
      `Low-priced ${sector} stocks can be highly speculative, illiquid, volatile, and risky. This is educational discovery, not financial advice.`,
    fallbackNote:
      ranked.length
        ? `Candidates were discovered outside the current watchlist from the ${sector} universe and price-checked using available market data providers.`
        : nearMisses.length
          ? `No verified ${sector} candidates were found under $${detectedMaxPrice}, but near-miss candidates above that price were found.`
          : `No ${sector} candidates matched the requested price filter with current free provider verification.`,
  };
}
