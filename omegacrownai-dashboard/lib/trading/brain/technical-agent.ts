export function runTechnicalAgent(input: any) {
  const momentum = Number(input.momentum || 50);
  const relativeStrength = Number(input.relativeStrength || momentum);
  const volumeSurge = Number(input.volumeSurge || 50);

  const score = Math.round(momentum * 0.4 + relativeStrength * 0.35 + volumeSurge * 0.25);

  return {
    agent: "Technical Agent",
    score,
    trend: score >= 80 ? "strong-bullish" : score >= 70 ? "bullish" : score >= 55 ? "neutral-positive" : "weak",
    reasoning: [
      `Momentum score: ${momentum}`,
      `Relative strength score: ${relativeStrength}`,
      `Volume surge score: ${volumeSurge}`,
    ],
  };
}
